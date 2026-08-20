/**
 * The week.
 *
 * Today answers "what now"; this answers "what is this week for". It is the
 * spine every goal-driven feature needs: without a week there is no long run to
 * build towards, no deload to schedule and no taper to hit.
 *
 * Like everything else here it stores nothing. The week is DERIVED, every time,
 * from your weekly shape, the phase your goal puts you in, and what you have
 * already logged. A stored week would be wrong the first time you moved a
 * session, and you would have to maintain it by hand forever.
 */

import type { AppData, Goal, Program, WeeklyShape } from '../types'
import { goalStatus, primaryGoal, type TrainingPhase } from './goals'

const DAY_MS = 24 * 60 * 60 * 1000

export type DayItemKind = 'gym' | 'run' | 'swim' | 'sauna' | 'rest'

export interface PlannedItem {
  kind: DayItemKind
  label: string
  /** Why this is here today. Same contract as every other suggestion. */
  reason: string
  programId?: string
  dayTemplateId?: string
  /** Where this happens, when the kit says it has to be somewhere. */
  placeId?: string
}

export interface PlannedDay {
  date: string
  weekday: number
  items: PlannedItem[]
  /** What you actually did, from the logs. */
  done: { sessions: number; routines: number }
  isToday: boolean
  isPast: boolean
}

export interface WeekPlan {
  startDate: string
  days: PlannedDay[]
  phase: TrainingPhase
  goal?: Goal
  weeksToRace?: number
  deload: boolean
  /** One line naming what this week is. */
  headline: string
  /** What it is for, or what is missing before it can be more than a base week. */
  note: string
}

function isoLocal(t: number): string {
  const d = new Date(t)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

/** Monday of the week `now` falls in. */
function weekStart(now: number): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  const back = (d.getDay() + 6) % 7
  return d.getTime() - back * DAY_MS
}

/**
 * How the phase bends your normal week.
 *
 * Never invents days you did not ask for -- it only ever takes away, except in
 * a marathon build where the long run is the point and lifting gives way.
 */
function shapeForPhase(shape: WeeklyShape, phase: TrainingPhase, goal: Goal | undefined, deload: boolean): WeeklyShape {
  let gym = shape.gymDays
  let run = shape.runDays
  let swim = shape.swimDays

  if (goal?.kind === 'marathon' || goal?.kind === 'half-marathon') {
    // Lifting gives way to mileage as the race approaches. Both stacking is how
    // people arrive at a start line injured.
    if (phase === 'build') gym = Math.min(gym, 2)
    if (phase === 'peak') gym = Math.min(gym, 2)
    if (phase === 'taper') gym = Math.min(gym, 1)
  }
  if (goal?.kind === 'hyrox' && (phase === 'build' || phase === 'peak')) {
    // Hyrox needs the strength kept. It is half the race.
    gym = Math.max(gym, 3)
  }

  if (phase === 'taper') {
    run = Math.max(1, run - 1)
    swim = Math.max(0, swim - 1)
  }
  if (phase === 'race-week') {
    gym = 0
    run = Math.min(run, 2)
    swim = 0
  }
  if (phase === 'recovery') {
    gym = Math.min(gym, 1)
    run = Math.min(run, 1)
  }
  if (deload) {
    gym = Math.max(1, gym - 1)
    run = Math.max(1, run - 1)
  }

  return { ...shape, gymDays: gym, runDays: run, swimDays: swim }
}

/**
 * Which week of training this is, counted from your first logged session.
 *
 * No history means no deload: an app cannot tell you to take it easy before it
 * has watched you do anything.
 */
function deloadThisWeek(data: AppData, now: number): boolean {
  const every = data.settings.weeklyShape?.deloadEveryWeeks ?? 0
  if (every <= 0) return false

  const first = data.sessions
    .filter((s) => s.finishedAt)
    .map((s) => new Date(s.startedAt).getTime())
    .sort((a, b) => a - b)[0]
  if (first === undefined) return false

  const weeksIn = Math.floor((weekStart(now) - weekStart(first)) / (7 * DAY_MS))
  return weeksIn > 0 && (weeksIn + 1) % every === 0
}

/** The day of a program you have done least recently -- the same rule Today uses. */
function nextDayOf(program: Program, data: AppData): string | undefined {
  let oldest: { id: string; at: number } | null = null
  for (const day of program.days) {
    const last = data.sessions
      .filter((s) => s.dayTemplateId === day.id)
      .map((s) => new Date(s.startedAt).getTime())
      .sort((a, b) => b - a)[0]
    const at = last ?? 0
    if (!oldest || at < oldest.at) oldest = { id: day.id, at }
  }
  return oldest?.id
}

function findProgram(data: AppData, id: string): Program | undefined {
  return data.programs.find((p) => p.id === id && !p.archived)
}

export function planWeek(data: AppData, now = Date.now()): WeekPlan {
  const start = weekStart(now)
  const today = isoLocal(now)
  const goal = primaryGoal(data, now)
  const status = goal ? goalStatus(goal, now) : undefined
  const phase = status?.phase ?? 'base'
  const deload = deloadThisWeek(data, now)

  const base = data.settings.weeklyShape
  const shape = shapeForPhase(base, phase, goal, deload)

  // --- decide which weekday gets what -------------------------------------
  const longRunDay = ((base.longRunWeekday % 7) + 7) % 7
  const assignment = new Map<number, PlannedItem[]>()
  const put = (weekday: number, item: PlannedItem) => {
    const list = assignment.get(weekday) ?? []
    list.push(item)
    assignment.set(weekday, list)
  }

  const runProgram = findProgram(data, 'prog-run')
  const swimProgram = findProgram(data, 'prog-swim')
  const gymProgram =
    data.programs.find((p) => p.id === data.settings.activeProgramId && !p.archived) ??
    data.programs.find((p) => !p.archived && !['prog-swim', 'prog-run'].includes(p.id))

  // The long run first: everything else is placed around it.
  const taken = new Set<number>()
  if (shape.runDays > 0) {
    put(longRunDay, {
      kind: 'run',
      label: phase === 'taper' || phase === 'race-week' ? 'Easy run' : 'Long run',
      reason:
        phase === 'race-week'
          ? 'race week — this is a shakeout, not a session'
          : deload
            ? 'deload week, so it is shorter than usual'
            : 'the anchor of the week; everything else is placed around it',
      programId: runProgram?.id,
      dayTemplateId: runProgram ? nextDayOf(runProgram, data) : undefined,
      placeId: 'place-outdoors',
    })
    taken.add(longRunDay)
  }

  // Gym days SPREAD, not clustered. Sorting candidate days by distance from the
  // long run put three full-body sessions on Tue/Wed/Thu -- technically far from
  // Sunday, and three consecutive hard days. Even spacing is what a coach would
  // actually write.
  const dayAfterLongRun = (longRunDay + 1) % 7
  const gymCandidates = [1, 2, 3, 4, 5, 6, 0]
    .filter((d) => d !== longRunDay && d !== dayAfterLongRun)

  for (const day of spread(gymCandidates, shape.gymDays)) {
    put(day, {
      kind: 'gym',
      label: gymProgram?.name ?? 'Strength',
      reason:
        goal?.kind === 'hyrox' && (phase === 'build' || phase === 'peak')
          ? 'Hyrox is half strength — this stays at three days'
          : goal?.kind === 'marathon' && phase !== 'base'
            ? 'kept at maintenance so the long runs stay fresh'
            : 'full-body strength',
      programId: gymProgram?.id,
      dayTemplateId: gymProgram ? nextDayOf(gymProgram, data) : undefined,
      placeId: 'place-gym',
    })
    taken.add(day)
  }

  // Easy runs fill the gaps between gym days, which is what makes the week
  // alternate rather than block.
  const freeDays = [1, 2, 3, 4, 5, 6, 0].filter((d) => !taken.has(d))
  let free = 0
  for (let i = 1; i < shape.runDays && free < freeDays.length; i++) {
    const day = freeDays[free++]
    put(day, {
      kind: 'run',
      label: goal?.kind === 'hyrox' && phase !== 'base' ? 'Run + stations' : 'Easy run',
      reason:
        goal?.kind === 'hyrox' && phase !== 'base'
          ? 'compromised running: the race is running on tired legs'
          : 'easy pace, conversational — this is the mileage that does not hurt you',
      programId: runProgram?.id,
      dayTemplateId: runProgram ? nextDayOf(runProgram, data) : undefined,
      placeId: 'place-outdoors',
    })
    taken.add(day)
  }

  // A swim the day after the long run is the best recovery in the week, so it
  // gets that day when nothing else is free rather than being dropped.
  for (let i = 0; i < shape.swimDays; i++) {
    const day = free < freeDays.length ? freeDays[free++] : dayAfterLongRun
    put(day, {
      kind: 'swim',
      label: 'Swim',
      reason:
        day === dayAfterLongRun
          ? 'the day after the long run — aerobic work that costs the legs nothing'
          : 'aerobic work that costs the legs nothing',
      programId: swimProgram?.id,
      dayTemplateId: swimProgram ? nextDayOf(swimProgram, data) : undefined,
      placeId: 'place-pool',
    })
    taken.add(day)
  }

  // Sauna doubles up on an existing day when the week is full -- it is twenty
  // minutes of sitting still, not a session that needs its own slot.
  for (let i = 0; i < shape.saunaDays; i++) {
    const day = free < freeDays.length ? freeDays[free++] : dayAfterLongRun
    put(day, {
      kind: 'sauna',
      label: 'Sauna',
      reason: 'recovery — it costs nothing and you will actually do it',
    })
  }

  // --- build the seven days -----------------------------------------------
  const days: PlannedDay[] = []
  for (let i = 0; i < 7; i++) {
    const at = start + i * DAY_MS
    const date = isoLocal(at)
    const weekday = new Date(at).getDay()
    const items = assignment.get(weekday) ?? [
      { kind: 'rest' as const, label: 'Rest', reason: 'nothing scheduled — the routines still count' },
    ]

    days.push({
      date,
      weekday,
      items,
      done: {
        sessions: data.sessions.filter((s) => s.date === date && s.finishedAt).length,
        routines: data.routineLogs.filter((r) => r.date === date).length,
      },
      isToday: date === today,
      isPast: date < today,
    })
  }

  // --- what to call this week ----------------------------------------------
  const headline = deload
    ? 'Deload week'
    : status?.dated
      ? `${phase === 'race-week' ? 'Race week' : capitalise(phase)} · ${status.weeksToRace} week${status.weeksToRace === 1 ? '' : 's'} to ${status.goal.name}`
      : goal
        ? `Base week · ${goal.name} has no date yet`
        : 'Base week'

  const note = deload
    ? 'Every fourth week is easier on purpose. Same movements, less of them — this is where the adaptation actually lands.'
    : status
      ? status.focus
      : 'No goal set. This is general hybrid training: full-body strength, easy running, and the daily routines. ' +
        'Add a goal with a date and the weeks start counting towards it.'

  return {
    startDate: isoLocal(start),
    days,
    phase,
    goal,
    weeksToRace: status?.weeksToRace,
    deload,
    headline,
    note,
  }
}

/**
 * Pick `count` days from `candidates`, spaced as evenly as the list allows.
 * Three gym days out of five candidates should be first / middle / last, not
 * the first three.
 */
function spread(candidates: number[], count: number): number[] {
  if (count <= 0 || candidates.length === 0) return []
  if (count >= candidates.length) return [...candidates]

  const out: number[] = []
  const step = (candidates.length - 1) / (count - 1 || 1)
  for (let i = 0; i < count; i++) {
    out.push(candidates[Math.round(i * step)])
  }
  return [...new Set(out)]
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
