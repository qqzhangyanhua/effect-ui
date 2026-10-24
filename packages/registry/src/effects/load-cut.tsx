"use client"

// Ported from Keyframery (MIT, (c) 2026 Briyan Hingrajiya) — https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/load-cut.tsx
// Phase machine inlined from registry/lib/keyframery/load.ts. Durations use the pace prop. No data-kf gate and no cut event.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

export interface LoadCutProps {
  loading: boolean
  skeleton: ReactNode
  children?: ReactNode
  hold?: number
  minShow?: number
  pace?: number
  cut?: "dissolve" | "none"
  className?: string
}

type LoadPhase = "content" | "waiting" | "skeleton" | "settling"
type LoadEvent = "loading" | "loaded" | "held" | "shown" | "settled"

const ENTER = "cubic-bezier(0.22, 1, 0.36, 1)"
const EXIT = "cubic-bezier(0.5, 0, 0.75, 0)"

function nextLoadPhase(phase: LoadPhase, event: LoadEvent): LoadPhase {
  switch (event) {
    case "loading":
      return phase === "skeleton" ? "skeleton" : "waiting"
    case "loaded":
      return phase === "waiting" ? "content" : phase
    case "held":
      return phase === "waiting" ? "skeleton" : phase
    case "shown":
      return phase === "skeleton" ? "settling" : phase
    case "settled":
      return phase === "settling" ? "content" : phase
  }
}

function animateTo(el: Element | null | undefined, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (!el || typeof el.animate !== "function") return
  el.animate(keyframes, options)
}

export function LoadCut({ loading, skeleton, children, hold = 300, minShow = 400, pace = 1, cut, className }: LoadCutProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [phase, setPhase] = useState<LoadPhase>(loading ? "waiting" : "content")
  const go = useCallback((event: LoadEvent) => setPhase((current) => nextLoadPhase(current, event)), [])
  const shownAt = useRef(0)
  const lastHeight = useRef<number | null>(null)
  const lastPhase = useRef<LoadPhase>(phase)
  const flags = useRef({ reduced, live, pace, cut })

  const [seenLoading, setSeenLoading] = useState(loading)
  if (seenLoading !== loading) {
    setSeenLoading(loading)
    setPhase((current) => nextLoadPhase(current, loading ? "loading" : "loaded"))
  }
  const [hadContent, setHadContent] = useState(!loading)
  if (phase === "content" && !hadContent) setHadContent(true)

  useEffect(() => {
    flags.current = { reduced, live, pace, cut }
  }, [reduced, live, pace, cut])

  useEffect(() => {
    if (phase !== "waiting") return
    const timer = setTimeout(() => go("held"), Math.max(0, hold))
    return () => clearTimeout(timer)
  }, [phase, hold, go])

  useEffect(() => {
    if (phase !== "skeleton" || loading) return
    const elapsed = performance.now() - shownAt.current
    const timer = setTimeout(() => go("shown"), Math.max(0, minShow - elapsed))
    return () => clearTimeout(timer)
  }, [phase, loading, minShow, go])

  useLayoutEffect(() => {
    const el = ref.current
    const was = lastPhase.current
    lastPhase.current = phase
    if (!el || was === phase) return
    const from = lastHeight.current
    const to = el.getBoundingClientRect().height
    lastHeight.current = to
    const quiet = flags.current.cut === "none" || flags.current.reduced || !flags.current.live
    const ms = (base: number) => (quiet ? 0 : Math.round(base * flags.current.pace))
    if (phase === "skeleton") {
      shownAt.current = performance.now()
      if (!quiet) animateTo(el, [{ opacity: 0 }, { opacity: 1 }], { duration: ms(120), easing: ENTER })
      return
    }
    const resized = (phase === "settling" || (phase === "content" && was === "waiting")) && from !== null && Math.abs(to - from) > 1
    if (resized && !quiet) {
      animateTo(el, [{ height: `${from}px`, overflow: "clip" }, { height: `${to}px`, overflow: "clip" }], { duration: ms(240), easing: ENTER })
    }
    if (phase !== "settling") return
    const dissolve = ms(240)
    if (!quiet) {
      animateTo(el.querySelector("[data-kf-load=skeleton]"), [{ opacity: 1 }, { opacity: 0 }], { duration: dissolve, easing: EXIT, fill: "forwards" })
      animateTo(el.querySelector("[data-kf-load=content]"), [{ opacity: 0 }, { opacity: 1 }], { duration: dissolve, easing: ENTER })
    }
    const timer = setTimeout(() => go("settled"), dissolve)
    return () => clearTimeout(timer)
  }, [phase, go])

  const moving = live && !reduced && cut !== "none"
  const style = { "--kf-pace": pace } as CSSProperties
  const shared = {
    ref,
    "data-slot": "load-cut",
    "data-cut": cut === "none" ? "none" : undefined,
    "data-motion": moving ? "on" : "off",
    "aria-busy": loading || undefined,
    className: cn("motion-reduce:transition-none", className),
    style,
  }
  if (phase === "content") return <div {...shared}>{children}</div>
  if (phase === "waiting") {
    return (
      <div {...shared}>
        {hadContent ? children : (
          <div aria-hidden="true" style={{ visibility: "hidden" }}>
            {skeleton}
          </div>
        )}
      </div>
    )
  }
  if (phase === "skeleton") return <div {...shared}>{skeleton}</div>
  return (
    <div {...shared} style={{ ...style, position: "relative" }}>
      <div data-kf-load="skeleton" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {skeleton}
      </div>
      <div data-kf-load="content">{children}</div>
    </div>
  )
}
