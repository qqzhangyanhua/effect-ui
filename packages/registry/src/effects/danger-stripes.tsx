"use client"

// Ported from AI Canvas (MIT, (c) 2026 AI Canvas) — https://github.com/uiNerd16/aicanvas/blob/main/components-workspace/danger-stripes/index.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { useCallback, useEffect, useRef } from "react"
import { motion } from "motion/react"

export type DangerStripesTrigger = "mount" | "hover" | "inView"

const STRIPE_TEXT = 'WORK IN PROGRESS \u00A0\u2715\u00A0 DO NOT CLICK OR HOVER \u00A0\u2715\u00A0 DANGER'

const STRIPES = [
  { rotate: -20, top: '40%', bg: '#0a0a0a', fg: '#ffffff' },
  { rotate: 12, top: '47%', bg: '#ffffff', fg: '#0a0a0a' },
  { rotate: -8, top: '54%', bg: '#2a2a2a', fg: '#ffffff' },
]

function RepeatingText({ color, accent }: { color: string; accent: string }) {
  return (
    <div className="flex items-center whitespace-nowrap text-sm font-black tracking-widest uppercase sm:text-base">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ color }}>
          {STRIPE_TEXT.split('\u2715').map((chunk, j, arr) => (
            <span key={j}>
              {chunk}
              {j < arr.length - 1 && (
                <span style={{ color: accent, fontSize: '1.4em' }}>{'\u2715'}</span>
              )}
            </span>
          ))}
          {'\u00A0'}
          <span style={{ color: accent, fontSize: "1.4em" }}>{"\u2715"}</span>
          {'\u00A0 '}
        </span>
      ))}
    </div>
  )
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export interface DangerStripesProps {
  /** Stripe field and cross color. Defaults to the primary token. */
  color?: string
  /** How far the stripes shove while disturbed. @default 1 */
  intensity?: number
  /** How quickly the disturbance catches its target. @default 1 */
  speed?: number
  /** When the disturbance runs. @default "hover" */
  trigger?: DangerStripesTrigger
  className?: string
}

export function DangerStripes({
  color = "var(--primary)",
  intensity = 1,
  speed = 1,
  trigger = "hover",
  className = "",
}: DangerStripesProps = {}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const rafRef = useRef<number>(0)
  const hoveringRef = useRef(false)
  const clickedRef = useRef(false)
  const intensityRef = useRef(0)
  const stripesRef = useRef<(HTMLDivElement | null)[]>([])
  const gainRef = useRef(intensity)
  const speedRef = useRef(speed)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  useEffect(() => {
    gainRef.current = intensity
    speedRef.current = speed
    liveRef.current = live
    reducedRef.current = reduced
  }, [intensity, speed, live, reduced])

  const frameRef = useRef<() => void>(() => {})
  useEffect(() => {
    frameRef.current = () => {
      if (reducedRef.current || !liveRef.current) {
        intensityRef.current = 0
        stripesRef.current.forEach((el, idx) => {
          const stripe = STRIPES[idx]
          if (el && stripe) el.style.transform = `rotate(${stripe.rotate}deg)`
        })
        rafRef.current = 0
        return
      }
      if (hoveringRef.current || clickedRef.current) {
        const target = (clickedRef.current ? 3 : 1) * gainRef.current
        intensityRef.current += (target - intensityRef.current) * 0.15 * speedRef.current
      } else {
        intensityRef.current *= 0.92
      }

      if (intensityRef.current < 0.005 && !hoveringRef.current && !clickedRef.current) {
        intensityRef.current = 0
        stripesRef.current.forEach((el, idx) => {
          const stripe = STRIPES[idx]
          if (el && stripe) el.style.transform = `rotate(${stripe.rotate}deg)`
        })
        rafRef.current = 0
        return
      }

      const shoveAmount = intensityRef.current

      stripesRef.current.forEach((el, idx) => {
        const stripe = STRIPES[idx]
        if (!el || !stripe) return
        const base = stripe.rotate
        const shove = shoveAmount * speedRef.current
        const tx = random(-18, 18) * shove
        const ty = random(-10, 10) * shove
        const skewX = random(-6, 6) * shove
        const sc = 1 + random(-0.04, 0.04) * shove
        el.style.transform = `rotate(${base}deg) translate(${tx}px, ${ty}px) skewX(${skewX}deg) scale(${sc})`
      })

      rafRef.current = requestAnimationFrame(() => frameRef.current())
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const startLoop = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => frameRef.current())
  }, [])

  const triggerHover = useCallback(() => {
    hoveringRef.current = true
    startLoop()
  }, [startLoop])

  const triggerClick = useCallback(() => {
    clickedRef.current = true
    startLoop()
    setTimeout(() => {
      clickedRef.current = false
    }, 500)
  }, [startLoop])

  const triggerLeave = useCallback(() => {
    hoveringRef.current = false
  }, [])

  useEffect(() => {
    if (reduced) return
    const armed = trigger === "mount" || (trigger === "inView" && live)
    hoveringRef.current = armed
    if (armed && live) startLoop()
    if (!armed && trigger !== "hover") hoveringRef.current = false
  }, [trigger, live, reduced, startLoop])

  return (
    <div
      ref={rootRef}
      data-reduced={reduced ? "true" : "false"}
      data-motion={live && !reduced ? "on" : "off"}
      className={`motion-reduce:transition-none flex min-h-80 w-full items-stretch justify-center ${className}`}
      style={{ background: color }}
    >
      <div className="relative w-full overflow-hidden select-none">
        {STRIPES.map((stripe, i) => (
          <motion.div
            key={i}
            ref={(el) => { stripesRef.current[i] = el }}
            className="absolute left-[-40%] flex h-[60px] w-[180%] items-center overflow-hidden sm:h-[72px]"
            style={{
              top: stripe.top,
              background: stripe.bg,
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3)',
              willChange: 'transform',
              cursor: 'pointer',
            }}
            initial={{ x: i % 2 === 0 ? -300 : 300, opacity: 0, rotate: stripe.rotate }}
            animate={{ x: 0, opacity: 1, rotate: stripe.rotate }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: 'easeOut',
            }}
            onPointerEnter={(event) => {
              if (trigger !== "hover") return
              if (event.pointerType === "touch") return
              triggerHover()
            }}
            onPointerLeave={() => {
              if (trigger !== "hover") return
              triggerLeave()
            }}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse" && trigger === "hover") triggerClick()
              if (event.pointerType !== "mouse") {
                triggerHover()
                triggerClick()
              }
            }}
            onPointerUp={(event) => {
              if (event.pointerType === "mouse") return
              window.setTimeout(triggerLeave, 600)
            }}
          >
            <RepeatingText color={stripe.fg} accent={color} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
