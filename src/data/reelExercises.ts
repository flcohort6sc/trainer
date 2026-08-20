/**
 * Exercises authored from the Instagram export.
 *
 * Hand-written, not generated. `reelSources.ts` is the mechanical half of the
 * import; this file is the judgement half, and the two are kept apart so a
 * re-import can never overwrite work that took thought.
 *
 * Rules this file follows, and that any addition must keep following:
 *
 * 1. Every entry comes from a caption that NAMED the movement. Where a reel
 *    said "4 exercises for stiff hips" without naming them, nothing was
 *    invented -- that reel is in the watch queue instead.
 * 2. Cues carry what the creator actually said. Where a cue is obvious
 *    supporting detail it is written plainly; where it is the creator's
 *    specific claim it stays attributed in `notes`.
 * 3. German and Polish captions are translated; the point of the original is
 *    preserved in `notes` rather than dropped.
 * 4. Every entry links back to the reel through `sourceUrl` and `reelId`, so
 *    six weeks later you can watch the thing again.
 *
 * Some of the claims in these captions are marketing. A few are wrong. The
 * app records who said what and leaves the judgement to you.
 */

import type { Equipment, Exercise, LoadType, MovementPattern, Muscle } from '../types'

/** Builder that ties an exercise back to the reel it came from. */
function rex(
  shortcode: string,
  creator: string,
  id: string,
  name: string,
  pattern: MovementPattern,
  primaryMuscles: Muscle[],
  secondaryMuscles: Muscle[],
  equipment: Equipment[],
  opts: {
    unilateral?: boolean
    difficulty?: 1 | 2 | 3
    loadType?: LoadType
    cues?: string[]
    tags?: string[]
    notes?: string
  } = {},
): Exercise {
  return {
    id,
    name,
    pattern,
    primaryMuscles,
    secondaryMuscles,
    equipment,
    unilateral: opts.unilateral ?? false,
    difficulty: opts.difficulty ?? 2,
    loadType: opts.loadType ?? 'weight-reps',
    cues: opts.cues ?? [],
    tags: opts.tags ?? [],
    notes: [opts.notes, `From @${creator}`].filter(Boolean).join(' · '),
    sourceUrl: `https://www.instagram.com/reel/${shortcode}/`,
    reelId: `reel-${shortcode}`,
    status: 'ready',
    createdAt: '2026-08-19T00:00:00.000Z',
  }
}

const KB = ['kettlebell'] as const
const BW = ['bodyweight'] as const

export const REEL_EXERCISES: Exercise[] = [
  // ==================== KETTLEBELL ====================

  rex('DcMaw52qBVq', 'trainedbywill_', 'ig-kb-seesaw', 'Kettlebell Seesaw Press', 'push-vertical',
    ['front-delts'], ['triceps', 'abs', 'side-delts'], [...KB], {
    unilateral: true, difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Two bells in the rack, press one as the other lowers',
      'The alternating rhythm is the point — each side works independently',
      'Ribs down and glutes tight so the press does not become a lean',
    ],
    notes: 'Creator’s claim: forces core and stabilisers through every rep, unlike a two-arm press.',
    tags: ['kettlebell', 'shoulder-health'],
  }),

  rex('Dbblr_ANTAU', 'iest_willz86', 'ig-kb-iron-trident', 'Iron Trident', 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'forearms'], [...KB], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: [
      'Hold the position and fight the bell — the work is resisting, not moving',
      'Trains the core to resist rotation and extension under load rather than flex forward',
      'You will feel it inside 30 seconds; that is the exercise working, not you failing',
    ],
    tags: ['kettlebell', 'core'],
  }),

  rex('DaOWKQNBAgJ', 'fit___dad', 'ig-kb-crush-press', 'Kettlebell Crush Press', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts'], [...KB], {
    difficulty: 1, loadType: 'weight-reps',
    cues: ['Crush the horns of the bell throughout the press to create full-body tension'],
    tags: ['kettlebell', 'home'],
  }),

  rex('DaOWKQNBAgJ', 'fit___dad', 'ig-kb-around-world', 'Kettlebell Around the World', 'core-anti-rotation',
    ['obliques'], ['front-delts', 'forearms', 'abs'], [...KB], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Pass the bell around your body while keeping the torso completely still',
      'Builds shoulder mobility, shoulder stability and anti-rotational core at once',
      'Both directions, equal reps',
    ],
    tags: ['kettlebell', 'warmup', 'shoulder-mobility'],
  }),

  rex('DaOWKQNBAgJ', 'fit___dad', 'ig-kb-horn-pushup', 'Kettlebell Horn Push-Up', 'push-horizontal',
    ['chest'], ['triceps', 'abs', 'front-delts'], [...KB], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'Hands on the horns, body in one straight line, chest to the bell each rep',
      'Stay rigid and resist rotation — the bell will punish a sloppy plank',
      'Scale to incline or knee push-ups before scaling the bell',
    ],
    tags: ['kettlebell', 'home'],
  }),

  rex('Da0kKLshYUE', 'fit___dad', 'ig-kb-ballistic-row', 'Ballistic Row', 'pull-horizontal',
    ['lats', 'upper-back'], ['biceps', 'rear-delts'], [...KB], {
    unilateral: true, difficulty: 2, loadType: 'weight-reps',
    cues: ['Explode the bell to your hip, then control the lowering phase', 'Absorbing the load is half the rep'],
    notes: 'Creator frames the four movements of this complex as produce / absorb / transfer / control force.',
    tags: ['kettlebell'],
  }),

  rex('Da0kKLshYUE', 'fit___dad', 'ig-kb-devils-halo', "Devil's Halo", 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'traps'], [...KB], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'Start with the bell by one foot, drive it across the body to the opposite shoulder',
      'Halo around the head, then return it under control to the opposite foot',
      'Scale to a standard halo before scaling the weight',
    ],
    tags: ['kettlebell'],
  }),

  rex('Da0kKLshYUE', 'fit___dad', 'ig-kb-clean-thruster', 'Clean + Thruster', 'conditioning',
    ['quads', 'glutes'], ['front-delts', 'triceps', 'abs'], [...KB], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'Keep the bell close, catch softly, then drive explosively overhead',
      'Scale to a goblet squat plus push press',
    ],
    tags: ['kettlebell', 'conditioning', 'finisher'],
  }),

  rex('DcKLzFTRRAP', 'trainwithmurph', 'ig-kb-curl-halo', 'Curl to Halo', 'isolation',
    ['biceps'], ['front-delts', 'obliques'], [...KB], {
    difficulty: 2, loadType: 'reps',
    cues: ['Curl the bell, then halo it around the head and back', 'Both directions, five each way'],
    tags: ['kettlebell'],
  }),

  rex('DcKLzFTRRAP', 'trainwithmurph', 'ig-kb-throw-over', 'Throw Overs', 'conditioning',
    ['biceps', 'front-delts'], ['abs', 'forearms'], [...KB], {
    unilateral: true, difficulty: 3, loadType: 'reps',
    cues: ['Explosive work to finish an arm session, eight per side'],
    notes: 'Programmed by the creator as the explosive finisher after curl variations.',
    tags: ['kettlebell', 'finisher'],
  }),

  rex('DcLkHMIhLAE', 'vidabymatt', 'ig-kb-curl-chest-press', 'Curl to Chest Press', 'push-horizontal',
    ['chest', 'biceps'], ['triceps', 'front-delts'], [...KB], {
    difficulty: 2, loadType: 'reps',
    cues: ['One continuous movement: curl it up, press it out'],
    tags: ['kettlebell', 'home'],
  }),

  rex('DcLkHMIhLAE', 'vidabymatt', 'ig-kb-floor-press', 'Kettlebell Floor Press', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts'], [...KB], {
    difficulty: 1, loadType: 'weight-reps',
    cues: [
      'Lying on the floor, the ground limits the range and protects the shoulder',
      'Pause when the triceps touch down rather than bouncing',
    ],
    tags: ['kettlebell', 'shoulder-friendly', 'home'],
  }),

  rex('Db_iBSiM8fj', 'vasilshimboff', 'ig-kb-shelf-loader', 'Shelf Loader', 'conditioning',
    ['quads', 'glutes'], ['biceps', 'front-delts', 'abs', 'chest'], [...KB], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Squat, then curl, then press — one continuous movement',
      'Build towards 100 quality reps rather than chasing load early',
    ],
    notes: 'Creator’s pitch: one movement covering legs, glutes, core, chest, biceps, shoulders and grip.',
    tags: ['kettlebell', 'home', 'conditioning', 'travel'],
  }),

  rex('DcJvchivNRs', 'jeremyriesen', 'ig-kb-halo', 'Kettlebell Halo', 'core-anti-rotation',
    ['obliques'], ['front-delts', 'traps', 'abs'], [...KB], {
    difficulty: 1, loadType: 'reps',
    cues: ['Circle the bell around the head, close to it, torso still', 'Control over comfort — slow is the point'],
    tags: ['kettlebell', 'warmup', 'shoulder-mobility'],
  }),

  rex('DcJvchivNRs', 'jeremyriesen', 'ig-kb-side-crunch', 'Kettlebell Side Crunch', 'core-flexion',
    ['obliques'], ['abs'], [...KB], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: ['Load one side, bend away from it, then return under control'],
    tags: ['kettlebell', 'core'],
  }),

  rex('DcJvchivNRs', 'jeremyriesen', 'ig-kb-oh-situp', 'Overhead Sit-Up', 'core-flexion',
    ['abs'], ['hip-flexors', 'front-delts'], [...KB], {
    difficulty: 2, loadType: 'reps',
    cues: ['Bell locked out overhead the whole rep', 'If the arms drift forward the weight is too heavy'],
    tags: ['kettlebell', 'core'],
  }),

  rex('DcJvchivNRs', 'jeremyriesen', 'ig-kb-pullover', 'Kettlebell Pullover', 'core-anti-extension',
    ['abs', 'lats'], ['chest', 'triceps'], [...KB], {
    difficulty: 2, loadType: 'weight-reps',
    cues: [
      'On your back, take the bell overhead without letting the ribs flare',
      'The lower back stays flat on the floor — that is the whole exercise',
    ],
    tags: ['kettlebell', 'core'],
  }),

  rex('DanpCDLyn73', 'prince_lama__', 'ig-kb-crunch', 'Kettlebell Crunch', 'core-flexion',
    ['abs'], ['obliques'], [...KB], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: ['Ten each side, straight through, no overthinking'],
    tags: ['kettlebell', 'core'],
  }),

  rex('DbQ5TuzsF1H', 'anton__lemke', 'ig-kb-emom-complex', 'Clean and Press / Snatch EMOM', 'conditioning',
    ['glutes', 'front-delts'], ['quads', 'lats', 'abs'], [...KB], {
    difficulty: 3, loadType: 'time',
    cues: [
      'On the minute: 5 clean and press, then 10 snatches (5 per arm), for 20 minutes',
      'Starting weights the creator suggests: 2×16kg for men, 2×12kg for women',
      'Progress by adding time before adding weight — 20 minutes to 30',
    ],
    notes: 'Translated from German. Original: "Stell dir nen 20 Minuten Timer... Mach das für 20 Minuten."',
    tags: ['kettlebell', 'conditioning', 'finisher'],
  }),

  // ==================== RUNNING DRILLS ====================

  rex('Db6BXK8tFku', 'marsha_du_', 'ig-run-straight-leg-bounce', 'Straight Leg Bounce', 'run',
    ['calves', 'glutes'], ['hamstrings', 'quads'], ['outdoors'], {
    difficulty: 2, loadType: 'distance-time',
    cues: [
      'For runners who sit down as they run — teaches you to stay tall',
      'Legs stay long, push the ground away rather than reaching for it',
      'Engage the glutes; this is a posture drill more than a leg drill',
    ],
    tags: ['run', 'technique', 'warmup', 'drill'],
  }),

  rex('Db6BXK8tFku', 'marsha_du_', 'ig-run-a-skip', 'A-Skip', 'run',
    ['hip-flexors', 'calves'], ['quads', 'glutes'], ['outdoors'], {
    difficulty: 2, loadType: 'distance-time',
    cues: [
      'Drive the knee and stay in control instead of letting the leg swing through',
      'The classic drill for learning active, deliberate running mechanics',
    ],
    tags: ['run', 'technique', 'warmup', 'drill'],
  }),

  rex('Db6BXK8tFku', 'marsha_du_', 'ig-run-pogo', 'Pogo Jumps', 'run',
    ['calves'], ['quads', 'abs'], ['outdoors'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Small, fast, stiff-ankle bounces — barely leave the ground',
      'For runners who are passive through the foot and point the toes down',
      'Builds stronger feet and ankles so each step is quicker and bouncier',
    ],
    tags: ['run', 'technique', 'warmup', 'drill', 'ankle'],
  }),

  // ==================== MOBILITY FLOWS ====================

  rex('Db1cV58hFFW', 'pogawithmads', 'ig-mo-squat-fold', 'Squat to Fold', 'mobility',
    ['hamstrings'], ['quads', 'lower-back'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['Drop into a deep squat, then straighten the legs into a forward fold and back', 'Twelve continuous reps'],
    tags: ['wake', 'active-mobility', 'hip-mobility', 'home', 'no-equipment'],
  }),

  rex('Db1cV58hFFW', 'pogawithmads', 'ig-mo-squat-kneeling', 'Squat to Kneeling', 'mobility',
    ['hip-flexors', 'quads'], ['glutes', 'abs'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: ['From a deep squat, step or lower down to kneeling and back up without hands', 'Six reps is plenty'],
    tags: ['wake', 'active-mobility', 'hip-mobility', 'home', 'no-equipment'],
  }),

  rex('Db1cV58hFFW', 'pogawithmads', 'ig-mo-heel-clicks', 'Heel Clicks', 'mobility',
    ['glutes'], ['adductors', 'hip-flexors'], [...BW], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: ['Lying or seated hip rotation drill, twelve each side'],
    tags: ['active-mobility', 'hip-mobility', 'home', 'no-equipment'],
  }),

  rex('DcMQiwbRpWb', 'danielpalicuk', 'ig-mo-lizard-quad-rot', 'Lizard Quad Rotation', 'mobility',
    ['hip-flexors', 'quads'], ['hamstrings', 'adductors'], [...BW], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: [
      'Lizard lunge, then rotate through to catch the back foot and open the quad',
      'Move within the stretch rather than holding still — the hip releases more when it is moving',
      'Thirty seconds each side',
    ],
    notes: 'One of four drills the creator programmes as 4 minutes, 4× a week.',
    tags: ['hip-mobility', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DcMQiwbRpWb', 'danielpalicuk', 'ig-mo-pigeon-pushup', 'Pigeon Pose Push-Up', 'mobility',
    ['glutes'], ['hip-flexors', 'chest'], [...BW], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: [
      'In pigeon, press the chest up and down to move through the outer glute and hip',
      'Dynamic rather than a held stretch — think a little deeper each rep',
    ],
    tags: ['hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcMQiwbRpWb', 'danielpalicuk', 'ig-mo-gorilla-cossack', 'Gorilla Cossack Rocks', 'mobility',
    ['adductors'], ['glutes', 'calves', 'quads'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Wide stance, hands down, rock side to side through the inner hips, knees and ankles', 'Sixty seconds total'],
    tags: ['hip-mobility', 'ankle', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DcMQiwbRpWb', 'danielpalicuk', 'ig-mo-squat-rot-ext', 'Squat Rotation & Extension', 'mobility',
    ['upper-back'], ['hamstrings', 'adductors', 'quads'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: [
      'From the bottom of a squat, rotate and reach one arm up, then extend the legs to load the hamstrings',
      'Builds a deeper squat, thoracic rotation and hamstring length in one drill',
    ],
    tags: ['hip-mobility', 'spine', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-golf-swings', 'Golf Swings', 'mobility',
    ['obliques'], ['lower-back', 'glutes'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Relaxed rotational swings through the torso, arms heavy', 'Thirty seconds, first movement of the morning'],
    tags: ['wake', 'spine', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-lymphatic-jumps', 'Lymphatic Jumps', 'mobility',
    ['calves'], ['quads'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Small loose bounces on the spot, heels barely leaving the floor', 'Thirty seconds to raise circulation'],
    notes: 'Creator’s framing is lymphatic circulation; treat that as their claim, not established fact.',
    tags: ['wake', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-trunk-twists', 'Trunk Twists', 'mobility',
    ['obliques'], ['lower-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Feet planted, rotate side to side and let the arms wrap around you'],
    tags: ['wake', 'spine', 'active-mobility', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-body-waves', 'Body Waves', 'mobility',
    ['lower-back'], ['abs', 'upper-back'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Ripple the spine from head to hips, one segment at a time', 'Wakes up spinal segmentation rather than moving as a block'],
    tags: ['wake', 'spine', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-horse-stance', 'Horse Stance', 'mobility',
    ['quads', 'adductors'], ['glutes', 'abs'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Wide stance, knees out, sit down between the hips and hold tall', 'Thirty seconds is harder than it sounds'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-bound-ups', 'Bound Ups', 'mobility',
    ['glutes', 'calves'], ['quads'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Springy bounding on the spot to bring the whole system up to temperature'],
    tags: ['wake', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-childs-flow', "Child's Pose Flow", 'mobility',
    ['lats', 'lower-back'], ['upper-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Rock in and out of child’s pose and side to side rather than settling into a hold'],
    tags: ['wake', 'spine', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-windshield-wipers', 'Windshield Wipers', 'mobility',
    ['obliques'], ['lower-back', 'glutes'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['On your back, knees bent, drop both knees side to side', 'Releases the lower back after rotation work'],
    tags: ['wake', 'wind-down', 'spine', 'hip-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-yoga-squat-reach', 'Yoga Squat to Reach', 'mobility',
    ['adductors'], ['upper-back', 'quads'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Deep squat, elbows inside the knees, then reach one arm to the ceiling and follow it with your eyes'],
    tags: ['wake', 'hip-mobility', 'spine', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-lunge-reach', 'Lunge with Reach', 'mobility',
    ['hip-flexors'], ['upper-back', 'glutes'], [...BW], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Deep lunge, squeeze the back glute, then reach the same-side arm overhead and lean away'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DcLEmi5R9Oy', 'domdavyfit', 'ig-mo-pike-rotation', 'Pike Rotation', 'mobility',
    ['hamstrings'], ['upper-back', 'front-delts'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['From a pike or downward dog, rotate the hips open and reach through'],
    tags: ['wake', 'spine', 'shoulder-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DbvQUgipGc5', 'whyymatteo', 'ig-mo-body-bounces', 'Body Bounces / Shake Out', 'mobility',
    ['calves'], ['quads', 'upper-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Loose bouncing and shaking to start — the point is to stop being stiff, not to stretch'],
    notes: 'Opens a 12.5-minute morning flow the creator runs daily.',
    tags: ['wake', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DbvQUgipGc5', 'whyymatteo', 'ig-mo-arm-swings-alt', 'Alternating Arm Swings', 'mobility',
    ['front-delts'], ['chest', 'upper-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Swing the arms past each other and open wide, alternating which is on top'],
    tags: ['wake', 'shoulder-mobility', 'active-mobility', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('DbvQUgipGc5', 'whyymatteo', 'ig-mo-neck-rolls', 'Neck Rolls', 'mobility',
    ['neck'], ['traps'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Slow half-circles chin to chest, never rolling backwards through the top', 'Stop at anything sharp'],
    tags: ['wake', 'wind-down', 'desk-relief', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('Db6Iu1GOx-S', 'mickmovements', 'ig-mo-table-pose', 'Table Pose', 'mobility',
    ['front-delts', 'glutes'], ['upper-back', 'abs'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Reverse tabletop: hands and feet down, drive the hips up level with the shoulders', 'Opens the shoulders and the front of the pelvis'],
    notes: 'Translated from German. Part of a five-minute morning routine, one minute per movement.',
    tags: ['wake', 'shoulder-mobility', 'hip-mobility', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('Db6Iu1GOx-S', 'mickmovements', 'ig-mo-pump-stretch', 'Pump Stretch', 'mobility',
    ['calves'], ['hamstrings', 'front-delts'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['From downward dog, alternately press each heel toward the floor', 'The creator uses it to close a five-minute morning routine'],
    notes: 'Translated from German: "Pump Stretch zum Abschluss."',
    tags: ['wake', 'ankle', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcGhVQSBEND', 'jeremyriesen', 'ig-mo-thoracic-twist', 'Standing Thoracic Twist', 'mobility',
    ['upper-back'], ['obliques'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['Stand tall, hands at the chest, rotate from the ribs and keep the hips facing forward', 'Ten each side'],
    tags: ['wake', 'spine', 'desk-relief', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcGhVQSBEND', 'jeremyriesen', 'ig-mo-cross-body-squat', 'Cross-Body Squat', 'mobility',
    ['adductors', 'glutes'], ['quads', 'obliques'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: ['Squat and reach across the body, letting the hips rotate under you'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcGhVQSBEND', 'jeremyriesen', 'ig-mo-side-bends', 'Standing Side Bends', 'mobility',
    ['obliques'], ['lats', 'lower-back'], [...BW], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: ['Reach one arm overhead and bend away, keeping the hips square', 'Five each side'],
    tags: ['wake', 'spine', 'desk-relief', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcGhVQSBEND', 'jeremyriesen', 'ig-mo-cossack-to-lunge', 'Cossack to Lunge', 'mobility',
    ['adductors'], ['glutes', 'quads', 'hip-flexors'], [...BW], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: ['Sit into a cossack, then rotate through into a deep forward lunge without standing up', 'Five each side'],
    notes: 'Creator’s line: "Your joints aren’t the problem. Never moving them through full range is."',
    tags: ['wake', 'hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  // ==================== DESK POSTURE ====================

  rex('DcKj-VcP8qe', 'skylerfelt', 'ig-mo-ql-stretch', 'QL Stretch', 'stretch',
    ['lower-back'], ['obliques', 'lats'], [...BW], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Side-bend and rotate to reach the quadratus lumborum down the side of the lower back', 'Unloads a back that has been bracing all day'],
    notes: 'First of four drills the creator prescribes as a counter-stimulus to desk sitting.',
    tags: ['wind-down', 'desk-relief', 'passive-stretch', 'home', 'no-equipment'],
  }),

  rex('DcKj-VcP8qe', 'skylerfelt', 'ig-st-reverse-nordic', 'Reverse Nordic', 'stretch',
    ['quads', 'hip-flexors'], ['abs'], [...BW], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'Kneeling, squeeze the glutes and lean back with a straight line from knee to head',
      'Lengthens and strengthens the quads and hip flexors under control — this is loaded, not passive',
      'Go only as far as you can come back from; that range is the exercise',
    ],
    tags: ['desk-relief', 'home', 'no-equipment', 'flexibility'],
  }),

  rex('DcKj-VcP8qe', 'skylerfelt', 'ig-mo-straight-arm-pullover', 'Straight-Arm Pullover Stretch', 'stretch',
    ['lats'], ['chest', 'upper-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Hands on a bench or sofa, hips back, let the chest sink to restore thoracic extension', 'Breathe into the position rather than pushing it'],
    tags: ['wind-down', 'desk-relief', 'shoulder-mobility', 'passive-stretch', 'home', 'no-equipment'],
  }),

  // ==================== RUNNER SUPPORT ====================

  rex('Db0lgeONXI3', 'reikovanwees', 'ig-mo-foam-roll-itb', 'Foam Roll Outer Thigh', 'stretch',
    ['quads'], ['abductors'], ['mat'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Roll the outer thigh slowly, pausing where it is tender rather than grinding through'],
    notes: 'Creator targets the IT band and surrounding fascia for outer knee pain.',
    tags: ['recovery', 'run', 'rehab', 'home'],
  }),

  rex('Db0lgeONXI3', 'reikovanwees', 'ig-st-miniband-abduction', 'Miniband Abductions', 'isolation',
    ['abductors', 'glutes'], [], ['bands'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: ['Band above the knees, drive the leg out against it without letting the torso lean', 'Strengthens gluteus medius, the hip stabiliser that fails on long runs'],
    tags: ['run', 'rehab', 'home', 'hip-mobility'],
  }),

  rex('DcJdC2ru7XP', 'walk_among_giants', 'ig-mo-lunge-twist', 'Lunge and Twist', 'mobility',
    ['hip-flexors'], ['obliques', 'glutes'], [...BW], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: ['Deep lunge, then rotate the torso over the front leg', 'Mobility under load rather than a passive hold'],
    notes: 'One of four exercises the creator programmes for runners with recurring hip pain.',
    tags: ['run', 'hip-mobility', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DcJdC2ru7XP', 'walk_among_giants', 'ig-hg-glute-bridge-rollout', 'Glute Bridge Rollout', 'hinge',
    ['glutes', 'hamstrings'], ['abs', 'lower-back'], ['bodyweight', 'ab-wheel'], {
    difficulty: 3, loadType: 'reps',
    cues: ['Bridge up, then roll out and back without letting the hips drop', 'Posterior chain strength with an anti-extension demand on top'],
    tags: ['run', 'core', 'home'],
  }),

  // ==================== ANIMAL FLOW ====================

  rex('Das7jaSsxPi', 'dennisratano', 'ig-cd-alligator-crawl', 'Alligator Crawl', 'conditioning',
    ['abs', 'front-delts'], ['chest', 'triceps', 'obliques'], [...BW], {
    difficulty: 3, loadType: 'time',
    cues: ['Low crawl close to the floor, opposite hand and foot together', 'Builds shoulder stability, trunk strength and whole-body coordination'],
    notes: 'Translated from German. Creator’s framing: "Bewege dich zuerst gut. Dann bewege mehr Gewicht." — move well first, then move more weight.',
    tags: ['home', 'no-equipment', 'conditioning', 'travel'],
  }),

  rex('Das7jaSsxPi', 'dennisratano', 'ig-mo-gorilla-walk', 'Gorilla Walk', 'mobility',
    ['adductors', 'hip-flexors'], ['front-delts', 'abs'], [...BW], {
    difficulty: 2, loadType: 'time',
    cues: ['Deep squat position, hands down, move sideways hand-then-feet', 'Improves hip and ankle mobility and a stable deep squat'],
    notes: 'Translated from German.',
    tags: ['home', 'no-equipment', 'hip-mobility', 'ankle', 'active-mobility'],
  }),

  rex('Das7jaSsxPi', 'dennisratano', 'ig-mo-crab-cossack-crawl', 'Crab / Cossack Crawl', 'mobility',
    ['adductors'], ['glutes', 'quads', 'abs'], [...BW], {
    difficulty: 3, loadType: 'time',
    cues: ['Travel sideways through a cossack position without standing up', 'Trains hip mobility, adductors, glutes and lateral stability at once'],
    notes: 'Translated from German.',
    tags: ['home', 'no-equipment', 'hip-mobility', 'active-mobility'],
  }),

  // ==================== CORE ====================

  rex('DcGbZ7zqCWc', 'davidp.fitt', 'ig-co-russian-twist', 'Russian Twist', 'core-anti-rotation',
    ['obliques'], ['abs', 'hip-flexors'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: ['Sit back to the point of tension, rotate the ribcage rather than just swinging the arms'],
    tags: ['core', 'home', 'no-equipment'],
  }),

  rex('DcGbZ7zqCWc', 'davidp.fitt', 'ig-co-reverse-crunch', 'Reverse Crunch', 'core-flexion',
    ['abs'], ['hip-flexors'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['Curl the pelvis off the floor toward the ribs — the legs are along for the ride', 'Slow down; momentum does this one for you otherwise'],
    tags: ['core', 'home', 'no-equipment'],
  }),

  rex('DcGbZ7zqCWc', 'davidp.fitt', 'ig-co-v-up', 'V-Up / Toe Touch', 'core-flexion',
    ['abs'], ['hip-flexors', 'obliques'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: ['Reach hands to feet, folding at the hips, then lower both under control'],
    tags: ['core', 'home', 'no-equipment'],
  }),

  rex('DZzlI7Rs5Lb', 'jenyaprakop', 'ig-co-beginner-brace', 'Beginner Core Brace', 'core-anti-extension',
    ['abs'], ['obliques', 'lower-back'], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Breathe through every rep — holding your breath is half the reason a plank feels impossible',
      'Slow and controlled beats fast every time',
      'Built from dead bug, glute bridge and bird dog, done properly rather than quickly',
    ],
    notes: 'Creator’s starting point for people who cannot yet hold a plank.',
    tags: ['core', 'beginner-friendly', 'home', 'no-equipment', 'rehab'],
  }),

  // ==================== CALISTHENICS PUSH ====================

  rex('Dblo2_KInQb', 'calisthenicspablo', 'ig-ph-knee-pushup', 'Knee Push-Up', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['Knees down but hips still in line with the shoulders — do not pike up'],
    tags: ['home', 'no-equipment', 'beginner-friendly', 'travel'],
  }),

  rex('Dblo2_KInQb', 'calisthenicspablo', 'ig-ph-hindu-pushup', 'Hindu Push-Up', 'push-horizontal',
    ['chest', 'front-delts'], ['triceps', 'lower-back'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: ['Dive from downward dog through to an upward-facing finish, then reverse it', 'A push-up and a spinal mobility drill in one'],
    tags: ['home', 'no-equipment', 'shoulder-mobility', 'travel'],
  }),

  rex('Dblo2_KInQb', 'calisthenicspablo', 'ig-ph-wall-pushup', 'Wall Push-Up', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['The regression before knee push-ups — step further back to make it harder'],
    tags: ['home', 'no-equipment', 'beginner-friendly', 'travel', 'rehab'],
  }),

  rex('Dblo2_KInQb', 'calisthenicspablo', 'ig-ph-diamond-pushup', 'Diamond Push-Up', 'push-horizontal',
    ['triceps'], ['chest', 'front-delts'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: ['Hands together under the chest, elbows tracking back rather than flaring'],
    tags: ['home', 'no-equipment', 'travel'],
  }),

  rex('Dblo2_KInQb', 'calisthenicspablo', 'ig-co-shoulder-taps', 'Shoulder Taps', 'core-anti-rotation',
    ['abs', 'obliques'], ['front-delts'], [...BW], {
    difficulty: 1, loadType: 'reps',
    cues: ['Plank position, tap the opposite shoulder without letting the hips rock', 'Widen the feet to make it easier'],
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DbAWPZzNaNO', 'lukasnogym', 'ig-ph-tempo-pushup', 'Tempo Push-Up', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts', 'abs'], [...BW], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Stop chasing the rep count — slow the tempo, feel the stretch at the bottom, then push',
      'Engage the core and tuck the pelvis slightly so the lower back stays neutral',
    ],
    tags: ['home', 'no-equipment', 'travel'],
  }),

  // ==================== GYM ISOLATION (gaps in the library) ====================

  rex('DWUHXzllOFt', 'builtbrody', 'ig-is-front-raise', 'Dumbbell Front Raise', 'isolation',
    ['front-delts'], ['side-delts'], ['dumbbell'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: ['Raise to shoulder height, no higher, and stop the torso swinging'],
    notes: 'From a physique guide listing four options per delt head; 2-3 sets of 8-12 recommended.',
    tags: ['shoulder'],
  }),

  rex('DWUHXzllOFt', 'builtbrody', 'ig-pr-tripod-row', 'Tripod Row', 'pull-horizontal',
    ['lats', 'upper-back'], ['biceps', 'rear-delts'], ['dumbbell'], {
    unilateral: true, difficulty: 2, loadType: 'weight-reps',
    cues: ['Free-standing hinge with one hand braced on a rack, rowing the other', 'Creator files it under mid-lat work'],
    tags: [],
  }),

  rex('DWUHXzllOFt', 'builtbrody', 'ig-pu-reverse-grip-pulldown', 'Reverse Grip Pulldown', 'pull-vertical',
    ['lats'], ['biceps', 'upper-back'], ['machine'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: ['Underhand grip drives the elbows down and back — the creator’s pick for lower lats'],
    tags: [],
  }),

  rex('DWUHXzllOFt', 'builtbrody', 'ig-ph-low-high-fly', 'Low to High Cable Fly', 'push-horizontal',
    ['chest'], ['front-delts'], ['cable'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: ['Sweep up and in, finishing with the hands high — biases the upper chest'],
    tags: [],
  }),

  rex('DWUHXzllOFt', 'builtbrody', 'ig-ph-pec-deck', 'Pec Deck Fly', 'push-horizontal',
    ['chest'], ['front-delts'], ['machine'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: ['Elbows slightly soft and fixed; the movement happens at the shoulder, not the elbow'],
    tags: [],
  }),

  rex('DWUHXzllOFt', 'builtbrody', 'ig-ph-decline-press', 'Decline Bench Press', 'push-horizontal',
    ['chest'], ['triceps', 'front-delts'], ['barbell', 'bench'], {
    difficulty: 2, loadType: 'weight-reps',
    cues: ['Biases the lower chest; keep the same tight shoulder position as a flat press'],
    tags: [],
  }),

  // ==================== RECOVERY ====================

  rex('DYZmgLqMD9d', 'carlottagagna.pilates', 'ig-pr-belly-massage', 'Abdominal Self-Massage', 'protocol',
    ['abs'], [], [...BW], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Diaphragm: press and hold 2-3 seconds along the lower edge of the ribcage, centre outwards',
      'Colon: small circles from the right side of the belly to the left, never the reverse',
      'Finish with slow sweeps from the sides of the waist toward the pubic bone',
    ],
    notes: 'The creator performs this at night and claims reduced bloating and easier digestion the next morning. Those are their claims; treat the sequence as a gentle self-massage rather than a medical intervention.',
    tags: ['wind-down', 'recovery', 'home', 'no-equipment'],
  }),

  rex('DXj96cQjZhZ', 'andrespreschel', 'ig-sa-post-training-sauna', 'Post-Training Sauna Round', 'protocol',
    ['neck'], [], ['sauna'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Go in straight after training while core temperature is already up',
      'Insulating the head slows cranial heating and delays the dizziness that ends a session early',
      'Same rules as any sauna round: leave when you want to, drink between rounds',
    ],
    notes: 'The creator, a physiologist, claims heat-shock-protein benefits from stacking sauna onto an already-elevated core temperature. Note the post is also an advertisement for a sauna brand.',
    tags: ['sauna', 'heat', 'recovery'],
  }),

  // ============ SECOND PASS ============
  // Recovered after fixing a plural bug in the importer's filter: the original
  // `\bexercise\b` never matched "exercises", which silently dropped 35 training
  // posts, ten of which named real movements.

  rex('DcJj5tRqnFq', 'xtinecardenas', 'ig-st-banded-passthrough', 'Banded Pass-Through', 'mobility',
    ['front-delts'], ['chest', 'upper-back'], ['bands'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Wide grip on the band, sweep straight arms from hips to overhead and behind',
      'Narrow the grip as the shoulders open — start far wider than feels necessary',
    ],
    notes: 'Part of a ten-minute overhead-shoulder routine: wall slides, band pull-aparts, rotations, doorway chest stretch, pass-throughs.',
    tags: ['shoulder-mobility', 'shoulder-health', 'warmup', 'active-mobility', 'home'],
  }),

  rex('DcJj5tRqnFq', 'xtinecardenas', 'ig-is-shoulder-rotation', 'Shoulder Internal & External Rotation', 'isolation',
    ['rear-delts'], ['front-delts', 'upper-back'], ['bands'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: [
      'Elbow pinned to your side at 90 degrees, rotate the forearm out, then in',
      'Twelve of each. Small range, light band — this is rotator cuff work, not a delt exercise',
    ],
    tags: ['shoulder-health', 'rehab', 'warmup', 'home'],
  }),

  rex('DZnEAhmu-1w', 'pouya_yoga', 'ig-st-camel-pose', 'Camel Pose', 'stretch',
    ['abs', 'hip-flexors'], ['chest', 'front-delts', 'neck'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Kneeling, hands to the heels, drive the hips forward and lift the chest',
      'Open the front of the body rather than collapsing into the lower back',
      'Thirty seconds is the creator\'s daily dose',
    ],
    notes: 'The creator\'s argument: posture is limited by tight tissue on the front of the body, not by trying to stand straighter.',
    tags: ['wind-down', 'desk-relief', 'passive-stretch', 'spine', 'shoulder-mobility', 'home', 'no-equipment'],
  }),

  rex('DaIKEJBNuAh', 'samuel_coeln', 'ig-kb-high-swing', 'High Swing', 'hinge',
    ['glutes', 'hamstrings'], ['abs', 'front-delts'], ['kettlebell'], {
    difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Same hip snap as a regular swing, but the bell floats to overhead rather than shoulder height',
      'The arms never lift the bell — if they do, the hips were too slow',
    ],
    notes: 'Opens a six-movement complex: high swings, cleans, presses, lunges, squats, rows.',
    tags: ['kettlebell', 'conditioning'],
  }),

  rex('DavIAhyhEPp', 'chriss.han', 'ig-is-incline-db-curl', 'Incline Dumbbell Curl', 'isolation',
    ['biceps'], ['forearms'], ['dumbbell', 'bench'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: [
      'Lying back on an incline puts the arm behind the torso, which stretches the long head',
      'Let the arm hang fully at the bottom — that stretch is the reason to do it this way',
    ],
    notes: 'Programmed 3 × 8-12 on pull day in a four-lift, three-run hybrid week.',
    tags: [],
  }),

  rex('DavIAhyhEPp', 'chriss.han', 'ig-is-cable-lateral-raise', 'Cable Lateral Raise', 'isolation',
    ['side-delts'], ['traps'], ['cable'], {
    unilateral: true, difficulty: 1, loadType: 'weight-reps',
    cues: [
      'The cable keeps tension at the bottom where a dumbbell has none',
      'Lead with the elbow, stop at shoulder height',
    ],
    tags: ['shoulder'],
  }),

  rex('DavIAhyhEPp', 'chriss.han', 'ig-ph-incline-bb-press', 'Incline Barbell Press', 'push-horizontal',
    ['chest'], ['front-delts', 'triceps'], ['barbell', 'bench'], {
    difficulty: 2, loadType: 'weight-reps',
    cues: ['Bench at about 30 degrees; steeper turns it into a shoulder press', 'Bar to the upper chest, not the throat'],
    tags: [],
  }),

  rex('DX-0YtMvPYR', 'christianborjahealth', 'ig-mo-capability-circuit', 'Capability Circuit', 'conditioning',
    ['glutes', 'quads'], ['abs', 'chest'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'One minute each: hip bridge, hip bridge march, split squats (30s per side), push-ups, plank',
      'Two to three rounds, fifteen minutes maximum',
      'The goal is maintaining balance, stability and coordination — not crushing yourself',
    ],
    notes: 'Framed as training for capability rather than performance or aesthetics.',
    tags: ['home', 'no-equipment', 'beginner-friendly', 'travel'],
  }),

  // ============ FROM WATCHED VIDEO (batch 1) ============
  // These captions named a topic and never the movements. The movements below
  // come from actually watching the reels -- frames extracted locally, read,
  // and written up. Where the video was ambiguous it says so rather than
  // guessing.

  rex('DbTrBFcIP6G', 'florian.diesch', 'ig-co-seated-lean-back', 'Seated Lean-Back', 'core-anti-extension',
    ['abs'], ['hip-flexors', 'lower-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Sit with knees bent and feet down, hands resting behind you',
      'Lean the torso back until the abs take the load, then return — slow, no momentum',
      'The creator programmes 30 reps, framed as strengthening the trunk so the back can relax',
    ],
    notes: 'Third movement in a six-part German daily posture routine. The caption gave reps and purpose but never named the movement; identified from the video.',
    tags: ['core', 'desk-relief', 'home', 'no-equipment', 'posture'],
  }),

  rex('DbTrBFcIP6G', 'florian.diesch', 'ig-mo-seated-pelvic-tilt', 'Seated Pelvic Tilt with Reach', 'mobility',
    ['lower-back'], ['abs', 'hip-flexors'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Sit tall with the legs wide and long, arms reaching overhead',
      'Tilt the pelvis forward and back under control — the movement is the pelvis, not the ribs',
      '20 reps. The point is pelvic control, which is what most "tight back" actually lacks',
    ],
    notes: 'Fourth movement of the same six-part routine, confirmed against the anatomical overlay showing pelvic tilt.',
    tags: ['hip-mobility', 'spine', 'desk-relief', 'active-mobility', 'home', 'no-equipment', 'posture'],
  }),

  rex('DYw0oHsN3Jc', 'kivenro.flexibility', 'ig-st-bent-knee-fold', 'Bent-Knee Seated Forward Fold', 'stretch',
    ['hamstrings'], ['glutes', 'calves'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Bend the knees as much as you need to get the chest onto the thighs with a long spine',
      'Fold from the hips. If the back rounds to reach your feet, you are stretching the wrong thing',
      'Straighten the knees only as far as the flat spine survives — that edge is the exercise',
    ],
    notes: 'The creator\'s whole point: it was never about keeping the legs straight. Reaching your toes with a rounded back is not a hamstring stretch.',
    tags: ['flexibility', 'wind-down', 'passive-stretch', 'beginner-friendly', 'home', 'no-equipment'],
  }),

  rex('DZNdQTeT6mx', 'elastaboy', 'ig-is-fire-hydrant', 'Quadruped Hip Abduction', 'isolation',
    ['abductors', 'glutes'], ['obliques'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: [
      'On hands and knees, lift one knee out to the side without letting the torso roll away',
      'Slow reps — the creator repeats "slow" over the demonstration',
      'Targets gluteus medius, the hip stabiliser that sitting switches off',
    ],
    notes: 'Creator\'s claim: gluteus medius weakens by up to 35% after eight hours of daily sitting. That figure is theirs and I have not verified it.',
    tags: ['rehab', 'hip-mobility', 'run', 'home', 'no-equipment', 'posture'],
  }),

  rex('DZNdQTeT6mx', 'elastaboy', 'ig-co-bear-hover', 'Bear Hover', 'core-anti-extension',
    ['abs'], ['front-delts', 'quads', 'obliques'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Hands and knees, toes tucked, knees hovering an inch off the floor',
      'Flat back, ribs down, breathe — nothing should sway',
      'Opens the creator\'s glute-medius sequence as the bracing position',
    ],
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  // ============ FROM WATCHED VIDEO (batch 2) ============

  rex('Db02yVqsDFs', 'mickmovements', 'ig-st-reclined-quad', 'Reclined Quad Stretch', 'stretch',
    ['quads', 'hip-flexors'], ['abs'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Sit back between or onto the heels, then lean back on the hands as far as the knees allow',
      'Tuck the tailbone under before leaning — otherwise the lower back takes the stretch instead of the quads',
      'Come out of it the moment the knees complain rather than the thighs',
    ],
    notes: 'Opens a four-part German routine aimed at anterior pelvic tilt. The on-screen label reads "Dehnung des vorderen Oberschenkel" — stretch of the front thigh — over an overlay highlighting quadriceps and hip flexors.',
    tags: ['flexibility', 'wind-down', 'passive-stretch', 'desk-relief', 'home', 'no-equipment', 'posture'],
  }),

  rex('DXo23-9DDXq', 'ruchomybalans', 'ig-mo-crossed-down-dog', 'Crossed-Leg Downward Dog', 'mobility',
    ['hamstrings', 'lats'], ['calves', 'upper-back', 'front-delts'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'From downward dog, cross one leg behind the other and press the hips back and up',
      'The crossover biases one side of the back line — you will feel which side is tighter immediately',
      'Move in and out of it rather than holding; the creator prescribes 10 reps each side, daily',
    ],
    notes: 'Labelled on screen as decompressing the spine and stretching the whole back.',
    tags: ['wake', 'active-mobility', 'spine', 'flexibility', 'home', 'no-equipment'],
  }),

  rex('DXo23-9DDXq', 'ruchomybalans', 'ig-co-side-plank-reach', 'Side Plank Reach', 'core-anti-rotation',
    ['obliques'], ['abductors', 'front-delts', 'glutes'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'Side plank on one hand, feet staggered, top arm reaching long toward the ceiling',
      'Open the chest to the ceiling and back down under control — the hips stay lifted throughout',
      'Trains the lateral chain and hip mobility together, which a static side plank does not',
    ],
    tags: ['core', 'hip-mobility', 'home', 'no-equipment', 'travel'],
  }),

  rex('DXo23-9DDXq', 'ruchomybalans', 'ig-mo-quadruped-rot-reach', 'Quadruped Rotational Reach', 'mobility',
    ['upper-back'], ['front-delts', 'obliques', 'abs'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'From hands and knees, take one arm off the floor and rotate it open toward the ceiling',
      'The supporting shoulder does the work — push the floor away and do not let it collapse',
      'Different from a passive thread-the-needle: here the shoulder is loaded the whole time',
    ],
    notes: 'Labelled on screen as building shoulder stability and rotational control.',
    tags: ['wake', 'shoulder-mobility', 'shoulder-health', 'active-mobility', 'spine', 'home', 'no-equipment'],
  }),

  rex('DaTRKEhoVbl', 'physio__leon', 'ig-hg-single-leg-bridge', 'Single-Leg Glute Bridge', 'hinge',
    ['glutes', 'hamstrings'], ['abs', 'lower-back'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'Bridge the hips up, then extend one leg so the sole points at the ceiling',
      'Hold the hip height while the leg moves — if the hips drop, the working glute has stopped',
      'Ten per side. Done lying down, so it genuinely works as a first-thing or last-thing drill',
    ],
    notes: 'From a German physiotherapist\'s "exercises you can do in bed" series, aimed at hamstrings and glutes.',
    tags: ['wake', 'wind-down', 'rehab', 'home', 'no-equipment', 'run'],
  }),

  rex('DWmROJIAhXR', 'jacobjbergquist', 'ig-is-prone-scap-slide', 'Prone Scapular Slides', 'pull-horizontal',
    ['upper-back', 'rear-delts'], ['traps', 'lats'], ['bodyweight'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Lie face down and slide something with a little weight along the floor — books on carpet work',
      'Move through overhead, then out to a Y, then wide to a T, keeping the arms long',
      'The shoulder blades do the work; if the elbows bend you have handed it to the arms',
    ],
    notes: 'Creator\'s framing: scapular control is the missing piece for most overhead problems.',
    tags: ['shoulder-mobility', 'shoulder-health', 'desk-relief', 'rehab', 'home', 'no-equipment', 'posture'],
  }),

  rex('DZqCAoLTnLt', 'komal_yoga_flow', 'ig-st-reclined-bound-twist', 'Reclined Bound Twist', 'stretch',
    ['lower-back', 'glutes'], ['obliques', 'quads'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: [
      'On your back, cross one leg over, then reach behind and catch the foot to bind the position',
      'The bind is what makes this different from a plain supine twist — it pins the pelvis so the rotation goes into the spine',
      'Both shoulders stay down. If one lifts, drop the bind and take the easier version',
    ],
    notes: 'A deeper progression of the supine twist. The reel overlays the lumbar spine and sacrum to show the target.',
    tags: ['wind-down', 'passive-stretch', 'spine', 'hip-mobility', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('DcKEdCbTT4q', 'nikai_fit', 'ig-kb-half-kneeling-chop', 'Half-Kneeling Chop', 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'glutes'], ['kettlebell'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'Half-kneeling, drive the bell diagonally from high on one side to low on the other',
      'The hips stay square and still — the chop is resisted rotation, not a twist',
      'Creator programmes 3 × 20 per side',
    ],
    notes: 'From a "forget sit-ups, do these instead" set. Movement names were shown on screen.',
    tags: ['kettlebell', 'core', 'anti-rotation'],
  }),

  rex('DcKEdCbTT4q', 'nikai_fit', 'ig-co-bear-pass-through', 'Bear Crawl Pass-Through', 'core-anti-rotation',
    ['abs', 'obliques'], ['front-delts', 'quads'], ['kettlebell'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'Bear position with the knees hovering, pass a kettlebell under your body hand to hand',
      'Hips level throughout — the bell moving under you is trying to make you rotate, and you refuse',
      '3 × 20 alternating',
    ],
    tags: ['kettlebell', 'core', 'home', 'anti-rotation'],
  }),

  rex('DcHKUPtoGpK', 'ediz.du', 'ig-co-plank-pull-through', 'Plank Pull-Through', 'core-anti-rotation',
    ['abs', 'obliques'], ['front-delts', 'lats'], ['kettlebell'], {
    unilateral: true, difficulty: 3, loadType: 'reps',
    cues: [
      'High plank with straight legs, drag a kettlebell under the body from one hand to the other',
      'Widen the feet to steady yourself; the hips must not tip as the weight crosses',
      'Harder than the bear-position version because the legs are long — longer lever, more rotation to resist',
    ],
    notes: 'One of four in a German kettlebell core set; the movement names were captioned on screen.',
    tags: ['kettlebell', 'core', 'anti-rotation', 'home'],
  }),

  rex('DZSaZorMb_4', 'jenyaprakop', 'ig-co-heel-taps', 'Lying Heel Taps', 'core-flexion',
    ['obliques'], ['abs'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: [
      'On your back, knees bent and feet flat, curl slightly up and reach one hand toward that heel',
      'Side-bend to reach rather than twisting — the shoulders stay off the floor the whole set',
      'Part of a 3 × 15 no-equipment circuit',
    ],
    tags: ['core', 'home', 'no-equipment', 'beginner-friendly', 'travel'],
  }),

  rex('Dbd0yp4tJ2m', 'alexgloeckle', 'ig-mo-bws-wings', 'Thoracic Wings', 'mobility',
    ['upper-back'], ['rear-delts', 'obliques'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Kneeling or sitting tall, hands behind the head, elbows wide',
      'Open the elbows and extend through the upper back, then close and round — the movement lives between the shoulder blades',
      'Ribs stay down; if the lower back arches you have moved the wrong segment',
    ],
    notes: 'German "BWS Wings" — BWS is Brustwirbelsäule, the thoracic spine. One minute of a five-minute daily sequence.',
    tags: ['wake', 'spine', 'desk-relief', 'shoulder-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DcJVaRJKqgf', 'bertiespfit', 'ig-run-lateral-duck', 'Lateral Ducks', 'run',
    ['adductors', 'glutes'], ['quads', 'abductors'], ['outdoors'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: [
      'Half-squat, chest up, then travel sideways staying low the whole way',
      'Do not bob up between steps — the point is loading the hips through a lateral range you never use running forwards',
      'Sixty seconds, changing direction halfway',
    ],
    notes: 'Fourth movement in a five-minute pre-run warm-up.',
    tags: ['run', 'warmup', 'hip-mobility', 'active-mobility', 'outdoors'],
  }),

  rex('DXLGGZbiI5Y', '_calvisthenics', 'ig-st-cross-body-shoulder', 'Cross-Body Shoulder Stretch', 'stretch',
    ['rear-delts'], ['upper-back', 'traps'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: [
      'Draw one straight arm across the chest and hold it with the other forearm',
      'Keep the shoulder down rather than letting it ride up toward the ear',
      'The stretch belongs at the back of the shoulder; if it pinches in front, ease off',
    ],
    tags: ['shoulder-mobility', 'wind-down', 'passive-stretch', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('DXLGGZbiI5Y', '_calvisthenics', 'ig-st-front-splits', 'Front Splits', 'stretch',
    ['hamstrings', 'hip-flexors'], ['glutes', 'adductors'], ['bodyweight'], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: [
      'Front leg forward, back leg behind, hips square to the front',
      'Hands or blocks on the floor take your weight — sink only as far as you can hold the hips level',
      'Squaring the hips matters more than depth. A deep, twisted split trains nothing you want',
    ],
    notes: 'Part of a nine-part stretch guide. A long-term project rather than a daily drill.',
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', 'home', 'no-equipment'],
  }),

  rex('DXLGGZbiI5Y', '_calvisthenics', 'ig-mo-full-bridge', 'Full Bridge', 'mobility',
    ['lower-back', 'front-delts'], ['glutes', 'quads', 'chest'], ['bodyweight'], {
    difficulty: 3, loadType: 'time',
    cues: [
      'On your back, hands by the ears, press the whole body up into an arch',
      'Push the chest through toward the hands and let the shoulders open — that is where the range should come from',
      'If the lower back is doing all of it, work the shoulder and thoracic pieces separately first',
    ],
    notes: 'The most advanced item in the guide. Build the thoracic and shoulder range before chasing the shape.',
    tags: ['flexibility', 'spine', 'shoulder-mobility', 'home', 'no-equipment'],
  }),

  rex('DcGIexvDG8y', 'posturemaxed', 'ig-mo-chin-tuck', 'Chin Tuck', 'mobility',
    ['neck'], ['upper-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Draw the chin straight back, as if making a double chin — do not tip the head down',
      'The motion is tiny. If it looks like a nod, it is the wrong movement',
      'Trains the deep neck flexors that give out under a day of looking at a screen',
    ],
    notes: 'Named in a posture-app promotion rather than demonstrated in detail; the drill itself is standard for forward-head posture.',
    tags: ['desk-relief', 'wake', 'rehab', 'posture', 'home', 'no-equipment', 'shoulder-health'],
  }),

  rex('DY--H9fg-6Y', 'squat_university', 'ig-cd-ball-slam', 'Medicine Ball Slam', 'conditioning',
    ['abs', 'lats'], ['obliques', 'glutes', 'front-delts'], ['medicine-ball'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Ball overhead, then drive it into the floor with the whole trunk rather than the arms',
      'Follow the ball down into a hinge — do not stay upright and throw',
      'The value is producing force fast, which no plank variation trains',
    ],
    notes: 'From a clinician\'s round-up of core work he argues most people skip.',
    tags: ['conditioning', 'finisher', 'core'],
  }),

  rex('DY--H9fg-6Y', 'squat_university', 'ig-co-side-plank-leg-lift', 'Side Plank with Leg Lift', 'core-anti-rotation',
    ['obliques'], ['abductors', 'glutes'], ['bodyweight'], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: [
      'Hold a side plank, then lift the top leg and keep it there',
      'The hips must not drift backwards as the leg rises',
      'Adds a hip abduction demand to a position that is already resisting side bend',
    ],
    notes: 'The reel overlays the external oblique, whose job here is static lateral flexion — resisting collapse rather than creating movement.',
    tags: ['core', 'home', 'no-equipment', 'rehab'],
  }),

  rex('DX7N4-SRrqe', 'sam_phill', 'ig-co-scissors', 'Scissors', 'core-anti-extension',
    ['abs'], ['hip-flexors', 'quads'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'On your back, legs straight and low, alternate them up and down without touching the floor',
      'Lower back stays pressed down the whole time — the moment it lifts, raise the legs higher',
      'Thirty seconds is plenty',
    ],
    notes: 'From a university gymnastics team\'s five-minute core circuit.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DX7N4-SRrqe', 'sam_phill', 'ig-co-arch-rocks', 'Arch Rocks', 'core-anti-extension',
    ['lower-back', 'glutes'], ['rear-delts', 'hamstrings'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Face down, arms and legs lifted into a shallow arch, then rock forwards and back',
      'Squeeze glutes and keep the arch rigid — the rocking comes from the whole body, not from flapping the limbs',
      'The mirror image of a hollow hold, and the reason gymnasts train both',
    ],
    notes: 'Gymnastics staple. The hollow trains the front line, the arch trains the back line; doing only one builds an imbalance.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DcEGYXNtWfe', 'marcelovaty', 'ig-pr-gorilla-row', 'Gorilla Row', 'pull-horizontal',
    ['lats', 'upper-back'], ['biceps', 'forearms', 'lower-back'], ['kettlebell'], {
    unilateral: true, difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Two bells on the floor between wide feet, hinge over and row them alternately',
      'The free hand stays braced on the other bell — that is what lets you stay hinged and heavy',
      'Grip is usually the limiter, which is the point',
    ],
    notes: 'From a competitive swimmer\'s strength session, posted under an ironic "exercises I\'d never do" framing.',
    tags: ['kettlebell', 'swim', 'grip'],
  }),

  rex('DcEGYXNtWfe', 'marcelovaty', 'ig-co-lumberjack', 'Landmine Lumberjack', 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'glutes', 'lats'], ['barbell'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'One end of a barbell in a landmine or wedged in a corner; swing the other end across the body, high to low',
      'Rotate through the ribs with the hips staying quiet — the arms only hold on',
      'The kettlebell half-kneeling chop is the same job without a landmine',
    ],
    tags: ['core', 'anti-rotation', 'swim'],
  }),

  rex('DakkTKuTYAx', 'joelbergannholz', 'ig-run-short-sprint', 'Short Sprint', 'run',
    ['hamstrings', 'glutes'], ['quads', 'calves', 'abs'], ['outdoors'], {
    difficulty: 3, loadType: 'distance-time',
    cues: [
      'Roughly 30 metres flat out, then walk back slowly and go again — five rounds',
      'Warm up properly first. A cold maximal sprint is one of the more reliable ways to tear a hamstring',
      'Full recovery between reps. If the fifth is much slower than the first, you rested too little',
    ],
    notes: 'Creator\'s protocol: twice a week, about ten minutes. They also claim it beats an hour of cardio, raises testosterone and deepens sleep — those are their claims, not established findings. The training logic of short maximal efforts is sound regardless; it trains a speed quality that the 800m repeats in the Run program do not touch.',
    tags: ['run', 'intervals', 'conditioning', 'outdoors'],
  }),

  rex('DbNnzzGIGgS', 'marcelovaty', 'ig-mo-toe-taps', 'Toe Taps', 'mobility',
    ['hamstrings'], ['front-delts', 'abs', 'upper-back'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'From a downward-dog shape, reach one hand back to tap the opposite foot, then swap',
      'Push the hips high and keep the legs as straight as the hamstrings allow',
      'Rotation, hamstring length and shoulder load in one movement — which is why it opens a swim warm-up',
    ],
    notes: 'First movement of a nine-minute poolside warm-up from a competitive swimmer.',
    tags: ['swim', 'warmup', 'active-mobility', 'shoulder-mobility', 'home', 'no-equipment'],
  }),

  rex('DamorWtCeSf', 'adamstaysmoving', 'ig-mo-downward-dog', 'Downward Dog', 'mobility',
    ['hamstrings', 'calves'], ['front-delts', 'lats', 'upper-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Hands and feet down, hips pressed high and back into an inverted V',
      'Bend the knees as much as you need to get a long spine — a straight-legged rounded back is the wrong trade',
      'Press the floor away through the hands; the shoulders should feel like they are working',
    ],
    notes: 'Foundational enough that it was missing from the library only by accident — several drills already reference it as a starting position.',
    tags: ['wake', 'wind-down', 'active-mobility', 'flexibility', 'shoulder-mobility', 'home', 'no-equipment'],
  }),

  rex('DZYpR9XgsGL', 'mathiaspegueroeriksen', 'ig-co-sit-up', 'Sit-Up', 'core-flexion',
    ['abs'], ['hip-flexors', 'obliques'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Knees bent, feet down, curl the spine up one segment at a time rather than hinging from the hips',
      'Lower with the same control you rose with — that half is where most of the work is',
      'Hands across the chest; behind the head invites you to haul on your own neck',
    ],
    notes: 'Plain enough that the library had somehow never included it, despite carrying a dozen of its variations.',
    tags: ['core', 'home', 'no-equipment', 'travel', 'beginner-friendly'],
  }),

  rex('DZYpR9XgsGL', 'mathiaspegueroeriksen', 'ig-co-spiderman-plank', 'Spider-Man Plank', 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'From a forearm or high plank, draw one knee out and forward toward the same-side elbow',
      'Slow and deliberate. This is not a mountain climber — the hips stay level and nothing bounces',
      'Return the foot to the start under control before switching',
    ],
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DZKZdLvI74Y', 'lucaswest_fit', 'ig-co-extended-crunch', 'Extended-Range Crunch', 'core-flexion',
    ['abs'], ['obliques'], ['bodyweight', 'mat'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Rolled mat or foam roller under the mid-back so the spine extends slightly before you curl up',
      'That extension is the whole point — a floor crunch starts at neutral and trains half the range',
      'Hold a weight on the chest once bodyweight gets easy, rather than chasing more reps',
    ],
    notes: 'The creator\'s argument: at home you have no decline bench, and a rolled mat buys back the range of motion that makes the movement worth doing.',
    tags: ['core', 'home', 'travel'],
  }),

  rex('Cy8ABKwgX5Q', 'lorenz.fit_', 'ig-co-support-hold', 'Support Hold', 'core-anti-extension',
    ['abs', 'front-delts'], ['triceps', 'chest', 'traps'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'On parallel bars, parallettes or two solid chairs: arms locked, shoulders pushed down away from the ears',
      'Ribs down, legs together, body dead straight — this is a plank stood on its end',
      'Ten seconds here is the entry requirement for everything else on this list',
    ],
    notes: 'First step of a four-stage L-sit progression: support hold, knee raises, one-leg L-sit, full L-sit.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('Cy8ABKwgX5Q', 'lorenz.fit_', 'ig-co-l-sit', 'L-Sit', 'core-flexion',
    ['abs', 'hip-flexors'], ['quads', 'front-delts', 'triceps'], ['bodyweight'], {
    difficulty: 3, loadType: 'time',
    cues: [
      'From a support hold, lift both straight legs to horizontal and hold',
      'Push the floor or bars away hard — sinking into the shoulders is what makes it feel impossible',
      'Progress through knee raises, then one leg, then both. Skipping stages just means failing at the last one',
    ],
    notes: 'The creator names the two limiters when legs will not straighten: hamstring length, and hip flexor strength at end range.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DbYuCyaBVss', 'sebastian.rollan', 'ig-mo-knee-raise-hold', 'Standing Knee Raise Hold', 'mobility',
    ['hip-flexors'], ['abs', 'glutes'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: [
      'Stand tall, draw one knee up as high as it will go under its own power, and hold it there',
      'No hands, and no leaning back to buy height — that is borrowing range from the spine',
      'Active strength at the top of hip flexion, which swings and circles never train',
    ],
    notes: 'From a martial artist crediting this for kicking height. The same quality carries over to running knee drive.',
    tags: ['hip-mobility', 'active-mobility', 'run', 'warmup', 'home', 'no-equipment', 'balance'],
  }),

  rex('DZCEx1JOvU1', 'chasspk', 'ig-mo-deep-squat-knee-touch', 'Deep Squat Knee Touches', 'mobility',
    ['adductors', 'glutes'], ['quads', 'calves'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'Sit into the bottom of a squat, then lower one knee toward the floor and back without standing up',
      'Heels stay down and the chest stays tall — the moment you have to stand, the set is over',
      'Rotation into the deep squat rather than just sitting in it, which is what makes it a drill rather than a hold',
    ],
    tags: ['hip-mobility', 'ankle', 'active-mobility', 'warmup', 'home', 'no-equipment'],
  }),

  rex('DZCEx1JOvU1', 'chasspk', 'ig-st-pancake-sweeps', 'Pancake Sweeps', 'mobility',
    ['adductors'], ['hamstrings', 'obliques', 'lower-back'], ['bodyweight'], {
    unilateral: true, difficulty: 3, loadType: 'reps',
    cues: [
      'Sit in a wide straddle and sweep the chest from over one leg, through the middle, to the other',
      'Keep the toes and knees pointing up — rolling the legs in makes the range look better and trains less',
      'The moving version of a pancake hold; use it to warm the position before you sit in it',
    ],
    tags: ['flexibility', 'hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('DaN-QbipQi-', 'conor_harris_', 'ig-co-supine-heel-drag', 'Supine Heel Drag', 'core-anti-extension',
    ['abs', 'hamstrings'], ['glutes', 'adductors'], ['bodyweight', 'box'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'On your back with the feet up on a chair or bench, a roller or cushion squeezed between the knees',
      'Tilt the pelvis back so the lower back flattens to the floor — that tilt is the exercise, the legs are just the handle',
      'Holding the tilt, gently drag the heels toward you against the surface. Stop the moment the back arches away',
      'One or two sets; this is a positioning drill, not a burner',
    ],
    notes: 'A rehab-style drill for people whose pelvis sits tipped forward. The squeeze between the knees and the heel drag are both there to bring the hamstrings and adductors in so the lower back stops doing the holding.',
    tags: ['rehab', 'core', 'desk-relief', 'posture', 'home', 'hip-mobility'],
  }),

  rex('DahPG3uTDxL', 'cmarsh.lifts', 'ig-co-lying-leg-raise', 'Lying Leg Raise', 'core-flexion',
    ['abs', 'hip-flexors'], ['obliques'], ['bodyweight', 'mat'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Flat on your back, hands under the hips if you need them, raise both straight legs then lower slowly',
      'Stop lowering at the point your lower back would lift — that height is your range, and it improves',
      'Bend the knees to make it easier rather than shortening the range at the top',
    ],
    notes: 'The library had the hanging version and none of the floor one, which is the harder movement to earn and the easier one to start.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DTQ0Zr2EcjB', 'jamesmoorewellness', 'ig-st-seated-interscapular', 'Seated Interscapular Stretch', 'stretch',
    ['upper-back', 'rear-delts'], ['traps', 'lats'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: [
      'Sitting in a chair: hands on the waist, squeeze the elbows and knees toward each other, then round forward',
      'Variation two — turn one palm outward and draw that arm down and across',
      'Variation three — reach down, take hold of one foot and push the leg away while staying rounded',
      'All three chase the same spot between the shoulder blades from a chair, which is where the tightness is built in the first place',
    ],
    notes: 'Aimed at the interscapular tightness that accumulates from sitting and phone use. Distinct from thread-the-needle in that none of it requires getting on the floor.',
    tags: ['desk-relief', 'wind-down', 'passive-stretch', 'shoulder-mobility', 'posture', 'home', 'no-equipment'],
  }),

  rex('DcGhZOCtV4d', 'healthy_raina', 'ig-pr-pelvic-floor', 'Pelvic Floor Contractions', 'protocol',
    ['abs'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Draw the pelvic floor up and in, hold, then fully release — the release matters as much as the squeeze',
      'Do not hold your breath, and do not brace the glutes or abs to help; if they are working, the target is not',
      'Five rounds of twenty seconds, from kneeling, a bridge, or seated with the soles together',
    ],
    notes: 'Trainable like any other muscle and almost never trained. Worth raising with a physio if you have symptoms rather than self-prescribing volume.',
    tags: ['recovery', 'rehab', 'home', 'no-equipment', 'core'],
  }),

  rex('DbbdtMKuhO0', 'falkefit', 'ig-co-vertical-hip-lift', 'Vertical Leg Hip Lift', 'core-flexion',
    ['abs'], ['obliques', 'hip-flexors'], ['bodyweight', 'mat'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Flat on your back, legs straight up at ninety degrees, arms pressed into the floor',
      'Drive the hips straight up toward the ceiling — a few centimetres of real lift beats a big swing',
      'Lower under control. Kicking the legs to generate momentum turns it into nothing',
    ],
    notes: 'Creator programmes fifteen reps per set.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('Da8G3K-McYy', 'willbickleyfitness', 'ig-ph-db-pullover', 'Dumbbell Pullover', 'push-horizontal',
    ['chest', 'lats'], ['triceps', 'abs'], ['dumbbell', 'bench'], {
    difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Lying along or across a bench, one dumbbell held over the chest, lower it back overhead with soft elbows',
      'Go only as far as the ribs stay down — flaring them makes the range look bigger and moves the work to the lower back',
      'Programmed 3 × 10-12 in a dumbbell-only session',
    ],
    tags: [],
  }),

  rex('Da8G3K-McYy', 'willbickleyfitness', 'ig-is-tricep-kickback', 'Dumbbell Tricep Kickback', 'isolation',
    ['triceps'], ['rear-delts'], ['dumbbell'], {
    unilateral: true, difficulty: 1, loadType: 'weight-reps',
    cues: [
      'Hinged over with the upper arm pinned alongside the ribs, straighten the elbow behind you',
      'Only the forearm moves. If the shoulder swings back to help, the weight is too heavy',
      'Squeeze at full extension — that top position is the entire exercise',
    ],
    notes: 'Closes a dumbbell-only session at 3 × 12-15.',
    tags: [],
  }),

  rex('DZwN7aiTp8R', 'loganmaxxer', 'ig-mo-behind-back-reach', 'Behind-the-Back Reach', 'mobility',
    ['rear-delts', 'front-delts'], ['traps', 'upper-back', 'triceps'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: [
      'One hand reaches down over the shoulder, the other comes up behind the lower back, and you pass a bottle or towel between them',
      'It is a test as much as a drill — the gap between your two sides tells you which shoulder has lost internal rotation',
      'Work the tighter side more; the easy side does not need the practice',
    ],
    notes: 'From a posture-app promotion, but the movement is the standard shoulder rotation self-check.',
    tags: ['shoulder-mobility', 'shoulder-health', 'desk-relief', 'active-mobility', 'home', 'no-equipment'],
  }),

  rex('Db1QXXIok_f', 'alanh.11', 'ig-co-long-lever-reach', 'Long-Lever Plank Reach', 'core-anti-extension',
    ['abs'], ['obliques', 'front-delts', 'lats'], ['bodyweight'], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: [
      'From a forearm plank, walk one arm forward until it is almost straight out in front of you',
      'The further the hand travels from the feet, the longer the lever and the harder the abs have to work to stop the back sagging',
      'Reach only as far as you can hold the ribs down — this gets ugly fast',
    ],
    notes: 'Shown under the heading of training the deep trunk muscles rather than chasing visible abs.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DQXV019jI_7', 'freddisthenics', 'ig-mo-squat-heel-raise', 'Deep Squat Heel Raise', 'mobility',
    ['calves'], ['quads', 'adductors'], ['bodyweight'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Sit into a deep squat, then press up onto the toes and lower the heels again without standing',
      'Loads the calf, ankle and shin through a range you never visit standing upright',
      'Twenty reps, first thing — the creator does all three of these every morning',
    ],
    notes: 'Translated from German. On-screen overlay marks the calf, ankle joint and shin as the targets.',
    tags: ['wake', 'ankle', 'active-mobility', 'home', 'no-equipment', 'rehab'],
  }),

  rex('DPOtcIbjk7h', 'nick.fox05', 'ig-st-quad-sit', 'Quad Sit', 'stretch',
    ['quads'], ['hip-flexors', 'calves'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Kneel with the shins flat and sit back onto the heels, staying upright',
      'Tops of the feet pressed down — this stretches the ankles as much as the quads',
      'Sit on a cushion between the heels if the knees complain, and build down from there',
    ],
    notes: 'Opens a college athlete\'s nightly stretch routine at one minute. Simpler than the reclined version: no leaning back, so the knees take far less.',
    tags: ['wind-down', 'passive-stretch', 'ankle', 'home', 'no-equipment', 'beginner-friendly'],
  }),

  rex('DZ5kftpMJjl', 'vasilshimboff', 'ig-pr-wide-stance-high-pull', 'Wide-Stance High Pull', 'pull-horizontal',
    ['upper-back', 'rear-delts'], ['lats', 'biceps', 'traps', 'glutes'], ['kettlebell'], {
    unilateral: true, difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Wide stance, hinged over, one bell on the floor between the feet',
      'Pull it up and out with the elbow driving high and wide rather than tucking to the hip — that is what shifts it from lats to upper back and rear delts',
      'Alternate sides continuously; the hinge holds still while the arms swap',
    ],
    notes: 'The creator uses full-body drills like this in place of isolated arm sessions, at about ten minutes a day.',
    tags: ['kettlebell', 'home', 'conditioning'],
  }),

  rex('DZyCpFWB5Hz', 'jakethomasfitness', 'ig-co-wall-crunch', 'Wall-Supported Crunch', 'core-flexion',
    ['abs'], ['obliques', 'hip-flexors'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: [
      'Lie with the feet braced flat on a wall, knees around ninety degrees, and crunch from there',
      'The wall fixes the legs so the hip flexors stop hauling you up — it is the cheapest way to make a floor crunch honest',
      'Vary it by reaching across to one knee, or by lifting the hips at the top',
    ],
    notes: 'Programmed 2 × 12 of each variation, four times a week. The reel\'s headline promises a six-pack in twelve days, which is not how body composition works — the movement is fine, the claim is marketing.',
    tags: ['core', 'home', 'no-equipment', 'beginner-friendly', 'travel'],
  }),

  rex('DXQ4zp6DHoE', 'bene.manohara.yoga', 'ig-mo-upward-dog', 'Upward Dog', 'mobility',
    ['abs', 'chest'], ['front-delts', 'lower-back', 'hip-flexors'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Prone, hands under the shoulders, press up until the arms are straight and the thighs leave the floor',
      'Push the floor away and draw the shoulders down and back — shrugging up into the ears is the usual fault',
      'Deeper than sphinx pose because the hips lift; take sphinx instead if the lower back complains',
    ],
    notes: 'Translated from German. Second of four drills in a chest and shoulder opening sequence.',
    tags: ['wake', 'spine', 'shoulder-mobility', 'active-mobility', 'desk-relief', 'home', 'no-equipment'],
  }),

  rex('DXQ4zp6DHoE', 'bene.manohara.yoga', 'ig-st-shoulder-clasp', 'Kneeling Shoulder Clasp', 'stretch',
    ['front-delts', 'chest'], ['biceps', 'upper-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Kneeling or standing, clasp the hands behind the back and lift them away from you',
      'Chest lifts as the hands rise — if the shoulders roll forward you have gone past your range',
      'Take hold of a towel between the hands if they will not meet',
    ],
    notes: 'Translated from German ("Schulteröffnung").',
    tags: ['wind-down', 'desk-relief', 'shoulder-mobility', 'passive-stretch', 'home', 'no-equipment'],
  }),

  rex('DXQ4zp6DHoE', 'bene.manohara.yoga', 'ig-st-eagle-arms', 'Eagle Arms', 'stretch',
    ['rear-delts', 'upper-back'], ['traps'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: [
      'Cross one arm under the other at the elbows, then wind the forearms together and lift the elbows',
      'Pull the shoulder blades apart and let the upper back round — the opposite of everything else you do',
      'Swap which arm goes underneath; one side will be noticeably worse',
    ],
    notes: 'Translated from German ("Adlerarme"). Targets the space between the shoulder blades from the front.',
    tags: ['wind-down', 'desk-relief', 'shoulder-mobility', 'passive-stretch', 'home', 'no-equipment'],
  }),

  rex('DcG3xyDMQuu', 'vasilshimboff', 'ig-kb-squat-clean-press', 'Double Kettlebell Squat Clean & Press', 'conditioning',
    ['quads', 'glutes'], ['front-delts', 'triceps', 'abs', 'forearms'], ['kettlebell'], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'Two bells on the floor between the feet, sit into a deep squat and clean them to the rack',
      'Stay low and press overhead from the squat rather than standing up between reps — that is what makes it the whole workout',
      'Twenty minutes at a pace you can hold; grip usually decides when you stop',
    ],
    notes: 'The creator\'s pitch is one movement covering legs, glutes, core, arms, shoulders and grip, trained as cardio, strength and conditioning at once. Same philosophy as their Shelf Loader, with two bells and a lower position.',
    tags: ['kettlebell', 'conditioning', 'home', 'travel', 'finisher'],
  }),

  rex('DZh70nTMwiw', 'jenyaprakop', 'ig-co-star-crunch', 'Star Crunch', 'core-flexion',
    ['abs'], ['obliques', 'hip-flexors'], ['bodyweight'], {
    difficulty: 2, loadType: 'reps',
    cues: [
      'Start spread wide on your back — arms overhead, legs apart, like a star',
      'Crunch everything toward the middle so opposite hand and foot meet above you, then return to the full spread',
      'The spread start is the point: a longer lever than a plain crunch, so the abs work through more range',
    ],
    notes: 'Opens a twelve-minute no-equipment set at twenty reps.',
    tags: ['core', 'home', 'no-equipment', 'travel'],
  }),

  rex('DZh70nTMwiw', 'jenyaprakop', 'ig-co-side-plank-hops', 'Plank Hops', 'core-anti-rotation',
    ['obliques', 'abs'], ['front-delts', 'quads', 'calves'], ['bodyweight'], {
    difficulty: 3, loadType: 'reps',
    cues: [
      'High plank on the hands, hop both feet in toward one side, then back out',
      'Land softly and keep the shoulders stacked over the hands — the hips will want to swing, and stopping them is the work',
      'Ten per side, and stop when the landing gets loud',
    ],
    tags: ['core', 'conditioning', 'home', 'no-equipment', 'travel'],
  }),

  rex('DaSHX0vTMkN', 'loganmaxxer', 'ig-co-psoas-march', 'Psoas March', 'core-anti-extension',
    ['hip-flexors', 'abs'], ['quads', 'lower-back'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: [
      'On your back with both knees drawn up over the hips, lower one foot toward the floor and bring it back',
      'The lower back stays flat the whole time — that is the whole exercise, and it is why the range is small',
      'Two sets of ten per side. Add a band around the feet once it feels easy',
    ],
    notes: 'Strengthens the hip flexors rather than stretching them, which is the half most hip routines skip.',
    tags: ['core', 'rehab', 'hip-mobility', 'posture', 'home', 'no-equipment', 'run'],
  }),

  rex('CvjwuEFgYwL', 'lennoslifts', 'ig-is-zottman-curl', 'Zottman Curl', 'isolation',
    ['biceps', 'forearms'], [], ['dumbbell'], {
    difficulty: 1, loadType: 'weight-reps',
    cues: [
      'Curl up with the palms facing you, rotate the palms over at the top, then lower with the backs of the hands leading',
      'The lowering half is the point — it loads the forearm extensors that a normal curl never touches',
      'Go lighter than your usual curl; the pronated lowering is the limiting half',
    ],
    tags: [],
  }),

  rex('CvjwuEFgYwL', 'lennoslifts', 'ig-pr-tbar-row', 'T-Bar Row', 'pull-horizontal',
    ['upper-back', 'lats'], ['biceps', 'rear-delts', 'lower-back'], ['barbell'], {
    difficulty: 2, loadType: 'weight-reps',
    cues: [
      'Hinged over a bar anchored at one end, pull the handle to the stomach with the elbows close',
      'Chest stays down through the rep — standing up to finish the pull is the usual cheat',
      'The neutral grip lets you load it heavier than a barbell row without the same lower-back tax',
    ],
    notes: 'Listed on the chest-and-back day of a beginner three-day split.',
    tags: [],
  }),
]
