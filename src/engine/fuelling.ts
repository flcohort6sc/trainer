/**
 * Fuelling, attached to the session that needs it.
 *
 * The numbers here are the ranges that mainstream sports-nutrition guidance
 * converges on for endurance work. They are population ranges, not a
 * prescription for you: gut tolerance varies enormously, and the only way to
 * find yours is to practise in training rather than discover it at kilometre 30.
 * The app says that everywhere it says a number.
 *
 * The honesty rule that governs the rest of this codebase applies here too. Any
 * advice that depends on your bodyweight needs your bodyweight — if you have
 * never logged one, this returns the guidance WITHOUT the personalised number
 * rather than inventing a plausible 75kg athlete.
 */

import type { AppData } from '../types'

/** Below this, a session is fuelled by what you already ate today. */
const NO_FUEL_MINUTES = 60
const MODERATE_MINUTES = 90
const LONG_MINUTES = 150

export interface Fuelling {
  /** False when the honest answer is "you do not need to think about this". */
  needed: boolean
  carbsPerHour?: [number, number]
  before?: string
  during?: string
  after?: string
  /** Why this session gets this answer. */
  why: string
  /** What the numbers rest on, so you can disagree with them. */
  basis: string
}

/** Most recent logged bodyweight, or undefined. Never guessed. */
export function latestBodyweight(data: AppData): number | undefined {
  return [...data.metrics]
    .filter((m) => m.weight !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight
}

/**
 * Protein for the day.
 *
 * 1.6–2.2 g per kg of bodyweight is the range the evidence keeps landing on for
 * people training hard; past roughly 2.2 the extra does nothing measurable for
 * muscle. Without a logged bodyweight the range is still true, it just cannot be
 * turned into a number, and saying so beats assuming one.
 */
export function dailyProtein(data: AppData): { low?: number; high?: number; text: string } {
  const kg = latestBodyweight(data)
  if (kg === undefined) {
    return {
      text:
        '1.6–2.2 g of protein per kg of bodyweight per day. Log a bodyweight in Progress and this ' +
        'becomes an actual number instead of a formula.',
    }
  }
  const low = Math.round(kg * 1.6)
  const high = Math.round(kg * 2.2)
  return {
    low,
    high,
    text:
      `${low}–${high} g of protein a day, from your logged ${kg}kg. Spread across 3–4 meals ` +
      'rather than stacked into one, and the top of that range matters more in a hard block than an easy one.',
  }
}

export function fuellingFor(minutes: number, data: AppData): Fuelling {
  const kg = latestBodyweight(data)
  const afterProtein = kg
    ? `${Math.round(kg * 0.3)}g of protein plus carbohydrate within a couple of hours`
    : '20–40g of protein plus carbohydrate within a couple of hours'

  if (minutes < NO_FUEL_MINUTES) {
    return {
      needed: false,
      why: `About ${Math.round(minutes)} minutes. Under an hour you are running on what is already in you.`,
      basis: 'Muscle glycogen covers roughly this long at a conversational effort.',
      during: 'Water. Nothing else is required.',
      after: `Eat a normal meal. ${afterProtein} if the next session is soon.`,
    }
  }

  if (minutes < MODERATE_MINUTES) {
    return {
      needed: true,
      carbsPerHour: [30, 30],
      why: `About ${Math.round(minutes)} minutes — long enough that carbohydrate starts to help.`,
      basis: 'Around 30 g/h is where the benefit begins for sessions of roughly this length.',
      before: 'A normal meal 2–3 hours before, or something small and mostly carbohydrate an hour before.',
      during: 'About 30g of carbohydrate an hour — one gel, one banana, or a bottle of sports drink.',
      after: afterProtein,
    }
  }

  if (minutes < LONG_MINUTES) {
    return {
      needed: true,
      carbsPerHour: [30, 60],
      why: `About ${Math.round(minutes)} minutes. This is the range where running out is a real outcome.`,
      basis: '30–60 g/h is the usual guidance for efforts between an hour and a half and two and a half.',
      before: 'A carbohydrate-based meal 2–3 hours before. Do not try anything new.',
      during: '30–60g of carbohydrate an hour, starting before you feel you need it. Drink to thirst.',
      after: afterProtein,
    }
  }

  return {
    needed: true,
    carbsPerHour: [60, 90],
    why: `About ${Math.round(minutes)} minutes. At this length fuelling is part of the session, not an extra.`,
    basis:
      '60–90 g/h needs a mix of glucose and fructose to absorb, and needs a gut trained to take it. ' +
      'The top of that range is not something to attempt for the first time on race day.',
    before: 'A rehearsed carbohydrate breakfast 2–3 hours before. Race day is not the day to improvise.',
    during:
      '60–90g of carbohydrate an hour from the start, in whatever form you have actually practised. ' +
      'Practising this IS the session — treat gut tolerance as trainable, because it is.',
    after: afterProtein,
  }
}

/**
 * Roughly how long a planned session will take.
 *
 * Distance work is estimated from your OWN logged pace for that exercise where
 * there is one; otherwise it falls back to a stated assumption rather than a
 * silent one, and the caller shows which happened.
 */
export interface DurationEstimate {
  minutes: number
  /** True when this came from your history rather than a default. */
  fromHistory: boolean
  assumption?: string
}

const DEFAULT_RUN_SECONDS_PER_KM = 360
const DEFAULT_SWIM_SECONDS_PER_100M = 130

export function estimateMinutes(
  entries: { pattern: string; sets: number; metresPerSet?: number; restSeconds: number; reps?: number }[],
  data: AppData,
): DurationEstimate {
  let seconds = 0
  let usedHistory = false
  let assumed = false

  for (const entry of entries) {
    if (entry.metresPerSet) {
      const total = entry.metresPerSet * entry.sets
      const pace = historicPace(entry.pattern, data)
      if (pace) usedHistory = true
      else assumed = true

      const perUnit =
        pace ??
        (entry.pattern === 'swim' ? DEFAULT_SWIM_SECONDS_PER_100M / 100 : DEFAULT_RUN_SECONDS_PER_KM / 1000)
      seconds += total * perUnit + entry.sets * entry.restSeconds
    } else {
      // A weights set: the work is short, the rest is most of the clock.
      seconds += entry.sets * (30 + entry.restSeconds)
    }
  }

  return {
    minutes: Math.round(seconds / 60),
    fromHistory: usedHistory,
    assumption: assumed
      ? 'Pace assumed at 6:00/km running and 2:10/100m swimming — log a session and it uses yours instead.'
      : undefined,
  }
}

/** Seconds per metre from your own completed sets of this kind of work. */
function historicPace(pattern: string, data: AppData): number | undefined {
  let metres = 0
  let seconds = 0
  const byId = new Map(data.exercises.map((e) => [e.id, e]))

  for (const session of data.sessions) {
    for (const entry of session.entries) {
      if (byId.get(entry.exerciseId)?.pattern !== pattern) continue
      for (const set of entry.sets) {
        if (!set.completed || !set.distance || !set.seconds) continue
        metres += set.distance
        seconds += set.seconds
      }
    }
  }
  return metres > 0 ? seconds / metres : undefined
}
