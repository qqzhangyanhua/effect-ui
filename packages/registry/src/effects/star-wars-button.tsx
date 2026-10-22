"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/StarWarsButton.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react"

export interface StarWarsButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode
  starCount?: number
  speed?: number
}

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  const fraction = value - Math.floor(value)
  return Math.round(fraction * 1e6) / 1e6
}

export function StarWarsButton({
  children = "跃迁",
  starCount = 28,
  speed = 1,
  className,
  ...props
}: StarWarsButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [hot, setHot] = useState(false)
  const fly = hot && !prefersReducedMotion && motionOn
  const stars = useMemo(
    () =>
      Array.from({ length: Math.max(starCount, 0) }, (_, index) => ({
        id: index,
        x: Math.round((8 + unit(index + 1) * 84) * 1e4) / 1e4,
        y: Math.round((12 + unit(index + 5) * 76) * 1e4) / 1e4,
        size: Math.round((1 + unit(index + 9) * 2) * 1e4) / 1e4,
      })),
    [starCount],
  )

  return (
    <button
      {...props}
      className={cn(
        "relative overflow-hidden rounded-full border-2 border-yellow-400 bg-black px-8 py-2.5 text-sm font-semibold text-yellow-300 shadow-[0_0_16px_rgba(234,179,8,0.45)] hover:bg-yellow-400/15 hover:text-yellow-100",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="star-wars-button"
      onMouseEnter={(event) => {
        setHot(true)
        props.onMouseEnter?.(event)
      }}
      onMouseLeave={(event) => {
        setHot(false)
        props.onMouseLeave?.(event)
      }}
      ref={ref}
      type="button"
    >
      {stars.map((star) => {
        const outwardX = (star.x - 50) * 1.8 * speed
        const outwardY = (star.y - 50) * 1.4 * speed
        return (
          <motion.span
            animate={fly ? { x: `${outwardX}%`, y: `${outwardY}%`, opacity: [0, 1, 0] } : { opacity: 0 }}
            className="absolute rounded-full bg-white"
            key={star.id}
            style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
            transition={fly ? { duration: 1.1 / speed, repeat: Infinity, ease: "linear", delay: (star.id % 7) * 0.08 } : { duration: 0 }}
          />
        )
      })}
      <motion.span
        animate={fly ? { letterSpacing: "0.12em" } : { letterSpacing: "0em" }}
        className="relative z-10 inline-block"
        transition={fly ? { type: "spring", stiffness: 260, damping: 20 } : { duration: 0 }}
      >
        {children}
      </motion.span>
    </button>
  )
}
