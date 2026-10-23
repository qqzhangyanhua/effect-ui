"use client"

// Ported from interior (MIT, (c) 2026 ozzy) — https://github.com/ddoemonn/interior/blob/main/components/interior/typing-indicator.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const SEND_MS = 340

export interface TypingIndicatorProps {
  typists?: string[]
  sending?: boolean
  max?: number
  /** Bubble height, in pixels. */
  size?: number
  showLabel?: boolean
  announceAfter?: number
  className?: string
}

function describe(names: string[], max: number) {
  if (names.length === 0) return ""
  const head = names.slice(0, Math.max(1, max))
  const rest = names.length - head.length
  if (rest > 0) return `${head.join(", ")} and ${rest} ${rest === 1 ? "other" : "others"} are typing`
  if (head.length === 1) return `${head[0]} is typing`
  return `${head.slice(0, -1).join(", ")} and ${head[head.length - 1]} are typing`
}

function Dot({ index, wave, size }: { index: number; wave: MotionValue<number>; size: number }) {
  const lift = useTransform(wave, (w) => {
    let distance = (w - index) % 3
    if (distance < 0) distance += 3
    if (distance > 1.5) distance -= 3
    return Math.max(0, 1 - Math.abs(distance))
  })
  const scale = useTransform(lift, [0, 1], [0.74, 1])
  const opacity = useTransform(lift, [0, 1], [0.32, 1])
  return <motion.span className="block rounded-full bg-muted-foreground" style={{ width: size, height: size, scale, opacity }} />
}

export function TypingIndicator({
  typists = [],
  sending = false,
  max = 2,
  size = 34,
  showLabel = true,
  announceAfter = 700,
  className = "",
}: TypingIndicatorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const still = prefersReduced || !live
  const label = useMemo(() => describe(typists, max), [typists, max])
  const active = typists.length > 0
  const wave = useMotionValue(0)
  const [announced, setAnnounced] = useState(label)

  useEffect(() => {
    if (!active || still) {
      wave.jump(0)
      return
    }
    const controls = animate(wave, 3, { duration: 1.25, ease: "linear", repeat: Infinity, repeatType: "loop" })
    return () => controls.stop()
  }, [active, still, wave])

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(label), announceAfter)
    return () => clearTimeout(timer)
  }, [label, announceAfter])

  const width = Math.round(size * 2)
  const dot = Math.round(size * 0.23)
  const gap = Math.round(size * 0.15)
  const radius = Math.round(size * 0.47)

  return (
    <div
      ref={rootRef}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      className={`inline-flex max-w-full items-end gap-3 motion-reduce:transition-none ${className}`}
      style={{ height: size }}
    >
      <div className="relative shrink-0" style={{ width, height: size }}>
        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key="bubble"
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-muted"
              style={{ borderRadius: radius, gap }}
              initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.74 }}
              animate={sending && !still ? { opacity: 0, scale: 0.45 } : { opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
            >
              {[0, 1, 2].map((index) =>
                still ? (
                  <span key={index} className="block rounded-full bg-muted-foreground opacity-80" style={{ width: dot, height: dot }} />
                ) : (
                  <Dot key={index} index={index} wave={wave} size={dot} />
                ),
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {showLabel ? (
        <span className="grid min-w-0 flex-1" style={{ height: size * 0.6 }}>
          <AnimatePresence initial={false}>
            {label && !sending ? (
              <motion.span
                key={label}
                aria-hidden
                className="col-start-1 row-start-1 self-center truncate text-[13px] text-muted-foreground"
                initial={still ? { opacity: 0 } : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 34 }}
              >
                {label}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      ) : null}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </span>
    </div>
  )
}

export function useTypingPresence({ timeout = 3000, minVisible = 900 }: { timeout?: number; minVisible?: number } = {}) {
  const [typists, setTypists] = useState<string[]>([])
  const [sending, setSending] = useState(false)
  const seen = useRef(new Map<string, number>())
  const shown = useRef<string[]>([])
  const shownAt = useRef(0)
  const sweep = useRef<ReturnType<typeof setTimeout> | null>(null)
  const release = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settle = useRef<(bump: boolean) => void>(() => {})

  const commit = useCallback(
    (bump: boolean) => {
      const now = Date.now()
      for (const [name, at] of seen.current) {
        if (at + timeout <= now) seen.current.delete(name)
      }
      let next = Infinity
      for (const at of seen.current.values()) next = Math.min(next, at + timeout)
      let roster = Array.from(seen.current.keys())
      if (roster.length === 0 && shown.current.length > 0 && shownAt.current + minVisible > now) {
        roster = shown.current
        next = Math.min(next, shownAt.current + minVisible)
      }
      const changed = roster.length !== shown.current.length || roster.some((name, index) => name !== shown.current[index])
      if (changed) {
        if (shown.current.length === 0) shownAt.current = now
        shown.current = roster
        setTypists(roster)
      } else if (bump) {
        setTypists((current) => current)
      }
      if (sweep.current) clearTimeout(sweep.current)
      sweep.current = next === Infinity ? null : setTimeout(() => settle.current(false), Math.max(24, next - now))
    },
    [minVisible, timeout],
  )

  useEffect(() => {
    settle.current = commit
  }, [commit])

  useEffect(() => {
    return () => {
      if (sweep.current) clearTimeout(sweep.current)
      if (release.current) clearTimeout(release.current)
    }
  }, [])

  const ping = useCallback(
    (name: string) => {
      if (release.current) {
        clearTimeout(release.current)
        release.current = null
        setSending(false)
        shown.current = []
      }
      seen.current.set(name, Date.now())
      commit(true)
    },
    [commit],
  )

  const clear = useCallback(
    (name: string) => {
      if (!seen.current.delete(name)) return
      commit(false)
    },
    [commit],
  )

  const send = useCallback((name: string) => {
    if (!seen.current.has(name) && !shown.current.includes(name)) return
    seen.current.delete(name)
    if (sweep.current) clearTimeout(sweep.current)
    setSending(true)
    if (release.current) clearTimeout(release.current)
    release.current = setTimeout(() => {
      release.current = null
      setSending(false)
      shown.current = []
      setTypists([])
      if (seen.current.size > 0) settle.current(false)
    }, SEND_MS)
  }, [])

  return { typists, sending, ping, send, clear }
}
