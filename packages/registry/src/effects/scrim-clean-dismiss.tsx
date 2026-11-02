"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Customer.io, Babbel, Uxcel, and Uniswap (via Mobbin), original implementation.
 * https://mobbin.com/flows/eacec8b2-949b-4072-837a-3e312fb84a24
 * https://mobbin.com/flows/dd7f98f6-27a4-4404-9875-8e305893c5fc
 * https://mobbin.com/flows/f36e9eec-bafb-4474-8e4c-57c36c780f5f
 * https://mobbin.com/flows/6d541f32-a068-4811-ade3-42ef4c4c4263
 */

export interface ScrimCleanDismissProps {
  pace?: number
  intensity?: number
  exitStyle?: ExitStyle
  closeOnScrim?: boolean
  className?: string
  onValueChange?: (state: { open: boolean }) => void
}

export type ExitStyle = "fade" | "scale-out"
export type DismissPhase = "closed" | "opening" | "open" | "closing"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function dismissFrames(pace: number) {
  return clamp(Math.round(8 / rateOf(pace)), 4, 20)
}

export function dismissScrim(progress: number, intensity: number) {
  const depth = 0.14 + clamp(intensity, 0, 1) * 0.36
  return Math.round(clamp(progress, 0, 1) * depth * 1000) / 1000
}

export function exitScale(progress: number, exitStyle: ExitStyle, intensity: number) {
  if (exitStyle !== "scale-out") return 1
  const drop = 0.04 + clamp(intensity, 0, 1) * 0.05
  return Math.round((1 - (1 - clamp(progress, 0, 1)) * drop) * 1000) / 1000
}

function focusable(root: HTMLElement) {
  const nodes = root.querySelectorAll<HTMLElement>(
    "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]",
  )
  return Array.from(nodes).filter((node) => node.tabIndex >= 0)
}

export function ScrimCleanDismiss({
  pace = 1,
  intensity = 0.3,
  exitStyle = "fade",
  closeOnScrim = true,
  className,
  onValueChange,
}: ScrimCleanDismissProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const doneRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef(0)
  const wantRef = useRef(0)
  const progressRef = useRef(0)
  const mountedRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const armed = useRef(false)
  const restore = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const titleId = useId()
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<DismissPhase>("closed")
  const [probes, setProbes] = useState(0)
  const alpha = dismissScrim(progress, gain)
  const scale = exitScale(progress, exitStyle, gain)

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function settle(goal: number) {
    stop()
    wantRef.current = goal
    progressRef.current = goal
    setProgress(goal)
    if (goal === 0) {
      mountedRef.current = false
      setMounted(false)
      setPhase("closed")
      return
    }
    mountedRef.current = true
    setMounted(true)
    setPhase("open")
  }

  function holdOpen() {
    if (!mountedRef.current) return
    wantRef.current = 1
    progressRef.current = 1
    setProgress(1)
    setMounted(true)
    setPhase("open")
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (reducedRef.current) {
        frameRef.current = 0
        settle(wantRef.current)
        return
      }
      if (!liveRef.current) {
        frameRef.current = 0
        holdOpen()
        return
      }
      const goal = wantRef.current
      const step = 1 / dismissFrames(paceRef.current)
      const current = progressRef.current
      let next = current < goal ? Math.min(goal, current + step) : Math.max(goal, current - step)
      if (Math.abs(next - goal) <= step * 0.51) next = goal
      next = Math.round(next * 1000) / 1000
      progressRef.current = next
      setProgress(next)
      if (next === goal) {
        frameRef.current = 0
        if (goal === 0) {
          mountedRef.current = false
          setMounted(false)
          setPhase("closed")
        } else {
          setPhase("open")
        }
        return
      }
      setPhase(goal === 1 ? "opening" : "closing")
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function open() {
    if (wantRef.current === 1 && mountedRef.current) return
    wantRef.current = 1
    armed.current = true
    mountedRef.current = true
    setMounted(true)
    if (reducedRef.current || !liveRef.current) {
      settle(1)
      return
    }
    setPhase("opening")
    kick()
  }

  function close() {
    if (wantRef.current === 0) return
    wantRef.current = 0
    restore.current = true
    if (reducedRef.current || !liveRef.current) {
      settle(0)
      return
    }
    setPhase("closing")
    kick()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (reduced) {
      stop()
      return () => stop()
    }
    if (live) return () => stop()
    stop()
    holdOpen()
    return () => stop()
  }, [live, reduced, paceRate])

  useEffect(() => {
    if (mounted) {
      if (!armed.current) return
      armed.current = false
      doneRef.current?.focus()
      return
    }
    if (!restore.current) return
    restore.current = false
    triggerRef.current?.focus()
  }, [mounted])

  useEffect(() => {
    onValueChange?.({ open: mounted })
  }, [mounted, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!mountedRef.current) return
    if (event.key === "Escape") {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== "Tab") return
    const dialog = event.currentTarget
    const nodes = focusable(dialog)
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault()
      last?.focus()
      return
    }
    if (!event.shiftKey && active === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  function onProbe(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.currentTarget.closest("[inert]")) return
    setProbes((count) => count + 1)
  }

  return (
    <div
      ref={rootRef}
      data-slot="scrim-clean-dismiss"
      data-ritual="scrim-dismiss"
      data-open={mounted ? "yes" : "no"}
      data-phase={phase}
      data-layers={mounted ? "1" : "0"}
      data-exit={exitStyle}
      data-scale={scale.toFixed(3)}
      data-probes={probes}
      data-playing={(phase === "opening" || phase === "closing") && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-96 overflow-hidden">
        <div data-ground="" inert={mounted ? true : undefined} className="flex h-full flex-col justify-between p-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Background page</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">After the notice closes, this page accepts clicks again.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              ref={triggerRef}
              type="button"
              onClick={open}
              className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
            >
              Open notice
            </button>
            <button
              type="button"
              data-action="probe"
              onClick={onProbe}
              className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
            >
              Probe background
            </button>
          </div>
        </div>
        {mounted ? (
          <div className="absolute inset-0 z-10 grid place-items-center p-4">
            <div
              data-scrim=""
              data-alpha={alpha.toFixed(3)}
              onClick={() => {
                if (!closeOnScrim) return
                close()
              }}
              style={{ background: `color-mix(in oklab, var(--foreground) ${Math.round(alpha * 100)}%, transparent)` }}
              className="absolute inset-0"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              style={{ opacity: 0.4 + progress * 0.6, transform: `scale(${scale})` }}
              className={cn(
                "relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm motion-reduce:transition-none",
                ring,
              )}
            >
              <h3 id={titleId} className="text-base font-semibold text-foreground">
                Clean notice
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Closing removes the cover completely.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  ref={doneRef}
                  type="button"
                  onClick={close}
                  className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={close}
                  className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
                >
                  Close notice
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
