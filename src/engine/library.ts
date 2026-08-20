/**
 * Where an exercise actually shows up.
 *
 * The Library used to show what an exercise IS and never what to do with it --
 * "how many, how long" only existed inside a generated session. Rather than
 * invent a dosage per exercise (3×10 for everything, which is what most apps
 * do and is meaningless), this reads the prescriptions already written in your
 * own programs and routines. Every number below is one you can go and look at.
 */

import type { AppData, Exercise } from '../types'

export interface Appearance {
  /** "Full Body 3x/week · Full Body A" */
  where: string
  /** "4 × 5–8 · 180s rest" or "45s per side" */
  prescription: string
  /** True when the slot pins this exact exercise rather than filling by pattern. */
  pinned: boolean
}

export function appearsIn(exercise: Exercise, data: AppData): Appearance[] {
  const out: Appearance[] = []

  for (const program of data.programs) {
    if (program.archived) continue
    for (const day of program.days) {
      for (const slot of day.slots) {
        const byPattern = slot.patterns.includes(exercise.pattern)
        const pinned = slot.pinnedExerciseId === exercise.id
        if (!byPattern && !pinned) continue
        if (slot.requireTags && !slot.requireTags.some((t) => exercise.tags.includes(t))) continue

        const [lo, hi] = slot.repRange
        const reps = slot.distanceRange
          ? `${slot.distanceRange[0]}–${slot.distanceRange[1]}m`
          : lo === hi
            ? `${lo}`
            : `${lo}–${hi}`

        out.push({
          where: `${program.name} · ${day.name}`,
          prescription: `${slot.sets} × ${reps}${slot.restSeconds > 0 ? ` · ${slot.restSeconds}s rest` : ''}`,
          pinned,
        })
      }
    }
  }

  for (const routine of data.routines) {
    if (routine.archived) continue
    for (const step of routine.steps) {
      const byPattern = step.patterns.includes(exercise.pattern)
      const pinned = step.pinnedExerciseId === exercise.id
      if (!byPattern && !pinned) continue
      if (step.requireTags && !step.requireTags.some((t) => exercise.tags.includes(t))) continue

      out.push({
        where: `${routine.name} · ${step.label}`,
        prescription: step.perSide ? `${step.seconds}s per side` : `${step.seconds}s`,
        pinned,
      })
    }
  }

  // Pinned appearances first -- "this program asks for exactly this" outranks
  // "this program has a slot this could fill".
  return out.sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 8)
}
