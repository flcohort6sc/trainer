/**
 * Single-series line chart, inline SVG, no dependencies.
 *
 * Deliberate choices:
 * - One series, so no legend -- the heading names it.
 * - One y-axis. Never two. Two measures = two charts.
 * - Recessive grid, 2px line, only the last point is labelled (labelling every
 *   point turns a trend into a table).
 * - Hover crosshair, because a chart on a screen that cannot be interrogated
 *   is a picture of data rather than data.
 */

import { useState, useMemo, useRef } from 'react'

export interface Point {
  /** ISO date, used for the x position and the tooltip. */
  date: string
  value: number
}

interface Props {
  points: Point[]
  /** Appended to values in the tooltip and the end label. */
  unit?: string
  /** Decimal places shown. */
  precision?: number
  height?: number
}

const PAD = { top: 14, right: 46, bottom: 22, left: 34 }

export default function LineChart({ points, unit = '', precision = 1, height = 150 }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const W = 320 // viewBox width; the SVG scales to its container

  const chart = useMemo(() => {
    if (points.length === 0) return null

    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
    const times = sorted.map((p) => new Date(p.date).getTime())
    const values = sorted.map((p) => p.value)

    const tMin = Math.min(...times)
    const tMax = Math.max(...times)
    const vMin = Math.min(...values)
    const vMax = Math.max(...values)

    // Pad the value axis by 8% so the line never touches the frame.
    // A flat series would give a zero range and divide by zero -- guard it.
    const range = vMax - vMin || Math.max(vMax * 0.1, 1)
    const yLo = vMin - range * 0.08
    const yHi = vMax + range * 0.08

    const plotW = W - PAD.left - PAD.right
    const plotH = height - PAD.top - PAD.bottom

    const x = (t: number) =>
      PAD.left + (tMax === tMin ? plotW / 2 : ((t - tMin) / (tMax - tMin)) * plotW)
    const y = (v: number) => PAD.top + plotH - ((v - yLo) / (yHi - yLo)) * plotH

    const coords = sorted.map((p, i) => ({ ...p, cx: x(times[i]), cy: y(p.value) }))
    const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.cx.toFixed(1)},${c.cy.toFixed(1)}`).join(' ')

    return { coords, path, yLo, yHi, plotH, vMin, vMax }
  }, [points, height])

  if (!chart) {
    return <p className="faint" style={{ textAlign: 'center', padding: '24px 0' }}>Not enough data yet.</p>
  }

  const { coords, path, yLo, yHi } = chart
  const last = coords[coords.length - 1]
  const active = hover !== null ? coords[hover] : null

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    // Map the pointer's pixel position into viewBox coordinates.
    const vx = ((e.clientX - rect.left) / rect.width) * W
    let nearest = 0
    let best = Infinity
    coords.forEach((c, i) => {
      const d = Math.abs(c.cx - vx)
      if (d < best) { best = d; nearest = i }
    })
    setHover(nearest)
  }

  const fmt = (v: number) => v.toFixed(precision).replace(/\.0+$/, '')

  return (
    <svg
      ref={svgRef}
      className="sparkline"
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      onPointerMove={handleMove}
      onPointerLeave={() => setHover(null)}
      role="img"
      aria-label={`Line chart, ${coords.length} points, from ${fmt(coords[0].value)} to ${fmt(last.value)} ${unit}`}
    >
      {/* Recessive gridlines: just the top and bottom of the value range. */}
      {[yHi, (yHi + yLo) / 2, yLo].map((v, i) => {
        const gy = PAD.top + (height - PAD.top - PAD.bottom) * (i / 2)
        return (
          <g key={i}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy}
              stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke"
            />
            <text
              x={PAD.left - 5} y={gy + 3}
              fill="var(--text-faint)" fontSize="9" textAnchor="end"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(v)}
            </text>
          </g>
        )
      })}

      {/* The series. vectorEffect keeps the stroke 2px despite the non-uniform scale. */}
      <path
        d={path}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Points, only when there are few enough to not become noise. */}
      {coords.length <= 30 &&
        coords.map((c, i) => (
          <circle
            key={i} cx={c.cx} cy={c.cy} r={active === c ? 4 : 2.5}
            fill="var(--accent)" stroke="var(--surface)" strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      {/* Selective direct label: the latest value only. */}
      <text
        x={last.cx + 7} y={last.cy + 3}
        fill="var(--text)" fontSize="11" fontWeight="600"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {fmt(last.value)}{unit}
      </text>

      {/* First and last dates along the bottom. */}
      <text x={PAD.left} y={height - 6} fill="var(--text-faint)" fontSize="9">
        {new Date(coords[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </text>
      {coords.length > 1 && (
        <text x={W - PAD.right} y={height - 6} fill="var(--text-faint)" fontSize="9" textAnchor="end">
          {new Date(last.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </text>
      )}

      {/* Hover crosshair + tooltip. */}
      {active && (
        <g>
          <line
            x1={active.cx} x2={active.cx} y1={PAD.top} y2={height - PAD.bottom}
            stroke="var(--text-faint)" strokeWidth="1" strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={Math.min(Math.max(active.cx, PAD.left + 20), W - PAD.right - 20)}
            y={PAD.top - 3}
            fill="var(--text)" fontSize="10" textAnchor="middle"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(active.value)}{unit} · {new Date(active.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        </g>
      )}
    </svg>
  )
}
