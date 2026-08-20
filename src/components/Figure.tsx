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
const DEFAULT_VIEW = 38
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
  const [view, setView] = useState(spec.view ?? DEFAULT_VIEW)
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
  const ghost = applyBase(build(spec.start, spec.start), spec.start.base)
  const p = (v: { x: number; y: number; z: number }) => project(v, view)

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
        <line x1="-40" y1="176" x2="240" y2="176" stroke="var(--figure-floor)" strokeWidth="2" />

        {/* Where it started, so the range of the movement stays visible. */}
        {!playing && <Body s={ghost} project={p} ghost />}
        <Body
          s={live}
          project={p}
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
 * Limb thickness, so this is a body rather than a diagram of one.
 *
 * Capsules rather than polygons: a thick line with round caps IS a capsule, and
 * the browser draws it for free. A thigh is thicker than a forearm, and both
 * scale with perspective, which is most of what makes a rotated figure read as
 * solid.
 */
const THICK = { thigh: 15, shin: 11, foot: 7, upperArm: 10.5, forearm: 8.5, neck: 9, clav: 8, pelvis: 9 }

interface Piece {
  key: string
  depth: number
  render: (opacity: number, scale: number) => React.ReactNode
}

function Body({
  s, project: p, ghost, muscles = [],
}: {
  s: Skeleton
  project: Proj
  ghost?: boolean
  muscles?: MusclePatch[]
}) {
  const ink = ghost ? 'var(--figure-ghost)' : 'var(--figure-body)'
  const edge = ghost ? 'none' : 'var(--figure-ink)'
  const pieces: Piece[] = []

  const limb = (
    a: { x: number; y: number; z: number },
    b: typeof a,
    width: number,
    key: string,
  ) => {
    const pa = p(a)
    const pb = p(b)
    const depth = (pa.depth + pb.depth) / 2
    pieces.push({
      key,
      depth,
      render: (opacity, scale) => (
        <g key={key} opacity={opacity}>
          {!ghost && (
            <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
              stroke={edge} strokeWidth={width * scale + 2.5} strokeLinecap="round" />
          )}
          <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={ink} strokeWidth={width * scale} strokeLinecap="round"
            strokeDasharray={ghost ? '6 6' : undefined} />
        </g>
      ),
    })
  }

  // The trunk is a shape, not a stick: shoulders and hips are real widths, so
  // joining the four corners gives a torso that narrows at the waist.
  const trunk = [s.left.shoulder, s.right.shoulder, s.right.hip, s.left.hip].map(p)
  const trunkDepth = trunk.reduce((n, q) => n + q.depth, 0) / 4
  pieces.push({
    key: 'trunk',
    depth: trunkDepth,
    render: (opacity) => (
      <polygon
        key="trunk"
        points={[trunk[0], trunk[1], trunk[2], trunk[3]].map((q) => `${q.x},${q.y}`).join(' ')}
        fill={ink}
        stroke={ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'}
        strokeWidth={ghost ? 1.5 : 3}
        strokeLinejoin="round"
        strokeDasharray={ghost ? '6 6' : undefined}
        opacity={opacity}
      />
    ),
  })

  limb(s.shoulders, s.neckTop, THICK.neck, 'neck')
  for (const [name, side] of [['l', s.left], ['r', s.right]] as const) {
    limb(side.shoulder, side.elbow, THICK.upperArm, `${name}-uarm`)
    limb(side.elbow, side.hand, THICK.forearm, `${name}-farm`)
    limb(side.hip, side.knee, THICK.thigh, `${name}-thigh`)
    limb(side.knee, side.ankle, THICK.shin, `${name}-shin`)
    limb(side.ankle, side.toe, THICK.foot, `${name}-foot`)
  }

  // Muscle patches ride at the same depth as the body they sit on, so a
  // hamstring is hidden when you look at the figure from the front.
  for (const [i, m] of muscles.entries()) {
    const q = p(m.at)
    pieces.push({
      key: `m${i}`,
      // Nudged toward the viewer so a patch is never swallowed by its own limb.
      depth: q.depth + 3,
      render: (opacity, scale) => (
        <circle
          key={`m${i}`}
          cx={q.x} cy={q.y} r={m.size * scale}
          fill={m.primary ? 'var(--muscle-primary)' : 'var(--muscle-secondary)'}
          opacity={(m.primary ? 0.9 : 0.5) * opacity}
        />
      ),
    })
  }

  const head = p(s.head)
  pieces.push({
    key: 'head',
    depth: head.depth,
    render: (opacity, scale) => (
      <circle
        key="head"
        cx={head.x} cy={head.y} r={SEG.head * 1.15 * scale}
        fill={ink}
        stroke={ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'}
        strokeWidth={ghost ? 1.5 : 3}
        strokeDasharray={ghost ? '6 6' : undefined}
        opacity={opacity}
      />
    ),
  })

  // Painter's algorithm. Without it the far arm draws over the chest and the
  // whole thing reads flat however far you turn it.
  pieces.sort((a, b) => a.depth - b.depth)

  return (
    <g opacity={ghost ? 0.45 : 1}>
      {pieces.map((piece) => {
        const near = Math.max(0, Math.min(1, (piece.depth + 16) / 32))
        return piece.render(ghost ? 1 : 0.55 + near * 0.45, 1 + piece.depth / 900)
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
      {list.includes('bench') && <rect x="52" y="120" width="96" height="7" rx="3" fill="none" stroke={kit} strokeWidth="3" />}
      {list.includes('box') && <rect x="118" y="146" width="46" height="30" rx="3" fill="none" stroke={kit} strokeWidth="3" />}
      {list.includes('wall') && <line x1="176" y1="30" x2="176" y2="176" stroke={kit} strokeWidth="3" />}
    </g>
  )
}
