"use client"

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface LogoFocusDimProps {
  pace?: number
  intensity?: number
  layout?: "row" | "grid"
  count?: number
  hold?: boolean
  className?: string
  onFocusChange?: (index: number) => void
}

const MARKS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 6, 12)
}

function layoutOf(layout: string): "row" | "grid" {
  return layout === "grid" ? "grid" : "row"
}

export function LogoFocusDim({
  pace = 1,
  intensity = 0.55,
  layout = "row",
  count = 8,
  hold = false,
  className,
  onFocusChange,
}: LogoFocusDimProps) {
  const ref = useRef<HTMLDivElement>(null)
  const focusRef = useRef(-1)
  const holdRef = useRef(hold)
  const onFocusRef = useRef(onFocusChange)
  const reduced = usePrefersReducedMotion()
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const mode = layoutOf(layout)
  const marks = MARKS.slice(0, total)
  const ease = reduced ? 0 : Math.round(240 / rate)
  const dim = Math.round((0.16 + (1 - gain) * 0.3) * 100) / 100
  const [focus, setFocus] = useState(-1)

  useEffect(() => {
    holdRef.current = hold
    onFocusRef.current = onFocusChange
  }, [hold, onFocusChange])

  function focusAt(next: number) {
    const clamped = next < 0 ? -1 : clamp(next, 0, marks.length - 1)
    if (clamped === focusRef.current) return
    focusRef.current = clamped
    setFocus(clamped)
    onFocusRef.current?.(clamped)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const key = event.key
    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "ArrowDown" && key !== "ArrowUp") return
    event.preventDefault()
    const dir = key === "ArrowRight" || key === "ArrowDown" ? 1 : -1
    const current = focusRef.current
    const next = current < 0 ? (dir > 0 ? 0 : marks.length - 1) : (current + dir + marks.length) % marks.length
    focusAt(next)
    ref.current?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus()
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return
    if (holdRef.current) return
    const active = document.activeElement
    if (active instanceof HTMLElement && event.currentTarget.contains(active)) active.blur()
    focusAt(-1)
  }

  function onGroupBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    if (!holdRef.current) focusAt(-1)
  }

  return (
    <div
      ref={ref}
      data-slot="logo-focus-dim"
      data-ritual="logo-focus"
      data-marquee="off"
      data-proximity="off"
      data-pace={rate}
      data-intensity={gain}
      data-layout={mode}
      data-count={total}
      data-hold={hold ? "on" : "off"}
      data-focus={focus}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      role="listbox"
      aria-label="合作标志"
      onKeyDown={onKeyDown}
      onPointerLeave={onPointerLeave}
      onBlur={onGroupBlur}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        mode === "grid" ? "grid grid-cols-3 gap-3 sm:grid-cols-4" : "flex flex-wrap items-center gap-3",
        className,
      )}
    >
      {marks.map((letter, index) => {
        const active = focus === index
        const opacity = focus < 0 ? 0.62 : active ? 1 : dim
        const scale = focus < 0 ? 1 : active ? 1 + gain * 0.06 : 1 - gain * 0.03
        return (
          <button
            key={letter}
            type="button"
            role="option"
            aria-selected={active}
            aria-label={`标志 ${letter}`}
            data-index={index}
            data-mark={letter}
            data-opacity={opacity.toFixed(2)}
            data-scale={scale.toFixed(2)}
            data-active={active ? "yes" : "no"}
            tabIndex={0}
            onClick={() => focusAt(index)}
            onFocus={() => focusAt(index)}
            onPointerEnter={(event) => {
              if (event.pointerType === "touch") return
              focusAt(index)
            }}
            className="grid h-16 w-16 place-items-center rounded-2xl border border-border bg-background text-foreground outline-none transition-[opacity,transform] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ opacity, transform: `scale(${scale})`, transitionDuration: `${ease}ms` }}
          >
            <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
              <rect x="7" y="7" width="34" height="34" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <text x="24" y="30" textAnchor="middle" fontSize="16" fill="currentColor">
                {letter}
              </text>
            </svg>
          </button>
        )
      })}
    </div>
  )
}
