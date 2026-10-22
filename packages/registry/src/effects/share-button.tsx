"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，减弱动效时动作只淡入淡出，提示文字对无障碍隐藏。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/share-button/share-button.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Check, Link, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"

export interface ShareAction {
  icon: ReactNode
  label: string
  onSelect: () => void
}

export interface ShareButtonProps {
  actions?: ShareAction[]
  copyValue?: string
  direction?: "left" | "right"
  size?: "sm" | "md" | "lg"
  label?: string
  closeOnSelect?: boolean
  className?: string
}

const SIZES = {
  sm: { trigger: "h-8 w-8", triggerIcon: 15, action: "h-7 w-7", actionIcon: 13, gap: "gap-1.5", inset: "mx-1.5", step: 34 },
  md: { trigger: "h-10 w-10", triggerIcon: 18, action: "h-9 w-9", actionIcon: 15, gap: "gap-2", inset: "mx-2", step: 44 },
  lg: { trigger: "h-12 w-12", triggerIcon: 21, action: "h-10 w-10", actionIcon: 17, gap: "gap-2", inset: "mx-2", step: 48 },
} as const

function ShareIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  )
}

export function ShareButton({
  actions = [],
  copyValue,
  direction = "right",
  size = "md",
  label = "Share",
  closeOnSelect = true,
  className,
}: ShareButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pendingClose, setPendingClose] = useState(false)
  const [tip, setTip] = useState<number | null>(null)
  const rootRef = useRef<HTMLSpanElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const sizes = SIZES[size]
  const itemCount = actions.length + (copyValue !== undefined ? 1 : 0)
  const sign = direction === "right" ? 1 : -1
  const fade = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 22 }

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setOpen(false)
    setTip(null)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  const selectAction = useCallback(
    (action: ShareAction) => {
      action.onSelect()
      if (closeOnSelect) setPendingClose(true)
    },
    [closeOnSelect],
  )

  const copy = useCallback(async () => {
    if (copyValue === undefined) return
    try {
      await navigator.clipboard.writeText(copyValue)
      setCopied(true)
    } catch {
      // 剪贴板不可用时静默失败。
    }
  }, [copyValue])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      menuRef.current?.querySelector("button")?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closeMenu(false)
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [closeMenu, open])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  useEffect(() => {
    if (!pendingClose) return
    const timer = window.setTimeout(() => {
      setPendingClose(false)
      closeMenu(true)
    }, prefersReducedMotion ? 0 : 150)
    return () => window.clearTimeout(timer)
  }, [closeMenu, pendingClose, prefersReducedMotion])

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = [...event.currentTarget.querySelectorAll("button")]
    if (nodes.length === 0) return
    const current = nodes.indexOf(document.activeElement as HTMLButtonElement)
    let next: number | null = null
    if (event.key === "Tab") next = current + (event.shiftKey ? -1 : 1)
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const forward = (event.key === "ArrowRight") === (direction === "right")
      next = current + (forward ? 1 : -1)
    }
    if (next === null) return
    event.preventDefault()
    nodes[((next % nodes.length) + nodes.length) % nodes.length]?.focus()
  }

  const renderAction = (index: number, name: string, tooltip: string, onClick: () => void, icon: ReactNode) => {
    const offset = -sign * sizes.step * (index + 1)
    return (
      <motion.button
        key={index}
        type="button"
        role="menuitem"
        aria-label={name}
        onClick={onClick}
        onMouseEnter={() => setTip(index)}
        onMouseLeave={() => setTip((current) => (current === index ? null : current))}
        onFocus={() => setTip(index)}
        onBlur={() => setTip((current) => (current === index ? null : current))}
        initial={prefersReducedMotion ? { opacity: 0 } : { x: offset, scale: 0.5, opacity: 0 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, scale: 1, opacity: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { x: offset, scale: 0.5, opacity: 0 }}
        transition={fade}
        className={cn("relative inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", sizes.action)}
      >
        {icon}
        {tip === index ? (
          <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background">
            {tooltip}
          </span>
        ) : null}
      </motion.button>
    )
  }

  return (
    <span
      ref={rootRef}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="share-button"
      className={cn("relative inline-flex items-center", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation()
          closeMenu(true)
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) {
            closeMenu(false)
            return
          }
          setCopied(false)
          setOpen(true)
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={cn("relative z-20 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", sizes.trigger)}
      >
        {open ? <X size={sizes.triggerIcon} /> : <ShareIcon size={sizes.triggerIcon} />}
      </button>
      <AnimatePresence initial={false}>
        {open && itemCount > 0 ? (
          <motion.div
            ref={menuRef}
            key="actions"
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
            className={cn("absolute inset-y-0 z-10 flex items-center", direction === "right" ? "left-full flex-row" : "right-full flex-row-reverse", sizes.gap, sizes.inset)}
          >
            {copyValue !== undefined
              ? renderAction(0, "Copy link", copied ? "Copied!" : "Copy link", () => void copy(), copied ? <Check size={sizes.actionIcon} className="text-primary" /> : <Link size={sizes.actionIcon} />)
              : null}
            {actions.map((action, actionIndex) => {
              const index = actionIndex + (copyValue !== undefined ? 1 : 0)
              return renderAction(index, action.label, action.label, () => selectAction(action), action.icon)
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
