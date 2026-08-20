/**
 * Where the muscles are.
 *
 * Every exercise in this library already declares `primaryMuscles` and
 * `secondaryMuscles` — that data drives the fatigue model and the weekly
 * balance review. This file is the missing half: where each of those sits on
 * the body, so the figure can light them up rather than leaving you to imagine
 * which bits of a stick man a Romanian deadlift is supposed to involve.
 *
 * Nothing here is new information. It is the same 21 muscles the rest of the
 * app reasons about, placed on the same skeleton the figure already builds.
 *
 * It is schematic, not anatomical. A patch on the back of the thigh means "the
 * hamstrings are doing this", not "this is the shape of a hamstring".
 */

import type { Muscle } from '../types'
import type { Side, Skeleton, V3 } from './figureGeometry'

/** Which two skeleton points a muscle sits between, and where along them. */
export interface MusclePlacement {
  /** The bone it rides on. */
  bone: 'thigh' | 'shin' | 'upperArm' | 'forearm' | 'torso' | 'neck' | 'foot'
  /** 0 = the top joint, 1 = the bottom one. */
  along: number
  /** Which way it faces on the body. Front is the direction the figure looks. */
  face: 'front' | 'back' | 'outer' | 'inner' | 'centre'
  /** Drawn radius before perspective. */
  size: number
  /** Both sides, or only the midline (abs, lower back). */
  bilateral: boolean
}

export const MUSCLE_MAP: Record<Muscle, MusclePlacement> = {
  quads:        { bone: 'thigh',    along: 0.5,  face: 'front',  size: 7,   bilateral: true },
  hamstrings:   { bone: 'thigh',    along: 0.55, face: 'back',   size: 7,   bilateral: true },
  glutes:       { bone: 'thigh',    along: 0.12, face: 'back',   size: 7.5, bilateral: true },
  calves:       { bone: 'shin',     along: 0.45, face: 'back',   size: 5.5, bilateral: true },
  adductors:    { bone: 'thigh',    along: 0.45, face: 'inner',  size: 5,   bilateral: true },
  abductors:    { bone: 'thigh',    along: 0.25, face: 'outer',  size: 5,   bilateral: true },

  chest:        { bone: 'torso',    along: 0.28, face: 'front',  size: 8,   bilateral: true },
  lats:         { bone: 'torso',    along: 0.5,  face: 'back',   size: 8,   bilateral: true },
  'upper-back': { bone: 'torso',    along: 0.25, face: 'back',   size: 7.5, bilateral: true },
  traps:        { bone: 'neck',     along: 0.5,  face: 'back',   size: 6,   bilateral: true },
  'lower-back': { bone: 'torso',    along: 0.82, face: 'back',   size: 7,   bilateral: false },

  'front-delts':{ bone: 'upperArm', along: 0.08, face: 'front',  size: 5.5, bilateral: true },
  'side-delts': { bone: 'upperArm', along: 0.06, face: 'outer',  size: 5.5, bilateral: true },
  'rear-delts': { bone: 'upperArm', along: 0.08, face: 'back',   size: 5.5, bilateral: true },

  biceps:       { bone: 'upperArm', along: 0.55, face: 'front',  size: 5,   bilateral: true },
  triceps:      { bone: 'upperArm', along: 0.55, face: 'back',   size: 5,   bilateral: true },
  forearms:     { bone: 'forearm',  along: 0.45, face: 'outer',  size: 4.5, bilateral: true },

  abs:          { bone: 'torso',    along: 0.68, face: 'front',  size: 7,   bilateral: false },
  obliques:     { bone: 'torso',    along: 0.66, face: 'outer',  size: 5.5, bilateral: true },
  'hip-flexors':{ bone: 'torso',    along: 0.92, face: 'front',  size: 5.5, bilateral: true },
  neck:         { bone: 'neck',     along: 0.4,  face: 'front',  size: 4.5, bilateral: false },
}

export interface MusclePatch {
  at: V3
  /** Which way the patch sits relative to the body, as a 3D offset already applied. */
  size: number
  primary: boolean
  muscle: Muscle
}

const lerp3 = (a: V3, b: V3, t: number): V3 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
})

function boneEnds(s: Skeleton, side: Side, bone: MusclePlacement['bone']): [V3, V3] {
  switch (bone) {
    case 'thigh': return [side.hip, side.knee]
    case 'shin': return [side.knee, side.ankle]
    case 'foot': return [side.ankle, side.toe]
    case 'upperArm': return [side.shoulder, side.elbow]
    case 'forearm': return [side.elbow, side.hand]
    case 'neck': return [s.shoulders, s.neckTop]
    case 'torso':
    default: return [s.shoulders, s.pelvis]
  }
}

/**
 * Turn an exercise's muscle lists into patches on this skeleton.
 *
 * `facing` is the direction the body is pointing, so "front" means the front of
 * the person rather than the front of the screen — the patches stay on the
 * chest when you turn the figure round.
 */
export function musclePatches(
  s: Skeleton,
  primary: Muscle[],
  secondary: Muscle[],
  facing = 0,
): MusclePatch[] {
  const out: MusclePatch[] = []
  const rad = (facing * Math.PI) / 180

  // Body-local directions, rotated to wherever the figure is looking.
  const forward: V3 = { x: Math.cos(rad), y: 0, z: -Math.sin(rad) }
  const lateral: V3 = { x: Math.sin(rad), y: 0, z: Math.cos(rad) }

  const add = (muscle: Muscle, isPrimary: boolean) => {
    const place = MUSCLE_MAP[muscle]
    if (!place) return

    const sides: (1 | -1)[] = place.bilateral ? [1, -1] : [0 as unknown as 1]
    for (const sign of sides) {
      const side = sign === -1 ? s.left : s.right
      const [a, b] = boneEnds(s, side, place.bone)
      const base = lerp3(a, b, place.along)

      // How far off the bone axis to sit, and in which direction.
      const depth = place.size * 0.55
      let off: V3 = { x: 0, y: 0, z: 0 }
      if (place.face === 'front') off = { x: forward.x * depth, y: 0, z: forward.z * depth }
      else if (place.face === 'back') off = { x: -forward.x * depth, y: 0, z: -forward.z * depth }
      else if (place.face === 'outer') off = { x: lateral.x * depth * sign, y: 0, z: lateral.z * depth * sign }
      else if (place.face === 'inner') off = { x: -lateral.x * depth * sign, y: 0, z: -lateral.z * depth * sign }

      out.push({
        at: { x: base.x + off.x, y: base.y + off.y, z: base.z + off.z },
        size: place.size,
        primary: isPrimary,
        muscle,
      })
      if (!place.bilateral) break
    }
  }

  for (const m of primary) add(m, true)
  for (const m of secondary) if (!primary.includes(m)) add(m, false)
  return out
}
