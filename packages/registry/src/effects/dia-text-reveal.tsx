"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/dia-text-reveal.tsx

import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DiaTextRevealProps {
  text?: string
  duration?: number
  className?: string
}

function DiaTextReveal({ text = "斜向扫过这段文字", duration = 1.2, className }: DiaTextRevealProps) {
  const reduced = usePrefersReducedMotion()
  const letters = Array.from(text)
  const step = letters.length > 1 ? duration / letters.length : 0

  return (
    <span data-slot="dia-text-reveal" className={cn("inline-flex flex-wrap text-4xl font-semibold", className)}>
      {letters.map((letter, index) => {
        const shown = letter === " " ? "\u00a0" : letter
        if (reduced) {
          return (
            <span key={`${letter}-${index}`} className="text-foreground">
              {shown}
            </span>
          )
        }
        return (
          <motion.span
            key={`${letter}-${index}`}
            className="inline-block bg-[linear-gradient(135deg,var(--foreground)_42%,transparent_68%)] bg-size-[220%_220%] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: "0.35em", backgroundPosition: "100% 100%" }}
            animate={{ opacity: 1, y: 0, backgroundPosition: "0% 0%" }}
            transition={{ duration: 0.45, delay: index * step, ease: "easeOut" }}
          >
            {shown}
          </motion.span>
        )
      })}
    </span>
  )
}

export { DiaTextReveal }
