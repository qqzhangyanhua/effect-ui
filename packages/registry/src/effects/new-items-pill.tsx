"use client"

// Ported from interior (MIT, (c) 2026 ozzy) — https://github.com/ddoemonn/interior/blob/main/components/interior/new-items-pill.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react"

export type NewItemsAnchor = "top" | "bottom"

const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect

export function useNewItems<T extends HTMLElement = HTMLDivElement>({
  itemCount,
  anchor = "top",
  threshold = 24,
}: {
  itemCount: number
  anchor?: NewItemsAnchor
  threshold?: number
}) {
  const ref = useRef<T | null>(null)
  const pinnedRef = useRef(true)
  const layoutCount = useRef(itemCount)
  const bottomGap = useRef(0)
  const unreadRef = useRef(0)
  const [unread, setUnread] = useState(0)
  const [pinned, setPinned] = useState(true)
  const [seenCount, setSeenCount] = useState(itemCount)
  const prefersReduced = usePrefersReducedMotion()
  const added = itemCount - seenCount

  if (added !== 0) {
    setSeenCount(itemCount)
    if (added > 0 && !pinned) setUnread((count) => count + added)
  }

  useEffect(() => {
    unreadRef.current = unread
  }, [unread])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const read = () =>
      anchor === "bottom" ? el.scrollHeight - el.scrollTop - el.clientHeight <= threshold : el.scrollTop <= threshold
    const onScroll = () => {
      bottomGap.current = el.scrollHeight - el.scrollTop
      const next = read()
      pinnedRef.current = next
      setPinned(next)
      if (next) setUnread(0)
    }
    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [anchor, threshold])

  useIsoLayout(() => {
    const delta = itemCount - layoutCount.current
    layoutCount.current = itemCount
    const el = ref.current
    if (!el || delta <= 0) return
    if (pinnedRef.current) {
      el.scrollTop = anchor === "bottom" ? el.scrollHeight : 0
      bottomGap.current = el.scrollHeight - el.scrollTop
      return
    }
    if (anchor === "top") {
      const target = el.scrollHeight - bottomGap.current
      if (target > el.scrollTop) el.scrollTop = target
    }
  }, [itemCount, anchor])

  const jump = useCallback(() => {
    const el = ref.current
    const caught = unreadRef.current
    if (!el) return caught
    pinnedRef.current = true
    setPinned(true)
    setUnread(0)
    el.focus({ preventScroll: true })
    el.scrollTo({ top: anchor === "bottom" ? el.scrollHeight : 0, behavior: prefersReduced ? "auto" : "smooth" })
    return caught
  }, [anchor, prefersReduced])

  const scrollProps: { ref: RefObject<T | null>; tabIndex: number; style: CSSProperties } = {
    ref,
    tabIndex: 0,
    style: { overflowAnchor: "none" },
  }
  return { scrollProps, unread, pinned, jump }
}

export interface NewItemsPillProps {
  count: number
  onJump: () => void
  anchor?: NewItemsAnchor
  label?: (count: number) => string
  max?: number
  className?: string
}

const defaultLabel = (count: number) => `${count} new ${count === 1 ? "item" : "items"}`

export function NewItemsPill({
  count,
  onJump,
  anchor = "top",
  label = defaultLabel,
  max = 99,
  className = "",
}: NewItemsPillProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const still = prefersReduced || !live
  const [announced, setAnnounced] = useState(0)
  const spoken = count > 0 && announced === count ? count : 0

  useEffect(() => {
    if (count === 0) return
    const timer = setTimeout(() => setAnnounced(count), 700)
    return () => clearTimeout(timer)
  }, [count])

  const phrase = (value: number) => (value > max ? `${max}+ new items` : label(value))
  const text = phrase(count)
  const off = anchor === "bottom" ? 10 : -10

  return (
    <div
      ref={rootRef}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      className={`pointer-events-none absolute inset-x-0 z-10 flex justify-center motion-reduce:transition-none ${anchor === "bottom" ? "bottom-2" : "top-2"} ${className}`}
    >
      <AnimatePresence initial={false}>
        {count > 0 ? (
          <motion.button
            type="button"
            onClick={onJump}
            aria-label={text}
            initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: off }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={still ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: off * 0.5 }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 540, damping: 34 }}
            className="pointer-events-auto inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-border bg-background px-2.5 text-[12.5px] font-medium text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="14" height="14" viewBox="0 0 256 256" fill="none" aria-hidden className={anchor === "bottom" ? "rotate-180" : ""}>
              <line x1="128" y1="216" x2="128" y2="48" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
              <polyline points="56 120 128 48 200 120" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="tabular-nums" aria-hidden>
              {text}
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
      <span role="status" aria-live="polite" className="sr-only">
        {spoken > 0 ? phrase(spoken) : ""}
      </span>
    </div>
  )
}
