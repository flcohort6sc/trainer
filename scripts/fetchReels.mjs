/**
 * Reel frame grabber.
 *
 * For the ~229 saved reels whose captions name a topic but never the movements.
 * Downloads each one, extracts six evenly spaced frames into a single contact
 * sheet, and immediately deletes the video. Claude then reads the sheets and
 * writes proper exercise entries from what is actually shown.
 *
 *   node scripts/fetchReels.mjs --limit 40 --min-priority 40 --browser chrome
 *
 * YOU have to run this, not Claude. It needs your logged-in Instagram session
 * (`yt-dlp --cookies-from-browser`), and Claude's sandbox blocks reading the
 * browser cookie store — deliberately, and that guard is worth keeping.
 *
 * Notes worth reading once:
 *
 * - Downloading from Instagram is against their Terms of Service. That is your
 *   call and you have made it; this script does not pretend otherwise.
 * - Videos are deleted the moment their frames are extracted. Nothing from a
 *   creator's footage enters the repo or the app. Only descriptions written
 *   from what was seen, with attribution and a link back.
 * - Output goes to a sibling folder, never inside the project.
 * - Resumable: sheets that already exist are skipped, so re-running after a
 *   rate-limit is free.
 * - Polite by default: a few seconds between requests. Do not remove that.
 */

import { execFile, execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const OUT_DIR = resolve(ROOT, '..', '0 Reel frames')
const SHEETS = join(OUT_DIR, 'sheets')
const TMP = join(OUT_DIR, '.tmp')

// ---------------------------------------------------------------- options

const argv = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}
const LIMIT = Number(opt('limit', 40))
const MIN_PRIORITY = Number(opt('min-priority', 40))
const BROWSER = opt('browser', 'chrome')
const DELAY_MS = Number(opt('delay', 4000))
const FRAMES = Number(opt('frames', 9))
const DRY_RUN = argv.includes('--dry-run')
const CHECK = argv.includes('--check')
/** Re-fetch specific shortcodes even if a sheet exists: --force ABC,DEF */
const FORCE = (opt('force', '') || '').split(',').map((x) => x.trim()).filter(Boolean)

// ---------------------------------------------------------------- tools

function findTool(candidates, label) {
  for (const c of candidates) {
    try {
      execFileSync(c, ['--version'], { stdio: 'ignore' })
      return c
    } catch {
      /* keep looking */
    }
  }
  throw new Error(`Could not find ${label}. Tried: ${candidates.join(', ')}`)
}

const YTDLP = findTool(
  [resolve(ROOT, '..', '.venv', 'bin', 'yt-dlp'), 'yt-dlp'],
  'yt-dlp (pip install yt-dlp)',
)

let FFMPEG
try {
  FFMPEG = (await import('ffmpeg-static')).default
} catch {
  FFMPEG = 'ffmpeg'
}

// ---------------------------------------------------------------- queue

/** Parse the generated source list without needing a TS toolchain. */
function loadSources() {
  const src = readFileSync(join(ROOT, 'src', 'data', 'reelSources.ts'), 'utf8')
  const body = src.slice(src.indexOf('export const REEL_SOURCES'))
  const out = []
  for (const block of body.split('\n  {\n').slice(1)) {
    const field = (name) => {
      const m = block.match(new RegExp(`^    ${name}: (.*),$`, 'm'))
      if (!m) return undefined
      try {
        return JSON.parse(m[1])
      } catch {
        return undefined
      }
    }
    const shortcode = field('shortcode')
    if (!shortcode) continue
    out.push({
      id: field('id'),
      shortcode,
      url: field('url'),
      creator: field('creator'),
      caption: field('caption') ?? '',
      topics: field('topics') ?? [],
      claimedCount: field('claimedCount'),
      extraction: field('extraction'),
      priority: field('priority') ?? 0,
    })
  }
  return out
}

const sources = loadSources()
mkdirSync(SHEETS, { recursive: true })
mkdirSync(TMP, { recursive: true })

const done = new Set(readdirSync(SHEETS).filter((f) => f.endsWith('.jpg')).map((f) => f.replace('.jpg', '')))

/** Posts proven dead. Skipped unless --retry-dead, so they stop heading the queue. */
const deadPath = join(OUT_DIR, 'dead.json')
const dead = existsSync(deadPath) ? JSON.parse(readFileSync(deadPath, 'utf8')) : {}
const RETRY_DEAD = argv.includes('--retry-dead')
const deadSet = new Set(RETRY_DEAD ? [] : Object.keys(dead))

const queue = sources
  .filter((s) => s.extraction !== 'named')
  .filter((s) => s.priority >= MIN_PRIORITY)
  .filter((s) => FORCE.length ? FORCE.includes(s.shortcode) : !done.has(s.shortcode) && !deadSet.has(s.shortcode))
  .sort((a, b) => b.priority - a.priority)
  .slice(0, LIMIT)

console.log(`${sources.length} sources · ${done.size} sheets already made`)
console.log(`queue: ${queue.length} reels (priority >= ${MIN_PRIORITY}, limit ${LIMIT})`)
console.log(`output: ${SHEETS}\n`)

if (queue.length === 0) {
  console.log('Nothing to do. Lower --min-priority or raise --limit for more.')
  process.exit(0)
}

if (DRY_RUN) {
  console.log('DRY RUN — nothing downloaded.\n')
  for (const [i, r] of queue.entries()) {
    console.log(
      `${String(i + 1).padStart(3)}. p${String(r.priority).padStart(3)}  @${(r.creator ?? '?').slice(0, 20).padEnd(20)}` +
      `  ${(r.topics.join(',') || '—').slice(0, 34).padEnd(34)}  ${r.caption.replace(/\s+/g, ' ').slice(0, 58)}`,
    )
  }
  console.log(`\nWould fetch ${queue.length} reels with ${YTDLP.split('/').pop()} + ffmpeg.`)
  process.exit(0)
}

// ---------------------------------------------------------------- preflight

/**
 * Check cookie access ONCE before the loop.
 *
 * The first version of this script did not, so a browser-permission problem
 * produced 48 identical failures over four minutes instead of one message.
 */
const COOKIE_ERROR = /Operation not permitted|could not (find|copy|decrypt)|unable to (open|read).*cookie|no such file.*cookie|cookies.*database|Permission denied/i
const AUTH_ERROR = /login required|rate-limit reached|429|Please wait a few minutes/i
/**
 * Errors that are about the POST, not about you.
 *
 * These cost a batch once: the three reels that failed in earlier runs floated
 * to the top of the queue, the preflight probed exactly those three, and a
 * dead-post error was reported as a broken session. A post that is deleted,
 * private, or simply not a video will never succeed no matter who is logged in.
 */
const CONTENT_ERROR =
  /no video formats found|empty media response|post is not available|unavailable|has been removed|private account|not a video/i

const SUPPORTED_BROWSERS = ['firefox', 'chrome', 'safari', 'edge', 'brave', 'chromium', 'opera', 'vivaldi']

function cookieRemedy(browser, raw) {
  const lines = []
  const bareName = browser.split(/[:+]/)[0].toLowerCase()
  if (!SUPPORTED_BROWSERS.includes(bareName) || /unsupported browser/i.test(raw)) {
    lines.push(`"${bareName}" is not a browser yt-dlp knows about.`)
    lines.push(`Use one of: ${SUPPORTED_BROWSERS.join(', ')}`)
    return lines.join('\n')
  }
  if (/Operation not permitted/i.test(raw) && bareName === 'safari') {
    lines.push('macOS protects Safari\'s cookie container. Terminal cannot read it without Full Disk Access.')
    lines.push('')
    lines.push('Easiest fix — use a different browser you are logged into Instagram on:')
    lines.push('    npm run fetch:reels -- --limit 48 --min-priority 40 --browser firefox')
    lines.push('    npm run fetch:reels -- --limit 48 --min-priority 40 --browser chrome')
    lines.push('')
    lines.push('Firefox needs no permission at all. Chrome will show one Keychain prompt.')
    lines.push('')
    lines.push('Or grant Full Disk Access to Terminal and re-run with --browser safari:')
    lines.push('    System Settings > Privacy & Security > Full Disk Access > + > Terminal')
    lines.push('    Then QUIT and reopen Terminal — the grant only applies on relaunch.')
    lines.push('    Note this grants Terminal access to all protected files, not just cookies.')
  } else if (/keyring|safe storage|decrypt|Failed to decrypt/i.test(raw) && bareName === 'chrome') {
    lines.push('Chrome encrypts its cookies with a key held in the macOS Keychain.')
    lines.push('When the prompt appears, choose ALWAYS ALLOW — plain "Allow" re-prompts on every reel.')
    lines.push('Quit Chrome first (Cmd-Q); it locks the cookie database while running.')
  } else if (/database is locked|locked database/i.test(raw)) {
    lines.push(`${bareName} has its cookie database open.`)
    lines.push('Quit the browser completely (Cmd-Q, not just closing the window) and re-run.')
  } else if (COOKIE_ERROR.test(raw)) {
    lines.push(`Could not read cookies from ${browser}.`)
    lines.push('Try another browser you are logged into Instagram on: --browser firefox | chrome | safari')
    lines.push('Chrome may show a Keychain prompt the first time; allow it.')
  } else {
    lines.push(`Instagram refused the request even with ${browser} cookies.`)
    lines.push('Check you are actually logged into Instagram in that browser, then try again.')
    lines.push('If it says rate-limit, wait an hour — finished sheets are skipped on re-run.')
  }
  return lines.join('\n')
}

/**
 * Try a few reels, not one.
 *
 * Instagram returns ONE error string for three unrelated problems: the post is
 * gone or private, you are rate-limited, or you are not logged in. Testing a
 * single reel cannot tell them apart -- if that reel happens to be deleted it
 * looks exactly like a broken session. Three reels can: all-fail means the
 * session, one-succeeds means the reel.
 */
async function probe(url) {
  try {
    const { stderr } = await run(YTDLP, [
      '-v', '--no-warnings', '--skip-download', '--simulate',
      '--cookies-from-browser', BROWSER,
      url,
    ], { maxBuffer: 1024 * 1024 * 16 })
    return { ok: true, raw: String(stderr ?? '') }
  } catch (err) {
    return { ok: false, raw: [err.stderr, err.stdout, err.message].filter(Boolean).join('\n') }
  }
}

/** yt-dlp's own verbose log says which profile it used and how many cookies it
 *  found. Names and counts only -- no cookie values are read or printed. */
function cookieStats(raw) {
  const extracted = raw.match(/Extracted (\d+) cookies from (\w+)/i)
  const from = raw.match(/Extracting cookies from:?\s*(.+)$/im)
  return {
    count: extracted ? Number(extracted[1]) : undefined,
    profile: from ? from[1] : undefined,
  }
}

// Probe reels that have not already proven themselves dead, or the preflight
// just re-tests the graveyard.
const probeCandidates = queue.filter((r) => !deadSet.has(r.shortcode)).slice(0, 4)
const probeUrls = (probeCandidates.length ? probeCandidates : queue.slice(0, 3)).map((r) => r.url)
process.stdout.write(`checking ${BROWSER} cookies against ${probeUrls.length} reels… `)

const results = []
for (const url of probeUrls) results.push(await probe(url))
const anyOk = results.some((r) => r.ok)
const stats = cookieStats(results.map((r) => r.raw).join('\n'))

if (CHECK || !anyOk) {
  console.log(anyOk ? 'ok\n' : 'failed\n')
  console.log(`  cookies extracted : ${stats.count ?? 'unknown'}`)
  console.log(`  profile used      : ${stats.profile ?? 'unknown'}`)
  results.forEach((r, i) => {
    const reason = r.ok ? 'ok' : (r.raw.split('\n').find((l) => l.includes('ERROR')) ?? 'failed').slice(0, 96)
    console.log(`  reel ${i + 1} (${probeCandidates[i]?.shortcode ?? '?'}) : ${reason}`)
  })
  console.log('')

  const allContent = !anyOk && results.every((r) => CONTENT_ERROR.test(r.raw))

  if (allContent) {
    console.log(`Those ${results.length} posts are gone, private, or not videos — nothing to do with your session.`)
    console.log(`${stats.count ?? 'some'} cookies read fine. Continuing with the rest of the queue.`)
    console.log('')
  } else if (stats.count === 0) {
    console.error('yt-dlp read ZERO cookies. It is looking at the wrong browser profile.')
    console.error('Firefox keeps several; point at the one you actually browse with:')
    console.error('    npm run fetch:reels -- --browser "firefox:fbi9s3t4.default-release"')
  } else if (!anyOk && stats.count > 0) {
    console.error(`Cookies were read (${stats.count}) but Instagram rejected all ${probeUrls.length} reels.`)
    console.error('That points at the session rather than the reels:')
    console.error('  - Open instagram.com in that browser. If you see a login page, log in.')
    console.error('  - A private-window session does not persist to the cookie file.')
    console.error('  - If you just logged in, quit the browser (Cmd-Q) so cookies are flushed to disk.')
    console.error('  - If it says rate-limit, wait an hour and re-run.')
  } else if (anyOk) {
    console.log('Session works. Re-run without --check to fetch.')
  }
  if (CHECK) process.exit(anyOk || allContent ? 0 : 1)
  if (!anyOk && !allContent) process.exit(1)
}
console.log('ok\n')

// ---------------------------------------------------------------- work

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const manifestPath = join(OUT_DIR, 'manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

let ok = 0
let failed = 0
let consecutiveAuthFailures = 0
const failures = []

for (const [i, reel] of queue.entries()) {
  const label = `[${i + 1}/${queue.length}] ${reel.shortcode} @${reel.creator ?? '?'}`
  const video = join(TMP, `${reel.shortcode}.mp4`)
  const sheet = join(SHEETS, `${reel.shortcode}.jpg`)

  try {
    await run(YTDLP, [
      '--no-warnings',
      '--no-playlist',
      '--cookies-from-browser', BROWSER,
      '-f', 'mp4/best',
      '-o', video,
      reel.url,
    ], { maxBuffer: 1024 * 1024 * 32 })

    if (!existsSync(video)) throw new Error('download produced no file')

    // Duration drives the frame spacing, so short and long reels both give
    // six frames spread across the whole clip.
    let duration = 10
    try {
      const probe = await run(FFMPEG, ['-i', video], { maxBuffer: 1024 * 1024 * 8 }).catch((e) => e)
      const m = String(probe.stderr ?? '').match(/Duration: (\d+):(\d+):(\d+\.\d+)/)
      if (m) duration = Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
    } catch {
      /* fall back to the default */
    }
    const fps = Math.max(FRAMES / Math.max(duration, 1), 0.05)

    await run(FFMPEG, [
      '-y', '-loglevel', 'error',
      '-i', video,
      '-vf', `fps=${fps.toFixed(4)},scale=340:-1,tile=3x${Math.ceil(FRAMES / 3)}`,
      '-frames:v', '1', '-q:v', '4',
      sheet,
    ])

    manifest[reel.shortcode] = {
      id: reel.id,
      url: reel.url,
      creator: reel.creator,
      topics: reel.topics,
      claimedCount: reel.claimedCount,
      priority: reel.priority,
      caption: reel.caption.slice(0, 600),
      sheet: `sheets/${reel.shortcode}.jpg`,
    }
    ok++
    consecutiveAuthFailures = 0
    console.log(`${label} ✓`)
  } catch (err) {
    failed++
    const raw = String(err.stderr ?? err.message ?? err)
    const msg = raw.split('\n').find((l) => l.includes('ERROR')) ?? 'failed'
    failures.push({ shortcode: reel.shortcode, reason: msg.slice(0, 160) })
    console.log(`${label} ✗ ${msg.slice(0, 110)}`)

    // A dead session or a rate-limit will not fix itself over the next 40
    // reels. Stop and say so rather than burning through the queue.
    if (CONTENT_ERROR.test(raw)) {
      // Dead post. Record it and move on -- never let it head the queue again.
      dead[reel.shortcode] = { reason: msg.slice(0, 120), at: new Date().toISOString() }
      writeFileSync(deadPath, JSON.stringify(dead, null, 2))
      consecutiveAuthFailures = 0
    } else if (COOKIE_ERROR.test(raw) || AUTH_ERROR.test(raw)) {
      consecutiveAuthFailures++
      if (consecutiveAuthFailures >= 3) {
        console.error(`\nStopping after ${consecutiveAuthFailures} auth failures in a row.\n`)
        console.error(cookieRemedy(BROWSER, raw))
        break
      }
    }
  } finally {
    // The video's job is done the moment the frames exist.
    rmSync(video, { force: true })
  }

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  if (i < queue.length - 1) await sleep(DELAY_MS + Math.random() * 2000)
}

rmSync(TMP, { recursive: true, force: true })

console.log(`\n${ok} sheets made, ${failed} failed`)
if (failures.length) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  ${f.shortcode}  ${f.reason}`)
  console.log('\nRate limiting? Wait an hour and re-run — finished sheets are skipped.')
}
console.log(`\nSheets: ${SHEETS}`)
console.log('Tell Claude they are ready and it will read them and write the exercises.')
