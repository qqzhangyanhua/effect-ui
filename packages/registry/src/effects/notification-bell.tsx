"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，计数增加时在渲染阶段更新摆动序号，徽章颜色改为主题变量，减弱动效时不摆动、不闪点。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/notification-bell/notification-bell.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { AnimatePresence, motion } from "motion/react"
import { useState, type MouseEventHandler } from "react"

export interface NotificationBellProps {
  count?: number
  max?: number
  dot?: boolean
  ringOnMount?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
}

const SWING = [0, 15, -12, 8, -5, 3, -1.5, 0]
const CLAPPER = [0, -17, 14, -10, 6, -3.5, 2, 0]
const TIMES = [0, 0.1, 0.26, 0.42, 0.58, 0.74, 0.88, 1]
const SIZES = {
  sm: { button: "h-9 w-9", icon: 16 },
  md: { button: "h-11 w-11", icon: 20 },
  lg: { button: "h-[52px] w-[52px]", icon: 24 },
} as const

export function NotificationBell({
  count = 0,
  max = 99,
  dot = false,
  ringOnMount = false,
  onClick,
  size = "md",
  color = "var(--destructive)",
  className,
}: NotificationBellProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [seen, setSeen] = useState({ count, direction: 1 })
  const [ringKey, setRingKey] = useState(ringOnMount ? 1 : 0)
  if (seen.count !== count) {
    if (count > seen.count) setRingKey((key) => key + 1)
    setSeen({ count, direction: count >= seen.count ? 1 : -1 })
  }
  const direction = seen.direction
  const sizes = SIZES[size]
  const display = count > max ? `${max}+` : String(count)
  const swinging = ringKey > 0 && !prefersReducedMotion
  const swing = swinging ? { duration: 0.9, times: TIMES, ease: "easeInOut" as const } : { duration: 0 }
  const label = count > 0 ? `通知，${count} 条未读` : "通知"

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="notification-bell"
      whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
      className={cn(
        "relative inline-flex touch-manipulation select-none items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        sizes.button,
        className,
      )}
    >
      <motion.span
        key={`bell-${ringKey}`}
        className="inline-flex"
        style={{ transformOrigin: "top center" }}
        initial={{ rotate: 0 }}
        animate={swinging ? { rotate: SWING } : { rotate: 0 }}
        transition={swing}
      >
        <svg viewBox="0 0 24 24" width={sizes.icon} height={sizes.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <motion.path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" style={{ transformBox: "fill-box", transformOrigin: "top center" }} initial={{ rotate: 0 }} animate={swinging ? { rotate: CLAPPER } : { rotate: 0 }} transition={swing} />
        </svg>
      </motion.span>
      <AnimatePresence initial={false}>
        {count > 0 ? (
          dot ? (
            <motion.span key="dot" aria-hidden="true" className="absolute right-1 top-1 flex h-2.5 w-2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22 }}>
              {swinging ? (
                <motion.span key={`ping-${ringKey}`} className="absolute inset-0 rounded-full" style={{ backgroundColor: color }} initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 0.9, ease: "easeOut" }} />
              ) : null}
              <span className="relative h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            </motion.span>
          ) : (
            <motion.span key="badge" aria-hidden="true" className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none text-primary-foreground" style={{ backgroundColor: color, transformOrigin: "left bottom" }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22 }}>
              <span className="relative inline-flex overflow-hidden tabular-nums">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={display} initial={prefersReducedMotion ? false : { y: direction * 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: direction * -10, opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}>
                    {display}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.span>
          )
        ) : null}
      </AnimatePresence>
      <span className="sr-only" role="status" aria-live="polite">
        {count > 0 ? `${count} 条未读通知` : ""}
      </span>
    </motion.button>
  )
}
