"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/RotatingCompleteButton.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Check, ChevronRight } from "lucide-react"
import { motion } from "motion/react"
import { useRef, useState, type ButtonHTMLAttributes } from "react"

type Phase = "idle" | "loading" | "done"

export interface RotatingCompleteButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  idleLabel?: string
  loadingLabel?: string
  doneLabel?: string
  duration?: number
}

export function RotatingCompleteButton({
  idleLabel = "标为完成",
  loadingLabel = "处理中",
  doneLabel = "完成 ✓",
  duration = 700,
  className,
  ...props
}: RotatingCompleteButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>("idle")
  const timer = useRef(0)

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-white",
        phase === "done" ? "bg-green-600" : "bg-red-500",
        className,
      )}
      data-phase={phase}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="rotating-complete-button"
      disabled={phase === "loading" || props.disabled}
      onClick={(event) => {
        if (phase !== "idle") return
        props.onClick?.(event)
        if (prefersReducedMotion || duration <= 0) {
          setPhase("done")
          return
        }
        setPhase("loading")
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setPhase("done"), duration)
      }}
      type="button"
    >
      {phase === "done" ? (
        <span>{doneLabel}</span>
      ) : (
        <span>{phase === "loading" ? loadingLabel : idleLabel}</span>
      )}
      {phase === "done" ? (
        <Check aria-hidden="true" className="size-4" />
      ) : (
        <motion.span
          animate={{ rotate: phase === "loading" ? 180 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </motion.span>
      )}
    </button>
  )
}
