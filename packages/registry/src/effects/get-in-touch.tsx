"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/get-in-touch.tsx
// The dark pill shell is inlined from get-in-touch-button.tsx in the same registry.

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type Phase = "idle" | "start" | "end"

function portrait() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="hsl(24 40% 46%)"/><circle cx="80" cy="62" r="28" fill="white" fill-opacity="0.9"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export interface GetInTouchProps {
  href?: string
  imageSrc?: string
  defaultText?: string
  hoverText?: string
  color?: string
  duration?: number
  size?: number
  intensity?: number
  className?: string
}

export function GetInTouch({
  href = "#contact",
  imageSrc = portrait(),
  defaultText = "GET IN TOUCH",
  hoverText = "Let's Talk!",
  color = "var(--foreground)",
  duration = 460,
  size = 48,
  intensity = 1,
  className,
}: GetInTouchProps) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>("idle")
  const [hovering, setHovering] = useState(false)
  const [focusing, setFocusing] = useState(false)
  const still = reduced || !live
  const travel = 32 * intensity
  const engaged = hovering || focusing

  if (!engaged && phase !== "idle") setPhase("idle")
  else if (engaged && phase === "idle") setPhase(still ? "end" : "start")
  else if (engaged && still && phase === "start") setPhase("end")

  useEffect(() => {
    if (phase !== "start" || still) return
    const id = window.setTimeout(() => setPhase("end"), duration)
    return () => window.clearTimeout(id)
  }, [duration, phase, still])

  const active = phase !== "idle"
  const ended = phase === "end"
  const motionOf = still ? { duration: 0 } : { duration: 0.24, ease: [0.2, 0, 0, 1] as const }

  return (
    <a
      ref={rootRef}
      href={href}
      tabIndex={0}
      aria-label={defaultText}
      data-phase={phase}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovering(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setHovering(false)
      }}
      onFocus={() => setFocusing(true)}
      onBlur={() => setFocusing(false)}
      className={cn(
        "relative isolate inline-flex w-full max-w-48 shrink-0 items-center justify-center overflow-hidden rounded-full p-0 text-[var(--background)] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
      style={{
        height: size,
        background: `linear-gradient(${color}, color-mix(in srgb, ${color} 70%, black))`,
        boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--background) 30%, transparent)",
      }}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
        animate={{ opacity: active ? 0 : 1, y: active ? -28 : 0, filter: active ? "blur(4px)" : "blur(0px)" }}
        transition={motionOf}
      >
        {defaultText}
      </motion.span>
      <motion.span
        aria-hidden="true"
        data-book-layer="active"
        initial={false}
        className="absolute inset-0 flex items-center justify-start pl-2 text-xs font-semibold"
        animate={{ opacity: active ? 1 : 0 }}
        transition={motionOf}
      >
        <motion.span initial={false} className="flex shrink-0 items-center" animate={{ x: ended ? 0 : travel }} transition={motionOf}>
          <motion.span
            className="relative block size-10 overflow-hidden rounded-full"
            initial={false}
            animate={{ opacity: active ? 1 : 0, rotate: active ? 0 : -180, x: active ? 0 : -40 }}
            transition={motionOf}
          >
            <img src={imageSrc} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
          </motion.span>
          <motion.span
            aria-hidden="true"
            className="block overflow-hidden text-center text-base"
            initial={false}
            animate={{
              opacity: active && !ended ? 1 : 0,
              width: active && !ended ? 18 : 0,
              marginLeft: active && !ended ? 8 : 0,
            }}
            transition={motionOf}
          >
            +
          </motion.span>
          <motion.span
            className="relative z-10 flex size-10 items-center justify-center rounded-full bg-[var(--background)] text-[var(--foreground)]"
            initial={false}
            animate={{ opacity: active ? 1 : 0, rotate: active ? 0 : 180, marginLeft: ended ? -12 : 0 }}
            transition={motionOf}
          >
            YOU
          </motion.span>
        </motion.span>
        <motion.span
          className="block overflow-hidden text-sm whitespace-nowrap"
          initial={false}
          animate={{ width: ended ? "auto" : 0, marginLeft: ended ? 10 : 0, opacity: ended ? 1 : 0 }}
          transition={motionOf}
        >
          {hoverText}
        </motion.span>
      </motion.span>
    </a>
  )
}

export default GetInTouch
