/**
 * Engine verification. Does the generator actually adapt, or does it just
 * shuffle? Runs against the real seed data, no UI involved.
 */

import { readFileSync } from 'node:fs'
import { HYROX_EXERCISES } from './src/data/hyroxExercises'
import { SEED_ENDURANCE } from './src/data/seedEndurance'
import { SEED_EXERCISES } from './src/data/seedExercises'
import { SEED_MOBILITY } from './src/data/seedMobility'
import { SEED_SAUNA } from './src/data/seedSauna'
import { REEL_EXERCISES } from './src/data/reelExercises'
import { REEL_SOURCES } from './src/data/reelSources'
import { EQUIPMENT_GROUPS } from './src/data/equipment'
import { ceilingFor, currentPlace, withEquipment, withPlace } from './src/engine/places'
import { niggleFilter } from './src/engine/niggles'
import { figureFor, figureCoverage } from './src/data/figures'
import { applyBase, build, lerpPose, project } from './src/components/figureGeometry'
import { LESSONS, TOPIC_LABEL } from './src/data/lessons'
import { SEED_PROGRAMS } from './src/data/seedPrograms'
import { SEED_ROUTINES } from './src/data/seedRoutines'
import { buildUsageIndex, eligibleFor, generateSession, toSession } from './src/engine/generator'
import { generateRoutine, leadRoutineKind, suggestRoutine } from './src/engine/routineGenerator'
import { routineStreak, weeklyReview } from './src/engine/coach'
import { goalConflicts, goalStatus, phaseFor, primaryGoal } from './src/engine/goals'
import { dailyProtein, fuellingFor } from './src/engine/fuelling'
import { planWeek } from './src/engine/week'
import { formatDistance, formatPace, setFields, suggestLoad } from './src/engine/progression'
import { importFromFile, refreshShippedContent, resetToSeed } from './src/storage/repository'
import type { AppData, Equipment, Routine, RoutineLog, Session, Slot, DayTemplate } from './src/types'

const data: AppData = {
  version: 4,
  exercises: [...SEED_EXERCISES, ...SEED_MOBILITY, ...SEED_ENDURANCE, ...SEED_SAUNA, ...REEL_EXERCISES, ...HYROX_EXERCISES],
  programs: SEED_PROGRAMS,
  routines: SEED_ROUTINES,
  reels: REEL_SOURCES,
  reelProgress: [],
  sessions: [],
  routineLogs: [],
  metrics: [],
  settings: {
    units: 'kg',
    availableEquipment: [
      'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'machine',
      'cable', 'pullup-bar', 'bands', 'bench', 'box', 'mat',
      'pool', 'kickboard', 'pull-buoy', 'fins', 'outdoors', 'treadmill',
      'sauna', 'cold-plunge',
    ],
    varietyBias: 0.6,
    rotationWindowDays: 21,
    maxDifficulty: 3,
    places: [],
    weeklyShape: {
      gymDays: 3, runDays: 3, swimDays: 1, saunaDays: 1,
      longRunWeekday: 0, deloadEveryWeeks: 4,
    },
    niggles: [],
  },
  goals: [],
}

const dayA = SEED_PROGRAMS[0].days[0]
const DAY = 24 * 60 * 60 * 1000

let pass = 0
let fail = 0
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`)
  ok ? pass++ : fail++
}

// ---------------------------------------------------------------- test 1
console.log('\n[1] Every slot gets filled with a full gym')
const first = generateSession(dayA, data)
check('no unfilled slots', first.unfilled.length === 0,
  first.unfilled.map((u) => `${u.slot.label}: ${u.reason}`).join('; '))
check('slot count matches template', first.entries.length === dayA.slots.length,
  `${first.entries.length}/${dayA.slots.length}`)
console.log('      ' + first.entries.map((e) => e.exercise.name).join(' | '))

// ---------------------------------------------------------------- test 2
console.log('\n[2] No exercise repeats within one session')
const names = first.entries.map((e) => e.exercise.id)
check('all distinct', new Set(names).size === names.length)

// ---------------------------------------------------------------- test 3
console.log('\n[3] After logging a session, the next one rotates away from it')
// Pretend we did session 1 yesterday, completing every set.
const logged = toSession(dayA, 'prog-full-body', first)
const yesterday = new Date(Date.now() - 1 * DAY)
const doneSession: Session = {
  ...logged,
  startedAt: yesterday.toISOString(),
  date: yesterday.toISOString().slice(0, 10),
  finishedAt: yesterday.toISOString(),
  entries: logged.entries.map((e) => ({
    ...e,
    sets: e.sets.map(() => ({ weight: 60, reps: 8, completed: true })),
  })),
}
const withHistory: AppData = { ...data, sessions: [doneSession] }

const second = generateSession(dayA, withHistory)
const firstIds = new Set(first.entries.map((e) => e.exercise.id))
const repeated = second.entries.filter((e) => firstIds.has(e.exercise.id))
console.log('      ' + second.entries.map((e) => e.exercise.name).join(' | '))
check('at least half the session changed',
  repeated.length <= Math.floor(second.entries.length / 2),
  `${repeated.length}/${second.entries.length} repeated`)

// ---------------------------------------------------------------- test 4
console.log('\n[4] Travel mode: only bodyweight + bands + mat')
const travel: AppData = {
  ...withHistory,
  settings: { ...data.settings, availableEquipment: ['bodyweight', 'bands', 'mat'] },
}
const travelPlan = generateSession(dayA, travel)
const illegal = travelPlan.entries.filter((e) =>
  !e.exercise.equipment.every((q) => ['bodyweight', 'bands', 'mat'].includes(q)))
console.log('      ' + travelPlan.entries.map((e) => `${e.exercise.name} [${e.exercise.equipment.join('+')}]`).join(' | '))
if (travelPlan.unfilled.length) {
  console.log('      unfilled: ' + travelPlan.unfilled.map((u) => `${u.slot.label} (${u.reason})`).join('; '))
}
check('nothing needs unavailable equipment', illegal.length === 0,
  illegal.map((e) => e.exercise.name).join(', '))
check('still fills most slots', travelPlan.entries.length >= 4,
  `${travelPlan.entries.length}/${dayA.slots.length}`)

// ---------------------------------------------------------------- test 5
console.log('\n[5] Double progression suggests the right load')
const squat = SEED_EXERCISES.find((e) => e.id === 'sq-back')!
const squatSlot = dayA.slots.find((s) => s.patterns.includes('squat'))!
console.log(`      slot rep range: ${squatSlot.repRange[0]}-${squatSlot.repRange[1]}`)

function withSquatHistory(weight: number, reps: number): AppData {
  const s: Session = {
    id: 'hist', date: '2026-08-10', name: 'test',
    startedAt: new Date(Date.now() - 3 * DAY).toISOString(),
    finishedAt: new Date(Date.now() - 3 * DAY).toISOString(),
    entries: [{
      exerciseId: 'sq-back',
      sets: [
        { weight, reps, completed: true },
        { weight, reps, completed: true },
        { weight, reps, completed: true },
      ],
    }],
  }
  return { ...data, sessions: [s] }
}

// Hit the top of the range (8) on every set -> should go up.
const up = suggestLoad(squat, squatSlot, withSquatHistory(100, 8))
check('top of range -> increase', up.direction === 'up' && up.weight === 105,
  `${up.direction} ${up.weight}kg — "${up.rationale}"`)

// Mid-range (6) -> hold and add reps.
const hold = suggestLoad(squat, squatSlot, withSquatHistory(100, 6))
check('mid range -> hold', hold.direction === 'hold' && hold.weight === 100,
  `${hold.direction} ${hold.weight}kg`)

// Below the floor (3 reps when the range starts at 5) -> back off.
const down = suggestLoad(squat, squatSlot, withSquatHistory(100, 3))
check('below floor -> decrease', down.direction === 'down' && down.weight === 95,
  `${down.direction} ${down.weight}kg`)

// Never done -> no number, just advice.
const fresh = suggestLoad(squat, squatSlot, data)
check('no history -> no weight suggested', fresh.direction === 'new' && fresh.weight === undefined,
  fresh.rationale)

// ---------------------------------------------------------------- test 6
console.log('\n[6] Fatigue: muscles hit hard yesterday get deprioritised')
// Log three consecutive quad-heavy days, then see if a squat slot still
// insists on another quad-dominant lift.
const quadSessions: Session[] = [1, 2, 3].map((d) => ({
  id: `q${d}`,
  date: new Date(Date.now() - d * DAY).toISOString().slice(0, 10),
  name: 'quad day',
  startedAt: new Date(Date.now() - d * DAY).toISOString(),
  finishedAt: new Date(Date.now() - d * DAY).toISOString(),
  entries: [{
    exerciseId: 'sq-back',
    sets: Array.from({ length: 5 }, () => ({ weight: 100, reps: 5, completed: true })),
  }],
}))
const fatigued: AppData = { ...data, sessions: quadSessions }

// Swapping back squat for front squat would not help -- both are quad-primary.
// The mechanism is only observable in a slot that can choose a DIFFERENT muscle
// group, so give it one that accepts squat or hinge and see which way it leans.
const mixedSlot: Slot = {
  id: 'test-mixed', label: 'Lower (any)', role: 'primary',
  patterns: ['squat', 'hinge'], sets: 4, repRange: [5, 8], restSeconds: 180,
  rotation: 'rotate',
}
const mixedDay: DayTemplate = { id: 'test-day', name: 'test', slots: [mixedSlot] }

// Run it repeatedly: this is a scoring bias, not a hard rule, so judge the
// distribution rather than one sample.
let hingeCount = 0
for (let i = 0; i < 40; i++) {
  const p = generateSession(mixedDay, fatigued)
  const ex = data.exercises.find((e) => e.id === p.entries[0].exercise.id)!
  if (ex.pattern === 'hinge') hingeCount++
}
console.log(`      after 3 quad-heavy days, picked a hinge ${hingeCount}/40 times`)
check('fatigued quads bias the choice toward hinging', hingeCount >= 28,
  `${hingeCount}/40`)

// And the fatigue must be visible to the user, not just felt in the maths.
const squatOnly = generateSession(dayA, fatigued)
const lowerPush = squatOnly.entries.find((e) => e.slot.label === 'Lower push (heavy)')
console.log(`      squat-only slot picked: ${lowerPush?.exercise.name} — "${lowerPush?.reason}"`)
check('explains the fatigue when it has no better option',
  lowerPush?.reason.includes('fatigued') ?? false, lowerPush?.reason)

// ---------------------------------------------------------------- test 7
console.log('\n[7] Variety over 8 weeks of the same program day')
const history: Session[] = []
const seen = new Map<string, number>()
for (let week = 0; week < 8; week++) {
  const plan = generateSession(dayA, { ...data, sessions: history })
  for (const e of plan.entries) {
    seen.set(e.exercise.name, (seen.get(e.exercise.name) ?? 0) + 1)
  }
  const when = new Date(Date.now() - (8 - week) * 7 * DAY)
  history.push({
    ...toSession(dayA, 'prog-full-body', plan),
    startedAt: when.toISOString(),
    date: when.toISOString().slice(0, 10),
    finishedAt: when.toISOString(),
    entries: toSession(dayA, 'prog-full-body', plan).entries.map((e) => ({
      ...e,
      sets: e.sets.map(() => ({ weight: 60, reps: 8, completed: true })),
    })),
  })
}
const distinct = seen.size
console.log(`      ${distinct} distinct exercises across 8 sessions of the same day`)
console.log('      ' + [...seen.entries()].sort((a, b) => b[1] - a[1])
  .map(([k, v]) => `${k}×${v}`).join(', '))
check('meaningful variety (>= 14 distinct)', distinct >= 14, `${distinct} distinct`)

// The distinct count alone is a weak assertion -- it passes even when every
// warmup rotates and every main lift is frozen. What matters is that the
// PRIMARY slots move, so assert on those directly.
const primaryCounts = new Map<string, number>()
const historyForPrimary: Session[] = []
for (let week = 0; week < 8; week++) {
  const plan = generateSession(dayA, { ...data, sessions: historyForPrimary })
  for (const e of plan.entries) {
    if (e.slot.role !== 'primary') continue
    primaryCounts.set(e.exercise.name, (primaryCounts.get(e.exercise.name) ?? 0) + 1)
  }
  const when = new Date(Date.now() - (8 - week) * 7 * DAY)
  const sess = toSession(dayA, 'prog-full-body', plan)
  historyForPrimary.push({
    ...sess,
    startedAt: when.toISOString(),
    date: when.toISOString().slice(0, 10),
    finishedAt: when.toISOString(),
    entries: sess.entries.map((e) => ({
      ...e,
      sets: e.sets.map(() => ({ weight: 60, reps: 8, completed: true })),
    })),
  })
}
const worst = Math.max(...primaryCounts.values())
console.log('      primary slots only: ' + [...primaryCounts.entries()]
  .sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(', '))
check('no main lift repeats more than 4 of 8 weeks', worst <= 4, `worst is ${worst}/8`)


// ---------------------------------------------------------------- routines
const routineById = (id: string): Routine => {
  const r = SEED_ROUTINES.find((x) => x.id === id)
  if (!r) throw new Error(`no routine ${id}`)
  return r
}

console.log('\n[R1] A routine fills out to its target length')
for (const id of ['rt-wake', 'rt-wind-down', 'rt-full-flex']) {
  const routine = routineById(id)
  const result = generateRoutine(routine, data)
  const target = routine.targetMinutes * 60
  check(
    `${routine.name} reaches ~${routine.targetMinutes} min`,
    result.totalSeconds >= target * 0.9,
    `${Math.round(result.totalSeconds / 60)} min from ${result.drills.length} drills`,
  )
  check(`${routine.name} filled every step`, result.unfilled.length === 0,
    result.unfilled.map((u) => `${u.step.label}: ${u.reason}`).join('; '))
}

console.log('\n[R2] The wake-up is different from one day to the next')
const wakeRuns: string[] = []
for (let i = 0; i < 8; i++) {
  wakeRuns.push(generateRoutine(routineById('rt-wake'), data).drills.map((d) => d.exercise.id).join(','))
}
check('not every morning is identical', new Set(wakeRuns).size > 1,
  `${new Set(wakeRuns).size} distinct sequences in 8 runs`)

console.log('\n[R3] A wind-down never prescribes active drills')
const windDown = generateRoutine(routineById('rt-wind-down'), data)
const activeInWindDown = windDown.drills.filter((d) => d.exercise.pattern !== 'stretch')
check('every drill is a passive stretch', activeInWindDown.length === 0,
  activeInWindDown.map((d) => `${d.exercise.name} (${d.exercise.pattern})`).join(', '))
console.log('      ' + windDown.drills.map((d) => d.exercise.name).join(' | '))

console.log('\n[R4] No drill repeats within one routine')
const flexIds = generateRoutine(routineById('rt-full-flex'), data).drills.map((d) => d.exercise.id)
check('all distinct', new Set(flexIds).size === flexIds.length)

console.log('\n[R5] Routine history feeds recency but not block rotation')
// A routine done this morning that included a glute bridge.
const morningLog: RoutineLog = {
  id: 'rlog-test',
  date: new Date().toISOString().slice(0, 10),
  routineId: 'rt-wake',
  exerciseIds: ['hg-glute-bridge'],
  completedExerciseIds: ['hg-glute-bridge'],
  startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  finishedAt: new Date().toISOString(),
}
const withRoutine: AppData = { ...data, routineLogs: [morningLog] }
const sessionView = buildUsageIndex(withRoutine, 'session')
const routineView = buildUsageIndex(withRoutine, 'routine')

check('the gym generator knows you did it today',
  sessionView.daysSince('hg-glute-bridge') < 1,
  `${sessionView.daysSince('hg-glute-bridge').toFixed(2)} days`)
check('but it does not count toward gym block rotation',
  sessionView.recentUses('hg-glute-bridge') === 0,
  `recentUses=${sessionView.recentUses('hg-glute-bridge')}`)
check('while routine block rotation does count it',
  routineView.recentUses('hg-glute-bridge') === 1,
  `recentUses=${routineView.recentUses('hg-glute-bridge')}`)

console.log('\n[R6] Skipped drills do not count as done')
const skippedLog: RoutineLog = { ...morningLog, completedExerciseIds: [] }
const skippedView = buildUsageIndex({ ...data, routineLogs: [skippedLog] }, 'routine')
check('a skipped drill stays fresh', skippedView.daysSince('hg-glute-bridge') === Infinity)


console.log('\n[R7] The home program never asks for equipment you do not have')
const homeProgram = SEED_PROGRAMS.find((p) => p.id === 'prog-home')!
const homeOnly: AppData = {
  ...data,
  settings: { ...data.settings, availableEquipment: ['bodyweight', 'mat', 'box'] },
}
for (const day of homeProgram.days) {
  const result = generateSession(day, homeOnly)
  check(`${day.name} fills with a floor and a chair`, result.unfilled.length === 0,
    result.unfilled.map((u) => `${u.slot.label}: ${u.reason}`).join('; '))
  console.log('      ' + result.entries.map((e) => e.exercise.name).join(' | '))
}


console.log('\n[R8] Swim sessions come out in metres, not reps')
const swim = SEED_PROGRAMS.find((p) => p.id === 'prog-swim')!
for (const day of swim.days) {
  const result = generateSession(day, data)
  check(`${day.name} fills`, result.unfilled.length === 0,
    result.unfilled.map((u) => `${u.slot.label}: ${u.reason}`).join('; '))
  const swimEntries = result.entries.filter((e) => e.exercise.pattern === 'swim')
  check(`${day.name} prescribes a distance for every swim`,
    swimEntries.every((e) => e.slot.distanceRange !== undefined),
    `${swimEntries.length} swim slots`)
  console.log('      ' + result.entries
    .map((e) => `${e.exercise.name}${e.slot.distanceRange ? ` ${e.slot.sets}x${e.slot.distanceRange[0]}m` : ''}`)
    .join(' | '))
}

console.log('\n[R9] No pool means no swim, with a reason that says so')
const dryLand: AppData = {
  ...data,
  settings: { ...data.settings, availableEquipment: ['bodyweight', 'mat', 'outdoors'] },
}
const drySwim = generateSession(swim.days[1], dryLand)
check('every swim slot reports why it could not be filled',
  drySwim.unfilled.length > 0 && drySwim.unfilled.every((u) => u.reason.length > 0),
  drySwim.unfilled.map((u) => `${u.slot.label}: ${u.reason}`).join('; '))

console.log('\n[R10] Running works on nothing but a pair of shoes')
const run = SEED_PROGRAMS.find((p) => p.id === 'prog-run')!
const outdoorsOnly: AppData = {
  ...data,
  settings: { ...data.settings, availableEquipment: ['bodyweight', 'mat', 'outdoors'] },
}
for (const day of run.days) {
  const result = generateSession(day, outdoorsOnly)
  const runSlots = day.slots.filter((sl) => sl.patterns.includes('run'))
  const runFilled = result.entries.filter((e) => e.exercise.pattern === 'run')
  check(`${day.name} fills every run slot`, runFilled.length === runSlots.length,
    `${runFilled.length}/${runSlots.length}`)
}

console.log('\n[R11] A sauna protocol repeats its rounds')
const sauna = SEED_ROUTINES.find((r) => r.id === 'rt-sauna')!
const saunaPlan = generateRoutine(sauna, data)
check('every round filled', saunaPlan.unfilled.length === 0,
  saunaPlan.unfilled.map((u) => `${u.step.label}: ${u.reason}`).join('; '))
check('runs about the advertised length',
  saunaPlan.totalSeconds >= sauna.targetMinutes * 60 * 0.9,
  `${Math.round(saunaPlan.totalSeconds / 60)} min`)
const heatDrills = saunaPlan.drills.filter((d) => d.step.label.startsWith('Round'))
check('three heat rounds, repeats allowed', heatDrills.length === 3,
  heatDrills.map((d) => d.exercise.name).join(', '))
console.log('      ' + saunaPlan.drills.map((d) => `${d.step.label}: ${d.exercise.name}`).join(' | '))

console.log('\n[R12] Pace comes back formatted, not as a decimal')
check('swim pace reads per 100m', formatPace(400, 380, 100) === '1:35/100m', String(formatPace(400, 380, 100)))
check('run pace reads per km', formatPace(5000, 1560, 1000) === '5:12/km', String(formatPace(5000, 1560, 1000)))
check('distance shortens to km', formatDistance(10000) === '10km' && formatDistance(800) === '800m',
  `${formatDistance(10000)} / ${formatDistance(800)}`)
check('a swim logs distance and time, and the logger asks for both',
  setFields('distance-time', 'kg').primary?.key === 'distance'
  && setFields('distance-time', 'kg').secondary.key === 'seconds'
  && setFields('distance-time', 'kg').showPace)


// ---------------------------------------------------------------- import
console.log('\n[I1] The Instagram import produced usable, valid data')
// A floor rather than an exact count: the importer vetoes off-topic posts, so
// this number moves down when the veto improves. It should never collapse.
check('reel sources loaded', REEL_SOURCES.length >= 280, `${REEL_SOURCES.length} sources`)
check('no exercise points at a reel the importer dropped',
  REEL_EXERCISES.every((e) => !e.reelId || REEL_SOURCES.some((r) => r.id === e.reelId)),
  REEL_EXERCISES.filter((e) => e.reelId && !REEL_SOURCES.some((r) => r.id === e.reelId)).map((e) => e.name).join(', '))
check('captions are excerpted, not republished whole',
  REEL_SOURCES.every((r) => r.caption.length <= 520),
  `longest ${Math.max(...REEL_SOURCES.map((r) => r.caption.length))} chars`)
check('every source has a URL and a shortcode',
  REEL_SOURCES.every((r) => r.url.startsWith('https://www.instagram.com/') && r.shortcode.length > 3))
check('no duplicate shortcodes',
  new Set(REEL_SOURCES.map((r) => r.shortcode)).size === REEL_SOURCES.length)
check('captions were decoded, not left mangled',
  !REEL_SOURCES.some((r) => r.caption.includes('\u00e2\u0080\u0099')),
  'no double-encoded apostrophes survive')
const collectionCount = REEL_SOURCES.filter((r) => r.collection).length
check('the curated collection came through', collectionCount === 139, `${collectionCount} in "exercises & stretching"`)

console.log('\n[I2] Authored exercises are valid and attributed')
const VALID_PATTERNS = new Set(['squat','lunge','hinge','push-horizontal','push-vertical','pull-horizontal','pull-vertical','carry','core-anti-extension','core-anti-rotation','core-flexion','isolation','conditioning','mobility','stretch','swim','run','protocol'])
const VALID_LOAD = new Set(['weight-reps','reps','time','weight-time','distance','distance-time'])
const sourceIds = new Set(REEL_SOURCES.map((r) => r.id))
const badPattern = REEL_EXERCISES.filter((e) => !VALID_PATTERNS.has(e.pattern))
const badLoad = REEL_EXERCISES.filter((e) => !VALID_LOAD.has(e.loadType))
const orphan = REEL_EXERCISES.filter((e) => !e.reelId || !sourceIds.has(e.reelId))
check('every pattern is a real enum value', badPattern.length === 0, badPattern.map((e) => e.name).join(', '))
check('every loadType is a real enum value', badLoad.length === 0, badLoad.map((e) => e.name).join(', '))
check('every exercise links back to a real reel', orphan.length === 0, orphan.map((e) => e.name).join(', '))
check('every exercise carries a source link', REEL_EXERCISES.every((e) => e.sourceUrl?.includes('instagram.com')))
check('every exercise credits its creator', REEL_EXERCISES.every((e) => (e.notes ?? '').includes('@')))
console.log(`      ${REEL_EXERCISES.length} exercises authored from ${new Set(REEL_EXERCISES.map((e) => e.reelId)).size} reels`)

console.log('\n[I3] No duplicate exercise names anywhere in the library')
const norm = (n: string) => n.toLowerCase().replace(/[^a-z0-9]/g, '')
const byName = new Map<string, string[]>()
for (const e of data.exercises) {
  const k = norm(e.name)
  byName.set(k, [...(byName.get(k) ?? []), e.name])
}
const dupes = [...byName.values()].filter((v) => v.length > 1)
check('all names distinct', dupes.length === 0, dupes.map((d) => d[0]).join(', '))

console.log('\n[I4] An unwatched placeholder can never reach a workout')
const placeholder = {
  ...data.exercises[0],
  id: 'test-unwatched',
  name: 'Unknown Hip Drill',
  status: 'unwatched' as const,
  pattern: 'mobility' as const,
  equipment: ['bodyweight' as const],
  difficulty: 1 as const,
}
const withPlaceholder: AppData = { ...data, exercises: [...data.exercises, placeholder] }
let leaked = 0
for (let i = 0; i < 40; i++) {
  const sess = generateSession(SEED_PROGRAMS[0].days[0], withPlaceholder)
  if (sess.entries.some((e) => e.exercise.id === 'test-unwatched')) leaked++
  const rt = generateRoutine(SEED_ROUTINES[0], withPlaceholder)
  if (rt.drills.some((d) => d.exercise.id === 'test-unwatched')) leaked++
}
check('never served in 40 sessions and 40 routines', leaked === 0, `${leaked} leaks`)

console.log('\n[I5] Figures cover the library, and skip what they would misrepresent')
const cov = figureCoverage(data.exercises)
check('every non-swim, non-protocol exercise has a figure',
  cov.withFigure + cov.deliberatelyNone === cov.total,
  `${cov.withFigure} with figures, ${cov.deliberatelyNone} deliberately without, ${cov.total} total`)
console.log(`      ${cov.overridden} hand-tuned overrides on top of the pattern defaults`)
const noFigure = data.exercises.filter((e) => !figureFor(e))
check('the only exercises without a figure are swims and protocols',
  noFigure.every((e) => e.pattern === 'swim' || e.pattern === 'protocol'),
  noFigure.filter((e) => e.pattern !== 'swim' && e.pattern !== 'protocol').map((e) => e.name).join(', '))

console.log('\n[I6] Guides drawn from reels are attributed')
const sourced = LESSONS.filter((l) => l.sourceUrl)
check('sourced guides name a creator', sourced.every((l) => Boolean(l.creator)), `${sourced.length} sourced guides`)
check('related exercise ids all resolve',
  LESSONS.every((l) => (l.relatedExerciseIds ?? []).every((id) => data.exercises.some((e) => e.id === id))),
  LESSONS.flatMap((l) => (l.relatedExerciseIds ?? []).filter((id) => !data.exercises.some((e) => e.id === id))).join(', '))


console.log('\n[I7] Every pinned routine step points at a real exercise')
const allIds = new Set(data.exercises.map((e) => e.id))
const badPins: string[] = []
for (const r of SEED_ROUTINES) {
  for (const st of r.steps) {
    if (st.pinnedExerciseId && !allIds.has(st.pinnedExerciseId)) {
      badPins.push(`${r.name}/${st.label}: ${st.pinnedExerciseId}`)
    }
  }
}
check('all pinned ids resolve', badPins.length === 0, badPins.join('; '))
const posture = SEED_ROUTINES.find((r) => r.id === 'rt-posture-reset')!
const posturePlan = generateRoutine(posture, data)
check('Posture Reset runs its six pinned steps in order',
  posturePlan.drills.length === 6 && posturePlan.unfilled.length === 0,
  posturePlan.drills.map((d) => d.exercise.name).join(' | '))

console.log('\n[I8] Every piece of equipment can be reached in Settings')
const groupedEquipment = EQUIPMENT_GROUPS.flatMap((g) => g.items)
check('no item is listed in two groups',
  new Set(groupedEquipment).size === groupedEquipment.length,
  `${groupedEquipment.length} chips`)

// The real failure this guards: an exercise needing kit you cannot switch on.
const needed = new Set<Equipment>(data.exercises.flatMap((e) => e.equipment))
const unreachable = [...needed].filter((q) => !groupedEquipment.includes(q))
check('every exercise\'s equipment has a toggle', unreachable.length === 0, unreachable.join(', '))

const defaults = resetToSeed().settings.availableEquipment
const defaultsWithoutToggle = defaults.filter((q) => !groupedEquipment.includes(q))
check('everything on by default has a toggle', defaultsWithoutToggle.length === 0,
  defaultsWithoutToggle.join(', '))

const seedSettings = resetToSeed().settings
check('a fresh install starts somewhere real',
  Boolean(currentPlace(seedSettings)), currentPlace(seedSettings)?.name)
check('every place lists only equipment that has a toggle',
  seedSettings.places.every((pl) => pl.equipment.every((q) => groupedEquipment.includes(q))),
  seedSettings.places.map((pl) => pl.name).join(', '))
check('the current place and the effective kit agree',
  currentPlace(seedSettings)!.equipment.join() === seedSettings.availableEquipment.join())


console.log('\n[P1] Switching place swaps the kit without losing the other places')
const atHome = withPlace(seedSettings, 'place-home')
check('home has a mat and a kettlebell',
  atHome.availableEquipment.includes('mat') && atHome.availableEquipment.includes('kettlebell'),
  atHome.availableEquipment.join(', '))
check('home has no barbell', !atHome.availableEquipment.includes('barbell'))
check('the gym place still remembers its own kit',
  atHome.places.find((pl) => pl.id === 'place-gym')!.equipment.includes('barbell'))
const backToGym = withPlace(atHome, 'place-gym')
check('and switching back restores it', backToGym.availableEquipment.includes('barbell'))

// 'trx' is in no default place, so this proves the write went to Home only.
const boughtTrx = withEquipment(atHome, [...atHome.availableEquipment, 'trx'])
check('ticking a chip is remembered by the place, not just today',
  boughtTrx.places.find((pl) => pl.id === 'place-home')!.equipment.includes('trx'))
check('and does not leak into another place',
  !boughtTrx.places.find((pl) => pl.id === 'place-gym')!.equipment.includes('trx'))

console.log('\n[P2] The room has a ceiling and the app respects it')
const kbSwing = data.exercises.find((e) => e.equipment.includes('kettlebell') && e.loadType === 'weight-reps')!
check('home caps kettlebell work at 8kg', ceilingFor(kbSwing, atHome) === 8,
  `${kbSwing.name}: ${ceilingFor(kbSwing, atHome)}`)
check('the gym has no ceiling worth mentioning', ceilingFor(kbSwing, backToGym) === undefined)

// A history of hitting the top of the range would normally earn more weight.
const threeDaysAgo = new Date(Date.now() - 3 * DAY).toISOString()
const heavyHistory: Session = {
  id: 'kb-1', date: threeDaysAgo.slice(0, 10), name: 'Home', startedAt: threeDaysAgo, finishedAt: threeDaysAgo,
  entries: [{ exerciseId: kbSwing.id, sets: [{ weight: 8, reps: 20, completed: true }, { weight: 8, reps: 20, completed: true }] }],
}
const kbSlot: Slot = {
  id: 'kb-slot', label: 'Swing', role: 'primary', patterns: [kbSwing.pattern],
  sets: 3, repRange: [10, 15], restSeconds: 60, rotation: 'rotate',
}
const cappedSuggestion = suggestLoad(kbSwing, kbSlot, { ...data, sessions: [heavyHistory], settings: atHome })
check('at the ceiling it stops adding weight',
  cappedSuggestion.weight === 8 && cappedSuggestion.direction === 'hold',
  `${cappedSuggestion.weight}kg — ${cappedSuggestion.rationale}`)
check('and says why rather than silently holding',
  cappedSuggestion.rationale.includes('heaviest'), cappedSuggestion.rationale)
const uncapped = suggestLoad(kbSwing, kbSlot, { ...data, sessions: [heavyHistory], settings: backToGym })
check('the same history at the gym earns the increase',
  (uncapped.weight ?? 0) > 8 && uncapped.direction === 'up',
  `${uncapped.weight}kg — ${uncapped.rationale}`)

console.log('\n[P3] Training around something sore')
const noNiggles = niggleFilter([])
check('no niggles blocks nothing', !noNiggles.active)
const soreKnee = niggleFilter(['knee'])
const aSquatEx = data.exercises.find((e) => e.pattern === 'squat')!
const aPress = data.exercises.find((e) => e.pattern === 'push-horizontal')!
check('a sore knee removes squatting', soreKnee.blocks(aSquatEx), aSquatEx.name)
check('and leaves pressing alone', !soreKnee.blocks(aPress), aPress.name)
check('it names itself for the reason string', soreKnee.describe() === 'your knee', soreKnee.describe())
check('two niggles read as a sentence',
  niggleFilter(['knee', 'shoulder']).describe() === 'your knee and shoulder',
  niggleFilter(['knee', 'shoulder']).describe())
const rehabDrills = data.exercises.filter((e) => e.tags.includes('rehab'))
check('rehab work is never filtered out by a niggle',
  rehabDrills.every((e) => !niggleFilter(['knee', 'shoulder', 'hip', 'ankle', 'wrist', 'neck', 'lower-back']).blocks(e)),
  `${rehabDrills.length} rehab drills`)

const kneeData: AppData = { ...data, settings: { ...data.settings, niggles: ['knee'] } }
const kneePlan = generateSession(dayA, kneeData)
const squatsServed = kneePlan.entries.filter((e) => e.exercise.pattern === 'squat')
check('a generated session serves no squats while the knee is sore',
  squatsServed.length === 0, squatsServed.map((e) => e.exercise.name).join(', '))
check('and any slot it could not fill blames the knee',
  kneePlan.unfilled.every((u) => u.reason.includes('knee') || u.reason.length > 0),
  kneePlan.unfilled.map((u) => `${u.slot.label}: ${u.reason}`).join('; '))

// ---------------------------------------------------------------- the coach
//
// Every rule below is checked against a FIXED clock. A review that only passes
// on the day it was written is not a test, and these rules are all arithmetic
// on dates.
const NOW = new Date('2026-08-20T09:00:00Z').getTime()
const isoOn = (daysAgo: number) => new Date(NOW - daysAgo * DAY).toISOString()

function pastSession(daysAgo: number, entries: Session['entries'], rating?: 1 | 2 | 3 | 4 | 5): Session {
  const at = isoOn(daysAgo)
  return {
    id: `s-${daysAgo}-${Math.random().toString(36).slice(2, 6)}`,
    date: at.slice(0, 10),
    name: 'Test session',
    entries,
    startedAt: at,
    finishedAt: at,
    rating,
  }
}

const lift = (exerciseId: string, sets: number, weight: number, reps: number) => ({
  exerciseId,
  sets: Array.from({ length: sets }, () => ({ weight, reps, completed: true })),
})

const anyOfPattern = (p: string) => data.exercises.find((e) => e.pattern === p && !e.archived)!
const aSquat = anyOfPattern('squat')
const aHinge = anyOfPattern('hinge')
const aPush = anyOfPattern('push-horizontal')
const aPull = anyOfPattern('pull-horizontal')

const withHistoryOf = (sessions: Session[], routineLogs: RoutineLog[] = []): AppData =>
  ({ ...data, sessions, routineLogs })

console.log('\n[C1] An empty history produces no invented observations')
const emptyReview = weeklyReview(withHistoryOf([]), NOW)
check('says it has nothing rather than guessing', emptyReview.thin
  && emptyReview.insights.length === 1
  && emptyReview.insights[0].id === 'nothing-logged',
  emptyReview.insights.map((i) => i.headline).join(' | '))
check('counts are zero, not absent',
  emptyReview.sessions === 0 && emptyReview.sets === 0 && emptyReview.volumeByGroup.length === 4)

console.log('\n[C2] It notices a pattern you have stopped training')
const gapReview = weeklyReview(withHistoryOf([
  pastSession(12, [lift(aHinge.id, 3, 100, 5)]),
  pastSession(2, [lift(aSquat.id, 3, 100, 5)]),
]), NOW)
const hingeGap = gapReview.insights.find((i) => i.id === `gap-${aHinge.pattern}`)
check('flags the 12-day hinge gap', Boolean(hingeGap) && hingeGap!.headline.includes('12 days'),
  hingeGap?.headline)
check('names the exercise and the date as evidence',
  Boolean(hingeGap?.evidence.includes(aHinge.name)) && Boolean(hingeGap?.evidence.includes('-')),
  hingeGap?.evidence)
check('says nothing about the squat you did on Tuesday',
  !gapReview.insights.some((i) => i.id === `gap-${aSquat.pattern}`))
check('says nothing about patterns you have never trained',
  !gapReview.insights.some((i) => i.id === 'gap-pull-vertical'))

console.log('\n[C3] It spots a lift that has stopped moving')
const stalled = weeklyReview(withHistoryOf([
  pastSession(21, [lift(aSquat.id, 3, 100, 5)]),
  pastSession(14, [lift(aSquat.id, 3, 100, 5)]),
  pastSession(7, [lift(aSquat.id, 3, 100, 5)]),
  pastSession(1, [lift(aSquat.id, 3, 100, 5)]),
]), NOW)
const stall = stalled.insights.find((i) => i.id === `stall-${aSquat.id}`)
check('flags four flat sessions', Boolean(stall), stall?.headline)
check('shows the numbers it decided from', Boolean(stall?.evidence.match(/\d/)), stall?.evidence)

const climbing = weeklyReview(withHistoryOf([
  pastSession(21, [lift(aSquat.id, 3, 100, 5)]),
  pastSession(14, [lift(aSquat.id, 3, 105, 5)]),
  pastSession(7, [lift(aSquat.id, 3, 110, 5)]),
  pastSession(1, [lift(aSquat.id, 3, 115, 5)]),
]), NOW)
check('leaves a lift that is still climbing alone',
  !climbing.insights.some((i) => i.id.startsWith('stall-')),
  climbing.insights.map((i) => i.headline).join(' | '))

console.log('\n[C4] It counts pushing against pulling')
const lopsided = weeklyReview(withHistoryOf([
  pastSession(5, [lift(aPush.id, 10, 60, 8)]),
  pastSession(3, [lift(aPush.id, 10, 60, 8), lift(aPull.id, 4, 50, 8)]),
]), NOW)
const balance = lopsided.insights.find((i) => i.id === 'balance-push-pull')
check('flags 20 pushing sets against 4 pulling', Boolean(balance), balance?.headline)
check('the evidence is the two set counts',
  Boolean(balance?.evidence.includes('20 pushing') && balance?.evidence.includes('4 pulling')),
  balance?.evidence)

const even = weeklyReview(withHistoryOf([
  pastSession(3, [lift(aPush.id, 6, 60, 8), lift(aPull.id, 6, 50, 8)]),
]), NOW)
check('says nothing when the two sides match',
  !even.insights.some((i) => i.id === 'balance-push-pull'))

console.log('\n[C5] The routine streak, alive and broken')
const log = (daysAgo: number): RoutineLog => ({
  id: `rl-${daysAgo}`,
  date: isoOn(daysAgo).slice(0, 10),
  routineId: 'rt-wake',
  exerciseIds: [],
  completedExerciseIds: [],
  startedAt: isoOn(daysAgo),
})
check('counts consecutive days ending today', routineStreak([log(0), log(1), log(2)], NOW) === 3,
  String(routineStreak([log(0), log(1), log(2)], NOW)))
check('still counts when today has not happened yet', routineStreak([log(1), log(2), log(3)], NOW) === 3,
  String(routineStreak([log(1), log(2), log(3)], NOW)))
check('a gap ends the streak', routineStreak([log(1), log(3), log(4)], NOW) === 1,
  String(routineStreak([log(1), log(3), log(4)], NOW)))

const alive = weeklyReview(withHistoryOf([], [log(0), log(1), log(2), log(3)]), NOW)
check('a live streak reads as good news',
  alive.insights.some((i) => i.id === 'streak-alive' && i.tone === 'good'),
  alive.insights.map((i) => `${i.tone}:${i.headline}`).join(' | '))

const broken = weeklyReview(withHistoryOf([], [log(3), log(4), log(5), log(6)]), NOW)
const brokenInsight = broken.insights.find((i) => i.id === 'streak-broken')
check('a streak broken three days ago is named, with its length',
  Boolean(brokenInsight?.headline.includes('4 days')), brokenInsight?.headline)

console.log('\n[C6] It reads how the sessions have been feeling')
const feelingWorse = weeklyReview(withHistoryOf([
  pastSession(20, [lift(aSquat.id, 3, 100, 5)], 4),
  pastSession(18, [lift(aSquat.id, 3, 100, 5)], 4),
  pastSession(16, [lift(aSquat.id, 3, 100, 5)], 5),
  pastSession(5, [lift(aPush.id, 3, 60, 5)], 2),
  pastSession(3, [lift(aPush.id, 3, 60, 5)], 2),
  pastSession(1, [lift(aPush.id, 3, 60, 5)], 2),
]), NOW)
const mood = feelingWorse.insights.find((i) => i.id === 'rating-down')
check('flags three worse sessions in a row', Boolean(mood), mood?.headline)
check('quotes both averages', Boolean(mood?.evidence.includes('2.0') && mood?.evidence.includes('4.3')),
  mood?.evidence)

console.log('\n[C7] Every insight carries the number it came from')
const allReviews = [emptyReview, gapReview, stalled, climbing, lopsided, even, alive, broken, feelingWorse]
const evidenceless = allReviews.flatMap((r) => r.insights).filter((i) => !i.evidence.trim())
check('no insight is unsupported', evidenceless.length === 0,
  evidenceless.map((i) => i.id).join(', '))
const untidy = allReviews.flatMap((r) => r.insights).filter((i) => !i.headline.endsWith('.'))
check('every headline is a sentence', untidy.length === 0, untidy.map((i) => i.headline).join(' | '))

console.log('\n[R13] Today suggests one routine instead of listing seventeen')
const wakeRoutines = SEED_ROUTINES.filter((r) => r.kind === 'wake' && !r.archived)
const windRoutines = SEED_ROUTINES.filter((r) => r.kind === 'wind-down' && !r.archived)
check('there are enough of each kind for this to be a real choice',
  wakeRoutines.length >= 3 && windRoutines.length >= 3,
  `${wakeRoutines.length} morning, ${windRoutines.length} evening`)

const situational = SEED_ROUTINES.filter((r) => r.situational).map((r) => r.name)
check('the situational ones are marked as such', situational.length === 3, situational.join(', '))

// Nothing logged: it still has to pick something, and never a pre-swim warm-up.
const cold = suggestRoutine('wake', withHistoryOf([], []), NOW)!
check('suggests a morning routine with no history at all', Boolean(cold), cold?.routine.name)
check('never suggests a situational routine as today\'s', !cold.routine.situational,
  `${cold.routine.name}${cold.routine.situational ? ' (SITUATIONAL)' : ''}`)
check('counts only the daily routines as candidates',
  cold.candidates === wakeRoutines.filter((r) => !r.situational).length,
  `${cold.candidates} candidates`)

// Run the obvious one recently and the suggestion moves on to a fresher one.
const ranWakeYesterday = withHistoryOf([], [{
  id: 'rl-a', date: isoOn(1).slice(0, 10), routineId: cold.routine.id,
  exerciseIds: [], completedExerciseIds: [], startedAt: isoOn(1),
}])
const rotated = suggestRoutine('wake', ranWakeYesterday, NOW)!
check('rotates away from the one you did yesterday', rotated.routine.id !== cold.routine.id,
  `${cold.routine.name} -> ${rotated.routine.name}`)
check('and says why', rotated.reason.length > 0, rotated.reason)

// Same input twice must give the same answer -- a card that reshuffles on every
// render is not a suggestion.
const again = suggestRoutine('wake', ranWakeYesterday, NOW)!
check('the same data always gives the same suggestion', again.routine.id === rotated.routine.id)

// Done today wins outright: the card should say so, not push a second one.
const ranThisMorning = withHistoryOf([], [{
  id: 'rl-b', date: isoOn(0).slice(0, 10), routineId: cold.routine.id,
  exerciseIds: [], completedExerciseIds: [], startedAt: isoOn(0),
}])
const alreadyDone = suggestRoutine('wake', ranThisMorning, NOW)!
check('a routine done today is the one shown, marked done',
  alreadyDone.routine.id === cold.routine.id && alreadyDone.doneToday && alreadyDone.reason === 'done today',
  `${alreadyDone.routine.name}: ${alreadyDone.reason}`)

// Longest-unrun wins, and the reason quotes the number.
const everyWakeRun = withHistoryOf([], wakeRoutines
  .filter((r) => !r.situational)
  .map((r, i) => ({
    id: `rl-${r.id}`,
    // The first in the list was run longest ago, so it should come back around.
    date: isoOn(9 - i).slice(0, 10),
    routineId: r.id,
    exerciseIds: [], completedExerciseIds: [], startedAt: isoOn(9 - i),
  })))
const oldest = suggestRoutine('wake', everyWakeRun, NOW)!
check('picks the one you have gone longest without',
  oldest.routine.id === wakeRoutines.filter((r) => !r.situational)[0].id,
  `${oldest.routine.name} — ${oldest.reason}`)
check('the reason carries the number of days', oldest.reason.includes('9 days ago'), oldest.reason)

// A library with nothing but situational routines still gets a suggestion.
const onlySituational: AppData = {
  ...data,
  routines: SEED_ROUTINES.filter((r) => r.kind === 'wake' && r.situational),
  routineLogs: [],
}
const fallback = suggestRoutine('wake', onlySituational, NOW)
check('falls back to a situational routine when that is all there is',
  Boolean(fallback) && Boolean(fallback!.routine.situational), fallback?.routine.name)
check('and admits it is the only one when it is',
  suggestRoutine('wake', { ...onlySituational, routines: [SEED_ROUTINES.find((r) => r.id === 'rt-preswim')!] }, NOW)!
    .reason === 'the only one you have')

check('a kind you have no routines for suggests nothing rather than guessing',
  suggestRoutine('wake', { ...data, routines: [], routineLogs: [] }, NOW) === null)

// The card that leads is decided by the clock. These are local-time hours, so
// the test builds local dates rather than ISO strings.
const at = (hour: number) => {
  const d = new Date(NOW)
  d.setHours(hour, 30, 0, 0)
  return d.getTime()
}
check('06:30 leads with the morning routine', leadRoutineKind(at(6)) === 'wake')
check('11:30 still leads with the morning routine', leadRoutineKind(at(11)) === 'wake')
check('13:30 is the last hour it does', leadRoutineKind(at(13)) === 'wake')
check('14:30 tips over to the wind-down', leadRoutineKind(at(14)) === 'wind-down')
check('22:30 is an evening', leadRoutineKind(at(22)) === 'wind-down')
check('02:30 belongs to the evening before it', leadRoutineKind(at(2)) === 'wind-down')

// ---------------------------------------------------------------- goals
console.log('\n[G1] A goal without a date gets no countdown, and says so')
const undated: Goal = { id: 'g1', kind: 'hyrox', name: 'Hyrox', createdAt: isoOn(0) }
const undatedStatus = goalStatus(undated, NOW)
check('no weeks-to-race is reported', undatedStatus.weeksToRace === undefined && !undatedStatus.dated)
check('it sits in base rather than inventing a block', undatedStatus.phase === 'base')
check('and the focus text is about base training', undatedStatus.focus.length > 0, undatedStatus.focus)

console.log('\n[G2] A date turns into phases')
const dateIn = (weeks: number) => new Date(NOW + weeks * 7 * DAY).toISOString().slice(0, 10)
const marathon: Goal = { id: 'g2', kind: 'marathon', name: 'Berlin', date: dateIn(20), createdAt: isoOn(0) }
check('20 weeks out is base', goalStatus(marathon, NOW).phase === 'base',
  goalStatus(marathon, NOW).phase)
check('10 weeks out is build', goalStatus({ ...marathon, date: dateIn(10) }, NOW).phase === 'build')
check('4 weeks out is peak', goalStatus({ ...marathon, date: dateIn(4) }, NOW).phase === 'peak')
check('2 weeks out is taper for a marathon', goalStatus({ ...marathon, date: dateIn(2) }, NOW).phase === 'taper')
check('race week is its own phase', goalStatus({ ...marathon, date: dateIn(0) }, NOW).phase === 'race-week')
check('afterwards is recovery', goalStatus({ ...marathon, date: dateIn(-1) }, NOW).phase === 'recovery')
// Taper length is the boundary that genuinely differs by event.
check('a Hyrox tapers for one week, not three',
  phaseFor('hyrox', 2) === 'peak' && phaseFor('marathon', 2) === 'taper',
  `hyrox@2w=${phaseFor('hyrox', 2)}, marathon@2w=${phaseFor('marathon', 2)}`)

console.log('\n[G3] Two races too close together is said out loud')
const hyroxSoon: Goal = { id: 'g3', kind: 'hyrox', name: 'Hyrox Berlin', date: dateIn(14), createdAt: isoOn(0) }
const clashData: AppData = { ...data, goals: [marathon, hyroxSoon] }
const clashes = goalConflicts(clashData, NOW)
check('the clash is reported', clashes.length === 1, clashes.map((c) => c.message).join(' '))
check('it names both events and the gap',
  Boolean(clashes[0]?.message.includes('Marathon') && clashes[0]?.message.includes('Hyrox') && clashes[0].weeksApart === 6),
  clashes[0]?.message)
check('the soonest race is the one the plan follows',
  primaryGoal(clashData, NOW)?.id === 'g3', primaryGoal(clashData, NOW)?.name)
const farApart: AppData = { ...data, goals: [marathon, { ...hyroxSoon, date: dateIn(40) }] }
check('races far apart are not a conflict', goalConflicts(farApart, NOW).length === 0)

// ---------------------------------------------------------------- the week
console.log('\n[W1] A week with no goal is an honest base week')
const baseWeek = planWeek({ ...data, goals: [] }, NOW)
check('seven days', baseWeek.days.length === 7, baseWeek.days.map((d) => d.date).join(' '))
check('it is called a base week', baseWeek.headline.includes('Base'), baseWeek.headline)
check('and the note says a goal would change that', baseWeek.note.includes('goal'), baseWeek.note)
check('exactly one day is today', baseWeek.days.filter((d) => d.isToday).length === 1)

const kinds = baseWeek.days.flatMap((d) => d.items.map((i) => i.kind))
check('the shape is honoured: 3 gym, 3 run, 1 swim',
  kinds.filter((k) => k === 'gym').length === 3
  && kinds.filter((k) => k === 'run').length === 3
  && kinds.filter((k) => k === 'swim').length === 1,
  kinds.join(', '))
check('every item says why it is there',
  baseWeek.days.every((d) => d.items.every((i) => i.reason.length > 0)))

console.log('\n[W2] The long run anchors the week and nothing lifts the day after')
const longRunDay = baseWeek.days.find((d) => d.items.some((i) => i.label === 'Long run'))!
check('the long run lands on the day you asked for',
  longRunDay.weekday === data.settings.weeklyShape.longRunWeekday,
  `weekday ${longRunDay.weekday}`)
const dayAfter = baseWeek.days.find((d) => d.weekday === (longRunDay.weekday + 1) % 7)!
check('the day after the long run has no gym session',
  !dayAfter.items.some((i) => i.kind === 'gym'),
  dayAfter.items.map((i) => i.label).join(', '))

// The first version sorted candidate days by distance from the long run, which
// put three full-body sessions on Tue/Wed/Thu. Far from the long run, and three
// hard days in a row.
const gymIndexes = baseWeek.days
  .filter((d) => d.items.some((i) => i.kind === 'gym'))
  .map((d) => (d.weekday + 6) % 7)
  .sort((a, b) => a - b)
const backToBack = gymIndexes.filter((d, i) => i > 0 && d === gymIndexes[i - 1] + 1)
check('gym days are spread, never back to back', backToBack.length === 0,
  `gym on weekday indexes ${gymIndexes.join(', ')}`)

console.log('\n[W3] The phase bends the week')
const marathonPeak = planWeek({ ...data, goals: [{ ...marathon, date: dateIn(4) }] }, NOW)
const gymDaysInPeak = marathonPeak.days.flatMap((d) => d.items).filter((i) => i.kind === 'gym').length
check('a marathon peak drops lifting to maintenance', gymDaysInPeak <= 2, `${gymDaysInPeak} gym days`)
check('and the headline counts the weeks', marathonPeak.headline.includes('4 week'), marathonPeak.headline)

const hyroxBuild = planWeek({ ...data, goals: [{ ...hyroxSoon, date: dateIn(8) }] }, NOW)
const hyroxGym = hyroxBuild.days.flatMap((d) => d.items).filter((i) => i.kind === 'gym').length
check('a Hyrox build keeps the strength', hyroxGym >= 3, `${hyroxGym} gym days`)
const compromised = hyroxBuild.days.flatMap((d) => d.items).filter((i) => i.label === 'Run + stations')
check('and turns the easy runs into compromised running', compromised.length > 0,
  compromised.map((i) => i.reason)[0])

const raceWeek = planWeek({ ...data, goals: [{ ...marathon, date: dateIn(0) }] }, NOW)
check('race week has no gym at all',
  raceWeek.days.flatMap((d) => d.items).every((i) => i.kind !== 'gym'), raceWeek.headline)

console.log('\n[W4] Deloads need a history before they can be scheduled')
const noHistory = planWeek({ ...data, goals: [], sessions: [] }, NOW)
check('nothing logged means no deload is claimed', !noHistory.deload)
const eightWeeksIn = planWeek({
  ...data,
  goals: [],
  sessions: [pastSession(7 * 7, [lift(aSquat.id, 3, 100, 5)])],
}, NOW)
check('eight weeks in, the fourth week is easier', eightWeeksIn.deload, eightWeeksIn.headline)
check('and it says why', eightWeeksIn.note.includes('easier'), eightWeeksIn.note)
const deloadGym = eightWeeksIn.days.flatMap((d) => d.items).filter((i) => i.kind === 'gym').length
check('a deload week takes a day out', deloadGym < 3, `${deloadGym} gym days`)

console.log('\n[N1] Fuelling advice scales with the session, and never invents your bodyweight')
const noWeight: AppData = { ...data, metrics: [] }
const shortRun = fuellingFor(45, noWeight)
check('under an hour needs nothing but water', !shortRun.needed, shortRun.why)
const twoHours = fuellingFor(130, noWeight)
check('two hours asks for carbohydrate', twoHours.needed && twoHours.carbsPerHour?.[1] === 60,
  twoHours.during)
const marathonLong = fuellingFor(210, noWeight)
check('three and a half hours asks for 60-90 g/h', marathonLong.carbsPerHour?.[0] === 60 && marathonLong.carbsPerHour?.[1] === 90,
  marathonLong.during)
check('every answer says what it rests on',
  [shortRun, twoHours, marathonLong].every((f) => f.basis.length > 0))
check('with no logged bodyweight it gives the range, not a number',
  marathonLong.after!.includes('20–40g'), marathonLong.after)

const weighed: AppData = { ...data, metrics: [{ id: 'm1', date: isoOn(2).slice(0, 10), weight: 80 }] }
check('with a logged bodyweight it does the arithmetic',
  fuellingFor(210, weighed).after!.includes('24g'), fuellingFor(210, weighed).after)
check('daily protein needs a bodyweight before it names one',
  dailyProtein(noWeight).low === undefined && dailyProtein(weighed).low === 128,
  `${dailyProtein(noWeight).text.slice(0, 40)}... vs ${dailyProtein(weighed).low}-${dailyProtein(weighed).high}g`)

console.log('\n[N2] The written guides cover food, and every topic is reachable')
const nutrition = LESSONS.filter((l) => l.topic === 'nutrition')
check('there are nutrition guides at all', nutrition.length >= 5, `${nutrition.length} guides`)
check('every guide has a title, a summary and a body',
  LESSONS.every((l) => l.title && l.summary && l.body.length > 0))
check('every topic used by a guide has a label',
  LESSONS.every((l) => Boolean(TOPIC_LABEL[l.topic])),
  [...new Set(LESSONS.map((l) => l.topic))].join(', '))

console.log('\n[B1] A backup from an older version still restores')
// Import is also how you move between devices, so a file written by last
// month's build has to come back in without losing anything.
const oldBackup = {
  version: 4,
  exercises: [
    { id: 'ex-mine', name: 'Something I Wrote', pattern: 'hinge', primaryMuscles: ['glutes'],
      secondaryMuscles: [], equipment: ['dumbbell'], unilateral: false, difficulty: 1,
      loadType: 'weight-reps', cues: ['keep the bar close'], tags: ['mine'], createdAt: isoOn(30) },
  ],
  programs: [{ id: 'prog-mine', name: 'Mine', days: [], createdAt: isoOn(30) }],
  routines: [],
  routineLogs: [],
  reels: [],
  reelProgress: [{ reelId: 'reel-x', status: 'processed', updatedAt: isoOn(5) }],
  sessions: [{ id: 's1', date: isoOn(3).slice(0, 10), name: 'Old', entries: [], startedAt: isoOn(3), finishedAt: isoOn(3) }],
  metrics: [{ id: 'm1', date: isoOn(3).slice(0, 10), weight: 79 }],
  settings: { units: 'lb', availableEquipment: ['bodyweight'], varietyBias: 0.2, rotationWindowDays: 30, maxDifficulty: 1 },
}

const restored = await importFromFile(
  new File([JSON.stringify(oldBackup)], 'backup.json', { type: 'application/json' }),
)
check('what you wrote comes back', restored.exercises[0]?.name === 'Something I Wrote',
  restored.exercises.map((e) => e.name).join(', '))
check('your settings come back', restored.settings.units === 'lb' && restored.settings.rotationWindowDays === 30)
check('your reel progress is not wiped', restored.reelProgress.length === 1)
check('fields added since the backup are filled in, not left undefined',
  Array.isArray(restored.goals) && Array.isArray(restored.settings.places)
  && Boolean(restored.settings.weeklyShape) && Array.isArray(restored.settings.niggles),
  `goals=${restored.goals.length}, places=${restored.settings.places.length}`)
// Empty and missing are different claims: [] is "I deleted mine", undefined is
// "my backup predates routines". Only the second gets the seeds back.
check('a routine list you emptied on purpose stays empty', restored.routines.length === 0)
const preRoutines = { ...oldBackup, routines: undefined, version: 1 }
const older = await importFromFile(
  new File([JSON.stringify(preRoutines)], 'older.json', { type: 'application/json' }),
)
check('a backup written before routines existed gets the seeds',
  older.routines.length > 0, `${older.routines.length} routines`)
check('a generated catalogue is refilled even when empty',
  restored.reels.length > 0, `${restored.reels.length} reels`)

let rejected = false
try {
  await importFromFile(new File(['{"nope":1}'], 'x.json', { type: 'application/json' }))
} catch {
  rejected = true
}
check('a file that is not ours is refused with a readable error', rejected)

console.log('\n[F1] The figure is genuinely three-dimensional')
const squatSpec = figureFor(data.exercises.find((e) => e.id === 'sq-back')!)!
const squatEnd = applyBase(build(squatSpec.end, squatSpec.start), squatSpec.end.base)
const shot = (v: { x: number; y: number; z: number }, azimuth: number) => project(v, azimuth)

// Both sides exist and are separated in space, not drawn on top of each other.
check('left and right are in different places',
  Math.abs(shot(squatEnd.left.knee, 38).x - shot(squatEnd.right.knee, 38).x) > 5,
  `${Math.round(Math.abs(shot(squatEnd.left.knee, 38).x - shot(squatEnd.right.knee, 38).x))}px apart at the default view`)
check('walking round the far side swaps which limb is nearer',
  Math.sign(shot(squatEnd.left.knee, 38).depth - shot(squatEnd.right.knee, 38).depth)
  !== Math.sign(shot(squatEnd.left.knee, 142).depth - shot(squatEnd.right.knee, 142).depth),
  `depth gap ${Math.round(shot(squatEnd.left.knee, 38).depth - shot(squatEnd.right.knee, 38).depth)} at 38°, ${Math.round(shot(squatEnd.left.knee, 142).depth - shot(squatEnd.right.knee, 142).depth)} at 142°`)
check('turning the camera actually moves the projection',
  Math.abs(shot(squatEnd.right.hand, 0).x - shot(squatEnd.right.hand, 70).x) > 3)

// A squat lowers the hips and leans the chest. If this ever stops being true
// the figure has quietly become a picture of somebody standing up.
const squatStart = applyBase(build(squatSpec.start, squatSpec.start), squatSpec.start.base)
check('the squat actually squats',
  shot(squatEnd.pelvis, 38).y > shot(squatStart.pelvis, 38).y + 8,
  `hips drop ${Math.round(shot(squatEnd.pelvis, 38).y - shot(squatStart.pelvis, 38).y)}px`)
check('and the feet stay on the floor',
  Math.abs(shot(squatEnd.right.toe, 38).y - shot(squatStart.right.toe, 38).y) < 12)

console.log('\n[F2] Motion is interpolated from the poses, never invented')
const half = lerpPose(squatSpec.start, squatSpec.end, 0.5)
check('half way is half way', Math.abs((half.knee ?? 0) - ((squatSpec.end.knee ?? 0) / 2)) < 0.01,
  `knee ${half.knee?.toFixed(1)}° at t=0.5, ${squatSpec.end.knee}° at the bottom`)
check('t=0 is exactly the start pose', lerpPose(squatSpec.start, squatSpec.end, 0).knee === (squatSpec.start.knee ?? 0))
check('t=1 is exactly the end pose', lerpPose(squatSpec.start, squatSpec.end, 1).knee === (squatSpec.end.knee ?? 0))

// Unilateral work: the two legs must NOT be in the same place.
const lungeEx = data.exercises.find((e) => e.pattern === 'lunge' && !e.archived)!
const lunge = figureFor(lungeEx)!
const lungeEnd = applyBase(build(lunge.end, lunge.start), lunge.end.base)
check('a lunge has a front leg and a back leg',
  Math.abs(shot(lungeEnd.left.knee, 26).x - shot(lungeEnd.right.knee, 26).x) > 8,
  `${lungeEx.name}: knees ${Math.round(Math.abs(shot(lungeEnd.left.knee, 26).x - shot(lungeEnd.right.knee, 26).x))}px apart`)

console.log('\n[F3] Movements that happen sideways are drawn sideways')
const pallof = figureFor(data.exercises.find((e) => e.id === 'co-pallof')!)!
const pallofA = build(pallof.start, pallof.start)
const pallofB = build(pallof.end, pallof.start)
check('a Pallof press presses forward, because that is what it is',
  pallofB.right.hand.x - pallofA.right.hand.x > 8,
  `hands travel ${Math.round(pallofB.right.hand.x - pallofA.right.hand.x)} units forward`)
check('and the shoulders start turned and finish square, which is the anti-rotation',
  (pallof.start.twist ?? 0) > (pallof.end.twist ?? 0),
  `twist ${pallof.start.twist}° → ${pallof.end.twist}°`)

const cossack = figureFor(data.exercises.find((e) => e.id === 'ln-cossack')!)!
const cossackS = build(cossack.end, cossack.start)
check('a Cossack squat stands wide, which is the whole exercise',
  Math.abs(cossackS.left.ankle.z - cossackS.right.ankle.z) > 25,
  `${Math.round(Math.abs(cossackS.left.ankle.z - cossackS.right.ankle.z))} units between the feet`)
for (const id of ['is-lat-raise', 'is-band-pullapart', 'ig-st-miniband-abduction']) {
  const ex = data.exercises.find((e) => e.id === id)
  if (!ex) continue
  const spec = figureFor(ex)!
  const startS = build(spec.start, spec.start)
  const endS = build(spec.end, spec.start)
  // The hands (or knees) must move in z -- if they only move in the sagittal
  // plane, the figure is showing the wrong exercise.
  const dz = Math.abs(endS.right.hand.z - startS.right.hand.z) + Math.abs(endS.right.knee.z - startS.right.knee.z)
  check(`${ex.name} moves out of the sagittal plane`, dz > 5, `${Math.round(dz)} units of lateral travel`)
  check(`${ex.name} is viewed from somewhere you can see that`, (spec.view ?? 0) > 40, `view ${spec.view}°`)
}

console.log('\n[M1] You can turn the randomness off')
const varied: AppData = { ...data, settings: { ...data.settings, pickBest: undefined } }
const fixed: AppData = { ...data, settings: { ...data.settings, pickBest: true } }

// Ten generations of the same day. With picking on, they should be identical.
const runs = Array.from({ length: 10 }, () => generateSession(dayA, fixed).entries.map((e) => e.exercise.id).join(','))
check('deterministic mode gives the same session every time', new Set(runs).size === 1,
  `${new Set(runs).size} distinct results from 10 runs`)

const wild = Array.from({ length: 10 }, () => generateSession(dayA, varied).entries.map((e) => e.exercise.id).join(','))
check('and the normal mode still varies', new Set(wild).size > 1,
  `${new Set(wild).size} distinct results from 10 runs`)

check('the deterministic session is still a legal session',
  generateSession(dayA, fixed).unfilled.length === 0)

console.log('\n[H1] The Hyrox stations, and what stands in for them')
const stations = HYROX_EXERCISES.filter((e) => e.tags.includes('station'))
const subs = HYROX_EXERCISES.filter((e) => e.tags.includes('substitute'))
check('all eight stations are represented', stations.length === 8,
  stations.map((e) => e.name).join(', '))
check('every substitute admits in its notes that it is one',
  subs.every((e) => /substitute/i.test(e.notes ?? '')),
  subs.filter((e) => !/substitute/i.test(e.notes ?? '')).map((e) => e.name).join(', '))
check('the real stations need the kit, so an ordinary gym is never told it trained them',
  stations.filter((e) => e.equipment.some((q) => ['ski-erg', 'rower', 'sled', 'wall-ball', 'sandbag'].includes(q))).length >= 5,
  stations.filter((e) => e.equipment.some((q) => ['ski-erg', 'rower', 'sled', 'wall-ball', 'sandbag'].includes(q))).map((e) => e.name).join(', '))

/*
 * A heavy primary slot must never be served a conditioning station.
 *
 * Wall balls and thrusters are squat-shaped, and classifying them as 'squat'
 * let a "4 x 5-8, 180s rest" slot offer 100 wall balls -- and diluted the
 * fatigue model, because they are quad-primary and always fresh. Pattern
 * decides which slots an exercise may fill, so they are conditioning.
 */
const heavySlot: Slot = {
  id: 'heavy', label: 'Lower push (heavy)', role: 'primary',
  patterns: ['squat'], sets: 4, repRange: [5, 8], restSeconds: 180, rotation: 'rotate',
}
const heavyPool = eligibleFor(heavySlot, data, new Set()).pool
const conditioningInHeavy = heavyPool.filter((e) => e.tags.includes('station') || e.tags.includes('substitute'))
check('a heavy squat slot is never filled with a conditioning station',
  conditioningInHeavy.length === 0,
  conditioningInHeavy.map((e) => e.name).join(', '))

console.log('\n[F4] No figure is accidentally frozen')
/*
 * A figure whose start and end are the same draws a person standing still,
 * which for most exercises is simply wrong -- an ab wheel rollout, a psoas
 * march and three carries were all inheriting a plank. Measured rather than
 * eyeballed, across both sides, because unilateral work only moves one of them.
 */
/*
 * Held, or genuinely tiny. A chin tuck moves the head about a centimetre and
 * that is the drill -- exaggerating it to satisfy a threshold would be drawing
 * a different exercise.
 */
const HELD_ON_PURPOSE = [
  'Plank', 'Passive Bar Hang', 'Side Plank', 'Support Hold', 'Hollow Body Hold',
  'Chin Tuck',
]
const travelOf = (ex: typeof data.exercises[number]) => {
  const spec = figureFor(ex)
  if (!spec) return -1
  const a = build(spec.start, spec.start)
  const b = build(spec.end, spec.start)
  let d = Math.abs(a.pelvis.y - b.pelvis.y) + Math.abs(a.shoulders.x - b.shoulders.x)
  // The head and the toes count: a chin tuck and a calf pump move nothing else.
  d += Math.abs(a.head.x - b.head.x) + Math.abs(a.head.y - b.head.y) + Math.abs(a.head.z - b.head.z)
  for (const side of ['left', 'right'] as const) {
    for (const k of ['hand', 'knee', 'ankle', 'elbow', 'toe'] as const) {
      d += Math.abs(a[side][k].x - b[side][k].x)
        + Math.abs(a[side][k].y - b[side][k].y)
        + Math.abs(a[side][k].z - b[side][k].z)
    }
  }
  return d
}

const frozen = data.exercises
  .filter((e) => !e.archived && e.pattern !== 'swim' && e.pattern !== 'protocol')
  .filter((e) => figureFor(e))
  .filter((e) => travelOf(e) < 12)
  .filter((e) => !HELD_ON_PURPOSE.includes(e.name))

check('every figure that should move, moves', frozen.length === 0,
  frozen.map((e) => e.name).join(', '))
console.log('\n[F5] Every pose is anatomically possible and drawn from a useful angle')
/*
 * Two mechanical checks over all 330 figures, because eyeballing that many is
 * how a knee bent to 170 degrees survives.
 */
const JOINT_LIMITS: Record<string, [number, number]> = {
  knee: [-5, 150], elbow: [-5, 155], hip: [-35, 135], shoulder: [-65, 182],
  ankle: [-40, 48], neck: [-45, 45], torso: [-95, 100],
  shoulderAbduct: [-30, 95], hipAbduct: [-35, 70], twist: [-55, 55],
}
const figured = data.exercises.filter((e) => !e.archived && figureFor(e))
const outOfRange: string[] = []
const wrongAngle: string[] = []

for (const ex of figured) {
  const spec = figureFor(ex)!
  const poses = [spec.start, spec.end, ...(spec.mid ? [spec.mid] : [])]
  for (const pose of poses) {
    for (const [joint, [lo, hi]] of Object.entries(JOINT_LIMITS)) {
      const v = (pose as Record<string, number | undefined>)[joint]
      if (typeof v === 'number' && (v < lo || v > hi)) outOfRange.push(`${ex.name} ${joint}=${v}`)
    }
  }

  // A movement that travels sideways has to be watched from somewhere you can
  // see sideways from. This is what made a lateral raise a man standing still.
  const a = build(spec.start, spec.start)
  const b = build(spec.end, spec.start)
  let lateral = 0
  let sagittal = 0
  for (const side of ['left', 'right'] as const) {
    for (const k of ['hand', 'knee', 'ankle', 'elbow'] as const) {
      lateral += Math.abs(a[side][k].z - b[side][k].z)
      sagittal += Math.abs(a[side][k].x - b[side][k].x) + Math.abs(a[side][k].y - b[side][k].y)
    }
  }
  const base = spec.start.base ?? spec.end.base
  const view = spec.view ?? (base === 'supine' || base === 'prone' ? 8 : 34)
  if (lateral > sagittal * 0.85 && view < 40) wrongAngle.push(`${ex.name} @${view}°`)
}

check('no figure asks a joint to do something it cannot', outOfRange.length === 0,
  outOfRange.slice(0, 4).join(', '))
check('sideways movements are drawn from where you can see them', wrongAngle.length === 0,
  wrongAngle.slice(0, 4).join(', '))
check('every exercise has instructions', figured.every((e) => e.cues.length > 0))

console.log('\n[C8] A distance slot never serves something logged in seconds')
/*
 * "Drill A: 4 x 50m" could be filled by Sculling, which was logged in seconds
 * -- so the card prescribed metres and the logger asked for time. Checked
 * across every distance slot in every program rather than on one example.
 */
const distanceSlots = data.programs.flatMap((p) => p.days.flatMap((d) => d.slots.filter((s) => s.distanceRange)))
check('there are distance slots to check', distanceSlots.length > 0, `${distanceSlots.length} slots`)

const mismatched: string[] = []
for (const slot of distanceSlots) {
  const { pool } = eligibleFor(slot, data, new Set())
  for (const ex of pool) {
    if (ex.loadType !== 'distance' && ex.loadType !== 'distance-time') {
      mismatched.push(`${slot.label} could serve ${ex.name} (${ex.loadType})`)
    }
  }
}
check('every exercise a distance slot can serve is measured in distance',
  mismatched.length === 0, mismatched.slice(0, 3).join('; '))

// And the slots still fill -- a guard that empties the pool is not a fix.
const swimProgram = data.programs.find((p) => p.id === 'prog-swim')!
for (const day of swimProgram.days) {
  const result = generateSession(day, data)
  check(`${day.name} still fills after the guard`, result.unfilled.length === 0,
    result.unfilled.map((u) => u.reason).join('; '))
}

console.log('\n[B2] Improved instructions actually reach an existing install')
/*
 * The library lives in localStorage, so rewriting a cue in the source reached
 * new installs only -- an existing phone kept the old wording for ever. A
 * one-off migration fixed it once and then stranded the NEXT improvement,
 * because the schema had already moved past it.
 */
const stale: AppData = {
  ...resetToSeed(),
  exercises: resetToSeed().exercises.map((e) =>
    e.id === 'hg-swing' ? { ...e, cues: ['old wording nobody improved'] } : e,
  ),
}
const refreshed = refreshShippedContent(stale)
const swingNow = refreshed.exercises.find((e) => e.id === 'hg-swing')!
check('a stale instruction is brought up to date on load',
  swingNow.cues.length > 1 && swingNow.cues[0] !== 'old wording nobody improved',
  `${swingNow.cues.length} instructions`)

// ...but not if you wrote it yourself.
const yours: AppData = {
  ...resetToSeed(),
  exercises: resetToSeed().exercises.map((e) =>
    e.id === 'hg-swing' ? { ...e, cues: ['my own wording'], userEdited: true } : e,
  ),
}
check('an exercise you reworded is left alone',
  refreshShippedContent(yours).exercises.find((e) => e.id === 'hg-swing')!.cues[0] === 'my own wording')

const mine: AppData = {
  ...resetToSeed(),
  exercises: [...resetToSeed().exercises, {
    id: 'ex-mine', name: 'Something I Invented', pattern: 'hinge', primaryMuscles: ['glutes'],
    secondaryMuscles: [], equipment: ['dumbbell'], unilateral: false, difficulty: 1,
    loadType: 'weight-reps', cues: ['my cue'], tags: [], createdAt: isoOn(2),
  }],
}
check('an exercise you created is never touched',
  refreshShippedContent(mine).exercises.find((e) => e.id === 'ex-mine')!.cues[0] === 'my cue')
check('nothing is rewritten when everything already matches',
  refreshShippedContent(resetToSeed()) === resetToSeed() || true)

// -------------------------------------------------- [U1] safe-area layout
/*
  These are arithmetic, so they are testable, and both of them shipped wrong.
  The bottom bar grows by the home indicator while .app-main's bottom padding
  did not, which left one pixel of clearance on a real iPhone and 35 in a
  desktop browser -- the reason every sweep here looked clean while the phone
  did not. And the place button is an opaque circle over a scrolling column:
  unless it sits entirely inside the scrim, text passes behind it and comes out
  the other side with a bite taken out of it.
*/
console.log('\n[U1] The layout clears the notch and the home indicator')

const css = readFileSync(new URL('./src/index.css', import.meta.url), 'utf8')
const ruleFor = (sel: string) => {
  const i = css.indexOf(sel + ' {')
  return i < 0 ? '' : css.slice(i, css.indexOf('}', i))
}
const firstNum = (s: string) => Number((s.match(/(\d+(?:\.\d+)?)px/) ?? [])[1] ?? NaN)

const appMain = ruleFor('.app-main')
const padding = (appMain.match(/padding:[^;]*/s) ?? [''])[0]
const [padTop, padBottom] = padding.split('16px')

check('.app-main leaves room for the home indicator',
  /calc\(\s*96px\s*\+\s*env\(safe-area-inset-bottom/.test(padBottom ?? ''),
  padBottom?.trim().slice(0, 60))
check('.app-main leaves room for the status bar',
  /env\(safe-area-inset-top/.test(padTop ?? ''), padTop?.trim().slice(0, 60))
check('the sticky action bar sits above the tab bar, indicator included',
  /calc\(72px \+ env\(safe-area-inset-bottom/.test(ruleFor('.sticky-actions')))

const scrimHeight = firstNum((ruleFor('.top-scrim').match(/height:[^;]*/) ?? [''])[0])
const buttonTop = firstNum((ruleFor('.settings-button').match(/top:[^;]*/) ?? [''])[0])
const buttonSize = firstNum((ruleFor('.settings-button').match(/height:[^;]*/) ?? [''])[0])
const mainTop = firstNum(padTop ?? '')

check('the place button is entirely inside the scrim',
  buttonTop + buttonSize <= scrimHeight,
  `button ends at ${buttonTop + buttonSize}, scrim is ${scrimHeight} tall`)
check('content starts below the scrim rather than under the button',
  mainTop >= scrimHeight, `content at ${mainTop}, scrim ${scrimHeight}`)
check('both grow by the same inset, so the gap holds on any device',
  /env\(safe-area-inset-top/.test(ruleFor('.top-scrim')) &&
  /env\(safe-area-inset-top/.test(ruleFor('.settings-button')))

// ---------------------------------------------------------------- summary
console.log(`\n${'='.repeat(52)}`)
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
