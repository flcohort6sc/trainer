/**
 * Exercise figures: a 3D skeleton you can turn, moving through the actual
 * repetition.
 *
 * The geometry lives in figureGeometry.ts; this file is the picture. Three
 * things it does that the old flat drawing could not:
 *
 *   BOTH SIDES. A lunge has two legs. A single-arm row has an arm doing the
 *   work and an arm braced. Drawing one of each was why half the library
 *   looked identical.
 *
 *   MOTION. The pose data has always described a start and an end, and the old
 *   figure showed them stacked on top of each other with an arrow. Playing
 *   between them is the same information, animated — nothing new is invented,
 *   it is the same two poses with time in between.
 *
 *   DEPTH. Turn it. Far limbs go thinner and dimmer, near ones bigger. A
 *   Pallof press is unreadable side-on and obvious at 40 degrees.
 *
 * Motion respects prefers-reduced-motion: it starts paused there, showing the
 * start-and-end overlay the old figure drew, which is still perfectly good.
 */

import { useEffect, useRef, useState } from 'react'
import {
  applyBase, build, frameFor, lerpPose, project, SEG,
  type Pose, type Projected, type Skeleton,
} from './figureGeometry'
import { musclePatches, type MusclePatch } from './figureMuscles'
import type { Muscle } from '../types'

export type { FigureBase, Pose } from './figureGeometry'

export type FigureProp =
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'bench' | 'box' | 'wall' | 'bar' | 'band' | 'floor'
  | 'medicine-ball'

export interface FigureSpec {
  start: Pose
  end: Pose
  /** Where the path is not a straight line between the two — a swing, a clean. */
  mid?: Pose
  props?: FigureProp[]
  /** The one thing most commonly done wrong. Rendered as a marked note. */
  fault?: string
  /** Overrides the automatic start-to-end arrow. */
  arrow?: 'none' | 'hands' | 'hips' | 'shoulders'
  /**
   * Where to stand to watch it. 0 is side-on, 90 is face-on. Anything whose
   * point is sideways — a lateral raise, a Cossack squat, an anti-rotation
   * press — should say so here.
   */
  view?: number
}

/*
 * A three-quarter view, not a shallow one.
 *
 * At 18 degrees the left and right sides projected about a pixel and a half
 * apart, so the figure read as one thick flat drawing -- all of the geometry
 * and none of the benefit. 38 is far enough to see there are two arms and
 * still square-on enough to read a hinge.
 */
const DEFAULT_VIEW = 34

/**
 * Where to stand, when the exercise has not said.
 *
 * A three-quarter view earns its keep on a standing lift — it shows you there
 * are two arms. On the floor it is actively worse: a push-up seen at 34 degrees
 * is a heap, and seen from the side is obviously a push-up. Anything lying down
 * gets a near-side-on camera unless its figure asks for something else.
 */
function defaultView(spec: FigureSpec): number {
  if (spec.view !== undefined) return spec.view
  const base = spec.start.base ?? spec.end.base
  return base === 'supine' || base === 'prone' ? 8 : DEFAULT_VIEW
}
const CYCLE_MS = 2600

/** Ease in and out, so the turnaround at each end is not a bounce. */
const ease = (t: number) => (1 - Math.cos(t * Math.PI)) / 2

export default function Figure({
  spec, title, size = 200, animate = true, primaryMuscles = [], secondaryMuscles = [],
}: {
  spec: FigureSpec
  title: string
  size?: number
  animate?: boolean
  /** Lit brightly on the body. The same list the fatigue model reads. */
  primaryMuscles?: Muscle[]
  /** Lit faintly. */
  secondaryMuscles?: Muscle[]
}) {
  const reduced =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [playing, setPlaying] = useState(animate && !reduced)
  const [t, setT] = useState(0)
  const [view, setView] = useState(defaultView(spec))
  const drag = useRef<{ x: number; view: number } | null>(null)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const started = performance.now()
    const tick = (now: number) => {
      // Ping-pong: 0 -> 1 -> 0. A rep goes up and comes back down.
      const phase = ((now - started) % (CYCLE_MS * 2)) / CYCLE_MS
      setT(phase <= 1 ? phase : 2 - phase)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  // Pose at this instant. A mid keyframe splits the rep into two halves.
  const eased = ease(t)
  const pose = spec.mid
    ? eased < 0.5
      ? lerpPose(spec.start, spec.mid, eased * 2)
      : lerpPose(spec.mid, spec.end, (eased - 0.5) * 2)
    : lerpPose(spec.start, spec.end, eased)

  const live = applyBase(build(pose, spec.start), pose.base)
  const ghostSkeleton = applyBase(build(spec.start, spec.start), spec.start.base)
  const p = (v: { x: number; y: number; z: number }) => project(v, view)

  // Lowest thing the body has touching down, in projected space.
  const groundY = Math.max(
    ...[live.left, live.right].flatMap((side) => [p(side.toe).y, p(side.ankle).y, p(side.hand).y]),
    p(live.head).y,
  ) + 3

  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    drag.current = { x: e.clientX, view }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return
    setView(drag.current.view + (e.clientX - drag.current.x) * 0.6)
  }

  return (
    <figure className="exercise-figure" style={{ maxWidth: size + 60 }}>
      <svg
        viewBox={frameFor(spec).viewBox}
        role="img"
        aria-label={`${title}: schematic figure, drag to turn`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
        style={{ touchAction: 'pan-y', cursor: 'ew-resize' }}
      >
        {/*
          The floor is drawn where the body actually is.
          Standing poses are grounded to a fixed line by the geometry, but a
          lying or hanging pose is positioned by hand — so a fixed line left
          floor drills hovering above their own ground. Taking the lowest point
          of the figure puts the two together for every pose without having to
          re-tune a hundred of them.
        */}
        <line x1="-60" y1={groundY} x2="260" y2={groundY} stroke="var(--figure-floor)" strokeWidth="2" />
        <ellipse
          cx={project(live.pelvis, view).x} cy={groundY}
          rx={26} ry={4}
          fill="var(--figure-ink)" opacity={0.18}
        />

        {/*
          Where it started. A faint outline rather than a second body: two
          filled silhouettes on top of each other is twice the shape and none
          of the clarity.
        */}
        {!playing && <Body s={ghostSkeleton} project={p} ghost />}
        <Body
          s={live}
          project={p}
          facing={facingVector(pose)}
          muscles={musclePatches(live, primaryMuscles, secondaryMuscles, pose.facing ?? 0)}
        />
        {spec.props && spec.props.length > 0 && <Props s={live} project={p} list={spec.props} />}
      </svg>

      <figcaption>
        <button
          type="button"
          className="fig-btn"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? 'Pause the movement' : 'Play the movement'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <button type="button" className="fig-btn" onClick={() => setView((v) => v - 30)} aria-label="Turn left">
          ⟲
        </button>
        <button type="button" className="fig-btn" onClick={() => setView((v) => v + 30)} aria-label="Turn right">
          ⟳
        </button>
        {/*
          Scrub through the rep by hand. Play is for watching; this is for
          stopping halfway down and looking at where the knee actually is,
          which is the thing a still picture could never answer.
        */}
        <input
          className="fig-scrub"
          type="range"
          min="0" max="1" step="0.02"
          value={t}
          aria-label="Scrub through the movement"
          onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }}
        />
      </figcaption>
      <p className="fig-hint">
        {t < 0.02 ? 'start' : t > 0.98 ? 'finish' : 'mid-rep'} · drag the figure to turn it
      </p>

      {(primaryMuscles.length > 0 || secondaryMuscles.length > 0) && (
        <p className="fig-muscles">
          {primaryMuscles.map((m) => (
            <span key={m} className="fig-muscle is-primary">{m}</span>
          ))}
          {secondaryMuscles.map((m) => (
            <span key={m} className="fig-muscle">{m}</span>
          ))}
        </p>
      )}

      {spec.fault && <p className="fig-fault">Watch for: {spec.fault}</p>}
    </figure>
  )
}

type Proj = (v: { x: number; y: number; z: number }) => Projected

/**
 * Which way the body is looking, in world space.
 *
 * A lying pose is the standing figure rotated, so the face has to rotate with
 * it — otherwise a push-up appears to be staring at the ceiling.
 */
function facingVector(pose: Pose) {
  const rad = ((pose.facing ?? 0) * Math.PI) / 180
  const forward = { x: Math.cos(rad), y: -0.2, z: -Math.sin(rad) }
  if (pose.base === 'supine') return { x: -forward.y, y: forward.x, z: forward.z }
  if (pose.base === 'prone') return { x: forward.y, y: -forward.x, z: -forward.z }
  return forward
}

/**
 * Limb thickness, so this is a body rather than a diagram of one.
 *
 * Capsules rather than polygons: a thick line with round caps IS a capsule, and
 * the browser draws it for free. A thigh is thicker than a forearm, and both
 * scale with perspective, which is most of what makes a rotated figure read as
 * solid.
 */
const THICK = { thigh: 15, shin: 11, foot: 7, upperArm: 10.5, forearm: 8.5, neck: 9, clav: 8, pelvis: 9 }

interface Bone {
  a: Projected
  b: Projected
  width: number
  depth: number
  key: string
}

/**
 * One body, in three passes.
 *
 * Drawing outline-then-fill per limb in depth order looked like a bundle of
 * pipes: every limb's outline cut across the limb in front of it, so an arm
 * crossing a chest drew a seam through it. Doing ALL the outlines first and
 * then ALL the fills merges them into a single silhouette, which is what a
 * body looks like. Muscles go last, on top of everything, or they end up
 * buried under the limb they belong to.
 */
function Body({
  s, project: p, ghost, muscles = [], facing = { x: 1, y: -0.15, z: 0 },
}: {
  s: Skeleton
  project: Proj
  ghost?: boolean
  muscles?: MusclePatch[]
  /** Unit-ish vector pointing out of the front of the head. */
  facing?: { x: number; y: number; z: number }
}) {
  const fill = ghost ? 'none' : 'var(--figure-body)'
  const edge = ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'

  const bones: Bone[] = []
  const bone = (a: { x: number; y: number; z: number }, b: typeof a, width: number, key: string) => {
    const pa = p(a)
    const pb = p(b)
    bones.push({ a: pa, b: pb, width, depth: (pa.depth + pb.depth) / 2, key })
  }

  bone(s.shoulders, s.neckTop, THICK.neck, 'neck')
  for (const [name, side] of [['l', s.left], ['r', s.right]] as const) {
    bone(side.shoulder, side.elbow, THICK.upperArm, `${name}-uarm`)
    bone(side.elbow, side.hand, THICK.forearm, `${name}-farm`)
    bone(side.hip, side.knee, THICK.thigh, `${name}-thigh`)
    bone(side.knee, side.ankle, THICK.shin, `${name}-shin`)
    bone(side.ankle, side.toe, THICK.foot, `${name}-foot`)
  }
  bones.sort((x, y) => x.depth - y.depth)

  const trunk = [s.left.shoulder, s.right.shoulder, s.right.hip, s.left.hip].map(p)
  const trunkPoints = trunk.map((q) => `${q.x},${q.y}`).join(' ')
  const head = p(s.head)
  const headR = SEG.head * 1.15 * (1 + head.depth / 900)
  // A point just in front of the head, projected the same way, so the marker
  // swings round the skull as the figure turns.
  const faceRaw = p({ x: s.head.x + facing.x * SEG.head, y: s.head.y + facing.y * SEG.head, z: s.head.z + facing.z * SEG.head })
  const face = faceRaw.depth > head.depth - 6 ? faceRaw : null
  const scaleOf = (depth: number) => 1 + depth / 900

  const OUTLINE = ghost ? 1.2 : 1.8

  return (
    <g opacity={ghost ? 0.4 : 1}>
      {/* 1. the silhouette, drawn wide and merged */}
      {!ghost && (
        <g stroke={edge} fill={edge} strokeLinecap="round" strokeLinejoin="round">
          <polygon points={trunkPoints} strokeWidth={OUTLINE * 2} />
          <circle cx={head.x} cy={head.y} r={headR + OUTLINE} />
          {bones.map((b) => (
            <line key={`o-${b.key}`} x1={b.a.x} y1={b.a.y} x2={b.b.x} y2={b.b.y}
              strokeWidth={b.width * scaleOf(b.depth) + OUTLINE * 2} />
          ))}
        </g>
      )}

      {/* 2. the body itself, back to front */}
      <g strokeLinecap="round" strokeLinejoin="round">
        <polygon points={trunkPoints} fill={fill}
          stroke={ghost ? edge : 'none'} strokeWidth={OUTLINE} strokeDasharray={ghost ? '6 6' : undefined} />
        {bones.map((b) => {
          const near = Math.max(0, Math.min(1, (b.depth + 16) / 32))
          return (
            <line key={`f-${b.key}`} x1={b.a.x} y1={b.a.y} x2={b.b.x} y2={b.b.y}
              // A far arm is painted in a different tone, not merely dimmed —
              // that is what stops it fusing with the chest it crosses.
              stroke={ghost ? 'none' : near > 0.5 ? fill : 'var(--figure-body-far)'}
              strokeWidth={b.width * scaleOf(b.depth)}
              opacity={ghost ? 0 : 1} />
          )
        })}
        <circle cx={head.x} cy={head.y} r={headR} fill={fill}
          stroke={ghost ? edge : 'none'} strokeWidth={OUTLINE} strokeDasharray={ghost ? '6 6' : undefined} />
        {!ghost && face && (
          /* Which way is this person looking? Without it you cannot tell a
             push-up from a plank, or a squat from a good morning. */
          <circle cx={face.x} cy={face.y} r={headR * 0.32} fill={edge} opacity={0.85} />
        )}
      </g>

      {/* 3. the muscles, on top, dimmed when they are round the back */}
      {!ghost && muscles
        .map((m) => ({ m, q: p(m.at) }))
        .sort((x, y) => x.q.depth - y.q.depth)
        .map(({ m, q }, i) => {
          const facingUs = Math.max(0, Math.min(1, (q.depth + 14) / 28))
          return (
            <circle
              key={`m${i}`}
              cx={q.x} cy={q.y} r={m.size * 0.85 * scaleOf(q.depth)}
              fill={m.primary ? 'var(--muscle-primary)' : 'var(--muscle-secondary)'}
              opacity={(m.primary ? 0.82 : 0.42) * (0.35 + facingUs * 0.65)}
            />
          )
        })}
    </g>
  )
}

/** Kit, drawn where the hands and feet actually are. */
function Props({ s, project: p, list }: { s: Skeleton; project: Proj; list: FigureProp[] }) {
  const kit = 'var(--figure-kit)'
  const lh = p(s.left.hand)
  const rh = p(s.right.hand)
  const mid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 }

  /*
   * A bench has to be under the person, wherever the person is.
   *
   * It used to be a rectangle at fixed coordinates, which put it floating above
   * a supine figure like a shelf. Now it runs along the torso and sits on the
   * side away from the hands — which is under your back when you are pressing,
   * and under your thighs when you are seated.
   */
  const sh = p(s.shoulders)
  const pv = p(s.pelvis)
  const axis = { x: pv.x - sh.x, y: pv.y - sh.y }
  const len = Math.hypot(axis.x, axis.y) || 1
  const unit = { x: axis.x / len, y: axis.y / len }
  const perp = { x: -unit.y, y: unit.x }
  const handSide = Math.sign((mid.x - sh.x) * perp.x + (mid.y - sh.y) * perp.y) || 1
  const off = -handSide * 13
  const benchA = { x: sh.x + perp.x * off - unit.x * 14, y: sh.y + perp.y * off - unit.y * 14 }
  const benchB = { x: pv.x + perp.x * off + unit.x * 30, y: pv.y + perp.y * off + unit.y * 30 }

  return (
    <g>
      {list.includes('barbell') && (
        <>
          <line x1={mid.x - 30} y1={mid.y} x2={mid.x + 30} y2={mid.y} stroke={kit} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={mid.x - 26} cy={mid.y} r="6" fill="none" stroke={kit} strokeWidth="3" />
          <circle cx={mid.x + 26} cy={mid.y} r="6" fill="none" stroke={kit} strokeWidth="3" />
        </>
      )}
      {list.includes('bar') && (
        <line x1="30" y1={Math.min(lh.y, rh.y)} x2="170" y2={Math.min(lh.y, rh.y)} stroke={kit} strokeWidth="3.5" strokeLinecap="round" />
      )}
      {list.includes('dumbbell') && [lh, rh].map((h, i) => (
        <line key={i} x1={h.x - 7} y1={h.y} x2={h.x + 7} y2={h.y} stroke={kit} strokeWidth="5" strokeLinecap="round" />
      ))}
      {list.includes('medicine-ball') && (
        <circle cx={mid.x} cy={mid.y} r="9" fill="none" stroke={kit} strokeWidth="3" />
      )}
      {list.includes('kettlebell') && (
        <circle cx={mid.x} cy={mid.y + 7} r="6.5" fill="none" stroke={kit} strokeWidth="3" />
      )}
      {list.includes('band') && (
        <line x1={mid.x} y1={mid.y} x2={mid.x} y2="176" stroke={kit} strokeWidth="2" strokeDasharray="4 4" />
      )}
      {list.includes('bench') && (
        <line x1={benchA.x} y1={benchA.y} x2={benchB.x} y2={benchB.y}
          stroke={kit} strokeWidth="7" strokeLinecap="round" opacity="0.85" />
      )}
      {list.includes('box') && <rect x="118" y="146" width="46" height="30" rx="3" fill="none" stroke={kit} strokeWidth="3" />}
      {list.includes('wall') && <line x1="176" y1="30" x2="176" y2="176" stroke={kit} strokeWidth="3" />}
    </g>
  )
}
