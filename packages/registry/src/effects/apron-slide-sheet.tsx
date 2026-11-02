"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by lululemon, Sweatpals, Etsy, Uniswap, and Oura (via Mobbin), original implementation.
 * https://mobbin.com/screens/983d13a6-8d49-4451-8e68-fbb3c889baab
 * https://mobbin.com/screens/e1980d90-6278-4d78-ab66-6c12e43b1b17
 * https://mobbin.com/screens/3fc9ef9a-9645-4ac2-8435-6d48de04dbeb
 * https://mobbin.com/flows/6d541f32-a068-4811-ade3-42ef4c4c4263
 * https://mobbin.com/sites/sections/b8d418ed-be72-4df5-825d-f7bfa9197fec
 */

export interface ApronSlideSheetProps {
  pace?: number
  intensity?: number
  edge?: ApronEdge
  scrimBlur?: number
  className?: string
  onValueChange?: (state: { open: boolean }) => void
}

export type ApronEdge = "end" | "bottom"
export type ApronPhase = "closed" | "opening" | "open" | "closing"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function sheetFrames(pace: number) {
  return clamp(Math.round(8 / rateOf(pace)), 4, 20)
}

export function slideDistance(intensity: number) {
  return Math.round((10 + clamp(intensity, 0, 1) * 36) * 10) / 10
}

export function slideOffset(progress: number, intensity: number) {
  return Math.round((1 - clamp(progress, 0, 1)) * slideDistance(intensity) * 10) / 10
}

export function scrimAlpha(progress: number, intensity: number) {
  const depth = 0.12 + clamp(intensity, 0, 1) * 0.38
  return Math.round(clamp(progress, 0, 1) * depth * 1000) / 1000
}

export function blurPx(scrimBlur: number, progress: number) {
  return Math.round(clamp(scrimBlur, 0, 6) * clamp(progress, 0, 1) * 10) / 10
}

function focusable(root: HTMLElement) {
  const nodes = root.querySelectorAll<HTMLElement>(
    "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]",
  )
  return Array.from(nodes).filter((node) => node.tabIndex >= 0)
}

export function ApronSlideSheet({
  pace = 1,
  intensity = 0.3,
  edge = "end",
  scrimBlur = 0,
  className,
  onValueChange,
}: ApronSlideSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
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
  const inputId = useId()
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const blurAmount = clamp(scrimBlur, 0, 6)
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<ApronPhase>("closed")
  const [saved, setSaved] = useState(false)
  const [actions, setActions] = useState(0)
  const offset = slideOffset(progress, gain)
  const alpha = scrimAlpha(progress, gain)
  const blur = blurPx(blurAmount, progress)
  const transform = edge === "bottom" ? `translateY(${offset}px)` : `translateX(${offset}px)`

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
      const step = 1 / sheetFrames(paceRef.current)
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
      closeRef.current?.focus()
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

  function onPage(event: ReactMouseEvent<HTMLButtonElement>) {
    if (event.currentTarget.closest("[inert]")) return
    setActions((count) => count + 1)
  }

  return (
    <div
      ref={rootRef}
      data-slot="apron-slide-sheet"
      data-ritual="apron-slide"
      data-open={mounted ? "yes" : "no"}
      data-phase={phase}
      data-edge={edge}
      data-progress={progress.toFixed(3)}
      data-blur={blur.toFixed(1)}
      data-saved={saved ? "yes" : "no"}
      data-actions={actions}
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
            <h3 className="text-base font-semibold text-foreground">Notes page</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">The page stays clickable once the apron is gone.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              ref={triggerRef}
              type="button"
              onClick={open}
              className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
            >
              Open apron
            </button>
            <button
              type="button"
              data-action="page"
              onClick={onPage}
              className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
            >
              Page action
            </button>
          </div>
        </div>
        {mounted ? (
          <div className="absolute inset-0 z-10">
            <div
              data-scrim=""
              data-alpha={alpha.toFixed(3)}
              onClick={close}
              style={{
                background: `color-mix(in oklab, var(--foreground) ${Math.round(alpha * 100)}%, transparent)`,
                backdropFilter: blur > 0 ? `blur(${blur}px)` : undefined,
              }}
              className="absolute inset-0"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onKeyDown={onKeyDown}
              style={{ transform, opacity: 0.35 + progress * 0.65 }}
              className={cn(
                "absolute z-10 flex flex-col gap-3 border border-border bg-card p-4 shadow-sm motion-reduce:transition-none",
                edge === "bottom" ? "inset-x-0 bottom-0 rounded-t-2xl" : "inset-y-0 right-0 w-72 max-w-full rounded-l-2xl",
                ring,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id={titleId} className="text-base font-semibold text-foreground">
                  Side notes
                </h3>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  className={cn("rounded-full border border-border px-3 py-1 text-sm text-foreground", ring)}
                >
                  Close panel
                </button>
              </div>
              <label htmlFor={inputId} className="sr-only">
                Note
              </label>
              <input
                id={inputId}
                type="text"
                placeholder="Write a note"
                className={cn(
                  "rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
                  ring,
                )}
              />
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li className="rounded-xl bg-muted px-3 py-2">First item</li>
                <li className="rounded-xl bg-muted px-3 py-2">Second item</li>
              </ul>
              <button
                type="button"
                onClick={() => setSaved(true)}
                className={cn("mt-auto w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
              >
                Save note
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
