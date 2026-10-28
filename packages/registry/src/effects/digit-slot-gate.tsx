"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DigitSlotGateProps {
  pace?: number
  intensity?: number
  slots?: number
  mask?: boolean
  className?: string
  onValueChange?: (state: { filled: number; status: DigitSlotStatus }) => void
}

export type DigitSlotStatus = "idle" | "filling" | "checking" | "success" | "fail"

const CODES = { 4: "2468", 6: "246810" } as const
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function digitSlotCount(value: number): 4 | 6 {
  return Number.isFinite(value) && value < 5 ? 4 : 6
}

export function digitSlotCode(slots: number) {
  return CODES[digitSlotCount(slots)]
}

export function digitSlotAccepted(value: string, slots: number) {
  return value === digitSlotCode(slots)
}

export function DigitSlotGate({
  pace = 1,
  intensity = 0.7,
  slots = 6,
  mask = true,
  className,
  onValueChange,
}: DigitSlotGateProps) {
  const reduced = usePrefersReducedMotion()
  const onValueRef = useRef(onValueChange)
  const count = digitSlotCount(slots)
  const code = digitSlotCode(count)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(220 / paceRate)
  const [digits, setDigits] = useState("")
  const [status, setStatus] = useState<DigitSlotStatus>("idle")
  const [verdict, setVerdict] = useState<"none" | "success" | "fail">("none")
  const [shake, setShake] = useState(false)
  const [seenCount, setSeenCount] = useState(count)
  const digitsRef = useRef("")
  const statusRef = useRef<DigitSlotStatus>("idle")
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      for (const id of timers) window.clearTimeout(id)
      timers.length = 0
    }
  }, [])

  function emit(filled: number, next: DigitSlotStatus) {
    onValueRef.current?.({ filled, status: next })
  }

  function write(nextDigits: string, nextStatus: DigitSlotStatus, nextShake: boolean) {
    digitsRef.current = nextDigits
    statusRef.current = nextStatus
    setDigits(nextDigits)
    setStatus(nextStatus)
    setShake(nextShake)
  }

  function clearTimers() {
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current.length = 0
  }

  function later(delay: number, run: () => void) {
    const id = window.setTimeout(run, delay)
    timersRef.current.push(id)
  }

  if (seenCount !== count) {
    setSeenCount(count)
    setDigits("")
    setStatus("idle")
    setShake(false)
    setVerdict("none")
  }

  useEffect(() => {
    digitsRef.current = ""
    statusRef.current = "idle"
    for (const id of timersRef.current) window.clearTimeout(id)
    timersRef.current.length = 0
  }, [count])

  function finish(current: string) {
    if (digitSlotAccepted(current, count)) {
      write(current, "success", false)
      setVerdict("success")
      emit(current.length, "success")
      return
    }
    setVerdict("fail")
    if (reduced) {
      write("", "idle", false)
      emit(0, "fail")
      return
    }
    write(current, "fail", true)
    emit(current.length, "fail")
    later(Math.round(460 / paceRate), () => {
      write("", "idle", false)
      emit(0, "idle")
    })
  }

  function arm(current: string) {
    if (reduced) {
      finish(current)
      return
    }
    later(Math.round(280 / paceRate), () => finish(current))
  }

  function pushDigit(digit: string) {
    if (statusRef.current === "checking") return
    const base = statusRef.current === "success" || statusRef.current === "fail" ? "" : digitsRef.current
    if (base.length >= count) return
    const next = `${base}${digit}`
    const nextStatus: DigitSlotStatus = next.length >= count ? "checking" : "filling"
    write(next, nextStatus, false)
    if (nextStatus === "checking") setVerdict("none")
    emit(next.length, nextStatus)
    if (nextStatus === "checking") arm(next)
  }

  function backspace() {
    if (statusRef.current === "checking") return
    if (digitsRef.current.length === 0) return
    const next = digitsRef.current.slice(0, -1)
    const nextStatus: DigitSlotStatus = next.length === 0 ? "idle" : "filling"
    write(next, nextStatus, false)
    emit(next.length, nextStatus)
  }

  function clearAll() {
    if (statusRef.current === "checking") return
    clearTimers()
    write("", "idle", false)
    emit(0, "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault()
      pushDigit(event.key)
      return
    }
    if (event.key === "Backspace") {
      event.preventDefault()
      backspace()
      return
    }
    const atRoot = event.target === event.currentTarget
    if (event.key === "Escape" || (event.key === " " && atRoot)) {
      event.preventDefault()
      clearAll()
    }
  }

  const pop = 1 + gain * 0.16

  return (
    <div
      data-slot="digit-slot-gate"
      data-ritual="digit-slot"
      data-pace={paceRate}
      data-intensity={gain}
      data-slots={count}
      data-mask={mask ? "on" : "off"}
      data-filled={digits.length}
      data-status={status}
      data-verdict={verdict}
      data-shaking={shake ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Enter code</p>
          <p className="text-xs text-muted-foreground">Sample {code}</p>
        </div>
        <p role="status" className="text-xs text-muted-foreground">
          {status === "success" ? "Accepted" : status === "fail" ? "Try again" : status === "checking" ? "Checking" : "Ready"}
        </p>
      </div>
      <motion.div
        data-part="slots"
        animate={shake && !reduced ? { x: [0, -8 - gain * 8, 8 + gain * 8, 0] } : { x: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.42 / paceRate }}
        className="flex justify-center gap-2 motion-reduce:transition-none"
      >
        {Array.from({ length: count }, (_, index) => {
          const glyph = digits[index] ?? ""
          const filled = glyph.length > 0
          const success = status === "success"
          const fail = status === "fail"
          return (
            <motion.span
              key={index}
              data-part="slot"
              data-filled={filled ? "on" : "off"}
              animate={filled && !reduced ? { scale: [0.86, pop, 1] } : { scale: 1 }}
              transition={reduced ? { duration: 0 } : { duration: ms / 1000 }}
              className={cn(
                "grid size-11 place-items-center rounded-full border text-sm font-semibold motion-reduce:transition-none",
                filled ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground",
                success && "ring-2 ring-primary",
                fail && "border-destructive bg-destructive/15 text-destructive",
              )}
            >
              {filled ? (mask ? "•" : glyph) : ""}
            </motion.span>
          )
        })}
      </motion.div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={`Digit ${key}`}
            onClick={() => pushDigit(key)}
            className="h-11 rounded-2xl border border-border bg-muted text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          aria-label="Delete digit"
          onClick={backspace}
          className="h-11 rounded-2xl border border-border bg-background text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Delete
        </button>
        <button
          type="button"
          aria-label="Clear code"
          onClick={clearAll}
          className="h-11 rounded-2xl border border-border bg-background text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
