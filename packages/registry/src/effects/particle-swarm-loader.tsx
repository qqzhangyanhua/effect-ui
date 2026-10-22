"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/ParticleSwarmLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useMemo, useRef } from "react"

export interface ParticleSwarmLoaderProps {
  count?: number
  size?: number
  color?: string
  className?: string
}

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  const fraction = value - Math.floor(value)
  return Math.round(fraction * 1e6) / 1e6
}

export function ParticleSwarmLoader({
  count = 50,
  size = 3,
  color = "#fb3a5d",
  className,
}: ParticleSwarmLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const particles = useMemo(() => {
    const total = Math.max(count, 1)
    return Array.from({ length: total }, (_, index) => {
      const angle = (index / total) * Math.PI * 2
      return {
        id: index,
        x: Math.round((unit(index + 1) * 180 - 90) * 1e4) / 1e4,
        y: Math.round((unit(index + 11) * 180 - 90) * 1e4) / 1e4,
        ringX: Math.round(Math.cos(angle) * 62 * 1e4) / 1e4,
        ringY: Math.round(Math.sin(angle) * 62 * 1e4) / 1e4,
        radius: Math.round(size * (0.6 + unit(index + 5) * 0.8) * 1e4) / 1e4,
      }
    })
  }, [count, size])

  return (
    <div
      className={cn("h-40 w-40 overflow-hidden", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="particle-swarm-loader"
      ref={ref}
    >
      <svg aria-hidden="true" className="size-full" viewBox="-100 -100 200 200">
        {particles.map((particle) => (
          <motion.circle
            initial={false}
            animate={
              animate
                ? { opacity: [0.2, 1, 0.2], cx: [particle.x, 0, particle.x], cy: [particle.y, 0, particle.y] }
                : { opacity: 1, cx: particle.ringX, cy: particle.ringY }
            }
            cx={animate ? particle.x : particle.ringX}
            cy={animate ? particle.y : particle.ringY}
            fill={color}
            key={particle.id}
            r={particle.radius}
            transition={
              animate
                ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: (particle.id % 8) * 0.12 }
                : { duration: 0 }
            }
          />
        ))}
      </svg>
    </div>
  )
}
