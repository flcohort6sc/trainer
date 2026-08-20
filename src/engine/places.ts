/**
 * Places: where you are training right now.
 *
 * `Settings.availableEquipment` stays the engine's single source of truth --
 * nothing downstream of here knows places exist. A place is a saved kit plus a
 * name; switching one writes it into `availableEquipment`, and editing the
 * chips while a place is selected writes back into that place. One direction of
 * truth, two ways to change it.
 *
 * The ceilings are the part that earns this feature. Two 8kg kettlebells in a
 * living room are a real constraint, and an app that keeps suggesting 12kg
 * there is not adapting to anything.
 */

import type { Equipment, Exercise, Place, Settings } from '../types'

export function currentPlace(settings: Settings): Place | undefined {
  return settings.places?.find((p) => p.id === settings.currentPlaceId)
}

/** Switch places: the new kit becomes what the generator can see. */
export function withPlace(settings: Settings, placeId: string): Settings {
  const place = settings.places?.find((p) => p.id === placeId)
  if (!place) return settings
  return { ...settings, currentPlaceId: placeId, availableEquipment: [...place.equipment] }
}

/**
 * Ticking a chip changes the place you are standing in, not just today.
 * Buying a kettlebell is not a temporary fact about Tuesday.
 */
export function withEquipment(settings: Settings, equipment: Equipment[]): Settings {
  return {
    ...settings,
    availableEquipment: equipment,
    places: (settings.places ?? []).map((p) =>
      p.id === settings.currentPlaceId ? { ...p, equipment: [...equipment] } : p,
    ),
  }
}

/**
 * The heaviest this exercise can go where you are, or undefined for "no limit
 * worth mentioning". Takes the lowest ceiling among the kit it needs: an
 * exercise using a bench and a kettlebell is capped by the kettlebell.
 */
export function ceilingFor(exercise: Exercise, settings: Settings): number | undefined {
  const ceilings = currentPlace(settings)?.loadCeilings
  if (!ceilings) return undefined

  const relevant = exercise.equipment
    .map((q) => ceilings[q])
    .filter((v): v is number => typeof v === 'number')

  return relevant.length > 0 ? Math.min(...relevant) : undefined
}
