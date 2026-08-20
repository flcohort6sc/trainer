/**
 * The coach.
 *
 * Deterministic rules over what you have already logged. No AI, no network, no
 * guessing: every line it prints carries the number it was computed from, so
 * you can disagree with it from the evidence rather than from vibes. If a rule
 * cannot point at a number, it does not fire.
 *
 * The same honesty rule that governs the exercise library governs this file: an
 * empty history produces "nothing logged yet", never an invented observation.
 * A review that says something reassuring on day one would be worthless on day
 * ninety, because you would have no reason to believe it.
 *
 * Every threshold here is a judgement call, written as a named constant with
 * the reasoning next to it. They are meant to be argued with.
 */

import type { AppData, Exercise, MovementPattern, Muscle, Session } from '../types'
import { strengthHistory } from './progression'

const DAY_MS = 24 * 60 * 60 * 1000

/** The two windows the review reasons over: this week, and the last month. */
const WEEK_DAYS = 7
const MONTH_DAYS = 28

/**
 * How long a movement pattern can go untrained before it is worth mentioning.
 * Ten days is about a week and a half -- long enough that a normal rest day or
 * a missed session does not trigger it, short enough to catch the pattern you
 * have quietly stopped doing.
 */
const PATTERN_GAP_DAYS = 10

/** Sets on one side of push/pull before the imbalance is worth naming. */
const IMBALANCE_RATIO = 1.5

/** Sessions without beating your best before a lift counts as stalled. */
const STALL_SESSIONS = 3

/** Two flat numbers this close together are the same number. */
const FLAT_TOLERANCE = 0.01

export type InsightTone = 'good' | 'watch' | 'neutral'

export interface Insight {
  /** Stable across renders and recomputes: rule name plus its subject. */
  id: string
  tone: InsightTone
  /** One sentence stating the fact. Never a command. */
  headline: string
  /** The number it came from. This is the part that makes it arguable. */
  evidence: string
  /** What you might do about it. Absent when there is nothing sensible to say. */
  suggestion?: string
}

export interface GroupVolume {
  group: string
  last7: number
  last28: number
}

export interface WeeklyReview {
  sessions: number
  routines: number
  sets: number
  volumeByGroup: GroupVolume[]
  insights: Insight[]
  /** Nothing logged at all -- the review has no material to work with yet. */
  thin: boolean
}

/**
 * Patterns worth noticing the absence of.
 *
 * Deliberately not every pattern in the union. Nobody needs telling they have
 * not done a loaded carry in a fortnight, and a rule that fires constantly is
 * one you learn to ignore.
 */
const TRACKED_PATTERNS: { pattern: MovementPattern; label: string }[] = [
  { pattern: 'squat', label: 'squat' },
  { pattern: 'hinge', label: 'hinge' },
  { pattern: 'push-horizontal', label: 'horizontal push' },
  { pattern: 'push-vertical', label: 'vertical push' },
  { pattern: 'pull-horizontal', label: 'horizontal pull' },
  { pattern: 'pull-vertical', label: 'vertical pull' },
]

const PUSH_PATTERNS: MovementPattern[] = ['push-horizontal', 'push-vertical']
const PULL_PATTERNS: MovementPattern[] = ['pull-horizontal', 'pull-vertical']

/**
 * Muscles collected into the four groups people actually think in.
 * Only PRIMARY muscles are counted -- a set of rows is a back set, not two
 * thirds of a bicep set, and splitting hairs over secondaries would make the
 * numbers impossible to check by hand.
 */
const MUSCLE_GROUPS: { group: string; muscles: Muscle[] }[] = [
  { group: 'Legs', muscles: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
  { group: 'Push', muscles: ['chest', 'front-delts', 'side-delts', 'triceps'] },
  { group: 'Pull', muscles: ['lats', 'upper-back', 'rear-delts', 'traps', 'biceps', 'forearms'] },
  { group: 'Core', muscles: ['abs', 'obliques', 'lower-back', 'hip-flexors'] },
]

function isoDate(at: number): string {
  return new Date(at).toISOString().slice(0, 10)
}

function completedSets(session: Session): number {
  return session.entries.reduce((n, e) => n + e.sets.filter((s) => s.completed).length, 0)
}

/**
 * Consecutive days ending today -- or yesterday, if today is still young -- on
 * which at least one routine was completed.
 *
 * Counting from yesterday matters: otherwise the streak reads 0 every morning
 * until you have stretched, which is precisely when you most need to see it.
 * Lives here rather than in a view because both Today and the review need it.
 */
export function routineStreak(logs: { date: string }[], now = Date.now()): number {
  const days = new Set(logs.map((l) => l.date))
  if (days.size === 0) return 0

  const dayString = (offset: number) => isoDate(now - offset * DAY_MS)

  let start = days.has(dayString(0)) ? 0 : days.has(dayString(1)) ? 1 : -1
  if (start === -1) return 0

  let count = 0
  while (days.has(dayString(start))) {
    count++
    start++
  }
  return count
}

/** Sets per muscle group inside a window, primary muscles only. */
function volumeByGroup(sessions: Session[], byId: Map<string, Exercise>, now: number): GroupVolume[] {
  const count = (windowDays: number) => {
    const totals = new Map<string, number>()
    for (const session of sessions) {
      const ageDays = (now - new Date(session.startedAt).getTime()) / DAY_MS
      if (ageDays < 0 || ageDays > windowDays) continue

      for (const entry of session.entries) {
        const exercise = byId.get(entry.exerciseId)
        if (!exercise) continue
        const sets = entry.sets.filter((s) => s.completed).length
        if (sets === 0) continue

        // A set lands once in each group the exercise primarily trains, so a
        // deadlift counts for legs and for pull rather than being split in two.
        const groups = new Set(
          MUSCLE_GROUPS
            .filter((g) => exercise.primaryMuscles.some((m) => g.muscles.includes(m)))
            .map((g) => g.group),
        )
        for (const g of groups) totals.set(g, (totals.get(g) ?? 0) + sets)
      }
    }
    return totals
  }

  const week = count(WEEK_DAYS)
  const month = count(MONTH_DAYS)
  return MUSCLE_GROUPS.map((g) => ({
    group: g.group,
    last7: week.get(g.group) ?? 0,
    last28: month.get(g.group) ?? 0,
  }))
}

/** Completed sets by movement pattern inside a window. */
function setsByPattern(
  sessions: Session[],
  byId: Map<string, Exercise>,
  patterns: MovementPattern[],
  windowDays: number,
  now: number,
): number {
  let total = 0
  for (const session of sessions) {
    const ageDays = (now - new Date(session.startedAt).getTime()) / DAY_MS
    if (ageDays < 0 || ageDays > windowDays) continue
    for (const entry of session.entries) {
      const exercise = byId.get(entry.exerciseId)
      if (!exercise || !patterns.includes(exercise.pattern)) continue
      total += entry.sets.filter((s) => s.completed).length
    }
  }
  return total
}

/** The most recent session containing any exercise of this pattern. */
function lastTrained(
  sessions: Session[],
  byId: Map<string, Exercise>,
  pattern: MovementPattern,
): { at: number; exerciseName: string } | null {
  let best: { at: number; exerciseName: string } | null = null
  for (const session of sessions) {
    for (const entry of session.entries) {
      const exercise = byId.get(entry.exerciseId)
      if (!exercise || exercise.pattern !== pattern) continue
      if (entry.sets.every((s) => !s.completed)) continue
      const at = new Date(session.startedAt).getTime()
      if (!best || at > best.at) best = { at, exerciseName: exercise.name }
    }
  }
  return best
}

// ---------------------------------------------------------------- the rules

/** "No hinge in 11 days." Only ever fires for a pattern you have actually trained. */
function patternGaps(sessions: Session[], byId: Map<string, Exercise>, now: number): Insight[] {
  const found: { days: number; insight: Insight }[] = []
  for (const { pattern, label } of TRACKED_PATTERNS) {
    const last = lastTrained(sessions, byId, pattern)
    // Never trained it at all? That is a choice, not a lapse. Say nothing.
    if (!last) continue

    const days = Math.floor((now - last.at) / DAY_MS)
    if (days < PATTERN_GAP_DAYS) continue

    found.push({
      days,
      insight: {
        id: `gap-${pattern}`,
        tone: 'watch',
        headline: `No ${label} in ${days} days.`,
        evidence: `last one was ${last.exerciseName} on ${isoDate(last.at)}`,
        suggestion: `Any ${label} slot picks one up on its own — generate a day that has one.`,
      },
    })
  }
  // Longest gap first: if several fired, that is the one worth reading. Two is
  // the cap, because six of these at once is a wall, not a review.
  return found.sort((a, b) => b.days - a.days).slice(0, 2).map((f) => f.insight)
}

/** Push and pull sets over the month, when one side has run away from the other. */
function pushPullBalance(sessions: Session[], byId: Map<string, Exercise>, now: number): Insight | null {
  const push = setsByPattern(sessions, byId, PUSH_PATTERNS, MONTH_DAYS, now)
  const pull = setsByPattern(sessions, byId, PULL_PATTERNS, MONTH_DAYS, now)
  if (push === 0 && pull === 0) return null

  const heavy = push >= pull ? 'pushing' : 'pulling'
  const light = push >= pull ? 'pulling' : 'pushing'
  const hi = Math.max(push, pull)
  const lo = Math.min(push, pull)

  // A zero on one side is the strongest version of this, and dividing by it
  // would not survive contact with arithmetic.
  if (lo > 0 && hi < lo * IMBALANCE_RATIO) return null

  return {
    id: 'balance-push-pull',
    tone: 'watch',
    headline: `You are doing ${(hi / Math.max(lo, 1)).toFixed(1)}× more ${heavy} than ${light}.`,
    evidence: `${push} pushing and ${pull} pulling sets in ${MONTH_DAYS} days`,
    suggestion: `Nothing in the generator balances this for you — it fills the slots your program asks for.`,
  }
}

/** A lift that has not moved in three sessions. */
function stalledLifts(data: AppData, finished: Session[]): Insight[] {
  const out: Insight[] = []

  for (const exercise of data.exercises) {
    const history = strengthHistory(exercise.id, finished)
    if (history.length < STALL_SESSIONS) continue

    const last = history.slice(-STALL_SESSIONS)
    const earlier = history.slice(0, -STALL_SESSIONS)
    const bestLast = Math.max(...last.map((h) => h.e1rm))
    const numbers = last.map((h) => h.e1rm.toFixed(1)).join(' → ')

    if (earlier.length > 0) {
      const bestEarlier = Math.max(...earlier.map((h) => h.e1rm))
      if (bestLast > bestEarlier * (1 + FLAT_TOLERANCE)) continue
      out.push({
        id: `stall-${exercise.id}`,
        tone: 'watch',
        headline: `${exercise.name} has not beaten its best in ${STALL_SESSIONS} sessions.`,
        evidence: `best ${bestEarlier.toFixed(1)} on ${earlier[earlier.length - 1].date}; since then ${numbers}`,
        suggestion: 'Double progression says drop the weight a step and rebuild, or rotate to a variation for a few weeks.',
      })
    } else {
      // Exactly three sessions and all of them the same number.
      const spread = bestLast - Math.min(...last.map((h) => h.e1rm))
      if (spread > bestLast * FLAT_TOLERANCE) continue
      out.push({
        id: `stall-${exercise.id}`,
        tone: 'watch',
        headline: `${exercise.name} has been the same for ${STALL_SESSIONS} sessions.`,
        evidence: `estimated 1RM ${numbers}`,
        suggestion: 'Add a rep before you add weight — double progression only moves once every set hits the top of the range.',
      })
    }
  }

  return out.slice(0, 2)
}

/** The routine streak: alive and worth protecting, or recently broken. */
function streakInsight(data: AppData, now: number): Insight | null {
  const logs = data.routineLogs
  if (logs.length === 0) return null

  const streak = routineStreak(logs, now)
  if (streak >= 3) {
    return {
      id: 'streak-alive',
      tone: 'good',
      headline: `${streak} days of routines in a row.`,
      evidence: `unbroken since ${isoDate(now - (streak - 1) * DAY_MS)}`,
    }
  }
  if (streak > 0) return null

  // Broken: find the run that ended, and when.
  const days = [...new Set(logs.map((l) => l.date))].sort()
  const lastDay = days[days.length - 1]
  const daysSince = Math.floor((now - new Date(`${lastDay}T12:00:00Z`).getTime()) / DAY_MS)
  if (daysSince > WEEK_DAYS) return null

  let run = 0
  const cursor = new Date(`${lastDay}T12:00:00Z`).getTime()
  while (days.includes(isoDate(cursor - run * DAY_MS))) run++
  if (run < 3) return null

  return {
    id: 'streak-broken',
    tone: 'watch',
    headline: `Your routine streak stopped at ${run} days.`,
    evidence: `last one was ${lastDay}, ${daysSince} days ago`,
    suggestion: 'Today has the morning and evening routines one tap away.',
  }
}

/** How the sessions have been feeling, when you have rated enough of them. */
function ratingTrend(finished: Session[]): Insight | null {
  const rated = finished
    .filter((s) => s.rating !== undefined)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
  if (rated.length < 3) return null

  const mean = (xs: Session[]) => xs.reduce((sum, s) => sum + (s.rating ?? 0), 0) / xs.length
  const recent = rated.slice(-3)
  const recentMean = mean(recent)
  const before = rated.slice(-6, -3)

  if (before.length === 3) {
    const beforeMean = mean(before)
    if (recentMean <= beforeMean - 0.7) {
      return {
        id: 'rating-down',
        tone: 'watch',
        headline: 'Your last three sessions felt worse than the three before them.',
        evidence: `${recentMean.toFixed(1)}/5, down from ${beforeMean.toFixed(1)}/5`,
        suggestion: 'Often sleep or food rather than programming. If it holds for another week, take a lighter one.',
      }
    }
    return null
  }

  if (recentMean <= 2.5) {
    return {
      id: 'rating-low',
      tone: 'watch',
      headline: 'The last three sessions have not felt good.',
      evidence: `averaging ${recentMean.toFixed(1)}/5`,
      suggestion: 'Worth a lighter week if it continues.',
    }
  }
  return null
}

// ---------------------------------------------------------------- the review

const TONE_ORDER: Record<InsightTone, number> = { watch: 0, good: 1, neutral: 2 }

/**
 * Everything above, run over your history and sorted so the things worth
 * acting on come first. `now` is injectable so the rules can be tested against
 * a fixed clock rather than against whatever today happens to be.
 */
export function weeklyReview(data: AppData, now = Date.now()): WeeklyReview {
  const finished = data.sessions.filter((s) => s.finishedAt)
  const byId = new Map(data.exercises.map((e) => [e.id, e]))

  const inWeek = (at: string) => {
    const ageDays = (now - new Date(at).getTime()) / DAY_MS
    return ageDays >= 0 && ageDays <= WEEK_DAYS
  }

  const sessionsThisWeek = finished.filter((s) => inWeek(s.startedAt))
  const routinesThisWeek = data.routineLogs.filter((r) => inWeek(r.startedAt))

  const base = {
    sessions: sessionsThisWeek.length,
    routines: routinesThisWeek.length,
    sets: sessionsThisWeek.reduce((n, s) => n + completedSets(s), 0),
    volumeByGroup: volumeByGroup(finished, byId, now),
  }

  // Nothing to read. Say exactly that -- an encouraging sentence invented out
  // of no data is the thing this project refuses to do everywhere else.
  if (finished.length === 0 && data.routineLogs.length === 0) {
    return {
      ...base,
      thin: true,
      insights: [{
        id: 'nothing-logged',
        tone: 'neutral',
        headline: 'Nothing logged yet.',
        evidence: '0 sessions, 0 routines',
        suggestion: 'Every rule here reads your own history. Finish a session or a routine and this fills in.',
      }],
    }
  }

  const insights = [
    ...patternGaps(finished, byId, now),
    ...stalledLifts(data, finished),
    pushPullBalance(finished, byId, now),
    streakInsight(data, now),
    ratingTrend(finished),
  ]
    .filter((i): i is Insight => i !== null)
    .sort((a, b) => TONE_ORDER[a.tone] - TONE_ORDER[b.tone])
    .slice(0, 6)

  if (insights.length === 0) {
    insights.push({
      id: 'all-clear',
      tone: 'good',
      headline: 'Nothing to flag.',
      evidence: `${base.sessions} sessions and ${base.routines} routines in the last ${WEEK_DAYS} days`,
    })
  }

  return { ...base, insights, thin: false }
}
