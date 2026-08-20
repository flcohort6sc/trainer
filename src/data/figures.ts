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

/*
 * Positions the routine drills live in. Written once because forty of them
 * start on all fours or in a deep squat, and a quadruped that drifts between
 * exercises reads as sloppiness rather than as variety.
 */
const quadruped: Pose = { base: 'prone', torso: 88, hip: 86, knee: 90, shoulder: 88, dy: 36 }
const downDog: Pose = { base: 'prone', torso: 52, hip: 76, knee: 6, shoulder: 168, dy: 26 }
const deepSquat: Pose = { torso: 32, hip: 112, knee: 126, ankle: 30 }
const halfKneel: Pose = { hip: 90, knee: 92, split: 1 }
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
const carry: Pose = { shoulder: 4, shoulderAbduct: 12 }
const carryStride: Pose = { shoulder: 4, shoulderAbduct: 12, hip: 18, knee: 10, split: 1 }

/*
 * Poses that only make sense now that the figure has a third dimension.
 * Every one of these was previously drawn as somebody standing still, because
 * the movement happens in a plane the old engine could not see.
 */
const lateralRaiseDown: Pose = { shoulder: 4, shoulderAbduct: 8 }
const lateralRaiseUp: Pose = { shoulder: 4, shoulderAbduct: 88 }
const pallofIn: Pose = { shoulder: 70, elbow: 120, twist: 18 }
const pallofOut: Pose = { shoulder: 82, elbow: 6, twist: 0 }
const cossackStand: Pose = { hipAbduct: 40 }
const cossackDown: Pose = { torso: 24, hip: 96, knee: 112, hipAbduct: 44, split: 1 }
const runStride: Pose = { torso: 8, hip: 34, knee: 46, shoulder: 34, elbow: 80 }
const runDrive: Pose = { torso: 8, hip: 78, knee: 96, shoulder: 22, elbow: 84 }

// ---------------------------------------------------------------- defaults

/**
 * One figure per movement pattern. Deliberately generic -- it shows the shape
 * of the pattern, and anything that needs more precision gets an override.
 */
const BY_PATTERN: Partial<Record<MovementPattern, FigureSpec>> = {
  squat: {
    // Hands racked, so a barbell prop lands on the upper back where it belongs
    // rather than hanging at the waist.
    start: { ...stand, shoulder: -18, elbow: 152 },
    end: { ...squatBottom, shoulder: -18, elbow: 152 },
    arrow: 'hips',
    fault: 'the chest dropping before the hips do — that is a good morning, not a squat',
  },
  lunge: {
    // split: 1 holds the far leg at the start pose while the near one descends,
    // which is the entire visual difference between a lunge and a squat.
    start: stand, end: { ...lungeDown, split: 1 }, arrow: 'hips',
    view: 26,
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
    start: pallofIn, end: pallofOut, arrow: 'hands', view: 62,
    fault: 'letting the shoulders turn with the cable — nothing above the hips should rotate',
  },
  'core-flexion': {
    start: supineFlat, end: supineKnees, arrow: 'none',
    fault: 'yanking with the hip flexors instead of curling the spine',
  },
  isolation: {
    start: stand, end: curlUp, arrow: 'hands',
    fault: 'swinging the torso to start the rep',
  },
  carry: { start: carry, end: carryStride, arrow: 'none', view: 30, fault: 'leaning away from the load' },
  conditioning: { start: stand, end: squatHalf, arrow: 'hips' },
  mobility: { start: stand, end: fold, arrow: 'hands' },
  stretch: { start: stand, end: fold, arrow: 'none' },
  run: { start: runStride, end: runDrive, arrow: 'none', fault: 'over-striding — landing well ahead of your hips brakes every step' },
}

// ---------------------------------------------------------------- overrides

/** Where the pattern default would be wrong, bland, or actively misleading. */
const BY_ID: Record<string, FigureSpec> = {
  // ======================= CONDITIONING & RUNNING ========================
  // Running is drawn as a stride, not a person standing on a road: the whole
  // difference between an easy run and a sprint is knee height and lean.
  'rn-easy': { start: { torso: 6, hip: 22, knee: 26, shoulder: 24, elbow: 84, split: 1 }, end: { torso: 6, hip: -14, knee: 42, shoulder: 24, elbow: 84, split: 1 }, arrow: 'none', view: 26, fault: 'running your easy days too hard, which is the most common mistake in running' },
  'rn-long': { start: { torso: 7, hip: 20, knee: 24, shoulder: 22, elbow: 86, split: 1 }, end: { torso: 7, hip: -12, knee: 40, shoulder: 22, elbow: 86, split: 1 }, arrow: 'none', view: 26, fault: 'starting at the pace you finished the last one' },
  'rn-tempo': { start: { torso: 10, hip: 34, knee: 40, shoulder: 30, elbow: 78, split: 1 }, end: { torso: 10, hip: -18, knee: 56, shoulder: 30, elbow: 78, split: 1 }, arrow: 'none', view: 26, fault: 'drifting into interval pace — tempo is comfortably hard, not hard' },
  'rn-intervals': { start: { torso: 13, hip: 52, knee: 66, shoulder: 40, elbow: 72, split: 1 }, end: { torso: 13, hip: -24, knee: 74, shoulder: 40, elbow: 72, split: 1 }, arrow: 'none', view: 26, fault: 'a heroic first rep followed by four bad ones' },
  'rn-hills': { start: { torso: 18, hip: 54, knee: 68, shoulder: 42, elbow: 70, split: 1 }, end: { torso: 18, hip: -16, knee: 62, shoulder: 42, elbow: 70, split: 1 }, arrow: 'none', view: 26, fault: 'leaning from the waist rather than running tall into the hill' },
  'rn-treadmill': { start: { torso: 6, hip: 24, knee: 28, shoulder: 24, elbow: 84, split: 1 }, end: { torso: 6, hip: -12, knee: 42, shoulder: 24, elbow: 84, split: 1 }, arrow: 'none', view: 26, props: ['floor'], fault: 'holding the rails, which changes the exercise entirely' },
  'rn-track': { start: { torso: 11, hip: 48, knee: 60, shoulder: 38, elbow: 74, split: 1 }, end: { torso: 11, hip: -22, knee: 70, shoulder: 38, elbow: 74, split: 1 }, arrow: 'none', view: 26 },
  'rn-walk-run': { start: { torso: 4, hip: 16, knee: 14, shoulder: 16, elbow: 60, split: 1 }, end: { torso: 6, hip: -8, knee: 34, shoulder: 22, elbow: 78, split: 1 }, arrow: 'none', view: 26, fault: 'skipping the walk because you feel fine — the walk is the reason it works' },
  'ig-run-short-sprint': { start: { torso: 20, hip: 62, knee: 78, shoulder: 52, elbow: 66, split: 1 }, end: { torso: 20, hip: -28, knee: 84, shoulder: 52, elbow: 66, split: 1 }, arrow: 'none', view: 26, fault: 'sprinting again before you have properly recovered' },
  'ig-run-lateral-duck': { start: { torso: 16, hip: 58, knee: 74, hipAbduct: 26 }, end: { torso: 16, hip: 58, knee: 74, hipAbduct: 42, split: 1 }, arrow: 'none', view: 66, fault: 'standing up between steps — stay low the whole way' },
  'cd-bike': { start: { base: 'seated', hip: 74, knee: 66, shoulder: 76, elbow: 30, split: 1 }, end: { base: 'seated', hip: 106, knee: 116, shoulder: 96, elbow: 20, split: 1 }, arrow: 'none', view: 26, fault: 'bouncing in the seat, which wastes most of the effort' },
  'cd-burpee': { start: { base: 'prone', torso: 90, shoulder: 74, elbow: 88, dy: 52 }, mid: { torso: 40, hip: 96, knee: 110, shoulder: 100 }, end: { shoulder: 172, knee: 4, dy: -12 }, arrow: 'hips', view: 24, fault: 'pacing it like a sprint and dying at rep ten' },
  'cd-jump-rope': { start: { knee: 14, ankle: 10, shoulder: 12, elbow: 78, shoulderAbduct: 16 }, end: { knee: 6, ankle: -18, shoulder: 12, elbow: 82, shoulderAbduct: 16, dy: -10 }, arrow: 'hips', view: 30, fault: 'swinging from the elbows — the wrists turn the rope' },
  'cd-mtn-climber': { start: { base: 'prone', torso: 90, shoulder: 92, hip: 4, dy: 46 }, end: { base: 'prone', torso: 90, shoulder: 92, hip: 82, knee: 96, split: 1, dy: 46 }, arrow: 'none', view: 24, fault: 'the hips piking up as the knee drives in' },
  'cd-kb-snatch': { start: { torso: 60, hip: 66, knee: 26, shoulder: 46, elbow: 10 }, mid: { torso: 8, hip: 8, knee: 6, shoulder: 96, elbow: 20 }, end: { shoulder: 174, elbow: 4 }, arrow: 'hands', view: 30, props: ['kettlebell'], fault: 'muscling it up with the arm instead of snapping the hips' },
  'ig-cd-ball-slam': { start: { shoulder: 172, elbow: 6 }, end: { torso: 58, hip: 64, knee: 30, shoulder: 4, elbow: 6 }, arrow: 'hands', view: 26, props: ['medicine-ball'], fault: 'slamming with the arms and leaving the trunk out of it' },
  'ig-cd-alligator-crawl': { start: { base: 'prone', torso: 90, shoulder: 84, elbow: 46, dy: 54 }, end: { base: 'prone', torso: 90, shoulder: 116, elbow: 40, hip: 40, knee: 60, split: 1, dy: 54 }, arrow: 'none', view: 22, fault: 'the hips rising — stay low and close to the floor' },
  'ig-kb-clean-thruster': { start: { torso: 34, hip: 96, knee: 108, shoulder: 40, elbow: 20 }, mid: { shoulder: 34, elbow: 142 }, end: { shoulder: 174, elbow: 6 }, arrow: 'hands', view: 32, props: ['kettlebell'], fault: 'catching the bell hard on the forearm — punch the hand through' },
  'ig-kb-squat-clean-press': { start: { torso: 36, hip: 104, knee: 118, shoulder: 46, elbow: 14 }, mid: { torso: 30, hip: 96, knee: 108, shoulder: 34, elbow: 144 }, end: { shoulder: 174, elbow: 6 }, arrow: 'hands', view: 34, props: ['kettlebell'], fault: 'standing up before the bells are racked' },
  'ig-kb-shelf-loader': { start: { torso: 30, hip: 100, knee: 112, shoulder: 10, elbow: 8 }, mid: { shoulder: 16, elbow: 142 }, end: { shoulder: 172, elbow: 8 }, arrow: 'hands', view: 32, props: ['kettlebell'], fault: 'pausing between the three parts — it is one movement' },
  'ig-kb-throw-over': { start: { shoulder: 20, elbow: 130, twist: 20 }, mid: { shoulder: 140, elbow: 120, twist: 0 }, end: { shoulder: 20, elbow: 130, twist: -20 }, arrow: 'hands', view: 46, props: ['kettlebell'], fault: 'the head ducking out of the way instead of the bell going round it' },
  'ig-kb-emom-complex': { start: { torso: 56, hip: 62, knee: 24, shoulder: 44, elbow: 12 }, mid: { shoulder: 34, elbow: 144 }, end: { shoulder: 174, elbow: 6 }, arrow: 'hands', view: 32, props: ['kettlebell'], fault: 'going out too fast in the first minutes and blowing the last ones' },
  'ig-mo-capability-circuit': { start: { base: 'supine', hip: 88, knee: 92, dy: 40 }, mid: { base: 'supine', hip: 14, knee: 90, dy: 32 }, end: { torso: 12, hip: 62, knee: 96, split: 1 }, arrow: 'none', view: 30, fault: 'racing it — each minute is meant to be steady, not maximal' },

  'hm-bear-crawl': { start: { base: 'prone', torso: 88, hip: 86, knee: 90, shoulder: 88, dy: 36 }, end: { base: 'prone', torso: 88, hip: 62, knee: 76, shoulder: 116, split: 1, dy: 36 }, arrow: 'none', view: 24, fault: 'the hips swinging side to side — stay level and travel' },
  'hm-jump-squat': { start: { torso: 26, hip: 88, knee: 96, ankle: 16, shoulder: 20 }, end: { torso: 4, hip: 4, knee: 4, ankle: -24, shoulder: 40, dy: -18 }, arrow: 'hips', view: 28, fault: 'landing noisily — the sound is you failing to absorb it' },

  // --- the last few upper-body stragglers --------------------------------
  'hm-chair-dip': { start: { shoulder: -12, elbow: 8, torso: -6, hip: 84, knee: 12, dy: 12 }, end: { shoulder: -30, elbow: 92, torso: -4, hip: 92, knee: 12, dy: 26 }, arrow: 'shoulders', view: 26, props: ['box'], fault: 'the shoulders rolling forward at the bottom' },
  'hm-decline-pushup': { start: { base: 'prone', torso: 82, shoulder: 92, elbow: 4, dy: 34 }, end: { base: 'prone', torso: 82, shoulder: 72, elbow: 90, dy: 46 }, arrow: 'shoulders', view: 12, props: ['box'], fault: 'the hips sagging once the feet are higher than the hands' },
  'hm-doorway-row': { start: { torso: -30, hip: 6, knee: 6, shoulder: 88, elbow: 6 }, end: { torso: -14, hip: 6, knee: 6, shoulder: 62, elbow: 104 }, arrow: 'shoulders', view: 26, props: ['wall'], fault: 'pulling with the arms while the body stays vertical — lean back further' },
  'hm-reverse-snow-angel': { start: { base: 'prone', torso: -6, shoulder: 14, shoulderAbduct: 8, elbow: 4, dy: 46 }, end: { base: 'prone', torso: -8, shoulder: 168, shoulderAbduct: 42, elbow: 4, dy: 46 }, arrow: 'hands', view: 16, fault: 'letting the hands touch the floor — they hover the whole way' },
  'hm-sl-calf': { start: { ankle: -20, split: 1 }, end: { ankle: 36, split: 1, dy: -8 }, arrow: 'hips', view: 26, fault: 'bouncing out of the bottom rather than pausing in the stretch' },

  // =========================== STRETCHES =================================
  // Held positions, so start is how you get in and end is the shape you settle
  // into — the animation is the settling, which is the part people rush.
  'wd-butterfly': { start: { base: 'supine', hip: 84, knee: 96, hipAbduct: 14, dy: 40 }, end: { base: 'supine', hip: 78, knee: 116, hipAbduct: 52, dy: 40 }, arrow: 'none', view: 56, fault: 'pushing the knees down with the hands — let gravity do it' },
  'wd-thread-needle': { start: quadruped, end: { ...quadruped, twist: -46, shoulder: 130, elbow: 14, torso: 78, dy: 44 }, arrow: 'hands', view: 46, fault: 'collapsing onto the shoulder rather than lowering into it' },
  'wd-puppy': { start: quadruped, end: { base: 'prone', torso: 60, hip: 92, knee: 92, shoulder: 172, dy: 34 }, arrow: 'shoulders', view: 22, fault: 'the hips sliding back over the heels, which turns it into child\'s pose' },
  'wd-neck-lateral': { start: { base: 'seated', hip: 92, knee: 92, neck: 0 }, end: { base: 'seated', hip: 92, knee: 92, neck: 26, twist: 12, shoulder: 12 }, arrow: 'none', view: 62, fault: 'pulling hard with the hand — the hand is a weight, not a lever' },
  'wd-box-breathing': { start: { base: 'seated', hip: 92, knee: 96, torso: -4 }, end: { base: 'seated', hip: 92, knee: 96, torso: -8, neck: -4 }, arrow: 'none', view: 34, fault: 'breathing into the chest — the belly should move first' },
  'wd-diaphragm': { start: { base: 'supine', hip: 88, knee: 92, shoulder: 30, elbow: 100, dy: 40 }, end: { base: 'supine', hip: 88, knee: 92, shoulder: 34, elbow: 104, torso: -4, dy: 40 }, arrow: 'none', view: 26, fault: 'the top hand moving — only the lower one should' },
  'wd-478': { start: { base: 'seated', hip: 92, knee: 96, torso: -4 }, end: { base: 'seated', hip: 92, knee: 96, torso: -10, neck: -4 }, arrow: 'none', view: 34, fault: 'forcing the long exhale until you are tense — shorten the count instead' },
  'wd-happy-baby': { start: { base: 'supine', hip: 90, knee: 92, dy: 40 }, end: { base: 'supine', hip: 128, knee: 118, hipAbduct: 40, shoulder: 132, elbow: 30, dy: 40 }, arrow: 'none', view: 40, fault: 'the lower back peeling off the floor to reach the feet' },
  'wd-calf-wall': { start: { hip: 6, knee: 6, ankle: 0, split: 1 }, end: { torso: 10, hip: 22, knee: 8, ankle: 34, split: 1 }, arrow: 'hips', view: 22, props: ['wall'], fault: 'the heel lifting as you lean in' },
  'wd-doorway-chest': { start: { shoulder: 90, elbow: 90, shoulderAbduct: 40 }, end: { torso: 8, shoulder: 96, elbow: 92, shoulderAbduct: 68, twist: -16 }, arrow: 'shoulders', view: 66, props: ['wall'], fault: 'letting the ribs flare instead of rotating away from the arm' },
  'wd-constructive-rest': { start: { base: 'supine', hip: 60, knee: 70, dy: 40 }, end: { base: 'supine', hip: 88, knee: 96, shoulder: 16, dy: 40 }, arrow: 'none', view: 26, fault: 'treating it as nothing — it is ten minutes of deliberately doing nothing' },
  'wd-seated-twist': { start: { base: 'seated', hip: 92, knee: 92, twist: 0, torso: -6 }, end: { base: 'seated', hip: 92, knee: 108, hipAbduct: 20, twist: 44, torso: -6, split: 1 }, arrow: 'shoulders', view: 54, fault: 'rotating before you have sat tall — height first, then turn' },
  'wd-wrist-flexor': { start: { ...quadruped, shoulder: 74 }, end: { ...quadruped, shoulder: 112, hip: 100, dy: 30 }, arrow: 'hips', view: 26, fault: 'rocking back hard — creep into it and stop at a stretch, not a pinch' },
  'fx-hamstring-pails': { start: { base: 'supine', hip: 40, knee: 8, dy: 40 }, end: { base: 'supine', hip: 104, knee: 6, dy: 40 }, arrow: 'none', view: 26, fault: 'skipping the contraction — the pushing back is what makes it stick' },
  'fx-frog': { start: { ...quadruped, hipAbduct: 20 }, end: { ...quadruped, hip: 106, hipAbduct: 58, dy: 30 }, arrow: 'hips', view: 60, fault: 'forcing the hips back — go to the first resistance and breathe' },
  'fx-straddle': { start: { base: 'seated', hip: 88, knee: 4, hipAbduct: 30, torso: -6 }, end: { base: 'seated', hip: 92, knee: 4, hipAbduct: 50, torso: 12 }, arrow: 'shoulders', view: 56, fault: 'rounding the back — sit on a cushion so the pelvis can tip' },
  'fx-pancake': { start: { base: 'seated', hip: 90, knee: 4, hipAbduct: 48, torso: 4 }, end: { base: 'seated', hip: 118, knee: 4, hipAbduct: 52, torso: 44 }, arrow: 'shoulders', view: 54, fault: 'folding from the waist instead of hinging at the hips' },
  'fx-pigeon': { start: { base: 'prone', torso: 44, hip: 96, knee: 106, hipAbduct: 38, split: 1, dy: 32 }, end: { base: 'prone', torso: 74, hip: 100, knee: 108, hipAbduct: 40, split: 1, dy: 32 }, arrow: 'shoulders', view: 44, fault: 'letting the hips tip sideways — square them before you fold' },
  'fx-jefferson-curl': { start: { shoulder: 6 }, end: { torso: 92, hip: 86, knee: 6, neck: 26, shoulder: 4 }, arrow: 'shoulders', view: 22, props: ['box'], fault: 'going heavy — this is a light, slow, segment-by-segment roll' },
  'fx-lizard': { start: { torso: 24, hip: 70, knee: 100, split: 1 }, end: { torso: 46, hip: 84, knee: 116, shoulder: 116, split: 1 }, arrow: 'shoulders', view: 42, fault: 'the back knee dropping and the hips collapsing with it' },
  'fx-shoulder-ext': { start: { base: 'seated', hip: 92, knee: 6, shoulder: -20, elbow: 6 }, end: { base: 'seated', hip: 76, knee: 6, shoulder: -44, elbow: 4, dy: 6 }, arrow: 'hips', view: 40, fault: 'sliding the hips too far too fast — the shoulder complains later' },
  'fx-standing-fold': { start: { hipAbduct: 26 }, end: { torso: 84, hip: 88, knee: 8, hipAbduct: 26, neck: 22 }, arrow: 'shoulders', view: 62, fault: 'locking the knees hard — a soft bend is fine' },
  'ig-mo-ql-stretch': { start: { shoulder: 172, elbow: 4, twist: 0 }, end: { torso: 12, shoulder: 168, elbow: 8, twist: 26, hipAbduct: 12 }, arrow: 'hands', view: 62, fault: 'bending forward as well — this one goes sideways' },
  'ig-mo-straight-arm-pullover': { start: { torso: 40, hip: 46, knee: 10, shoulder: 130, elbow: 6 }, end: { torso: 76, hip: 82, knee: 10, shoulder: 172, elbow: 4 }, arrow: 'shoulders', view: 26, props: ['bench'], fault: 'sinking through the lower back rather than the upper' },
  'ig-mo-foam-roll-itb': { start: { base: 'prone', torso: 84, hip: 20, knee: 22, hipAbduct: 30, shoulder: 96, twist: 30, dy: 46 }, end: { base: 'prone', torso: 84, hip: 54, knee: 30, hipAbduct: 30, shoulder: 96, twist: 30, dy: 46 }, arrow: 'hips', view: 40, fault: 'grinding through the sore spot — pause on it and breathe instead' },
  'ig-st-camel-pose': { start: { hip: 90, knee: 120, torso: -4, shoulder: 20 }, end: { hip: 90, knee: 120, torso: -34, shoulder: -30, elbow: 8, neck: -22 }, arrow: 'shoulders', view: 30, fault: 'throwing the head back — let it follow the chest, not lead it' },
  'ig-st-bent-knee-fold': { start: { base: 'seated', hip: 90, knee: 40, torso: -4 }, end: { base: 'seated', hip: 122, knee: 46, torso: 30 }, arrow: 'shoulders', view: 26, fault: 'straightening the legs at the cost of a rounded back' },
  'ig-st-reclined-quad': { start: { hip: 88, knee: 126, torso: -2 }, end: { hip: 62, knee: 130, torso: -34, shoulder: -40, elbow: 10 }, arrow: 'shoulders', view: 30, fault: 'the knees lifting off the floor as you lean back' },
  'ig-st-reclined-bound-twist': { start: { base: 'supine', hip: 88, knee: 90, twist: 0, dy: 40 }, end: { base: 'supine', hip: 96, knee: 104, hipAbduct: 26, twist: 44, shoulder: 110, split: 1, dy: 40 }, arrow: 'none', view: 44, fault: 'forcing the shoulder down before the twist has settled' },
  'ig-st-cross-body-shoulder': { start: { shoulder: 88, shoulderAbduct: 62, elbow: 6 }, end: { shoulder: 92, shoulderAbduct: -22, elbow: 6, split: 1 }, arrow: 'hands', view: 68, fault: 'pulling at the elbow joint rather than supporting above it' },
  'ig-st-front-splits': { start: { torso: 10, hip: 62, knee: 92, split: 1 }, end: { torso: 8, hip: 96, knee: 22, split: 1 }, arrow: 'hips', view: 24, fault: 'the back hip turning out — square them to the front' },
  'ig-st-seated-interscapular': { start: { base: 'seated', hip: 92, knee: 92, shoulder: 30, elbow: 100, shoulderAbduct: 46 }, end: { base: 'seated', hip: 92, knee: 92, shoulder: 34, elbow: 104, shoulderAbduct: 6, torso: 16 }, arrow: 'hands', view: 66, fault: 'shrugging as the elbows come together' },
  'ig-st-quad-sit': { start: { hip: 90, knee: 118, torso: 0 }, end: { hip: 100, knee: 138, torso: -2, dy: 10 }, arrow: 'hips', view: 28, fault: 'sitting back before the knees are ready — build up with a cushion' },
  'ig-st-shoulder-clasp': { start: { shoulder: -10, elbow: 20 }, end: { shoulder: -48, elbow: 6, torso: 8 }, arrow: 'hands', view: 60, fault: 'rounding forward to lift the arms higher' },
  'ig-st-eagle-arms': { start: { shoulder: 88, shoulderAbduct: 30, elbow: 80 }, end: { shoulder: 104, shoulderAbduct: -16, elbow: 128 }, arrow: 'hands', view: 64, fault: 'hunching the shoulders up towards the ears' },

  // =========================== MOBILITY ==================================
  // These run in the morning and evening routines, which makes them the most
  // looked-at figures in the app. Each is posed from its own cue rather than
  // from its name.
  'mo-90-90': { start: { base: 'seated', hip: 90, knee: 90, hipAbduct: 44, twist: 16 }, end: { base: 'seated', hip: 90, knee: 90, hipAbduct: -30, twist: -16 }, arrow: 'none', view: 58, fault: 'pushing off the hands to switch instead of moving from the hips' },
  'mo-worlds-greatest': { start: { torso: 16, hip: 64, knee: 96, split: 1 }, end: { torso: 20, hip: 66, knee: 96, split: 1, twist: 34, shoulder: 150, elbow: 8 }, arrow: 'hands', view: 44, fault: 'the back knee sinking to the floor — it stays lifted' },
  'mo-shoulder-dislocate': { start: { shoulder: 8, elbow: 4, shoulderAbduct: 22 }, mid: { shoulder: 96, elbow: 4, shoulderAbduct: 34 }, end: { shoulder: 178, elbow: 4, shoulderAbduct: 26 }, arrow: 'hands', view: 56, props: ['band'], fault: 'arching the lower back to fake range you do not have at the shoulder' },
  'mo-thoracic-rotation': { start: { base: 'supine', hip: 88, knee: 92, shoulder: 92, elbow: 4, twist: 0, dy: 40 }, end: { base: 'supine', hip: 88, knee: 92, shoulder: 92, elbow: 4, twist: 40, dy: 40 }, arrow: 'hands', view: 40, fault: 'the knees peeling apart — they stay stacked and still' },
  'wk-thoracic-rot-quad': { start: { ...quadruped, shoulder: 88, elbow: 96, twist: 0 }, end: { ...quadruped, shoulder: 92, elbow: 96, twist: 44 }, arrow: 'shoulders', view: 44, fault: 'rotating from the lower back instead of the ribs' },
  'wk-hip-airplane': { start: { torso: 62, hip: 66, knee: 14, hipAbduct: 8, split: 1 }, end: { torso: 62, hip: 66, knee: 14, hipAbduct: 34, twist: 26, split: 1 }, arrow: 'hips', view: 46, fault: 'rotating the whole body rather than opening at the standing hip' },
  'wk-wall-slide': { start: { shoulder: 78, elbow: 92, shoulderAbduct: 52 }, end: { shoulder: 158, elbow: 16, shoulderAbduct: 34 }, arrow: 'hands', view: 74, props: ['wall'], fault: 'the ribs flaring off the wall as the arms rise' },
  'wk-shoulder-car': { start: { shoulder: 6, elbow: 4, shoulderAbduct: 6 }, mid: { shoulder: 90, elbow: 4, shoulderAbduct: 84 }, end: { shoulder: 174, elbow: 4, shoulderAbduct: 20 }, arrow: 'hands', view: 60, fault: 'going fast — twenty seconds a circle is the drill' },
  'wk-hip-car': { start: { ...quadruped, hipAbduct: 6 }, mid: { ...quadruped, hip: 70, hipAbduct: 48, split: 1 }, end: { ...quadruped, hip: 100, hipAbduct: 12, split: 1 }, arrow: 'none', view: 46, fault: 'the back twisting to make the circle bigger' },
  'wk-ankle-rocker': { start: { ...halfKneel, ankle: 0 }, end: { ...halfKneel, ankle: 30, hip: 84, knee: 104 }, arrow: 'none', view: 22, fault: 'the heel lifting — it stays down or there is no drill' },
  'wk-scap-pushup': { start: { base: 'prone', torso: 90, shoulder: 92, elbow: 2, dy: 44 }, end: { base: 'prone', torso: 90, shoulder: 92, elbow: 2, dy: 50 }, arrow: 'shoulders', view: 26, fault: 'bending the elbows — only the shoulder blades move' },
  'wk-inchworm': { start: { torso: 72, hip: 78, knee: 6 }, mid: { base: 'prone', torso: 60, hip: 72, knee: 4, shoulder: 160, dy: 24 }, end: { base: 'prone', torso: 90, shoulder: 92, dy: 46 }, arrow: 'hands', view: 18, fault: 'bending the knees to reach the floor rather than walking the hands' },
  'wk-leg-swing': { start: { hip: 42, knee: 6, split: 1 }, end: { hip: -26, knee: 8, split: 1 }, arrow: 'none', view: 24, fault: 'swinging from the lower back instead of the hip' },
  'wk-arm-circle': { start: { shoulder: 92, shoulderAbduct: 84, elbow: 4 }, mid: { shoulder: 174, shoulderAbduct: 24, elbow: 4 }, end: { shoulder: 8, shoulderAbduct: 12, elbow: 4 }, arrow: 'hands', view: 66 },
  'wk-neck-nod': { start: { neck: -22 }, end: { neck: 26 }, arrow: 'none', view: 34, fault: 'moving fast — this one is slower than feels useful' },
  'wk-hip-circle': { start: { hip: 88, knee: 92, hipAbduct: 4, split: 1 }, mid: { hip: 84, knee: 92, hipAbduct: 44, split: 1 }, end: { hip: 20, knee: 20, hipAbduct: 10, split: 1 }, arrow: 'none', view: 42 },
  'wk-wrist-rock': { start: { ...quadruped, shoulder: 74 }, end: { ...quadruped, shoulder: 104 }, arrow: 'shoulders', view: 24, fault: 'going straight to the end range — creep into it' },
  'wk-calf-pump': { start: { ...downDog, ankle: -24, knee: 4 }, end: { ...downDog, ankle: 30, knee: 42, split: 1 }, arrow: 'none', view: 20, fault: 'bouncing rather than pressing and holding a moment' },
  'wk-reach-fold': { start: { shoulder: 176, elbow: 4 }, end: { torso: 78, hip: 82, knee: 8, shoulder: 4 }, arrow: 'hands', view: 26, fault: 'holding your breath — the breath sets the tempo' },
  'wk-glute-bridge-march': { start: { base: 'supine', hip: 10, knee: 94, dy: 34 }, end: { base: 'supine', hip: 78, knee: 96, split: 1, dy: 34 }, arrow: 'none', view: 30, fault: 'the hips tipping as the knee lifts' },
  'wk-thoracic-ext-floor': { start: { base: 'prone', torso: 60, hip: 88, knee: 90, shoulder: 150, dy: 30 }, end: { base: 'prone', torso: 44, hip: 92, knee: 90, shoulder: 168, dy: 30 }, arrow: 'shoulders', view: 24, fault: 'sinking through the lower back instead of the upper' },
  'wk-lateral-lunge-rock': { start: { hipAbduct: 34 }, end: { torso: 26, hip: 92, knee: 104, hipAbduct: 40, split: 1 }, arrow: 'hips', view: 74, fault: 'the trailing foot rolling in — keep it flat' },
  'wk-toe-touch-squat': { start: { torso: 80, hip: 84, knee: 6 }, mid: deepSquat, end: { shoulder: 172 }, arrow: 'hips', view: 26, fault: 'rushing between the two shapes' },
  'fx-wrist-series': { start: { ...quadruped, shoulder: 72 }, end: { ...quadruped, shoulder: 108 }, arrow: 'shoulders', view: 26 },
  'fx-thoracic-bridge': { start: { base: 'supine', hip: 96, knee: 90, shoulder: 168, dy: 40 }, end: { base: 'supine', torso: -22, hip: 26, knee: 88, shoulder: 150, twist: 30, dy: 30 }, arrow: 'hips', view: 40, fault: 'pushing into the lower back rather than through the upper back and hips' },
  'fx-ankle-wall': { start: { ...halfKneel, ankle: 2 }, end: { ...halfKneel, ankle: 32, hip: 82, knee: 106 }, arrow: 'none', view: 22, props: ['wall'], fault: 'the knee falling inward to reach the wall' },
  'fx-9090-liftoff': { start: { base: 'seated', hip: 90, knee: 90, hipAbduct: 42 }, end: { base: 'seated', hip: 86, knee: 88, hipAbduct: 52, split: 1 }, arrow: 'none', view: 56, fault: 'leaning back to lift the knee — stay tall and lift less' },
  'fx-elephant-walk': { start: { torso: 78, hip: 84, knee: 6 }, end: { torso: 78, hip: 84, knee: 44, split: 1 }, arrow: 'none', view: 26, fault: 'straightening both legs at once, which stops it being a walk' },
  'ig-mo-squat-kneeling': { start: deepSquat, end: { hip: 90, knee: 118, torso: 6 }, arrow: 'hips', view: 30, fault: 'putting a hand down — the point is doing it without' },
  'ig-mo-heel-clicks': { start: { base: 'supine', hip: 92, knee: 88, hipAbduct: 30, dy: 40 }, end: { base: 'supine', hip: 92, knee: 88, hipAbduct: -12, dy: 40 }, arrow: 'none', view: 46, fault: 'rocking the pelvis instead of rotating the hips' },
  'ig-mo-lizard-quad-rot': { start: { torso: 34, hip: 78, knee: 104, split: 1 }, end: { torso: 30, hip: 76, knee: 128, twist: 38, shoulder: 60, elbow: 90, split: 1 }, arrow: 'hands', view: 46, fault: 'forcing the rotation before the hip has opened' },
  'ig-mo-pigeon-pushup': { start: { base: 'prone', torso: 46, hip: 96, knee: 108, hipAbduct: 40, shoulder: 140, split: 1, dy: 32 }, end: { base: 'prone', torso: 20, hip: 96, knee: 108, hipAbduct: 40, shoulder: 168, split: 1, dy: 32 }, arrow: 'shoulders', view: 42, fault: 'letting the back hip drift open — square it up first' },
  'ig-mo-squat-rot-ext': { start: deepSquat, end: { ...deepSquat, twist: 36, shoulder: 168, elbow: 6 }, arrow: 'hands', view: 46, fault: 'standing up out of the squat as you reach' },
  'ig-mo-golf-swings': { start: { twist: 34, shoulder: 20, elbow: 30 }, end: { twist: -34, shoulder: 20, elbow: 30 }, arrow: 'hands', view: 50, fault: 'driving it with the arms — they should be heavy and along for the ride' },
  'ig-mo-lymphatic-jumps': { start: { knee: 10, ankle: 6 }, end: { knee: 4, ankle: -12, dy: -6 }, arrow: 'hips', view: 26, fault: 'jumping properly — the heels barely leave the floor' },
  'ig-mo-trunk-twists': { start: { twist: 36, shoulder: 40, elbow: 60 }, end: { twist: -36, shoulder: 40, elbow: 60 }, arrow: 'hands', view: 52, fault: 'the hips turning with the ribs' },
  'ig-mo-body-waves': { start: { torso: 16, hip: 22, knee: 18, neck: -10 }, end: { torso: -12, hip: -6, knee: 4, neck: 14 }, arrow: 'shoulders', view: 26, fault: 'moving as one block — it travels segment by segment' },
  'ig-mo-bound-ups': { start: { hip: 24, knee: 32, ankle: 8 }, end: { hip: 6, knee: 6, ankle: -20, dy: -14 }, arrow: 'hips', view: 26 },
  'ig-mo-yoga-squat-reach': { start: { ...deepSquat, shoulder: 40, elbow: 100 }, end: { ...deepSquat, twist: 30, shoulder: 172, elbow: 6 }, arrow: 'hands', view: 44, fault: 'the heels lifting as you reach' },
  'ig-mo-pike-rotation': { start: downDog, end: { ...downDog, twist: 38, hipAbduct: 26, split: 1 }, arrow: 'hips', view: 44 },
  'ig-mo-body-bounces': { start: { knee: 14, shoulder: 10 }, end: { knee: 4, shoulder: 26, dy: -6 }, arrow: 'none', view: 26, fault: 'doing it properly — loose and sloppy is correct here' },
  'ig-mo-arm-swings-alt': { start: { shoulder: 88, shoulderAbduct: 78, elbow: 6 }, end: { shoulder: 88, shoulderAbduct: -14, elbow: 6 }, arrow: 'hands', view: 76, fault: 'swinging so hard the ribs flare at the back' },
  'ig-mo-neck-rolls': { start: { neck: 24, twist: 16 }, end: { neck: 24, twist: -16 }, arrow: 'none', view: 40, fault: 'rolling backwards through the top — go chin to chest only' },
  'ig-mo-pump-stretch': { start: { ...downDog, ankle: -24, knee: 4 }, end: { ...downDog, ankle: 30, knee: 40, split: 1 }, arrow: 'none', view: 20 },
  'ig-mo-thoracic-twist': { start: { twist: 0, shoulder: 40, elbow: 108 }, end: { twist: 42, shoulder: 40, elbow: 108 }, arrow: 'shoulders', view: 54, fault: 'the hips following the ribs round' },
  'ig-mo-cross-body-squat': { start: { torso: 20, hip: 78, knee: 92 }, end: { torso: 26, hip: 78, knee: 92, twist: 34, shoulder: 90, elbow: 20 }, arrow: 'hands', view: 48 },
  'ig-mo-lunge-twist': { start: { torso: 12, hip: 62, knee: 96, split: 1 }, end: { torso: 14, hip: 62, knee: 96, twist: 40, shoulder: 88, elbow: 10, split: 1 }, arrow: 'hands', view: 46, fault: 'rotating before the lunge has settled' },
  'ig-mo-gorilla-walk': { start: { ...deepSquat, shoulder: 108, elbow: 8 }, end: { ...deepSquat, shoulder: 108, elbow: 8, hipAbduct: 26, split: 1 }, arrow: 'none', view: 40, fault: 'standing up between steps' },
  'ig-mo-crab-cossack-crawl': { start: { torso: 24, hip: 96, knee: 112, hipAbduct: 42, split: 1 }, end: { torso: 24, hip: 30, knee: 18, hipAbduct: 42, split: 1 }, arrow: 'hips', view: 74, fault: 'standing up to travel' },
  'ig-st-banded-passthrough': { start: { shoulder: 8, elbow: 4, shoulderAbduct: 24 }, mid: { shoulder: 94, elbow: 4, shoulderAbduct: 32 }, end: { shoulder: 176, elbow: 4, shoulderAbduct: 26 }, arrow: 'hands', view: 56, props: ['band'], fault: 'bending the elbows to get round — widen the grip instead' },
  'ig-mo-seated-pelvic-tilt': { start: { base: 'seated', hip: 88, knee: 4, hipAbduct: 32, torso: 8, shoulder: 170 }, end: { base: 'seated', hip: 104, knee: 4, hipAbduct: 32, torso: -8, shoulder: 174 }, arrow: 'hips', view: 50, fault: 'rounding the back to sit taller' },
  'ig-mo-crossed-down-dog': { start: downDog, end: { ...downDog, hipAbduct: 20, knee: 16, split: 1 }, arrow: 'hips', view: 34 },
  'ig-mo-quadruped-rot-reach': { start: quadruped, end: { ...quadruped, twist: 46, shoulder: 150, elbow: 6 }, arrow: 'hands', view: 44, fault: 'the hips rotating with the reach' },
  'ig-mo-bws-wings': { start: { hip: 90, knee: 118, shoulder: 130, elbow: 120, shoulderAbduct: 40 }, end: { hip: 90, knee: 118, shoulder: 138, elbow: 118, shoulderAbduct: 74, torso: -10 }, arrow: 'hands', view: 68, fault: 'the ribs flaring as the elbows go wide' },
  'ig-mo-full-bridge': { start: { base: 'supine', hip: 92, knee: 92, shoulder: 158, elbow: 96, dy: 40 }, end: { base: 'supine', torso: -34, hip: 12, knee: 74, shoulder: 168, elbow: 8, dy: 24 }, arrow: 'hips', view: 24, fault: 'pushing into the lower back before the shoulders have opened' },
  'ig-mo-chin-tuck': { start: { neck: 16 }, end: { neck: -8 }, arrow: 'none', view: 20, fault: 'tipping the head down — it travels straight back' },
  'ig-mo-toe-taps': { start: downDog, end: { ...downDog, twist: 34, shoulder: 60, elbow: 20 }, arrow: 'hands', view: 40 },
  'ig-mo-downward-dog': { start: { base: 'prone', torso: 88, hip: 6, shoulder: 92, dy: 44 }, end: downDog, arrow: 'hips', view: 18, fault: 'reaching the heels down at the cost of a rounded back' },
  'ig-mo-knee-raise-hold': { start: { hip: 8, knee: 6, split: 1 }, end: { hip: 96, knee: 96, split: 1 }, arrow: 'none', view: 34, fault: 'leaning back as the knee comes up' },
  'ig-mo-deep-squat-knee-touch': { start: deepSquat, end: { ...deepSquat, hip: 118, knee: 134, hipAbduct: 18, split: 1 }, arrow: 'none', view: 42, fault: 'the heels coming up as you lower' },
  'ig-st-pancake-sweeps': { start: { base: 'seated', hip: 92, knee: 4, hipAbduct: 46, torso: 30, twist: 26 }, end: { base: 'seated', hip: 92, knee: 4, hipAbduct: 46, torso: 30, twist: -26 }, arrow: 'shoulders', view: 52, fault: 'rounding the back to get lower' },
  'ig-mo-behind-back-reach': { start: { shoulder: 20, elbow: 20, shoulderAbduct: 12 }, end: { shoulder: 168, elbow: 132, shoulderAbduct: 16, split: 1 }, arrow: 'hands', view: 62, fault: 'yanking with a towel — let it open over weeks' },
  'ig-mo-squat-heel-raise': { start: deepSquat, end: { ...deepSquat, ankle: -12, dy: -6 }, arrow: 'hips', view: 30 },
  'ig-mo-upward-dog': { start: { base: 'prone', torso: 90, shoulder: 74, elbow: 88, dy: 52 }, end: { base: 'prone', torso: 64, hip: -24, shoulder: 66, elbow: 4, dy: 40 }, arrow: 'shoulders', view: 18, fault: 'crunching the lower back — lift the chest, do not drop the hips' },

  // ============================ ISOLATION ================================
  // Curls and extensions are small movements, so they are drawn from an angle
  // where a bending elbow is actually visible rather than pointing at you.
  'is-curl-db': { start: { shoulder: 6, elbow: 4 }, end: { shoulder: 14, elbow: 142 }, arrow: 'hands', view: 36, props: ['dumbbell'], fault: 'swinging from the shoulder — the elbows stay by the ribs' },
  'is-curl-hammer': { start: { shoulder: 6, elbow: 4, shoulderAbduct: 6 }, end: { shoulder: 14, elbow: 138, shoulderAbduct: 6 }, arrow: 'hands', view: 36, props: ['dumbbell'], fault: 'letting the elbows drift forward at the top' },
  'is-curl-cable': { start: { shoulder: -6, elbow: 10 }, end: { shoulder: 10, elbow: 140 }, arrow: 'hands', view: 34, fault: 'resting at the bottom — the point of a cable is that you cannot' },
  'ig-is-incline-db-curl': { start: { base: 'supine', torso: -34, shoulder: -18, elbow: 4, dy: 32 }, end: { base: 'supine', torso: -34, shoulder: -10, elbow: 138, dy: 32 }, arrow: 'hands', view: 34, props: ['bench', 'dumbbell'], fault: 'letting the shoulder come forward, which removes the stretch you lay back for' },
  'ig-is-zottman-curl': { start: { shoulder: 6, elbow: 4 }, mid: { shoulder: 14, elbow: 142 }, end: { shoulder: 8, elbow: 8, shoulderAbduct: 4 }, arrow: 'hands', view: 36, props: ['dumbbell'], fault: 'rushing the lowering — the reversed grip on the way down is the whole exercise' },
  'ig-kb-curl-halo': { start: { shoulder: 8, elbow: 6 }, mid: { shoulder: 20, elbow: 146 }, end: { shoulder: 150, elbow: 128, twist: 14 }, arrow: 'hands', view: 40, props: ['kettlebell'], fault: 'letting the ribs flare as the bell passes behind the head' },
  'is-tri-pushdown': { start: { shoulder: -6, elbow: 96, torso: 6 }, end: { shoulder: -10, elbow: 4, torso: 6 }, arrow: 'hands', view: 34, fault: 'the elbows travelling — pin them at your sides for the whole set' },
  'is-tri-skull': { start: { base: 'supine', shoulder: 96, elbow: 108, dy: 40 }, end: { base: 'supine', shoulder: 92, elbow: 6, dy: 40 }, arrow: 'hands', view: 16, props: ['bench', 'dumbbell'], fault: 'the upper arms swinging back — only the forearms move' },
  'is-tri-overhead': { start: { shoulder: 168, elbow: 116 }, end: { shoulder: 172, elbow: 6 }, arrow: 'hands', view: 34, fault: 'the ribs flaring to reach further overhead' },
  'ig-is-tricep-kickback': { start: { torso: 66, hip: 72, knee: 18, shoulder: 26, elbow: 96 }, end: { torso: 66, hip: 72, knee: 18, shoulder: 26, elbow: 4 }, arrow: 'hands', view: 32, props: ['dumbbell'], fault: 'the upper arm dropping as you extend' },
  'is-leg-curl': { start: { base: 'prone', knee: 6, dy: 40 }, end: { base: 'prone', knee: 116, dy: 40 }, arrow: 'none', view: 16, props: ['bench'], fault: 'the hips lifting off the pad to help' },
  'is-leg-ext': { start: { base: 'seated', hip: 92, knee: 94 }, end: { base: 'seated', hip: 92, knee: 4 }, arrow: 'none', view: 20, fault: 'swinging the weight up and letting it drop' },
  'is-calf-raise': { start: { ankle: -18 }, end: { ankle: 34, dy: -8 }, arrow: 'hips', view: 26, fault: 'bouncing at the bottom instead of pausing in the stretch' },
  'is-shrug': { start: { shoulder: 4, neck: 0 }, end: { shoulder: 4, neck: -6, dy: -5 }, arrow: 'shoulders', view: 40, props: ['barbell'], fault: 'rolling the shoulders — straight up and straight down' },
  'ig-is-front-raise': { start: { shoulder: 6, elbow: 4 }, end: { shoulder: 92, elbow: 4 }, arrow: 'hands', view: 34, props: ['dumbbell'], fault: 'leaning back to get the weight up' },
  'ig-is-shoulder-rotation': { start: { shoulder: 12, elbow: 90, shoulderAbduct: 8, twist: 0 }, end: { shoulder: 12, elbow: 90, shoulderAbduct: 46, twist: 0 }, arrow: 'hands', view: 74, props: ['band'], fault: 'letting the elbow leave the side — tuck a towel there if it wanders' },

  // ============================ CORE: FLEXION ============================
  'co-hanging-leg': { start: { shoulder: 176, elbow: 4, hip: 6, knee: 6, dy: -34 }, end: { shoulder: 176, elbow: 4, hip: 96, knee: 8, dy: -34 }, arrow: 'none', view: 22, props: ['bar'], fault: 'swinging — if you are using momentum, bend the knees and slow down' },
  'co-cable-crunch': { start: { base: 'seated', hip: 88, knee: 96, torso: -18, shoulder: 156, elbow: 96 }, end: { base: 'seated', hip: 88, knee: 96, torso: 42, shoulder: 150, elbow: 96 }, arrow: 'shoulders', view: 22, fault: 'hinging at the hips instead of curling the spine' },
  'ig-kb-crunch': { start: { base: 'supine', hip: 88, knee: 92, torso: 0, dy: 40 }, end: { base: 'supine', hip: 88, knee: 92, torso: 34, dy: 40 }, arrow: 'shoulders', view: 14, props: ['kettlebell'], fault: 'yanking on the neck' },
  'ig-kb-oh-situp': { start: { base: 'supine', hip: 86, knee: 90, shoulder: 172, dy: 40 }, end: { base: 'supine', hip: 46, knee: 88, torso: 62, shoulder: 176, dy: 40 }, arrow: 'shoulders', view: 16, props: ['kettlebell'], fault: 'the arms dropping forward — the bell stays stacked over the shoulders' },
  'ig-kb-side-crunch': { start: { base: 'supine', hip: 84, knee: 92, twist: 0, dy: 40 }, end: { base: 'supine', hip: 84, knee: 92, torso: 26, twist: 26, dy: 40 }, arrow: 'shoulders', view: 40, props: ['kettlebell'], fault: 'rotating the hips as well — only the ribs move' },
  'ig-co-sit-up': { start: { base: 'supine', hip: 86, knee: 90, dy: 40 }, end: { base: 'supine', hip: 44, knee: 88, torso: 64, dy: 40 }, arrow: 'shoulders', view: 14, fault: 'anchoring the feet and pulling with the hip flexors' },
  'ig-co-extended-crunch': { start: { base: 'supine', torso: -18, hip: 76, knee: 88, dy: 38 }, end: { base: 'supine', torso: 34, hip: 76, knee: 88, dy: 38 }, arrow: 'shoulders', view: 14, fault: 'rushing the extended part, which is the range you came for' },
  'ig-co-lying-leg-raise': { start: { base: 'supine', hip: 6, knee: 4, dy: 40 }, end: { base: 'supine', hip: 92, knee: 4, dy: 40 }, arrow: 'none', view: 14, fault: 'the lower back arching off the floor as the legs lower' },
  'ig-co-heel-taps': { start: { base: 'supine', hip: 84, knee: 92, twist: 18, dy: 40 }, end: { base: 'supine', hip: 84, knee: 92, twist: -18, dy: 40 }, arrow: 'none', view: 34, fault: 'moving fast enough that the obliques stop doing it' },
  'ig-co-vertical-hip-lift': { start: { base: 'supine', hip: 92, knee: 4, dy: 40 }, end: { base: 'supine', hip: 104, knee: 4, dy: 30 }, arrow: 'none', view: 16, fault: 'pushing with the hands — the lift is small and comes from the abs' },
  'ig-co-wall-crunch': { start: { base: 'supine', hip: 92, knee: 92, dy: 40 }, end: { base: 'supine', hip: 92, knee: 92, torso: 30, dy: 40 }, arrow: 'shoulders', view: 14, props: ['wall'] },
  'ig-co-star-crunch': { start: { base: 'supine', hip: 8, knee: 4, shoulder: 170, shoulderAbduct: 30, dy: 40 }, end: { base: 'supine', hip: 78, knee: 6, torso: 40, shoulder: 96, shoulderAbduct: 20, dy: 40 }, arrow: 'none', view: 26, fault: 'collapsing into a ball — the limbs stay long' },
  'ig-co-l-sit': { start: { base: 'seated', hip: 92, knee: 90, shoulder: 8, elbow: 4 }, end: { base: 'seated', hip: 92, knee: 4, shoulder: 8, elbow: 4, dy: -8 }, arrow: 'none', view: 22, fault: 'sinking into the shoulders — push the floor away first' },

  // ======================= CORE: ANTI-ROTATION ===========================
  'co-side-plank': { start: { torso: 88, shoulder: 92, elbow: 88, twist: 40, hip: 4, knee: 4, dy: 46 }, end: { torso: 84, shoulder: 92, elbow: 88, twist: 40, hip: 4, knee: 4, dy: 40 }, arrow: 'none', view: 62, fault: 'the hips sagging towards the floor' },
  'ig-co-side-plank-reach': { start: { torso: 86, shoulder: 92, elbow: 88, twist: 40, dy: 44 }, end: { torso: 86, shoulder: 150, elbow: 10, twist: 8, dy: 44 }, arrow: 'hands', view: 60, fault: 'the hips dropping as the arm threads through' },
  'ig-co-side-plank-leg-lift': { start: { torso: 86, shoulder: 92, elbow: 88, twist: 40, hipAbduct: 4, dy: 44 }, end: { torso: 86, shoulder: 92, elbow: 88, twist: 40, hipAbduct: 34, split: 1, dy: 44 }, arrow: 'none', view: 60, fault: 'rolling backwards to make the lift easier' },
  'ig-co-russian-twist': { start: { base: 'seated', torso: -26, hip: 104, knee: 84, shoulder: 76, elbow: 40, twist: 30 }, end: { base: 'seated', torso: -26, hip: 104, knee: 84, shoulder: 76, elbow: 40, twist: -30 }, arrow: 'hands', view: 40, fault: 'swinging the arms while the ribs stay still' },
  'ig-kb-halo': { start: { shoulder: 44, elbow: 130, twist: 22 }, mid: { shoulder: 150, elbow: 132, twist: 0 }, end: { shoulder: 44, elbow: 130, twist: -22 }, arrow: 'hands', view: 46, props: ['kettlebell'], fault: 'the head poking forward to get out of the way' },
  'ig-kb-devils-halo': { start: { shoulder: 40, elbow: 128, twist: 26, hip: 10 }, mid: { shoulder: 146, elbow: 130, twist: 0, hip: 14 }, end: { shoulder: 40, elbow: 128, twist: -26, hip: 10 }, arrow: 'hands', view: 46, props: ['kettlebell'], fault: 'the hips swinging with the bell' },
  'ig-kb-around-world': { start: { shoulder: 20, elbow: 12, twist: 28 }, mid: { shoulder: 26, elbow: 10, twist: 0 }, end: { shoulder: 20, elbow: 12, twist: -28 }, arrow: 'hands', view: 48, props: ['kettlebell'], fault: 'leaning away from the bell instead of bracing against it' },
  'ig-kb-iron-trident': { start: { shoulder: 90, elbow: 8, shoulderAbduct: 10, twist: 0 }, end: { shoulder: 90, elbow: 8, shoulderAbduct: 56, twist: 12 }, arrow: 'hands', view: 62, props: ['kettlebell'], fault: 'letting the torso rotate — it is an anti-rotation drill' },
  'ig-kb-half-kneeling-chop': { start: { hip: 90, knee: 92, shoulder: 150, elbow: 20, twist: 24, split: 1 }, end: { hip: 90, knee: 92, shoulder: 26, elbow: 16, twist: -18, split: 1 }, arrow: 'hands', view: 52, props: ['kettlebell'], fault: 'the hips turning with the chop' },
  'ig-co-lumberjack': { start: { torso: 8, shoulder: 140, elbow: 14, twist: 26 }, end: { torso: 14, shoulder: 40, elbow: 12, twist: -26 }, arrow: 'hands', view: 52, props: ['barbell'], fault: 'chopping with the arms while the trunk stays passive' },
  'ig-co-spiderman-plank': { start: { base: 'prone', torso: 90, shoulder: 92, hip: 4, dy: 46 }, end: { base: 'prone', torso: 90, shoulder: 92, hip: 66, knee: 88, hipAbduct: 30, split: 1, dy: 46 }, arrow: 'none', view: 26, fault: 'the hips rising as the knee comes forward' },
  'ig-co-bear-pass-through': { start: { base: 'prone', torso: 88, hip: 84, knee: 88, shoulder: 88, dy: 38 }, end: { base: 'prone', torso: 88, hip: 84, knee: 88, shoulder: 60, elbow: 18, twist: 14, dy: 38 }, arrow: 'hands', view: 30, props: ['kettlebell'], fault: 'the hips rocking as the hand reaches under' },
  'ig-co-plank-pull-through': { start: { base: 'prone', torso: 90, shoulder: 92, dy: 46 }, end: { base: 'prone', torso: 90, shoulder: 64, elbow: 22, twist: 12, dy: 46 }, arrow: 'hands', view: 30, props: ['kettlebell'], fault: 'the hips twisting to help the arm reach' },
  'ig-co-side-plank-hops': { start: { base: 'prone', torso: 90, shoulder: 92, hip: 4, knee: 4, dy: 46 }, end: { base: 'prone', torso: 90, shoulder: 92, hip: 26, knee: 40, dy: 42 }, arrow: 'none', view: 26, fault: 'the hips piking up as the feet hop in' },

  // =============================== HINGE =================================
  'hg-rdl-db': { start: { shoulder: 4 }, end: { torso: 66, hip: 70, knee: 16, shoulder: 4 }, arrow: 'shoulders', view: 28, props: ['dumbbell'], fault: 'bending the knees to reach lower — the range comes from the hamstrings' },
  'hg-single-rdl': { start: { shoulder: 4 }, end: { torso: 74, hip: 78, knee: 12, hipAbduct: 6, split: 1, shoulder: 4 }, arrow: 'shoulders', view: 30, props: ['dumbbell'], fault: 'the hip of the free leg opening to the side' },
  'hg-hip-thrust': { start: { base: 'supine', torso: -22, hip: 96, knee: 84, dy: 34 }, end: { base: 'supine', torso: -22, hip: 20, knee: 84, dy: 26 }, arrow: 'hips', view: 22, props: ['bench', 'barbell'], fault: 'finishing by arching the lower back instead of squeezing the glutes' },
  'hg-good-morning': { start: { shoulder: -18, elbow: 152 }, end: { torso: 76, hip: 78, knee: 14, shoulder: -18, elbow: 152 }, arrow: 'shoulders', view: 26, props: ['barbell'], fault: 'rounding the back — it stays long from head to hips' },
  'hg-back-ext': { start: { base: 'prone', torso: 52, hip: 56, dy: 24 }, end: { base: 'prone', torso: -4, hip: 2, dy: 24 }, arrow: 'shoulders', view: 20, fault: 'hyperextending at the top — stop level with the legs' },
  'hg-nordic': { start: { hip: 4, knee: 90, dy: 22 }, end: { hip: 6, knee: 20, torso: 6, dy: 22 }, arrow: 'shoulders', view: 20, props: ['floor'], fault: 'breaking at the hips, which turns it into a fall' },
  'ig-kb-high-swing': { start: { torso: 62, hip: 68, knee: 22, shoulder: 44, elbow: 8 }, mid: { torso: 10, hip: 8, knee: 6, shoulder: 96, elbow: 6 }, end: { torso: 4, hip: 4, knee: 4, shoulder: 166, elbow: 6 }, arrow: 'hands', view: 28, props: ['kettlebell'], fault: 'lifting the bell with the shoulders — it is thrown by the hips' },
  'ig-hg-single-leg-bridge': { start: { base: 'supine', hip: 92, knee: 88, dy: 40 }, end: { base: 'supine', hip: 26, knee: 84, split: 1, dy: 34 }, arrow: 'hips', view: 24, fault: 'the hips dropping on the unsupported side' },
  'gy-trap-bar-deadlift': { start: { torso: 52, hip: 88, knee: 74, ankle: 10, shoulder: 4 }, end: { shoulder: 4 }, arrow: 'shoulders', view: 30, props: ['dumbbell'], fault: 'the hips shooting up first, leaving the bar behind' },

  // =============================== LUNGE =================================
  'ln-bulgarian': { start: { hip: 12, knee: 18, split: 1 }, end: { torso: 14, hip: 66, knee: 100, ankle: 8, split: 1 }, arrow: 'hips', view: 28, props: ['bench', 'dumbbell'], fault: 'the front knee collapsing inward as you descend' },
  'ln-walking': { start: { hip: 10, knee: 10 }, end: { torso: 8, hip: 62, knee: 96, split: 1 }, arrow: 'hips', view: 28, props: ['dumbbell'], fault: 'a short step, which puts all of it on the knee' },
  'ln-reverse': { start: { hip: 8, knee: 8 }, end: { torso: 10, hip: 58, knee: 94, split: 1 }, arrow: 'hips', view: 28, props: ['dumbbell'], fault: 'stepping so far back that the front shin falls over' },
  'gy-curtsy-lunge': { start: { hipAbduct: 6 }, end: { torso: 10, hip: 56, knee: 92, hipAbduct: 22, split: 1 }, arrow: 'hips', view: 44, props: ['dumbbell'], fault: 'the hips turning — they stay square to the front' },
  'gy-deficit-reverse-lunge': { start: { hip: 8, knee: 8, dy: -8 }, end: { torso: 14, hip: 66, knee: 104, split: 1, dy: -8 }, arrow: 'hips', view: 28, props: ['box', 'dumbbell'], fault: 'shortening the extra range to add weight' },

  // =============================== SQUAT =================================
  'sq-hack': { start: { torso: -16, hip: 14, knee: 12 }, end: { torso: -16, hip: 96, knee: 108 }, arrow: 'hips', view: 24, fault: 'letting the lower back round off the pad at the bottom' },
  'sq-leg-press': { start: { base: 'supine', torso: -30, hip: 100, knee: 106, dy: 34 }, end: { base: 'supine', torso: -30, hip: 34, knee: 12, dy: 34 }, arrow: 'none', view: 22, fault: 'locking the knees hard at the top' },
  'sq-box': { start: { shoulder: -18, elbow: 152 }, end: { torso: 30, hip: 92, knee: 96, ankle: 8, shoulder: -18, elbow: 152 }, arrow: 'hips', view: 26, props: ['box', 'barbell'], fault: 'flopping onto the box rather than sitting under control' },
  'gy-zercher-squat': { start: { shoulder: 34, elbow: 130 }, end: { torso: 16, hip: 100, knee: 110, ankle: 20, shoulder: 40, elbow: 128 }, arrow: 'hips', view: 30, fault: 'the elbows sliding down towards the wrists' },

  // =============================== CARRY =================================
  'gy-front-rack-carry': { start: { shoulder: 34, elbow: 140 }, end: { shoulder: 34, elbow: 140, hip: 20, knee: 12, split: 1 }, arrow: 'none', view: 34, props: ['kettlebell'], fault: 'leaning back to shelf the bells on the ribs' },
  'gy-waiter-walk': { start: { shoulder: 172, elbow: 4 }, end: { shoulder: 172, elbow: 4, hip: 20, knee: 12, split: 1 }, arrow: 'none', view: 34, props: ['kettlebell'], fault: 'the arm drifting forward of the ear' },
  'pr-meadows': { start: { torso: 70, hip: 74, knee: 20, shoulder: 94, elbow: 6, twist: 16 }, end: { torso: 70, hip: 74, knee: 20, shoulder: 48, elbow: 118, twist: 8 }, arrow: 'hands', view: 40, props: ['barbell'], fault: 'squaring up to the bar — you stand side-on for a reason' },

  // ======================= UPPER BODY: PRESSING ==========================
  // Bench work is drawn lying down and side-on: a supine press seen at 34
  // degrees is a heap of overlapping limbs.
  'ph-db-bench': {
    start: { base: 'supine', shoulder: 92, elbow: 76, hip: 4, knee: 82, dy: 40 },
    end: { base: 'supine', shoulder: 92, elbow: 4, hip: 4, knee: 82, dy: 40 },
    arrow: 'hands', view: 14, props: ['bench', 'dumbbell'],
    fault: 'the elbows flaring straight out to the sides — about 45 degrees is the shoulder-friendly angle',
  },
  'ph-incline': {
    start: { base: 'supine', torso: -26, shoulder: 96, elbow: 74, hip: 10, knee: 80, dy: 34 },
    end: { base: 'supine', torso: -26, shoulder: 96, elbow: 4, hip: 10, knee: 80, dy: 34 },
    arrow: 'hands', view: 14, props: ['bench', 'dumbbell'],
    fault: 'setting the bench so steep it becomes a shoulder press',
  },
  'ig-ph-incline-bb-press': {
    start: { base: 'supine', torso: -26, shoulder: 96, elbow: 74, hip: 10, knee: 80, dy: 34 },
    end: { base: 'supine', torso: -26, shoulder: 96, elbow: 4, hip: 10, knee: 80, dy: 34 },
    arrow: 'hands', view: 14, props: ['bench', 'barbell'],
    fault: 'bouncing the bar off the chest',
  },
  'ig-ph-decline-press': {
    start: { base: 'supine', torso: 18, shoulder: 88, elbow: 78, hip: 4, knee: 84, dy: 44 },
    end: { base: 'supine', torso: 18, shoulder: 88, elbow: 4, hip: 4, knee: 84, dy: 44 },
    arrow: 'hands', view: 14, props: ['bench', 'barbell'],
  },
  'ph-machine-press': {
    start: { base: 'seated', shoulder: 78, elbow: 82 },
    end: { base: 'seated', shoulder: 84, elbow: 8 },
    arrow: 'hands', view: 20,
    fault: 'letting the shoulder blades peel off the pad to squeeze out more range',
  },
  'ph-dip': {
    start: { shoulder: -8, elbow: 6, torso: 18, hip: 16, knee: 60, dy: -18 },
    end: { shoulder: -34, elbow: 96, torso: 24, hip: 16, knee: 60, dy: 4 },
    arrow: 'shoulders', view: 26,
    fault: 'going deeper than the shoulders are happy with — stop at upper arm parallel',
  },
  'ph-cable-fly': {
    start: { shoulder: 84, shoulderAbduct: 74, elbow: 14, torso: 10 },
    end: { shoulder: 88, shoulderAbduct: 8, elbow: 14, torso: 12 },
    arrow: 'hands', view: 76, props: ['band'],
    fault: 'turning it into a press by bending the elbows as you close',
  },
  'ig-ph-low-high-fly': {
    start: { shoulder: 30, shoulderAbduct: 66, elbow: 12, torso: 8 },
    end: { shoulder: 118, shoulderAbduct: 12, elbow: 12, torso: 8 },
    arrow: 'hands', view: 74, props: ['band'],
    fault: 'shrugging at the top instead of finishing with the chest',
  },
  'ig-ph-pec-deck': {
    start: { base: 'seated', shoulder: 86, shoulderAbduct: 78, elbow: 16 },
    end: { base: 'seated', shoulder: 88, shoulderAbduct: 10, elbow: 16 },
    arrow: 'hands', view: 78,
    fault: 'letting the shoulders roll forward at the end of the squeeze',
  },
  'ig-ph-db-pullover': {
    start: { base: 'supine', shoulder: 170, elbow: 12, hip: 6, knee: 84, dy: 40 },
    end: { base: 'supine', shoulder: 92, elbow: 12, hip: 6, knee: 84, dy: 40 },
    arrow: 'hands', view: 14, props: ['bench', 'dumbbell'],
    fault: 'the ribs flaring as the arms go overhead',
  },
  'ig-ph-hindu-pushup': {
    start: { base: 'prone', torso: 62, hip: 84, shoulder: 150, knee: 4, dy: 30 },
    end: { base: 'prone', torso: 104, hip: -18, shoulder: 62, knee: 4, dy: 52 },
    arrow: 'shoulders', view: 10,
    fault: 'dropping the hips before the chest has travelled forward',
  },
  'ig-ph-tempo-pushup': {
    start: { base: 'prone', torso: 90, shoulder: 92, elbow: 4, dy: 40 },
    end: { base: 'prone', torso: 90, shoulder: 74, elbow: 86, dy: 52 },
    arrow: 'shoulders', view: 10,
    fault: 'rushing the lowering — the tempo is the exercise',
  },
  'ig-kb-crush-press': {
    start: { base: 'supine', shoulder: 88, elbow: 84, hip: 4, knee: 82, dy: 40 },
    end: { base: 'supine', shoulder: 92, elbow: 6, hip: 4, knee: 82, dy: 40 },
    arrow: 'hands', view: 14, props: ['kettlebell'],
    fault: 'letting the bells drift apart — the whole point is crushing them together',
  },
  'ig-kb-horn-pushup': {
    start: { base: 'prone', torso: 90, shoulder: 92, elbow: 4, dy: 38 },
    end: { base: 'prone', torso: 90, shoulder: 72, elbow: 92, dy: 50 },
    arrow: 'shoulders', view: 12, props: ['kettlebell'],
    fault: 'wobbling the bells — set them wide enough to be stable before you start',
  },
  'ig-kb-curl-chest-press': {
    start: { shoulder: 6, elbow: 8 },
    end: { shoulder: 88, elbow: 10 },
    mid: { shoulder: 14, elbow: 142 },
    arrow: 'hands', view: 30, props: ['kettlebell'],
    fault: 'pressing before the curl has finished — they are two movements, in order',
  },

  // ======================= UPPER BODY: OVERHEAD ==========================
  'pv-db-press': {
    start: { base: 'seated', shoulder: 34, elbow: 142, shoulderAbduct: 26 },
    end: { base: 'seated', shoulder: 172, elbow: 6, shoulderAbduct: 10 },
    arrow: 'hands', view: 46, props: ['dumbbell', 'bench'],
    fault: 'arching the lower back to fake overhead range',
  },
  'pv-arnold': {
    start: { base: 'seated', shoulder: 30, elbow: 148, shoulderAbduct: 4 },
    mid: { base: 'seated', shoulder: 40, elbow: 120, shoulderAbduct: 52 },
    end: { base: 'seated', shoulder: 172, elbow: 8, shoulderAbduct: 10 },
    arrow: 'hands', view: 52, props: ['dumbbell'],
    fault: 'rushing the rotation — the turn is where the front delt actually works',
  },
  'pv-push-press': {
    start: { shoulder: 32, elbow: 146 },
    mid: { shoulder: 30, elbow: 148, hip: 26, knee: 34, ankle: 8 },
    end: { shoulder: 174, elbow: 6 },
    arrow: 'hands', view: 34, props: ['barbell'],
    fault: 'a slow dip — the leg drive is a short sharp punch, not a squat',
  },
  'pv-landmine': {
    start: { hip: 88, knee: 92, shoulder: 40, elbow: 118, split: 1 },
    end: { hip: 88, knee: 92, shoulder: 128, elbow: 12, split: 1 },
    arrow: 'hands', view: 30, props: ['barbell'],
    fault: 'letting the ribs flare — half-kneeling exists to stop exactly that',
  },
  'gy-z-press': {
    start: { base: 'seated', hip: 92, knee: 4, shoulder: 32, elbow: 144 },
    end: { base: 'seated', hip: 92, knee: 4, shoulder: 172, elbow: 6 },
    arrow: 'hands', view: 44, props: ['dumbbell'],
    fault: 'collapsing forward at the hips — with nothing to arch against, it shows',
  },

  // ======================= UPPER BODY: PULLING ===========================
  'pu-chinup': {
    start: { shoulder: 176, elbow: 4, hip: 6, knee: 18, dy: -34 },
    end: { shoulder: 128, elbow: 128, hip: 10, knee: 34, dy: -8 },
    arrow: 'shoulders', view: 34, props: ['bar'],
    fault: 'shrugging up instead of pulling the shoulder blades down first',
  },
  'gy-neutral-pullup': {
    start: { shoulder: 176, elbow: 4, hip: 6, knee: 18, dy: -34 },
    end: { shoulder: 132, elbow: 124, hip: 10, knee: 34, dy: -8 },
    arrow: 'shoulders', view: 30, props: ['bar'],
    fault: 'stopping at chin height when the chest could reach the bar',
  },
  'pu-assisted': {
    start: { shoulder: 176, elbow: 4, hip: 8, knee: 26, dy: -30 },
    end: { shoulder: 130, elbow: 126, hip: 12, knee: 40, dy: -6 },
    arrow: 'shoulders', view: 32, props: ['bar'],
    fault: 'using more assistance than you need to control the way down',
  },
  'pu-lat-pulldown': {
    start: { base: 'seated', shoulder: 168, elbow: 8 },
    end: { base: 'seated', shoulder: 96, elbow: 112, torso: -12 },
    arrow: 'hands', view: 40,
    fault: 'leaning back to turn it into a row',
  },
  'ig-pu-reverse-grip-pulldown': {
    start: { base: 'seated', shoulder: 164, elbow: 8 },
    end: { base: 'seated', shoulder: 88, elbow: 122, torso: -10 },
    arrow: 'hands', view: 40,
    fault: 'letting the elbows drift forward, which hands the work to the biceps',
  },
  'pu-band-pulldown': {
    start: { shoulder: 158, elbow: 6, torso: 8 },
    end: { shoulder: 74, elbow: 24, torso: 12 },
    arrow: 'hands', view: 34, props: ['band'],
    fault: 'pulling the hands down rather than driving the elbows down and back',
  },
  'pr-db-row': {
    start: { torso: 76, hip: 80, knee: 18, shoulder: 92, elbow: 6, split: 1 },
    end: { torso: 76, hip: 80, knee: 18, shoulder: 54, elbow: 116, split: 1 },
    arrow: 'hands', view: 34, props: ['bench', 'dumbbell'],
    fault: 'rotating the torso open to get the weight higher',
  },
  'pr-cable-row': {
    start: { base: 'seated', hip: 96, knee: 22, torso: 22, shoulder: 88, elbow: 8 },
    end: { base: 'seated', hip: 92, knee: 22, torso: -6, shoulder: 48, elbow: 118 },
    arrow: 'hands', view: 30,
    fault: 'rowing with the lower back — the torso angle should barely change',
  },
  'pr-chest-supported': {
    start: { base: 'prone', torso: 66, shoulder: 96, elbow: 6, dy: 28 },
    end: { base: 'prone', torso: 66, shoulder: 56, elbow: 118, dy: 28 },
    arrow: 'hands', view: 30, props: ['bench', 'dumbbell'],
    fault: 'peeling the chest off the pad, which is the one thing this variation prevents',
  },
  'pr-face-pull': {
    start: { shoulder: 92, shoulderAbduct: 12, elbow: 10 },
    end: { shoulder: 96, shoulderAbduct: 74, elbow: 104 },
    arrow: 'hands', view: 72,
    fault: 'pulling to the chest — it goes to the face, elbows high',
  },
  'ig-pr-tripod-row': {
    start: { torso: 78, hip: 82, knee: 16, shoulder: 92, elbow: 6, split: 1 },
    end: { torso: 78, hip: 82, knee: 16, shoulder: 52, elbow: 120, split: 1 },
    arrow: 'hands', view: 34, props: ['dumbbell'],
    fault: 'the free hand taking the weight instead of the legs and trunk',
  },
  'ig-pr-gorilla-row': {
    start: { torso: 68, hip: 76, knee: 34, shoulder: 92, elbow: 8, split: 1 },
    end: { torso: 68, hip: 76, knee: 34, shoulder: 58, elbow: 114, split: 1 },
    arrow: 'hands', view: 32, props: ['kettlebell'],
    fault: 'standing up with each rep instead of staying hinged',
  },
  'ig-kb-ballistic-row': {
    start: { torso: 72, hip: 78, knee: 22, shoulder: 94, elbow: 4 },
    end: { torso: 72, hip: 78, knee: 22, shoulder: 56, elbow: 122 },
    arrow: 'hands', view: 32, props: ['kettlebell'],
    fault: 'yanking with the lower back — the torso stays where it started',
  },
  'ig-pr-wide-stance-high-pull': {
    start: { torso: 54, hip: 62, knee: 42, hipAbduct: 22, shoulder: 96, elbow: 6 },
    end: { torso: 12, hip: 14, knee: 10, hipAbduct: 22, shoulder: 78, elbow: 112, shoulderAbduct: 48 },
    arrow: 'hands', view: 44, props: ['kettlebell'],
    fault: 'pulling with the arms before the hips have finished',
  },
  'ig-pr-tbar-row': {
    start: { torso: 70, hip: 74, knee: 20, shoulder: 92, elbow: 6 },
    end: { torso: 70, hip: 74, knee: 20, shoulder: 52, elbow: 120 },
    arrow: 'hands', view: 30, props: ['barbell'],
    fault: 'the torso rising with every rep',
  },
  'ig-is-prone-scap-slide': {
    start: { base: 'prone', torso: -8, shoulder: 96, shoulderAbduct: 62, elbow: 92, dy: 46 },
    end: { base: 'prone', torso: -10, shoulder: 150, shoulderAbduct: 30, elbow: 10, dy: 46 },
    arrow: 'hands', view: 16,
    fault: 'letting the hands lift instead of sliding — keep them light on the floor',
  },
  'pr-inverted': {
    start: { torso: -80, hip: 4, knee: 4, shoulder: 92, elbow: 4, dy: 24 },
    end: { torso: -80, hip: 4, knee: 4, shoulder: 62, elbow: 108, dy: 24 },
    arrow: 'shoulders', view: 24, props: ['bar'],
    fault: 'the hips sagging so it becomes a shrug rather than a row',
  },

  /*
   * Core work that was inheriting the plank and therefore not moving.
   *
   * Found by measuring start-to-end travel across the whole library: anything
   * under 12 units draws as a person standing still. A plank genuinely is
   * static and keeps its held pose. An ab wheel rollout is not, and neither are
   * any of these.
   */
  'co-ab-wheel': {
    start: { base: 'prone', torso: 58, hip: 62, knee: 90, shoulder: 54, dy: 26 },
    end: { base: 'prone', torso: 88, hip: 12, knee: 8, shoulder: 166, dy: 42 },
    arrow: 'hands', view: 8,
    fault: 'the lower back arching as you reach — stop where the ribs stop, not where the arms do',
  },
  'ig-co-psoas-march': {
    start: { base: 'supine', hip: 92, knee: 92, dy: 40 },
    end: { base: 'supine', hip: 28, knee: 26, split: 1, dy: 40 },
    arrow: 'none', view: 12,
    fault: 'the lower back lifting off the floor as the leg lowers',
  },
  'ig-co-scissors': {
    start: { base: 'supine', hip: 76, knee: 4, dy: 40 },
    end: { base: 'supine', hip: 22, knee: 4, split: 1, dy: 40 },
    arrow: 'none', view: 12,
    fault: 'letting the back arch — the range is however low you can go and stay flat',
  },
  'ig-co-arch-rocks': {
    start: { base: 'prone', torso: -12, hip: -16, shoulder: 172, dy: 46 },
    end: { base: 'prone', torso: -26, hip: -30, shoulder: 176, dy: 46 },
    arrow: 'shoulders', view: 10,
    fault: 'bending at the knees instead of holding one long arch',
  },
  'ig-co-supine-heel-drag': {
    start: { base: 'supine', hip: 88, knee: 96, dy: 40 },
    end: { base: 'supine', hip: 26, knee: 24, dy: 40 },
    arrow: 'none', view: 12,
    fault: 'the heel leaving the floor — it stays in contact the whole way',
  },
  'ig-co-long-lever-reach': {
    start: { base: 'prone', torso: 90, shoulder: 92, dy: 46 },
    end: { base: 'prone', torso: 90, shoulder: 126, dy: 46 },
    arrow: 'hands', view: 10,
    fault: 'the hips dropping as the arms reach further out',
  },
  'ig-co-bear-hover': {
    start: { base: 'prone', torso: 88, hip: 86, knee: 90, shoulder: 88, dy: 38 },
    end: { base: 'prone', torso: 90, hip: 76, knee: 80, shoulder: 90, dy: 34 },
    arrow: 'none', view: 14,
    fault: 'the knees drifting under the hips — they stay behind them, an inch off the floor',
  },
  'ig-co-seated-lean-back': {
    start: { base: 'seated', torso: -6, hip: 92, knee: 88 },
    end: { base: 'seated', torso: -28, hip: 110, knee: 88 },
    arrow: 'shoulders', view: 16,
    fault: 'rounding the lower back instead of leaning from the hips',
  },
  'ig-co-beginner-brace': {
    start: { base: 'supine', hip: 90, knee: 92, dy: 40 },
    end: { base: 'supine', hip: 90, knee: 92, shoulder: 34, dy: 40 },
    arrow: 'none', view: 12,
    fault: 'holding your breath — you should be able to talk through it',
  },
  'ig-co-support-hold': {
    start: { shoulder: 8, elbow: 2, dy: -14 },
    end: { shoulder: 8, elbow: 2, dy: -18 },
    arrow: 'none', view: 26,
    fault: 'sinking into the shoulders — push the floor away and stay tall',
  },
  'ig-run-pogo': {
    start: { knee: 16, ankle: 24, shoulder: 12 },
    end: { knee: 4, ankle: -22, shoulder: 16, dy: -16 },
    arrow: 'hips', view: 26,
    fault: 'bending the knees to jump — this is all ankle',
  },
  'wd-figure-4': {
    start: { base: 'supine', hip: 88, knee: 90, dy: 40 },
    end: { base: 'supine', hip: 116, knee: 74, hipAbduct: 34, split: 1, dy: 40 },
    arrow: 'none', view: 30,
    fault: 'pulling on the shin instead of behind the thigh',
  },

  // --- the Hyrox stations and their substitutes --------------------------
  // Wall balls and thrusters are CONDITIONING for programming purposes -- a
  // heavy 4x5 slot must never serve 100 of them -- but they are squat-shaped
  // movements and the picture should show that, so they get poses of their own
  // rather than the generic conditioning default.
  'hx-wall-ball': {
    start: { torso: 22, hip: 96, knee: 108, ankle: 20, shoulder: 30, elbow: 140 },
    end: { shoulder: 172, elbow: 8 },
    arrow: 'hands', view: 30, props: ['medicine-ball'],
    fault: 'pressing after you stand instead of letting the legs throw it',
  },
  'hx-sub-db-thruster': {
    start: { torso: 20, hip: 92, knee: 104, ankle: 18, shoulder: 28, elbow: 145 },
    end: { shoulder: 174, elbow: 6 },
    arrow: 'hands', view: 30, props: ['dumbbell'],
    fault: 'stopping between the squat and the press — it is one movement',
  },
  'hx-sled-push': {
    start: { torso: 58, hip: 46, knee: 30, shoulder: 100, elbow: 6 },
    end: { torso: 58, hip: 62, knee: 74, shoulder: 100, elbow: 6, split: 1 },
    arrow: 'none', view: 24,
    fault: 'standing up as it gets heavy — the angle is the whole exercise',
  },
  'hx-sub-treadmill-push': {
    start: { torso: 56, hip: 44, knee: 28, shoulder: 98, elbow: 6 },
    end: { torso: 56, hip: 60, knee: 72, shoulder: 98, elbow: 6, split: 1 },
    arrow: 'none', view: 24,
    fault: 'letting the hips rise until you are jogging rather than pushing',
  },
  'hx-sub-towel-push': {
    start: { torso: 62, hip: 50, knee: 34, shoulder: 104, elbow: 4 },
    end: { torso: 62, hip: 66, knee: 78, shoulder: 104, elbow: 4, split: 1 },
    arrow: 'none', view: 24,
  },
  'hx-sled-pull': {
    start: { torso: -14, hip: 26, knee: 22, shoulder: 76, elbow: 14 },
    end: { torso: -18, hip: 34, knee: 30, shoulder: 20, elbow: 130 },
    arrow: 'hands', view: 26,
    fault: 'rowing with the arms instead of sitting back into the rope',
  },
  'hx-sub-heavy-row': {
    start: { torso: 74, hip: 78, knee: 22, shoulder: 92, elbow: 4 },
    end: { torso: 74, hip: 78, knee: 22, shoulder: 60, elbow: 118 },
    arrow: 'hands', view: 28, props: ['barbell'],
    fault: 'the torso rising with every rep',
  },
  'hx-ski-erg': {
    start: { shoulder: 168, elbow: 10 },
    end: { torso: 42, hip: 48, knee: 26, shoulder: 6, elbow: 6 },
    arrow: 'hands', view: 26,
    fault: 'pulling with the arms — the hips and abs do the work',
  },
  'hx-sub-straight-arm-pulldown': {
    start: { torso: 16, hip: 18, shoulder: 148, elbow: 4 },
    end: { torso: 24, hip: 26, shoulder: 8, elbow: 4 },
    arrow: 'hands', view: 26,
    fault: 'bending the elbows, which turns it into a triceps exercise',
  },
  'hx-sub-band-overhead-pull': {
    start: { torso: 10, shoulder: 156, elbow: 6 },
    end: { torso: 34, hip: 34, shoulder: 10, elbow: 6 },
    arrow: 'hands', view: 26, props: ['band'],
  },
  'hx-row': {
    start: { base: 'seated', hip: 108, knee: 116, torso: 16, shoulder: 96, elbow: 8, dy: 20 },
    end: { base: 'seated', hip: 58, knee: 26, torso: -12, shoulder: 44, elbow: 116, dy: 20 },
    arrow: 'hands', view: 26,
    fault: 'opening the back before the legs have finished',
  },
  'hx-burpee-broad-jump': {
    start: { base: 'prone', torso: 90, shoulder: 92, dy: 46 },
    end: { hip: 24, knee: 34, shoulder: 44, elbow: 10 },
    arrow: 'hips', view: 26,
    fault: 'jumping up rather than forward',
  },
  'hx-sandbag-lunge': {
    start: { shoulder: -14, elbow: 150 },
    end: { torso: 10, hip: 62, knee: 98, ankle: 10, shoulder: -14, elbow: 150, split: 1 },
    arrow: 'hips', view: 26,
    fault: 'bouncing the back knee off the floor',
  },
  'hx-farmers-carry-heavy': {
    start: { shoulder: 4, shoulderAbduct: 12 },
    end: { shoulder: 4, shoulderAbduct: 12, hip: 20, knee: 12, split: 1 },
    arrow: 'none', view: 32, props: ['kettlebell'],
    fault: 'letting the shoulders round forward under the load',
  },
  'hx-sub-medball-slam': {
    start: { shoulder: 170, elbow: 6 },
    end: { torso: 56, hip: 62, knee: 30, shoulder: 4, elbow: 6 },
    arrow: 'hands', view: 26, props: ['medicine-ball'],
  },

  // --- movements whose point is out of the sagittal plane ----------------
  // These used to inherit a pattern default that showed somebody standing
  // still, because the whole exercise happens in a plane the flat figure had
  // no way to draw.
  'is-lat-raise': {
    start: lateralRaiseDown, end: lateralRaiseUp, arrow: 'hands', view: 84,
    props: ['dumbbell'],
    fault: 'shrugging the weight up — the traps take over the moment the elbows pass shoulder height',
  },
  'ig-is-cable-lateral-raise': {
    start: lateralRaiseDown, end: lateralRaiseUp, arrow: 'hands', view: 84,
    fault: 'swinging the torso to start the rep',
  },
  'co-pallof': {
    start: pallofIn, end: pallofOut, arrow: 'hands', view: 62, props: ['band'],
    fault: 'letting the shoulders turn with the cable — nothing above the hips should rotate',
  },
  'is-rear-fly': {
    start: { torso: 62, hip: 66, knee: 16, shoulder: 88, shoulderAbduct: 10 },
    end: { torso: 62, hip: 66, knee: 16, shoulder: 88, shoulderAbduct: 72 },
    arrow: 'hands', view: 74, props: ['dumbbell'],
    fault: 'lifting with the hands instead of throwing the elbows out sideways',
  },
  'is-band-pullapart': {
    start: { shoulder: 88, shoulderAbduct: 6 }, end: { shoulder: 88, shoulderAbduct: 54 },
    arrow: 'hands', view: 84, props: ['band'],
    fault: 'letting the ribs flare as the band comes apart',
  },
  'ig-st-miniband-abduction': {
    start: { hipAbduct: 4 }, end: { hipAbduct: 36, split: 1 },
    arrow: 'none', view: 80, props: ['band'],
    fault: 'letting the hip hike up to swing the leg out instead of driving it from the glute',
  },
  'ig-is-fire-hydrant': {
    start: { base: 'prone', hip: 88, knee: 90, hipAbduct: 4, dy: 40 },
    end: { base: 'prone', hip: 88, knee: 90, hipAbduct: 46, split: 1, dy: 40 },
    arrow: 'none', view: 62,
    fault: 'rolling the whole body open rather than moving at the hip',
  },
  'is-hip-abduction': {
    start: { ...seated, hipAbduct: 6 }, end: { ...seated, hipAbduct: 34 },
    arrow: 'none', view: 78,
    fault: 'leaning back to make the range look bigger',
  },
  'ln-cossack': {
    start: cossackStand, end: cossackDown, arrow: 'hips', view: 80,
    fault: 'the straight leg rolling onto its side — keep that heel down and the toes up',
  },

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
  'wd-supine-twist': { start: supineKnees, end: { base: 'supine', hip: 88, knee: 92, shoulder: 92 }, arrow: 'none', fault: 'the far shoulder lifting off the floor' },
  'wd-seated-fold': { start: { hip: 90 }, end: { hip: 90, torso: 62 }, arrow: 'shoulders' },
  'wk-roll-down': { start: stand, end: fold, arrow: 'shoulders' },
  'wk-deep-squat-pry': { start: stand, end: { ...squatBottom, shoulder: 40, elbow: 120 }, arrow: 'hips' },
  'fx-cossack-hold': { start: stand, end: cossack, arrow: 'hips' },
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
  'ig-run-straight-leg-bounce': { start: { hip: 12 }, end: { hip: 34, knee: 4 }, arrow: 'none', fault: 'sitting down into the hips; stay tall' },
  'rn-strides': { start: runStride, end: runDrive, arrow: 'none' },

  // --- carries ---
  'cr-farmer': { start: carry, end: carryStride, props: ['dumbbell'], arrow: 'none', view: 32, fault: 'shrugging the shoulders up around your ears' },
  'cr-overhead': {
    start: { shoulder: 172, elbow: 4 },
    end: { shoulder: 172, elbow: 4, hip: 20, knee: 12, split: 1 },
    props: ['kettlebell'], arrow: 'none', view: 32,
    fault: 'the arm drifting forward of the ear',
  },
  'cr-suitcase': {
    start: { shoulder: 3, shoulderAbduct: 6 },
    end: { shoulder: 3, shoulderAbduct: 6, hip: 22, knee: 14, split: 1, torso: -4 },
    props: ['kettlebell'], arrow: 'none', view: 34,
    fault: 'leaning away from the weight — stay stacked and let the obliques work',
  },
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
