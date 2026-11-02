"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Meetup, Babbel, Portrait, and Uxcel (via Mobbin), original implementation.
 * https://mobbin.com/screens/444f1854-75a5-41b1-94a0-971281d83586
 * https://mobbin.com/flows/dd7f98f6-27a4-4404-9875-8e305893c5fc
 * https://mobbin.com/screens/71b948ad-c39f-45e0-9bd4-998ca0da3317
 * https://mobbin.com/sites/sections/4fb04832-6b0b-45ed-806d-48358b8b442a
 * https://mobbin.com/flows/f36e9eec-bafb-4474-8e4c-57c36c780f5f
 */

export interface WelcomeOfferStageProps {
  pace?: number
  intensity?: number
  emphasis?: number
  scrimOpacity?: number
  className?: string
  onValueChange?: (state: { open: boolean; choice: OfferChoice }) => void
}

export type OfferChoice = "none" | "accept" | "decline" | "dismiss"
export type OfferPhase = "closed" | "opening" | "open" | "closing"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function offerFrames(pace: number) {
  return clamp(Math.round(8 / rateOf(pace)), 4, 20)
}

export function entranceScale(progress: number, intensity: number) {
  const drop = clamp(intensity, 0, 1) * 0.06
  return Math.round((1 - (1 - clamp(progress, 0, 1)) * drop) * 1000) / 1000
}

export function entranceShift(progress: number, intensity: number) {
  return Math.round((1 - clamp(progress, 0, 1)) * clamp(intensity, 0, 1) * 12 * 10) / 10
}

export function offerScrim(progress: number, intensity: number, scrimOpacity: number) {
  const depth = clamp(scrimOpacity, 0, 1) * (0.65 + clamp(intensity, 0, 1) * 0.35)
  return Math.round(clamp(progress, 0, 1) * depth * 1000) / 1000
}

export function ctaMix(emphasis: number) {
  return Math.round((28 + clamp(emphasis, 0, 1) * 72) * 10) / 10
}

function focusable(root: HTMLElement) {
  const nodes = root.querySelectorAll<HTMLElement>(
    "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]",
  )
  return Array.from(nodes).filter((node) => node.tabIndex >= 0)
}

export function WelcomeOfferStage({
  pace = 1,
  intensity = 0.32,
  emphasis = 0.55,
  scrimOpacity = 0.28,
  className,
  onValueChange,
}: WelcomeOfferStageProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const acceptRef = useRef<HTMLButtonElement>(null)
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
  const emphasisGain = clamp(emphasis, 0, 1)
  const scrimGain = clamp(scrimOpacity, 0, 1)
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<OfferPhase>("closed")
  const [choice, setChoice] = useState<OfferChoice>("none")
  const [reads, setReads] = useState(0)
  const scale = entranceScale(progress, gain)
  const shift = entranceShift(progress, gain)
  const alpha = offerScrim(progress, gain, scrimGain)
  const mix = ctaMix(emphasisGain)

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

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (reducedRef.current || !liveRef.current) {
        frameRef.current = 0
        settle(wantRef.current)
        return
      }
      const goal = wantRef.current
      const step = 1 / offerFrames(paceRef.current)
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
    setChoice("none")
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

  function choose(next: OfferChoice) {
    setChoice(next)
    close()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (live && !reduced) return
    stop()
    if (!mountedRef.current && wantRef.current === 0) return
    settle(wantRef.current)
    return () => stop()
  }, [live, reduced, paceRate])

  useEffect(() => {
    if (mounted) {
      if (!armed.current) return
      armed.current = false
      acceptRef.current?.focus()
      return
    }
    if (!restore.current) return
    restore.current = false
    triggerRef.current?.focus()
  }, [mounted])

  useEffect(() => {
    onValueChange?.({ open: mounted, choice })
  }, [mounted, choice, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!mountedRef.current) return
    if (event.key === "Escape") {
      event.preventDefault()
      choose("dismiss")
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

  function onRead(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.currentTarget.closest("[inert]")) return
    setReads((count) => count + 1)
  }

  return (
    <div
      ref={rootRef}
      data-slot="welcome-offer-stage"
      data-ritual="welcome-offer"
      data-open={mounted ? "yes" : "no"}
      data-phase={phase}
      data-choice={choice}
      data-progress={progress.toFixed(3)}
      data-scale={scale.toFixed(3)}
      data-reads={reads}
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
            <h3 className="text-base font-semibold text-foreground">Plan page</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Closing the offer returns this page to the keyboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              ref={triggerRef}
              type="button"
              onClick={open}
              className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
            >
              Open offer
            </button>
            <button
              type="button"
              data-action="read"
              onClick={onRead}
              className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
            >
              Read notes
            </button>
          </div>
        </div>
        {mounted ? (
          <div className="absolute inset-0 z-10 grid place-items-center p-4">
            <div
              data-scrim=""
              data-alpha={alpha.toFixed(3)}
              onClick={() => choose("dismiss")}
              style={{ background: `color-mix(in oklab, var(--foreground) ${Math.round(alpha * 100)}%, transparent)` }}
              className="absolute inset-0"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              style={{ transform: `translateY(${shift}px) scale(${scale})`, opacity: 0.4 + progress * 0.6 }}
              className={cn(
                "relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-sm motion-reduce:transition-none",
                ring,
              )}
            >
              <h3 id={titleId} className="pr-16 text-base font-semibold text-foreground">
                A quieter plan
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">Included for fourteen days.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  ref={acceptRef}
                  type="button"
                  onClick={() => choose("accept")}
                  data-emphasis={emphasisGain.toFixed(2)}
                  style={{
                    background: `color-mix(in oklab, var(--primary) ${mix}%, var(--muted))`,
                    color: emphasisGain > 0.45 ? "var(--primary-foreground)" : "var(--foreground)",
                  }}
                  className={cn("rounded-full px-4 py-2 text-sm font-medium", ring)}
                >
                  Accept offer
                </button>
                <button
                  type="button"
                  onClick={() => choose("decline")}
                  className={cn("rounded-full px-2 py-2 text-sm text-muted-foreground underline-offset-4 hover:underline", ring)}
                >
                  Not now
                </button>
              </div>
              <button
                type="button"
                onClick={() => choose("dismiss")}
                className={cn(
                  "absolute right-3 top-3 rounded-full border border-border px-3 py-1 text-sm text-foreground",
                  ring,
                )}
              >
                Close offer
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
