"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/EcoModeButton.tsx

import { useControllableState } from "@/hooks/use-controllable-state"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Leaf } from "lucide-react"
import { motion } from "motion/react"
import { useRef, type ButtonHTMLAttributes } from "react"

export interface EcoModeButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onToggle"> {
  active?: boolean
  defaultActive?: boolean
  onActiveChange?: (active: boolean) => void
  offLabel?: string
  onLabel?: string
}

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return Math.round((value - Math.floor(value)) * 1e4) / 1e4
}

export function EcoModeButton({
  active,
  defaultActive = false,
  onActiveChange,
  offLabel = "节能关",
  onLabel = "节能开",
  className,
  ...props
}: EcoModeButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const [on, setOn] = useControllableState({
    value: active,
    defaultValue: defaultActive,
    onChange: onActiveChange,
  })

  return (
    <button
      {...props}
      className={cn(
        "relative overflow-hidden rounded-full bg-red-500 px-4 py-3 text-sm font-medium text-white",
        className,
      )}
      data-active={on ? "true" : "false"}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="eco-mode-button"
      onClick={(event) => {
        setOn(!on)
        props.onClick?.(event)
      }}
      ref={ref}
      type="button"
    >
      <motion.span
        animate={{ scaleX: on ? 1 : 0 }}
        className="absolute inset-0 origin-left bg-green-600"
        initial={false}
        transition={{ duration: animate ? 0.5 : 0 }}
      />
      <span className="relative z-10 flex items-center justify-center gap-1">
        <motion.span
          animate={on && animate ? { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
          transition={{ duration: animate ? 0.5 : 0 }}
        >
          <Leaf aria-hidden="true" className="size-4" />
        </motion.span>
        <span>{on ? onLabel : offLabel}</span>
      </span>
      {on && animate
        ? Array.from({ length: 12 }, (_, index) => (
            <motion.span
              animate={{ opacity: [0, 1, 0], y: [0, -16, 0] }}
              className="absolute z-10 size-1 rounded-full bg-green-200"
              initial={false}
              key={index}
              style={{ left: `${8 + unit(index + 1) * 84}%`, top: `${20 + unit(index + 4) * 60}%` }}
              transition={{ duration: 1.4, repeat: Infinity, delay: unit(index + 8) }}
            />
          ))
        : null}
    </button>
  )
}
