/**
 * What Settings is allowed to offer, grouped the way you actually think about
 * it: the floor at home, the gym, the pool, the road.
 *
 * This is the ONLY list the equipment UI reads. It used to live inline in
 * SettingsView holding gym kit alone -- so `pool`, `treadmill`, `sauna` and the
 * rest existed in the `Equipment` union and shipped switched on, but had no
 * toggle anywhere. Anything that turned them off (a preset, an import) turned
 * them off for good.
 *
 * Hence the assertion at the bottom: adding a member to `Equipment` without
 * giving it a home here is now a build error rather than a silent hole.
 */

import type { Equipment } from '../types'

export interface EquipmentGroup {
  title: string
  /** One line under the title. About consequence, not about what the words mean. */
  hint?: string
  items: readonly Equipment[]
}

const GROUPS = [
  {
    title: 'Floor & home',
    hint: 'The kit that lives in a corner of a room rather than in a gym.',
    items: ['bodyweight', 'mat', 'foam-roller', 'pushup-bars', 'bands', 'ab-wheel'],
  },
  {
    title: 'Gym',
    items: [
      'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable', 'pullup-bar',
      'bench', 'rings', 'box', 'medicine-ball', 'sled', 'trx',
    ],
  },
  {
    // These are the Hyrox stations that need real equipment. Ticking one turns
    // a plan from approximating that station into training it, and the session
    // says which of the two it is doing.
    title: 'Hyrox stations',
    hint: 'Untick these and a Hyrox plan substitutes, and says so.',
    items: ['rower', 'ski-erg', 'sandbag', 'wall-ball'],
  },
  {
    // 'open-water' and 'paddles' ship OFF by default: open water is a safety
    // decision rather than a kit list, and paddles magnify a bad catch into a
    // shoulder problem.
    title: 'Swimming',
    hint: 'Untick the pool and every swim disappears from every plan.',
    items: ['pool', 'open-water', 'kickboard', 'pull-buoy', 'fins', 'paddles'],
  },
  {
    // 'track' ships OFF -- most people do not have one.
    title: 'Running',
    items: ['outdoors', 'treadmill', 'track'],
  },
  {
    title: 'Recovery',
    hint: 'Sauna rounds and cold exposure are protocols, not movements.',
    items: ['sauna', 'cold-plunge'],
  },
] as const satisfies readonly EquipmentGroup[]

export const EQUIPMENT_GROUPS: readonly EquipmentGroup[] = GROUPS

/** Every selectable item, flattened. Order follows the groups. */
export const ALL_EQUIPMENT: readonly Equipment[] = GROUPS.flatMap((g) => g.items)

/**
 * Compile-time exhaustiveness. If `Equipment` gains a member that no group
 * above lists, `Equipment` stops being assignable to `Listed` and this fails
 * `tsc -b`, naming the member it could not place.
 */
type Listed = (typeof GROUPS)[number]['items'][number]
type AssertAssignable<A extends B, B> = A
export type EveryEquipmentIsListed = AssertAssignable<Equipment, Listed>
