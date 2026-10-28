"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface MosaicTileFlipProps {
  pace?: number
  intensity?: number
  cols?: number
  gap?: number
  className?: string
  onFlip?: (index: number) => void
}

const tones = ["bg-primary", "bg-accent", "bg-secondary", "bg-muted"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function MosaicTileFlip({
  pace = 1,
  intensity = 0.7,
  cols = 3,
  gap = 8,
  className,
  onFlip,
}: MosaicTileFlipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const waveRef = useRef(-1)
  const phaseRef = useRef<"entering" | "settled" | "flip">("entering")
  const liveRef = useRef(false)
  const onFlipRef = useRef(onFlip)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const columns = clamp(Math.round(cols), 2, 4)
  const rows = columns
  const total = columns * rows
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const stagger = Math.round(140 / rate)
  const angle = Math.round(80 + gain * 100)
  const maxWave = rows + columns - 2
  const [wave, setWave] = useState(-1)
  const [phase, setPhase] = useState<"entering" | "settled" | "flip">("entering")
  const [run, setRun] = useState(0)
  const [flips, setFlips] = useState<Record<number, boolean>>({})
  const shownWave = reduced ? 99 : wave
  const shownPhase = reduced ? "settled" : phase
  const tiles = Array.from({ length: total }, (_, index) => {
    const row = Math.floor(index / columns)
    const col = index % columns
    return {
      index,
      row,
      col,
      open: row + col <= shownWave,
      letter: String.fromCharCode(65 + index),
    }
  })
  const revealed = tiles.filter((tile) => tile.open).length

  useEffect(() => {
    onFlipRef.current = onFlip
  }, [onFlip])

  useEffect(() => {
    liveRef.current = live
    waveRef.current = wave
    phaseRef.current = phase
  }, [live, wave, phase])

  useEffect(() => {
    if (reduced || !live || phase !== "entering") return
    let stopped = false
    let acc = 0
    const framesPer = Math.max(1, Math.round(2 / rate))
    const tick = () => {
      if (stopped || !liveRef.current) return
      acc += 1
      if (acc >= framesPer) {
        acc = 0
        const next = waveRef.current + 1
        waveRef.current = next
        setWave(next)
        if (next >= maxWave) {
          phaseRef.current = "settled"
          setPhase("settled")
          return
        }
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, phase, rate, maxWave, run])

  function flip(index: number) {
    setFlips((current) => ({ ...current, [index]: !current[index] }))
    if (!reduced && phaseRef.current === "settled") {
      phaseRef.current = "flip"
      setPhase("flip")
    }
    onFlipRef.current?.(index)
  }

  function onTileKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "Enter") return
    event.preventDefault()
    flip(index)
  }

  function replay() {
    if (reduced) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    waveRef.current = -1
    phaseRef.current = "entering"
    setFlips({})
    setWave(-1)
    setPhase("entering")
    setRun((value) => value + 1)
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label="马赛克"
      data-slot="mosaic-tile-flip"
      data-ritual="mosaic-flip"
      data-grid="regular"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-cols={columns}
      data-rows={rows}
      data-gap={clamp(gap, 0, 64)}
      data-stagger={stagger}
      data-angle={angle}
      data-state={shownPhase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: clamp(gap, 0, 64) }}
      >
        {tiles.map((tile) => {
          const { index, row, col, open, letter } = tile
          const flipped = flips[index] === true
          const transform = !open
            ? `rotateX(${angle}deg) scale(0.86)`
            : flipped
              ? `rotateY(${angle}deg)`
              : "none"
          return (
            <div key={letter} className="[perspective:800px]">
              <button
                type="button"
                aria-label={`格子 ${letter}`}
                data-tile={index}
                data-open={open ? "true" : "false"}
                data-flipped={flipped ? "true" : "false"}
                data-lag={row + col}
                data-delay={(row + col) * stagger}
                onClick={() => flip(index)}
                onKeyDown={(event) => onTileKeyDown(event, index)}
                style={{
                  transform,
                  opacity: open ? 1 : 0,
                  transition: reduced ? "none" : `transform ${Math.round(360 / rate)}ms ease, opacity ${Math.round(280 / rate)}ms ease`,
                }}
                className={cn(
                  "flex aspect-square w-full items-center justify-center rounded-2xl text-2xl font-semibold text-primary-foreground motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tones[index % tones.length],
                  index % tones.length === 3 && "text-foreground",
                )}
              >
                <span>{letter}</span>
              </button>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" data-revealed={revealed}>
          {revealed}/{total}
        </p>
        <button
          type="button"
          onClick={replay}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return
            event.preventDefault()
            replay()
          }}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          Replay
        </button>
      </div>
    </div>
  )
}
