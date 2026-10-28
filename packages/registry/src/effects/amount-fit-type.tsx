"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface AmountFitTypeProps {
  pace?: number
  intensity?: number
  currency?: string
  maxDigits?: number
  className?: string
  onValueChange?: (value: string) => void
}

const FALLBACK_WIDTH = 280

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function fitSize(length: number, avail: number, max: number, min: number) {
  const needed = Math.max(1, length * max * 0.62)
  return Math.round(clamp(max * (avail / needed), min, max))
}

export function AmountFitType({
  pace = 1,
  intensity = 0.65,
  currency = "$",
  maxDigits = 8,
  className,
  onValueChange,
}: AmountFitTypeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const digitsRef = useRef("")
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const cap = clamp(Math.round(maxDigits), 4, 12)
  const maxSize = Math.round(32 + gain * 56)
  const symbol = currency === "£" || currency === "¥" || currency === "$" ? currency : "$"
  const [digits, setDigits] = useState("")
  const [avail, setAvail] = useState(FALLBACK_WIDTH)
  const [phase, setPhase] = useState<"idle" | "resizing">("idle")
  const shown = digits.length > 0 ? `${symbol}${digits}` : `${symbol}0.00`
  const size = fitSize(shown.length, avail, maxSize, 18)
  const ease = reduced ? 0 : Math.round(220 / rate)
  const visualPhase = phase === "resizing" && !reduced && live ? "resizing" : "idle"

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    const node = boxRef.current
    if (!node) return
    const read = () => {
      const width = node.clientWidth
      if (width > 0) setAvail(width)
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (phase !== "resizing" || reduced || !live) return
    const id = window.requestAnimationFrame(() => setPhase("idle"))
    return () => window.cancelAnimationFrame(id)
  }, [phase, reduced, live])

  function commit(next: string) {
    digitsRef.current = next
    setDigits(next)
    onValueRef.current?.(next)
    setPhase("resizing")
  }

  function append(char: string) {
    if (!/^[0-9]$/.test(char) || digitsRef.current.length >= cap) return
    commit(digitsRef.current + char)
  }

  function backspace() {
    if (digitsRef.current.length === 0) return
    commit(digitsRef.current.slice(0, -1))
  }

  function plus() {
    const current = digitsRef.current.length > 0 ? Number(digitsRef.current) : 0
    if (!Number.isFinite(current)) return
    const next = String(current + 1)
    if (next.length > cap) return
    commit(next)
  }

  function minus() {
    const current = digitsRef.current.length > 0 ? Number(digitsRef.current) : 0
    if (!Number.isFinite(current) || current <= 1) {
      commit("")
      return
    }
    commit(String(current - 1))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault()
      append(event.key)
      return
    }
    if (event.key === "Backspace") {
      event.preventDefault()
      backspace()
    }
  }

  return (
    <div
      ref={ref}
      data-slot="amount-fit-type"
      data-ritual="amount-fit"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-currency={symbol}
      data-max-digits={cap}
      data-digits={digits}
      data-length={shown.length}
      data-avail={avail}
      data-size={size}
      data-max={maxSize}
      data-fit={size < maxSize ? "shrink" : "max"}
      data-ease={ease}
      data-state={visualPhase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        ref={boxRef}
        role="textbox"
        aria-label="金额"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          data-amount
          style={{
            fontSize: size,
            transition: ease === 0 ? "none" : `font-size ${ease}ms ease`,
          }}
          className="font-semibold leading-none text-foreground motion-reduce:transition-none"
        >
          {shown}
        </span>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" aria-label="填入 8" onClick={() => commit("8")} className="rounded-full border border-border px-3 py-1.5 text-sm">
          8
        </button>
        <button type="button" aria-label="填入 88" onClick={() => commit("88")} className="rounded-full border border-border px-3 py-1.5 text-sm">
          88
        </button>
        <button
          type="button"
          aria-label="填入长数字"
          onClick={() => commit("8".repeat(cap))}
          className="rounded-full border border-border px-3 py-1.5 text-sm"
        >
          长
        </button>
        <button type="button" onClick={() => commit("")} className="ml-auto rounded-full border border-border px-3 py-1.5 text-sm">
          清空
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "减少", "0", "增加"].map((key) => (
          <button
            key={key}
            type="button"
            aria-label={key === "减少" ? "减少" : key === "增加" ? "增加" : `数字 ${key}`}
            onClick={() => {
              if (key === "减少") minus()
              else if (key === "增加") plus()
              else append(key)
            }}
            className="rounded-2xl border border-border bg-background py-2 text-sm text-foreground"
          >
            {key === "减少" ? "−" : key === "增加" ? "+" : key}
          </button>
        ))}
      </div>
      <button type="button" onClick={backspace} className="mt-2 w-full rounded-2xl border border-border py-2 text-sm">
        退格
      </button>
    </div>
  )
}
