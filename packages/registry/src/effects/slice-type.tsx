"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/slice-type/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react"
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import type { MotionValue } from "motion/react"








function measureLeftInk(char: string, font: string): number {
  try {
    const W = 200, H = 200
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    ctx.font = font
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#000'
    ctx.fillText(char, 50, 150)
    const { data } = ctx.getImageData(0, 0, W, H)
    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        if ((data[(y * W + x) * 4 + 3] ?? 0) > 32) return x - 50
      }
    }
    return 0
  } catch {
    return 0
  }
}




const OPEN_OFFSET = 0.65


const INTRO_DELAY_MS = 700
const INTRO_HOLD_MS = 1100
const INTRO_PEAK = 0.7

export interface SliceTypeProps {
  /** Upper word. The first letter is the one that splits from the lower word. @default "LIGHT" */
  top?: string
  /** Lower word. @default "NIGHT" */
  bottom?: string
  /** Type size, in pixels. @default 96 */
  fontSize?: number
  /** Intro open and close, in milliseconds. @default 900 */
  duration?: number
  /** Ink. Defaults to the foreground token. */
  color?: string
  className?: string
}

export function SliceType({
  top = "LIGHT",
  bottom = "NIGHT",
  fontSize = 96,
  duration = 900,
  color = "var(--foreground)",
  className = "",
}: SliceTypeProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef as RefObject<Element | null>)

  const engage = useMotionValue(0)
  const engageSmooth = useSpring(engage, { stiffness: 140, damping: 18, mass: 0.9 })

  const topClip = useTransform(engageSmooth, (e) =>
    `inset(0 0 ${50 * (1 - e)}% 0)`,
  )
  const topY = useTransform(engageSmooth, (e) => `${-OPEN_OFFSET * 100 * e}%`)

  const botClip = useTransform(engageSmooth, (e) =>
    `inset(${50 * (1 - e)}% 0 0 0)`,
  )
  const botY = useTransform(engageSmooth, (e) => `${OPEN_OFFSET * 100 * e}%`)

  const containerRef = useRef<HTMLDivElement>(null)
  const lRef = useRef<HTMLSpanElement>(null)
  const ightRef = useRef<HTMLSpanElement>(null)

  const naturalLeftMV: MotionValue<number> = useMotionValue(0)
  const nudgeMV: MotionValue<number> = useMotionValue(0)

  useLayoutEffect(() => {
    const container = containerRef.current
    const lEl = lRef.current
    const ightEl = ightRef.current
    if (!container || !lEl || !ightEl) return
    const measure = () => {
      const cRect = container.getBoundingClientRect()
      const lRect = lEl.getBoundingClientRect()
      const iRect = ightEl.getBoundingClientRect()

      naturalLeftMV.set(Math.max(0, iRect.left - cRect.left - lRect.width))

      const computed = window.getComputedStyle(lEl)
      const font = `900 ${computed.fontSize} ${computed.fontFamily}`
      // 'L' and 'N' must be the first letters of WORD_TOP and WORD_BOTTOM.
      const lInk = measureLeftInk(top.charAt(0) || "L", font)
      const nInk = measureLeftInk(bottom.charAt(0) || "N", font)
      nudgeMV.set(nInk - lInk)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    return () => ro.disconnect()
  }, [naturalLeftMV, nudgeMV, top, bottom])

  const lX = useTransform(
    [engageSmooth, naturalLeftMV, nudgeMV],
    ([e, natural, nudge]) => {
      const eN = e as number
      return `${(nudge as number) * (1 - eN) + (natural as number) * eN}px`
    },
  )

  const didIntro = useRef(false)
  const cancelTeaserRef = useRef<(() => void) | null>(null)
  useEffect(() => {
    if (didIntro.current) return
    if (reducedMotion || !live) return
    didIntro.current = true
    let cancelled = false
    let closeTimer: ReturnType<typeof setTimeout> | null = null

    const startTimer = setTimeout(async () => {
      if (cancelled) return
      const opener = animate(engage, INTRO_PEAK, {
        duration: duration / 1000,
        ease: [0.22, 1, 0.36, 1],
      })
      try {
        await opener
      } catch {
      }
      if (cancelled) return
      closeTimer = setTimeout(() => {
        if (cancelled) return
        animate(engage, 0, {
          duration: duration / 1000,
          ease: [0.32, 0, 0.36, 1],
        })
      }, INTRO_HOLD_MS)
    }, INTRO_DELAY_MS)

    const cancel = () => {
      cancelled = true
      clearTimeout(startTimer)
      if (closeTimer) clearTimeout(closeTimer)
      cancelTeaserRef.current = null
    }
    cancelTeaserRef.current = cancel
    return cancel
  }, [engage, reducedMotion, live, duration])

  const touchOpenRef = useRef(false)

  const cancelTeaser = () => {
    cancelTeaserRef.current?.()
  }

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    cancelTeaser()
    engage.set(1)
  }
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    engage.set(0)
  }
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    cancelTeaser()
    touchOpenRef.current = !touchOpenRef.current
    engage.set(touchOpenRef.current ? 1 : 0)
  }

  const sharedTextStyle: React.CSSProperties = {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontWeight: 900,
    fontSize,
    lineHeight: 0.92,
    letterSpacing: '-0.04em',
    color: 'inherit',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  }

  const TAIL = top.slice(1)

  return (
    <motion.div
      ref={rootRef}
      data-reduced={reducedMotion ? "true" : "false"}
      data-motion={live && !reducedMotion ? "on" : "off"}
      className={`motion-reduce:transition-none flex min-h-64 w-full items-center justify-center overflow-hidden ${className}`}
      style={{ backgroundColor: "var(--background)", color, touchAction: "manipulation", cursor: "pointer" }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={containerRef}
        className="relative"
        aria-label={`${top} / ${bottom}`}
      >
        <span aria-hidden style={{ ...sharedTextStyle, visibility: 'hidden' }}>
          {bottom}
        </span>

        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: topClip,
            WebkitClipPath: topClip,
            y: topY,
            willChange: 'transform, clip-path',
          }}
        >
          <motion.span
            ref={lRef}
            style={{
              ...sharedTextStyle,
              position: 'absolute',
              top: 0,
              left: 0,
              x: lX,
              willChange: 'transform',
            }}
          >
            {top.charAt(0)}
          </motion.span>

          <span
            ref={ightRef}
            style={{
              ...sharedTextStyle,
              position: 'absolute',
              top: 0,
              right: 0,
            }}
          >
            {TAIL}
          </span>
        </motion.div>

        <motion.span
          aria-hidden
          style={{
            ...sharedTextStyle,
            position: 'absolute',
            inset: 0,
            textAlign: 'right',
            clipPath: botClip,
            WebkitClipPath: botClip,
            y: botY,
            willChange: 'transform, clip-path',
          }}
        >
          {bottom}
        </motion.span>
      </div>
    </motion.div>
  )
}
