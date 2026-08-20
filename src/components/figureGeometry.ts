/**
 * The figure, in three dimensions.
 *
 * The old engine drew one arm and one leg in the sagittal plane, which is
 * enough to show a squat and useless for anything that goes sideways: a
 * lateral raise, a Cossack squat and a Pallof press all came out looking like
 * somebody standing still.
 *
 * So the skeleton is now built in 3D and projected by hand. Sixty lines of
 * trigonometry rather than a WebGL dependency, and — the part that matters —
 * it is driven by *the same joint angles that were already written down*. No
 * trajectory anywhere in this app is invented; a figure that made up its own
 * motion would be the same sin as inventing an exercise from a caption.
 *
 * AXES. x is forward (the way the figure faces), y is down, z is the figure's
 * own left-right. At azimuth 0 you are looking at the sagittal view the old
 * engine drew, so every pose written for it still renders correctly.
 *
 * WHAT IT IS STILL NOT: anatomy. It knows where joints are, not what a muscle
 * feels like, and it has no opinion on grip width. Swimming and sauna
 * protocols still get no figure, because a wrong picture is worse than none.
 */

export type FigureBase = 'standing' | 'supine' | 'prone' | 'seated' | 'hanging'

export interface Pose {
  base?: FigureBase
  /** Torso lean from vertical. Positive leans forward. */
  torso?: number
  /** Hip flexion. 0 = straight line torso to thigh. */
  hip?: number
  /** Knee flexion. 0 = straight leg. */
  knee?: number
  /** Ankle. 0 = foot flat and forward relative to the shin. */
  ankle?: number
  /** Shoulder flexion from the torso axis. 0 = arms down, 180 = overhead. */
  shoulder?: number
  /** Elbow flexion. 0 = straight arm. */
  elbow?: number
  /** Head angle relative to the torso. */
  neck?: number

  // --- out of the sagittal plane. All default to 0, so every pose written
  // --- for the old flat engine still means exactly what it meant.
  /** Arms away from the body sideways. 90 = straight out at shoulder height. */
  shoulderAbduct?: number
  /** Legs away from the midline. Cossack squats and skater bounds need it. */
  hipAbduct?: number
  /** Twist through the waist, so the shoulders face somewhere the hips do not. */
  twist?: number
  /** Turn the whole figure on the spot. */
  facing?: number

  /**
   * How differently the two sides are doing this.
   * 0 = both sides identical. 1 = the left side is at the START pose while the
   * right is at the END, which is what a lunge, a single-arm row or any other
   * unilateral movement actually looks like.
   */
  split?: number

  /** Move the whole figure. Lying and hanging poses need it. */
  dx?: number
  dy?: number
}

export interface V3 { x: number; y: number; z: number }

export const SEG = {
  torso: 34, neck: 9, head: 7,
  upperArm: 18, forearm: 17,
  thigh: 24, shin: 23, foot: 9,
  /** Half the distance between the shoulders, and between the hips. */
  shoulderHalf: 10, hipHalf: 7,
}

const RAD = Math.PI / 180
const FLOOR_Y = 176

export interface Side { shoulder: V3; elbow: V3; hand: V3; hip: V3; knee: V3; ankle: V3; toe: V3 }
export interface Skeleton {
  pelvis: V3; shoulders: V3; neckTop: V3; head: V3
  left: Side; right: Side
}

const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z })

/**
 * A limb segment as a vector.
 *
 * Flexion and abduction are two independent rotations of the same limb, and
 * the ORDER matters. Abduct first — swinging the limb away from the midline
 * from hanging straight down — then flex it forward. Doing it the other way
 * round silently does nothing to a limb that is already horizontal: an arm
 * held out in front has no vertical component left to swing sideways, which is
 * why a band pull-apart came out as a man standing perfectly still.
 *
 * `angle` stays in the screen-degree convention the pose data was written in
 * (90 points down, 0 points forward), so nothing already written changes
 * meaning.
 */
function segment(angle: number, len: number, abduct: number, side: 1 | -1): V3 {
  // How far the limb is flexed away from hanging straight down.
  const theta = (90 - angle) * RAD
  const ab = abduct * RAD * side

  // Straight down, abducted sideways, then flexed forward.
  const lateral = Math.sin(ab) * len
  const alongBody = Math.cos(ab) * len

  return {
    x: alongBody * Math.sin(theta),
    y: alongBody * Math.cos(theta),
    z: lateral,
  }
}

/** Rotate about the vertical axis: the figure turning on the spot. */
function yaw(v: V3, deg: number): V3 {
  const a = deg * RAD
  return { x: v.x * Math.cos(a) + v.z * Math.sin(a), y: v.y, z: -v.x * Math.sin(a) + v.z * Math.cos(a) }
}

function buildSide(pose: Pose, side: 1 | -1, shoulders: V3, pelvis: V3, torsoAngle: number): Side {
  const {
    hip = 0, knee = 0, ankle = 0, shoulder = 0, elbow = 0,
    shoulderAbduct = 0, hipAbduct = 0, twist = 0,
  } = pose

  // The shoulder girdle can be twisted relative to the hips.
  const shoulderRoot = add(shoulders, yaw({ x: 0, y: 0, z: SEG.shoulderHalf * side }, twist))
  const hipRoot = add(pelvis, { x: 0, y: 0, z: SEG.hipHalf * side })

  const upperArmAngle = torsoAngle + 180 - shoulder
  const upper = segment(upperArmAngle, SEG.upperArm, shoulderAbduct, side)
  const elbowP = add(shoulderRoot, upper)
  const fore = segment(upperArmAngle - elbow, SEG.forearm, shoulderAbduct, side)
  const hand = add(elbowP, fore)

  const thighAngle = torsoAngle + 180 - hip
  const thigh = segment(thighAngle, SEG.thigh, hipAbduct, side)
  const kneeP = add(hipRoot, thigh)
  const shin = segment(thighAngle + knee, SEG.shin, hipAbduct, side)
  const ankleP = add(kneeP, shin)
  const foot = segment(thighAngle + knee - 90 + ankle, SEG.foot, 0, side)
  const toe = add(ankleP, foot)

  return { shoulder: shoulderRoot, elbow: elbowP, hand, hip: hipRoot, knee: kneeP, ankle: ankleP, toe }
}

/** Blend two poses. Angles interpolate cleanly; flags take the source pose. */
export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const n = (x?: number, y?: number) => (x ?? 0) + ((y ?? 0) - (x ?? 0)) * t
  return {
    base: a.base ?? b.base,
    torso: n(a.torso, b.torso),
    hip: n(a.hip, b.hip),
    knee: n(a.knee, b.knee),
    ankle: n(a.ankle, b.ankle),
    shoulder: n(a.shoulder, b.shoulder),
    elbow: n(a.elbow, b.elbow),
    neck: n(a.neck, b.neck),
    shoulderAbduct: n(a.shoulderAbduct, b.shoulderAbduct),
    hipAbduct: n(a.hipAbduct, b.hipAbduct),
    twist: n(a.twist, b.twist),
    facing: n(a.facing, b.facing),
    split: n(a.split, b.split),
    // dx/dy position the whole figure; interpolating them is what makes a
    // hanging or lying pose travel rather than teleport.
    dx: a.dx === undefined && b.dx === undefined ? undefined : n(a.dx, b.dx),
    dy: a.dy === undefined && b.dy === undefined ? undefined : n(a.dy, b.dy),
  }
}

export function build(pose: Pose, counterPose?: Pose): Skeleton {
  const { torso = 0, neck = 0, facing = 0, split = 0 } = pose

  const pelvis: V3 = { x: 100 + (pose.dx ?? 0), y: 108 + (pose.dy ?? 0), z: 0 }
  const torsoAngle = -90 + torso
  const shoulders = add(pelvis, segment(torsoAngle, SEG.torso, 0, 1))
  const neckTop = add(shoulders, segment(torsoAngle + neck, SEG.neck, 0, 1))
  const head = add(neckTop, segment(torsoAngle + neck, SEG.head, 0, 1))

  // Unilateral work: the far side is held at the other end of the movement, so
  // a lunge reads as a lunge instead of two legs doing the same thing.
  const otherPose = counterPose && split > 0 ? lerpPose(pose, counterPose, split) : pose

  let skeleton: Skeleton = {
    pelvis, shoulders, neckTop, head,
    right: buildSide(pose, 1, shoulders, pelvis, torsoAngle),
    left: buildSide(otherPose, -1, shoulders, pelvis, torsoAngle),
  }

  if (facing !== 0) {
    skeleton = mapSkeleton(skeleton, (v) => add(yaw({ x: v.x - pelvis.x, y: v.y - pelvis.y, z: v.z }, facing), { x: pelvis.x, y: pelvis.y, z: 0 }))
  }

  /*
   * Stand the figure on the floor rather than pinning its pelvis. Without this
   * a squat keeps its hips at a fixed height and sinks its feet through the
   * ground. An explicit dy or base opts out: lying and hanging poses are
   * positioned by hand.
   */
  if (pose.dy === undefined && pose.base === undefined) {
    const lowest = Math.max(
      skeleton.left.toe.y, skeleton.left.ankle.y, skeleton.right.toe.y, skeleton.right.ankle.y,
    )
    const shift = FLOOR_Y - lowest
    skeleton = mapSkeleton(skeleton, (v) => ({ ...v, y: v.y + shift }))
  }

  return skeleton
}

function mapSkeleton(s: Skeleton, f: (v: V3) => V3): Skeleton {
  const side = (x: Side): Side => ({
    shoulder: f(x.shoulder), elbow: f(x.elbow), hand: f(x.hand),
    hip: f(x.hip), knee: f(x.knee), ankle: f(x.ankle), toe: f(x.toe),
  })
  return {
    pelvis: f(s.pelvis), shoulders: f(s.shoulders), neckTop: f(s.neckTop), head: f(s.head),
    left: side(s.left), right: side(s.right),
  }
}

/**
 * Lying down is the standing figure rotated in the world, not a second
 * skeleton — the same trick the flat engine used, done to the model instead of
 * to the SVG so that the camera can still orbit it.
 */
export function applyBase(s: Skeleton, base: FigureBase = 'standing'): Skeleton {
  if (base !== 'supine' && base !== 'prone') return s
  const cx = 100
  const cy = 108
  return mapSkeleton(s, (v) => {
    const dx = v.x - cx
    const dy = v.y - cy
    // -90 degrees in the screen plane, then flipped for prone.
    const rx = dy
    const ry = -dx
    return { x: cx + rx, y: cy + ry + 46, z: base === 'prone' ? -v.z : v.z }
  })
}

export interface Projected { x: number; y: number; depth: number }

/**
 * Orbit the camera around the vertical axis and drop in a little perspective.
 *
 * Perspective is what stops a rotated skeleton reading as a flat shape that
 * happens to be squashed: the near shoulder gets bigger than the far one, and
 * suddenly there is a body in space.
 */
export function project(v: V3, azimuth: number, cx = 100, cy = 108): Projected {
  const a = azimuth * RAD
  const dx = v.x - cx
  const x = dx * Math.cos(a) + v.z * Math.sin(a)
  const depth = -dx * Math.sin(a) + v.z * Math.cos(a)

  const scale = 1 + depth / 900
  return { x: cx + x * scale, y: cy + (v.y - cy) * scale, depth }
}


/**
 * Fit the frame to the exercise.
 *
 * A fixed 200x200 box is sized for the widest thing in the library — a lying
 * pose rotated flat — so a Romanian deadlift, which occupies a narrow vertical
 * strip, was drawn at about a fifth of the available width.
 *
 * The box is computed across the WHOLE movement and a sweep of camera angles,
 * then frozen. If it were recomputed per frame the figure would breathe as it
 * moved and swell as you turned it, which is far worse than a little empty
 * space.
 */
export interface Frame { viewBox: string }

const frameCache = new WeakMap<object, Frame>()

export function frameFor(
  spec: { start: Pose; end: Pose; mid?: Pose; view?: number },
  pad = 16,
): Frame {
  const cached = frameCache.get(spec)
  if (cached) return cached

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  // Must match Figure's defaultView, or the frame is computed for a camera
  // angle the figure never uses.
  const base = spec.start.base ?? spec.end.base
  const view = spec.view ?? (base === 'supine' || base === 'prone' ? 8 : 34)

  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const pose = spec.mid
      ? t < 0.5 ? lerpPose(spec.start, spec.mid, t * 2) : lerpPose(spec.mid, spec.end, (t - 0.5) * 2)
      : lerpPose(spec.start, spec.end, t)
    const s = applyBase(build(pose, spec.start), pose.base)
    const points = [
      s.pelvis, s.shoulders, s.head, s.neckTop,
      ...[s.left, s.right].flatMap((k) => [k.shoulder, k.elbow, k.hand, k.hip, k.knee, k.ankle, k.toe]),
    ]
    // Turning the figure must not resize it, so the box covers the range you
    // can reach with the rotate buttons before it would need recomputing.
    for (const az of [view - 70, view - 35, view, view + 35, view + 70]) {
      for (const v of points) {
        const q = project(v, az)
        if (q.x < minX) minX = q.x
        if (q.x > maxX) maxX = q.x
        if (q.y < minY) minY = q.y
        if (q.y > maxY) maxY = q.y
      }
    }
  }

  // The floor line is part of the picture whenever the figure stands on it.
  maxY = Math.max(maxY, 178)

  const x = minX - pad
  const y = minY - pad
  const w = maxX - minX + pad * 2
  const h = maxY - minY + pad * 2

  // Keep it square so the aspect ratio never distorts the body.
  const size = Math.max(w, h)
  const frame = {
    viewBox: `${(x - (size - w) / 2).toFixed(1)} ${(y - (size - h) / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`,
  }
  frameCache.set(spec, frame)
  return frame
}
