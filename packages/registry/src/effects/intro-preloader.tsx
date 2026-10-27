"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface IntroPreloaderProps {
  className?: string
  children?: React.ReactNode
  interval?: number
  duration?: number
  delay?: number
  count?: number
  color?: string
}

const STORAGE_KEY = "effect-ui-intro-preloader"
const INTRO_EVENT = "effect-ui-intro"

function IntroPreloader({ className, children, interval, duration, delay, count, color }: IntroPreloaderProps) {
  const reduced = usePrefersReducedMotion()
  const tickMs = interval === undefined || interval === 32 ? 32 : interval
  const panels = count === undefined || count === 5 ? 5 : count
  const curtainMs = duration === undefined || duration === 700 ? 700 : duration
  const staggerMs = delay === undefined || delay === 70 ? 70 : delay
  const [progress, setProgress] = React.useState(0)
  const [phase, setPhase] = React.useState<"count" | "curtains" | "done">("count")
  const seen = React.useSyncExternalStore(
    (onChange) => {
      window.addEventListener(INTRO_EVENT, onChange)
      return () => window.removeEventListener(INTRO_EVENT, onChange)
    },
    () => window.sessionStorage.getItem(STORAGE_KEY) === "1",
    () => false,
  )

  React.useEffect(() => {
    if (reduced || seen) return
    let value = 0
    let timeout = 0
    const timer = window.setInterval(() => {
      value = Math.min(100, value + 4)
      setProgress(value)
      if (value >= 100) {
        window.clearInterval(timer)
        setPhase("curtains")
        timeout = window.setTimeout(() => {
          window.sessionStorage.setItem(STORAGE_KEY, "1")
          window.dispatchEvent(new Event(INTRO_EVENT))
          setPhase("done")
        }, 900)
      }
    }, tickMs)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(timeout)
    }
  }, [reduced, seen, tickMs])

  return (
    <div className={cn("relative min-h-80 overflow-hidden rounded-2xl border bg-zinc-950 text-white", className)}>
      <div className="grid min-h-80 place-items-center p-8">
        {children ?? <p className="font-display text-4xl">页面已经打开</p>}
      </div>
      {!reduced && !(seen && phase !== "curtains") ? (
        <div className="absolute inset-0 z-10">
          <div className="absolute inset-0 flex">
            {Array.from({ length: panels }, (_, index) => (
              <span
                key={index}
                className={color ? "h-full flex-1" : "h-full flex-1 bg-zinc-950"}
                style={{
                  transform: phase === "curtains" ? "translateY(-100%)" : "translateY(0)",
                  transition: reduced ? "none" : `transform ${curtainMs}ms ${index * staggerMs}ms ease`,
                  ...(color ? { backgroundColor: color } : null),
                }}
              />
            ))}
          </div>
          {phase === "count" ? (
            <div className="absolute inset-0 grid place-items-center">
              <p className="font-mono text-6xl tabular-nums">{String(progress).padStart(3, "0")}</p>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="absolute right-3 bottom-3 rounded-full border border-white/20 px-3 py-1 text-xs"
          onClick={() => {
            window.sessionStorage.removeItem(STORAGE_KEY)
            window.dispatchEvent(new Event(INTRO_EVENT))
            setProgress(0)
            setPhase("count")
          }}
        >
          再播一次
        </button>
      )}
    </div>
  )
}

export { IntroPreloader }
