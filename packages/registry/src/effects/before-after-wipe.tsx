"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type WipeOrientation = "vertical-handle" | "horizontal-handle"

export interface BeforeAfterWipeProps {
  orientation?: WipeOrientation
  pace?: number
  intensity?: number
  initial?: number
  className?: string
  onChange?: (ratio: number) => void
}

const track = 200

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 1000) / 1000
}

export function BeforeAfterWipe({
  orientation = "vertical-handle",
  pace = 1,
  intensity = 0.6,
  initial = 0.5,
  className,
  onChange,
}: BeforeAfterWipeProps) {
  const reduced = usePrefersReducedMotion()
  const vertical = orientation !== "horizontal-handle"
  const gain = clamp(intensity, 0, 1)
  const step = Math.round(clamp(0.1 * rateOf(pace), 0.04, 0.3) * 1000) / 1000
  const handle = Math.round(28 + gain * 22)
  const [ratio, setRatio] = useState(() => quantize(initial))
  const [seen, setSeen] = useState(initial)
  const [phase, setPhase] = useState<"rest" | "dragging" | "settled">("rest")
  const dragRef = useRef<{ x: number; y: number; ratio: number; pointerId: number } | null>(null)
  const onChangeRef = useRef(onChange)

  if (seen !== initial) {
    setSeen(initial)
    setRatio(quantize(initial))
  }

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  function update(next: number, nextPhase: "rest" | "dragging" | "settled") {
    const value = quantize(next)
    setRatio(value)
    setPhase(nextPhase)
    onChangeRef.current?.(value)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || (event.button !== undefined && event.button !== 0)) return
    event.preventDefault()
    dragRef.current = { x: event.clientX, y: event.clientY, ratio, pointerId: event.pointerId }
    setPhase("dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        return
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || reduced) return
    const delta = (vertical ? event.clientX - drag.x : event.clientY - drag.y) / track
    update(drag.ratio + delta, "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setPhase("settled")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced) return
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      update(ratio + step, "settled")
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      update(ratio - step, "settled")
    }
  }

  const percent = Math.round(ratio * 100)
  const clip = vertical ? `inset(0 0 0 ${percent}%)` : `inset(${percent}% 0 0 0)`

  return (
    <div
      data-slot="before-after-wipe"
      data-ritual="before-after"
      data-orientation={vertical ? "vertical-handle" : "horizontal-handle"}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-initial={quantize(initial)}
      data-ratio={ratio.toFixed(3)}
      data-step={step}
      data-track={track}
      data-motion={reduced ? "off" : "on"}
      data-state={phase}
      data-clip={clip}
      role="group"
      aria-label="前后擦拭"
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-64 overflow-hidden rounded-2xl border border-border">
        <div
          aria-hidden
          data-layer="before"
          className="absolute inset-0"
          style={{ background: "repeating-linear-gradient(135deg, var(--muted) 0 12px, var(--card) 12px 24px)" }}
        />
        <div
          aria-hidden
          data-layer="after"
          className="absolute inset-0 motion-reduce:transition-none"
          style={{
            clipPath: clip,
            background:
              "repeating-linear-gradient(45deg, color-mix(in oklch, var(--primary) 58%, var(--card)) 0 14px, var(--background) 14px 28px)",
            transition: reduced ? "none" : "clip-path 80ms linear",
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-xs text-foreground">Before</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2 py-1 text-xs text-foreground">After</span>
        {reduced ? null : (
          <div
            role="slider"
            tabIndex={0}
            aria-label="前后对照"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-orientation={vertical ? "horizontal" : "vertical"}
            data-handle=""
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
            style={
              vertical
                ? {
                    left: `${percent}%`,
                    top: "50%",
                    width: handle,
                    height: handle,
                    transform: "translate(-50%, -50%)",
                    boxShadow: `0 8px 24px color-mix(in oklch, var(--foreground) ${Math.round(12 + gain * 28)}%, transparent)`,
                  }
                : {
                    top: `${percent}%`,
                    left: "50%",
                    width: handle,
                    height: handle,
                    transform: "translate(-50%, -50%)",
                    boxShadow: `0 8px 24px color-mix(in oklch, var(--foreground) ${Math.round(12 + gain * 28)}%, transparent)`,
                  }
            }
            className={cn(
              "absolute z-10 grid place-items-center rounded-full border border-border bg-background text-foreground outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
              vertical ? "cursor-ew-resize" : "cursor-ns-resize",
            )}
          >
            <span aria-hidden className="text-xs">
              {vertical ? "↔" : "↕"}
            </span>
            {vertical ? <span aria-hidden className="absolute h-full w-px bg-foreground/70" /> : <span aria-hidden className="absolute h-px w-full bg-foreground/70" />}
          </div>
        )}
      </div>
      {reduced ? (
        <div className="mt-3 flex justify-center gap-2">
          <button type="button" onClick={() => update(1, "settled")} className="rounded-full border border-border px-3 py-1.5 text-sm">
            Show before
          </button>
          <button type="button" onClick={() => update(0, "settled")} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            Show after
          </button>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm text-muted-foreground">拖动手柄，或用方向键微调</p>
      )}
    </div>
  )
}
