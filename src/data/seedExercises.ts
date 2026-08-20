/**
 * Starter exercise library.
 *
 * This is scaffolding, not scripture -- edit, delete, or archive anything.
 * The point is to give the generator a pool wide enough to actually produce
 * variety on day one. Every exercise you add from a reel uses this same shape.
 */

import type { Exercise, Equipment, Muscle, MovementPattern, LoadType } from '../types'

/** Terse builder so the table below stays readable. */
export function ex(
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
    notes: opts.notes,
    createdAt: '2024-01-01T00:00:00.000Z',
  }
}

export const SEED_EXERCISES: Exercise[] = [
  // ---------- SQUAT (knee-dominant, bilateral) ----------
  ex('sq-back', 'Back Squat', 'squat', ['quads', 'glutes'], ['hamstrings', 'abs', 'lower-back'], ['barbell'], {
    difficulty: 2,
    cues: ['Brace before you unrack, not after', 'Knees track over mid-foot', 'Drive the floor apart'],
  }),
  ex('sq-front', 'Front Squat', 'squat', ['quads'], ['glutes', 'abs', 'upper-back'], ['barbell'], {
    difficulty: 3,
    cues: ['Elbows high through the whole rep', 'Stay tall — chest collapses first, bar follows'],
  }),
  ex('sq-goblet', 'Goblet Squat', 'squat', ['quads', 'glutes'], ['abs'], ['dumbbell'], {
    difficulty: 1,
    cues: ['Elbows inside the knees at the bottom', 'Let the weight counterbalance you'],
    tags: ['beginner-friendly'],
  }),
  ex('sq-hack', 'Machine Hack Squat', 'squat', ['quads'], ['glutes'], ['machine'], {
    difficulty: 1,
    cues: ['Feet low on the platform biases quads'],
  }),
  ex('sq-leg-press', 'Leg Press', 'squat', ['quads', 'glutes'], ['hamstrings'], ['machine'], {
    difficulty: 1,
    cues: ['Do not let the lower back round off the pad at the bottom'],
  }),
  ex('sq-box', 'Box Squat', 'squat', ['quads', 'glutes'], ['hamstrings'], ['barbell', 'box'], {
    difficulty: 2,
    cues: ['Sit back, do not just sit down', 'Pause — do not bounce off the box'],
  }),
  ex('sq-bw', 'Bodyweight Squat', 'squat', ['quads', 'glutes'], [], ['bodyweight'], {
    cues: ['Sit down between your feet rather than folding forward', 'Knees track over the middle toes, not inward', 'Full depth if your ankles allow it — this is where the range comes from'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup', 'travel', 'home', 'no-equipment'],
  }),

  // ---------- LUNGE (knee-dominant, unilateral) ----------
  ex('ln-bulgarian', 'Bulgarian Split Squat', 'lunge', ['quads', 'glutes'], ['hamstrings', 'adductors'], ['dumbbell', 'bench'], {
    unilateral: true,
    difficulty: 2,
    cues: ['Front shin vertical for quads, torso leaned for glutes', 'Back foot is a kickstand, not a driver'],
  }),
  ex('ln-walking', 'Walking Lunge', 'lunge', ['quads', 'glutes'], ['hamstrings', 'calves'], ['dumbbell'], {
    unilateral: true,
    difficulty: 2,
    cues: ['Step long enough that the front knee stays behind the toes'],
  }),
  ex('ln-reverse', 'Reverse Lunge', 'lunge', ['glutes', 'quads'], ['hamstrings'], ['dumbbell'], {
    unilateral: true,
    difficulty: 1,
    cues: ['Easier on the knees than a forward lunge'],
  }),
  ex('ln-step-up', 'Step-Up', 'lunge', ['quads', 'glutes'], ['calves'], ['dumbbell', 'box'], {
    unilateral: true,
    difficulty: 1,
    cues: ['Do not push off the trailing foot — all the work is the top leg'],
  }),
  ex('ln-cossack', 'Cossack Squat', 'lunge', ['adductors', 'quads'], ['glutes'], ['bodyweight'], {
    cues: ['Push the hips back on the bending side and keep that heel down', 'Straight leg stays straight, toes up', 'Go only as low as you can come back up from without a hand down'],
    unilateral: true,
    difficulty: 2,
    loadType: 'reps',
    tags: ['mobility', 'home', 'no-equipment'],
  }),

  // ---------- HINGE (hip-dominant) ----------
  ex('hg-deadlift', 'Conventional Deadlift', 'hinge', ['hamstrings', 'glutes', 'lower-back'], ['upper-back', 'traps', 'forearms'], ['barbell'], {
    difficulty: 3,
    cues: ['Take the slack out of the bar before you pull', 'Push the floor away, do not yank'],
  }),
  ex('hg-rdl', 'Romanian Deadlift', 'hinge', ['hamstrings', 'glutes'], ['lower-back'], ['barbell'], {
    difficulty: 2,
    cues: ['Push hips back, do not bend down', 'Stop when the hamstrings stop, not when the floor does'],
  }),
  ex('hg-rdl-db', 'Dumbbell RDL', 'hinge', ['hamstrings', 'glutes'], ['lower-back'], ['dumbbell'], {
    difficulty: 1,
    cues: ['Drag the dumbbells down the thighs'],
  }),
  ex('hg-single-rdl', 'Single-Leg RDL', 'hinge', ['hamstrings', 'glutes'], ['abs', 'lower-back'], ['dumbbell'], {
    unilateral: true,
    difficulty: 3,
    cues: ['Hips stay square — the trailing hip wants to open', 'Fix your eyes one spot on the floor'],
    tags: ['balance'],
  }),
  ex('hg-hip-thrust', 'Barbell Hip Thrust', 'hinge', ['glutes'], ['hamstrings'], ['barbell', 'bench'], {
    difficulty: 2,
    cues: ['Chin tucked, ribs down', 'Full lockout — squeeze, do not just touch'],
  }),
  ex('hg-swing', 'Kettlebell Swing', 'hinge', ['glutes', 'hamstrings'], ['lower-back', 'abs'], ['kettlebell'], {
    difficulty: 2,
    cues: ['It is a hinge, not a squat', 'The bell floats — you do not lift it with the arms'],
    tags: ['conditioning', 'finisher'],
  }),
  ex('hg-good-morning', 'Good Morning', 'hinge', ['hamstrings', 'lower-back'], ['glutes'], ['barbell'], {
    difficulty: 3,
    cues: ['Light. This is not a squat variation.'],
  }),
  ex('hg-back-ext', 'Back Extension', 'hinge', ['lower-back', 'glutes'], ['hamstrings'], ['machine'], {
    cues: ['Hinge at the hips, not the lower back — the spine stays long', 'Squeeze the glutes to come up rather than yanking with the back', 'Stop level with your legs; arching past that adds nothing'],
    difficulty: 1,
    loadType: 'reps',
  }),
  ex('hg-glute-bridge', 'Glute Bridge', 'hinge', ['glutes'], ['hamstrings'], ['bodyweight', 'mat'], {
    difficulty: 1,
    loadType: 'reps',
    cues: ['Posteriorly tilt first, then lift — otherwise the lower back does the work'],
    tags: ['warmup', 'rehab', 'home', 'no-equipment'],
  }),
  ex('hg-nordic', 'Nordic Hamstring Curl', 'hinge', ['hamstrings'], ['glutes'], ['bodyweight', 'mat'], {
    difficulty: 3,
    loadType: 'reps',
    cues: ['Lower as slowly as you can control, push back up with hands'],
    tags: ['home', 'no-equipment'],
  }),

  // ---------- PUSH HORIZONTAL ----------
  ex('ph-bench', 'Barbell Bench Press', 'push-horizontal', ['chest'], ['triceps', 'front-delts'], ['barbell', 'bench'], {
    difficulty: 2,
    cues: ['Shoulder blades pinned back and down', 'Bar to the lower chest, not the throat'],
  }),
  ex('ph-db-bench', 'Dumbbell Bench Press', 'push-horizontal', ['chest'], ['triceps', 'front-delts'], ['dumbbell', 'bench'], {
    difficulty: 1,
    cues: ['Slight arc inward at the top — do not clang them together'],
  }),
  ex('ph-incline', 'Incline Dumbbell Press', 'push-horizontal', ['chest', 'front-delts'], ['triceps'], ['dumbbell', 'bench'], {
    difficulty: 1,
    cues: ['30-45 degrees. Steeper and it becomes a shoulder press.'],
  }),
  ex('ph-pushup', 'Push-Up', 'push-horizontal', ['chest'], ['triceps', 'front-delts', 'abs'], ['bodyweight'], {
    difficulty: 1,
    loadType: 'reps',
    cues: ['Body is a plank — hips do not sag or pike'],
    tags: ['travel', 'warmup', 'home', 'no-equipment'],
  }),
  ex('ph-dip', 'Chest Dip', 'push-horizontal', ['chest', 'triceps'], ['front-delts'], ['bodyweight'], {
    difficulty: 3,
    loadType: 'reps',
    cues: ['Lean forward for chest, stay upright for triceps'],
  }),
  ex('ph-cable-fly', 'Cable Fly', 'push-horizontal', ['chest'], ['front-delts'], ['cable'], {
    difficulty: 1,
    cues: ['Soft elbow, fixed angle — it is a hug, not a press'],
  }),
  ex('ph-machine-press', 'Machine Chest Press', 'push-horizontal', ['chest'], ['triceps', 'front-delts'], ['machine'], {
    cues: ['Set the seat so the handles sit at mid-chest', 'Shoulder blades stay pinned to the pad throughout', 'Stop just short of locking out to keep the chest loaded'],
    difficulty: 1,
  }),

  // ---------- PUSH VERTICAL ----------
  ex('pv-ohp', 'Overhead Press', 'push-vertical', ['front-delts'], ['triceps', 'abs', 'upper-back'], ['barbell'], {
    difficulty: 2,
    cues: ['Squeeze the glutes — stops the lower back arching', 'Head through the window at lockout'],
  }),
  ex('pv-db-press', 'Seated Dumbbell Shoulder Press', 'push-vertical', ['front-delts'], ['triceps'], ['dumbbell', 'bench'], {
    cues: ['Ribs down — the arch belongs in your upper back, not your lower', 'Press slightly back so the bells finish over your ears', 'Elbows about 30° forward of the shoulders, not flared wide'],
    difficulty: 1,
  }),
  ex('pv-arnold', 'Arnold Press', 'push-vertical', ['front-delts', 'side-delts'], ['triceps'], ['dumbbell'], {
    difficulty: 2,
    cues: ['Rotate as you press, not before'],
  }),
  ex('pv-push-press', 'Push Press', 'push-vertical', ['front-delts'], ['triceps', 'quads'], ['barbell'], {
    difficulty: 3,
    cues: ['Short dip, violent drive — the legs start it, the arms finish it'],
  }),
  ex('pv-pike-pushup', 'Pike Push-Up', 'push-vertical', ['front-delts'], ['triceps'], ['bodyweight'], {
    cues: ['Hips high, head between the arms — this is a vertical press, not a push-up', 'Crown of the head to the floor between your hands', 'Feet on a box makes it harder, hands on a box easier'],
    difficulty: 2,
    loadType: 'reps',
    tags: ['travel', 'home', 'no-equipment'],
  }),
  ex('pv-landmine', 'Half-Kneeling Landmine Press', 'push-vertical', ['front-delts'], ['abs', 'triceps'], ['barbell'], {
    unilateral: true,
    difficulty: 2,
    cues: ['Shoulder-friendly when overhead pressing hurts'],
    tags: ['shoulder-friendly'],
  }),

  // ---------- PULL VERTICAL ----------
  ex('pu-pullup', 'Pull-Up', 'pull-vertical', ['lats'], ['biceps', 'upper-back', 'forearms'], ['pullup-bar'], {
    difficulty: 3,
    loadType: 'reps',
    cues: ['Start from a dead hang, shoulders active', 'Drive the elbows into your back pockets'],
  }),
  ex('pu-chinup', 'Chin-Up', 'pull-vertical', ['lats', 'biceps'], ['upper-back'], ['pullup-bar'], {
    cues: ['Start from a dead hang with the shoulders pulled down', 'Drive the elbows to the ribs rather than thinking about the hands', 'Chest to the bar; chin over is the bare minimum'],
    difficulty: 2,
    loadType: 'reps',
  }),
  ex('pu-lat-pulldown', 'Lat Pulldown', 'pull-vertical', ['lats'], ['biceps', 'upper-back'], ['cable'], {
    difficulty: 1,
    cues: ['Lean back slightly and stay there — do not row it'],
  }),
  ex('pu-assisted', 'Assisted Pull-Up', 'pull-vertical', ['lats'], ['biceps'], ['machine'], {
    cues: ['Use the least assistance that lets you control the way down', 'Same rules as a chin-up — dead hang, elbows to ribs', 'Lower slowly; the eccentric is what builds the unassisted one'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['beginner-friendly'],
  }),
  ex('pu-band-pulldown', 'Band Lat Pulldown', 'pull-vertical', ['lats'], ['biceps'], ['bands'], {
    cues: ['Anchor high and step back so the band pulls slightly forward', 'Pull the elbows down and back, not the hands down', 'Keep the ribs down so it does not become a lean-back'],
    difficulty: 1,
    tags: ['travel'],
  }),

  // ---------- PULL HORIZONTAL ----------
  ex('pr-bb-row', 'Barbell Row', 'pull-horizontal', ['upper-back', 'lats'], ['biceps', 'lower-back'], ['barbell'], {
    difficulty: 2,
    cues: ['Torso angle stays fixed — do not use it as a pump handle'],
  }),
  ex('pr-db-row', 'Single-Arm Dumbbell Row', 'pull-horizontal', ['lats', 'upper-back'], ['biceps'], ['dumbbell', 'bench'], {
    unilateral: true,
    difficulty: 1,
    cues: ['Pull to the hip, not the armpit'],
  }),
  ex('pr-cable-row', 'Seated Cable Row', 'pull-horizontal', ['upper-back', 'lats'], ['biceps', 'rear-delts'], ['cable'], {
    difficulty: 1,
    cues: ['Let the shoulder blades travel — do not lock them'],
  }),
  ex('pr-chest-supported', 'Chest-Supported Row', 'pull-horizontal', ['upper-back', 'rear-delts'], ['lats', 'biceps'], ['dumbbell', 'bench'], {
    difficulty: 1,
    cues: ['Removes the lower back entirely — good on deadlift days'],
  }),
  ex('pr-inverted', 'Inverted Row', 'pull-horizontal', ['upper-back', 'lats'], ['biceps', 'abs'], ['bodyweight', 'barbell'], {
    cues: ['Body in one line from heels to head, glutes on', 'Pull the chest to the bar, elbows past the ribs', 'Feet on a box makes it harder, walk them in to make it easier'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['travel', 'home'],
  }),
  ex('pr-face-pull', 'Face Pull', 'pull-horizontal', ['rear-delts', 'upper-back'], ['traps'], ['cable'], {
    difficulty: 1,
    cues: ['Pull to the forehead, thumbs back at the end'],
    tags: ['shoulder-health'],
  }),
  ex('pr-meadows', 'Landmine Row', 'pull-horizontal', ['lats', 'upper-back'], ['biceps'], ['barbell'], {
    cues: ['Stand side-on to the landmine, hips square', 'Row in an arc towards the hip, not straight up', 'Let the shoulder blade travel — this one wants range'],
    unilateral: true,
    difficulty: 2,
  }),

  // ---------- CARRY ----------
  ex('cr-farmer', 'Farmer Carry', 'carry', ['forearms', 'traps'], ['abs', 'glutes'], ['dumbbell'], {
    difficulty: 1,
    loadType: 'weight-time',
    cues: ['Walk tall, do not lean away from the weight'],
    tags: ['finisher'],
  }),
  ex('cr-suitcase', 'Suitcase Carry', 'carry', ['obliques', 'forearms'], ['abs', 'traps'], ['kettlebell'], {
    unilateral: true,
    difficulty: 1,
    loadType: 'weight-time',
    cues: ['Resist the side bend — that is the whole exercise'],
  }),
  ex('cr-overhead', 'Overhead Carry', 'carry', ['front-delts', 'abs'], ['traps', 'upper-back'], ['kettlebell'], {
    cues: ['Elbow locked, biceps by the ear, ribs down', 'Walk small and slow; the shoulder is doing the work', 'Stop the set when the arm starts to drift forward'],
    difficulty: 2,
    loadType: 'weight-time',
  }),

  // ---------- CORE ----------
  ex('co-plank', 'Plank', 'core-anti-extension', ['abs'], ['obliques'], ['bodyweight', 'mat'], {
    difficulty: 1,
    loadType: 'time',
    cues: ['Squeeze glutes and quads — a plank is not a rest position'],
    tags: ['home', 'no-equipment'],
  }),
  ex('co-ab-wheel', 'Ab Wheel Rollout', 'core-anti-extension', ['abs'], ['lats', 'lower-back'], ['ab-wheel'], {
    difficulty: 3,
    loadType: 'reps',
    cues: ['Ribs down, hips tucked — the back must not arch'],
  }),
  ex('co-deadbug', 'Dead Bug', 'core-anti-extension', ['abs'], ['hip-flexors'], ['bodyweight', 'mat'], {
    difficulty: 1,
    loadType: 'reps',
    cues: ['Lower back stays glued to the floor'],
    tags: ['warmup', 'rehab', 'home', 'no-equipment'],
  }),
  ex('co-bird-dog', 'Bird Dog', 'core-anti-extension', ['abs', 'lower-back'], ['glutes'], ['bodyweight', 'mat'], {
    unilateral: true,
    difficulty: 1,
    loadType: 'reps',
    cues: ['Balance a glass of water on your lower back — nothing should tip'],
    tags: ['warmup', 'rehab', 'home', 'no-equipment'],
  }),
  ex('co-pallof', 'Pallof Press', 'core-anti-rotation', ['obliques', 'abs'], [], ['cable'], {
    unilateral: true,
    difficulty: 1,
    cues: ['The cable wants to twist you. Do not let it.'],
  }),
  ex('co-side-plank', 'Side Plank', 'core-anti-rotation', ['obliques'], ['abs', 'glutes'], ['bodyweight', 'mat'], {
    cues: ['Stack the shoulder over the elbow and the feet over each other', 'Push the floor away so the bottom shoulder is not sagging into the joint', 'Hips up and forward — no rotation towards the floor'],
    unilateral: true,
    difficulty: 1,
    loadType: 'time',
    tags: ['home', 'no-equipment'],
  }),
  ex('co-hanging-leg', 'Hanging Leg Raise', 'core-flexion', ['abs', 'hip-flexors'], ['forearms'], ['pullup-bar'], {
    difficulty: 3,
    loadType: 'reps',
    cues: ['Posteriorly tilt the pelvis at the top or it is just a hip flexor curl'],
  }),
  ex('co-cable-crunch', 'Cable Crunch', 'core-flexion', ['abs'], [], ['cable'], {
    difficulty: 1,
    cues: ['Crunch the ribs to the pelvis — hips stay put'],
  }),
  ex('co-hollow', 'Hollow Body Hold', 'core-anti-extension', ['abs'], ['hip-flexors'], ['bodyweight', 'mat'], {
    cues: ['Lower back pressed into the floor before anything else moves', 'Lower the arms and legs only as far as you can hold that contact', 'Breathe. If you cannot, the position is too long for you'],
    difficulty: 2,
    loadType: 'time',
    tags: ['travel', 'home', 'no-equipment'],
  }),

  // ---------- ISOLATION ----------
  ex('is-curl-db', 'Dumbbell Curl', 'isolation', ['biceps'], ['forearms'], ['dumbbell'], {
    difficulty: 1,
    cues: ['Elbows stay by the ribs — no swinging from the shoulder', 'Turn the pinky up at the top', 'Lower over about three seconds; that is most of the growth'],
  }),
  ex('is-curl-hammer', 'Hammer Curl', 'isolation', ['biceps', 'forearms'], [], ['dumbbell'], {
    difficulty: 1,
    cues: ['Neutral grip throughout, thumbs up', 'Elbows pinned, no rocking', 'Trains the brachialis and forearm more than a supinated curl does'],
  }),
  ex('is-curl-cable', 'Cable Curl', 'isolation', ['biceps'], ['forearms'], ['cable'], {
    difficulty: 1,
    cues: ['Constant tension is the point — do not rest at the bottom', 'Step back far enough that the cable pulls at an angle', 'Squeeze at the top rather than trying to pull further up'],
  }),
  ex('is-tri-pushdown', 'Triceps Pushdown', 'isolation', ['triceps'], [], ['cable'], {
    difficulty: 1,
    cues: ['Elbows pinned at your sides for the whole set', 'Push down and slightly back, finishing with the arms straight', 'Lean forward a few degrees and stay there'],
  }),
  ex('is-tri-skull', 'Skull Crusher', 'isolation', ['triceps'], [], ['dumbbell', 'bench'], {
    difficulty: 2,
    cues: ['Elbows stay pointed at the ceiling'],
  }),
  ex('is-tri-overhead', 'Overhead Cable Extension', 'isolation', ['triceps'], [], ['cable'], {
    difficulty: 1,
    cues: ['The long head only stretches with the arm overhead — this beats pushdowns for size'],
  }),
  ex('is-lat-raise', 'Lateral Raise', 'isolation', ['side-delts'], [], ['dumbbell'], {
    difficulty: 1,
    cues: ['Lead with the elbow', 'Light weight. If you swing, it does nothing.'],
  }),
  ex('is-rear-fly', 'Rear Delt Fly', 'isolation', ['rear-delts'], ['upper-back'], ['dumbbell'], {
    difficulty: 1,
    cues: ['Hinge over and let the arms hang straight down', 'Throw the elbows out sideways rather than lifting the hands', 'Light — the moment you shrug, it stopped being a rear delt exercise'],
  }),
  ex('is-leg-curl', 'Leg Curl', 'isolation', ['hamstrings'], ['calves'], ['machine'], {
    difficulty: 1,
    cues: ['Hips stay down on the pad', 'Point the toes away to bias the hamstrings', 'Control the return; do not let the stack drop'],
  }),
  ex('is-leg-ext', 'Leg Extension', 'isolation', ['quads'], [], ['machine'], {
    difficulty: 1,
    cues: ['Pad on the ankle, not the shin', 'Pause a beat at the top with the knee straight', 'Slow on the way down — that is where the knee tendon adapts'],
  }),
  ex('is-calf-raise', 'Standing Calf Raise', 'isolation', ['calves'], [], ['machine'], {
    difficulty: 1,
    cues: ['Pause at the bottom stretch, pause at the top'],
  }),
  ex('is-shrug', 'Barbell Shrug', 'isolation', ['traps'], ['forearms'], ['barbell'], {
    difficulty: 1,
    cues: ['Straight up and down; rolling the shoulders adds nothing', 'Pause at the top for a second', 'Straps if your grip fails before your traps do'],
  }),
  ex('is-hip-abduction', 'Hip Abduction', 'isolation', ['abductors', 'glutes'], [], ['machine'], {
    difficulty: 1,
    cues: ['Push the knees out against the pad without leaning back', 'A slight forward lean biases the glute medius', 'Slow, not swung — this is a small muscle'],
  }),
  ex('is-band-pullapart', 'Band Pull-Apart', 'isolation', ['rear-delts', 'upper-back'], [], ['bands'], {
    cues: ['Arms straight, band at chest height', 'Pull until the band touches the sternum, shoulder blades together', 'High reps, light band — this is shoulder health work, not a lift'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup', 'shoulder-health'],
  }),

  // ---------- CONDITIONING ----------
  ex('cd-bike', 'Assault Bike Intervals', 'conditioning', ['quads', 'hamstrings'], ['abs'], ['machine'], {
    cues: ['Drive with the legs and let the arms follow', 'Sit still — bouncing wastes the effort', 'Pace it so the last interval looks like the first'],
    difficulty: 1,
    loadType: 'time',
    tags: ['finisher', 'conditioning'],
  }),
  ex('cd-burpee', 'Burpee', 'conditioning', ['quads', 'chest'], ['abs', 'front-delts'], ['bodyweight'], {
    cues: ['Chest to the floor, then one clean jump', 'Step back instead of jumping if the low back rounds', 'Find a rhythm you can hold rather than sprinting the first ten'],
    difficulty: 2,
    loadType: 'reps',
    tags: ['finisher', 'travel', 'home', 'no-equipment'],
  }),
  ex('cd-jump-rope', 'Jump Rope', 'conditioning', ['calves'], ['quads'], ['bodyweight'], {
    cues: ['Wrists turn the rope, not the arms', 'Small jumps, land on the balls of the feet', 'Relaxed shoulders — this is a calf and forearm exercise before it is a lung one'],
    difficulty: 1,
    loadType: 'time',
    tags: ['warmup', 'conditioning', 'home'],
  }),
  ex('cd-mtn-climber', 'Mountain Climber', 'conditioning', ['abs', 'hip-flexors'], ['front-delts'], ['bodyweight'], {
    cues: ['Hips stay level with the shoulders — no piking up', 'Drive the knee to the chest without letting the low back sag', 'Hands under the shoulders, arms locked'],
    difficulty: 1,
    loadType: 'time',
    tags: ['finisher', 'travel', 'home', 'no-equipment'],
  }),
  ex('cd-kb-snatch', 'Kettlebell Snatch', 'conditioning', ['glutes', 'hamstrings'], ['front-delts', 'traps'], ['kettlebell'], {
    cues: ['It is a hip snap, not an arm lift', 'Punch the hand through at the top so the bell lands softly on the forearm', 'Learn the swing and the high pull first — this one bruises the forearm while you are learning'],
    unilateral: true,
    difficulty: 3,
    loadType: 'reps',
    tags: ['conditioning'],
  }),

  // ---------- MOBILITY / WARMUP ----------
  ex('mo-cat-cow', 'Cat-Cow', 'mobility', ['lower-back'], ['abs'], ['bodyweight', 'mat'], {
    cues: ['Move one vertebra at a time rather than flopping between the ends', 'Breathe out as you round, in as you extend', 'The point is spinal segmentation, so go slowly'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup'],
  }),
  ex('mo-90-90', '90/90 Hip Switch', 'mobility', ['hip-flexors', 'glutes'], [], ['bodyweight', 'mat'], {
    cues: ['Both knees at right angles, sit tall on both sit bones', 'Rotate from the hips, not by pushing off your hands', 'Lean forward over the front shin for a deeper stretch'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup'],
  }),
  ex('mo-worlds-greatest', "World's Greatest Stretch", 'mobility', ['hip-flexors', 'adductors'], ['upper-back', 'hamstrings', 'obliques'], ['bodyweight'], {
    unilateral: true,
    difficulty: 2,
    loadType: 'time',
    cues: [
      'Deep lunge, back knee off the floor',
      'Drop the elbow inside the front foot, then rotate up and open',
    ],
    tags: ['warmup', 'wake', 'hip-mobility', 'active-mobility', 'home', 'no-equipment'],
  }),
  ex('mo-shoulder-dislocate', 'Band Shoulder Dislocate', 'mobility', ['front-delts'], ['upper-back'], ['bands'], {
    cues: ['Wide grip to start, narrow it over weeks as the shoulders open', 'Arms stay straight the whole way over', 'Ribs down — arching the low back is how you fake range you do not have'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup', 'shoulder-health'],
  }),
  ex('mo-thoracic-rotation', 'Open Book Thoracic Rotation', 'mobility', ['upper-back'], ['obliques'], ['bodyweight', 'mat'], {
    cues: ['Knees stay stacked and still; the movement is above the waist', 'Follow the top hand with your eyes', 'Exhale at the end of the rotation and let the chest settle'],
    difficulty: 1,
    loadType: 'reps',
    tags: ['warmup'],
  }),
]
