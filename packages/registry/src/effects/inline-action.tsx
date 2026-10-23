"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/inline-action-base.tsx

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, type Transition } from "motion/react"
import { Check } from "lucide-react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface InlineActionProps {
  label: string
  icon: ReactNode
  actionText: string
  onAction: () => Promise<void> | void
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
  className?: string
}

const spring: Transition = { type: "spring", stiffness: 400, damping: 35, mass: 1 }

export function InlineAction({
  label,
  icon,
  actionText,
  onAction,
  color = "var(--primary)",
  duration = 800,
  intensity = 120,
  speed = 1,
  size = 48,
  className,
}: InlineActionProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const sweepName = `inline-action-sweep-${useId().replace(/:/g, "")}`
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const width = status === "success" ? size : intensity
  const sweepMs = Math.max(200, duration / Math.max(speed, 0.1))
  const moving = live && !reduced

  useEffect(() => {
    if (status !== "success" || !live) return
    const timer = setTimeout(() => setStatus("idle"), 2000)
    return () => clearTimeout(timer)
  }, [status, live])

  const trigger = async () => {
    if (status !== "idle") return
    setStatus("loading")
    try {
      await onAction()
      setStatus("success")
    } catch {
      setStatus("idle")
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="inline-action"
      data-status={status}
      data-motion={moving ? "on" : "off"}
      className={`flex w-full items-center justify-center px-4 motion-reduce:transition-none ${className ?? ""}`}
    >
      <style>{`@keyframes ${sweepName}{from{left:0%}to{left:70%}}`}</style>
      <div className="flex w-full max-w-sm items-center justify-between gap-3 overflow-hidden rounded-lg border border-border bg-card p-3 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex shrink-0 items-center justify-center rounded-lg p-2.5 text-primary-foreground" style={{ background: color }}>
            {icon}
          </div>
          <span className="truncate text-[15px] font-bold text-card-foreground sm:text-lg">{label}</span>
        </div>
        <motion.div
          className="relative flex items-center overflow-hidden rounded-lg px-2 text-primary-foreground"
          style={{ background: color, height: size }}
          animate={{ width }}
          transition={reduced ? { duration: 0 } : spring}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {status === "idle" ? (
              <motion.button
                key="idle"
                type="button"
                initial={reduced ? false : { opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                onClick={() => void trigger()}
                className="w-full rounded-lg px-2 text-sm font-bold whitespace-nowrap active:scale-95"
              >
                {actionText}
              </motion.button>
            ) : null}
            {status === "loading" ? (
              <motion.div key="loading" className="w-full px-2" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="relative h-1.5 overflow-hidden rounded-lg bg-primary-foreground/40">
                  <span
                    className="absolute top-0 bottom-0 w-[30%] rounded-lg bg-primary-foreground motion-reduce:animate-none"
                    style={{
                      left: reduced ? "35%" : undefined,
                      animationName: reduced ? undefined : sweepName,
                      animationDuration: `${sweepMs}ms`,
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: "alternate",
                      animationPlayState: moving ? "running" : "paused",
                    }}
                  />
                </div>
              </motion.div>
            ) : null}
            {status === "success" ? (
              <motion.div
                key="success"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full items-center justify-center rounded-lg bg-foreground text-background"
              >
                <Check className="size-6" aria-hidden="true" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
