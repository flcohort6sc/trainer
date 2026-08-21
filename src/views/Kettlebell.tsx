/**
 * The kettlebell room.
 *
 * A third of the library needs a kettlebell, and almost all of it arrived from
 * saved reels — which meant it was scattered through a 353-item list with no
 * way to see it as what it is: a coherent way to train that has its own rules,
 * its own vocabulary, and its own ways to hurt yourself.
 *
 * Grouped by what the movement is FOR rather than alphabetically, because
 * nobody opens this thinking "I want something beginning with H". They open it
 * thinking "I have two bells and twenty minutes".
 */

import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { buildUsageIndex } from '../engine/generator'
import type { Exercise, MovementPattern } from '../types'

/**
 * The families kettlebell work actually divides into. Ballistics are thrown by
 * the hips and land somewhere; grinds are pressed slowly; the rest is carrying,
 * bracing and getting the bell around your body without hitting yourself.
 */
const FAMILIES: { title: string; blurb: string; patterns: MovementPattern[] }[] = [
  {
    title: 'Ballistic',
    blurb: 'Thrown by the hips. The arms are ropes — if they are lifting, the weight is wrong or the hinge is.',
    patterns: ['hinge', 'conditioning'],
  },
  {
    title: 'Press and pull',
    blurb: 'Slow strength. Vertical forearm, firm wrist, and the bell stays close to your centre line.',
    patterns: ['push-vertical', 'push-horizontal', 'pull-horizontal', 'pull-vertical'],
  },
  {
    title: 'Carry',
    blurb: 'The most honest thing a kettlebell does. Pick it up, stay stacked, walk, put it down before your grip goes.',
    patterns: ['carry'],
  },
  {
    title: 'Brace and rotate',
    blurb: 'The bell tries to turn you and you refuse. Hips square, ribs down, nothing above the waist moves.',
    patterns: ['core-anti-rotation', 'core-anti-extension', 'core-flexion'],
  },
  {
    title: 'Arms and shoulders',
    blurb: 'Small movements where the offset handle does the work a dumbbell cannot.',
    patterns: ['isolation', 'mobility', 'stretch'],
  },
]

export default function Kettlebell({ onOpen }: { onOpen: (e: Exercise) => void }) {
  const { data } = useStore()
  const [ownedOnly, setOwnedOnly] = useState(false)

  const usage = useMemo(() => buildUsageIndex(data, 'session'), [data])
  const available = new Set(data.settings.availableEquipment)

  const bells = useMemo(
    () => data.exercises.filter((e) => !e.archived && e.status !== 'unwatched' && e.equipment.includes('kettlebell')),
    [data.exercises],
  )

  const shown = ownedOnly ? bells.filter((e) => e.equipment.every((q) => available.has(q))) : bells
  const grouped = FAMILIES.map((f) => ({
    ...f,
    items: shown.filter((e) => f.patterns.includes(e.pattern)),
  })).filter((f) => f.items.length > 0)

  const placed = new Set(grouped.flatMap((g) => g.items.map((e) => e.id)))
  const rest = shown.filter((e) => !placed.has(e.id))

  const lastDone = (e: Exercise) => {
    const d = usage.daysSince(e.id)
    if (d === Infinity) return 'never'
    if (d < 1) return 'today'
    if (d < 2) return 'yesterday'
    return `${Math.floor(d)}d ago`
  }

  const place = data.settings.places?.find((p) => p.id === data.settings.currentPlaceId)

  return (
    <>
      <p className="faint" style={{ marginTop: 0 }}>
        {bells.length} movements that need a bell. Most came from your saved reels, and every one
        has been checked against how it is actually coached.
      </p>

      <div className="banner banner-info">
        <strong>Two rules that cover most of it.</strong> The hips throw a kettlebell; the arms only
        hang on. And on anything that finishes overhead, punch your hand <em>through</em> the handle
        so the bell lands on your forearm rather than crashing onto your wrist.
      </div>

      <label className="check-row" style={{ marginBottom: 14 }}>
        <input type="checkbox" checked={ownedOnly} onChange={(e) => setOwnedOnly(e.target.checked)} />
        <span>
          Only what I can do at {place?.name ?? 'this place'}
          <span className="faint" style={{ display: 'block' }}>
            Hides anything needing kit you have not ticked — a bench, two bells, a floor you can drag on.
          </span>
        </span>
      </label>

      {grouped.map((family) => (
        <section key={family.title}>
          <h2>{family.title}</h2>
          <p className="faint" style={{ marginTop: -4 }}>{family.blurb}</p>
          {family.items.map((e) => (
            <div className="card clickable" key={e.id} onClick={() => onOpen(e)}>
              <div className="card-row">
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{e.name}</h3>
                  <p className="faint" style={{ margin: '2px 0 0' }}>
                    {e.equipment.filter((q) => q !== 'kettlebell').join(' · ') || 'bell only'}
                    {e.unilateral && ' · one side at a time'}
                    {' · '}{'●'.repeat(e.difficulty)}{'○'.repeat(3 - e.difficulty)}
                    {' · '}{lastDone(e)}
                  </p>
                  {e.cues[0] && <p className="reason">{e.cues[0]}</p>}
                </div>
              </div>
            </div>
          ))}
        </section>
      ))}

      {rest.length > 0 && (
        <section>
          <h2>Everything else</h2>
          {rest.map((e) => (
            <div className="card clickable" key={e.id} onClick={() => onOpen(e)}>
              <h3 style={{ margin: 0, fontSize: 16 }}>{e.name}</h3>
              <p className="faint" style={{ margin: '2px 0 0' }}>{e.pattern}</p>
            </div>
          ))}
        </section>
      )}

      {shown.length === 0 && (
        <div className="empty">
          <div className="big">🔔</div>
          <p>Nothing here with your current kit. Untick the filter, or add a kettlebell in Settings.</p>
        </div>
      )}
    </>
  )
}
