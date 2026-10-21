"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/text/text-explode-imessage.tsx

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextExplodeProps {
  children?: string
  className?: string
}

interface Burst {
  x: number
  y: number
  rotate: number
}

function TextExplode({ children = "收到", className }: TextExplodeProps) {
  const text = children
  const chars = Array.from(text)
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)
  const [burst, setBurst] = useState<Burst[] | null>(null)

  useEffect(() => {
    if (reduced || !active) return
    const glyphs = Array.from(text)
    let exploded = false
    const id = window.setInterval(() => {
      exploded = !exploded
      if (!exploded) {
        setBurst(null)
        return
      }
      setBurst(
        glyphs.map(() => ({
          x: (Math.random() - 0.5) * 160,
          y: (Math.random() - 0.5) * 100,
          rotate: (Math.random() - 0.5) * 70,
        })),
      )
    }, 1500)
    return () => window.clearInterval(id)
  }, [active, reduced, text])

  return (
    <div
      ref={wrapRef}
      data-slot="text-explode"
      data-reduced={reduced ? "true" : undefined}
      className={cn("flex min-h-28 w-full items-center justify-center text-3xl font-medium", className)}
      aria-label={text}
    >
      {chars.map((char, index) => {
        const offset = reduced ? undefined : burst?.[index]
        return (
          <motion.span
            key={`${char}-${index}`}
            aria-hidden="true"
            className="inline-block"
            animate={{
              x: offset?.x ?? 0,
              y: offset?.y ?? 0,
              rotate: offset?.rotate ?? 0,
              opacity: offset ? 0.8 : 1,
            }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 14 }}
          >
            {char === " " ? "\u00a0" : char}
          </motion.span>
        )
      })}
    </div>
  )
}

export { TextExplode }
