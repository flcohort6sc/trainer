/**
 * Training around something that hurts.
 *
 * This is a filter, not a diagnosis, and it is deliberately blunt: you tick
 * 'knee' for a week and the generator stops handing you deep knee flexion. It
 * does not know what is wrong with your knee, and neither does anything else in
 * this app. Persistent pain is a physio's job, and the UI says so.
 *
 * Exemptions run off tags that actually exist in the library -- `rehab`,
 * `shoulder-health`, `ankle` and the mobility tags. There is no `knee-friendly`
 * tag in the data today, so a knee niggle removes squats and lunges outright
 * rather than pretending to be more precise than it is.
 */

import type { Exercise, MovementPattern, Muscle, Niggle } from '../types'

interface NiggleRule {
  /** Patterns to take off the table while this is sore. */
  patterns: MovementPattern[]
  /** Exercises whose PRIMARY work is this get removed too. */
  muscles?: Muscle[]
  /** Tags that mean "this one is fine, it is the rehab for it". */
  exempt: string[]
  /** Shown to you when it blocks something. */
  label: string
}

export const NIGGLE_RULES: Record<Niggle, NiggleRule> = {
  knee: {
    patterns: ['squat', 'lunge'],
    exempt: ['rehab'],
    label: 'knee',
  },
  'lower-back': {
    // Loaded hinging and loaded spinal flexion, which is most of what an angry
    // lower back objects to.
    patterns: ['hinge', 'core-flexion'],
    exempt: ['rehab'],
    label: 'lower back',
  },
  shoulder: {
    patterns: ['push-vertical', 'pull-vertical'],
    exempt: ['rehab', 'shoulder-health', 'shoulder-friendly', 'shoulder-mobility'],
    label: 'shoulder',
  },
  hip: {
    patterns: ['hinge', 'squat'],
    exempt: ['rehab', 'hip-mobility'],
    label: 'hip',
  },
  ankle: {
    patterns: ['run', 'lunge'],
    exempt: ['rehab', 'ankle'],
    label: 'ankle',
  },
  wrist: {
    // Anything that puts bodyweight through an extended wrist.
    patterns: ['push-horizontal', 'core-anti-extension'],
    exempt: ['rehab'],
    label: 'wrist',
  },
  neck: {
    patterns: ['core-flexion'],
    muscles: ['neck'],
    exempt: ['rehab'],
    label: 'neck',
  },
}

export interface NiggleFilter {
  /** True when this exercise should be kept away from you today. */
  blocks: (exercise: Exercise) => boolean
  /** "your knee and lower back" -- for the reason string. */
  describe: () => string
  active: boolean
}

export function niggleFilter(niggles: Niggle[] | undefined): NiggleFilter {
  const active = (niggles ?? []).filter((n) => NIGGLE_RULES[n])
  if (active.length === 0) {
    return { blocks: () => false, describe: () => '', active: false }
  }

  const rules = active.map((n) => NIGGLE_RULES[n])

  return {
    active: true,
    blocks: (exercise) =>
      rules.some((rule) => {
        if (exercise.tags.some((t) => rule.exempt.includes(t))) return false
        if (rule.patterns.includes(exercise.pattern)) return true
        return Boolean(rule.muscles?.some((m) => exercise.primaryMuscles.includes(m)))
      }),
    describe: () => {
      const labels = rules.map((r) => r.label)
      return labels.length === 1
        ? `your ${labels[0]}`
        : `your ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
    },
  }
}
