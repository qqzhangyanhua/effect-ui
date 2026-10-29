"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by Wysa and Locket (via Mobbin), original implementation. */
export interface LayerPeelSheetProps {
  pace?: number
  intensity?: number
  threshold?: number
  className?: string
  onValueChange?: (state: { page: number; peel: number }) => void
}

export interface PeelSheet {
  id: string
  title: string
  summary: string
  body: string
}

export const PEEL_SHEETS: readonly PeelSheet[] = [
  { id: "doc-1", title: "Doc 1", summary: "Summary of the first sheet.", body: "A neutral note kept on the top sheet." },
  { id: "doc-2", title: "Doc 2", summary: "Summary of the second sheet.", body: "The next sheet stays flat until the corner clears." },
  { id: "doc-3", title: "Doc 3", summary: "Summary of the last sheet.", body: "Nothing sits under the final sheet." },
]

const TRAVEL = 180

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(value * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function LayerPeelSheet({
  pace = 1,
  intensity = 0.7,
  threshold = 0.45,
  className,
  onValueChange,
}: LayerPeelSheetProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const gate = clamp(threshold, 0.05, 0.95)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(280 / paceRate)
  const [page, setPage] = useState(0)
  const [peel, setPeel] = useState(0)
  const [phase, setPhase] = useState<"idle" | "dragging" | "turning" | "settling">("idle")
  const [hint, setHint] = useState("")
  const pageRef = useRef(0)
  const peelRef = useRef(0)
  const onValueRef = useRef(onValueChange)
  const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const last = PEEL_SHEETS.length - 1
  const safePage = clamp(page, 0, last)
  const current = PEEL_SHEETS[safePage] ?? PEEL_SHEETS[0]
  const upcoming = PEEL_SHEETS[safePage + 1]
  const playing = (phase === "turning" || phase === "settling") && live && !reduced
  const cut = peel * (18 + gain * 28)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let lastTime = 0
    const turning = phase === "turning"
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 1 / 12
      if (now > 0) lastTime = now
      const delta = dt * 0.7 * paceRate
      const raw = peelRef.current + (turning ? delta : -delta)
      const done = turning ? raw >= 1 : raw <= 0
      if (!done) {
        const next = quantize(clamp(raw, 0, 1))
        peelRef.current = next
        setPeel(next)
        frame = window.requestAnimationFrame(tick)
        return
      }
      if (turning) {
        const nextPage = Math.min(last, pageRef.current + 1)
        pageRef.current = nextPage
        peelRef.current = 0
        setPage(nextPage)
        setPeel(0)
        setPhase("idle")
        onValueRef.current?.({ page: nextPage, peel: 0 })
        return
      }
      peelRef.current = 0
      setPeel(0)
      setPhase("idle")
      onValueRef.current?.({ page: pageRef.current, peel: 0 })
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, phase, paceRate, last])

  function commitPeel(value: number) {
    const next = quantize(clamp(value, 0, 1))
    peelRef.current = next
    setPeel(next)
    onValueRef.current?.({ page: pageRef.current, peel: next })
  }

  function finishTurn() {
    if (pageRef.current >= last) {
      setHint("Last sheet")
      peelRef.current = 0
      setPeel(0)
      setPhase("idle")
      return
    }
    const nextPage = pageRef.current + 1
    pageRef.current = nextPage
    peelRef.current = 0
    setHint("")
    setPage(nextPage)
    setPeel(0)
    setPhase("idle")
    onValueRef.current?.({ page: nextPage, peel: 0 })
  }

  function confirmTurn() {
    if (pageRef.current >= last) {
      setHint("Last sheet")
      return
    }
    setHint("")
    if (reduced) {
      finishTurn()
      return
    }
    setPhase("turning")
  }

  function release() {
    dragRef.current = null
    if (peelRef.current >= gate && pageRef.current < last) {
      if (reduced) finishTurn()
      else setPhase("turning")
      return
    }
    if (reduced || peelRef.current <= 0) {
      peelRef.current = 0
      setPeel(0)
      setPhase("idle")
      onValueRef.current?.({ page: pageRef.current, peel: 0 })
      return
    }
    setPhase("settling")
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== undefined && event.button !== 0) return
    if (pageRef.current >= last) {
      setHint("Last sheet")
      return
    }
    dragRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    setPhase("dragging")
    setHint("")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const dx = Math.max(0, drag.x - event.clientX)
    const dy = Math.max(0, drag.y - event.clientY)
    commitPeel(Math.hypot(dx, dy) / TRAVEL)
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    release()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") commitPeel(peelRef.current + 0.1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") commitPeel(peelRef.current - 0.1)
    else if (event.key === "Enter") confirmTurn()
    else return
    if (event.key !== "Enter") setPhase("idle")
    event.preventDefault()
  }

  if (!current) return null

  return (
    <div
      ref={ref}
      data-slot="layer-peel-sheet"
      data-ritual="layer-peel"
      data-pace={paceRate}
      data-intensity={gain}
      data-threshold={gate.toFixed(2)}
      data-page={safePage}
      data-peel={peel.toFixed(2)}
      data-phase={phase}
      data-playing={playing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-count={PEEL_SHEETS.length}
      tabIndex={0}
      role="group"
      aria-label="Document sheets"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          {current.title} / {PEEL_SHEETS.length}
        </p>
        <p className="text-xs text-muted-foreground">{hint || (upcoming ? "Corner peels the sheet" : "Last sheet")}</p>
      </div>
      <div className="relative h-64">
        <div className="absolute inset-x-4 top-5 bottom-2 rounded-2xl border border-border bg-muted" />
        {upcoming && peel > 0.02 ? (
          <div
            data-summary=""
            className="absolute right-5 bottom-4 z-10 max-w-[70%] rounded-xl border border-border bg-background px-3 py-2"
          >
            <p className="text-sm font-medium text-foreground">{upcoming.title}</p>
            <p className="text-xs text-muted-foreground">{upcoming.summary}</p>
          </div>
        ) : null}
        <article
          data-sheet={current.id}
          className="absolute inset-0 z-20 rounded-2xl border border-border bg-card p-5 text-card-foreground motion-reduce:transition-none"
          style={{
            clipPath: cut <= 0 ? undefined : `polygon(0 0, 100% 0, 100% ${100 - cut}%, ${100 - cut}% 100%, 0 100%)`,
            boxShadow: `0 14px ${8 + gain * 24}px color-mix(in srgb, var(--foreground) ${Math.round(8 + gain * 18)}%, transparent)`,
          }}
        >
          <p className="text-xs text-muted-foreground">Sheet {safePage + 1}</p>
          <h3 className="mt-2 text-lg font-medium text-foreground">{current.title}</h3>
          <p className="mt-2 text-sm text-foreground">{current.body}</p>
        </article>
        {cut > 0 ? (
          <div
            data-curl=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 bottom-0 z-30 bg-foreground/10 motion-reduce:transition-none"
            style={{ width: `${cut}%`, height: `${cut}%`, opacity: 0.25 + gain * 0.55 }}
          />
        ) : null}
        <button
          type="button"
          data-handle=""
          role="slider"
          aria-label="Peel corner"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(peel * 100)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute right-0 bottom-0 z-40 size-12 touch-none rounded-br-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Drag the corner. Arrows set peel. Enter turns the sheet.</p>
    </div>
  )
}
