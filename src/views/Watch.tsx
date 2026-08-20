/**
 * The watch queue.
 *
 * 261 saved reels came in from the Instagram export. 77 of them named their
 * movements in the caption and are already real exercises. The rest named a
 * topic and nothing else -- "4 exercises that improve hip mobility" -- and the
 * movements exist only in the video, which nothing automated can read.
 *
 * So this screen does the one thing that actually closes that gap: shows you
 * the reel, next to a form, and gets out of the way. One reel usually holds
 * three or four movements, so the form adds and resets rather than closing.
 *
 * Nothing here guesses. A reel you have not watched contributes no exercises.
 */

import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { uid } from '../storage/repository'
import type { Equipment, Exercise, MovementPattern, Muscle, ReelSource } from '../types'

const PATTERNS: MovementPattern[] = [
  'mobility', 'stretch', 'squat', 'lunge', 'hinge',
  'push-horizontal', 'push-vertical', 'pull-horizontal', 'pull-vertical',
  'core-anti-extension', 'core-anti-rotation', 'core-flexion',
  'isolation', 'carry', 'conditioning', 'swim', 'run', 'protocol',
]

const MUSCLES: Muscle[] = [
  'quads', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors',
  'chest', 'lats', 'upper-back', 'traps', 'lower-back',
  'front-delts', 'side-delts', 'rear-delts', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'hip-flexors', 'neck',
]

const COMMON_EQUIPMENT: Equipment[] = [
  'bodyweight', 'mat', 'dumbbell', 'kettlebell', 'barbell', 'bands',
  'bench', 'box', 'pullup-bar', 'cable', 'machine',
]

const TOPIC_LABEL: Record<string, string> = {
  'hip-lower-back': 'hips & lower back',
  core: 'core',
  'shoulder-neck': 'shoulders & neck',
  legs: 'legs',
  mobility: 'mobility',
  strength: 'strength',
  running: 'running',
  swimming: 'swimming',
  recovery: 'recovery',
  nutrition: 'nutrition',
}

export default function Watch() {
  const { data, addExercise, setReelStatus } = useStore()
  const [openId, setOpenId] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)

  const statusOf = useMemo(() => {
    const m = new Map(data.reelProgress.map((r) => [r.reelId, r.status]))
    return (reel: ReelSource) => {
      const explicit = m.get(reel.id)
      if (explicit) return explicit
      // A reel that already produced exercises was processed at import time.
      return reel.extraction === 'named' ? 'processed' : 'pending'
    }
  }, [data.reelProgress])

  const exercisesByReel = useMemo(() => {
    const m = new Map<string, Exercise[]>()
    for (const e of data.exercises) {
      if (!e.reelId) continue
      const list = m.get(e.reelId) ?? []
      list.push(e)
      m.set(e.reelId, list)
    }
    return m
  }, [data.exercises])

  const queue = useMemo(
    () => data.reels.filter((r) => (showDone ? statusOf(r) !== 'pending' : statusOf(r) === 'pending')),
    [data.reels, statusOf, showDone],
  )

  const pendingCount = data.reels.filter((r) => statusOf(r) === 'pending').length
  const doneCount = data.reels.length - pendingCount
  const open = openId ? data.reels.find((r) => r.id === openId) : undefined

  if (open) {
    return (
      <ReelDetail
        reel={open}
        existing={exercisesByReel.get(open.id) ?? []}
        onAdd={(e) => {
          addExercise(e)
          setReelStatus(open.id, 'processed')
        }}
        onSkip={() => {
          setReelStatus(open.id, 'skipped')
          setOpenId(null)
        }}
        onClose={() => setOpenId(null)}
      />
    )
  }

  return (
    <>
      <p className="subtitle" style={{ marginTop: 4 }}>
        {doneCount} of {data.reels.length} reels handled. The rest named a topic but never the
        movements — those only exist in the video, so they are waiting for you.
      </p>

      <div className="progress-bar" aria-hidden="true">
        <span style={{ width: `${(doneCount / Math.max(data.reels.length, 1)) * 100}%` }} />
      </div>

      <div className="segmented" style={{ marginTop: 12 }}>
        <button className={!showDone ? 'is-on' : ''} onClick={() => setShowDone(false)}>
          To watch ({pendingCount})
        </button>
        <button className={showDone ? 'is-on' : ''} onClick={() => setShowDone(true)}>
          Handled ({doneCount})
        </button>
      </div>

      {queue.length === 0 && (
        <div className="empty">
          <div className="big">🎉</div>
          <p>Nothing left in this list.</p>
        </div>
      )}

      {queue.slice(0, 60).map((reel) => {
        const made = exercisesByReel.get(reel.id) ?? []
        return (
          <button key={reel.id} className="card card-button" onClick={() => setOpenId(reel.id)}>
            <div className="card-row">
              <div style={{ minWidth: 0 }}>
                <p className="faint" style={{ margin: 0 }}>
                  {reel.creator ? `@${reel.creator}` : 'unknown creator'}
                  {reel.claimedCount ? ` · claims ${reel.claimedCount} movements` : ''}
                  {reel.language !== 'en' ? ` · ${reel.language.toUpperCase()}` : ''}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 14, lineHeight: 1.4 }}>
                  {reel.caption.slice(0, 150) || <span className="faint">no caption</span>}
                  {reel.caption.length > 150 && '…'}
                </p>
                <div className="chips" style={{ marginTop: 8 }}>
                  {reel.topics.map((t) => (
                    <span className="chip muscle" key={t}>{TOPIC_LABEL[t] ?? t}</span>
                  ))}
                  {made.length > 0 && <span className="chip pattern">{made.length} added</span>}
                </div>
              </div>
              <span className="dim" style={{ fontSize: 20 }}>›</span>
            </div>
          </button>
        )
      })}

      {queue.length > 60 && (
        <p className="faint" style={{ textAlign: 'center' }}>
          …and {queue.length - 60} more. Work through these first.
        </p>
      )}
    </>
  )
}

function ReelDetail({
  reel, existing, onAdd, onSkip, onClose,
}: {
  reel: ReelSource
  existing: Exercise[]
  onAdd: (e: Exercise) => void
  onSkip: () => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [pattern, setPattern] = useState<MovementPattern>('mobility')
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight'])
  const [cues, setCues] = useState('')
  const [added, setAdded] = useState<string[]>([])
  const [embedFailed, setEmbedFailed] = useState(false)

  const toggle = <T,>(list: T[], v: T, set: (x: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  function save() {
    if (!name.trim()) return
    const timed = pattern === 'stretch' || pattern === 'protocol'
    onAdd({
      id: uid('ex-'),
      name: name.trim(),
      pattern,
      primaryMuscles: muscles,
      secondaryMuscles: [],
      equipment: equipment.length ? equipment : ['bodyweight'],
      unilateral: false,
      difficulty: 2,
      loadType: timed ? 'time' : 'reps',
      cues: cues.split('\n').map((c) => c.trim()).filter(Boolean),
      tags: reel.topics,
      notes: reel.creator ? `From @${reel.creator}` : undefined,
      sourceUrl: reel.url,
      reelId: reel.id,
      status: 'ready',
      createdAt: new Date().toISOString(),
    })
    setAdded((a) => [...a, name.trim()])
    // Reset for the next movement in the same reel -- keep the pattern and
    // equipment, because a reel is usually four variations of one theme.
    setName('')
    setCues('')
    setMuscles([])
  }

  return (
    <>
      <button className="btn btn-sm" onClick={onClose}>‹ Queue</button>

      <p className="faint" style={{ margin: '14px 0 2px' }}>
        {reel.creator ? `@${reel.creator}` : 'unknown creator'}
        {reel.creatorName ? ` · ${reel.creatorName}` : ''}
      </p>
      <h1 style={{ marginTop: 0, fontSize: 20 }}>
        {reel.claimedCount ? `${reel.claimedCount} movements to identify` : 'What is in this reel?'}
      </h1>

      {/* Instagram serves an embed view for public posts. If it refuses to be
          framed, the link is the fallback -- never a dead end. */}
      {!embedFailed ? (
        <div className="reel-embed">
          <iframe
            title="Instagram reel"
            src={`https://www.instagram.com/p/${reel.shortcode}/embed`}
            loading="lazy"
            onError={() => setEmbedFailed(true)}
          />
        </div>
      ) : null}

      <p style={{ margin: '10px 0' }}>
        <a href={reel.url} target="_blank" rel="noreferrer">Open the reel on Instagram ↗</a>
      </p>

      {reel.caption && (
        <details className="card">
          <summary className="faint" style={{ cursor: 'pointer' }}>Caption</summary>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, marginBottom: 0 }} className="dim">
            {reel.caption}
          </p>
        </details>
      )}

      {existing.length > 0 && (
        <>
          <h2>Already from this reel</h2>
          {existing.map((e) => (
            <div className="list-item" key={e.id}>
              <div><div>{e.name}</div><div className="faint">{e.pattern}</div></div>
            </div>
          ))}
        </>
      )}

      {added.length > 0 && (
        <div className="banner banner-ok">
          Added: {added.join(', ')}
        </div>
      )}

      <h2>Add a movement</h2>

      <div className="field">
        <label htmlFor="w-name">Name</label>
        <input
          id="w-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="what you just watched"
        />
      </div>

      <div className="field">
        <label htmlFor="w-pattern">Movement pattern</label>
        <select id="w-pattern" value={pattern} onChange={(e) => setPattern(e.target.value as MovementPattern)}>
          {PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="field">
        <label>Primary muscles</label>
        <div className="chips">
          {MUSCLES.map((m) => (
            <span
              key={m}
              className={`chip selectable${muscles.includes(m) ? ' on' : ''}`}
              onClick={() => toggle(muscles, m, setMuscles)}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Equipment</label>
        <div className="chips">
          {COMMON_EQUIPMENT.map((q) => (
            <span
              key={q}
              className={`chip selectable${equipment.includes(q) ? ' on' : ''}`}
              onClick={() => toggle(equipment, q, setEquipment)}
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="w-cues">Form cues — one per line</label>
        <textarea
          id="w-cues"
          rows={3}
          value={cues}
          onChange={(e) => setCues(e.target.value)}
          placeholder={'what the video actually says'}
        />
      </div>

      <div className="sticky-actions">
        <button className="btn btn-primary btn-block" onClick={save} disabled={!name.trim()}>
          Add movement {added.length > 0 && `(${added.length} so far)`}
        </button>
        <button className="btn btn-block" style={{ marginTop: 8 }} onClick={onSkip}>
          Nothing useful here — skip it
        </button>
      </div>
    </>
  )
}
