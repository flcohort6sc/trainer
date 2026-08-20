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
