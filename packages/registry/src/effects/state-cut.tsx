"use client"

// Ported from Keyframery (MIT, (c) 2026 Briyan Hingrajiya) — https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/state-cut.tsx
// Ghost helpers inlined from registry/lib/keyframery/ghost.ts. No data-kf gate and no cut event.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react"

export interface StateCutProps {
  state: string | number
  children?: ReactNode
  cut?: "fade" | "slide" | "none"
  pace?: number
  className?: string
}

type Snapshot = { clone: HTMLElement; rect: DOMRect }

const ENTER = "cubic-bezier(0.22, 1, 0.36, 1)"
const EXIT = "cubic-bezier(0.5, 0, 0.75, 0)"

function snapshot(el: Element): Snapshot {
  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute("id")
  clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"))
  const slot = clone.getAttribute("data-slot")
  if (slot) clone.setAttribute("data-slot", `${slot}-ghost`)
  clone.setAttribute("data-kf-ghost", "")
  return { clone, rect: el.getBoundingClientRect() }
}

function playGhost(snap: Snapshot, keyframes: Keyframe[], options: KeyframeAnimationOptions, host: HTMLElement): Animation | null {
  const ghost = snap.clone
  if (typeof ghost.animate !== "function") return null
  const box = host.getBoundingClientRect()
  if (getComputedStyle(host).position === "static") {
    host.style.position = "relative"
    host.setAttribute("data-kf-relative", "")
  }
  Object.assign(ghost.style, {
    position: "absolute",
    left: `${snap.rect.left - box.left - host.clientLeft + host.scrollLeft}px`,
    top: `${snap.rect.top - box.top - host.clientTop + host.scrollTop}px`,
    width: `${snap.rect.width}px`,
    height: `${snap.rect.height}px`,
    margin: "0",
    boxSizing: "border-box",
    pointerEvents: "none",
    zIndex: "1",
  })
  ghost.setAttribute("aria-hidden", "true")
  ghost.inert = true
  host.appendChild(ghost)
  const anim = ghost.animate(keyframes, { fill: "forwards", ...options })
  const done = () => {
    ghost.remove()
    if (host.hasAttribute("data-kf-relative") && !host.querySelector(":scope > [data-kf-ghost]")) {
      host.style.removeProperty("position")
      host.removeAttribute("data-kf-relative")
    }
  }
  anim.finished.then(done, done)
  return anim
}

export function StateCut({ state, children, cut = "fade", pace = 1, className }: StateCutProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(hostRef)
  const animations = useRef<Animation[]>([])
  const previous = useRef<{ state: string | number; snap: Snapshot; height: number } | null>(null)
  const flags = useRef({ reduced, live, cut, pace })

  useEffect(() => {
    flags.current = { reduced, live, cut, pace }
  }, [reduced, live, cut, pace])

  useEffect(() => {
    for (const animation of animations.current) {
      if (!live || reduced) animation.pause()
      else animation.play()
    }
  }, [live, reduced])

  useLayoutEffect(() => {
    const host = hostRef.current
    const content = contentRef.current
    if (!host || !content) return
    const prior = previous.current
    const quiet = flags.current.cut === "none" || flags.current.reduced || !flags.current.live
    if (prior && !Object.is(prior.state, state) && !quiet) {
      for (const animation of animations.current) animation.cancel()
      animations.current = []
      const slide = flags.current.cut === "slide"
      const ms = Math.round(260 * flags.current.pace)
      const exitMs = Math.round(180 * flags.current.pace)
      const enter: Keyframe[] = slide
        ? [{ opacity: 0, translate: "0 12px" }, { opacity: 1, translate: "0 0" }]
        : [{ opacity: 0 }, { opacity: 1 }]
      const exit: Keyframe[] = slide
        ? [{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "0 -12px" }]
        : [{ opacity: 1 }, { opacity: 0 }]
      const ghost = playGhost(prior.snap, exit, { duration: exitMs, easing: EXIT }, host)
      if (ghost) animations.current.push(ghost)
      if (typeof content.animate === "function") {
        animations.current.push(content.animate(enter, { duration: ms, easing: ENTER }))
        const height = host.getBoundingClientRect().height
        if (Math.abs(height - prior.height) > 1) {
          animations.current.push(
            host.animate(
              [
                { height: `${prior.height}px`, boxSizing: "border-box", overflow: "clip" },
                { height: `${height}px`, boxSizing: "border-box", overflow: "clip" },
              ],
              { duration: ms, easing: ENTER },
            ),
          )
        }
      }
    }
    previous.current = { state, snap: snapshot(content), height: host.getBoundingClientRect().height }
  }, [state])

  const moving = live && !reduced && cut !== "none"
  const style = { position: "relative", "--kf-pace": pace } as CSSProperties
  return (
    <div
      ref={hostRef}
      data-slot="state-cut"
      data-cut={cut === "none" ? "none" : undefined}
      data-motion={moving ? "on" : "off"}
      className={cn("motion-reduce:transition-none", className)}
      style={style}
    >
      <div ref={contentRef} key={`${typeof state}:${state}`} data-kf-state-content="" style={{ display: "flow-root" }}>
        {children}
      </div>
    </div>
  )
}
