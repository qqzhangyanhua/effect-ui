"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/comic-text.tsx

import { motion } from "motion/react"
import type { CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ComicTextProps {
  children?: string
  fontSize?: number
  className?: string
}

function ComicText({ children = "BOOM", fontSize = 4, className }: ComicTextProps) {
  const reduced = usePrefersReducedMotion()
  const stroke = Math.max(2, fontSize * 1.6)
  const typeface: CSSProperties = {
    fontSize: `${fontSize}rem`,
    fontFamily: '"Comic Sans MS", "Impact", system-ui, sans-serif',
    lineHeight: 1,
  }

  return (
    <span
      className={cn("inline-block", className)}
      style={{ transform: "skewX(-8deg)", filter: "drop-shadow(5px 5px 0 #000) drop-shadow(3px 3px 0 #EF4444)" }}
    >
      <motion.span
        className="relative inline-block select-none text-center font-black uppercase"
        initial={reduced ? false : { opacity: 0, scale: 0.8, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.55, bounce: 0.42 }}
      >
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ ...typeface, zIndex: 0, color: "transparent", WebkitTextFillColor: "transparent", WebkitTextStroke: `${stroke}px #000` }}
        >
          {children}
        </span>
        <span
          data-slot="comic-text"
          data-reduced={reduced ? "true" : "false"}
          className="relative z-[1]"
          style={{ ...typeface, color: "#FACC15" }}
        >
          {children}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            ...typeface,
            color: "transparent",
            backgroundImage: "radial-gradient(circle at 1px 1px, #EF4444 1px, transparent 0)",
            backgroundSize: "8px 8px",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
          }}
        >
          {children}
        </span>
      </motion.span>
    </span>
  )
}

export { ComicText }
