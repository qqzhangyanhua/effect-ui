"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Mercury, Contra, Employment Hero, and Deel (via Mobbin), original implementation.
 * https://mobbin.com/screens/2a7de612-6f88-42d7-bce5-1d8fe2219314
 * https://mobbin.com/screens/7766aadf-5cce-4bc9-8855-70c6b03f9480
 * https://mobbin.com/screens/4852a8e5-f3d8-44fc-97ac-f94fd950b7f4
 * https://mobbin.com/screens/bb87cbe7-3f00-44e4-80b0-67626eaa0bf8
 */
export interface SignoffBeadPathProps {
  pace?: number
  intensity?: number
  showChecks?: boolean
  count?: number
  advanceOnEnter?: boolean
  className?: string
  onValueChange?: (state: { selectedId: string; activeId: string | null; signed: number }) => void
}

export type BeadState = "pending" | "active" | "signed"

export interface SignoffReviewer {
  id: string
  initials: string
  name: string
  note: string
}

export const SIGNOFF_REVIEWERS: readonly SignoffReviewer[] = [
  { id: "al", initials: "AL", name: "Alex", note: "Signed the opening." },
  { id: "mk", initials: "MK", name: "Morgan", note: "Reading the middle." },
  { id: "jr", initials: "JR", name: "Jordan", note: "Waiting on the figure." },
  { id: "qn", initials: "QN", name: "Quinn", note: "Not started." },
  { id: "sk", initials: "SK", name: "Sam", note: "Queued." },
  { id: "te", initials: "TE", name: "Taylor", note: "Queued last." },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function reviewerCount(count: number) {
  if (!Number.isFinite(count)) return 4
  return clamp(Math.round(count), 3, 6)
}

export function initialBeadStates(count: number): BeadState[] {
  const total = reviewerCount(count)
  return Array.from({ length: total }, (_, index) => {
    if (index === 0) return "signed"
    if (index === 1) return "active"
    return "pending"
  })
}

export function advanceStates(states: readonly BeadState[]): BeadState[] {
  const next = states.slice()
  const active = next.indexOf("active")
  if (active < 0) return next
  next[active] = "signed"
  const following = next.findIndex((state, index) => index > active && state === "pending")
  if (following >= 0) next[following] = "active"
  return next
}

export function pathFill(states: readonly BeadState[]) {
  if (states.length <= 1) return states[0] === "signed" ? 1 : 0
  const active = states.indexOf("active")
  const signed = states.filter((state) => state === "signed").length
  const reached = active >= 0 ? active : signed
  return clamp(reached / (states.length - 1), 0, 1)
}

export function SignoffBeadPath({
  pace = 1,
  intensity = 0.55,
  showChecks = true,
  count = 4,
  advanceOnEnter = false,
  className,
  onValueChange,
}: SignoffBeadPathProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const total = reviewerCount(count)
  const people = SIGNOFF_REVIEWERS.slice(0, total)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [states, setStates] = useState<BeadState[]>(() => initialBeadStates(total))
  const [selected, setSelected] = useState(1)
  const [breath, setBreath] = useState(0)
  const [seenTotal, setSeenTotal] = useState(total)
  const onValueRef = useRef(onValueChange)
  const pulsing = live && !reduced && states.includes("active")

  if (seenTotal !== total) {
    const next = initialBeadStates(total)
    setSeenTotal(total)
    setStates(next)
    setSelected(Math.min(1, total - 1))
  }

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (!pulsing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((value) => (value + dt * 0.3 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [pulsing, paceRate])

  function emit(nextStates: readonly BeadState[], nextSelected: number) {
    const activeIndex = nextStates.indexOf("active")
    onValueRef.current?.({
      selectedId: people[nextSelected]?.id ?? "",
      activeId: activeIndex >= 0 ? (people[activeIndex]?.id ?? null) : null,
      signed: nextStates.filter((state) => state === "signed").length,
    })
  }

  function select(index: number) {
    const next = ((index % total) + total) % total
    setSelected(next)
    buttonRefs.current[next]?.focus()
    emit(states, next)
  }

  function advance() {
    const next = advanceStates(states)
    const active = next.findIndex((state) => state === "active")
    const nextSelected = active >= 0 ? active : selected
    setStates(next)
    setSelected(nextSelected)
    emit(next, nextSelected)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    const onAdvance = target instanceof Element && Boolean(target.closest("[data-advance]"))
    if (event.key === "ArrowRight" || event.key === "ArrowDown") select(selected + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") select(selected - 1)
    else if (event.key === "Home") select(0)
    else if (event.key === "End") select(total - 1)
    else if (event.key === "Enter" || event.key === " ") {
      if (onAdvance) return
      if (advanceOnEnter) advance()
      else select(selected)
    } else return
    event.preventDefault()
  }

  const person = people[selected]
  const fill = pathFill(states)
  const wave = pulsing ? 0.5 + 0.5 * Math.sin(breath * Math.PI * 2) : 0
  const signedCount = states.filter((state) => state === "signed").length

  return (
    <div
      ref={ref}
      data-slot="signoff-bead-path"
      data-ritual="signoff-bead"
      data-pace={paceRate}
      data-intensity={gain}
      data-checks={showChecks ? "on" : "off"}
      data-count={total}
      data-enter={advanceOnEnter ? "on" : "off"}
      data-selected={String(selected)}
      data-active={people[states.indexOf("active")]?.id ?? "none"}
      data-signed={signedCount}
      data-path={fill.toFixed(2)}
      data-breath={breath.toFixed(2)}
      data-playing={pulsing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Review signoff"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Signoff</p>
        <p className="text-xs text-muted-foreground">
          {signedCount}/{total} signed
        </p>
      </div>
      <div className="relative">
        <div className="absolute top-5 right-5 left-5 h-px bg-border" />
        <div
          data-fill=""
          className="absolute top-5 left-5 h-px origin-left motion-reduce:transition-none"
          style={{
            width: "calc(100% - 2.5rem)",
            transform: `scaleX(${fill})`,
            background: `color-mix(in srgb, var(--primary) ${Math.round(28 + gain * 22)}%, transparent)`,
            transition: reduced ? "none" : `transform ${ms}ms linear`,
          }}
        />
        <div className="relative flex items-start justify-between">
          {people.map((reviewer, index) => {
            const state = states[index] ?? "pending"
            const emphasized = state === "active"
            return (
              <button
                key={reviewer.id}
                ref={(node) => {
                  buttonRefs.current[index] = node
                }}
                type="button"
                data-bead={reviewer.id}
                data-state={state}
                aria-label={`${reviewer.name} ${state}`}
                aria-pressed={index === selected}
                tabIndex={index === selected ? 0 : -1}
                onClick={() => select(index)}
                className="relative z-10 grid size-11 place-items-center rounded-full border bg-background text-[11px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                style={{
                  borderColor:
                    emphasized
                      ? `color-mix(in srgb, var(--primary) ${Math.round(36 + gain * 20)}%, var(--border))`
                      : "var(--border)",
                  boxShadow: emphasized
                    ? `0 0 0 ${1 + wave}px color-mix(in srgb, var(--primary) ${Math.round(14 + gain * 16)}%, transparent)`
                    : undefined,
                  transition: reduced ? "none" : `border-color ${ms}ms linear`,
                }}
              >
                {reviewer.initials}
                {showChecks && state === "signed" ? (
                  <span
                    data-check=""
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-muted text-[9px] text-foreground"
                  >
                    ✓
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p data-status="" className="text-sm text-foreground">
            {person?.name} · {states[selected]}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{person?.note}</p>
        </div>
        <button
          type="button"
          data-advance=""
          disabled={!states.includes("active")}
          onClick={advance}
          className="h-11 shrink-0 rounded-full border border-border bg-background px-3 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        >
          Advance
        </button>
      </div>
    </div>
  )
}
