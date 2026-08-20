/**
 * Swimming and running.
 *
 * These use the same slot machinery as the weights -- a swim session is very
 * literally sets, reps and rest ("8 x 50m on 20s") -- with one difference:
 * they are measured in metres and seconds, so the slot carries a
 * `distanceRange` and the logger asks for distance and time rather than
 * weight and reps. Pace is derived, never typed.
 *
 * Equipment is the honest gate. 'pool' means a pool; untick it in Settings
 * while travelling and every swim disappears from every plan by itself.
 */

import type { Exercise } from '../types'
import { ex } from './seedExercises'

const POOL = ['pool'] as const

export const SEED_ENDURANCE: Exercise[] = [
  // ================= SWIM: strokes =================

  ex('sw-free', 'Freestyle', 'swim', ['lats', 'front-delts'], ['upper-back', 'triceps', 'abs', 'glutes'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: [
      'Press the chest down so the hips rise — most "weak kick" is really a sinking chest',
      'Rotate from the hips, both shoulders clearing the water each stroke',
      'Reach and glide before you catch; hurrying the front of the stroke costs distance per stroke',
    ],
    tags: ['swim', 'endurance', 'freestyle'],
  }),
  ex('sw-breast', 'Breaststroke', 'swim', ['chest', 'quads'], ['adductors', 'lats', 'glutes'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Pull, breathe, kick, glide — in that order, and hold the glide', 'Heels to the backside, not knees to the chest'],
    tags: ['swim', 'endurance', 'breaststroke'],
  }),
  ex('sw-back', 'Backstroke', 'swim', ['lats', 'rear-delts'], ['upper-back', 'abs'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Ears in the water, eyes up, hips high', 'Little finger enters first, thumb exits first'],
    tags: ['swim', 'endurance', 'backstroke', 'shoulder-health'],
  }),
  ex('sw-fly', 'Butterfly', 'swim', ['chest', 'lats'], ['front-delts', 'abs', 'lower-back'], [...POOL], {
    difficulty: 3, loadType: 'distance-time',
    cues: ['Two kicks per stroke: one as the hands enter, one as they exit', 'Chest press drives the undulation — the arms are the last thing to think about'],
    tags: ['swim', 'butterfly'],
  }),

  // ================= SWIM: technique drills =================

  ex('sw-catch-up', 'Catch-Up Drill', 'swim', ['lats'], ['front-delts', 'abs'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['One hand waits at full extension until the other touches it', 'Forces a long stroke and kills the windmill'],
    tags: ['swim', 'drill', 'technique', 'freestyle'],
  }),
  ex('sw-fist', 'Fist Drill', 'swim', ['lats'], ['forearms'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Swim with closed fists, then open them and feel how much water the forearm was already holding'],
    notes: 'Teaches the high-elbow catch better than any explanation of the high-elbow catch.',
    tags: ['swim', 'drill', 'technique', 'freestyle'],
  }),
  ex('sw-single-arm', 'Single-Arm Freestyle', 'swim', ['lats'], ['abs', 'front-delts'], [...POOL], {
    unilateral: true, difficulty: 2, loadType: 'distance-time',
    cues: ['Other arm at your side, not out front — it forces you to rotate', 'Breathe to the working side'],
    tags: ['swim', 'drill', 'technique', 'freestyle'],
  }),
  ex('sw-6-kick', '6-Kick Switch', 'swim', ['abs'], ['glutes', 'quads'], [...POOL], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['On your side, six kicks, then switch to the other side', 'The drill for rotation and for balance in the water'],
    tags: ['swim', 'drill', 'technique'],
  }),
  ex('sw-sculling', 'Sculling', 'swim', ['forearms'], ['lats', 'chest'], [...POOL], {
    difficulty: 2, loadType: 'time',
    cues: ['Small figure-eight sweeps with the hands, elbows high', 'You are learning what "holding water" feels like'],
    tags: ['swim', 'drill', 'technique'],
  }),
  ex('sw-kick-board', 'Kick Set', 'swim', ['quads', 'glutes'], ['calves', 'abs'], ['pool', 'kickboard'], {
    difficulty: 1, loadType: 'distance-time',
    cues: ['Kick from the hip with a loose ankle — bending the knee is what makes a kick loud and slow', 'Small, fast, continuous'],
    tags: ['swim', 'drill'],
  }),
  ex('sw-pull-buoy', 'Pull Set', 'swim', ['lats', 'upper-back'], ['triceps', 'front-delts'], ['pool', 'pull-buoy'], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Buoy between the thighs, legs quiet — it is an upper-body set, not a rest'],
    tags: ['swim', 'drill'],
  }),
  ex('sw-paddles', 'Paddle Set', 'swim', ['lats'], ['front-delts', 'chest'], ['pool', 'paddles'], {
    difficulty: 3, loadType: 'distance-time',
    cues: ['Small paddles first. Big paddles on a bad catch is how shoulders get hurt'],
    notes: 'Add paddles only once the catch is decent. They magnify technique, good or bad.',
    tags: ['swim', 'drill'],
  }),
  ex('sw-fins', 'Fin Set', 'swim', ['quads', 'calves'], ['glutes', 'abs'], ['pool', 'fins'], {
    difficulty: 1, loadType: 'distance-time',
    cues: ['Fins let you hold a better body position long enough to learn what it feels like'],
    tags: ['swim', 'drill', 'technique'],
  }),
  ex('sw-open-water', 'Open Water Swim', 'swim', ['lats', 'front-delts'], ['upper-back', 'abs'], ['open-water'], {
    difficulty: 3, loadType: 'distance-time',
    cues: ['Sight every 6–8 strokes: eyes just above the surface, then straight back down', 'Never swim alone, and know the exit before you start'],
    tags: ['swim', 'endurance', 'outdoors'],
  }),

  // ================= RUN =================

  ex('rn-easy', 'Easy Run', 'run', ['quads', 'hamstrings'], ['calves', 'glutes'], ['outdoors'], {
    difficulty: 1, loadType: 'distance-time',
    cues: [
      'Conversational — if you cannot speak a full sentence you are running your easy day too hard',
      'This is the pace that builds the aerobic base. Most people ruin it by pushing',
    ],
    tags: ['run', 'endurance', 'easy'],
  }),
  ex('rn-long', 'Long Run', 'run', ['quads', 'hamstrings'], ['glutes', 'calves', 'abs'], ['outdoors'], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Same effort as an easy run, just longer', 'Add no more than ~10% to it per week'],
    tags: ['run', 'endurance'],
  }),
  ex('rn-tempo', 'Tempo Run', 'run', ['quads', 'hamstrings'], ['calves', 'glutes'], ['outdoors'], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Comfortably hard — you could say a few words, not a sentence', 'Roughly the pace you could hold for an hour if you had to'],
    tags: ['run', 'threshold'],
  }),
  ex('rn-intervals', 'Interval Repeats', 'run', ['quads', 'hamstrings'], ['calves', 'glutes'], ['outdoors'], {
    difficulty: 3, loadType: 'distance-time',
    cues: ['Even splits beat a heroic first rep followed by four bad ones', 'Jog the recovery, do not stand still'],
    tags: ['run', 'intervals'],
  }),
  ex('rn-hills', 'Hill Repeats', 'run', ['glutes', 'quads'], ['calves', 'hamstrings'], ['outdoors'], {
    difficulty: 2, loadType: 'distance-time',
    cues: ['Short steps, tall posture, drive the knee', 'Walk or jog down — the descent is not the workout'],
    tags: ['run', 'intervals', 'strength'],
  }),
  ex('rn-strides', 'Strides', 'run', ['quads'], ['calves', 'hip-flexors'], ['outdoors'], {
    difficulty: 1, loadType: 'distance-time',
    cues: ['20–30 seconds building to fast but relaxed, then walk back', 'Not a sprint. Speed you could hold while smiling'],
    tags: ['run', 'warmup', 'technique'],
  }),
  ex('rn-treadmill', 'Treadmill Run', 'run', ['quads', 'hamstrings'], ['calves', 'glutes'], ['treadmill'], {
    difficulty: 1, loadType: 'distance-time',
    cues: ['1% incline gets you closer to the effort of running outdoors'],
    tags: ['run', 'endurance', 'indoor'],
  }),
  ex('rn-track', 'Track Repeats', 'run', ['quads', 'hamstrings'], ['calves'], ['track'], {
    difficulty: 3, loadType: 'distance-time',
    cues: ['The track exists so the distance is honest and the splits are comparable'],
    tags: ['run', 'intervals'],
  }),
  ex('rn-walk-run', 'Walk-Run Intervals', 'run', ['quads'], ['calves', 'glutes'], ['outdoors'], {
    difficulty: 1, loadType: 'distance-time',
    cues: ['Run a set time, walk a set time, repeat', 'How you build running volume without collecting injuries'],
    tags: ['run', 'easy', 'beginner-friendly'],
  }),
]
