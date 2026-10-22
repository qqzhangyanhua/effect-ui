"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/collab-avatar.tsx. Modified for effect-ui.

import { useRef } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0] ?? ""
  const second = parts[1]
  if (second) return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase()
  return first.slice(0, 2).toUpperCase()
}

export interface CollabAvatarProps {
  name: string
  color: string
  size?: number
  className?: string
}

export function CollabAvatar({ name, color, size = 24, className }: CollabAvatarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const hex = HEX.test(color)
  const background = hex
    ? `linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, transparent 48%), linear-gradient(135deg, ${color}18, ${color}3a)`
    : color
  return (
    <motion.div
      ref={ref}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={name}
      className={cn("relative isolate flex shrink-0 select-none items-center justify-center font-semibold leading-none", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="collab-avatar"
      initial={reduced ? false : { opacity: 0, scale: 0.92 }}
      role="img"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        fontSize: size * 0.38,
        letterSpacing: "-0.03em",
        color: hex ? color : "currentColor",
        background,
        border: hex ? `1px solid ${color}55` : "1px solid var(--border)",
        boxShadow: hex ? `0 0 0 1px ${color}22, 0 1px 2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.28)` : undefined,
      }}
      title={name}
      transition={reduced ? { duration: 0 } : { duration: 0.22, ease: [0.2, 0, 0, 1] }}
    >
      <span aria-hidden className="pointer-events-none translate-y-[0.5px]">
        {initialsFromName(name)}
      </span>
    </motion.div>
  )
}
