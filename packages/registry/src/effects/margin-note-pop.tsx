"use client"

import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Dovetail, Air, and Fabric (via Mobbin), original implementation.
 * https://mobbin.com/screens/9fd5fd65-a2fc-4218-8725-c49a35988746
 * https://mobbin.com/screens/f5d539dc-b847-4a45-83fb-b848a32e0410
 * https://mobbin.com/screens/b2374d42-8c86-4efe-bdca-967a2a3cf9ac
 */
export interface MarginNotePopProps {
  pace?: number
  intensity?: number
  oneOpen?: boolean
  side?: "start" | "end"
  className?: string
  onValueChange?: (state: { active: number | null; open: string[] }) => void
}

export interface MarginNote {
  id: string
  line: number
  author: string
  body: string
}

export const MARGIN_LINES = [
  "The draft keeps the opening short so a reader can scan the claim before the detail.",
  "The middle passage lists the evidence in the same order the figure uses.",
  "The close asks for one decision and leaves the rest of the page quiet.",
] as const

export const MARGIN_NOTES: readonly MarginNote[] = [
  { id: "al", line: 0, author: "AL", body: "Tighten the opening clause." },
  { id: "mk", line: 1, author: "MK", body: "This sentence can stay." },
  { id: "jr", line: 2, author: "JR", body: "Name the figure in the caption." },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function wrap(index: number, count: number) {
  return ((index % count) + count) % count
}

export function MarginNotePop({
  pace = 1,
  intensity = 0.7,
  oneOpen = true,
  side = "end",
  className,
  onValueChange,
}: MarginNotePopProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(160 / paceRate)
  const [active, setActive] = useState<number | null>(null)
  const [open, setOpen] = useState<number[]>([])
  const [breath, setBreath] = useState(0)
  const [seenOne, setSeenOne] = useState(oneOpen)
  const openRef = useRef(open)
  const activeRef = useRef(active)
  const onValueRef = useRef(onValueChange)
  const breathing = live && !reduced && open.length === 0
  const placed = side === "start" ? "start" : "end"

  if (seenOne !== oneOpen) {
    setSeenOne(oneOpen)
    if (oneOpen && open.length > 1) {
      const keep = active !== null && open.includes(active) ? active : open[open.length - 1]
      setOpen(keep === undefined ? [] : [keep])
    }
  }

  useEffect(() => {
    openRef.current = open
    activeRef.current = active
    onValueRef.current = onValueChange
  }, [open, active, onValueChange])

  useEffect(() => {
    if (!breathing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((value) => (value + dt * 0.22 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [breathing, paceRate])

  function emit(nextActive: number | null, nextOpen: readonly number[]) {
    onValueRef.current?.({
      active: nextActive,
      open: nextOpen.map((index) => MARGIN_NOTES[index]?.id).filter((id): id is string => Boolean(id)),
    })
  }

  function focusAt(index: number) {
    const next = wrap(index, MARGIN_NOTES.length)
    activeRef.current = next
    setActive(next)
    buttonRefs.current[next]?.focus()
    emit(next, openRef.current)
  }

  function toggle(index: number) {
    const nextIndex = wrap(index, MARGIN_NOTES.length)
    const has = openRef.current.includes(nextIndex)
    const next = has
      ? openRef.current.filter((item) => item !== nextIndex)
      : oneOpen
        ? [nextIndex]
        : [...openRef.current, nextIndex]
    openRef.current = next
    activeRef.current = nextIndex
    setActive(nextIndex)
    setOpen(next)
    buttonRefs.current[nextIndex]?.focus()
    emit(nextIndex, next)
  }

  function closeAll() {
    openRef.current = []
    setOpen([])
    emit(activeRef.current, [])
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = activeRef.current
    if (event.key === "ArrowRight" || event.key === "ArrowDown") focusAt((current ?? -1) + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") focusAt((current ?? 0) - 1)
    else if (event.key === "Home") focusAt(0)
    else if (event.key === "End") focusAt(MARGIN_NOTES.length - 1)
    else if (event.key === "Enter" || event.key === " ") toggle(current ?? 0)
    else if (event.key === "Escape") closeAll()
    else return
    event.preventDefault()
  }

  const wave = breathing ? 0.5 + 0.5 * Math.sin(breath * Math.PI * 2) : 0

  return (
    <div
      ref={ref}
      data-slot="margin-note-pop"
      data-ritual="margin-note"
      data-pace={paceRate}
      data-intensity={gain}
      data-one={oneOpen ? "on" : "off"}
      data-side={placed}
      data-active={active === null ? "none" : String(active)}
      data-open={open.length === 0 ? "none" : open.map((index) => MARGIN_NOTES[index]?.id).join(",")}
      data-breath={breath.toFixed(2)}
      data-playing={breathing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Margin notes"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Margin notes</p>
        <p className="text-xs text-muted-foreground">{open.length} open</p>
      </div>
      <div
        className="grid gap-x-3 gap-y-4"
        style={{ gridTemplateColumns: placed === "start" ? "11.5rem minmax(0,1fr)" : "minmax(0,1fr) 11.5rem" }}
      >
        {MARGIN_LINES.map((line, index) => {
          const note = MARGIN_NOTES[index]
          if (!note) return null
          const isOpen = open.includes(index)
          const anchor = (
            <div key={`${note.id}-margin`} data-margin="" data-line={index} className="min-w-0">
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node
                }}
                type="button"
                data-anchor={note.id}
                aria-label={`${note.author} note`}
                aria-expanded={isOpen}
                aria-controls={`margin-note-${note.id}`}
                tabIndex={active === null ? (index === 0 ? 0 : -1) : active === index ? 0 : -1}
                onClick={() => toggle(index)}
                className="grid size-11 place-items-center rounded-full border border-border bg-background text-[11px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                style={{
                  opacity: breathing ? 0.82 + wave * 0.18 * (0.35 + gain * 0.4) : 1,
                  transition: reduced ? "none" : `border-color ${ms}ms linear, opacity ${ms}ms linear`,
                  borderColor: active === index ? `color-mix(in srgb, var(--primary) ${Math.round(30 + gain * 25)}%, var(--border))` : undefined,
                }}
              >
                {note.author}
              </button>
              {isOpen ? (
                <div
                  id={`margin-note-${note.id}`}
                  data-note={note.id}
                  role="note"
                  className="mt-2 rounded-lg border border-border bg-popover p-2 text-popover-foreground"
                >
                  <p className="text-xs font-medium">{note.author}</p>
                  <p className="mt-1 text-xs leading-5">{note.body}</p>
                </div>
              ) : null}
            </div>
          )
          const body = (
            <p key={`${note.id}-body`} data-body="" data-line={index} className="text-sm leading-6 text-foreground">
              {line}
            </p>
          )
          return (
            <Fragment key={note.id}>
              {placed === "start" ? anchor : body}
              {placed === "start" ? body : anchor}
            </Fragment>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Arrows move anchors. Enter opens. Escape closes.</p>
    </div>
  )
}
