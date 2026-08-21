import { useState, useMemo } from 'react'
import Guides from './Guides'
import Watch from './Watch'
import { useStore } from '../store'
import ExerciseDetail from './ExerciseDetail'
import Kettlebell from './Kettlebell'
import { uid } from '../storage/repository'
import type { Exercise, MovementPattern, Muscle, Equipment, LoadType } from '../types'

const PATTERNS: MovementPattern[] = [
  'squat', 'lunge', 'hinge', 'push-horizontal', 'push-vertical',
  'pull-horizontal', 'pull-vertical', 'carry', 'core-anti-extension',
  'core-anti-rotation', 'core-flexion', 'isolation', 'conditioning', 'mobility',
]

const MUSCLES: Muscle[] = [
  'quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors',
  'chest', 'lats', 'upper-back', 'traps', 'lower-back',
  'front-delts', 'side-delts', 'rear-delts',
  'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'hip-flexors', 'neck',
]

const EQUIPMENT: Equipment[] = [
  'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
  'pullup-bar', 'bands', 'bench', 'rings', 'box', 'medicine-ball',
  'sled', 'trx', 'ab-wheel', 'mat',
]

const LOAD_TYPES: { value: LoadType; label: string }[] = [
  { value: 'weight-reps', label: 'Weight × reps' },
  { value: 'reps', label: 'Reps only (bodyweight)' },
  { value: 'time', label: 'Time (hold / interval)' },
  { value: 'weight-time', label: 'Weight × time (carries)' },
  { value: 'distance', label: 'Distance' },
]

export default function Library() {
  const { data } = useStore()
  const [query, setQuery] = useState('')
  const [patternFilter, setPatternFilter] = useState<MovementPattern | ''>('')
  const [editing, setEditing] = useState<Exercise | 'new' | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  // Tapping a card opens the read view; editing is a button on that.
  const [viewing, setViewing] = useState<Exercise | null>(null)
  const [mode, setMode] = useState<'exercises' | 'kettlebell' | 'guides' | 'reels'>('exercises')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.exercises
      .filter((e) => showArchived || !e.archived)
      .filter((e) => !patternFilter || e.pattern === patternFilter)
      .filter((e) => {
        if (!q) return true
        return (
          e.name.toLowerCase().includes(q) ||
          e.primaryMuscles.some((m) => m.includes(q)) ||
          e.equipment.some((x) => x.includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data.exercises, query, patternFilter, showArchived])

  // The detail view is a page of its own: the library header and its tabs would
  // just be chrome sitting on top of it.
  if (viewing && !editing) {
    return (
      <ExerciseDetail
        exercise={viewing}
        onEdit={() => setEditing(viewing)}
        onClose={() => setViewing(null)}
      />
    )
  }

  return (
    <>
      <div className="card-row">
        <h1>Library</h1>
        {mode === 'exercises' && (
          <button className="btn btn-sm btn-primary" onClick={() => setEditing('new')}>+ Add</button>
        )}
      </div>

      <div className="segmented">
        <button
          className={mode === 'exercises' ? 'is-on' : ''}
          onClick={() => setMode('exercises')}
        >
          Exercises
        </button>
        <button className={mode === 'kettlebell' ? 'is-on' : ''} onClick={() => setMode('kettlebell')}>
          Bells
        </button>
        <button className={mode === 'guides' ? 'is-on' : ''} onClick={() => setMode('guides')}>
          Guides
        </button>
        <button className={mode === 'reels' ? 'is-on' : ''} onClick={() => setMode('reels')}>
          Reels
        </button>
      </div>

      {mode === 'kettlebell' && <Kettlebell onOpen={(e) => setViewing(e)} />}
      {mode === 'guides' && <Guides />}
      {mode === 'reels' && <Watch />}

      {mode === 'exercises' && (
      <>
      <p className="subtitle">
        {data.exercises.filter((e) => !e.archived).length} exercises. Everything you add here becomes
        available to the generator.
      </p>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search name, muscle, equipment, tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chips" style={{ marginBottom: 14 }}>
        <span
          className={`chip selectable${patternFilter === '' ? ' on' : ''}`}
          onClick={() => setPatternFilter('')}
        >
          all
        </span>
        {PATTERNS.map((p) => (
          <span
            key={p}
            className={`chip selectable${patternFilter === p ? ' on' : ''}`}
            onClick={() => setPatternFilter(p)}
          >
            {p}
          </span>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">
          <div className="big">🔍</div>
          <p>Nothing matches.</p>
        </div>
      )}

      {filtered.map((e) => (
        <div className="card clickable" key={e.id} onClick={() => setViewing(e)}>
          <div className="card-row">
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0 }}>
                {e.name} {e.archived && <span className="faint">(archived)</span>}
              </h3>
              <div className="chips" style={{ marginTop: 6 }}>
                <span className="chip pattern">{e.pattern}</span>
                {e.primaryMuscles.slice(0, 3).map((m) => (
                  <span className="chip muscle" key={m}>{m}</span>
                ))}
              </div>
              <p className="faint" style={{ margin: '6px 0 0' }}>
                {e.equipment.join(' · ')}
                {e.unilateral && ' · unilateral'}
                {' · '}{'●'.repeat(e.difficulty)}{'○'.repeat(3 - e.difficulty)}
              </p>
            </div>

          </div>
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-sm btn-ghost" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Hide' : 'Show'} archived
        </button>
      </div>
      </>
      )}

      {editing && (
        <ExerciseEditor
          initial={editing === 'new' ? null : editing}
          onClose={() => {
            setEditing(null)
            setViewing(null)
          }}
        />
      )}
    </>
  )
}

function ExerciseEditor({ initial, onClose }: { initial: Exercise | null; onClose: () => void }) {
  const { addExercise, updateExercise } = useStore()

  const [name, setName] = useState(initial?.name ?? '')
  const [pattern, setPattern] = useState<MovementPattern>(initial?.pattern ?? 'isolation')
  const [primary, setPrimary] = useState<Muscle[]>(initial?.primaryMuscles ?? [])
  const [secondary, setSecondary] = useState<Muscle[]>(initial?.secondaryMuscles ?? [])
  const [equipment, setEquipment] = useState<Equipment[]>(initial?.equipment ?? ['bodyweight'])
  const [unilateral, setUnilateral] = useState(initial?.unilateral ?? false)
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(initial?.difficulty ?? 2)
  const [loadType, setLoadType] = useState<LoadType>(initial?.loadType ?? 'weight-reps')
  const [cues, setCues] = useState(initial?.cues.join('\n') ?? '')
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? '')
  const [tags, setTags] = useState(initial?.tags.join(', ') ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  function toggle<T>(list: T[], setList: (v: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  function save() {
    if (!name.trim()) {
      alert('Give it a name.')
      return
    }
    if (primary.length === 0) {
      alert('Pick at least one primary muscle — the generator uses this to balance your training.')
      return
    }
    if (equipment.length === 0) {
      alert('Pick at least one piece of equipment (use "bodyweight" if none).')
      return
    }

    const payload = {
      name: name.trim(),
      pattern,
      primaryMuscles: primary,
      secondaryMuscles: secondary,
      equipment,
      unilateral,
      difficulty,
      loadType,
      cues: cues.split('\n').map((c) => c.trim()).filter(Boolean),
      sourceUrl: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    if (initial) {
      updateExercise(initial.id, payload)
    } else {
      addExercise({ ...payload, id: uid('ex-'), createdAt: new Date().toISOString() })
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>{initial ? 'Edit exercise' : 'Add exercise'}</h2>

        <div className="field">
          <label htmlFor="ex-name">Name</label>
          <input id="ex-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deficit Reverse Lunge" />
        </div>

        <div className="field">
          <label htmlFor="ex-url">Source video (optional)</label>
          <input
            id="ex-url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://instagram.com/reel/…"
          />
          <p className="faint" style={{ marginTop: 4 }}>
            Paste the reel link. It becomes a "watch" link on the exercise.
          </p>
        </div>

        <div className="field">
          <label htmlFor="ex-pattern">Movement pattern</label>
          <select id="ex-pattern" value={pattern} onChange={(e) => setPattern(e.target.value as MovementPattern)}>
            {PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <p className="faint" style={{ marginTop: 4 }}>
            This decides which program slots the exercise can fill. Get it right and the generator does the rest.
          </p>
        </div>

        <div className="field">
          <label>Primary muscles</label>
          <div className="chips">
            {MUSCLES.map((m) => (
              <span
                key={m}
                className={`chip selectable${primary.includes(m) ? ' on' : ''}`}
                onClick={() => toggle(primary, setPrimary, m)}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Secondary muscles</label>
          <div className="chips">
            {MUSCLES.map((m) => (
              <span
                key={m}
                className={`chip selectable${secondary.includes(m) ? ' on' : ''}`}
                onClick={() => toggle(secondary, setSecondary, m)}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Equipment needed (all of it)</label>
          <div className="chips">
            {EQUIPMENT.map((q) => (
              <span
                key={q}
                className={`chip selectable${equipment.includes(q) ? ' on' : ''}`}
                onClick={() => toggle(equipment, setEquipment, q)}
              >
                {q}
              </span>
            ))}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="ex-load">Measured as</label>
            <select id="ex-load" value={loadType} onChange={(e) => setLoadType(e.target.value as LoadType)}>
              {LOAD_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ex-diff">Difficulty</label>
            <select id="ex-diff" value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}>
              <option value={1}>1 — anyone</option>
              <option value={2}>2 — some base</option>
              <option value={3}>3 — advanced</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={unilateral}
              onChange={(e) => setUnilateral(e.target.checked)}
              style={{ width: 20, height: 20, minHeight: 20, flex: 'none' }}
            />
            One side at a time (unilateral)
          </label>
        </div>

        <div className="field">
          <label htmlFor="ex-cues">Form cues — one per line</label>
          <textarea
            id="ex-cues"
            value={cues}
            onChange={(e) => setCues(e.target.value)}
            placeholder={'Knees track over mid-foot\nBrace before you unrack'}
          />
          <p className="faint" style={{ marginTop: 4 }}>
            This is the part of a reel worth keeping. Paste the coaching points here.
          </p>
        </div>

        <div className="field">
          <label htmlFor="ex-tags">Tags — comma separated</label>
          <input id="ex-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="finisher, knee-friendly, travel" />
        </div>

        <div className="field">
          <label htmlFor="ex-notes">Notes</label>
          <textarea id="ex-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save</button>
          <button className="btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
