"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，交互标记在渲染阶段更新，减弱动效时不做宽度形变和下沉。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/follow-button/follow-button.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Plus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useState } from "react"

export interface FollowButtonProps {
  following?: boolean
  defaultFollowing?: boolean
  onFollowingChange?: (following: boolean) => void
  followLabel?: string
  followingLabel?: string
  unfollowLabel?: string
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

const SIZES = {
  sm: { button: "h-8 gap-1.5 px-3.5 text-xs", icon: 14 },
  md: { button: "h-10 gap-2 px-4 text-sm", icon: 16 },
  lg: { button: "h-12 gap-2.5 px-5 text-base", icon: 18 },
} as const
const CHECK_PATH = "M20 6 9 17l-5-5"

export function FollowButton({
  following: followingProp,
  defaultFollowing = false,
  onFollowingChange,
  followLabel = "Follow",
  followingLabel = "Following",
  unfollowLabel = "Unfollow",
  size = "md",
  disabled = false,
  className,
}: FollowButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [internalFollowing, setInternalFollowing] = useState(defaultFollowing)
  const [intent, setIntent] = useState(false)
  const [dipping, setDipping] = useState(false)
  const [hasToggled, setHasToggled] = useState(false)
  const following = followingProp ?? internalFollowing
  const unfollowIntent = following && intent
  const label = following ? (unfollowIntent ? unfollowLabel : followingLabel) : followLabel
  const [swap, setSwap] = useState<{ label: string; mode: "roll" | "fade" }>({ label, mode: "fade" })
  if (swap.label !== label) {
    const mode = label === unfollowLabel || swap.label === unfollowLabel ? "fade" : "roll"
    setSwap({ label, mode })
    setHasToggled(true)
  }
  const sizes = SIZES[size]
  const animateLayout = hasToggled && !prefersReducedMotion

  const handleClick = useCallback(() => {
    const next = !following
    if (followingProp === undefined) setInternalFollowing(next)
    onFollowingChange?.(next)
    setHasToggled(true)
    if (!next && !prefersReducedMotion) setDipping(true)
    setIntent(false)
  }, [following, followingProp, onFollowingChange, prefersReducedMotion])

  return (
    <motion.button
      type="button"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="follow-button"
      onClick={handleClick}
      onHoverStart={() => setIntent(true)}
      onHoverEnd={() => setIntent(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setIntent(true)
      }}
      onBlur={() => setIntent(false)}
      disabled={disabled}
      aria-pressed={following}
      aria-label={following ? unfollowLabel : followLabel}
      layout={animateLayout}
      animate={{ scale: dipping && !prefersReducedMotion ? 0.95 : 1 }}
      onAnimationComplete={() => {
        if (dipping) setDipping(false)
      }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.1 }}
      className={cn(
        "relative inline-flex touch-manipulation select-none items-center justify-center rounded-full border font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        following
          ? unfollowIntent
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-border bg-card text-foreground"
          : "border-transparent bg-foreground text-background",
        sizes.button,
        className,
      )}
    >
      <span aria-hidden="true" className="relative inline-flex items-center justify-center" style={{ width: sizes.icon, height: sizes.icon }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {following ? (
            <motion.svg key="check" viewBox="0 0 24 24" width={sizes.icon} height={sizes.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}>
              <motion.path d={CHECK_PATH} initial={prefersReducedMotion || !hasToggled ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.05 }} />
            </motion.svg>
          ) : (
            <motion.span key="plus" className="inline-flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}>
              <Plus size={sizes.icon} strokeWidth={2} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span aria-hidden="true" className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            className="inline-block whitespace-nowrap"
            initial={prefersReducedMotion || swap.mode === "fade" ? { opacity: 0 } : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : swap.mode === "fade" ? { opacity: 0 } : { y: -8, opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: swap.mode === "fade" ? 0.12 : 0.2 }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
