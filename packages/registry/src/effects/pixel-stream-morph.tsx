"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PixelStreamMorphProps {
  pace?: number
  intensity?: number
  density?: number
  text?: string
  className?: string
}

function glyph(rows: readonly string[]) {
  return rows.join("")
}

const FONT: Record<string, string> = {
  a: glyph(["01110", "10001", "10001", "11111", "10001", "10001", "10001"]),
  b: glyph(["11110", "10001", "10001", "11110", "10001", "10001", "11110"]),
  c: glyph(["01111", "10000", "10000", "10000", "10000", "10000", "01111"]),
  d: glyph(["11110", "10001", "10001", "10001", "10001", "10001", "11110"]),
  e: glyph(["11111", "10000", "10000", "11110", "10000", "10000", "11111"]),
  f: glyph(["11111", "10000", "10000", "11110", "10000", "10000", "10000"]),
  g: glyph(["01110", "10001", "10000", "10111", "10001", "10001", "01110"]),
  h: glyph(["10001", "10001", "10001", "11111", "10001", "10001", "10001"]),
  i: glyph(["01110", "00100", "00100", "00100", "00100", "00100", "01110"]),
  j: glyph(["00111", "00010", "00010", "00010", "10010", "10010", "01100"]),
  k: glyph(["10001", "10010", "10100", "11000", "10100", "10010", "10001"]),
  l: glyph(["10000", "10000", "10000", "10000", "10000", "10000", "11111"]),
  m: glyph(["10001", "11011", "10101", "10101", "10001", "10001", "10001"]),
  n: glyph(["10001", "11001", "10101", "10011", "10001", "10001", "10001"]),
  o: glyph(["01110", "10001", "10001", "10001", "10001", "10001", "01110"]),
  p: glyph(["11110", "10001", "10001", "11110", "10000", "10000", "10000"]),
  q: glyph(["01110", "10001", "10001", "10001", "10101", "10010", "01101"]),
  r: glyph(["11110", "10001", "10001", "11110", "10100", "10010", "10001"]),
  s: glyph(["01111", "10000", "10000", "01110", "00001", "00001", "11110"]),
  t: glyph(["11111", "00100", "00100", "00100", "00100", "00100", "00100"]),
  u: glyph(["10001", "10001", "10001", "10001", "10001", "10001", "01110"]),
  v: glyph(["10001", "10001", "10001", "10001", "10001", "01010", "00100"]),
  w: glyph(["10001", "10001", "10001", "10101", "10101", "10101", "01010"]),
  x: glyph(["10001", "10001", "01010", "00100", "01010", "10001", "10001"]),
  y: glyph(["10001", "10001", "01010", "00100", "00100", "00100", "00100"]),
  z: glyph(["11111", "00001", "00010", "00100", "01000", "10000", "11111"]),
  " ": glyph(["00000", "00000", "00000", "00000", "00000", "00000", "00000"]),
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function normalizeText(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)
  return cleaned.length > 0 ? cleaned : "flow"
}

function raster(text: string, cols: number, rows: number) {
  const glyphs = [...text]
  const rawW = glyphs.length * 5 + Math.max(0, glyphs.length - 1)
  const rawH = 7
  const mask = new Array<boolean>(cols * rows).fill(false)
  const availW = Math.max(1, cols - 2)
  const availH = Math.max(1, rows - 2)
  let occupied = 0
  let hash = 0
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const lx = ((x - 1) / availW) * rawW
      const ly = ((y - 1) / availH) * rawH
      if (lx < 0 || ly < 0 || lx >= rawW || ly >= rawH) continue
      const glyphIndex = Math.floor(lx / 6)
      const gx = lx - glyphIndex * 6
      if (gx >= 5 || glyphIndex < 0 || glyphIndex >= glyphs.length) continue
      const bits = FONT[glyphs[glyphIndex] ?? " "] ?? FONT[" "] ?? ""
      const gy = Math.min(6, Math.floor(ly))
      const sx = Math.min(4, Math.floor(gx))
      if (bits[gy * 5 + sx] !== "1") continue
      const index = y * cols + x
      mask[index] = true
      occupied += 1
      hash = (hash + (index + 1) * 13) % 1000003
    }
  }
  return { mask, occupied, hash }
}

export function PixelStreamMorph({
  pace = 1,
  intensity = 0.7,
  density = 28,
  text = "flow",
  className,
}: PixelStreamMorphProps) {
  const ref = useRef<HTMLDivElement>(null)
  const phaseRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const label = normalizeText(text)
  const cols = clamp(Math.round(density), 16, 48)
  const rows = clamp(Math.round(cols * 0.42), 8, 24)
  const field = useMemo(() => raster(label, cols, rows), [label, cols, rows])
  const [phase, setPhase] = useState(0)
  const [run, setRun] = useState(0)
  const streaming = !reduced && live
  const shownPhase = streaming ? phase : 0

  useEffect(() => {
    if (!streaming) return
    let stopped = false
    let frame = 0
    const tick = () => {
      if (stopped) return
      const next = phaseRef.current + 0.08 * rate
      phaseRef.current = next
      setPhase(next)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [streaming, rate, run])

  function replay() {
    if (reduced) return
    phaseRef.current = 0
    setPhase(0)
    setRun((value) => value + 1)
  }

  const cells: { index: number; x: number; y: number }[] = []
  field.mask.forEach((on, index) => {
    if (!on) return
    cells.push({ index, x: index % cols, y: Math.floor(index / cols) })
  })

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      data-slot="pixel-stream-morph"
      data-ritual="pixel-stream"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-density={cols}
      data-text={label}
      data-cells={field.occupied}
      data-mask={field.hash}
      data-phase={shownPhase.toFixed(3)}
      data-stream={streaming ? "on" : "off"}
      data-state={streaming ? "streaming" : "paused"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="img"
        aria-label={label}
        className="grid h-40 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => {
          const band = (Math.sin((cell.x / cols + cell.y / rows) * Math.PI * 2 + shownPhase) + 1) / 2
          const mix = Math.round(25 + band * (35 + gain * 40))
          return (
            <span
              key={cell.index}
              data-cell=""
              aria-hidden
              className={reduced ? "bg-primary" : undefined}
              style={{
                gridColumn: cell.x + 1,
                gridRow: cell.y + 1,
                background: reduced ? undefined : `color-mix(in oklch, var(--primary) ${mix}%, var(--accent))`,
                opacity: reduced ? 1 : 0.55 + gain * 0.45,
              }}
            />
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={replay}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          Replay
        </button>
      </div>
    </div>
  )
}
