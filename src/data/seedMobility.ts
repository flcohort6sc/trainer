/**
 * Mobility, stretching and no-equipment work.
 *
 * This file exists because a generator whose entire value is variety had four
 * mobility drills to rotate through. Routines are only as good as this pool.
 *
 * Two patterns are in play and the difference matters:
 *
 *   'mobility' -- ACTIVE. You move through a range under your own control.
 *                 Warms tissue, wakes the nervous system up. Morning material.
 *   'stretch'  -- PASSIVE. You settle into a position and breathe. Calming,
 *                 and a bad idea immediately before you try to lift heavy.
 *
 * Tags are how routine steps narrow further. The ones the seed routines rely on:
 *   wake, wind-down, breathing, spine, hip-mobility, shoulder-mobility, ankle,
 *   desk-relief, home, no-equipment, passive-stretch, active-mobility
 */

import type { Exercise } from '../types'
import { ex } from './seedExercises'

const HOME = ['home', 'no-equipment']

export const SEED_MOBILITY: Exercise[] = [
  // ============ WAKE: active drills, morning material ============

  ex('wk-segmental-cat', 'Segmental Cat-Cow', 'mobility', ['lower-back'], ['abs', 'upper-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Move one vertebra at a time — tail leads, head follows last', 'Exhale as you round, inhale as you arch'],
    tags: ['wake', 'spine', 'active-mobility', 'warmup', 'desk-relief', ...HOME],
  }),
  ex('wk-thoracic-rot-quad', 'Quadruped Thoracic Rotation', 'mobility', ['upper-back'], ['obliques'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Hand behind the head, drive the elbow at the ceiling', 'Hips stay square — the rotation is meant to come from the ribcage'],
    tags: ['wake', 'spine', 'shoulder-mobility', 'active-mobility', 'warmup', 'desk-relief', ...HOME],
  }),
  ex('wk-hip-airplane', 'Hip Airplane', 'mobility', ['glutes'], ['abductors', 'abs'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Hinge over the standing leg, hold something for balance at first', 'Rotate the pelvis open and closed — the standing hip does the work'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'balance', ...HOME],
  }),
  ex('wk-wall-slide', 'Wall Slide', 'mobility', ['upper-back'], ['front-delts', 'traps'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Lower back flat against the wall, ribs down', 'Keep wrists and elbows touching as long as you can — that is the whole drill'],
    tags: ['wake', 'shoulder-mobility', 'shoulder-health', 'active-mobility', 'warmup', 'desk-relief', ...HOME],
  }),
  ex('wk-shoulder-car', 'Shoulder CARs', 'mobility', ['front-delts'], ['rear-delts', 'traps'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Slowest circle you can draw — 20 seconds per rotation', 'If the ribcage moves, the shoulder stopped moving'],
    tags: ['wake', 'shoulder-mobility', 'shoulder-health', 'active-mobility', ...HOME],
  }),
  ex('wk-hip-car', 'Hip CARs', 'mobility', ['glutes'], ['hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['On all fours or standing, trace the biggest slow circle the hip allows', 'Brace hard so the lower back does not join in'],
    tags: ['wake', 'hip-mobility', 'active-mobility', ...HOME],
  }),
  ex('wk-deep-squat-pry', 'Deep Squat Pry', 'mobility', ['adductors'], ['quads', 'calves'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Sit in the bottom of a squat, elbows inside the knees', 'Push the knees out, shift side to side, keep the heels down'],
    tags: ['wake', 'hip-mobility', 'ankle', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-ankle-rocker', 'Ankle Rocker', 'mobility', ['calves'], [], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Half-kneeling, drive the knee forward over the toes', 'Heel stays glued down — the moment it lifts you are past the range'],
    tags: ['wake', 'ankle', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-roll-down', 'Standing Roll-Down', 'mobility', ['lower-back'], ['hamstrings'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Chin to chest, then peel down one segment at a time', 'Knees soft — this is a spine drill, not a hamstring stretch'],
    tags: ['wake', 'spine', 'active-mobility', 'desk-relief', ...HOME],
  }),
  ex('wk-scap-pushup', 'Scapular Push-Up', 'mobility', ['upper-back'], ['chest'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Arms stay locked — only the shoulder blades move', 'Push the floor away at the top, let the chest sink at the bottom'],
    tags: ['wake', 'shoulder-mobility', 'shoulder-health', 'warmup', 'active-mobility', ...HOME],
  }),
  ex('wk-inchworm', 'Inchworm Walkout', 'mobility', ['hamstrings'], ['abs', 'front-delts'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Walk the hands out to a plank, then walk the feet up to the hands', 'Do not let the hips sag on the way out'],
    tags: ['wake', 'active-mobility', 'warmup', 'travel', ...HOME],
  }),
  ex('wk-leg-swing', 'Leg Swings', 'mobility', ['hip-flexors'], ['hamstrings', 'glutes'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Front to back, then side to side', 'Let the range build over the set — do not throw the first rep'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-arm-circle', 'Arm Circles', 'mobility', ['front-delts'], ['traps'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Start with small circles and grow them until they are as big as the shoulder allows',
      'Then reverse the direction for the same count',
      'Arms stay straight; the movement is at the shoulder, not the elbow',
      'Ribs down — do not let the back arch as the circles get bigger',
    ],
    tags: ['wake', 'shoulder-mobility', 'active-mobility', 'warmup', 'travel', ...HOME],
  }),
  ex('wk-neck-nod', 'Neck Nods and Turns', 'mobility', ['neck'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Slow yes, slow no, slow ear-to-shoulder', 'Nothing should ever pinch — reduce the range before you push through anything'],
    tags: ['wake', 'wind-down', 'desk-relief', 'active-mobility', ...HOME],
  }),
  ex('wk-hip-circle', 'Standing Hip Circles', 'mobility', ['glutes'], ['hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Knee up to 90, trace a circle out and back', 'Stand tall — no leaning away from the working leg'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-wrist-rock', 'Wrist Rocks', 'mobility', ['forearms'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Palms down, rock forward and back; then flip to backs of the hands', 'Essential prep if you press, plank, or type for a living'],
    tags: ['wake', 'desk-relief', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-calf-pump', 'Calf Pumps', 'mobility', ['calves'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'From a downward dog or plank, drive one heel towards the floor while the other knee bends',
      'Alternate slowly rather than bouncing',
      'Press and hold each one for a beat at the bottom',
      'Wakes up the calves and ankles before anything that involves running',
    ],
    tags: ['wake', 'ankle', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-reach-fold', 'Reach and Fold Flow', 'mobility', ['lower-back'], ['hamstrings', 'front-delts'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Reach tall on the inhale, fold on the exhale', 'Let it be a rhythm, not a stretch you hold'],
    tags: ['wake', 'spine', 'active-mobility', ...HOME],
  }),
  ex('wk-glute-bridge-march', 'Glute Bridge March', 'mobility', ['glutes'], ['abs', 'hamstrings'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Bridge up first, then lift one knee without letting the hips tilt', 'If the hips drop, the drill is over — do fewer'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'warmup', 'rehab', ...HOME],
  }),
  ex('wk-thoracic-ext-floor', 'Floor Thoracic Extension', 'mobility', ['upper-back'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Elbows on a chair or the floor, let the chest sink between the arms', 'Ribs stay down — extend the upper back, not the lower'],
    tags: ['wake', 'spine', 'shoulder-mobility', 'desk-relief', 'active-mobility', ...HOME],
  }),
  ex('wk-lateral-lunge-rock', 'Lateral Lunge Rock', 'mobility', ['adductors'], ['glutes', 'quads'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Wide stance, shift the hips over one foot and sit back', 'Other leg stays straight with the toes up'],
    tags: ['wake', 'hip-mobility', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('wk-toe-touch-squat', 'Toe Touch to Squat', 'mobility', ['hamstrings'], ['quads', 'lower-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Fold to the toes, drop the hips into a squat, then stand tall', 'One continuous shape change — no pausing to muscle through it'],
    tags: ['wake', 'active-mobility', 'warmup', ...HOME],
  }),

  // ============ WIND-DOWN: passive holds and breathing ============

  ex('wd-figure-4', 'Supine Figure-4', 'stretch', ['glutes'], ['abductors'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Ankle across the opposite knee, pull the back thigh toward you', 'Head stays down — no crunching up to reach'],
    tags: ['wind-down', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('wd-couch', 'Couch Stretch', 'stretch', ['hip-flexors'], ['quads'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Back foot up a wall or sofa, squeeze the glute of that side', 'Ribs down. Arching the lower back fakes the range and feels like progress'],
    tags: ['wind-down', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('wd-childs-pose', "Child's Pose", 'stretch', ['lower-back'], ['lats'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Knees wide, hips back to the heels, arms long', 'Breathe into the back of the ribs'],
    tags: ['wind-down', 'passive-stretch', 'spine', ...HOME],
  }),
  ex('wd-legs-up-wall', 'Legs Up The Wall', 'stretch', ['hamstrings'], ['lower-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Hips close to the wall, legs resting up it, arms out', 'The most effortless item in this app — stay longer than feels productive'],
    tags: ['wind-down', 'passive-stretch', 'recovery', ...HOME],
  }),
  ex('wd-supine-twist', 'Supine Spinal Twist', 'stretch', ['obliques'], ['lower-back', 'glutes'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Knees fall to one side, both shoulders stay on the floor', 'Exhale and let gravity do it'],
    tags: ['wind-down', 'passive-stretch', 'spine', ...HOME],
  }),
  ex('wd-seated-fold', 'Seated Forward Fold', 'stretch', ['hamstrings'], ['lower-back', 'calves'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Hinge from the hips first, then let the spine round if it wants to', 'Sit on a cushion if the pelvis tips backwards'],
    tags: ['wind-down', 'passive-stretch', ...HOME],
  }),
  ex('wd-butterfly', 'Reclined Butterfly', 'stretch', ['adductors'], ['hip-flexors'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Soles together, knees fall open, lie back', 'Support the knees on cushions and it becomes a five-minute hold'],
    tags: ['wind-down', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('wd-thread-needle', 'Thread the Needle', 'stretch', ['upper-back'], ['rear-delts'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['From all fours, slide one arm under the other, shoulder to the floor', 'Let the head rest — do not hold it up'],
    tags: ['wind-down', 'passive-stretch', 'spine', 'shoulder-mobility', 'desk-relief', ...HOME],
  }),
  ex('wd-puppy', 'Puppy Pose', 'stretch', ['lats'], ['upper-back', 'front-delts'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Hips over the knees, hands forward, chest melts toward the floor',
      'Hips stay stacked — sitting back turns it into a child’s pose',
      'Knees wide, and keep looking forward the whole time. Struggling to hold the head up is itself the sign that the upper back needs this',
    ],
    tags: ['wind-down', 'passive-stretch', 'shoulder-mobility', ...HOME],
  }),
  ex('wd-neck-lateral', 'Neck Lateral Flexion', 'stretch', ['neck'], ['traps'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Ear toward the shoulder, opposite hand reaching down the floor', 'The weight of your hand is all the pressure this needs'],
    tags: ['wind-down', 'passive-stretch', 'desk-relief', ...HOME],
  }),
  ex('wd-box-breathing', 'Box Breathing', 'stretch', ['abs'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['In for 4, hold 4, out for 4, hold 4', 'Nose only. If 4 is a strain, use 3'],
    tags: ['wind-down', 'breathing', 'recovery', ...HOME],
  }),
  ex('wd-diaphragm', 'Diaphragmatic Breathing', 'stretch', ['abs'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Hand on the belly, hand on the chest — only the lower hand should move', 'Long slow exhale, roughly twice the length of the inhale'],
    tags: ['wind-down', 'breathing', 'recovery', ...HOME],
  }),
  ex('wd-478', '4-7-8 Breathing', 'stretch', ['abs'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['In through the nose for 4, hold for 7, out through the mouth for 8', 'Four cycles is plenty — this one is potent'],
    tags: ['wind-down', 'breathing', 'recovery', ...HOME],
  }),
  ex('wd-happy-baby', 'Happy Baby', 'stretch', ['adductors'], ['glutes', 'lower-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Hold the outsides of the feet, knees toward the armpits', 'Lower back stays on the floor'],
    tags: ['wind-down', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('wd-sphinx', 'Sphinx Pose', 'stretch', ['lower-back'], ['abs'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Forearms down, elbows under the shoulders, hips heavy', 'A gentle extension after a day of sitting — not a backbend'],
    tags: ['wind-down', 'passive-stretch', 'spine', 'desk-relief', ...HOME],
  }),
  ex('wd-quad-side', 'Side-Lying Quad Stretch', 'stretch', ['quads'], ['hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Heel to backside, knee pointing down not out', 'Tuck the tailbone under before you pull'],
    tags: ['wind-down', 'passive-stretch', ...HOME],
  }),
  ex('wd-calf-wall', 'Wall Calf Stretch', 'stretch', ['calves'], [], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Ball of the foot on the wall, heel down, lean in', 'Repeat with a bent knee to reach the deeper soleus'],
    tags: ['wind-down', 'passive-stretch', 'ankle', ...HOME],
  }),
  ex('wd-doorway-chest', 'Doorway Chest Stretch', 'stretch', ['chest'], ['front-delts'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Forearm on the frame at shoulder height, step through', 'Try it at three heights — low, middle, high — they hit different fibres'],
    tags: ['wind-down', 'passive-stretch', 'shoulder-mobility', 'desk-relief', ...HOME],
  }),
  ex('wd-constructive-rest', 'Constructive Rest', 'stretch', ['lower-back'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['On your back, knees bent, feet flat, arms at your sides', 'Do nothing on purpose. Let the lower back settle to the floor by itself'],
    tags: ['wind-down', 'recovery', 'breathing', ...HOME],
  }),
  ex('wd-seated-twist', 'Seated Spinal Twist', 'stretch', ['obliques'], ['upper-back'], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Sit tall first, then rotate — height before rotation', 'Turn from the ribs, not by yanking on your knee'],
    tags: ['wind-down', 'passive-stretch', 'spine', 'desk-relief', ...HOME],
  }),
  ex('wd-wrist-flexor', 'Kneeling Wrist Flexor Stretch', 'stretch', ['forearms'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Palms down, fingers toward the knees, rock back gently', 'Then flip the hands over for the extensors'],
    tags: ['wind-down', 'passive-stretch', 'desk-relief', ...HOME],
  }),

  // ============ FLEXIBILITY: longer, more deliberate work ============

  ex('fx-hamstring-pails', 'Hamstring PAILs / RAILs', 'stretch', ['hamstrings'], [], ['bodyweight'], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: ['Find your end range, then push into the floor at ~30% for 20s', 'Then contract the hamstring to lift out of the stretch for 20s, relax, gain range'],
    notes: 'Contract-relax stretching. Slower and harder than passive holds, and it moves the needle on actual range.',
    tags: ['flexibility', 'passive-stretch', ...HOME],
  }),
  ex('fx-frog', 'Frog Stretch', 'stretch', ['adductors'], ['glutes'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: ['Knees wide, shins parallel, rock the hips back slowly', 'Back off the moment the knees complain — this one is easy to bully'],
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-straddle', 'Seated Straddle', 'stretch', ['adductors'], ['hamstrings'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: ['Sit on a cushion so the pelvis can tip forward', 'Walk the hands forward with a long spine before you round'],
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-pancake', 'Pancake', 'stretch', ['adductors'], ['hamstrings', 'lower-back'], ['bodyweight'], {
    difficulty: 3, loadType: 'time',
    cues: ['Straddle, hinge from the hips, chest toward the floor', 'Toes up and knees up — rolling the legs in cheats the position'],
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-pigeon', 'Pigeon Pose', 'stretch', ['glutes'], ['hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Front shin angled, hips square to the floor', 'Prop the near hip on a cushion if you are tipping to one side'],
    tags: ['flexibility', 'wind-down', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-jefferson-curl', 'Jefferson Curl', 'stretch', ['hamstrings'], ['lower-back'], ['bodyweight'], {
    difficulty: 3, loadType: 'time',
    cues: [
      'Stand on a step, chin to chest, and roll down one vertebra at a time',
      'Rebuild from the bottom the same way — hips first, head last',
      'Very light. A dumbbell you could curl is heavy enough here',
      'Contested exercise: skip it if you sit all day or your lower back is grumbling',
    ],
    notes: 'This one is genuinely contested. It deliberately loads a rounded spine, and McGill\'s work argues the risk outweighs the benefit for most people who are not gymnasts — particularly if you already spend the day in flexion at a desk, which is most of us. It is in the library because loaded spinal flexion has a real case for building tolerance, not because the debate is settled. Light, slow, or not at all — and skip it entirely if your lower back is unhappy.',
    tags: ['flexibility', 'spine', ...HOME],
  }),
  ex('fx-lizard', 'Lizard Lunge', 'stretch', ['hip-flexors'], ['adductors'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Both hands inside the front foot, back leg long', 'Drop to the forearms when the hips allow it'],
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-wrist-series', 'Wrist Prep Series', 'mobility', ['forearms'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Palms down rocks, backs of hands, fingers-in, side to side', 'Ten seconds in each of the four positions'],
    tags: ['flexibility', 'active-mobility', 'warmup', 'desk-relief', 'rehab', ...HOME],
  }),
  ex('fx-thoracic-bridge', 'Thoracic Bridge', 'mobility', ['upper-back'], ['glutes', 'front-delts'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['From a crab position, push the hips up and rotate one arm overhead', 'Drive through the grounded foot and squeeze the glute'],
    tags: ['flexibility', 'spine', 'shoulder-mobility', 'active-mobility', ...HOME],
  }),
  ex('fx-ankle-wall', 'Ankle Dorsiflexion Wall Drill', 'mobility', ['calves'], [], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'time',
    cues: ['Toes a hand-width from the wall, drive the knee to touch it', 'Move the foot back a centimetre each time you succeed'],
    tags: ['flexibility', 'ankle', 'active-mobility', 'rehab', ...HOME],
  }),
  ex('fx-9090-liftoff', '90/90 Active Lift-Off', 'mobility', ['glutes'], ['hip-flexors'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Sit in 90/90, then lift the back knee off the floor without leaning', 'Two seconds up, two down. It will be humbling'],
    tags: ['flexibility', 'hip-mobility', 'active-mobility', ...HOME],
  }),
  ex('fx-shoulder-ext', 'Seated Shoulder Extension', 'stretch', ['front-delts'], ['chest', 'biceps'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Hands on the floor behind you, fingers back, slide the hips forward', 'Keep the chest up and the shoulders down'],
    tags: ['flexibility', 'passive-stretch', 'shoulder-mobility', 'desk-relief', ...HOME],
  }),
  ex('fx-bar-hang', 'Passive Bar Hang', 'stretch', ['lats'], ['forearms', 'front-delts'], ['pullup-bar'], {
    difficulty: 1, loadType: 'time',
    cues: ['Let the shoulders come up to the ears — passive is the point', 'Build to 60 seconds; grip usually fails long before the shoulders do'],
    tags: ['flexibility', 'shoulder-mobility', 'shoulder-health', 'recovery'],
  }),
  ex('fx-elephant-walk', 'Elephant Walk', 'mobility', ['hamstrings'], ['calves'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Fold forward, hands down, alternate bending one knee then the other', 'Active, rhythmic — this is how you loosen hamstrings before training'],
    tags: ['flexibility', 'active-mobility', 'warmup', ...HOME],
  }),
  ex('fx-cossack-hold', 'Cossack Hold', 'stretch', ['adductors'], ['glutes', 'quads'], ['bodyweight'], {
    unilateral: true, difficulty: 2, loadType: 'time',
    cues: ['Sit as deep as you can over one leg, other leg straight, toes up', 'Hold a doorframe so you can relax into it rather than fight for balance'],
    tags: ['flexibility', 'passive-stretch', 'hip-mobility', ...HOME],
  }),
  ex('fx-standing-fold', 'Standing Wide Fold', 'stretch', ['hamstrings'], ['adductors', 'lower-back'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Feet wide, hinge and let the head hang heavy', 'Soft knees is not cheating — locked knees is'],
    tags: ['flexibility', 'wind-down', 'passive-stretch', ...HOME],
  }),

  // ============ HOME STRENGTH: gaps the main library leaves ============

  ex('hm-chair-dip', 'Chair Dip', 'push-horizontal', ['triceps'], ['chest', 'front-delts'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Hands on the edge, elbows straight back not flared', 'Feet closer for less, further for more'],
    tags: ['home', 'no-equipment', 'travel'],
  }),
  ex('hm-decline-pushup', 'Feet-Elevated Push-Up', 'push-horizontal', ['chest'], ['front-delts', 'triceps'], ['bodyweight', 'box'], {
    difficulty: 2, loadType: 'reps',
    cues: ['Feet on a chair or sofa — this is how a push-up gets heavier without weights', 'Body in one line, ribs down'],
    tags: ['home', 'travel'],
  }),
  ex('hm-doorway-row', 'Doorway Row', 'pull-horizontal', ['upper-back', 'lats'], ['biceps'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Grip a doorframe, walk the feet forward, lean back and pull', 'The only bodyweight row that needs nothing but a house'],
    tags: ['home', 'no-equipment', 'travel'],
  }),
  ex('hm-reverse-snow-angel', 'Reverse Snow Angel', 'pull-horizontal', ['rear-delts', 'upper-back'], ['traps'], ['bodyweight'], {
    difficulty: 1, loadType: 'reps',
    cues: ['Face down, arms sweeping from hips to overhead, thumbs up', 'Keep the hands off the floor the whole way'],
    tags: ['home', 'no-equipment', 'shoulder-health', 'rehab', 'desk-relief'],
  }),
  ex('hm-wall-sit', 'Wall Sit', 'squat', ['quads'], ['glutes'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Thighs parallel, back flat on the wall', 'Hands off the legs — that is the difference between hard and easy'],
    tags: ['home', 'no-equipment', 'travel', 'finisher'],
  }),
  ex('hm-copenhagen', 'Copenhagen Plank', 'core-anti-extension', ['adductors'], ['obliques', 'abs'], ['bodyweight', 'box'], {
    unilateral: true, difficulty: 3, loadType: 'time',
    cues: ['Top leg on a chair, lift the hips, bottom leg hovering', 'Start with the bottom knee bent and on the floor — the full version is brutal'],
    notes: 'The best-evidenced groin injury preventer there is. Progress it slowly.',
    tags: ['home', 'rehab', 'hip-mobility'],
  }),
  ex('hm-superman', 'Superman Hold', 'hinge', ['lower-back'], ['glutes', 'rear-delts'], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Lift chest and thighs, reach long rather than high', 'Look at the floor — cranking the neck up is not part of it'],
    tags: ['home', 'no-equipment', 'travel', 'rehab'],
  }),
  ex('hm-reverse-plank', 'Reverse Plank', 'core-anti-extension', ['glutes'], ['lower-back', 'abs'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: ['Hands under the shoulders, drive the hips to the ceiling', 'Squeeze the glutes hard — this is the antidote to a day at a desk'],
    tags: ['home', 'no-equipment', 'desk-relief'],
  }),
  ex('hm-pistol-box', 'Box Pistol Squat', 'lunge', ['quads', 'glutes'], ['abs'], ['bodyweight', 'box'], {
    unilateral: true, difficulty: 2, loadType: 'reps',
    cues: ['Sit to a chair on one leg, stand back up without rocking', 'Lower the chair over time — that is the whole progression'],
    tags: ['home', 'balance'],
  }),
  ex('hm-sl-calf', 'Single-Leg Calf Raise', 'isolation', ['calves'], [], ['bodyweight'], {
    unilateral: true, difficulty: 1, loadType: 'reps',
    cues: ['Off a step for full range, pause at the top', 'Fingertips on a wall for balance only'],
    tags: ['home', 'no-equipment', 'travel'],
  }),
  ex('hm-bear-crawl', 'Bear Crawl', 'conditioning', ['abs'], ['front-delts', 'quads'], ['bodyweight'], {
    difficulty: 2, loadType: 'time',
    cues: ['Knees an inch off the floor, opposite hand and foot together', 'Hips stay low and still — if they sway, slow down'],
    tags: ['home', 'no-equipment', 'conditioning', 'finisher', 'travel'],
  }),
  ex('hm-jump-squat', 'Jump Squat', 'conditioning', ['quads', 'glutes'], ['calves'], ['bodyweight'], {
    difficulty: 2, loadType: 'reps',
    cues: ['Land quietly — noise is the sign you are absorbing badly', 'Reset each rep rather than bouncing'],
    tags: ['home', 'no-equipment', 'conditioning', 'finisher'],
  }),
]
