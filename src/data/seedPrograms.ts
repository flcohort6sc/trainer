/**
 * Starter programs.
 *
 * Read one of these and notice what is NOT here: exercise names. A day is a
 * list of jobs to be done ("hip-dominant primary, 3x5-8"), and the generator
 * picks the exercise. That is why the same program gives you a different
 * session in week 3 than week 1 without you editing anything.
 *
 * The exception is `rotation: 'fixed'` with a pinned exercise -- use that for
 * the two or three lifts you want to grind linearly for months.
 */

import type { Program, Slot, MovementPattern, SlotRole, Rotation } from '../types'

let n = 0
function slot(
  label: string,
  role: SlotRole,
  patterns: MovementPattern[],
  sets: number,
  repRange: [number, number],
  restSeconds: number,
  opts: Partial<Slot> = {},
): Slot {
  return {
    id: `slot-${++n}`,
    label,
    role,
    patterns,
    sets,
    repRange,
    restSeconds,
    rotation: (opts.rotation ?? 'rotate') as Rotation,
    ...opts,
  }
}

const WARMUP = (): Slot[] => [
  slot('Movement prep', 'warmup', ['mobility'], 1, [8, 10], 0, { rotation: 'random' }),
  // requireTags is what stops this offering a bicep curl: pattern alone would
  // let any 'isolation' exercise through. That also means the pattern list can
  // be wide -- a heavy deadlift is a 'hinge', but it is not tagged 'warmup',
  // so it can never appear here.
  slot(
    'Activation',
    'warmup',
    ['core-anti-extension', 'core-anti-rotation', 'isolation', 'hinge', 'pull-horizontal'],
    2,
    [10, 15],
    30,
    {
      rotation: 'random',
      maxDifficulty: 1,
      requireTags: ['warmup', 'rehab', 'shoulder-health'],
    },
  ),
]

export const SEED_PROGRAMS: Program[] = [
  {
    id: 'prog-full-body',
    name: 'Full Body 3x/week',
    description:
      'Three sessions a week, every session hits everything. The best default if you train 2-4 times a week or your schedule is unpredictable — miss a day and you have not skipped a muscle group.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-fb-a',
        name: 'Full Body A',
        focus: 'Squat-led, heavier',
        slots: [
          ...WARMUP(),
          slot('Lower push (heavy)', 'primary', ['squat'], 4, [5, 8], 180),
          slot('Upper push', 'primary', ['push-horizontal'], 4, [6, 10], 150),
          slot('Upper pull', 'primary', ['pull-horizontal', 'pull-vertical'], 4, [6, 10], 150),
          slot('Hip hinge', 'secondary', ['hinge'], 3, [8, 12], 120),
          slot('Core', 'accessory', ['core-anti-extension', 'core-anti-rotation', 'core-flexion'], 3, [10, 15], 60),
        ],
      },
      {
        id: 'day-fb-b',
        name: 'Full Body B',
        focus: 'Hinge-led, more unilateral work',
        slots: [
          ...WARMUP(),
          slot('Hip hinge (heavy)', 'primary', ['hinge'], 4, [4, 6], 180),
          slot('Vertical press', 'primary', ['push-vertical'], 4, [6, 10], 150),
          slot('Vertical pull', 'primary', ['pull-vertical'], 4, [6, 10], 150),
          slot('Single-leg', 'secondary', ['lunge'], 3, [8, 12], 120),
          slot('Arms', 'accessory', ['isolation'], 3, [10, 15], 60),
        ],
      },
      {
        id: 'day-fb-c',
        name: 'Full Body C',
        focus: 'Lighter, higher rep, finisher',
        slots: [
          ...WARMUP(),
          slot('Lower push', 'primary', ['squat', 'lunge'], 3, [10, 15], 120),
          slot('Horizontal press', 'secondary', ['push-horizontal'], 3, [10, 15], 90),
          slot('Horizontal pull', 'secondary', ['pull-horizontal'], 3, [10, 15], 90),
          slot('Shoulders / arms', 'accessory', ['isolation'], 3, [12, 20], 60),
          slot('Carry or conditioning', 'finisher', ['carry', 'conditioning'], 3, [1, 1], 60, {
            rotation: 'random',
          }),
        ],
      },
    ],
  },

  {
    id: 'prog-upper-lower',
    name: 'Upper / Lower 4x/week',
    description:
      'Four days, alternating upper and lower. More volume per muscle group than full body, still recovers well. The standard choice once you can commit to four sessions.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-ul-u1',
        name: 'Upper (Strength)',
        focus: 'Heavy compounds, low reps',
        slots: [
          ...WARMUP(),
          slot('Horizontal press (heavy)', 'primary', ['push-horizontal'], 4, [4, 6], 180),
          slot('Vertical pull (heavy)', 'primary', ['pull-vertical'], 4, [5, 8], 150),
          slot('Vertical press', 'secondary', ['push-vertical'], 3, [8, 10], 120),
          slot('Horizontal pull', 'secondary', ['pull-horizontal'], 3, [8, 12], 120),
          slot('Rear delts / shoulder health', 'accessory', ['isolation'], 3, [12, 20], 45),
        ],
      },
      {
        id: 'day-ul-l1',
        name: 'Lower (Strength)',
        focus: 'Heavy squat pattern',
        slots: [
          ...WARMUP(),
          slot('Squat pattern (heavy)', 'primary', ['squat'], 4, [4, 6], 210),
          slot('Hip hinge', 'primary', ['hinge'], 3, [6, 10], 180),
          slot('Single-leg', 'secondary', ['lunge'], 3, [8, 12], 120),
          slot('Hamstring / calf', 'accessory', ['isolation'], 3, [12, 15], 60),
          slot('Core', 'accessory', ['core-anti-rotation', 'core-flexion'], 3, [10, 15], 60),
        ],
      },
      {
        id: 'day-ul-u2',
        name: 'Upper (Hypertrophy)',
        focus: 'More volume, shorter rest',
        slots: [
          ...WARMUP(),
          slot('Horizontal press', 'primary', ['push-horizontal'], 4, [8, 12], 120),
          slot('Horizontal pull', 'primary', ['pull-horizontal'], 4, [8, 12], 120),
          slot('Vertical press', 'secondary', ['push-vertical'], 3, [10, 15], 90),
          slot('Vertical pull', 'secondary', ['pull-vertical'], 3, [10, 15], 90),
          slot('Biceps', 'accessory', ['isolation'], 3, [10, 15], 45),
          slot('Triceps', 'accessory', ['isolation'], 3, [10, 15], 45),
        ],
      },
      {
        id: 'day-ul-l2',
        name: 'Lower (Hypertrophy)',
        focus: 'Hinge-led, higher rep',
        slots: [
          ...WARMUP(),
          slot('Hip hinge', 'primary', ['hinge'], 4, [8, 12], 150),
          slot('Squat pattern', 'primary', ['squat'], 4, [10, 15], 120),
          slot('Single-leg', 'secondary', ['lunge'], 3, [10, 12], 90),
          slot('Quad / hamstring isolation', 'accessory', ['isolation'], 3, [12, 20], 60),
          slot('Conditioning finisher', 'finisher', ['conditioning', 'carry'], 3, [1, 1], 60, {
            rotation: 'random',
          }),
        ],
      },
    ],
  },

  {
    id: 'prog-ppl',
    name: 'Push / Pull / Legs',
    description:
      'Six days if you are ambitious, three if you are not. Highest volume per muscle group, needs the most recovery and the most consistency.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-ppl-push',
        name: 'Push',
        focus: 'Chest, shoulders, triceps',
        slots: [
          ...WARMUP(),
          slot('Horizontal press (heavy)', 'primary', ['push-horizontal'], 4, [5, 8], 180),
          slot('Vertical press', 'primary', ['push-vertical'], 4, [8, 10], 150),
          slot('Chest accessory', 'secondary', ['push-horizontal'], 3, [10, 15], 90),
          slot('Side delts', 'accessory', ['isolation'], 4, [12, 20], 45),
          slot('Triceps', 'accessory', ['isolation'], 3, [10, 15], 45),
        ],
      },
      {
        id: 'day-ppl-pull',
        name: 'Pull',
        focus: 'Back, rear delts, biceps',
        slots: [
          ...WARMUP(),
          slot('Vertical pull (heavy)', 'primary', ['pull-vertical'], 4, [5, 8], 180),
          slot('Horizontal pull', 'primary', ['pull-horizontal'], 4, [8, 12], 150),
          slot('Back accessory', 'secondary', ['pull-horizontal', 'pull-vertical'], 3, [10, 15], 90),
          slot('Rear delts', 'accessory', ['isolation'], 3, [15, 20], 45),
          slot('Biceps', 'accessory', ['isolation'], 3, [10, 15], 45),
        ],
      },
      {
        id: 'day-ppl-legs',
        name: 'Legs',
        focus: 'Everything below the waist',
        slots: [
          ...WARMUP(),
          slot('Squat pattern (heavy)', 'primary', ['squat'], 4, [5, 8], 210),
          slot('Hip hinge', 'primary', ['hinge'], 4, [8, 12], 150),
          slot('Single-leg', 'secondary', ['lunge'], 3, [10, 12], 90),
          slot('Hamstrings', 'accessory', ['isolation'], 3, [12, 15], 60),
          slot('Calves', 'accessory', ['isolation'], 4, [12, 20], 45),
          slot('Core', 'accessory', ['core-flexion', 'core-anti-extension'], 3, [10, 15], 60),
        ],
      },
    ],
  },

  {
    id: 'prog-home',
    name: 'Home / No Gym',
    description:
      'Two days you can run in a living room. Every slot requires the "home" tag, so the generator can only offer things that need a floor, a doorway, or a chair. Progression still applies — chase reps, then harder variations.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-home-a',
        name: 'Home A',
        focus: 'Push-led, full body',
        slots: [
          ...WARMUP(),
          slot('Lower body', 'primary', ['squat', 'lunge'], 4, [10, 20], 90, { requireTags: ['home'] }),
          slot('Upper push', 'primary', ['push-horizontal', 'push-vertical'], 4, [8, 15], 90, { requireTags: ['home'] }),
          slot('Upper pull', 'primary', ['pull-horizontal', 'pull-vertical'], 3, [8, 15], 90, { requireTags: ['home'] }),
          slot('Posterior chain', 'secondary', ['hinge'], 3, [10, 15], 75, { requireTags: ['home'] }),
          slot('Core', 'accessory', ['core-anti-extension', 'core-anti-rotation', 'core-flexion'], 3, [10, 20], 60, {
            requireTags: ['home'],
          }),
        ],
      },
      {
        id: 'day-home-b',
        name: 'Home B',
        focus: 'Single-leg led, with a finisher',
        slots: [
          ...WARMUP(),
          slot('Single-leg', 'primary', ['lunge'], 4, [8, 15], 90, { requireTags: ['home'] }),
          slot('Upper pull', 'primary', ['pull-horizontal', 'pull-vertical'], 4, [8, 15], 90, { requireTags: ['home'] }),
          slot('Upper push', 'primary', ['push-horizontal', 'push-vertical'], 4, [8, 15], 90, { requireTags: ['home'] }),
          slot('Hinge', 'secondary', ['hinge'], 3, [10, 15], 75, { requireTags: ['home'] }),
          slot('Conditioning finisher', 'finisher', ['conditioning'], 3, [1, 1], 45, {
            requireTags: ['home'],
            rotation: 'random',
          }),
        ],
      },
    ],
  },

  {
    id: 'prog-swim',
    name: 'Swim',
    description:
      'Three pool sessions: technique, endurance, speed. Slots are metres, not reps — "6 × 100m on 30s rest" — and the drill slots rotate, so you are not doing catch-up drill every single week.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-swim-technique',
        name: 'Technique',
        focus: 'Drills, low volume, think about what you are doing',
        slots: [
          slot('Shoulder prep (poolside)', 'warmup', ['mobility'], 1, [8, 10], 0, {
            requireTags: ['shoulder-mobility'], rotation: 'random',
          }),
          slot('Warm-up swim', 'warmup', ['swim'], 1, [1, 1], 60, {
            requireTags: ['endurance'], distanceRange: [200, 300],
          }),
          slot('Drill A', 'primary', ['swim'], 4, [1, 1], 20, {
            requireTags: ['drill'], distanceRange: [50, 50],
          }),
          slot('Drill B', 'primary', ['swim'], 4, [1, 1], 20, {
            requireTags: ['drill'], distanceRange: [50, 50],
          }),
          slot('Steady swim', 'secondary', ['swim'], 6, [1, 1], 30, {
            requireTags: ['endurance'], distanceRange: [100, 100],
          }),
          slot('Cool-down', 'finisher', ['swim'], 1, [1, 1], 0, {
            requireTags: ['endurance'], distanceRange: [200, 200],
          }),
        ],
      },
      {
        id: 'day-swim-endurance',
        name: 'Endurance',
        focus: 'Steady aerobic volume',
        slots: [
          slot('Warm-up swim', 'warmup', ['swim'], 1, [1, 1], 60, {
            requireTags: ['endurance'], distanceRange: [300, 400],
          }),
          slot('Main set', 'primary', ['swim'], 8, [1, 1], 25, {
            requireTags: ['endurance'], distanceRange: [100, 150],
          }),
          slot('Pull or kick', 'secondary', ['swim'], 4, [1, 1], 30, {
            requireTags: ['drill'], distanceRange: [100, 100],
          }),
          slot('Cool-down', 'finisher', ['swim'], 1, [1, 1], 0, {
            requireTags: ['endurance'], distanceRange: [200, 200],
          }),
        ],
      },
      {
        id: 'day-swim-speed',
        name: 'Speed',
        focus: 'Short, fast, full recovery',
        slots: [
          slot('Warm-up swim', 'warmup', ['swim'], 1, [1, 1], 60, {
            requireTags: ['endurance'], distanceRange: [300, 400],
          }),
          slot('Drill', 'warmup', ['swim'], 2, [1, 1], 20, {
            requireTags: ['drill'], distanceRange: [50, 50],
          }),
          slot('Sprint set', 'primary', ['swim'], 8, [1, 1], 45, {
            requireTags: ['endurance'], distanceRange: [50, 50],
          }),
          slot('Cool-down', 'finisher', ['swim'], 1, [1, 1], 0, {
            requireTags: ['endurance'], distanceRange: [200, 300],
          }),
        ],
      },
    ],
  },

  {
    id: 'prog-run',
    name: 'Run',
    description:
      'Easy, long, tempo, intervals — the four sessions that make up almost every running plan ever written. Keep the easy days genuinely easy and the hard days genuinely hard; the middle is where progress goes to die.',
    createdAt: '2024-01-01T00:00:00.000Z',
    days: [
      {
        id: 'day-run-easy',
        name: 'Easy Run',
        focus: 'Conversational pace, aerobic base',
        slots: [
          ...WARMUP(),
          slot('Easy run', 'primary', ['run'], 1, [1, 1], 0, {
            requireTags: ['easy'], distanceRange: [5000, 7000],
          }),
        ],
      },
      {
        id: 'day-run-long',
        name: 'Long Run',
        focus: 'Time on feet',
        slots: [
          ...WARMUP(),
          slot('Long run', 'primary', ['run'], 1, [1, 1], 0, {
            requireTags: ['endurance'], distanceRange: [10000, 14000],
          }),
        ],
      },
      {
        id: 'day-run-tempo',
        name: 'Tempo',
        focus: 'Comfortably hard, threshold work',
        slots: [
          ...WARMUP(),
          slot('Warm-up jog', 'warmup', ['run'], 1, [1, 1], 120, {
            requireTags: ['easy'], distanceRange: [1500, 2000],
          }),
          slot('Tempo', 'primary', ['run'], 1, [1, 1], 0, {
            requireTags: ['threshold'], distanceRange: [4000, 6000],
          }),
          slot('Cool-down jog', 'finisher', ['run'], 1, [1, 1], 0, {
            requireTags: ['easy'], distanceRange: [1000, 1500],
          }),
        ],
      },
      {
        id: 'day-run-intervals',
        name: 'Intervals',
        focus: 'Short and fast, jog the recovery',
        slots: [
          ...WARMUP(),
          slot('Warm-up jog', 'warmup', ['run'], 1, [1, 1], 120, {
            requireTags: ['easy'], distanceRange: [1500, 2000],
          }),
          slot('Repeats', 'primary', ['run'], 6, [1, 1], 120, {
            requireTags: ['intervals'], distanceRange: [800, 800],
          }),
          slot('Cool-down jog', 'finisher', ['run'], 1, [1, 1], 0, {
            requireTags: ['easy'], distanceRange: [1000, 1500],
          }),
        ],
      },
    ],
  },
]
