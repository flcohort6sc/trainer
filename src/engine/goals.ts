/**
 * Goals, and the phases that fall out of a date.
 *
 * The rule this file exists to enforce: **a goal without a date gets no plan.**
 * There is no honest way to periodise towards an event that is not scheduled --
 * "week 7 of 16" means nothing if week 16 is imaginary. An undated goal puts you
 * in base training and the app says that is what it is doing.
 *
 * Everything here is arithmetic on dates. No model, no prediction. When you
 * enter a date, weeks-to-race becomes real and the phases follow from it.
 */

import type { AppData, Goal, GoalKind } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Phase boundaries, in weeks out. These are conventional endurance-coaching
 * blocks rather than anything this app discovered, and they are meant to be
 * argued with.
 */
const BUILD_FROM_WEEKS = 12
const PEAK_FROM_WEEKS = 4

/**
 * Taper length is the one boundary that genuinely differs by event. A marathon
 * taper is three weeks because the accumulated fatigue is enormous; a Hyrox is
 * an hour of work and needs about one.
 */
const TAPER_WEEKS: Record<GoalKind, number> = {
  marathon: 3,
  'half-marathon': 2,
  triathlon: 2,
  hyrox: 1,
  general: 1,
}

export type TrainingPhase = 'base' | 'build' | 'peak' | 'taper' | 'race-week' | 'recovery'

export interface GoalStatus {
  goal: Goal
  /** Absent when the goal has no date. That absence is the point. */
  weeksToRace?: number
  daysToRace?: number
  phase: TrainingPhase
  /** What this block of training is for, in one sentence. */
  focus: string
  dated: boolean
}

export const GOAL_LABEL: Record<GoalKind, string> = {
  hyrox: 'Hyrox',
  marathon: 'Marathon',
  'half-marathon': 'Half marathon',
  triathlon: 'Triathlon',
  general: 'General fitness',
}

/**
 * What each phase is actually for, per goal.
 *
 * Marathon and Hyrox diverge hard after base, which is the whole reason this
 * table is per-kind: a marathon build wants fresh legs for long runs, and a
 * Hyrox build wants you running on legs that are already wrecked.
 */
const FOCUS: Record<GoalKind, Partial<Record<TrainingPhase, string>>> = {
  marathon: {
    base: 'Easy mileage and full-body strength. The long run grows slowly and nothing hurts yet.',
    build: 'Long runs get long. Lifting drops towards maintenance so the legs are fresh for them.',
    peak: 'The longest runs of the block, plus race-pace work. This is the hardest fortnight.',
    taper: 'Volume down, intensity kept. You cannot gain fitness now — you can only arrive tired.',
    'race-week': 'Almost nothing. Sleep, eat, and practise the race-morning routine.',
    recovery: 'Two weeks of nothing you have to think about. Walk, swim, sauna.',
  },
  hyrox: {
    base: 'Strength and engine at the same time. This is the phase the app already generates well.',
    build: 'Compromised running: run, hit a station, run again. Grip and legs under fatigue.',
    peak: 'Race simulations. Full or half distance, in order, with the substitutions named.',
    taper: 'Stay sharp, cut the volume. Short intervals, light stations, nothing to failure.',
    'race-week': 'Movement only. Practise transitions, not fitness.',
    recovery: 'Let the hands and legs recover before the next block.',
  },
  'half-marathon': {
    base: 'Easy mileage with strength kept. The long run builds a kilometre at a time.',
    build: 'Tempo work and a growing long run, with lifting at two days.',
    peak: 'Race-pace blocks inside the long run.',
    taper: 'Ten days of less. The fitness is already made.',
    'race-week': 'Easy runs, one short sharpener, then rest.',
    recovery: 'A week easy before you plan the next thing.',
  },
  triathlon: {
    base: 'Swim and run are covered; the bike is not modelled in this app yet, so log rides as notes.',
    build: 'Same caveat: the cycling third of this is not something the app can plan for you.',
    peak: 'Same caveat.',
    taper: 'Same caveat.',
    'race-week': 'Same caveat.',
    recovery: 'Same caveat.',
  },
  general: {
    base: 'Full-body strength, easy running, and the daily routines. No event, no periodisation.',
  },
}

export function weeksBetween(fromISO: string, now: number): { days: number; weeks: number } {
  // Between CALENDAR DAYS, not between instants. Measuring from "now" makes a
  // race 28 days away come out as 29 days and therefore 5 weeks, which puts you
  // in the wrong phase for a fortnight and tapers you a week late.
  const target = new Date(`${fromISO}T00:00:00`)
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)

  const days = Math.round((target.getTime() - midnight.getTime()) / DAY_MS)
  return { days, weeks: Math.ceil(days / 7) }
}

export function phaseFor(kind: GoalKind, weeks: number | undefined): TrainingPhase {
  if (weeks === undefined) return 'base'
  if (weeks < 0) return 'recovery'
  if (weeks === 0) return 'race-week'
  if (weeks <= TAPER_WEEKS[kind]) return 'taper'
  if (weeks <= PEAK_FROM_WEEKS) return 'peak'
  if (weeks <= BUILD_FROM_WEEKS) return 'build'
  return 'base'
}

export function goalStatus(goal: Goal, now = Date.now()): GoalStatus {
  if (!goal.date) {
    return {
      goal,
      phase: 'base',
      dated: false,
      focus:
        FOCUS[goal.kind].base ??
        'No date yet, so this is base training rather than a countdown.',
    }
  }

  const { days, weeks } = weeksBetween(goal.date, now)
  const phase = phaseFor(goal.kind, weeks)
  return {
    goal,
    daysToRace: days,
    weeksToRace: weeks,
    phase,
    dated: true,
    focus: FOCUS[goal.kind][phase] ?? FOCUS[goal.kind].base ?? '',
  }
}

/** Goals still ahead of you (or undated), soonest first. */
export function activeGoals(data: AppData, now = Date.now()): Goal[] {
  return (data.goals ?? [])
    .filter((g) => !g.archived)
    .filter((g) => !g.date || weeksBetween(g.date, now).days >= -14)
    .sort((a, b) => {
      if (a.date && b.date) return a.date.localeCompare(b.date)
      // A dated goal outranks an undated one: it is the one with a deadline.
      return a.date ? -1 : b.date ? 1 : 0
    })
}

/** The one the plan is actually built around. */
export function primaryGoal(data: AppData, now = Date.now()): Goal | undefined {
  return activeGoals(data, now)[0]
}

export interface GoalConflict {
  a: Goal
  b: Goal
  weeksApart: number
  message: string
}

/**
 * Two races close together, where training for one costs the other.
 *
 * Marathon and Hyrox is the specific case worth naming: a marathon build wants
 * high easy mileage and fresh legs, Hyrox wants strength endurance and running
 * on wrecked ones. Ten weeks apart is the threshold where you stop being able to
 * do both properly and start choosing.
 */
const CLASH_WEEKS = 10

export function goalConflicts(data: AppData, now = Date.now()): GoalConflict[] {
  const dated = activeGoals(data, now).filter((g) => g.date)
  const out: GoalConflict[] = []

  for (let i = 0; i < dated.length; i++) {
    for (let j = i + 1; j < dated.length; j++) {
      const a = dated[i]
      const b = dated[j]
      const apart = Math.abs(
        weeksBetween(a.date!, now).weeks - weeksBetween(b.date!, now).weeks,
      )
      if (apart > CLASH_WEEKS) continue
      if (a.kind === b.kind) continue

      out.push({
        a,
        b,
        weeksApart: apart,
        message:
          `${GOAL_LABEL[a.kind]} and ${GOAL_LABEL[b.kind]} are ${apart} week${apart === 1 ? '' : 's'} apart. ` +
          'Training both properly is not possible in that window — the earlier one gets the specific block ' +
          'and the later one gets whatever is left, so pick which race you actually care about.',
      })
    }
  }
  return out
}
