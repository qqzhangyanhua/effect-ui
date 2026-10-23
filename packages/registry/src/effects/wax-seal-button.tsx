"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/wax-seal-button.tsx

import { useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Mail, RotateCcw } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WaxSealButtonProps {
  label?: string
  busyLabel?: string
  sealedLabel?: string
  errorLabel?: string
  monogram?: string
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  onSeal?: () => void | Promise<unknown>
  disabled?: boolean
  className?: string
}

type Phase = "idle" | "pouring" | "stamping" | "sealed" | "error"

function blobPath(radius: number, lobes: number, wobble: number, seed: number) {
  const points: [number, number][] = []
  const count = lobes * 2
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2
    const reach =
      radius +
      Math.sin(angle * 3 + seed) * wobble * 0.6 +
      Math.sin(angle * 5 + seed * 2.3) * wobble * 0.4 +
      (index % 2 ? wobble * 0.5 : -wobble * 0.2)
    points.push([22 + Math.cos(angle) * reach, 22 + Math.sin(angle) * reach])
  }
  const first = points[0]
  if (!first) return ""
  let path = `M${first[0].toFixed(2)} ${first[1].toFixed(2)}`
  for (let index = 0; index < count; index += 1) {
    const current = points[index]
    const next = points[(index + 1) % count]
    if (!current || !next) continue
    path += ` Q${current[0].toFixed(2)} ${current[1].toFixed(2)} ${((current[0] + next[0]) / 2).toFixed(2)} ${((current[1] + next[1]) / 2).toFixed(2)}`
  }
  return `${path}Z`
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function WaxSealButton({
  label = "Seal & send",
  busyLabel = "Sealing…",
  sealedLabel = "Sealed & sent",
  errorLabel = "Didn’t send · retry",
  monogram = "M",
  color = "var(--destructive)",
  duration = 2800,
  intensity = 1.8,
  speed = 1,
  onSeal,
  disabled = false,
  className,
}: WaxSealButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [phase, setPhase] = useState<Phase>("idle")
  const runId = useRef(0)
  const uid = useId().replace(/:/g, "")
  const blob = useMemo(() => blobPath(15.5, 11, intensity, 1.3), [intensity])
  const pace = Math.max(0.2, speed)

  useEffect(() => () => {
    runId.current += 1
  }, [])

  const busy = phase === "pouring" || phase === "stamping"
  const waxOn = phase === "pouring" || phase === "stamping" || phase === "sealed"
  const pressed = phase === "stamping" || phase === "sealed"
  const text = phase === "idle" ? label : phase === "sealed" ? sealedLabel : phase === "error" ? errorLabel : busyLabel

  const run = async (event: MouseEvent<HTMLButtonElement>) => {
    if (busy || disabled || event.button !== 0) return
    if (phase === "sealed") {
      setPhase("idle")
      return
    }
    const id = ++runId.current
    const alive = () => id === runId.current
    setPhase("pouring")
    let failed = false
    try {
      await Promise.all([Promise.resolve().then(() => onSeal?.()), wait((reduced ? 150 : 720) / pace)])
    } catch {
      failed = true
    }
    if (!alive()) return
    if (failed) {
      setPhase("error")
      return
    }
    setPhase("stamping")
    await wait((reduced ? 100 : 520) / pace)
    if (!alive()) return
    setPhase("sealed")
    if (duration > 0) {
      await wait(duration)
      if (alive()) setPhase("idle")
    }
  }

  return (
    <div ref={rootRef} className={cn("inline-flex flex-col items-center gap-2", className)} data-motion={moving ? "on" : "off"}>
      <motion.button
        type="button"
        onClick={run}
        disabled={disabled}
        aria-disabled={busy || undefined}
        aria-busy={busy || undefined}
        whileTap={moving && !busy ? { scale: 0.97 } : undefined}
        animate={phase === "error" && moving ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ x: { duration: 0.4 } }}
        className={cn(
          "relative inline-flex h-14 items-center gap-3 rounded-full bg-card pr-6 pl-1.5 text-[15px] font-medium text-foreground shadow-sm ring-1 ring-border outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:animate-none",
        )}
      >
        <span aria-hidden className="relative grid size-11 shrink-0 place-items-center">
          <span className={cn("absolute inset-0 rounded-full border border-dashed border-foreground/25 transition-opacity duration-200 motion-reduce:transition-none", waxOn ? "opacity-0" : "opacity-100")} />
          <AnimatePresence>
            {!waxOn && phase !== "error" ? (
              <motion.span key="mail" className="absolute" initial={{ opacity: 0, scale: reduced ? 1 : 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Mail className="size-[18px]" />
              </motion.span>
            ) : null}
            {phase === "error" ? (
              <motion.span key="err" className="absolute text-destructive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RotateCcw className="size-[18px]" />
              </motion.span>
            ) : null}
          </AnimatePresence>
          <svg viewBox="0 0 44 44" className="absolute -inset-1 size-[52px] overflow-visible">
            <defs>
              <radialGradient id={`${uid}w`} cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor={`color-mix(in oklab, ${color} 70%, white)`} />
                <stop offset="0.45" stopColor={color} />
                <stop offset="1" stopColor={`color-mix(in oklab, ${color} 55%, black)`} />
              </radialGradient>
            </defs>
            <AnimatePresence>
              {phase === "pouring" && moving ? (
                <motion.ellipse key="drop" cx="22" rx="3.2" ry="4.2" fill={`url(#${uid}w)`} initial={{ cy: -14, opacity: 1 }} animate={{ cy: 20, opacity: [1, 1, 0] }} transition={{ duration: 0.32 / pace }} />
              ) : null}
            </AnimatePresence>
            <motion.g initial={false} animate={waxOn ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }} transition={{ duration: reduced ? 0.12 : 0.35 }} style={{ transformOrigin: "22px 22px" }}>
              <path d={blob} fill={`url(#${uid}w)`} />
              <circle cx="22" cy="22" r="11" fill="none" stroke="currentColor" strokeOpacity={pressed ? 0.35 : 0} />
              <text x="22" y="22" textAnchor="middle" dominantBaseline="central" fontSize={monogram.length > 1 ? 9 : 12.5} fill={`color-mix(in oklab, ${color} 40%, black)`}>
                {monogram.slice(0, 2)}
              </text>
            </motion.g>
            <AnimatePresence>
              {phase === "stamping" && moving ? (
                <motion.g key="stamp" initial={{ y: -26, opacity: 0 }} animate={{ y: [-26, 0, -30], opacity: [0, 1, 0] }} transition={{ duration: 0.52 / pace }} style={{ transformOrigin: "22px 22px" }}>
                  <circle cx="22" cy="22" r="13" fill="var(--chart-4)" />
                  <circle cx="22" cy="22" r="9" fill="var(--accent)" opacity="0.7" />
                </motion.g>
              ) : null}
            </AnimatePresence>
          </svg>
        </span>
        <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap">
          {phase === "sealed" ? <Check aria-hidden className="size-4" style={{ color }} /> : null}
          {text}
        </span>
      </motion.button>
      <p role="status" aria-live="polite" className="sr-only">
        {phase === "pouring" ? busyLabel : phase === "sealed" ? sealedLabel : phase === "error" ? errorLabel : ""}
      </p>
    </div>
  )
}
