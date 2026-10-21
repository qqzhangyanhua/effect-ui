"use client"

import { motion, type HTMLMotionProps } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const

const slideOffset = {
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
  top: { x: 0, y: -36 },
  bottom: { x: 0, y: 36 },
} as const

export type RevealVariant = "fade" | "blur" | "slide" | "clip"
export type RevealFrom = "left" | "right" | "top" | "bottom"

export interface RevealProps extends HTMLMotionProps<"div"> {
  variant?: RevealVariant
  from?: RevealFrom
  delay?: number
  once?: boolean
  blur?: number
  as?: "div" | "section"
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function shift(value: number, intensity: number | undefined) {
  return intensity === undefined || intensity === 1 ? value : value * intensity
}

function revealMotion(variant: RevealVariant, from: RevealFrom, blur: number, intensity: number | undefined) {
  if (variant === "blur") {
    return {
      amount: 0.4,
      duration: 0.55,
      initial: { opacity: 0, y: shift(12, intensity), filter: `blur(${shift(blur, intensity)}px)` },
      whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    }
  }
  if (variant === "slide") {
    const offset = slideOffset[from]
    return {
      amount: 0.35,
      duration: 0.55,
      initial: { opacity: 0, x: shift(offset.x, intensity), y: shift(offset.y, intensity) },
      whileInView: { opacity: 1, x: 0, y: 0 },
    }
  }
  if (variant === "clip") {
    return {
      amount: 0.35,
      duration: 0.65,
      initial: { opacity: 0, y: shift(32, intensity), clipPath: "inset(12% 0 0 0)" },
      whileInView: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
    }
  }
  return {
    amount: 0.4,
    duration: 0.5,
    initial: { opacity: 0, y: shift(16, intensity) },
    whileInView: { opacity: 1, y: 0 },
  }
}

function Reveal({
  className,
  children,
  variant = "fade",
  from = "bottom",
  delay = 0,
  once = true,
  blur = 8,
  as = "div",
  speed,
  intensity,
  ...props
}: RevealProps) {
  const reduce = usePrefersReducedMotion()
  const preset = revealMotion(variant, from, blur, intensity)
  const rate = pace(speed)
  const duration = rate === 1 ? preset.duration : preset.duration / rate
  // 服务端快照会先提交隐藏的 initial。只写 initial: false 清不掉它，内容会停在 opacity 0。
  const settled = { opacity: 1, x: 0, y: 0, filter: "blur(0px)", clipPath: "inset(0% 0 0 0)" }
  const motionProps = reduce
    ? { ...props, initial: settled, animate: settled, transition: { duration: 0 } }
    : {
        initial: preset.initial,
        whileInView: preset.whileInView,
        transition: { duration, delay, ease: REVEAL_EASE },
        ...props,
      }
  const shared = {
    "data-slot": "reveal",
    className: cn(className),
    viewport: { once, amount: preset.amount },
    ...motionProps,
  }

  if (as === "section") {
    return <motion.section {...shared}>{children}</motion.section>
  }
  return <motion.div {...shared}>{children}</motion.div>
}

export { Reveal }
