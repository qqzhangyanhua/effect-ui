"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，加载旋转在减弱动效或离开视口时停止，成功和失败颜色改为主题变量。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/morph-button/morph-button.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react"

export type MorphButtonState = "idle" | "loading" | "success" | "error"

export interface MorphButtonProps {
  children: ReactNode
  onAction?: () => Promise<void> | void
  state?: MorphButtonState
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  loadingLabel?: string
  successLabel?: string
  errorLabel?: string
  resetDelay?: number
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  className?: string
}

const SIZES = {
  sm: { button: "h-8 px-3 text-xs", gap: "gap-1.5", icon: 14 },
  md: { button: "h-10 px-4 text-sm", gap: "gap-2", icon: 16 },
  lg: { button: "h-12 px-5 text-base", gap: "gap-2", icon: 18 },
} as const

const STATE_CLASS: Record<MorphButtonState, string> = {
  idle: "bg-foreground text-background",
  loading: "bg-foreground text-background",
  success: "bg-primary text-primary-foreground",
  error: "bg-destructive text-primary-foreground",
}

function Spinner({ size, spin }: { size: number; spin: boolean }) {
  const radius = 10
  const circumference = 2 * Math.PI * radius
  return (
    <motion.svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" animate={spin ? { rotate: 360 } : { rotate: 0 }} transition={spin ? { duration: 0.8, ease: "linear", repeat: Infinity } : { duration: 0 }}>
      <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${circumference * 0.75} ${circumference}`} />
    </motion.svg>
  )
}

function Drawn({ paths, size, instant }: { paths: string[]; size: number; instant: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      {paths.map((d, index) => (
        <motion.path key={d} d={d} initial={{ pathLength: instant ? 1 : 0 }} animate={{ pathLength: 1 }} transition={instant ? { duration: 0 } : { duration: 0.25, delay: index * 0.05 }} />
      ))}
    </svg>
  )
}

export function MorphButton({
  children,
  onAction,
  state: stateProp,
  onClick,
  loadingLabel,
  successLabel = "Done",
  errorLabel = "Failed",
  resetDelay = 1800,
  size = "md",
  disabled = false,
  className,
}: MorphButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [internalState, setInternalState] = useState<MorphButtonState>("idle")
  const mountedRef = useRef(true)
  const isControlled = stateProp !== undefined
  const state = stateProp ?? internalState
  const interactive = state === "idle" && !disabled
  const sizes = SIZES[size]
  const spin = state === "loading" && !prefersReducedMotion && motionOn

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (isControlled) return
    if (internalState !== "success" && internalState !== "error") return
    const timer = window.setTimeout(() => setInternalState("idle"), resetDelay)
    return () => window.clearTimeout(timer)
  }, [internalState, isControlled, resetDelay])

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      if (!interactive) return
      onClick?.(event)
      if (isControlled || !onAction) return
      setInternalState("loading")
      try {
        await onAction()
        if (mountedRef.current) setInternalState("success")
      } catch {
        if (mountedRef.current) setInternalState("error")
      }
    },
    [interactive, isControlled, onAction, onClick],
  )

  const announcement = state === "loading" ? (loadingLabel ?? "Loading") : state === "success" ? successLabel : state === "error" ? errorLabel : ""
  let content: ReactNode = children
  if (state === "loading") {
    content = (
      <>
        <Spinner size={sizes.icon} spin={spin} />
        {loadingLabel ? <span>{loadingLabel}</span> : null}
      </>
    )
  } else if (state === "success") {
    content = (
      <>
        <Drawn paths={["M5 13l4.5 4.5L19 7"]} size={sizes.icon} instant={prefersReducedMotion} />
        <span>{successLabel}</span>
      </>
    )
  } else if (state === "error") {
    content = (
      <>
        <Drawn paths={["M7 7l10 10", "M17 7L7 17"]} size={sizes.icon} instant={prefersReducedMotion} />
        <span>{errorLabel}</span>
      </>
    )
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-motion={spin ? "on" : "off"}
      data-slot="async-morph-button"
      onClick={handleClick}
      disabled={disabled}
      aria-disabled={!interactive || undefined}
      aria-busy={state === "loading" || undefined}
      aria-label={typeof children === "string" ? children : undefined}
      whileTap={interactive && !prefersReducedMotion ? { scale: 0.97 } : undefined}
      animate={state === "error" && !prefersReducedMotion ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
      className={cn(
        "relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        !interactive && "pointer-events-none",
        STATE_CLASS[state],
        sizes.button,
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={state} className={cn("inline-flex items-center justify-center whitespace-nowrap", sizes.gap)} initial={prefersReducedMotion ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}>
          {content}
        </motion.span>
      </AnimatePresence>
      <span aria-live="polite" role="status" className="sr-only">
        {announcement}
      </span>
    </motion.button>
  )
}
