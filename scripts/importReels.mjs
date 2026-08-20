/**
 * Instagram saved-post importer.
 *
 * Reads the official "Download your information" export and emits
 * src/data/reelSources.ts. Deterministic: same input, byte-identical output.
 *
 * This script does the MECHANICAL half of the import -- decode, dedupe,
 * classify, extract metadata. It deliberately does not try to turn captions
 * into Exercise objects; that needs judgement and lives in reelExercises.ts.
 *
 *   node scripts/importReels.mjs
 *
 * Two things that will bite whoever touches this next:
 *
 * 1. The export is double-encoded UTF-8. Meta writes UTF-8 bytes and then
 *    escapes them as if they were Latin-1, so a right single quote arrives as
 *    three mojibake characters. Everything must go through decode() first.
 *
 * 2. The movement lexicon MUST keep its word boundaries. Without them "row"
 *    matches grow/throw/narrow and the "names real movements" count inflates
 *    roughly tenfold, which quietly turns this whole import into fiction.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const EXPORT_DIR = resolve(ROOT, '..', '0 Exercise saved posts')
const OUT = join(ROOT, 'src', 'data', 'reelSources.ts')

// ---------------------------------------------------------------- decoding

/** Undo Meta's UTF-8-as-Latin-1 mangling. */
function decode(s) {
  if (typeof s !== 'string' || s === '') return ''
  try {
    return Buffer.from(s, 'latin1').toString('utf8')
  } catch {
    return s
  }
}

// ---------------------------------------------------------------- parsing

/** Flatten a label_values array into { label: value }. */
function labels(entry) {
  const out = {}
  for (const item of entry.label_values ?? []) {
    if (item.label !== undefined && item.value !== undefined) out[item.label] = item.value
  }
  return out
}

/** Pull a titled sub-structure ("Owner", "Hashtags") out of label_values. */
function section(entry, title) {
  for (const item of entry.label_values ?? []) {
    if (item.title === title && Array.isArray(item.dict)) return item.dict
  }
  return []
}

function owner(entry) {
  for (const row of section(entry, 'Owner')) {
    const o = {}
    for (const f of row.dict ?? []) {
      if (f.label && f.value !== undefined) o[f.label] = decode(f.value)
    }
    if (o.Username || o.Name) return { username: o.Username || undefined, name: o.Name || undefined }
  }
  return {}
}

function hashtags(entry) {
  const out = []
  for (const row of section(entry, 'Hashtags')) {
    for (const f of row.dict ?? []) {
      if (f.label === 'Name' && f.value) out.push(decode(f.value).toLowerCase())
    }
  }
  return out
}

const SHORTCODE = /instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/

// ---------------------------------------------------------------- lexicons

/*
 * Movement names. The regex anchors every entry so it cannot match inside a
 * longer word. Read note 2 in the file header before editing this list.
 */
const MOVEMENTS = [
  'squats?', 'kniebeuge', 'deadlifts?', 'kreuzheben', 'rdl', 'hip thrusts?', 'lunges?', 'ausfallschritt',
  'split squats?', 'bulgarian', 'step[- ]?up', 'glute bridges?', 'hip airplanes?', 'clamshells?',
  'bench presses?', 'bankdr[uü]cken', 'push[- ]?ups?', 'liegest[uü]tz', 'dips?', 'overhead presses?',
  'pike push(?:.?ups?)?', 'pull[- ]?ups?', 'klimmzug', 'chin[- ]?ups?', 'lat pulldowns?', 'latzug',
  // 'row' and 'clean' are ordinary English words; require gym context or they
  // match "500 rows" and "spotlessly clean".
  '(?:barbell|bb|dumbbell|db|cable|bent[- ]?over|inverted|seated|chest[- ]?supported|renegade|ballistic|high|upright|meadows|pendlay|tripod|doorway|banded|kb|kettlebell|single[- ]?arm|one[- ]?arm) rows?',
  'rows?(?=\\s*[-—:x×]?\\s*\\d)',
  'rudern', 'face pulls?', 'reverse fl(?:y|ies)', 'curls?', 'triceps', 'trizeps', 'pushdowns?',
  'lateral raises?', 'seitheben', 'shrugs?', 'planks?', 'planke', 'side plank', 'dead ?bugs?',
  'bird ?dogs?', 'hollow(?: body)?', 'ab wheels?', 'rollouts?', 'pallof(?: press)?', 'leg raises?', 'crunch(?:es)?',
  'sit[- ]?ups?', 'mountain climbers?', 'bear crawls?', 'copenhagens?', 'supermans?', 'kettlebell',
  'swings?', '(?:power |hang |kb |kettlebell |barbell |dead )cleans?', 'cleans?(?=\\s*(?:and|\\+|to)\\s*(?:press|thruster|jerk))', 'snatch(?:es)?', 'thrusters?', 'turkish get[- ]?up', 'halos?', 'goblet(?: squats?)?',
  'farmer(?:s)?(?: carr(?:y|ies))?', 'carr(?:y|ies)', 'cat[- ]?cows?', "child'?s pose", 'pigeons?', 'couch stretch(?:es)?', '90/90',
  'cossacks?', 'downward dogs?', "world'?s greatest", 'thoracic', 'brustwirbel', 'cars', 'pails',
  'rails', 'hamstring curls?', 'hip flexors?', 'h[uü]ftbeuger', 'calf raises?', 'wadenheben', 'nordics?',
  'jefferson curls?', 'frog (?:stretch(?:es)?|pose)', 'straddles?', 'pancakes?', 'happy bab(?:y|ies)', 'sphinx', 'wall slides?',
  'wall sits?', 'scapular\\w*', 'band pull[- ]?apart', 'dislocates?', 'jump squats?', 'burpees?',
  'jumping jacks?', 'high knees?', 'toe touch(?:es)?', 'forward folds?', 'dead hangs?', 'good mornings?',
  'landmines?', 'windshield wipers?', 'shin box(?:es)?', 'monster walks?', 'sprints?', 'thread the needles?',
]
const MOVEMENT_RE = new RegExp(`(?<!\\p{L})(?:${MOVEMENTS.join('|')})(?!\\p{L})`, 'giu')

/** Sets, reps, seconds, or a numbered / emoji-numbered step list. */
const PROTOCOL_RE =
  /(\d+\s*[x×]\s*\d+)|(\d+\s*(reps?|wdh|wiederholung\w*|sets?|s[äa]tze|satz|sekunden|seconds?|secs?|min\b))|[1-9]️?⃣|(^|\n)\s*\d[.)]\s/iu

const EDUCATIONAL_RE =
  /(stud(y|ie)|research|randomi[sz]ed|journal|meta.?analys|forschung|physiolog|anatom|principle|prinzip|why (this|it|your|stretching)|the reason|evidence)/i

/**
 * Is this post about training at all?
 *
 * Note the trailing `s?` and `\\w*` on almost everything. The first version of
 * this regex used bare `\\bexercise\\b`, which does not match "exercises" -- the
 * word boundary fails against the plural. That silently dropped genuine
 * workout posts whose captions happened to use plurals throughout.
 */
const FITNESS_RE =
  /\b(exercises?|workouts?|stretch\w*|mobility|glutes?|hamstrings?|quads?|squats?|deadlifts?|hinges?|cores?|abs|obliques?|planks?|shoulders?|hips?|spines?|postures?|knees?|ankles?|calves|calf|rehab|physio|reps?|sets?|rounds?|warm.?ups?|cool.?downs?|swim\w*|run(ning|s)?|sprints?|saunas?|cold plunges?|cardio|kettlebells?|dumbbells?|barbells?|muscles?|tendons?|fascia|yoga|pilates|calisthenics?|handstands?|planche|training|push.?ups?|pull.?ups?|chin.?ups?|dips?|burpees?|lunges?|presses?|rows?|curls?|crunch(es)?|sit.?ups?|biceps?|triceps?|delts?|lats?|pecs?|forearms?|grip|adductors?|rotator|scapula\w*|thoracic|lumbar|sciatic|foam roll\w*|recovery|flexib\w*|physique|hypertroph\w*|bodyweight|gym|lifting|treadmill|marathon|triathlon|hyrox|crossfit|[uü]bung\w*|beweglichkeit|dehn\w*|kraft|muskel\w*|haltung|r[uü]cken|schulter\w*|h[uü]fte|bauch|rumpf|trening|[cć]wicze\w*)\b/i

/**
 * Posts from somewhere else entirely.
 *
 * FITNESS_RE keeps anything containing one training word, which is generous on
 * purpose -- a short caption over a good video is still worth watching. The
 * cost is that a K-pop fashion post ("...runway..."), an explainer on how GPT-3
 * is pre-TRAINED, an Osaka restaurant guide and a surveillance-culture thread
 * all qualified on a single stray word.
 *
 * So: a veto rather than a stricter positive test. Tightening FITNESS_RE would
 * silently drop genuine training posts with short captions, which is the exact
 * failure this importer has already had once (see the plurals note above).
 * Anything Toni curated into a collection by hand is never vetoed -- a human
 * already decided.
 */
const OFF_TOPIC_RE =
  /\b(bts|kpop|k-pop|vogue|runway|red carpet|celebrit\w+|box office|trailer|horror film|movie|cinema|screenplay|actor|actress|chatgpt|gpt-[0-9]|llm|transformer architecture|machine learning|startup|series [abc] funding|valuation|venture|crypto|nft|blockchain|restaurant|michelin|city guide|travel guide|itinerary|surveillance|privacy polic\w+|dating app|astrolog\w+|zodiac|manifest\w+ money)\b/i

/**
 * The same idea for scripts with no word boundaries. `\b` is defined between a
 * \w and a non-\w, and CJK characters are not \w -- so `\b맛집\b` silently never
 * matches, which is how an Osaka restaurant guide got through the first pass.
 */
const OFF_TOPIC_CJK_RE = /(맛집|여행|레스토랑|グルメ|旅行|美食)/

const TOPICS = {
  'hip-lower-back': /\b(hip|h[uü]fte|lower back|r[uü]cken|psoas|piriformis|glute|pelvi|becken)/i,
  core: /\b(core|abs|abdomin|tva|transverse|oblique|bauch|rumpf|plank)/i,
  'shoulder-neck': /\b(shoulder|schulter|neck|nacken|rotator|scapula|posture|haltung|thoracic|brustwirbel)/i,
  legs: /\b(quad|hamstring|knee|knie|calf|wade|ankle|sprunggelenk|leg day|beine)/i,
  mobility: /\b(mobility|beweglichkeit|stretch|dehn|flexib|yoga|cars\b|pails|rails)/i,
  strength: /\b(kettlebell|barbell|dumbbell|hypertroph|strength|kraft|muscle|muskel|press|deadlift|squat)/i,
  running: /\b(run|running|sprint|marathon|laufen|5k|10k)/i,
  swimming: /\b(swim\w*|schwimm\w*|freestyle|breaststroke|backstroke|pool)/i,
  recovery: /\b(sauna|cold plunge|ice bath|recovery|regeneration|sleep|schlaf|lymph|massage)/i,
  nutrition: /\b(protein|calorie|kalorien|diet|ern[aä]hrung|meal|recipe|rezept)/i,
}

/**
 * How much of someone else's caption to ship.
 *
 * These captions are other people's writing. Keeping them whole was fine while
 * this ran only on one laptop; publishing the app puts 194,000 characters of
 * third-party text on the open web, which is republishing rather than
 * referencing. An excerpt plus a link back to the original does the job the
 * watch queue actually needs -- "what is this reel about, is it worth watching"
 * -- and it is the single biggest thing in the bundle.
 *
 * Cut at a word boundary, never mid-word, and only when it actually saves
 * something worth saving.
 */
const CAPTION_CHARS = 400

function excerptCaption(caption) {
  if (caption.length <= CAPTION_CHARS + 80) return caption
  const cut = caption.slice(0, CAPTION_CHARS)
  const lastBreak = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('\n'))
  return `${cut.slice(0, lastBreak > 0 ? lastBreak : CAPTION_CHARS).trimEnd()}…`
}

function detectLanguage(c) {
  const count = (re) => (c.match(re) ?? []).length
  const de = count(/\b(und|nicht|dein|dich|die|der|das|f[uü]r|mit|auf|ist|[uü]bung|wiederholung|beweglichkeit|dann|kannst)\b/gi)
  const pl = count(/\b(nie|jest|si[eę]|kt[oó]ry|dla|jak|twoje|trening|oraz)\b/gi)
  const en = count(/\b(the|and|your|you|this|with|for|is|of|that|to)\b/gi)
  const max = Math.max(de, pl, en)
  if (max === 0) return 'other'
  if (pl === max && pl > en) return 'pl'
  if (de === max && de > en) return 'de'
  return en > 0 ? 'en' : 'other'
}

/** "4 exercises", "3 Uebungen", "5 stretches" -- how many movements are claimed. */
function claimedCount(c) {
  const m = c.match(/\b(\d{1,2})\s*(exercises?|moves?|movements?|stretch(?:es)?|drills?|[uü]bungen?|steps?)\b/i)
  if (!m) return undefined
  const n = Number(m[1])
  return n >= 2 && n <= 20 ? n : undefined
}

/**
 * How worth-watching is a reel whose caption did not name its movements?
 *
 * Watching 229 reels is not a plan. Watching the best 60 is. Score is
 * deliberately crude and explainable rather than clever:
 *
 *   + it is in the collection Toni curated by hand
 *   + it says how many movements it contains
 *   + it reads like instruction (numbered list, reps, seconds)
 *   + it is about something Toni actually trains
 *   - it is engagement bait ("comment PLAN", "link in bio")
 *   - it is nutrition, or has almost no caption at all
 */
const BAIT_RE =
  /(comment\s+[""«“'\u201c]?[A-Z]{3,}|kommentier|skomentuj|link in bio|dm me\b|schreib mir|follow @|obserwuj|join (my|to my)|apply on my website|1:1 coaching|my (fitness )?app in (my )?bio)/i

const PRIORITY_TOPICS = new Set(['mobility', 'hip-lower-back', 'shoulder-neck', 'core', 'running', 'swimming', 'recovery'])

function priority(caption, topics, collection, claimed) {
  let score = 0
  if (collection) score += 30
  if (claimed) score += 25
  if (PROTOCOL_RE.test(caption)) score += 20
  if (/(^|\n)\s*\d[.)]\s|[1-9]️?⃣|•|▪️/.test(caption)) score += 10
  score += topics.filter((t) => PRIORITY_TOPICS.has(t)).length * 6
  if (caption.length > 300) score += 8
  else if (caption.length < 80) score -= 15
  if (BAIT_RE.test(caption)) score -= 25
  if (topics.includes('nutrition') && topics.length === 1) score -= 30
  return score
}

function movementsNamed(caption) {
  const found = new Set()
  for (const m of caption.matchAll(MOVEMENT_RE)) found.add(m[0].toLowerCase())
  return [...found].sort()
}

function classify(caption, named) {
  const c = caption.trim()
  if (c.length < 40) return 'topic-only'
  if (named.length > 0) return 'named'
  if (PROTOCOL_RE.test(c)) return 'protocol-only'
  if (EDUCATIONAL_RE.test(c)) return 'educational'
  return 'topic-only'
}

// ---------------------------------------------------------------- assemble

const readJson = (name) => JSON.parse(readFileSync(join(EXPORT_DIR, name), 'utf8'))

const savedPosts = readJson('saved_posts.json')
const savedCollections = readJson('saved_collections.json')

/** Collection membership, keyed by shortcode. */
const collectionOf = new Map()
for (const coll of Array.isArray(savedCollections) ? savedCollections : [savedCollections]) {
  const name = decode(labels(coll).Name ?? '')
  for (const item of coll.label_values ?? []) {
    if (!Array.isArray(item.dict)) continue
    for (const row of item.dict) {
      for (const f of row.dict ?? []) {
        if (f.label === 'URL' && f.value) {
          const sc = f.value.match(SHORTCODE)?.[1]
          if (sc) collectionOf.set(sc, name)
        }
      }
    }
  }
}

const seen = new Set()
const sources = []
let skippedNonFitness = 0
let skippedOffTopic = 0

for (const post of savedPosts) {
  const l = labels(post)
  const url = l.URL ?? ''
  const shortcode = url.match(SHORTCODE)?.[1]
  if (!shortcode || seen.has(shortcode)) continue

  const caption = decode(l.Caption ?? '')
  const collection = collectionOf.get(shortcode)

  // In scope: anything Toni curated into the collection, plus anything
  // elsewhere that reads as training. A saved post about a fashion show is
  // not made relevant by containing the word "run".
  if (!collection && !FITNESS_RE.test(caption)) {
    skippedNonFitness++
    continue
  }
  // A human curating it into a collection outranks any regex.
  if (!collection && (OFF_TOPIC_RE.test(caption) || OFF_TOPIC_CJK_RE.test(caption))) {
    skippedOffTopic++
    continue
  }
  seen.add(shortcode)

  const o = owner(post)
  const named = movementsNamed(caption)
  const topicsFound = Object.entries(TOPICS).filter(([, re]) => re.test(caption)).map(([t]) => t)

  sources.push({
    id: `reel-${shortcode}`,
    url: `https://www.instagram.com/reel/${shortcode}/`,
    shortcode,
    creator: o.username,
    creatorName: o.name,
    savedAt: new Date((post.timestamp ?? 0) * 1000).toISOString(),
    collection,
    caption: excerptCaption(caption),
    language: detectLanguage(caption),
    extraction: classify(caption, named),
    topics: topicsFound,
    movementsNamed: named,
    claimedCount: claimedCount(caption),
    hashtags: hashtags(post),
    priority: priority(caption, topicsFound, collection, claimedCount(caption)),
  })
}

// Most worth watching first, newest save as the tie-break. The watch queue is
// only useful if the good reels are at the top.
sources.sort((a, b) =>
  b.priority - a.priority ||
  (a.savedAt < b.savedAt ? 1 : a.savedAt > b.savedAt ? -1 : a.shortcode.localeCompare(b.shortcode)),
)

// ---------------------------------------------------------------- emit

const q = (s) => JSON.stringify(s)
const counts = sources.reduce((acc, s) => ((acc[s.extraction] = (acc[s.extraction] ?? 0) + 1), acc), {})

const lines = []
lines.push('/**')
lines.push(' * Instagram saved posts, imported from the official data export.')
lines.push(' *')
lines.push(' * GENERATED by scripts/importReels.mjs -- do not edit by hand.')
lines.push(' * Re-run the script after a fresh export; the output is deterministic.')
lines.push(' *')
lines.push(` * ${sources.length} posts in scope (${skippedNonFitness} non-training posts skipped).`)
lines.push(' * By what the caption alone supports:')
for (const k of ['named', 'protocol-only', 'educational', 'topic-only']) {
  lines.push(` *   ${k.padEnd(14)} ${counts[k] ?? 0}`)
}
lines.push(' *')
lines.push(' * The caption is the ONLY content that exists outside the video. Posts')
lines.push(' * marked anything other than "named" do not say which movements they')
lines.push(' * show, and nothing here invents them -- that is what the watch queue is')
lines.push(' * for.')
lines.push(' */')
lines.push('')
lines.push("import type { ReelSource } from '../types'")
lines.push('')
lines.push('export const REEL_SOURCES: ReelSource[] = [')
for (const s of sources) {
  lines.push('  {')
  lines.push(`    id: ${q(s.id)},`)
  lines.push(`    url: ${q(s.url)},`)
  lines.push(`    shortcode: ${q(s.shortcode)},`)
  if (s.creator) lines.push(`    creator: ${q(s.creator)},`)
  if (s.creatorName) lines.push(`    creatorName: ${q(s.creatorName)},`)
  lines.push(`    savedAt: ${q(s.savedAt)},`)
  if (s.collection) lines.push(`    collection: ${q(s.collection)},`)
  lines.push(`    caption: ${q(s.caption)},`)
  lines.push(`    language: ${q(s.language)},`)
  lines.push(`    extraction: ${q(s.extraction)},`)
  lines.push(`    topics: ${q(s.topics)},`)
  if (s.movementsNamed.length) lines.push(`    movementsNamed: ${q(s.movementsNamed)},`)
  if (s.claimedCount) lines.push(`    claimedCount: ${s.claimedCount},`)
  lines.push(`    priority: ${s.priority},`)
  if (s.hashtags.length) lines.push(`    hashtags: ${q(s.hashtags.slice(0, 12))},`)
  lines.push('  },')
}
lines.push(']')
lines.push('')

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, lines.join('\n'), 'utf8')

console.log(`wrote ${OUT}`)
console.log(`  ${sources.length} sources  (${skippedNonFitness} non-training skipped)`)
console.log(`  in collection: ${sources.filter((s) => s.collection).length}`)
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k.padEnd(14)} ${v}`)
}
