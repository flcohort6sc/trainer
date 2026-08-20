/**
 * Review ledger for the reel contact sheets.
 *
 * 183 sheets is more than one sitting. This tracks which have been looked at,
 * what was found, and what is left, so the work is resumable and the counts
 * are real rather than remembered.
 *
 *   node scripts/reviewLedger.mjs                  # progress + next up
 *   node scripts/reviewLedger.mjs --next 12        # next N with captions
 *   node scripts/reviewLedger.mjs --mark CODE:verdict:note
 *
 * Verdicts: new | dup | partial | dud
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FRAMES = resolve(ROOT, '..', '0 Reel frames')
const LEDGER = join(FRAMES, 'review-ledger.json')
const manifest = JSON.parse(readFileSync(join(FRAMES, 'manifest.json'), 'utf8'))
const sheets = readdirSync(join(FRAMES, 'sheets')).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4))

const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {}
const argv = process.argv.slice(2)
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1] }

for (const mark of argv.filter((a) => a.includes(':') && !a.startsWith('--'))) {
  const [code, verdict, ...rest] = mark.split(':')
  ledger[code] = { verdict, note: rest.join(':'), at: new Date().toISOString() }
}
if (argv.some((a) => a.includes(':') && !a.startsWith('--'))) {
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2))
}

const reviewed = sheets.filter((s) => ledger[s])
const pending = sheets.filter((s) => !ledger[s])
  .sort((a, b) => (manifest[b]?.priority ?? 0) - (manifest[a]?.priority ?? 0))

const tally = reviewed.reduce((a, s) => ((a[ledger[s].verdict] = (a[ledger[s].verdict] ?? 0) + 1), a), {})
console.log(`reviewed ${reviewed.length} / ${sheets.length}   pending ${pending.length}`)
console.log('verdicts:', JSON.stringify(tally))

const n = Number(opt('next', 0))
if (n > 0) {
  console.log('')
  for (const code of pending.slice(0, n)) {
    const m = manifest[code] ?? {}
    const cap = (m.caption ?? '').replace(/\s+/g, ' ').slice(0, 150)
    console.log(`--- ${code}  p${m.priority ?? '?'}  @${m.creator ?? '?'}  [${(m.topics ?? []).join(',')}]`)
    console.log(`    ${cap}`)
  }
}
