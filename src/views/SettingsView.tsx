import { useRef, useState } from 'react'
import { useStore } from '../store'
import { EQUIPMENT_GROUPS } from '../data/equipment'
import { currentPlace, withEquipment, withPlace } from '../engine/places'
import { NIGGLE_RULES } from '../engine/niggles'
import * as repo from '../storage/repository'
import type { Equipment, Niggle } from '../types'

export default function SettingsView() {
  const { data, updateSettings, update } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)

  const s = data.settings

  const place = currentPlace(s)

  function toggleEquipment(q: Equipment) {
    const next = s.availableEquipment.includes(q)
      ? s.availableEquipment.filter((x) => x !== q)
      : [...s.availableEquipment, q]
    // Writes to the place as well: buying a kettlebell is not a fact about Tuesday.
    updateSettings(withEquipment(s, next))
  }

  function toggleNiggle(n: Niggle) {
    updateSettings({
      niggles: s.niggles?.includes(n)
        ? s.niggles.filter((x) => x !== n)
        : [...(s.niggles ?? []), n],
    })
  }

  async function handleImport(file: File) {
    try {
      const imported = await repo.importFromFile(file)
      if (
        !confirm(
          `Replace everything with this backup?\n\n` +
            `${imported.exercises.length} exercises, ${imported.sessions.length} sessions, ` +
            `${imported.metrics.length} body entries.\n\nYour current data will be overwritten.`,
        )
      ) return
      update(() => imported)
      setImportMsg('Backup restored.')
    } catch (err) {
      setImportMsg(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  return (
    <>
      <h1>Settings</h1>

      <h2>Where are you training?</h2>
      <p className="faint" style={{ marginTop: -6 }}>
        Each place remembers its own kit. The generator only offers exercises you can
        actually do where you are standing.
      </p>

      <div className="place-row">
        {(s.places ?? []).map((pl) => (
          <button
            key={pl.id}
            className={`place-chip${pl.id === s.currentPlaceId ? ' is-on' : ''}`}
            onClick={() => updateSettings(withPlace(s, pl.id))}
          >
            <span className="place-icon">{pl.icon ?? '📍'}</span>
            <span>{pl.name}</span>
          </button>
        ))}
      </div>

      {place?.loadCeilings && Object.keys(place.loadCeilings).length > 0 && (
        <p className="faint" style={{ margin: '0 0 12px' }}>
          Heaviest here:{' '}
          {Object.entries(place.loadCeilings)
            .map(([q, w]) => `${q} ${w}${s.units}`)
            .join(' · ')}
          . Past that the app asks for reps instead of weight.
        </p>
      )}

      <h2>What is at {place?.name ?? 'this place'}</h2>

      {EQUIPMENT_GROUPS.map((group) => (
        <div key={group.title} style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 2px' }}>{group.title}</h3>
          {group.hint && (
            <p className="faint" style={{ margin: '0 0 8px' }}>{group.hint}</p>
          )}
          <div className="chips">
            {group.items.map((q) => (
              <span
                key={q}
                className={`chip selectable${s.availableEquipment.includes(q) ? ' on' : ''}`}
                onClick={() => toggleEquipment(q)}
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      ))}

      <h2>Training preferences</h2>

      <div className="card">
        <div className="field">
          <label htmlFor="units">Units</label>
          <select
            id="units"
            value={s.units}
            onChange={(e) => updateSettings({ units: e.target.value as 'kg' | 'lb' })}
          >
            <option value="kg">Kilograms</option>
            <option value="lb">Pounds</option>
          </select>
          <p className="faint" style={{ marginTop: 4 }}>
            This changes the label and the size of weight jumps — it does not convert
            numbers you have already logged.
          </p>
        </div>

        <div className="field">
          <label htmlFor="variety">
            Variety: {Math.round(s.varietyBias * 100)}%
          </label>
          <input
            id="variety"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={s.varietyBias}
            onChange={(e) => updateSettings({ varietyBias: Number(e.target.value) })}
            style={{ minHeight: 'auto', padding: 0 }}
          />
          <p className="faint" style={{ marginTop: 4 }}>
            Low = the same exercises most sessions, easier to progress and measure.
            High = constant rotation, more novelty, harder to track a single lift.
          </p>
        </div>

        <div className="field">
          <label htmlFor="window">Rotation window: {s.rotationWindowDays} days</label>
          <input
            id="window"
            type="range"
            min="7"
            max="60"
            step="1"
            value={s.rotationWindowDays}
            onChange={(e) => updateSettings({ rotationWindowDays: Number(e.target.value) })}
            style={{ minHeight: 'auto', padding: 0 }}
          />
          <p className="faint" style={{ marginTop: 4 }}>
            How long before an exercise counts as "fresh" again.
          </p>
        </div>

        <div className="field">
          <label htmlFor="maxdiff">Maximum difficulty</label>
          <select
            id="maxdiff"
            value={s.maxDifficulty}
            onChange={(e) => updateSettings({ maxDifficulty: Number(e.target.value) as 1 | 2 | 3 })}
          >
            <option value={1}>1 — beginner-friendly only</option>
            <option value={2}>2 — up to intermediate</option>
            <option value={3}>3 — anything</option>
          </select>
        </div>
      </div>

      <h2>Something sore?</h2>
      <p className="faint" style={{ marginTop: -6 }}>
        A filter, not a diagnosis. Tick one and the generator stops offering the movements
        that usually aggravate it, and says so when that empties a slot. Untick it when the
        week is over — and see a physio for anything that keeps coming back.
      </p>

      <div className="chips" style={{ marginBottom: 20 }}>
        {(Object.keys(NIGGLE_RULES) as Niggle[]).map((n) => (
          <span
            key={n}
            className={`chip selectable${s.niggles?.includes(n) ? ' on' : ''}`}
            onClick={() => toggleNiggle(n)}
          >
            {NIGGLE_RULES[n].label}
          </span>
        ))}
      </div>

      <h2>Your data</h2>

      <div className="banner banner-warn">
        <strong>Back this up.</strong> Everything lives in this browser only. Clearing
        browsing data, or the browser reclaiming space, will delete your training history
        permanently. Export a file now and then — it is the only copy that survives.
      </div>

      <div className="card">
        <div className="stat-row" style={{ marginBottom: 12 }}>
          <div className="stat">
            <div className="value mono">{data.exercises.filter((e) => !e.archived).length}</div>
            <div className="label">Exercises</div>
          </div>
          <div className="stat">
            <div className="value mono">{data.sessions.filter((s2) => s2.finishedAt).length}</div>
            <div className="label">Sessions</div>
          </div>
          <div className="stat">
            <div className="value mono">{data.metrics.length}</div>
            <div className="label">Body entries</div>
          </div>
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => repo.exportToFile(data)}>
            ⬇ Export backup
          </button>
          <button className="btn" style={{ flex: 1 }} onClick={() => fileRef.current?.click()}>
            ⬆ Import backup
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.target.value = ''
          }}
        />

        {importMsg && <p className="faint" style={{ marginTop: 10 }}>{importMsg}</p>}
      </div>

      <div className="card">
        <h3>Reset</h3>
        <p className="faint">
          Deletes all your sessions, body entries and custom exercises, and restores the
          starter library and programs.
        </p>
        <button
          className="btn btn-danger btn-block"
          onClick={() => {
            if (!confirm('Delete ALL your data and start over? This cannot be undone.')) return
            if (!confirm('Really sure? Export a backup first if you might want it back.')) return
            update(() => repo.resetToSeed())
          }}
        >
          Reset everything
        </button>
      </div>

      <hr className="divider" />
      <p className="faint" style={{ textAlign: 'center' }}>
        Your data never leaves this device.
      </p>
    </>
  )
}
