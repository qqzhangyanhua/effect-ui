"use client"

// Ported from interior (MIT, (c) 2026 ozzy) — https://github.com/ddoemonn/interior/blob/main/components/interior/press-depth.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { motion } from "motion/react"
import { useCallback, useEffect, useRef, useState, type MouseEventHandler, type PointerEvent as ReactPointerEvent, type ReactNode } from "react"

export interface PressDepthProps {
  children?: ReactNode
  /** Face ink. Defaults to the foreground token. */
  color?: string
  /** Press travel, in milliseconds. */
  duration?: number
  /** Button height, in pixels. */
  size?: number
  /** Tilt toward the pointer, in degrees at full deflection. */
  intensity?: number
  /** How far the face sinks, in pixels. */
  depth?: number
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  "aria-label"?: string
}

export function PressDepth({
  children,
  color = "var(--foreground)",
  duration = 180,
  size = 36,
  intensity = 7,
  depth = 4,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  "aria-label": ariaLabel,
}: PressDepthProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const still = prefersReduced || !live
  const [pressed, setPressed] = useState(false)
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)
  const pointerId = useRef<number | null>(null)
  const pressedRef = useRef(false)

  const setDown = useCallback((next: boolean) => {
    if (pressedRef.current === next) return
    pressedRef.current = next
    setPressed(next)
  }, [])

  const stop = useCallback(() => {
    pointerId.current = null
    setOrigin(null)
    setDown(false)
  }, [setDown])

  useEffect(() => {
    if (pointerId.current == null) return
    const contains = (event: PointerEvent) => {
      const el = rootRef.current
      if (!el) return false
      const rect = el.getBoundingClientRect()
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
    }
    const move = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      setDown(contains(event))
    }
    const lift = (event: PointerEvent) => {
      if (event.pointerId !== pointerId.current) return
      stop()
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", lift)
    window.addEventListener("pointercancel", lift)
    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", lift)
      window.removeEventListener("pointercancel", lift)
    }
  }, [pressed, setDown, stop])

  if (disabled && pressed) {
    setPressed(false)
    setOrigin(null)
  }

  useEffect(() => {
    if (!disabled) return
    pointerId.current = null
    pressedRef.current = false
  }, [disabled])

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width || 1
    const height = rect.height || 1
    setOrigin({
      x: Math.max(-1, Math.min(1, ((event.clientX - rect.left) / width) * 2 - 1)),
      y: Math.max(-1, Math.min(1, ((event.clientY - rect.top) / height) * 2 - 1)),
    })
    pointerId.current = event.pointerId
    setDown(true)
  }

  const lean = pressed && origin && !still ? origin : null
  const travel = still ? { duration: 0 } : { duration: duration / 1000, ease: [0.23, 1, 0.32, 1] as const }

  return (
    <button
      ref={rootRef}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      data-pressed={pressed ? "" : undefined}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={(event) => {
        if (disabled || event.repeat) return
        if (event.key === " " || event.key === "Enter") setDown(true)
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter" || event.key === "Escape") setDown(false)
      }}
      onBlur={stop}
      style={{ paddingBottom: depth, touchAction: "manipulation", height: size + depth }}
      className={`group relative inline-flex select-none items-start rounded-[9px] align-middle outline-none motion-reduce:transition-none disabled:opacity-50 ${className}`}
    >
      <span aria-hidden style={{ top: depth }} className="absolute inset-x-0 bottom-0 rounded-[9px] bg-border" />
      <motion.span
        initial={false}
        animate={{
          y: pressed ? depth : 0,
          rotateX: lean ? -lean.y * intensity : 0,
          rotateY: lean ? lean.x * intensity : 0,
        }}
        transition={travel}
        style={{ transformPerspective: 340, color, height: size, background: "var(--background)" }}
        className="relative inline-flex items-center justify-center gap-2 rounded-[9px] border border-border px-3.5 text-[13px] font-medium"
      >
        {children}
      </motion.span>
    </button>
  )
}
