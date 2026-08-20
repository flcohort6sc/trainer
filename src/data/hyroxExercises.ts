/**
 * The Hyrox stations, and the honest substitutes for the ones you cannot do.
 *
 * A Hyrox is eight 1km runs with a station between each. Four of them need
 * equipment an ordinary gym does not have — a SkiErg, a rower, a sled and a
 * wall ball target — so this file carries **both**: the real station, tagged
 * with the kit it needs, and a substitute that says in its own notes that it is
 * a substitute.
 *
 * That distinction is the whole point. `eligibleFor` only offers the real
 * station if you have ticked the equipment for it, so a plan built at a gym
 * without a sled quietly gets the treadmill push instead — and the exercise
 * itself tells you what it is standing in for rather than letting you believe
 * you trained the station.
 *
 * Movements written from established coaching practice and cross-checked
 * against how the Hyrox coaching community actually substitutes them. Nothing
 * here is reconstructed from a video nobody watched.
 */

import type { Exercise } from '../types'

const now = '2026-08-20T00:00:00.000Z'

type Extras = Partial<Omit<Exercise, 'id' | 'name' | 'pattern' | 'primaryMuscles' | 'secondaryMuscles' | 'equipment'>>

const ex = (
  id: Exercise['id'],
  name: string,
  pattern: Exercise['pattern'],
  primaryMuscles: Exercise['primaryMuscles'],
  secondaryMuscles: Exercise['secondaryMuscles'],
  equipment: Exercise['equipment'],
  extras: Extras = {},
): Exercise => ({
  id, name, pattern, primaryMuscles, secondaryMuscles, equipment,
  unilateral: false,
  difficulty: 2,
  loadType: 'reps',
  cues: [],
  tags: [],
  createdAt: now,
  ...extras,
})

export const HYROX_EXERCISES: Exercise[] = [
  // ---------------------------------------------- the real stations
  ex('hx-ski-erg', 'SkiErg Intervals', 'conditioning', ['lats', 'abs'], ['triceps', 'upper-back'], ['ski-erg'], {
    loadType: 'distance-time',
    difficulty: 2,
    tags: ['hyrox', 'station', 'conditioning'],
    cues: [
      'Drive from the hips and abs, not the arms — the arms only finish the stroke',
      'Full extension at the top, hands past the hips at the bottom',
      'Race pace is 1000m; practise negative splits rather than dying at 600',
    ],
    notes: 'Hyrox station 1. 1000m.',
  }),
  ex('hx-row', 'Rowing Intervals', 'conditioning', ['lats', 'quads'], ['upper-back', 'hamstrings'], ['rower'], {
    loadType: 'distance-time',
    tags: ['hyrox', 'station', 'conditioning'],
    cues: [
      'Legs, then hips, then arms — and exactly the reverse coming back',
      'The handle travels in a straight line; the knees drop out of its way',
      'Stroke rate 24–28 for the race distance, not 36',
    ],
    notes: 'Hyrox station 5. 1000m.',
  }),
  ex('hx-sled-push', 'Sled Push', 'conditioning', ['quads', 'glutes'], ['calves', 'abs'], ['sled'], {
    loadType: 'distance',
    difficulty: 3,
    tags: ['hyrox', 'station', 'legs'],
    cues: [
      'Low body angle, arms long — you are pushing through the sled, not into it',
      'Short choppy steps beat long strides; keep the sled moving rather than restarting it',
      'Breathe on a rhythm you set before it hurts',
    ],
    notes: 'Hyrox station 2. 50m, heavy.',
  }),
  ex('hx-sled-pull', 'Sled Pull', 'pull-horizontal', ['lats', 'upper-back'], ['biceps', 'glutes'], ['sled'], {
    loadType: 'distance',
    difficulty: 3,
    tags: ['hyrox', 'station', 'pull'],
    cues: [
      'Sit back into the rope and use your bodyweight, do not just row with the arms',
      'Hand over hand, and keep the rope moving between pulls',
      'Reset your feet rather than reaching further than you can hold',
    ],
    notes: 'Hyrox station 3. 50m.',
  }),
  ex('hx-wall-ball', 'Wall Ball', 'conditioning', ['quads', 'glutes'], ['front-delts', 'abs'], ['wall-ball'], {
    difficulty: 2,
    tags: ['hyrox', 'station', 'conditioning'],
    cues: [
      'One movement: catch, absorb into the squat, drive up and release at the top',
      'The legs throw the ball — the arms only guide it',
      'Catch it high and let it take you down; fighting it costs the whole set',
    ],
    notes: 'Hyrox station 8, and the one people fail. 100 reps.',
  }),
  ex('hx-sandbag-lunge', 'Sandbag Lunge', 'lunge', ['quads', 'glutes'], ['abs', 'upper-back'], ['sandbag'], {
    unilateral: true,
    difficulty: 3,
    tags: ['hyrox', 'station', 'legs'],
    cues: [
      'Bag high on the back of the shoulders, elbows down',
      'Knee to the floor, not past it — bouncing off the ground is a disqualification',
      'Stand fully at the top of each rep',
    ],
    notes: 'Hyrox station 7. 100m.',
  }),
  ex('hx-burpee-broad-jump', 'Burpee Broad Jump', 'conditioning', ['quads', 'chest'], ['glutes', 'abs'], ['bodyweight'], {
    difficulty: 2,
    tags: ['hyrox', 'station', 'home', 'conditioning'],
    cues: [
      'Chest to the floor, then jump forward rather than up',
      'Land soft and immediately fold into the next one',
      'Pace it from the first rep — this is the station that decides your race',
    ],
    notes: 'Hyrox station 6. 80m. Needs nothing but floor.',
  }),
  ex('hx-farmers-carry-heavy', 'Heavy Farmer Carry', 'carry', ['forearms', 'traps'], ['abs', 'glutes'], ['kettlebell'], {
    loadType: 'weight-time',
    difficulty: 2,
    tags: ['hyrox', 'station', 'grip'],
    cues: [
      'Ribs down, shoulders back — do not let the weight round you forward',
      'Walk, do not shuffle; long steady steps',
      'Grip fails before the legs do. Chalk, and set the bells down before you drop them',
    ],
    notes: 'Hyrox station 4. 200m.',
  }),

  // ---------------------------------------------- substitutes, labelled as such
  ex('hx-sub-treadmill-push', 'Treadmill Sled Push', 'conditioning', ['quads', 'glutes'], ['calves'], ['treadmill'], {
    loadType: 'time',
    difficulty: 2,
    tags: ['hyrox', 'substitute', 'legs'],
    cues: [
      'Motor OFF. Hands on the front rail, arms long, body at a low angle',
      'Drive the belt with short powerful steps',
      'Stop when the position breaks, not when the timer says so',
    ],
    notes: 'Substitute for the sled push, not the sled push. It trains the same legs and lungs and cannot teach you what 150kg on carpet feels like — do a few real sessions before race day.',
  }),
  ex('hx-sub-towel-push', 'Towel Sled Push', 'conditioning', ['quads', 'glutes'], ['abs'], ['bodyweight', 'mat'], {
    loadType: 'distance',
    difficulty: 2,
    tags: ['hyrox', 'substitute', 'home', 'legs'],
    cues: [
      'Weight on a towel on a smooth floor, hands on it, hips low',
      'Push in a straight line and keep it moving',
      'Add weight by adding plates, or a person',
    ],
    notes: 'Substitute for the sled push when there is no sled and no treadmill. Closer to the real thing than a leg press, still not the real thing.',
  }),
  ex('hx-sub-straight-arm-pulldown', 'Straight-Arm Pulldown', 'pull-vertical', ['lats'], ['abs', 'triceps'], ['cable'], {
    difficulty: 1,
    tags: ['hyrox', 'substitute', 'pull'],
    cues: [
      'Arms stay straight — this is a shoulder extension, not a triceps push',
      'Hinge slightly and pull the bar to your thighs in an arc',
      'Same double-pole arc the SkiErg asks for, which is why it is here',
    ],
    notes: 'Substitute for the SkiErg. Trains the pulling arc and the lats; gives you none of the pacing, which is most of that station.',
  }),
  ex('hx-sub-band-overhead-pull', 'Band Overhead Pull-Down', 'pull-vertical', ['lats'], ['abs'], ['bands'], {
    difficulty: 1,
    tags: ['hyrox', 'substitute', 'home', 'pull'],
    cues: [
      'Anchor high, hinge from the hips as you pull down past your thighs',
      'Finish with the hips, not by bending the elbows',
      'High reps — this is an engine drill, not a strength one',
    ],
    notes: 'Substitute for the SkiErg you can do at home with one band.',
  }),
  ex('hx-sub-heavy-row', 'Heavy Bent-Over Row', 'pull-horizontal', ['lats', 'upper-back'], ['biceps', 'lower-back'], ['barbell'], {
    loadType: 'weight-reps',
    difficulty: 2,
    tags: ['hyrox', 'substitute', 'pull'],
    cues: [
      'Torso near horizontal and staying there — no rising with each rep',
      'Pull to the belly button, elbows past the ribs',
      'Heavy and controlled; the sled pull is a strength station',
    ],
    notes: 'Substitute for the sled pull. Trains the same pulling strength without the hand-over-hand rhythm or the grip fatigue.',
  }),
  ex('hx-sub-db-thruster', 'Dumbbell Thruster', 'conditioning', ['quads', 'front-delts'], ['glutes', 'triceps'], ['dumbbell'], {
    loadType: 'weight-reps',
    difficulty: 2,
    tags: ['hyrox', 'substitute', 'conditioning'],
    cues: [
      'One movement — the press starts before the legs finish',
      'Elbows up in the front rack, weight through the mid-foot',
      'Breathe at the top, never at the bottom',
    ],
    notes: 'Substitute for wall balls. The squat-to-press is the same; the catch and the target height are not, and those are what wreck your shoulders at rep 70.',
  }),
  ex('hx-sub-medball-slam', 'Overhead Medicine Ball Slam', 'conditioning', ['abs', 'lats'], ['front-delts', 'quads'], ['medicine-ball'], {
    difficulty: 1,
    tags: ['hyrox', 'substitute', 'conditioning'],
    cues: [
      'Reach tall, then throw the ball down with the whole trunk',
      'Follow it down into a hinge rather than staying upright',
      'Continuous — the value is in not stopping',
    ],
    notes: 'Substitute for the SkiErg. The overhead-to-floor arc is the closest common movement to a double pole.',
  }),

  // ---------------------------------------------- filling the thin patterns
  ex('gy-zercher-squat', 'Zercher Squat', 'squat', ['quads', 'glutes'], ['upper-back', 'abs'], ['barbell'], {
    loadType: 'weight-reps',
    difficulty: 3,
    tags: ['strength'],
    cues: [
      'Bar in the crooks of the elbows, held tight to the chest',
      'It will force you upright — that is the point of it',
      'Start far lighter than your back squat; the position is the limit, not the legs',
    ],
  }),
  ex('gy-front-rack-carry', 'Front Rack Carry', 'carry', ['abs', 'traps'], ['quads', 'front-delts'], ['kettlebell'], {
    loadType: 'weight-time',
    difficulty: 2,
    tags: ['core', 'grip'],
    cues: [
      'Bells in the rack, elbows tight to the ribs',
      'Breathe shallow and often — the rack position fights your diaphragm, which is the training effect',
      'Ribs down; the moment you lean back, stop',
    ],
  }),
  ex('gy-waiter-walk', 'Waiter Walk', 'carry', ['front-delts', 'traps'], ['abs', 'forearms'], ['kettlebell'], {
    unilateral: true,
    loadType: 'weight-time',
    difficulty: 2,
    tags: ['shoulder-health', 'core'],
    cues: [
      'One bell locked out overhead, biceps by the ear',
      'Walk slowly and do not let the arm drift forward',
      'Brilliant for overhead stability, and humbling with a small weight',
    ],
  }),
  ex('gy-neutral-pullup', 'Neutral-Grip Pull-Up', 'pull-vertical', ['lats'], ['biceps', 'upper-back'], ['pullup-bar'], {
    difficulty: 2,
    tags: ['shoulder-friendly'],
    cues: [
      'Palms facing each other — the friendliest grip for most shoulders',
      'Dead hang, shoulders down, then elbows to the ribs',
      'Chest towards the bar rather than chin over it',
    ],
  }),
  ex('gy-z-press', 'Z Press', 'push-vertical', ['front-delts'], ['abs', 'triceps'], ['dumbbell', 'mat'], {
    loadType: 'weight-reps',
    difficulty: 3,
    tags: ['core', 'shoulder-health'],
    cues: [
      'Sit on the floor, legs straight in front, and press from there',
      'Nothing to arch against, so it exposes exactly how much of your press was lower back',
      'Very light to begin with',
    ],
  }),
  ex('gy-trap-bar-deadlift', 'Trap Bar Deadlift', 'hinge', ['glutes', 'hamstrings'], ['quads', 'traps'], ['barbell'], {
    loadType: 'weight-reps',
    difficulty: 2,
    tags: ['strength', 'hyrox'],
    cues: [
      'Stand in the middle, push the floor away rather than pulling the bar up',
      'More forgiving on the lower back than a straight bar, and heavier for most people',
      'Lock out with the glutes, not by leaning back',
    ],
  }),
  ex('gy-curtsy-lunge', 'Curtsy Lunge', 'lunge', ['glutes', 'quads'], ['adductors', 'abductors'], ['dumbbell'], {
    unilateral: true,
    difficulty: 2,
    tags: ['glutes'],
    cues: [
      'Step back and across rather than straight back',
      'Hips stay square to the front — the crossing happens at the legs',
      'Hits the side of the glute that straight-ahead work misses',
    ],
  }),
  ex('gy-deficit-reverse-lunge', 'Deficit Reverse Lunge', 'lunge', ['glutes', 'quads'], ['hamstrings'], ['dumbbell', 'box'], {
    unilateral: true,
    difficulty: 2,
    tags: ['glutes', 'strength'],
    cues: [
      'Front foot on a low platform so the back knee travels further down',
      'The extra range is the whole exercise; do not shorten it to add weight',
      'Torso slightly forward to bias the glute',
    ],
  }),
]
