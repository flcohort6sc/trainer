/**
 * Load suggestion.
 *
 * Double progression: stay at a weight until you hit the TOP of the rep range
 * on every set, then add weight and drop back to the bottom of the range.
 * It is the least fiddly scheme that still works, and it survives missed weeks
 * better than percentage-based plans.
 */

import type { AppData, Exercise, LoadType, Session, Slot } from '../types'
import { ceilingFor } from './places'

export interface LoadSuggestion {
  weight?: number
  /** Plain-language explanation shown next to the number. */
  rationale: string
  /** 'up' | 'hold' | 'down' | 'new' -- drives the little arrow in the UI. */
  direction: 'up' | 'hold' | 'down' | 'new'
}

/** Smallest sensible jump for this exercise, in the user's units. */
function increment(exercise: Exercise, units: 'kg' | 'lb'): number {
  const isUpperBody = exercise.primaryMuscles.some((m) =>
    ['chest', 'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'lats', 'upper-back'].includes(m),
  )
  if (units === 'lb') return isUpperBody ? 5 : 10
  // Dumbbells jump in bigger steps than a barbell you can micro-load.
  if (exercise.equipment.includes('dumbbell')) return isUpperBody ? 2 : 2.5
  return isUpperBody ? 2.5 : 5
}

/** The most recent session containing this exercise, newest first. */
function lastPerformance(exerciseId: string, sessions: Session[]) {
  const relevant = sessions
    .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())

  if (relevant.length === 0) return null
  const session = relevant[0]
  const entry = session.entries.find((e) => e.exerciseId === exerciseId)!
  const done = entry.sets.filter((s) => s.completed)
  if (done.length === 0) return null

  return {
    session,
    entry,
    sets: done,
    topWeight: Math.max(...done.map((s) => s.weight ?? 0)),
    minReps: Math.min(...done.map((s) => s.reps ?? 0)),
    maxReps: Math.max(...done.map((s) => s.reps ?? 0)),
    avgRpe: done.some((s) => s.rpe)
      ? done.reduce((sum, s) => sum + (s.rpe ?? 0), 0) / done.filter((s) => s.rpe).length
      : undefined,
  }
}


/**
 * Which two numeric fields does this exercise want logged?
 *
 * The logger has exactly two number columns and always has. Rather than sprinkle
 * `loadType === 'x' || loadType === 'y'` checks through the views, every screen
 * asks here what the columns mean. Adding a load type becomes one case, not a
 * hunt through the UI.
 */
export interface SetFieldSpec {
  /** Left column. null means "there is nothing to put here" (bodyweight work). */
  primary: { key: 'weight' | 'distance'; label: string; step: string } | null
  /** Right column. */
  secondary: { key: 'reps' | 'seconds'; label: string }
  /** Whether pace is worth showing back to you. */
  showPace: boolean
}

export function setFields(loadType: LoadType, units: string): SetFieldSpec {
  switch (loadType) {
    case 'reps':
      return { primary: null, secondary: { key: 'reps', label: 'reps' }, showPace: false }
    case 'time':
      return { primary: null, secondary: { key: 'seconds', label: 'secs' }, showPace: false }
    case 'weight-time':
      return { primary: { key: 'weight', label: units, step: '0.5' }, secondary: { key: 'seconds', label: 'secs' }, showPace: false }
    case 'distance':
      return { primary: { key: 'distance', label: 'm', step: '1' }, secondary: { key: 'seconds', label: 'secs' }, showPace: false }
    case 'distance-time':
      return { primary: { key: 'distance', label: 'm', step: '1' }, secondary: { key: 'seconds', label: 'secs' }, showPace: true }
    case 'weight-reps':
    default:
      return { primary: { key: 'weight', label: units, step: '0.5' }, secondary: { key: 'reps', label: 'reps' }, showPace: false }
  }
}

/** Swimmers think per 100m, runners think per kilometre. */
export function paceUnit(exercise: Exercise): 100 | 1000 {
  return exercise.pattern === 'swim' ? 100 : 1000
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function formatDistance(metres: number): string {
  return metres >= 1000 ? `${(metres / 1000).toFixed(metres % 1000 === 0 ? 0 : 2)}km` : `${metres}m`
}

/** e.g. "1:35/100m" or "5:12/km". Returns undefined when there is nothing to divide. */
export function formatPace(metres: number, seconds: number, per: 100 | 1000): string | undefined {
  if (!metres || !seconds) return undefined
  const label = per === 100 ? '/100m' : '/km'
  return formatDuration((seconds / metres) * per) + label
}

/** Completed distance work from the most recent session containing this exercise. */
function lastDistanceEffort(exerciseId: string, sessions: Session[]) {
  const relevant = sessions
    .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
  if (relevant.length === 0) return null

  const entry = relevant[0].entries.find((e) => e.exerciseId === exerciseId)!
  const done = entry.sets.filter((s) => s.completed && s.distance)
  if (done.length === 0) return null

  return {
    sets: done.length,
    perSet: done[0].distance ?? 0,
    totalDistance: done.reduce((sum, s) => sum + (s.distance ?? 0), 0),
    totalSeconds: done.reduce((sum, s) => sum + (s.seconds ?? 0), 0),
  }
}

/**
 * Cap a suggestion at what the room actually contains.
 *
 * Two 8kg kettlebells in a living room are a hard ceiling, and an app that
 * keeps suggesting 12kg there has stopped paying attention. At the ceiling,
 * double progression has nowhere to go on load, so it goes on reps -- which is
 * what you would do anyway.
 */
function capToPlace(
  suggestion: LoadSuggestion,
  exercise: Exercise,
  data: AppData,
): LoadSuggestion {
  const ceiling = ceilingFor(exercise, data.settings)
  if (ceiling === undefined || suggestion.weight === undefined) return suggestion
  if (suggestion.weight <= ceiling) return suggestion

  const units = data.settings.units
  return {
    weight: ceiling,
    direction: 'hold',
    rationale: `${ceiling}${units} is the heaviest you have here — chase reps or slow the lowering instead`,
  }
}

export function suggestLoad(exercise: Exercise, slot: Slot, data: AppData): LoadSuggestion {
  return capToPlace(suggestLoadUncapped(exercise, slot, data), exercise, data)
}

function suggestLoadUncapped(exercise: Exercise, slot: Slot, data: AppData): LoadSuggestion {
  // Bodyweight and time-based work has no weight to suggest.
  if (exercise.loadType === 'reps' || exercise.loadType === 'time') {
    return { rationale: 'bodyweight — chase reps or time', direction: 'hold' }
  }

  // Distance work progresses by pace, not by load. There is no weight to put on
  // a 100m swim, so the useful thing to show is what you did last time.
  if (exercise.loadType === 'distance' || exercise.loadType === 'distance-time') {
    const last = lastDistanceEffort(exercise.id, data.sessions)
    if (!last) {
      return { rationale: 'first time — settle into a pace you could repeat', direction: 'new' }
    }
    const pace = formatPace(last.totalDistance, last.totalSeconds, paceUnit(exercise))
    return {
      rationale: pace
        ? `last time ${last.sets}×${formatDistance(last.perSet)} at ${pace} — hold that or beat it`
        : `last time ${last.sets}×${formatDistance(last.perSet)}`,
      direction: 'hold',
    }
  }

  const last = lastPerformance(exercise.id, data.sessions)
  if (!last || last.topWeight === 0) {
    return {
      rationale: 'first time — start light and find a weight you can control',
      direction: 'new',
    }
  }

  const [minReps, maxReps] = slot.repRange
  const step = increment(exercise, data.settings.units)

  // Hit the top of the range on every set -> earn the increase.
  if (last.minReps >= maxReps) {
    return {
      weight: last.topWeight + step,
      rationale: `you hit ${maxReps}+ on every set at ${last.topWeight}${data.settings.units} — go up`,
      direction: 'up',
    }
  }

  // Fell below the bottom of the range -> the weight is too heavy.
  if (last.maxReps < minReps) {
    return {
      weight: Math.max(last.topWeight - step, 0),
      rationale: `you missed the ${minReps}-rep floor last time — drop back and rebuild`,
      direction: 'down',
    }
  }

  // Grinding at RPE 9.5+ without hitting the top of the range -> hold, do not add.
  if (last.avgRpe !== undefined && last.avgRpe >= 9.5) {
    return {
      weight: last.topWeight,
      rationale: 'last session was near-maximal — repeat it before adding weight',
      direction: 'hold',
    }
  }

  return {
    weight: last.topWeight,
    rationale: `same weight — add reps until you reach ${maxReps} on all sets`,
    direction: 'hold',
  }
}

/**
 * A slot prescribes reps, but some exercises are measured in seconds (planks,
 * carries). Rather than give every slot two prescriptions, convert: a
 * controlled rep takes roughly four seconds, so "10-15 reps" becomes
 * "40-60 seconds" of the same effort. Rounded to the nearest 5s so the number
 * reads like something a human wrote.
 */
const SECONDS_PER_REP = 4

export function repsToSeconds(reps: number): number {
  return Math.round((reps * SECONDS_PER_REP) / 5) * 5
}

/** Estimated 1RM via Epley. Used for progress charts, not for prescribing. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

/** Best estimated 1RM per session for one exercise -- the progress chart series. */
export function strengthHistory(exerciseId: string, sessions: Session[]) {
  return sessions
    .filter((s) => s.entries.some((e) => e.exerciseId === exerciseId))
    .map((s) => {
      const entry = s.entries.find((e) => e.exerciseId === exerciseId)!
      const best = entry.sets
        .filter((set) => set.completed && set.weight && set.reps)
        .reduce((max, set) => Math.max(max, estimate1RM(set.weight!, set.reps!)), 0)
      return { date: s.date, startedAt: s.startedAt, e1rm: best }
    })
    .filter((p) => p.e1rm > 0)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
}

/**
 * Total distance covered in a session, in metres.
 *
 * A swim or run session has no meaningful kilogram volume, and reporting
 * "0kg volume" after 2km in the pool makes the app look like it was not
 * paying attention. Views show whichever number is non-zero.
 */
export function sessionDistance(session: Session): number {
  return session.entries.reduce(
    (total, entry) =>
      total + entry.sets.reduce((sum, set) => sum + (set.completed ? (set.distance ?? 0) : 0), 0),
    0,
  )
}

/** Total volume (weight x reps) for a session. */
export function sessionVolume(session: Session): number {
  return session.entries.reduce(
    (total, entry) =>
      total +
      entry.sets.reduce(
        (sum, set) => sum + (set.completed ? (set.weight ?? 0) * (set.reps ?? 0) : 0),
        0,
      ),
    0,
  )
}
