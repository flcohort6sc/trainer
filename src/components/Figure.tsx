/**
 * Exercise figures.
 *
 * A schematic human drawn from joint angles, not a hand-drawn illustration.
 * That choice is the only reason full-library coverage is possible: a picture
 * per exercise is ~2 lines of pose data instead of an SVG somebody has to
 * draw, and every figure comes out in the same visual language.
 *
 * WHAT THIS IS GOOD FOR: where the limbs go. Start position, end position,
 * which way the movement travels, and the one fault worth marking.
 *
 * WHAT IT IS NOT: anatomy. It will not show you what a muscle should feel
 * like, it has no idea about grip width or foot angle, and for swimming or
 * sitting in a sauna it would be actively unhelpful -- those deliberately
 * have no figure rather than a misleading one.
 *
 * Geometry: forward kinematics from the pelvis. Angles are degrees, screen
 * coordinates (y grows downward), and -90 points up. Every joint angle is
 * relative to its parent segment, so `knee: 90` means "bent to a right angle"
 * regardless of what the hip is doing.
 */

export type FigureBase = 'standing' | 'supine' | 'prone' | 'seated' | 'hanging'

export type FigureProp =
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'bench' | 'box' | 'wall' | 'bar' | 'band' | 'floor'

export interface Pose {
  base?: FigureBase
  /** Torso lean from vertical. Positive leans forward (to the right). */
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
  /** Move the whole figure. Lying and hanging poses need it. */
  dx?: number
  dy?: number
}

export interface FigureSpec {
  start: Pose
  end: Pose
  props?: FigureProp[]
  /** The one thing most commonly done wrong. Rendered as a marked note. */
  fault?: string
  /** Overrides the automatic start-to-end arrow. */
  arrow?: 'none' | 'hands' | 'hips' | 'shoulders'
}

// ---------------------------------------------------------------- geometry

const RAD = Math.PI / 180
const SEG = { torso: 34, neck: 9, head: 7, upperArm: 18, forearm: 17, thigh: 24, shin: 23, foot: 9 }

interface P { x: number; y: number }
const step = (from: P, angleDeg: number, len: number): P => ({
  x: from.x + Math.cos(angleDeg * RAD) * len,
  y: from.y + Math.sin(angleDeg * RAD) * len,
})

interface Skeleton {
  pelvis: P; shoulders: P; head: P; neckTop: P
  knee: P; ankle: P; toe: P
  elbow: P; hand: P
}

const FLOOR_Y = 176

function build(pose: Pose): Skeleton {
  const { torso = 0, hip = 0, knee = 0, ankle = 0, shoulder = 0, elbow = 0, neck = 0 } = pose

  const pelvis: P = { x: 100 + (pose.dx ?? 0), y: 108 + (pose.dy ?? 0) }
  const torsoAngle = -90 + torso
  const shoulders = step(pelvis, torsoAngle, SEG.torso)

  const neckTop = step(shoulders, torsoAngle + neck, SEG.neck)
  const head = step(neckTop, torsoAngle + neck, SEG.head)

  // Legs. hip = 0 means the thigh continues straight down from the torso line.
  const thighAngle = torsoAngle + 180 - hip
  const kneeP = step(pelvis, thighAngle, SEG.thigh)
  const shinAngle = thighAngle + knee
  const ankleP = step(kneeP, shinAngle, SEG.shin)
  const toe = step(ankleP, shinAngle - 90 + ankle, SEG.foot)

  // Arms. shoulder = 0 hangs down, 180 is overhead.
  const upperArmAngle = torsoAngle + 180 - shoulder
  const elbowP = step(shoulders, upperArmAngle, SEG.upperArm)
  const hand = step(elbowP, upperArmAngle - elbow, SEG.forearm)

  const skeleton = {
    pelvis, shoulders, head, neckTop, knee: kneeP, ankle: ankleP, toe, elbow: elbowP, hand,
  }

  /*
   * Stand the figure on the floor rather than pinning its pelvis.
   *
   * The pelvis is the root of the kinematic chain, so without this a squat
   * keeps its hips at a fixed height and sinks its feet through the ground --
   * which is both wrong to look at and makes a hip-anchored arrow zero-length.
   * Grounding the lowest foot point means the hips visibly drop, which is what
   * a squat actually looks like.
   *
   * An explicit `dy` opts out: hanging and lying poses are positioned by hand.
   */
  if (pose.dy === undefined && pose.base === undefined) {
    const lowest = Math.max(skeleton.toe.y, skeleton.ankle.y)
    const shift = FLOOR_Y - lowest
    for (const key of Object.keys(skeleton) as (keyof Skeleton)[]) {
      skeleton[key] = { x: skeleton[key].x, y: skeleton[key].y + shift }
    }
  }

  return skeleton
}

/** Lying poses are the standing figure rotated, not a separate skeleton. */
function baseTransform(base: FigureBase = 'standing'): string | undefined {
  switch (base) {
    case 'supine':
      return 'rotate(-90 100 108) translate(0 46)'
    case 'prone':
      return 'rotate(-90 100 108) translate(0 46) scale(1 -1) translate(0 -216)'
    default:
      return undefined
  }
}

// ---------------------------------------------------------------- rendering

function Body({ pose, ghost }: { pose: Pose; ghost?: boolean }) {
  const s = build(pose)
  const stroke = ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'
  const width = ghost ? 3 : 4.5
  const dash = ghost ? '5 5' : undefined

  const line = (a: P, b: P, key: string) => (
    <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
      stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash} />
  )

  return (
    <g transform={baseTransform(pose.base)} opacity={ghost ? 0.55 : 1}>
      {line(s.pelvis, s.shoulders, 'torso')}
      {line(s.shoulders, s.neckTop, 'neck')}
      {line(s.pelvis, s.knee, 'thigh')}
      {line(s.knee, s.ankle, 'shin')}
      {line(s.ankle, s.toe, 'foot')}
      {line(s.shoulders, s.elbow, 'uarm')}
      {line(s.elbow, s.hand, 'farm')}
      <circle cx={s.head.x} cy={s.head.y} r={SEG.head} fill="none"
        stroke={stroke} strokeWidth={width} strokeDasharray={dash} />
    </g>
  )
}

function Props({ pose, props: list }: { pose: Pose; props: FigureProp[] }) {
  const s = build(pose)
  const t = baseTransform(pose.base)
  const kit = 'var(--figure-kit)'

  return (
    <g transform={t}>
      {list.includes('barbell') && (
        <g>
          <line x1={s.hand.x - 26} y1={s.hand.y} x2={s.hand.x + 26} y2={s.hand.y}
            stroke={kit} strokeWidth={3.5} strokeLinecap="round" />
          <circle cx={s.hand.x - 24} cy={s.hand.y} r={7} fill={kit} />
          <circle cx={s.hand.x + 24} cy={s.hand.y} r={7} fill={kit} />
        </g>
      )}
      {list.includes('dumbbell') && (
        <g>
          <line x1={s.hand.x - 9} y1={s.hand.y} x2={s.hand.x + 9} y2={s.hand.y}
            stroke={kit} strokeWidth={3} strokeLinecap="round" />
          <rect x={s.hand.x - 13} y={s.hand.y - 6} width={5} height={12} rx={1.5} fill={kit} />
          <rect x={s.hand.x + 8} y={s.hand.y - 6} width={5} height={12} rx={1.5} fill={kit} />
        </g>
      )}
      {list.includes('kettlebell') && (
        <g>
          <path d={`M ${s.hand.x - 6} ${s.hand.y} a 6 6 0 0 1 12 0`} fill="none" stroke={kit} strokeWidth={3} />
          <circle cx={s.hand.x} cy={s.hand.y + 10} r={8} fill={kit} />
        </g>
      )}
      {list.includes('bar') && (
        <line x1={40} y1={s.hand.y} x2={160} y2={s.hand.y} stroke={kit} strokeWidth={4} strokeLinecap="round" />
      )}
      {list.includes('band') && (
        <path d={`M ${s.hand.x} ${s.hand.y} Q ${s.hand.x + 18} ${s.hand.y + 22} ${s.hand.x} ${s.hand.y + 44}`}
          fill="none" stroke={kit} strokeWidth={3} strokeDasharray="4 4" />
      )}
      {list.includes('bench') && (
        <rect x={58} y={s.pelvis.y + 6} width={84} height={7} rx={3} fill={kit} />
      )}
      {list.includes('box') && (
        <rect x={s.toe.x - 6} y={s.toe.y - 2} width={38} height={24} rx={2} fill="none" stroke={kit} strokeWidth={3} />
      )}
      {list.includes('wall') && (
        <line x1={168} y1={20} x2={168} y2={172} stroke={kit} strokeWidth={4} strokeLinecap="round" />
      )}
    </g>
  )
}

function Arrow({ from, to }: { from: P; to: P }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  if (Math.hypot(dx, dy) < 14) return null
  // Bow the path slightly so it reads as a movement, not a measurement.
  const mx = (from.x + to.x) / 2 - dy * 0.16
  const my = (from.y + to.y) / 2 + dx * 0.16
  return (
    <g>
      <defs>
        <marker id="fig-arrow" viewBox="0 0 10 10" refX="8" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--figure-arrow)" />
        </marker>
      </defs>
      <path d={`M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`}
        fill="none" stroke="var(--figure-arrow)" strokeWidth={3}
        strokeLinecap="round" markerEnd="url(#fig-arrow)" />
    </g>
  )
}

const anchorFor = (s: Skeleton, which: FigureSpec['arrow']): P =>
  which === 'hips' ? s.pelvis : which === 'shoulders' ? s.shoulders : s.hand

export default function Figure({
  spec, title, size = 220,
}: {
  spec: FigureSpec
  title: string
  size?: number
}) {
  const startSkel = build(spec.start)
  const endSkel = build(spec.end)
  const which = spec.arrow ?? 'hands'
  const showArrow = which !== 'none' && !spec.start.base && !spec.end.base

  return (
    <figure className="exercise-figure" style={{ maxWidth: size }}>
      <svg viewBox="0 0 200 200" role="img" aria-label={`Diagram: ${title}`}>
        <line x1={16} y1={FLOOR_Y} x2={184} y2={FLOOR_Y} stroke="var(--figure-floor)" strokeWidth={2.5} strokeLinecap="round" />
        <Body pose={spec.start} ghost />
        {spec.props && <Props pose={spec.end} props={spec.props} />}
        <Body pose={spec.end} />
        {showArrow && <Arrow from={anchorFor(startSkel, which)} to={anchorFor(endSkel, which)} />}
      </svg>
      <figcaption>
        <span className="fig-key"><i className="ghost" /> start</span>
        <span className="fig-key"><i /> finish</span>
      </figcaption>
      {spec.fault && <p className="fig-fault">Watch for: {spec.fault}</p>}
    </figure>
  )
}
