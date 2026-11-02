"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Devin, Mintlify, Grammarly, and Cursor Diff (via Mobbin), original implementation.
 * https://mobbin.com/screens/943c5aac-94ad-4e06-bbab-70d3a88e3fa1
 * https://mobbin.com/screens/75a194a1-ad5f-44e0-b8eb-6f78bd5598ee
 * https://mobbin.com/screens/59508691-835e-43bb-8dca-f4f6c8b08bc0
 * https://mobbin.com/screens/fa7df34d-7288-4c26-a0e9-95a84921e34e
 */
export interface HunkDeltaBarProps {
  pace?: number
  intensity?: number
  showLabels?: boolean
  compact?: boolean
  className?: string
  onValueChange?: (state: { activeIndex: number; locked: boolean }) => void
}

export type HunkKind = "add" | "del" | "mix"

export interface HunkDelta {
  id: string
  kind: HunkKind
  weight: number
  label: string
  add: number
  del: number
}

export const HUNK_DELTAS: readonly HunkDelta[] = [
  { id: "guard", kind: "add", weight: 2, label: "Guard the import", add: 4, del: 0 },
  { id: "helper", kind: "del", weight: 1, label: "Drop the helper", add: 0, del: 3 },
  { id: "field", kind: "mix", weight: 3, label: "Rename the field", add: 2, del: 2 },
  { id: "edge", kind: "add", weight: 1, label: "Note the edge", add: 1, del: 0 },
]

export const HUNK_CONTEXT = [
  "const limit = 4",
  "return items.slice(0, limit)",
  "mark the field rename",
  "keep the note short",
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function hunkSummary(hunk: HunkDelta) {
  return `+${hunk.add} -${hunk.del} ${hunk.label}`
}

export function hunkTone(kind: HunkKind, intensity: number, active: boolean) {
  const gain = clamp(intensity, 0, 1)
  const alpha = Math.round((active ? 26 : 14) + gain * (active ? 16 : 10))
  const add = `color-mix(in oklch, oklch(0.62 0.07 150) ${alpha}%, var(--muted))`
  const del = `color-mix(in oklch, var(--destructive) ${alpha}%, var(--muted))`
  if (kind === "add") return add
  if (kind === "del") return del
  return `linear-gradient(${add}, ${del})`
}

export function HunkDeltaBar({
  pace = 1,
  intensity = 0.55,
  showLabels = true,
  compact = false,
  className,
  onValueChange,
}: HunkDeltaBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(140 / paceRate)
  const [active, setActive] = useState(0)
  const [locked, setLocked] = useState(false)
  const onValueRef = useRef(onValueChange)
  const hunk = HUNK_DELTAS[active] ?? HUNK_DELTAS[0]
  const height = compact ? 144 : 208

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function emit(index: number, nextLocked: boolean) {
    onValueRef.current?.({ activeIndex: index, locked: nextLocked })
  }

  function activate(index: number, nextLocked = locked) {
    const count = HUNK_DELTAS.length
    const next = ((index % count) + count) % count
    setActive(next)
    setLocked(nextLocked)
    buttonRefs.current[next]?.focus()
    emit(next, nextLocked)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") activate(active + 1)
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") activate(active - 1)
    else if (event.key === "Home") activate(0)
    else if (event.key === "End") activate(HUNK_DELTAS.length - 1)
    else if (event.key === "Enter" || event.key === " ") activate(active, true)
    else return
    event.preventDefault()
  }

  if (!hunk) return null

  return (
    <div
      ref={ref}
      data-slot="hunk-delta-bar"
      data-ritual="hunk-delta"
      data-pace={paceRate}
      data-intensity={gain}
      data-labels={showLabels ? "on" : "off"}
      data-compact={compact ? "on" : "off"}
      data-active={String(active)}
      data-locked={locked ? "on" : "off"}
      data-playing="off"
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Change strip"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm font-medium text-foreground">Changes</p>
      <div className="flex gap-4">
        <div className="flex shrink-0 gap-1">
          <div data-gutter="" className="flex w-11 flex-col" style={{ height }}>
            {HUNK_DELTAS.map((item, index) => (
              <button
                key={item.id}
                ref={(node) => {
                  buttonRefs.current[index] = node
                }}
                type="button"
                data-hunk={item.id}
                data-kind={item.kind}
                aria-label={item.label}
                aria-pressed={index === active}
                tabIndex={index === active ? 0 : -1}
                onClick={() => activate(index)}
                className="flex w-full items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                style={{ flexGrow: item.weight, flexBasis: 0 }}
              >
                <span
                  data-bar=""
                  className="block h-[86%] w-2 rounded-sm motion-reduce:transition-none"
                  style={{
                    background: hunkTone(item.kind, gain, index === active),
                    transition: reduced ? "none" : `opacity ${ms}ms linear`,
                    opacity: index === active ? 1 : 0.72,
                  }}
                />
              </button>
            ))}
          </div>
          {showLabels ? (
            <div className="flex w-10 flex-col" style={{ height }}>
              {HUNK_DELTAS.map((item) => (
                <span
                  key={item.id}
                  data-count={item.id}
                  className="flex items-center text-[10px] leading-none text-muted-foreground"
                  style={{ flexGrow: item.weight, flexBasis: 0 }}
                >
                  +{item.add} -{item.del}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div data-context="" className="font-mono text-sm leading-6 text-foreground">
            {HUNK_CONTEXT.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2">
            <span
              data-marker=""
              className="mt-1 h-4 w-0.5 shrink-0 rounded-full motion-reduce:transition-none"
              style={{
                background: hunkTone(hunk.kind, gain, true),
                transition: reduced ? "none" : `background-color ${ms}ms linear`,
              }}
            />
            <p data-summary="" className="text-sm leading-5 text-foreground">
              {hunkSummary(hunk)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
