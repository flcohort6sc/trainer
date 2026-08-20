/**
 * What an exercise is, how to do it, how much of it, and the video it came from.
 *
 * Tapping a library card used to open the edit form, which answered "what are
 * this exercise's fields" rather than "how do I do this". This is the read
 * screen; editing is a button on it.
 */

import { useMemo, useState } from 'react'
import { useStore } from '../store'
import Figure from '../components/Figure'
import { figureFor } from '../data/figures'
import { appearsIn } from '../engine/library'
import { buildUsageIndex } from '../engine/generator'
import type { Exercise } from '../types'

export default function ExerciseDetail({
  exercise, onEdit, onClose,
}: {
  exercise: Exercise
  onEdit: () => void
  onClose: () => void
}) {
  const { data, deleteExercise } = useStore()
  const [embedFailed, setEmbedFailed] = useState(false)

  const appearances = useMemo(() => appearsIn(exercise, data), [exercise, data])
  const figure = figureFor(exercise)

  const lastDone = useMemo(() => {
    const days = buildUsageIndex(data, 'session').daysSince(exercise.id)
    if (days === Infinity) return 'never'
    if (days < 1) return 'today'
    if (days < 2) return 'yesterday'
    return `${Math.floor(days)} days ago`
  }, [data, exercise.id])

  // Instagram serves an embed for public posts. Pull the shortcode back out of
  // the URL we stored rather than requiring the reel to still be in the queue.
  const shortcode = exercise.sourceUrl?.match(/instagram\.com\/(?:p|reel|reels)\/([^/?#]+)/)?.[1]

  return (
    <>
      <div className="card-row" style={{ marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{exercise.name}</h1>
        <button className="btn btn-sm" onClick={onClose}>← Back</button>
      </div>

      <div className="chips" style={{ marginBottom: 10 }}>
        <span className="chip pattern">{exercise.pattern}</span>
        {exercise.primaryMuscles.map((m) => <span className="chip muscle" key={m}>{m}</span>)}
      </div>

      <p className="faint" style={{ marginTop: 0 }}>
        {exercise.equipment.join(' · ')}
        {exercise.unilateral && ' · one side at a time'}
        {' · '}{'●'.repeat(exercise.difficulty)}{'○'.repeat(3 - exercise.difficulty)}
        {' · last done '}{lastDone}
      </p>

      {figure && (
        <Figure
          spec={figure}
          title={exercise.name}
          size={260}
          primaryMuscles={exercise.primaryMuscles}
          secondaryMuscles={exercise.secondaryMuscles}
        />
      )}

      <h2>How to do it</h2>
      {exercise.cues.length > 0 ? (
        <ul className="cue-list">
          {exercise.cues.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      ) : (
        <p className="dim">
          No cues written for this one yet. Edit it and add what you want to remember — that is
          what you will actually want back in six weeks.
        </p>
      )}

      <h2>How much</h2>
      {appearances.length > 0 ? (
        <div className="card">
          <p className="faint" style={{ marginTop: 0 }}>
            Taken from the programs and routines you actually have — not a generic prescription.
          </p>
          {appearances.map((a, i) => (
            <div className="list-item" key={i}>
              <div style={{ minWidth: 0 }}>
                <div>{a.where}</div>
                {a.pinned && <div className="faint">pinned — this exercise specifically</div>}
              </div>
              <div className="mono">{a.prescription}</div>
            </div>
          ))}
        </div>
      ) : (
        <p className="dim">
          Nothing in your programs or routines currently asks for a {exercise.pattern}. Add a slot
          with that pattern and this becomes eligible immediately.
        </p>
      )}

      {/*
        The honest escape hatch.

        The figure shows the range, the muscles and the joint positions, and
        that is genuinely all a generated silhouette can do — it will never
        beat somebody demonstrating it. Rather than pretend otherwise, every
        exercise offers a way to go and watch one. It needs a network, which is
        the only part of this app that does.
      */}
      {!shortcode && (
        <p style={{ margin: '12px 0' }}>
          <a
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} form technique`)}`}
            target="_blank"
            rel="noreferrer"
          >
            Watch someone do it ↗
          </a>
          <span className="faint"> — opens a search; needs a connection</span>
        </p>
      )}

      {shortcode && !embedFailed && (
        <>
          <h2>Where it came from</h2>
          <div className="reel-embed">
            <iframe
              title={`${exercise.name} — source reel`}
              src={`https://www.instagram.com/p/${shortcode}/embed`}
              loading="lazy"
              onError={() => setEmbedFailed(true)}
            />
          </div>
        </>
      )}

      {exercise.notes && <p className="faint" style={{ marginTop: 10 }}>{exercise.notes}</p>}

      {exercise.sourceUrl && (
        <p style={{ margin: '10px 0' }}>
          <a href={exercise.sourceUrl} target="_blank" rel="noreferrer">Open the original ↗</a>
        </p>
      )}

      {exercise.tags.length > 0 && (
        <div className="chips" style={{ marginTop: 10 }}>
          {exercise.tags.map((t) => <span className="chip" key={t}>{t}</span>)}
        </div>
      )}

      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={onEdit}>
        Edit this exercise
      </button>

      {/* Deleting lives here rather than on every row of the library list: a
          destructive button beside 330 tappable cards is one mis-tap from
          losing an exercise. */}
      <button
        className="btn btn-danger btn-block"
        style={{ marginTop: 8 }}
        onClick={() => {
          if (!confirm(`Remove "${exercise.name}"? If it has logged history it is archived instead, so nothing you did is lost.`)) return
          deleteExercise(exercise.id)
          onClose()
        }}
      >
        Remove from library
      </button>
    </>
  )
}
