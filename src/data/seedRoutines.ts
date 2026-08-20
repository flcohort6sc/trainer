/**
 * Starter routines.
 *
 * Same trick as the programs: a step stores a REQUIREMENT ("60 seconds of
 * passive hip work"), never a named drill. That is why tomorrow's wake-up is
 * not this morning's wake-up, and why every reel you add to the library shows
 * up in these on its own.
 *
 * `targetMinutes` is a real instruction, not a label -- the generator keeps
 * adding rotating steps until the routine is roughly that long.
 */

import type { Routine, RoutineStep, MovementPattern, Muscle, Rotation } from '../types'

let n = 0
function step(
  label: string,
  patterns: MovementPattern[],
  seconds: number,
  opts: Partial<RoutineStep> = {},
): RoutineStep {
  return {
    id: `rstep-${++n}`,
    label,
    patterns,
    seconds,
    transitionSeconds: opts.transitionSeconds ?? 10,
    rotation: (opts.rotation ?? 'rotate') as Rotation,
    ...opts,
  }
}

const M: Record<string, Muscle[]> = {
  hams: ['hamstrings'],
  adductors: ['adductors'],
  glutes: ['glutes'],
  hipFlexors: ['hip-flexors'],
  chestShoulders: ['chest', 'front-delts', 'lats'],
}

export const SEED_ROUTINES: Routine[] = [
  {
    id: 'rt-wake',
    name: 'Wake-Up',
    kind: 'wake',
    description:
      'Active drills only. The job is to warm tissue and switch the nervous system on, which is why there is not a single long passive hold in here — those belong at night.',
    targetMinutes: 7,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Spine', ['mobility'], 45, { requireTags: ['spine'] }),
      step('Hips', ['mobility'], 40, { requireTags: ['hip-mobility'], perSide: true }),
      step('Shoulders', ['mobility'], 45, { requireTags: ['shoulder-mobility'] }),
      step('Whole body', ['mobility'], 45, { requireTags: ['wake'], rotation: 'random' }),
    ],
  },

  {
    id: 'rt-wind-down',
    name: 'Wind-Down',
    kind: 'wind-down',
    description:
      'Passive holds and breathing before bed. Long, boring, and deliberately so — the point is the parasympathetic shift, not the range of motion.',
    targetMinutes: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Settle the breath', ['stretch'], 90, { requireTags: ['breathing'], transitionSeconds: 15 }),
      step('Hips', ['stretch'], 60, { requireTags: ['hip-mobility'], perSide: true, transitionSeconds: 15 }),
      step('Spine', ['stretch'], 60, { requireTags: ['spine'], transitionSeconds: 15 }),
      step('Wherever you are tight', ['stretch'], 60, { requireTags: ['wind-down'], rotation: 'random', transitionSeconds: 15 }),
      step('Finish lying down', ['stretch'], 120, { requireTags: ['recovery'], transitionSeconds: 15 }),
    ],
  },

  {
    id: 'rt-hips-hams',
    name: 'Hips & Hamstrings',
    kind: 'flexibility',
    description:
      'The two areas that actually limit most people’s squat and deadlift. Active work first to warm the tissue, then the long holds that change range.',
    targetMinutes: 15,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Warm the hips', ['mobility'], 45, { requireTags: ['hip-mobility'], perSide: true }),
      step('Hamstrings', ['stretch'], 90, { requireMuscles: M.hams, perSide: true, transitionSeconds: 15 }),
      step('Adductors', ['stretch'], 90, { requireMuscles: M.adductors, transitionSeconds: 15 }),
      step('Glutes', ['stretch'], 75, { requireMuscles: M.glutes, perSide: true, transitionSeconds: 15 }),
      step('Hip flexors', ['stretch'], 75, { requireMuscles: M.hipFlexors, perSide: true, transitionSeconds: 15 }),
    ],
  },

  {
    id: 'rt-full-flex',
    name: 'Full-Body Flexibility',
    kind: 'flexibility',
    description:
      'The long one. Twenty minutes on the living room floor, no equipment, top to bottom.',
    targetMinutes: 20,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Move first', ['mobility'], 45, { requireTags: ['active-mobility'], rotation: 'random' }),
      step('Legs', ['stretch'], 90, { requireMuscles: M.hams, perSide: true, transitionSeconds: 15 }),
      step('Hips', ['stretch'], 90, { requireTags: ['hip-mobility'], perSide: true, transitionSeconds: 15 }),
      step('Spine', ['stretch'], 75, { requireTags: ['spine'], transitionSeconds: 15 }),
      step('Chest & shoulders', ['stretch'], 75, { requireMuscles: M.chestShoulders, perSide: true, transitionSeconds: 15 }),
      step('Ankles', ['mobility', 'stretch'], 60, { requireTags: ['ankle'], perSide: true, transitionSeconds: 15 }),
      step('Breathe it out', ['stretch'], 90, { requireTags: ['breathing'], transitionSeconds: 15 }),
    ],
  },

  {
    id: 'rt-desk',
    name: 'Desk Reset',
    kind: 'recovery',
    description:
      'Five minutes for the parts a working day quietly wrecks: neck, wrists, upper back, hip flexors. Do it standing next to the desk.',
    targetMinutes: 5,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Neck & upper back', ['mobility', 'stretch'], 40, { requireTags: ['desk-relief'], rotation: 'random' }),
      step('Wrists', ['mobility', 'stretch'], 40, { requireTags: ['desk-relief'], requireMuscles: ['forearms'] }),
      step('Open the front', ['stretch'], 45, { requireTags: ['desk-relief'], perSide: true }),
      step('Spine', ['mobility'], 40, { requireTags: ['spine'] }),
    ],
  },

  {
    id: 'rt-sauna',
    name: 'Sauna Protocol',
    kind: 'sauna',
    description:
      'Three rounds of heat, each followed by cooling and real rest. The rest is not padding — it is half of what makes the round do anything. Leave a round early any time you want to; the timer is a suggestion.',
    targetMinutes: 55,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Round 1', ['protocol'], 600, { requireTags: ['heat'], allowRepeat: true, transitionSeconds: 30 }),
      step('Cool', ['protocol'], 120, { requireTags: ['cold'], allowRepeat: true, transitionSeconds: 30 }),
      step('Rest & rehydrate', ['protocol'], 300, { requireTags: ['sauna-rest'], allowRepeat: true, transitionSeconds: 15 }),
      step('Round 2', ['protocol'], 600, { requireTags: ['heat'], allowRepeat: true, transitionSeconds: 30 }),
      step('Cool', ['protocol'], 150, { requireTags: ['cold'], allowRepeat: true, transitionSeconds: 30 }),
      step('Rest & rehydrate', ['protocol'], 300, { requireTags: ['sauna-rest'], allowRepeat: true, transitionSeconds: 15 }),
      step('Round 3', ['protocol'], 600, { requireTags: ['heat'], allowRepeat: true, transitionSeconds: 30 }),
      step('Cool', ['protocol'], 180, { requireTags: ['cold'], allowRepeat: true, transitionSeconds: 30 }),
      step('Final rest', ['protocol'], 300, { requireTags: ['sauna-final'], allowRepeat: true, transitionSeconds: 15 }),
    ],
  },

  {
    id: 'rt-sauna-short',
    name: 'Quick Sauna',
    kind: 'sauna',
    description: 'Two rounds when you have half an hour rather than an hour.',
    targetMinutes: 30,
    createdAt: '2024-01-01T00:00:00.000Z',
    steps: [
      step('Round 1', ['protocol'], 600, { requireTags: ['heat'], allowRepeat: true, transitionSeconds: 30 }),
      step('Cool', ['protocol'], 120, { requireTags: ['cold'], allowRepeat: true, transitionSeconds: 20 }),
      step('Rest & rehydrate', ['protocol'], 240, { requireTags: ['sauna-rest'], allowRepeat: true, transitionSeconds: 15 }),
      step('Round 2', ['protocol'], 600, { requireTags: ['heat'], allowRepeat: true, transitionSeconds: 30 }),
      step('Cool', ['protocol'], 150, { requireTags: ['cold'], allowRepeat: true, transitionSeconds: 20 }),
      step('Final rest', ['protocol'], 240, { requireTags: ['sauna-final'], allowRepeat: true, transitionSeconds: 15 }),
    ],
  },

  {
    id: 'rt-posture-reset',
    name: 'Posture Reset',
    kind: 'recovery',
    description:
      'A six-part daily routine reconstructed from a saved reel. The caption gave the reps and the reason for each step but never named a single movement — those came from watching the video. Pinned rather than rotating, because it reproduces a specific sequence.',
    targetMinutes: 7,
    createdAt: '2026-08-19T00:00:00.000Z',
    steps: [
      step('Open the front', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-table-pose', transitionSeconds: 12,
      }),
      step('Loosen the hamstrings', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'fx-standing-fold', transitionSeconds: 12,
      }),
      step('Strengthen the trunk', ['core-anti-extension'], 75, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-seated-lean-back', transitionSeconds: 12,
      }),
      step('Pelvic control', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-seated-pelvic-tilt', transitionSeconds: 12,
      }),
      step('Open the upper back', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-thoracic-ext-floor', transitionSeconds: 12,
      }),
      step('Pull the shoulders back', ['pull-horizontal'], 80, {
        rotation: 'fixed', pinnedExerciseId: 'hm-reverse-snow-angel', transitionSeconds: 12,
      }),
    ],
  },

  {
    id: 'rt-apt-reset',
    name: 'Pelvic Tilt Reset',
    kind: 'recovery',
    description:
      'Four steps for an anterior pelvic tilt — the lower back that arches and the belly that pushes forward from too much sitting. Reconstructed from a saved German reel whose caption never named the movements. Stretch the front, wake the glutes, then get the hip joints moving.',
    targetMinutes: 6,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Stretch the front thigh', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-st-reclined-quad', transitionSeconds: 12,
      }),
      step('Wake the glutes', ['hinge'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'hg-glute-bridge', transitionSeconds: 12,
      }),
      step('Free the hip joints', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'mo-90-90', perSide: true, transitionSeconds: 12,
      }),
      step('Lengthen the hip flexor', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-couch', perSide: true, transitionSeconds: 12,
      }),
    ],
  },

  {
    id: 'rt-five-minute',
    name: 'Five-Minute Daily',
    kind: 'wake',
    description:
      'One minute each, five movements, reconstructed from a saved reel. Its best idea is not the exercises but where it puts them: the deep squat while you are on your phone, the 90/90 during an ad break, cat-cow the moment you get up, the hang after a day at a desk. Movement that fits in the gaps rather than needing a slot.',
    targetMinutes: 5,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Deep squat — while scrolling', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-deep-squat-pry', transitionSeconds: 8,
      }),
      step('90/90 sit — during the ad break', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'mo-90-90', transitionSeconds: 8,
      }),
      step('Segmental cat-cow — on waking', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-segmental-cat', transitionSeconds: 8,
      }),
      step('Thoracic wings', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-bws-wings', transitionSeconds: 8,
      }),
      step('Dead hang — after work', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'fx-bar-hang', transitionSeconds: 8,
      }),
    ],
  },

  {
    id: 'rt-prerun',
    name: 'Pre-Run Warm-Up',
    kind: 'wake',
    situational: true,
    description:
      'Five minutes before you run, reconstructed from a saved reel. Swings to open the hips, a lunge and twist to get rotation, lateral work because running never goes sideways, then squats and pogos to put some spring in before the first kilometre.',
    targetMinutes: 5,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Leg swings', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-leg-swing', perSide: true, transitionSeconds: 8,
      }),
      step('Lunge and twist', ['mobility'], 30, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-lunge-twist', perSide: true, transitionSeconds: 8,
      }),
      step('Lateral ducks', ['run'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-run-lateral-duck', transitionSeconds: 8,
      }),
      step('Squats', ['squat'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'sq-bw', transitionSeconds: 8,
      }),
      step('Pogos', ['run'], 30, {
        rotation: 'fixed', pinnedExerciseId: 'ig-run-pogo', transitionSeconds: 8,
      }),
    ],
  },

  {
    id: 'rt-bedtime',
    name: 'Bedtime Reset',
    kind: 'wind-down',
    description:
      'Four movements, all done in bed, from a saved reel. Shorter and lower-friction than the full Wind-Down — the point is that you never have to get onto the floor, which is the usual reason an evening routine quietly stops happening.',
    targetMinutes: 5,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Side bends', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-side-bends', perSide: true, transitionSeconds: 10,
      }),
      step('Feet up the wall', ['stretch'], 90, {
        rotation: 'fixed', pinnedExerciseId: 'wd-legs-up-wall', transitionSeconds: 10,
      }),
      step('Figure of four', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-figure-4', perSide: true, transitionSeconds: 10,
      }),
      step('Spinal twist', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-supine-twist', perSide: true, transitionSeconds: 10,
      }),
    ],
  },

  {
    id: 'rt-preswim',
    name: 'Pre-Swim Warm-Up',
    kind: 'wake',
    situational: true,
    description:
      'Nine minutes on the poolside before you get in, reconstructed from a competitive swimmer\'s reel. Shoulders and thoracic spine first because that is what freestyle asks for, then trunk stability so the body holds a line in the water rather than snaking.',
    targetMinutes: 9,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Toe taps', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-toe-taps', transitionSeconds: 10,
      }),
      step("World's greatest stretch", ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'mo-worlds-greatest', perSide: true, transitionSeconds: 10,
      }),
      step('Ankle climbs', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-ankle-rocker', perSide: true, transitionSeconds: 10,
      }),
      step('Dead bugs', ['core-anti-extension'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'co-deadbug', transitionSeconds: 10,
      }),
      step('Side plank', ['core-anti-rotation'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'co-side-plank', perSide: true, transitionSeconds: 10,
      }),
      step('Supermans', ['hinge'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'hm-superman', transitionSeconds: 10,
      }),
      step('T-raises', ['pull-horizontal'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-is-prone-scap-slide', transitionSeconds: 10,
      }),
    ],
  },

  {
    id: 'rt-presleep-mobility',
    name: 'Pre-Sleep Mobility',
    kind: 'wind-down',
    description:
      'Floor mobility before bed, from a triathlete who works full time. Hip-heavy on purpose — lizard, pigeon, sumo squat — which is exactly what accumulates when you run and swim. Longer and more active than the Bedtime Reset, and it needs floor space rather than a mattress.',
    targetMinutes: 8,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Cat-cow', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'mo-cat-cow', transitionSeconds: 10,
      }),
      step('Lizard pose', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'fx-lizard', perSide: true, transitionSeconds: 10,
      }),
      step('Lunge side extension', ['mobility'], 30, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-lunge-reach', perSide: true, transitionSeconds: 10,
      }),
      step('Toe touch', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-seated-fold', transitionSeconds: 10,
      }),
      step('Sumo squat', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wk-deep-squat-pry', transitionSeconds: 10,
      }),
      step('Pigeon', ['stretch'], 30, {
        rotation: 'fixed', pinnedExerciseId: 'fx-pigeon', perSide: true, transitionSeconds: 10,
      }),
      step('Down dog', ['mobility'], 30, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-downward-dog', transitionSeconds: 10,
      }),
    ],
  },

  {
    id: 'rt-five-min-core',
    name: 'Five-Minute Core',
    kind: 'wake',
    description:
      'Four movements, fifteen reps each, cycled without stopping for about five minutes. The creator times it by playing one song and going until it ends, which is a better instruction than a stopwatch because you stop thinking about the clock.',
    targetMinutes: 5,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Scissors', ['core-anti-extension'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-scissors', allowRepeat: true, transitionSeconds: 8,
      }),
      step('Leg raises', ['core-flexion'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-lying-leg-raise', allowRepeat: true, transitionSeconds: 8,
      }),
      step('Crunches', ['core-flexion'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-sit-up', allowRepeat: true, transitionSeconds: 8,
      }),
      step('Heel taps', ['core-flexion'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-heel-taps', allowRepeat: true, transitionSeconds: 8,
      }),
      step('Round two — scissors', ['core-anti-extension'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-scissors', allowRepeat: true, transitionSeconds: 8,
      }),
      step('Round two — leg raises', ['core-flexion'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-co-lying-leg-raise', allowRepeat: true, transitionSeconds: 8,
      }),
    ],
  },

  {
    id: 'rt-athlete-nightly',
    name: 'Athlete Nightly Stretch',
    kind: 'wind-down',
    description:
      'A college athlete\'s nightly sequence: quad sit, downward dog, lunge, pigeon, frog, then legs up the wall. Longer holds than the other evening routines and heavier on the hips, which is what a day of training leaves behind.',
    targetMinutes: 7,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Quad sit', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-st-quad-sit', transitionSeconds: 10,
      }),
      step('Downward dog', ['mobility'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-downward-dog', transitionSeconds: 10,
      }),
      step('Lunge stretch', ['mobility'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'ig-mo-lunge-reach', perSide: true, transitionSeconds: 10,
      }),
      step('Pigeon fold', ['stretch'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'fx-pigeon', perSide: true, transitionSeconds: 10,
      }),
      step('Frog stretch', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'fx-frog', transitionSeconds: 10,
      }),
      step('Legs up the wall', ['stretch'], 90, {
        rotation: 'fixed', pinnedExerciseId: 'wd-legs-up-wall', transitionSeconds: 10,
      }),
    ],
  },

  {
    id: 'rt-postswim',
    name: 'Post-Swim Stretch',
    kind: 'wind-down',
    situational: true,
    description:
      'Six minutes on the poolside deck after a session, from a competitive swimmer. Works down the body in the order swimming loads it: lower back and hips first, then shoulders, then hamstrings. The counterpart to the Pre-Swim Warm-Up.',
    targetMinutes: 6,
    createdAt: '2026-08-20T00:00:00.000Z',
    steps: [
      step('Hips and lower back', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-supine-twist', perSide: true, transitionSeconds: 10,
      }),
      step('Shoulders', ['stretch'], 45, {
        rotation: 'fixed', pinnedExerciseId: 'wd-thread-needle', perSide: true, transitionSeconds: 10,
      }),
      step('Legs and hamstrings', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'wd-seated-fold', transitionSeconds: 10,
      }),
      step('Hips and everything below', ['stretch'], 60, {
        rotation: 'fixed', pinnedExerciseId: 'ig-st-quad-sit', transitionSeconds: 10,
      }),
    ],
  },
]
