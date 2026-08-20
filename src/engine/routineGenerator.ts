/**
 * The routine generator.
 *
 * Same three steps as the workout generator -- filter, score, pick -- and
 * literally the same code for the first two. A RoutineStep structurally
 * satisfies SlotFilter, so `eligibleFor` works on it unchanged.
 *
 * Two things are deliberately different:
 *
 * 1. FATIGUE IS IGNORED. `scorePool` normally penalises exercises whose muscles
 *    are cooked. For stretching that is backwards -- fried hamstrings are a
 *    reason to stretch hamstrings, not to avoid them. Passing an empty fatigue
 *    map flattens the recovery term to 1 for everybody.
 *
 * 2. LENGTH IS A TARGET, NOT A COUNT. The listed steps are the skeleton; the
 *    generator keeps adding rotating extras until the routine is roughly
 *    `targetMinutes` long. That is what makes "give me 12 minutes" real.
 */

import type { AppData, Exercise, Routine, RoutineKind, RoutineLog, RoutineStep } from '../types'
import { uid } from '../storage/repository'
import { buildUsageIndex, eligibleFor, pick, scorePool } from './generator'

export interface GeneratedDrill {
  step: RoutineStep
  exercise: Exercise
  reason: string
  /** Real duration: a per-side step on a unilateral exercise costs double. */
  seconds: number
  perSide: boolean
  alternatives: Exercise[]
}

export interface RoutineResult {
  drills: GeneratedDrill[]
  unfilled: { step: RoutineStep; reason: string }[]
  /** Work plus transitions, so it matches what the timer will actually run. */
  totalSeconds: number
}

/** Routines rotate freely -- there is nothing to progress, so nothing to protect. */
const ROUTINE_ROLE = 'accessory' as const

/** No fatigue penalty. See the note at the top of the file. */
const NO_FATIGUE: Record<string, number> = {}

/** Stops a pathological routine (30s steps, 60min target) spinning forever. */
const MAX_EXTRA_DRILLS = 24

function drillSeconds(step: RoutineStep, exercise: Exercise): number {
  return step.perSide && exercise.unilateral ? step.seconds * 2 : step.seconds
}

function fill(
  step: RoutineStep,
  data: AppData,
  used: Set<string>,
  usage: ReturnType<typeof buildUsageIndex>,
): GeneratedDrill | { reason: string } {
  if (step.rotation === 'fixed' && step.pinnedExerciseId) {
    const pinned = data.exercises.find((e) => e.id === step.pinnedExerciseId && !e.archived)
    if (pinned) {
      return {
        step,
        exercise: pinned,
        reason: 'pinned to this step',
        seconds: drillSeconds(step, pinned),
        perSide: Boolean(step.perSide && pinned.unilateral),
        alternatives: [],
      }
    }
    // Pinned drill was deleted -- fall through and pick a replacement.
  }

  // Sauna rounds are meant to repeat -- round three is the same sauna as round
  // one. Everything else in a routine stays distinct.
  const excluded = step.allowRepeat ? new Set<string>() : used
  const { pool, blockReason } = eligibleFor(step, data, excluded)
  if (pool.length === 0) return { reason: blockReason ?? 'no eligible exercise' }

  const scored = scorePool(pool, data, NO_FATIGUE, ROUTINE_ROLE, usage)
  const chosen = pick(scored, step.rotation, data.settings.pickBest)

  return {
    step,
    exercise: chosen.exercise,
    reason: chosen.reason,
    seconds: drillSeconds(step, chosen.exercise),
    perSide: Boolean(step.perSide && chosen.exercise.unilateral),
    alternatives: scored
      .filter((s) => s.exercise.id !== chosen.exercise.id)
      .slice(0, 8)
      .map((s) => s.exercise),
  }
}

export function generateRoutine(routine: Routine, data: AppData): RoutineResult {
  const usage = buildUsageIndex(data, 'routine')
  const used = new Set<string>()
  const drills: GeneratedDrill[] = []
  const unfilled: RoutineResult['unfilled'] = []

  const add = (drill: GeneratedDrill) => {
    used.add(drill.exercise.id)
    drills.push(drill)
  }

  for (const step of routine.steps) {
    const result = fill(step, data, used, usage)
    if ('reason' in result && !('exercise' in result)) {
      unfilled.push({ step, reason: result.reason })
      continue
    }
    add(result as GeneratedDrill)
  }

  // Pad out to the target length by cycling through the steps again. Each pass
  // pulls a different exercise because everything already used is excluded.
  const target = routine.targetMinutes * 60
  const exhausted = new Set<string>()
  let total = () => drills.reduce((sum, d) => sum + d.seconds + d.step.transitionSeconds, 0)

  for (let i = 0; total() < target && i < MAX_EXTRA_DRILLS; i++) {
    if (exhausted.size >= routine.steps.length) break
    const step = routine.steps[i % routine.steps.length]
    if (exhausted.has(step.id)) continue

    const result = fill(step, data, used, usage)
    if ('reason' in result && !('exercise' in result)) {
      exhausted.add(step.id)
      continue
    }
    add(result as GeneratedDrill)
  }

  return { drills, unfilled, totalSeconds: total() }
}

/** Re-roll one drill without regenerating the routine around it. */
export function rerollDrill(
  step: RoutineStep,
  data: AppData,
  currentExerciseIds: string[],
  excludeId?: string,
): GeneratedDrill | null {
  const usage = buildUsageIndex(data, 'routine')
  const used = new Set(currentExerciseIds)
  if (excludeId) used.add(excludeId)

  const result = fill(
    // A fixed step being re-rolled means "give me something else", so drop the pin.
    step.rotation === 'fixed' ? { ...step, rotation: 'random' } : step,
    data,
    used,
    usage,
  )
  return 'exercise' in result ? (result as GeneratedDrill) : null
}

/** Start a log for a routine you are about to run. */
export function toRoutineLog(routine: Routine, result: RoutineResult): RoutineLog {
  const now = new Date()
  return {
    id: uid('rlog-'),
    date: now.toISOString().slice(0, 10),
    routineId: routine.id,
    exerciseIds: result.drills.map((d) => d.exercise.id),
    completedExerciseIds: [],
    startedAt: now.toISOString(),
  }
}

/**
 * Which routine of a given kind to put in front of you today.
 *
 * Today used to show `routines.find(kind === 'wake')` -- always the first one
 * in the array. With five morning routines and five evening ones that is not a
 * choice, it is an accident of array order, and the other eight were invisible
 * unless you went looking through the Routines tab.
 *
 * The rule is the same freshness idea the exercise generator runs on, minus the
 * randomness: a suggestion that changes on every render is not a suggestion.
 * Two things override plain freshness:
 *
 *   - A routine of this kind already completed today wins outright. If you did
 *     your morning routine at seven, the card should say so rather than pushing
 *     a second one at you.
 *   - `situational` routines are excluded. A pre-swim warm-up is structurally a
 *     'wake' routine and would rotate to the top eventually; it is still the
 *     wrong thing to be handed on a morning with no swim in it.
 */
export interface RoutineSuggestion {
  routine: Routine
  /** Why this one rather than one of the others. Shown on the card. */
  reason: string
  doneToday: boolean
  /** How many routines of this kind were in the running, including this one. */
  candidates: number
}

function daysAgoLabel(days: number): string {
  if (days < 1) return 'earlier today'
  if (days < 2) return 'yesterday'
  return `${Math.floor(days)} days ago`
}

export function suggestRoutine(
  kind: RoutineKind,
  data: AppData,
  now = Date.now(),
): RoutineSuggestion | null {
  const ofKind = data.routines.filter((r) => r.kind === kind && !r.archived)
  if (ofKind.length === 0) return null

  // Situational routines are excluded unless they are all you have -- in which
  // case a pre-swim warm-up beats an empty card.
  const daily = ofKind.filter((r) => !r.situational)
  const candidates = daily.length > 0 ? daily : ofKind

  const today = new Date(now).toISOString().slice(0, 10)
  const lastRun = new Map<string, number>()
  let doneTodayId: string | undefined
  for (const log of data.routineLogs) {
    const at = new Date(log.startedAt).getTime()
    lastRun.set(log.routineId, Math.max(lastRun.get(log.routineId) ?? -Infinity, at))
    if (log.date === today && candidates.some((r) => r.id === log.routineId)) {
      doneTodayId = log.routineId
    }
  }

  const doneToday = doneTodayId && candidates.find((r) => r.id === doneTodayId)
  if (doneToday) {
    return { routine: doneToday, reason: 'done today', doneToday: true, candidates: candidates.length }
  }

  // Longest since you ran it, first. Array.sort is stable, so ties fall back to
  // library order and the same data always produces the same suggestion.
  const ranked = candidates
    .map((routine) => {
      const at = lastRun.get(routine.id)
      return { routine, days: at === undefined ? Infinity : (now - at) / (24 * 60 * 60 * 1000) }
    })
    .sort((a, b) => b.days - a.days)

  const best = ranked[0]
  const reason =
    candidates.length === 1
      ? 'the only one you have'
      : best.days === Infinity
        ? 'you have not run this one yet'
        : `longest since you ran it — ${daysAgoLabel(best.days)}`

  return { routine: best.routine, reason, doneToday: false, candidates: candidates.length }
}

/**
 * Which kind of routine the clock calls for.
 *
 * 14:00 rather than something cleverer: a morning routine is still worth doing
 * at half past eleven, and nobody wants to be shown a wind-down at noon.
 * Anything before 04:00 belongs to the previous evening, because it does.
 *
 * Here rather than in the view so the boundaries can be tested. An off-by-one
 * in this comparison shows up as the wrong card at 6am, which is exactly when
 * nobody is in a state to notice it is wrong.
 */
export const MORNING_FROM_HOUR = 4
export const EVENING_FROM_HOUR = 14

export function leadRoutineKind(now = Date.now()): RoutineKind {
  const hour = new Date(now).getHours()
  return hour >= MORNING_FROM_HOUR && hour < EVENING_FROM_HOUR ? 'wake' : 'wind-down'
}
