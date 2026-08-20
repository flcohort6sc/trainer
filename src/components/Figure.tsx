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
  applyBase, build, lerpPose, project, SEG,
  type Pose, type Projected, type Skeleton,
} from './figureGeometry'

export type { FigureBase, Pose } from './figureGeometry'

export type FigureProp =
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'bench' | 'box' | 'wall' | 'bar' | 'band' | 'floor'

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
  spec, title, size = 200, animate = true,
}: {
  spec: FigureSpec
  title: string
  size?: number
  animate?: boolean
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
        viewBox="0 0 200 200"
        role="img"
        aria-label={`${title}: schematic figure, drag to turn`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => { drag.current = null }}
        onPointerCancel={() => { drag.current = null }}
        style={{ touchAction: 'pan-y', cursor: 'ew-resize' }}
      >
        <line x1="12" y1="176" x2="188" y2="176" stroke="var(--figure-floor)" strokeWidth="2" />

        {/* Where it started, so the range of the movement stays visible. */}
        {!playing && <Body s={ghost} project={p} ghost />}
        <Body s={live} project={p} />
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

      {spec.fault && <p className="fig-fault">Watch for: {spec.fault}</p>}
    </figure>
  )
}

type Proj = (v: { x: number; y: number; z: number }) => Projected

/**
 * One body, drawn far-to-near.
 *
 * Painter's algorithm: sort the bones by depth and draw the back ones first,
 * thinner and dimmer. Without it the arms cross the torso at random and the
 * whole thing reads flat however far you turn it.
 */
function Body({ s, project: p, ghost }: { s: Skeleton; project: Proj; ghost?: boolean }) {
  const bones: { a: Projected; b: Projected; key: string }[] = []
  const bone = (a: { x: number; y: number; z: number }, b: typeof a, key: string) =>
    bones.push({ a: p(a), b: p(b), key })

  bone(s.pelvis, s.shoulders, 'torso')
  bone(s.shoulders, s.neckTop, 'neck')
  for (const [name, side] of [['l', s.left], ['r', s.right]] as const) {
    bone(side.shoulder, side.elbow, `${name}-uarm`)
    bone(side.elbow, side.hand, `${name}-farm`)
    bone(side.hip, side.knee, `${name}-thigh`)
    bone(side.knee, side.ankle, `${name}-shin`)
    bone(side.ankle, side.toe, `${name}-foot`)
    bone(s.pelvis, side.hip, `${name}-pelvis`)
    bone(s.shoulders, side.shoulder, `${name}-clav`)
  }

  bones.sort((x, y) => (x.a.depth + x.b.depth) / 2 - (y.a.depth + y.b.depth) / 2)
  const head = p(s.head)

  return (
    <g opacity={ghost ? 0.4 : 1}>
      {bones.map(({ a, b, key }) => {
        const depth = (a.depth + b.depth) / 2
        // Behind the midline: thinner, dimmer. In front: full weight.
        const near = Math.max(0, Math.min(1, (depth + 14) / 28))
        return (
          <line
            key={key}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'}
            strokeWidth={(ghost ? 2.6 : 3.4) + near * 1.6}
            strokeLinecap="round"
            strokeDasharray={ghost ? '5 5' : undefined}
            opacity={ghost ? 1 : 0.45 + near * 0.55}
          />
        )
      })}
      <circle
        cx={head.x} cy={head.y} r={SEG.head * (1 + head.depth / 900)}
        fill="none"
        stroke={ghost ? 'var(--figure-ghost)' : 'var(--figure-ink)'}
        strokeWidth={ghost ? 2.6 : 4}
        strokeDasharray={ghost ? '5 5' : undefined}
      />
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
