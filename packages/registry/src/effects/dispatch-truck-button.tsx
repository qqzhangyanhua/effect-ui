"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/dispatch-truck-button.tsx

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Package, RotateCcw } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DispatchTruckButtonProps {
  label?: string
  successLabel?: string
  errorLabel?: string
  color?: string
  duration?: number
  speed?: number
  intensity?: number
  onOrder?: () => void | Promise<unknown>
  disabled?: boolean
  className?: string
}

type Phase = "idle" | "stretch" | "load" | "wait" | "drive" | "done" | "error"

const WIDTH: Record<Phase, number> = { idle: 184, stretch: 280, load: 280, wait: 280, drive: 280, done: 204, error: 204 }
const VAN_X: Record<Phase, number> = { idle: -100, stretch: -100, load: 38, wait: 38, drive: 300, done: 300, error: -100 }

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function DispatchTruckButton({
  label = "Place order",
  successLabel = "On its way",
  errorLabel = "Try again",
  color = "var(--primary)",
  duration = 2600,
  speed = 1,
  intensity = 1,
  onOrder,
  disabled,
  className,
}: DispatchTruckButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [phase, setPhase] = useState<Phase>("idle")
  const runId = useRef(0)
  const pace = Math.max(0.2, speed)

  useEffect(() => () => {
    runId.current += 1
  }, [])

  const busy = phase !== "idle" && phase !== "error" && phase !== "done"
  const track = phase === "stretch" || phase === "load" || phase === "wait" || phase === "drive"
  const wheels = phase === "load" || phase === "drive"

  const start = async () => {
    if (busy || disabled) return
    const id = ++runId.current
    const alive = () => id === runId.current
    let failed = false
    const order = Promise.resolve()
      .then(() => onOrder?.())
      .catch(() => {
        failed = true
      })

    if (reduced) {
      setPhase("wait")
      await Promise.all([order, wait(500)])
      if (!alive()) return
      setPhase(failed ? "error" : "done")
    } else {
      setPhase("stretch")
      await wait(360 / pace)
      if (!alive()) return
      setPhase("load")
      await wait(900 / pace)
      if (!alive()) return
      setPhase("wait")
      await order
      if (!alive()) return
      if (failed) {
        setPhase("error")
        return
      }
      setPhase("drive")
      await wait(1150 / pace)
      if (!alive()) return
      setPhase("done")
    }
    if (failed || duration <= 0) return
    await wait(duration)
    if (alive()) setPhase("idle")
  }

  const background = phase === "done" ? color : phase === "error" ? "var(--destructive)" : "var(--foreground)"
  const status = phase === "done" ? `${successLabel}. Your order was placed.` : phase === "error" ? "Order failed. Try again." : busy ? "Placing your order…" : ""

  return (
    <div ref={rootRef} className={cn("inline-flex flex-col items-center", className)} data-motion={moving ? "on" : "off"}>
      <motion.button
        type="button"
        onClick={start}
        disabled={disabled}
        aria-busy={busy}
        aria-label={phase === "done" ? successLabel : phase === "error" ? errorLabel : label}
        initial={false}
        animate={{ width: WIDTH[phase], background }}
        whileTap={busy || !moving ? undefined : { scale: 0.97 }}
        transition={{ width: reduced ? { duration: 0.15 } : { type: "spring", stiffness: 320, damping: 28 }, background: { duration: 0.35 } }}
        className={cn(
          "relative h-14 overflow-hidden rounded-full text-[15px] font-semibold text-background outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:animate-none",
          busy && "cursor-progress",
        )}
      >
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-6 bottom-[9px] h-[2px] rounded-full motion-reduce:animate-none"
          animate={{ opacity: track ? 1 : 0, backgroundPositionX: phase === "drive" && moving ? ["0px", "-48px"] : "0px" }}
          transition={{ opacity: { duration: 0.25 }, backgroundPositionX: phase === "drive" && moving ? { duration: 0.35 / pace, ease: "linear", repeat: Infinity } : { duration: 0 } }}
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgb(255 255 255 / 0.35) 0 14px, transparent 14px 24px)" }}
        />
        <AnimatePresence initial={false}>
          {phase === "idle" || phase === "error" ? (
            <motion.span key={phase} className="absolute inset-0 flex items-center justify-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {phase === "error" ? <RotateCcw className="size-4" /> : <Package className="size-[18px] opacity-80" />}
              {phase === "error" ? errorLabel : label}
            </motion.span>
          ) : null}
        </AnimatePresence>
        {!reduced ? (
          <motion.span aria-hidden className="pointer-events-none absolute bottom-[10px] left-0 h-[42px] w-[80px]" animate={{ x: VAN_X[phase] }} transition={phase === "drive" ? { duration: 1.1 / pace, ease: [0.55, 0, 0.8, 0.2] } : phase === "load" ? { type: "spring", stiffness: 170, damping: 19 } : { duration: 0 }}>
            <Courier spinning={wheels && moving} fast={phase === "drive"} color={color} />
            <motion.span className="absolute top-[3px] left-[11px] block h-[18px] w-[23px]" animate={phase === "load" || phase === "wait" || phase === "drive" || phase === "done" ? { y: 0, opacity: 1 } : { y: -64, opacity: 0 }} transition={phase === "load" ? { type: "spring", stiffness: 520, damping: 15, delay: 0.32 / pace } : { duration: 0 }}>
              <Parcel />
            </motion.span>
            {(phase === "wait" || phase === "drive") && moving
              ? [0, 1, 2].map((index) => (
                  <motion.span key={index} className="absolute top-[30px] left-[-4px] block size-[7px] rounded-full bg-background/70" style={{ opacity: intensity }} animate={{ x: -18, y: -8 - index * 2, opacity: [0, 0.55 * intensity, 0] }} transition={{ duration: (phase === "drive" ? 0.5 : 0.9) / pace, repeat: Infinity, delay: index * 0.16 }} />
                ))
              : null}
          </motion.span>
        ) : null}
        {reduced && busy ? <span className="absolute inset-0 flex items-center justify-center text-sm">Placing order…</span> : null}
        <AnimatePresence>
          {phase === "done" ? (
            <motion.span className="absolute inset-0 flex items-center justify-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="grid size-7 place-items-center rounded-full bg-background text-foreground">
                <Check className="size-4" />
              </span>
              {successLabel}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
      <span className="sr-only" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  )
}

function Courier({ spinning, fast, color }: { spinning: boolean; fast: boolean; color: string }) {
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={28} r={5.2} fill="var(--foreground)" />
      <motion.g style={{ transformBox: "fill-box", transformOrigin: "center" }} animate={{ rotate: spinning ? 360 : 0 }} transition={spinning ? { duration: fast ? 0.28 : 0.6, ease: "linear", repeat: Infinity } : { duration: 0 }}>
        <circle cx={cx} cy={28} r={2.6} fill="var(--background)" />
      </motion.g>
    </g>
  )
  return (
    <svg viewBox="0 0 64 34" className="absolute inset-0 h-full w-full overflow-visible">
      <rect x={2} y={17} width={34} height={7} rx={1.6} fill={color} />
      <path d="M34 8.5h13.6a4 4 0 0 1 3.3 1.8l5.9 8.6a4 4 0 0 1 .7 2.2V26a2 2 0 0 1-2 2H34z" fill="var(--background)" />
      <path d="M39.5 11.5h7.6l4.3 6.5h-11.9z" fill="var(--chart-2)" />
      <rect x={1} y={24} width={58} height={3.6} rx={1.8} fill="var(--muted-foreground)" />
      {wheel(13)}
      {wheel(48)}
    </svg>
  )
}

function Parcel() {
  return (
    <svg viewBox="0 0 23 18" className="h-full w-full">
      <rect x={0.5} y={1} width={22} height={17} rx={2} fill="var(--chart-4)" />
      <rect x={9.5} y={1} width={4} height={17} fill="var(--accent)" />
    </svg>
  )
}
