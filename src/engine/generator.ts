/**
 * The workout generator.
 *
 * Given a day template (a list of slots) and your history, produce a concrete
 * session. The algorithm per slot is:
 *
 *   1. FILTER  -> which exercises could legally fill this slot today?
 *   2. SCORE   -> how good a choice is each one right now?
 *   3. PICK    -> weighted-random from the top handful, so it is not identical
 *                 every single week but also not chaotic.
 *
 * Step 2 is where "adaptive" actually lives. An exercise scores well when you
 * have not done it recently and the muscles it hits are recovered. It scores
 * badly when you hammered those muscles two days ago.
 */

import type {
  AppData, DayTemplate, Equipment, Exercise, LoggedExercise, MovementPattern,
  Muscle, Session, Slot, SlotRole,
} from '../types'
import { uid } from '../storage/repository'
import { niggleFilter } from './niggles'
import { suggestLoad } from './progression'

/**
 * The subset of a Slot that filtering actually reads. RoutineStep satisfies
 * this too, which is why routines get the whole filter for free.
 */
export interface SlotFilter {
  patterns: MovementPattern[]
  /** Present on a Slot, absent on a RoutineStep — routines are never metres. */
  distanceRange?: [number, number]
  requireMuscles?: Muscle[]
  requireTags?: string[]
  excludeEquipment?: Equipment[]
  maxDifficulty?: 1 | 2 | 3
}

export interface GeneratedEntry {
  slot: Slot
  exercise: Exercise
  /** Why this exercise was chosen -- surfaced in the UI so it is not a black box. */
  reason: string
  suggestedWeight?: number
  /** Other exercises that could have filled this slot, best first. */
  alternatives: Exercise[]
}

export interface GenerationResult {
  entries: GeneratedEntry[]
  /** Slots that could not be filled, with an explanation. */
  unfilled: { slot: Slot; reason: string }[]
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Scores this close together are treated as equal and broken at random. */
const TIE_EPSILON = 0.02

/**
 * How long you run one lift before swapping it out.
 *
 * Familiarity alone would freeze a primary slot forever -- great for adding
 * weight, useless for the "changing exercises" this app exists to provide.
 * Real programs resolve this with blocks: run a lift for a few weeks, progress
 * it, then rotate to a variation and come back later. Past BLOCK_LENGTH recent
 * sessions, an exercise accrues a penalty that eventually overrides its
 * familiarity advantage and forces the swap.
 */
const BLOCK_LENGTH = 3
const BLOCK_PENALTY_PER_USE = 0.35
const RECENT_WINDOW = 8

/**
 * History, and the one asymmetry in this engine.
 *
 * Routines log separately from sessions (see RoutineLog), but the generator
 * still has to know about them or the evening wind-down will cheerfully serve
 * the hip drill you already did at 7am. So:
 *
 *   - "when did I last do this" spans BOTH sources. Recency is recency.
 *   - "have I run this too many blocks in a row" counts only activities of the
 *     SAME KIND. A squat's block length is measured in gym sessions; a
 *     stretch's is measured in routines. Mixing them would rotate your primary
 *     lifts out after four days just because you stretch twice a day.
 *   - muscle fatigue reads sessions ONLY. Sitting and breathing is not
 *     training your abs, and pretending otherwise would block real work.
 *
 * If you are tempted to "fix" this into one uniform history, that is the bug.
 */
interface Activity {
  at: number
  exerciseIds: string[]
}

function sessionActivities(data: AppData): Activity[] {
  return data.sessions.map((s) => ({
    at: new Date(s.startedAt).getTime(),
    exerciseIds: s.entries.map((e) => e.exerciseId),
  }))
}

function routineActivities(data: AppData): Activity[] {
  return data.routineLogs.map((r) => ({
    at: new Date(r.startedAt).getTime(),
    // Only what you actually completed counts -- skipping a drill should not
    // make the engine think you have "done it recently".
    exerciseIds: r.completedExerciseIds,
  }))
}

export interface UsageIndex {
  /** Days since you last did this, from any source. Infinity if never. */
  daysSince: (exerciseId: string) => number
  /** How many of the last RECENT_WINDOW same-kind activities included it. */
  recentUses: (exerciseId: string) => number
  /** Lifetime count, from any source. */
  performances: (exerciseId: string) => number
}

export function buildUsageIndex(data: AppData, context: 'session' | 'routine'): UsageIndex {
  const all = [...sessionActivities(data), ...routineActivities(data)]
  const sameKind = (context === 'routine' ? routineActivities(data) : sessionActivities(data))
    .sort((a, b) => b.at - a.at)
    .slice(0, RECENT_WINDOW)

  const lastSeen = new Map<string, number>()
  const totals = new Map<string, number>()
  for (const a of all) {
    for (const id of new Set(a.exerciseIds)) {
      lastSeen.set(id, Math.max(lastSeen.get(id) ?? -Infinity, a.at))
      totals.set(id, (totals.get(id) ?? 0) + 1)
    }
  }

  const recent = new Map<string, number>()
  for (const a of sameKind) {
    for (const id of new Set(a.exerciseIds)) {
      recent.set(id, (recent.get(id) ?? 0) + 1)
    }
  }

  const now = Date.now()
  return {
    daysSince: (id) => {
      const at = lastSeen.get(id)
      return at === undefined ? Infinity : (now - at) / DAY_MS
    },
    recentUses: (id) => recent.get(id) ?? 0,
    performances: (id) => totals.get(id) ?? 0,
  }
}

/**
 * Rough per-muscle fatigue score from recent sessions.
 * A set counts full for a primary muscle, half for a secondary, and decays
 * linearly over `windowDays`. This is a heuristic, not sports science -- but
 * it is enough to stop the generator giving you squats the day after squats.
 */
function muscleFatigue(
  sessions: Session[],
  exercises: Exercise[],
  windowDays: number,
): Record<string, number> {
  const byId = new Map(exercises.map((e) => [e.id, e]))
  const fatigue: Record<string, number> = {}
  const now = Date.now()

  for (const session of sessions) {
    const ageDays = (now - new Date(session.startedAt).getTime()) / DAY_MS
    if (ageDays > windowDays || ageDays < 0) continue

    // Fresh sessions weigh most; a session `windowDays` old contributes ~0.
    const recencyWeight = 1 - ageDays / windowDays

    for (const entry of session.entries) {
      const exercise = byId.get(entry.exerciseId)
      if (!exercise) continue
      const workingSets = entry.sets.filter((s) => s.completed).length
      if (workingSets === 0) continue

      for (const m of exercise.primaryMuscles) {
        fatigue[m] = (fatigue[m] ?? 0) + workingSets * recencyWeight
      }
      for (const m of exercise.secondaryMuscles) {
        fatigue[m] = (fatigue[m] ?? 0) + workingSets * recencyWeight * 0.5
      }
    }
  }
  return fatigue
}

/** Step 1: which exercises can legally fill this slot today? */
export function eligibleFor(
  slot: SlotFilter,
  data: AppData,
  alreadyUsed: Set<string>,
): { pool: Exercise[]; blockReason?: string } {
  const available = new Set(data.settings.availableEquipment)
  const maxDiff = Math.min(slot.maxDifficulty ?? 3, data.settings.maxDifficulty)

  // 'unwatched' entries are reel placeholders: we know the topic but not the
  // movement, because that only exists on video. They are real library rows so
  // the backlog is visible and countable, but serving one in a workout would be
  // handing you an exercise nobody has actually named yet.
  let pool = data.exercises.filter((e) => !e.archived && e.status !== 'unwatched')
  if (pool.length === 0) return { pool: [], blockReason: 'your library is empty' }

  pool = pool.filter((e) => slot.patterns.includes(e.pattern))
  if (pool.length === 0) {
    return { pool: [], blockReason: `no exercises tagged ${slot.patterns.join(' or ')}` }
  }

  pool = pool.filter((e) => e.equipment.every((q) => available.has(q)))
  if (pool.length === 0) {
    return { pool: [], blockReason: 'nothing matches your available equipment' }
  }

  // Something is sore. This is a blunt filter you switched on yourself, so when
  // it empties a slot the reason names it rather than shrugging.
  const sore = niggleFilter(data.settings.niggles)
  if (sore.active) {
    pool = pool.filter((e) => !sore.blocks(e))
    if (pool.length === 0) {
      return { pool: [], blockReason: `everything here is on hold while ${sore.describe()} is sore` }
    }
  }

  /*
   * A slot that prescribes a distance can only be filled by something measured
   * in distance.
   *
   * Sculling was logged in seconds and sat in the swim pool, so "Drill A: 4 x
   * 50m" could hand you an exercise whose logger asked for seconds. The card
   * and the logger disagreed about what you were even doing.
   */
  if (slot.distanceRange) {
    pool = pool.filter((e) => e.loadType === 'distance' || e.loadType === 'distance-time')
    if (pool.length === 0) {
      return { pool: [], blockReason: 'nothing here is measured in distance' }
    }
  }

  pool = pool.filter((e) => e.difficulty <= maxDiff)
  if (pool.length === 0) return { pool: [], blockReason: 'everything available is above your difficulty cap' }

  if (slot.requireMuscles?.length) {
    const req = new Set<Muscle>(slot.requireMuscles)
    pool = pool.filter((e) => e.primaryMuscles.some((m) => req.has(m)))
    if (pool.length === 0) return { pool: [], blockReason: 'no exercise hits the required muscles' }
  }

  if (slot.requireTags?.length) {
    const req = new Set(slot.requireTags)
    pool = pool.filter((e) => e.tags.some((t) => req.has(t)))
    if (pool.length === 0) {
      return { pool: [], blockReason: `nothing tagged ${slot.requireTags.join(' or ')}` }
    }
  }

  if (slot.excludeEquipment?.length) {
    const banned = new Set(slot.excludeEquipment)
    pool = pool.filter((e) => !e.equipment.some((q) => banned.has(q)))
    if (pool.length === 0) return { pool: [], blockReason: 'excluded equipment removed every option' }
  }

  // Never give the same exercise twice in one session.
  const deduped = pool.filter((e) => !alreadyUsed.has(e.id))
  if (deduped.length === 0) {
    return { pool: [], blockReason: 'the only options are already in this session' }
  }

  return { pool: deduped }
}

export interface Scored {
  exercise: Exercise
  score: number
  reason: string
}

/**
 * Not every slot should rotate equally hard.
 *
 * A heavy primary lift needs to RECUR, or you can never add weight to it --
 * progression requires repetition. An accessory is the opposite: nothing is
 * lost by swapping a lateral raise for a cable raise, and the variety is the
 * point. So the user's global variety setting gets scaled down for the slots
 * where consistency actually matters.
 */
const ROLE_VARIETY_SCALE: Record<SlotRole, number> = {
  primary: 0.3,
  secondary: 0.65,
  accessory: 1,
  finisher: 1,
  warmup: 1,
}

/** Step 2: score the pool. Higher is a better pick right now. */
export function scorePool(
  pool: Exercise[],
  data: AppData,
  fatigue: Record<string, number>,
  role: SlotRole,
  usage: UsageIndex,
): Scored[] {
  const { rotationWindowDays } = data.settings
  const varietyBias = data.settings.varietyBias * ROLE_VARIETY_SCALE[role]

  return pool
    .map((exercise) => {
      const reasons: string[] = []

      // --- Freshness: reward exercises you have not done lately. ---
      const days = usage.daysSince(exercise.id)
      let freshness: number
      if (days === Infinity) {
        freshness = 1
        reasons.push('you have never logged it')
      } else {
        freshness = Math.min(days / rotationWindowDays, 1)
        if (days < 1) reasons.push('done today')
        else if (days < 4) reasons.push(`done ${Math.round(days)}d ago`)
        else if (days > rotationWindowDays) reasons.push(`not trained in ${Math.round(days)}d`)
      }

      // --- Recovery: penalise exercises whose primary muscles are cooked. ---
      const load = exercise.primaryMuscles.reduce((sum, m) => sum + (fatigue[m] ?? 0), 0)
      const perMuscle = load / Math.max(exercise.primaryMuscles.length, 1)
      // 8+ recent weighted sets on a muscle is "heavily worked".
      const recovery = 1 - Math.min(perMuscle / 8, 1)
      if (recovery < 0.4) reasons.push('those muscles are still fatigued')
      else if (recovery > 0.85 && days !== Infinity) reasons.push('well recovered')

      // --- Familiarity: reward lifts you have an established history with. ---
      // Freshness alone always favours whatever you have NOT done, which is
      // exactly wrong for a heavy primary -- you cannot add 2.5kg to a lift you
      // never repeat. This term is the counterweight, and it dominates precisely
      // where variety has been scaled down.
      const timesDone = usage.performances(exercise.id)
      const familiarity = Math.min(timesDone / 5, 1)
      if (familiarity >= 0.6 && varietyBias < 0.3) reasons.push('an established lift for you')

      // --- Loadability: a heavy primary slot wants something you can add
      // weight to. A bodyweight squat cannot be progressed 2.5kg at a time, so
      // it makes a poor "4x5-8 heavy" lift. This is a penalty rather than a
      // filter on purpose -- when you are in a hotel room with no equipment,
      // a bodyweight squat really is the best available answer.
      let loadPenalty = 0
      if (role === 'primary' && (exercise.loadType === 'reps' || exercise.loadType === 'time')) {
        loadPenalty = 0.3
      }

      // --- Block fatigue: you have run this one long enough. ---
      const uses = usage.recentUses(exercise.id)
      const blockPenalty = Math.max(0, uses - BLOCK_LENGTH) * BLOCK_PENALTY_PER_USE
      if (blockPenalty > 0) reasons.push(`${uses} recent sessions — due for a change`)

      // --- Blend. ---
      const score =
        freshness * varietyBias +
        familiarity * (1 - varietyBias) * 0.5 +
        recovery * (1 - varietyBias * 0.5) -
        blockPenalty -
        loadPenalty

      return {
        exercise,
        score,
        reason: reasons.length ? reasons.join(', ') : 'good fit for this slot',
      }
    })
    .sort((a, b) => b.score - a.score)
}

/**
 * Step 3: pick. Weighted random over the top candidates rather than always
 * taking the best -- otherwise the "adaptive" program is perfectly predictable.
 */
export function pick(scored: Scored[], rotation: Slot['rotation'], deterministic = false): Scored {
  /*
   * Deterministic mode: take the top score and stop.
   *
   * The randomness below is what stops an adaptive program being perfectly
   * predictable, and predictability is exactly what some people want. With
   * this on, Generate becomes a pure function of your history -- same inputs,
   * same session -- which is the difference between a tool you direct and one
   * that surprises you.
   */
  if (deterministic) return scored[0]

  if (rotation === 'rotate') {
    // The freshest option wins -- but "freshest" is usually a tie. Anything you
    // have not touched in longer than the rotation window scores identically at
    // 1.0, so taking scored[0] would hand the slot to whichever exercise happens
    // to sit first in the library, forever. Break ties at random instead: that
    // is the difference between a program that rotates and one that only looks
    // like it does.
    const best = scored[0].score
    const tied = scored.filter((s) => best - s.score < TIE_EPSILON)
    return tied[Math.floor(Math.random() * tied.length)]
  }

  const topN = rotation === 'random' ? Math.min(scored.length, 6) : Math.min(scored.length, 3)
  const candidates = scored.slice(0, topN)
  const total = candidates.reduce((sum, c) => sum + Math.max(c.score, 0.01), 0)

  let roll = Math.random() * total
  for (const c of candidates) {
    roll -= Math.max(c.score, 0.01)
    if (roll <= 0) return c
  }
  return candidates[0]
}

export function generateSession(
  day: DayTemplate,
  data: AppData,
): GenerationResult {
  const fatigue = muscleFatigue(data.sessions, data.exercises, data.settings.rotationWindowDays)
  const usage = buildUsageIndex(data, 'session')
  const used = new Set<string>()
  const entries: GeneratedEntry[] = []
  const unfilled: GenerationResult['unfilled'] = []

  for (const slot of day.slots) {
    // A pinned slot short-circuits everything -- that is the point of pinning.
    if (slot.rotation === 'fixed' && slot.pinnedExerciseId) {
      const pinned = data.exercises.find((e) => e.id === slot.pinnedExerciseId && !e.archived)
      if (pinned) {
        used.add(pinned.id)
        entries.push({
          slot,
          exercise: pinned,
          reason: 'pinned to this slot',
          suggestedWeight: suggestLoad(pinned, slot, data).weight,
          alternatives: [],
        })
        continue
      }
      // Pinned exercise was deleted -- fall through and pick a replacement.
    }

    const { pool, blockReason } = eligibleFor(slot, data, used)
    if (pool.length === 0) {
      unfilled.push({ slot, reason: blockReason ?? 'no eligible exercise' })
      continue
    }

    const scored = scorePool(pool, data, fatigue, slot.role, usage)
    const chosen = pick(scored, slot.rotation, data.settings.pickBest)
    used.add(chosen.exercise.id)

    entries.push({
      slot,
      exercise: chosen.exercise,
      reason: chosen.reason,
      suggestedWeight: suggestLoad(chosen.exercise, slot, data).weight,
      alternatives: scored
        .filter((s) => s.exercise.id !== chosen.exercise.id)
        .slice(0, 8)
        .map((s) => s.exercise),
    })
  }

  return { entries, unfilled }
}

/** Re-roll a single slot without regenerating the whole session. */
export function rerollSlot(
  slot: Slot,
  data: AppData,
  currentSessionExerciseIds: string[],
  excludeId?: string,
): GeneratedEntry | null {
  const fatigue = muscleFatigue(data.sessions, data.exercises, data.settings.rotationWindowDays)
  const usage = buildUsageIndex(data, 'session')
  const used = new Set(currentSessionExerciseIds)
  if (excludeId) used.add(excludeId)

  const { pool } = eligibleFor(slot, data, used)
  if (pool.length === 0) return null

  const scored = scorePool(pool, data, fatigue, slot.role, usage)
  const chosen = pick(scored, slot.rotation === 'fixed' ? 'random' : slot.rotation)

  return {
    slot,
    exercise: chosen.exercise,
    reason: chosen.reason,
    suggestedWeight: suggestLoad(chosen.exercise, slot, data).weight,
    alternatives: scored
      .filter((s) => s.exercise.id !== chosen.exercise.id)
      .slice(0, 8)
      .map((s) => s.exercise),
  }
}

/** Turn a generated plan into a live, loggable session. */
export function toSession(
  day: DayTemplate,
  programId: string | undefined,
  result: GenerationResult,
): Session {
  const entries: LoggedExercise[] = result.entries.map((g) => ({
    exerciseId: g.exercise.id,
    slotId: g.slot.id,
    prescribed: {
      sets: g.slot.sets,
      repRange: g.slot.repRange,
      weight: g.suggestedWeight,
      distance: g.slot.distanceRange?.[0],
    },
    // Pre-filling the distance matters: a swim set is "50m in whatever time you
    // manage", so the metres are the prescription and only the clock is unknown.
    sets: Array.from({ length: g.slot.sets }, () => ({
      weight: g.suggestedWeight,
      reps: undefined,
      distance: g.slot.distanceRange?.[0],
      completed: false,
    })),
  }))

  const now = new Date()
  return {
    id: uid('sess-'),
    date: now.toISOString().slice(0, 10),
    programId,
    dayTemplateId: day.id,
    name: day.name,
    entries,
    startedAt: now.toISOString(),
  }
}
