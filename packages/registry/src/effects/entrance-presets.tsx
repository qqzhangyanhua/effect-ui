"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type EntrancePresetName = "grow" | "slide" | "fade" | "spin" | "soft"
export type EntranceFrom = "left" | "right" | "up" | "down"

export interface EntrancePresetsProps {
  preset?: EntrancePresetName
  pace?: number
  intensity?: number
  from?: EntranceFrom
  className?: string
  children?: ReactNode
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function hiddenOf(preset: EntrancePresetName, from: EntranceFrom, intensity: number) {
  const distance = Math.round(28 * intensity)
  const slide = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
  }[from]
  if (preset === "fade") return { opacity: 0, x: 0, y: 0, scale: 1, rotate: 0 }
  if (preset === "grow") return { opacity: 0, x: 0, y: 0, scale: 1 - 0.22 * intensity, rotate: 0 }
  if (preset === "spin") return { opacity: 0, x: 0, y: 0, scale: 1, rotate: -18 * intensity }
  if (preset === "soft") return { opacity: 0, x: 0, y: Math.round(12 * intensity), scale: 0.98, rotate: 0 }
  return { opacity: 0, scale: 1, rotate: 0, ...slide }
}

const rest = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }

export function EntrancePresets({
  preset = "grow",
  pace = 1,
  intensity = 0.7,
  from = "up",
  className,
  children,
}: EntrancePresetsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [played, setPlayed] = useState(false)
  const amp = clamp01(intensity)
  const shown = reduced || played

  useEffect(() => {
    if (reduced) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setPlayed(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setPlayed(true)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced])

  return (
    <motion.div
      ref={ref}
      data-slot="entrance-presets"
      data-preset={preset}
      data-pace={pace}
      data-intensity={intensity}
      data-from={from}
      data-motion={reduced ? "off" : "on"}
      data-state={shown ? "shown" : "waiting"}
      className={cn("motion-reduce:transform-none motion-reduce:opacity-100", className)}
      initial={false}
      animate={shown ? rest : hiddenOf(preset, from, amp)}
      transition={reduced ? { duration: 0 } : { duration: 0.62 / rateOf(pace), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
