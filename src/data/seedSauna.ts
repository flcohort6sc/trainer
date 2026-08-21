/**
 * Sauna and cold exposure.
 *
 * These are not movements, which is why they carry the 'protocol' pattern --
 * nothing about a sauna round belongs in a squat slot, and the pattern is what
 * keeps it out. What they DO share with stretching is shape: a timed sequence
 * the flow player can run while you sit there with your eyes shut.
 *
 * Rounds repeat on purpose. Round three is supposed to be the same sauna as
 * round one, which is what `allowRepeat` on the routine step is for.
 *
 * Heat and cold are physiologically real stressors. The cues below are the
 * ordinary safety practice you will find on the wall of any decent sauna --
 * they are not medical advice, and nothing here knows anything about you.
 */

import type { Exercise } from '../types'
import { ex } from './seedExercises'

export const SEED_SAUNA: Exercise[] = [
  ex('sa-round', 'Sauna Round', 'protocol', ['neck'], [], ['sauna'], {
    difficulty: 2, loadType: 'time',
    cues: [
      'Sit or lie on a towel, breathe through the nose, stay relaxed',
      'Leave early if you feel dizzy, nauseous or your heart is racing — the timer is a suggestion, not an instruction',
      'Drink water between every round',
    ],
    notes: 'Typical is 8–15 minutes. Heat is the stressor; enduring it is not the point.',
    tags: ['sauna', 'heat', 'recovery'],
  }),
  ex('sa-round-gentle', 'Gentle Sauna Round', 'protocol', ['neck'], [], ['sauna'], {
    difficulty: 1, loadType: 'time',
    cues: ['Lower bench, shorter round', 'Where to start if you are new to it, or if it is your first round of the day'],
    tags: ['sauna', 'heat', 'recovery', 'beginner-friendly'],
  }),
  ex('sa-plunge', 'Cold Plunge', 'protocol', ['neck'], [], ['cold-plunge'], {
    difficulty: 3, loadType: 'time',
    cues: [
      'Get the breathing under control before you go deeper — the gasp reflex is the dangerous part',
      'Never alone, and never straight after alcohol',
      'Out at the first shiver, not at the end of a target time',
    ],
    tags: ['sauna', 'cold', 'recovery'],
  }),
  ex('sa-cold-shower', 'Cold Shower', 'protocol', ['neck'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Feet and hands first, then the back of the neck', 'The accessible version of a plunge, and most of the benefit'],
    tags: ['sauna', 'cold', 'recovery', 'home'],
  }),
  ex('sa-cool-air', 'Cool Down in Fresh Air', 'protocol', ['neck'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Step outside or into cool air between rounds rather than straight into cold water',
      'Stay until the skin stops feeling hot and the breathing settles',
      'Two to five minutes is usually enough',
      'This is part of the round, not a break from it',
    ],
    tags: ['sauna', 'cold', 'recovery'],
  }),
  ex('sa-rest', 'Rest and Rehydrate', 'protocol', ['neck'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: ['Sit down, drink, let the heart rate come back to normal', 'This is the half of the protocol people skip'],
    tags: ['sauna', 'sauna-rest', 'recovery'],
  }),
  ex('sa-final-rest', 'Final Rest', 'protocol', ['neck'], [], ['bodyweight'], {
    difficulty: 1, loadType: 'time',
    cues: [
      'Lie down and do nothing for at least as long as your last round',
      'Rehydrate now, with something containing sodium if you were in a long time',
      'Skipping this is skipping most of what the sauna was for',
      'Get up slowly — blood pressure takes a moment to catch up',
    ],
    tags: ['sauna', 'sauna-final', 'recovery', 'wind-down'],
  }),
]
