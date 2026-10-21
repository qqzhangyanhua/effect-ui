"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CountdownTimerProps {
  durationSeconds?: number
  confetti?: boolean
  onComplete?: () => void
  className?: string
  gap?: number
  speed?: number
  duration?: number
  fontSize?: number
}

const CONFETTI = [
  { x: -90, y: -76, rotate: 30, color: "#a78bfa" },
  { x: -50, y: -96, rotate: 80, color: "#22d3ee" },
  { x: -16, y: -70, rotate: 12, color: "#f472b6" },
  { x: 18, y: -100, rotate: 140, color: "#facc15" },
  { x: 54, y: -82, rotate: 60, color: "#34d399" },
  { x: 92, y: -64, rotate: 200, color: "#fb7185" },
  { x: -70, y: -40, rotate: 100, color: "#38bdf8" },
  { x: 70, y: -48, rotate: 16, color: "#c084fc" },
]

function digitsOf(value: number, count: number) {
  const safe = Math.max(0, Math.floor(value))
  return Array.from({ length: count }, (_, index) => {
    const power = 10 ** (count - index - 1)
    return Math.floor(safe / power) % 10
  })
}

function RollDigit({ value, reduced, speed }: { value: number; reduced: boolean; speed?: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.66em] overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        animate={{ y: `${-value}em` }}
        transition={
          reduced
            ? { duration: 0 }
            : speed === undefined || speed === 1
              ? { type: "spring", stiffness: 220, damping: 24 }
              : { type: "spring", stiffness: 220 * speed, damping: 24 }
        }
      >
        {Array.from({ length: 10 }, (_, digit) => (
          <span key={digit} className="flex h-[1em] items-center justify-center">
            {digit}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

function Unit({
  label,
  value,
  places,
  reduced,
  speed,
  fontSize,
}: {
  label: string
  value: number
  places: number
  reduced: boolean
  speed?: number
  fontSize?: number
}) {
  const keepSize = fontSize === undefined || fontSize === 36
  return (
    <div className="min-w-14 text-center">
      <div
        className={
          keepSize
            ? "font-display text-4xl leading-none tracking-tight tabular-nums"
            : "font-display leading-none tracking-tight tabular-nums"
        }
        style={keepSize ? undefined : { fontSize }}
      >
        {digitsOf(value, places).map((digit, index) => (
          <RollDigit key={`${label}-${index}`} value={digit} reduced={reduced} speed={speed} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function CountdownTimer({
  durationSeconds = 86400,
  confetti = false,
  onComplete,
  className,
  gap,
  speed,
  duration,
  fontSize,
}: CountdownTimerProps) {
  const reduced = usePrefersReducedMotion()
  const [remaining, setRemaining] = React.useState(durationSeconds)
  const onCompleteRef = React.useRef(onComplete)

  React.useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  React.useEffect(() => {
    let finished = false
    const started = Date.now()
    const id = window.setInterval(() => {
      const left = Math.max(0, durationSeconds - Math.floor((Date.now() - started) / 1000))
      setRemaining(left)
      if (left === 0) {
        window.clearInterval(id)
        if (!finished) {
          finished = true
          onCompleteRef.current?.()
        }
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [durationSeconds])

  const days = Math.floor(remaining / 86400)
  const hours = Math.floor(remaining / 3600) % 24
  const minutes = Math.floor(remaining / 60) % 60
  const seconds = remaining % 60
  const dayPlaces = days >= 100 ? 3 : 2
  const showConfetti = confetti && remaining === 0 && !reduced

  return (
    <div
      data-slot="countdown-timer"
      className={cn("relative w-full overflow-hidden rounded-xl border bg-background px-4 py-6", className)}
    >
      <div className="sr-only" aria-live="polite">
        剩余 {days} 天 {hours} 小时 {minutes} 分 {seconds} 秒
        {remaining === 0 ? "，计时结束" : ""}
      </div>
      <div
        className={gap === undefined || gap === 16 ? "flex items-start justify-center gap-4" : "flex items-start justify-center"}
        style={gap === undefined || gap === 16 ? undefined : { gap }}
        aria-hidden
      >
        <Unit label="天" value={days} places={dayPlaces} reduced={reduced} speed={speed} fontSize={fontSize} />
        <Unit label="时" value={hours} places={2} reduced={reduced} speed={speed} fontSize={fontSize} />
        <Unit label="分" value={minutes} places={2} reduced={reduced} speed={speed} fontSize={fontSize} />
        <Unit label="秒" value={seconds} places={2} reduced={reduced} speed={speed} fontSize={fontSize} />
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {remaining === 0 ? "计时结束" : "倒计时进行中"}
      </p>
      {showConfetti ? (
        <span className="pointer-events-none absolute inset-x-0 top-1/2">
          {CONFETTI.map((piece) => (
            <motion.span
              key={`${piece.x}-${piece.color}`}
              className="absolute left-1/2 h-2 w-1.5 rounded-sm"
              style={{ background: piece.color }}
              initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
              animate={{ x: piece.x, y: piece.y, opacity: 0, rotate: piece.rotate }}
              transition={
                duration === undefined || duration === 900
                  ? { duration: 0.9, ease: "easeOut" }
                  : { duration: duration / 1000, ease: "easeOut" }
              }
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}

export { CountdownTimer }
