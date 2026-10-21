"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/smooth-cursor.tsx

import * as React from "react"
import { motion, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface SmoothCursorProps {
  className?: string
}

const FINE_POINTER = "(hover: hover) and (pointer: fine)"

function useFinePointer() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(FINE_POINTER)
      media.addEventListener("change", onStoreChange)
      return () => media.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  )
}

function ArrowCursor() {
  return (
    <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden>
      <path
        d="M4 2.5 24.5 16.2 13.2 17.6 17.8 29.2 12.6 31.4 8.1 19.6 4 24.2Z"
        fill="currentColor"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SmoothCursor({ className }: SmoothCursorProps) {
  const reduced = usePrefersReducedMotion()
  const fine = useFinePointer()
  const enabled = fine && !reduced
  const x = useSpring(0, { stiffness: 400, damping: 45, mass: 0.6 })
  const y = useSpring(0, { stiffness: 400, damping: 45, mass: 0.6 })
  const rotate = useSpring(0, { stiffness: 300, damping: 28 })
  const scaleX = useSpring(1, { stiffness: 500, damping: 32 })
  const scaleY = useSpring(1, { stiffness: 500, damping: 32 })
  const last = React.useRef({ x: 0, y: 0, t: 0, angle: 0 })
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    if (!enabled) return
    const previous = document.body.style.cursor
    document.body.style.cursor = "none"
    let reset = 0
    let frame = 0

    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const now = event.timeStamp
        const dx = event.clientX - last.current.x
        const dy = event.clientY - last.current.y
        const dt = Math.max(16, now - last.current.t)
        const speed = Math.hypot(dx, dy) / dt
        x.set(event.clientX)
        y.set(event.clientY)
        if (speed > 0.05) {
          const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
          let delta = angle - last.current.angle
          if (delta > 180) delta -= 360
          if (delta < -180) delta += 360
          rotate.set(last.current.angle + delta)
          last.current.angle += delta
          const squash = Math.min(0.42, speed * 1.1)
          scaleX.set(1 + squash)
          scaleY.set(Math.max(0.55, 1 - squash))
          window.clearTimeout(reset)
          reset = window.setTimeout(() => {
            scaleX.set(1)
            scaleY.set(1)
          }, 140)
        }
        last.current.x = event.clientX
        last.current.y = event.clientY
        last.current.t = now
        setShown(true)
      })
    }

    window.addEventListener("pointermove", move, { passive: true })
    return () => {
      document.body.style.cursor = previous
      window.removeEventListener("pointermove", move)
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(reset)
    }
  }, [enabled, rotate, scaleX, scaleY, x, y])

  if (!enabled) return null

  return (
    <motion.div
      data-slot="smooth-cursor"
      aria-hidden
      className={className}
      style={{
        position: "fixed",
        left: x,
        top: y,
        zIndex: 80,
        pointerEvents: "none",
        x: "-20%",
        y: "-10%",
        rotate,
        scaleX,
        scaleY,
        opacity: shown ? 1 : 0,
        color: "var(--foreground)",
      }}
    >
      <ArrowCursor />
    </motion.div>
  )
}

export { SmoothCursor }
