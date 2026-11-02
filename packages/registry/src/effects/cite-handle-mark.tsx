"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by DocuSign, ClickUp, and Cofounder (via Mobbin), original implementation.
 * https://mobbin.com/screens/f6a19340-8bac-474a-8acb-ab0ee8b6bbb3
 * https://mobbin.com/screens/0b3a8bac-a1fd-43fe-a542-81621a337245
 * https://mobbin.com/screens/b281e31b-4f28-456e-88bd-83791e276879
 */
export interface CiteHandleMarkProps {
  pace?: number
  intensity?: number
  count?: number
  cycle?: boolean
  className?: string
  onValueChange?: (state: { activeIndex: number; handle: string; locked: boolean }) => void
}

export interface CiteHandle {
  handle: string
  role: string
}

export const CITE_HANDLES: readonly CiteHandle[] = [
  { handle: "ada", role: "Editor" },
  { handle: "milo", role: "Reviewer" },
  { handle: "june", role: "Author" },
  { handle: "ren", role: "Copy" },
  { handle: "kai", role: "Lead" },
]

const CYCLE_SEC = 1.6

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function visibleHandleCount(count: number) {
  if (!Number.isFinite(count)) return 4
  return clamp(Math.round(count), 2, 5)
}

export function inkAlpha(intensity: number, active: boolean) {
  const gain = clamp(intensity, 0, 1)
  if (active) return Math.round(16 + gain * 18)
  return Math.round(7 + gain * 7)
}

export function CiteHandleMark({
  pace = 1,
  intensity = 0.55,
  count = 4,
  cycle = false,
  className,
  onValueChange,
}: CiteHandleMarkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const total = visibleHandleCount(count)
  const shown = CITE_HANDLES.slice(0, total)
  const ms = reduced ? 0 : Math.round(140 / paceRate)
  const [active, setActive] = useState(0)
  const [locked, setLocked] = useState(false)
  const [seenTotal, setSeenTotal] = useState(total)
  const onValueRef = useRef(onValueChange)
  const activeRef = useRef(active)
  const cycling = cycle && live && !reduced && !locked
  const current = shown[Math.min(active, shown.length - 1)]

  if (seenTotal !== total) {
    setSeenTotal(total)
    if (active > total - 1) setActive(total - 1)
  }

  useEffect(() => {
    onValueRef.current = onValueChange
    activeRef.current = active
  }, [onValueChange, active])

  useEffect(() => {
    if (!cycling) return
    let frame = 0
    let stopped = false
    let last = 0
    let acc = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      acc += dt * paceRate
      if (acc >= CYCLE_SEC) {
        acc = 0
        const next = (activeRef.current + 1) % total
        activeRef.current = next
        setActive(next)
        onValueRef.current?.({
          activeIndex: next,
          handle: CITE_HANDLES[next]?.handle ?? "",
          locked: false,
        })
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [cycling, paceRate, total])

  function emit(index: number, nextLocked: boolean) {
    onValueRef.current?.({
      activeIndex: index,
      handle: shown[index]?.handle ?? "",
      locked: nextLocked,
    })
  }

  function pick(index: number) {
    const next = ((index % total) + total) % total
    activeRef.current = next
    setActive(next)
    buttonRefs.current[next]?.focus()
    emit(next, locked)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") pick(active + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") pick(active - 1)
    else if (event.key === "Home") pick(0)
    else if (event.key === "End") pick(total - 1)
    else if (event.key === "Enter") {
      setLocked(true)
      emit(active, true)
    } else return
    event.preventDefault()
  }

  function mention(index: number) {
    const item = shown[index]
    if (!item) return null
    const on = index === active
    return (
      <button
        key={item.handle}
        ref={(node) => {
          buttonRefs.current[index] = node
        }}
        type="button"
        data-handle={item.handle}
        aria-label={`Mention ${item.handle}`}
        aria-pressed={on}
        tabIndex={index === active ? 0 : -1}
        onClick={() => pick(index)}
        className="inline rounded-sm px-0.5 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        style={{
          backgroundColor: `color-mix(in srgb, var(--primary) ${inkAlpha(gain, on)}%, transparent)`,
          transition: reduced ? "none" : `background-color ${ms}ms linear`,
        }}
      >
        @{item.handle}
      </button>
    )
  }

  return (
    <div
      ref={ref}
      data-slot="cite-handle-mark"
      data-ritual="cite-handle"
      data-pace={paceRate}
      data-intensity={gain}
      data-count={total}
      data-cycle={cycling ? "on" : "off"}
      data-active={String(Math.min(active, total - 1))}
      data-handle={current?.handle ?? ""}
      data-locked={locked ? "on" : "off"}
      data-playing={cycling ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Mentions"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm font-medium text-foreground">Mentions</p>
      <p data-copy="" className="text-sm leading-8 text-foreground">
        Ask {mention(0)}
        {total > 1 ? <> to review the paragraph with {mention(1)}</> : null}
        {total === 3 ? <> before {mention(2)} files it</> : null}
        {total > 3 ? (
          <>
            {" "}
            before {mention(2)} files it for {mention(3)}
          </>
        ) : null}
        {total > 4 ? <> and {mention(4)}</> : null}.
      </p>
      <p data-role="" className="mt-3 text-xs text-muted-foreground">
        {current?.handle} · {current?.role}
        {locked ? " · locked" : ""}
      </p>
    </div>
  )
}
