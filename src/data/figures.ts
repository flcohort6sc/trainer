/**
 * Figure data.
 *
 * Coverage is achieved in two layers, which is the only way ~250 exercises get
 * a picture without ~250 hand-drawn files:
 *
 *   1. A default per movement pattern. Every squat gets the squat figure.
 *   2. Per-exercise overrides where the default would be wrong or bland.
 *
 * Layer 1 is honest because the patterns ARE the shared shape -- that is the
 * whole premise of the generator. A front squat and a goblet squat really do
 * put the limbs in the same places.
 *
 * Two patterns get NO figure on purpose:
 *   'swim'     -- a side-on stick figure cannot show a catch or a body roll,
 *                 and a wrong picture is worse than none.
 *   'protocol' -- sitting in a sauna does not need a diagram.
 */

import type { Exercise, MovementPattern } from '../types'
import type { FigureSpec, Pose } from '../components/Figure'

// ---------------------------------------------------------------- poses

const stand: Pose = {}
const standTall: Pose = { shoulder: 10 }

const squatBottom: Pose = { torso: 28, hip: 100, knee: 112, ankle: 22 }
const squatHalf: Pose = { torso: 18, hip: 55, knee: 60, ankle: 12 }
const hinge: Pose = { torso: 68, hip: 72, knee: 18 }
const lungeDown: Pose = { torso: 12, hip: 60, knee: 95, ankle: 10 }
const seated: Pose = { hip: 90, knee: 90 }

const overhead: Pose = { shoulder: 175 }
const rack: Pose = { shoulder: 35, elbow: 145 }
const armsFront: Pose = { shoulder: 88 }
const armsOut: Pose = { shoulder: 90, elbow: 0 }
const curlUp: Pose = { shoulder: 12, elbow: 140 }

const plankTop: Pose = { torso: 90, shoulder: 92, dy: 46 }
const plankBottom: Pose = { torso: 90, shoulder: 66, elbow: 88, dy: 60 }
const pronePress: Pose = { torso: 90, shoulder: 92, elbow: 0, dy: 46 }

const supineFlat: Pose = { base: 'supine' }
const supineKnees: Pose = { base: 'supine', hip: 85, knee: 92 }
const supineReach: Pose = { base: 'supine', hip: 88, knee: 90, shoulder: 172 }
const bridgeDown: Pose = { base: 'supine', hip: 42, knee: 95 }
const bridgeUp: Pose = { base: 'supine', hip: 8, knee: 95 }

const hangLong: Pose = { shoulder: 176, dy: -26 }
const hangTop: Pose = { shoulder: 140, elbow: 125, dy: -12 }

const rowStart: Pose = { torso: 68, hip: 72, knee: 18, shoulder: 2 }
const rowFinish: Pose = { torso: 68, hip: 72, knee: 18, shoulder: 8, elbow: 95 }

const fold: Pose = { torso: 92, hip: 96, knee: 6 }
const childPose: Pose = { torso: 72, hip: 128, knee: 142, shoulder: 158, dy: 40 }
const cossack: Pose = { torso: 22, hip: 92, knee: 118, ankle: 14 }
const cat: Pose = { torso: 90, hip: 88, knee: 90, shoulder: 92, dy: 40 }
const cow: Pose = { torso: 90, hip: 76, knee: 90, shoulder: 92, neck: -22, dy: 40 }
const sideLie: Pose = { base: 'supine', hip: 20, knee: 40, shoulder: 60 }
const carry: Pose = { shoulder: 4 }
const runStride: Pose = { torso: 8, hip: 34, knee: 46, shoulder: 34, elbow: 80 }
const runDrive: Pose = { torso: 8, hip: 78, knee: 96, shoulder: 22, elbow: 84 }

// ---------------------------------------------------------------- defaults

/**
 * One figure per movement pattern. Deliberately generic -- it shows the shape
 * of the pattern, and anything that needs more precision gets an override.
 */
const BY_PATTERN: Partial<Record<MovementPattern, FigureSpec>> = {
  squat: {
    start: stand, end: squatBottom, arrow: 'hips',
    fault: 'the chest dropping before the hips do — that is a good morning, not a squat',
  },
  lunge: {
    start: stand, end: lungeDown, arrow: 'hips',
    fault: 'the front knee collapsing inward as you descend',
  },
  hinge: {
    start: stand, end: hinge, arrow: 'shoulders',
    fault: 'turning it into a squat — the hips travel back, they do not just drop',
  },
  'push-horizontal': {
    start: plankTop, end: plankBottom, arrow: 'shoulders',
    fault: 'the hips sagging, which turns a press into a lower-back exercise',
  },
  'push-vertical': {
    start: rack, end: overhead, arrow: 'hands',
    fault: 'arching the lower back to fake overhead range',
  },
  'pull-vertical': {
    start: hangLong, end: hangTop, arrow: 'shoulders',
    fault: 'shrugging up instead of pulling the shoulder blades down first',
  },
  'pull-horizontal': {
    start: rowStart, end: rowFinish, arrow: 'hands',
    fault: 'the torso rising with each rep — the row is the arms, not the back angle',
  },
  'core-anti-extension': {
    start: plankTop, end: plankTop, arrow: 'none',
    fault: 'the lower back arching as you fatigue; stop the set there',
  },
  'core-anti-rotation': {
    start: plankTop, end: plankTop, arrow: 'none',
    fault: 'the hips rocking — the whole point is that nothing moves',
  },
  'core-flexion': {
    start: supineFlat, end: supineKnees, arrow: 'none',
    fault: 'yanking with the hip flexors instead of curling the spine',
  },
  isolation: {
    start: stand, end: curlUp, arrow: 'hands',
    fault: 'swinging the torso to start the rep',
  },
  carry: { start: carry, end: carry, arrow: 'none', fault: 'leaning away from the load' },
  conditioning: { start: stand, end: squatHalf, arrow: 'hips' },
  mobility: { start: stand, end: fold, arrow: 'hands' },
  stretch: { start: stand, end: fold, arrow: 'none' },
  run: { start: runStride, end: runDrive, arrow: 'none', fault: 'over-striding — landing well ahead of your hips brakes every step' },
}

// ---------------------------------------------------------------- overrides

/** Where the pattern default would be wrong, bland, or actively misleading. */
const BY_ID: Record<string, FigureSpec> = {
  // --- squats and legs ---
  'sq-back': { start: stand, end: squatBottom, props: ['barbell'], arrow: 'hips', fault: 'the chest dropping faster than the hips' },
  'sq-front': { start: rack, end: { ...squatBottom, shoulder: 40, elbow: 140 }, props: ['barbell'], arrow: 'hips', fault: 'the elbows dropping, which pulls the bar down with them' },
  'sq-goblet': { start: { shoulder: 25, elbow: 130 }, end: { ...squatBottom, shoulder: 25, elbow: 130 }, props: ['kettlebell'], arrow: 'hips' },
  'sq-bw': { start: stand, end: squatBottom, arrow: 'hips' },
  'hm-wall-sit': { start: stand, end: { hip: 90, knee: 90, shoulder: 5 }, props: ['wall'], arrow: 'hips', fault: 'resting your hands on your thighs' },
  'ln-step-up': { start: stand, end: { ...lungeDown, hip: 92, knee: 96 }, props: ['box'], arrow: 'hips' },
  'hm-pistol-box': { start: { hip: 88, knee: 92 }, end: stand, props: ['box'], arrow: 'hips', fault: 'rocking forward to stand rather than driving through the heel' },

  // --- hinge ---
  'hg-deadlift': { start: { ...hinge, shoulder: 4 }, end: stand, props: ['barbell'], arrow: 'hands', fault: 'the hips shooting up first, leaving the bar to your lower back' },
  'hg-rdl': { start: stand, end: { ...hinge, knee: 12 }, props: ['barbell'], arrow: 'hands', fault: 'bending the knees to reach lower instead of pushing the hips back' },
  'hg-swing': { start: { ...hinge, shoulder: 6 }, end: { shoulder: 88 }, props: ['kettlebell'], arrow: 'hands', fault: 'squatting the bell up — this is a hip snap, not a lift' },
  'hg-glute-bridge': { start: bridgeDown, end: bridgeUp, arrow: 'none', fault: 'arching the lower back instead of finishing with the glutes' },
  'hm-superman': { start: { base: 'prone' }, end: { base: 'prone', torso: -12, shoulder: 165 }, arrow: 'none', fault: 'craning the neck up — look at the floor' },
  'ig-hg-glute-bridge-rollout': { start: bridgeUp, end: { base: 'supine', hip: 12, knee: 95, shoulder: 150 }, props: ['floor'], arrow: 'none', fault: 'the hips dropping as the arms travel out' },

  // --- pressing ---
  'ph-bench': { start: { base: 'supine', shoulder: 92, elbow: 85 }, end: { base: 'supine', shoulder: 92 }, props: ['bench', 'barbell'], arrow: 'hands' },
  'ph-pushup': { start: plankTop, end: plankBottom, arrow: 'shoulders', fault: 'the hips sagging or piking' },
  'ig-ph-knee-pushup': { start: { ...plankTop, knee: 90 }, end: { ...plankBottom, knee: 90 }, arrow: 'shoulders', fault: 'piking the hips up — knees down, hips still in line' },
  'ig-ph-wall-pushup': { start: { torso: 18, shoulder: 90 }, end: { torso: 24, shoulder: 72, elbow: 80 }, props: ['wall'], arrow: 'shoulders' },
  'ig-ph-diamond-pushup': { start: plankTop, end: { ...plankBottom, elbow: 98 }, arrow: 'shoulders', fault: 'the elbows flaring wide — they should track back' },
  'pv-ohp': { start: rack, end: overhead, props: ['barbell'], arrow: 'hands', fault: 'leaning back under the bar instead of moving your head out of the way' },
  'pv-pike-pushup': { start: { torso: 76, hip: 92, shoulder: 150, dy: 20 }, end: { torso: 76, hip: 92, shoulder: 130, elbow: 90, dy: 26 }, arrow: 'shoulders' },
  'ig-kb-floor-press': { start: { base: 'supine', hip: 40, knee: 90, shoulder: 92, elbow: 85 }, end: { base: 'supine', hip: 40, knee: 90, shoulder: 92 }, props: ['kettlebell'], arrow: 'hands' },
  'ig-kb-seesaw': { start: rack, end: overhead, props: ['kettlebell'], arrow: 'hands', fault: 'letting the ribs flare as one bell goes up' },

  // --- pulling ---
  'pu-pullup': { start: hangLong, end: hangTop, props: ['bar'], arrow: 'shoulders', fault: 'starting the pull with the arms instead of the shoulder blades' },
  'fx-bar-hang': { start: hangLong, end: hangLong, props: ['bar'], arrow: 'none' },
  'pr-bb-row': { start: rowStart, end: rowFinish, props: ['barbell'], arrow: 'hands', fault: 'standing up a little on every rep' },
  'pr-inverted': { start: { torso: 84, shoulder: 96, dy: 30 }, end: { torso: 84, shoulder: 96, elbow: 88, dy: 30 }, props: ['bar'], arrow: 'shoulders' },
  'ig-pr-belly-massage': { start: supineKnees, end: supineKnees, arrow: 'none' },

  // --- core ---
  'co-plank': { start: { torso: 90, shoulder: 90, elbow: 88, dy: 52 }, end: { torso: 90, shoulder: 90, elbow: 88, dy: 52 }, arrow: 'none', fault: 'the hips creeping upward to make it easier' },
  'co-deadbug': { start: supineReach, end: { base: 'supine', hip: 20, knee: 20, shoulder: 120 }, arrow: 'none', fault: 'the lower back lifting off the floor' },
  'co-bird-dog': { start: cat, end: { torso: 90, hip: 20, knee: 6, shoulder: 150, dy: 40 }, arrow: 'none', fault: 'rotating the hips open as the leg lifts' },
  'co-hollow': { start: supineFlat, end: { base: 'supine', hip: 24, knee: 8, shoulder: 168 }, arrow: 'none', fault: 'the lower back arching — shorten the levers instead' },
  'ig-co-reverse-crunch': { start: supineKnees, end: { base: 'supine', hip: 118, knee: 96 }, arrow: 'none', fault: 'swinging the legs; the pelvis should curl' },
  'ig-co-v-up': { start: supineFlat, end: { base: 'supine', hip: 78, knee: 4, shoulder: 96 }, arrow: 'none' },
  'ig-co-shoulder-taps': { start: plankTop, end: { ...plankTop, shoulder: 130, elbow: 60 }, arrow: 'none', fault: 'the hips rocking side to side' },
  'ig-kb-pullover': { start: { base: 'supine', hip: 40, knee: 92, shoulder: 92 }, end: { base: 'supine', hip: 40, knee: 92, shoulder: 168 }, props: ['kettlebell'], arrow: 'none', fault: 'the ribs flaring as the bell goes back' },
  'hm-reverse-plank': { start: seated, end: { hip: 12, knee: 8, shoulder: -55, dy: 30 }, arrow: 'hips' },

  // --- mobility and stretching ---
  'mo-cat-cow': { start: cow, end: cat, arrow: 'none', fault: 'moving as one block instead of segment by segment' },
  'wk-segmental-cat': { start: cow, end: cat, arrow: 'none', fault: 'rushing — one vertebra at a time is the drill' },
  'wd-childs-pose': { start: cat, end: childPose, arrow: 'none' },
  'ig-mo-childs-flow': { start: cat, end: childPose, arrow: 'none' },
  'wd-legs-up-wall': { start: supineFlat, end: { base: 'supine', hip: 88, knee: 4 }, props: ['wall'], arrow: 'none' },
  'wd-figure-4': { start: supineKnees, end: { base: 'supine', hip: 96, knee: 76 }, arrow: 'none' },
  'wd-supine-twist': { start: supineKnees, end: { base: 'supine', hip: 88, knee: 92, shoulder: 92 }, arrow: 'none', fault: 'the far shoulder lifting off the floor' },
  'wd-seated-fold': { start: { hip: 90 }, end: { hip: 90, torso: 62 }, arrow: 'shoulders' },
  'wk-roll-down': { start: stand, end: fold, arrow: 'shoulders' },
  'wk-deep-squat-pry': { start: stand, end: { ...squatBottom, shoulder: 40, elbow: 120 }, arrow: 'hips' },
  'fx-cossack-hold': { start: stand, end: cossack, arrow: 'hips' },
  'ln-cossack': { start: stand, end: cossack, arrow: 'hips' },
  'ig-mo-gorilla-cossack': { start: cossack, end: { ...cossack, torso: 42 }, arrow: 'none' },
  'ig-mo-cossack-to-lunge': { start: cossack, end: lungeDown, arrow: 'hips' },
  'wd-couch': { start: { hip: 90, knee: 100 }, end: { torso: -14, hip: 24, knee: 132, dy: 26 }, props: ['wall'], arrow: 'none', fault: 'arching the lower back to feel a bigger stretch' },
  'ig-st-reverse-nordic': { start: { hip: 92, knee: 138, dy: 22 }, end: { torso: -30, hip: 92, knee: 138, dy: 22 }, arrow: 'shoulders', fault: 'breaking at the hips instead of staying in one line from knee to head' },
  'ig-mo-table-pose': { start: seated, end: { hip: 10, knee: 8, shoulder: -50, dy: 28 }, arrow: 'hips' },
  'ig-mo-squat-fold': { start: squatBottom, end: fold, arrow: 'hips' },
  'ig-mo-lunge-reach': { start: stand, end: { ...lungeDown, shoulder: 168 }, arrow: 'hands' },
  'ig-mo-horse-stance': { start: stand, end: { hip: 78, knee: 82, shoulder: 88 }, arrow: 'hips' },
  'ig-mo-side-bends': { start: { shoulder: 170 }, end: { torso: -26, shoulder: 170 }, arrow: 'hands' },
  'ig-mo-windshield-wipers': { start: supineKnees, end: { base: 'supine', hip: 86, knee: 96, shoulder: 88 }, arrow: 'none' },
  'wd-sphinx': { start: { base: 'prone' }, end: { base: 'prone', torso: -22, shoulder: 84, elbow: 92 }, arrow: 'none' },
  'wd-quad-side': { start: sideLie, end: { base: 'supine', hip: -18, knee: 128, shoulder: 30 }, arrow: 'none' },
  'hm-copenhagen': { start: sideLie, end: { base: 'supine', hip: 4, knee: 4, shoulder: 88 }, props: ['box'], arrow: 'none', fault: 'letting the hips drop back; stack them' },

  // --- running drills ---
  'ig-run-a-skip': { start: runStride, end: runDrive, arrow: 'none', fault: 'letting the leg swing through instead of driving the knee' },
  'ig-run-pogo': { start: { knee: 8 }, end: { knee: 18, ankle: -22 }, arrow: 'hips', fault: 'bending the knees — the bounce comes from the ankles' },
  'ig-run-straight-leg-bounce': { start: { hip: 12 }, end: { hip: 34, knee: 4 }, arrow: 'none', fault: 'sitting down into the hips; stay tall' },
  'rn-strides': { start: runStride, end: runDrive, arrow: 'none' },

  // --- carries ---
  'cr-farmer': { start: carry, end: carry, props: ['dumbbell'], arrow: 'none', fault: 'shrugging the shoulders up around your ears' },
  'cr-overhead': { start: overhead, end: overhead, props: ['kettlebell'], arrow: 'none' },
}

// ---------------------------------------------------------------- resolve

/** Patterns where a stick figure would mislead more than it helps. */
const NO_FIGURE: MovementPattern[] = ['swim', 'protocol']

export function figureFor(exercise: Exercise): FigureSpec | undefined {
  const override = BY_ID[exercise.id]
  if (override) return override
  if (NO_FIGURE.includes(exercise.pattern)) return undefined
  return BY_PATTERN[exercise.pattern]
}

/** Honest coverage reporting, used by the tests and the README. */
export function figureCoverage(exercises: Exercise[]) {
  let withFigure = 0
  let overridden = 0
  let deliberatelyNone = 0
  for (const e of exercises) {
    if (BY_ID[e.id]) overridden++
    if (NO_FIGURE.includes(e.pattern) && !BY_ID[e.id]) deliberatelyNone++
    else if (figureFor(e)) withFigure++
  }
  return { total: exercises.length, withFigure, overridden, deliberatelyNone }
}

export { armsFront, armsOut, standTall, pronePress }
