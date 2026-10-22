"use client"

// Ported from beUI (MIT, (c) 2026 Saurabh Chauhan) — https://github.com/starc007/ui-components/blob/main/components/motion/action-swap.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion, type Variants } from "motion/react"
import { useRef, useState, type ReactNode } from "react"

export type ActionSwapVariant = "blur" | "roll" | "cascade"
export type ActionSwapTone = "primary" | "secondary" | "outline" | "ghost"

export type ActionSwapItem = {
  id: string
  label: ReactNode
  icon?: ReactNode
  ariaLabel?: string
}

export interface ActionSwapProps {
  items?: ActionSwapItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string, item: ActionSwapItem) => void
  /** Which of the three swap styles to play. */
  variant?: ActionSwapVariant
  tone?: ActionSwapTone
  iconOnly?: boolean
  cycle?: boolean
  disabled?: boolean
  /** Label color. Defaults to the foreground token. */
  color?: string
  /** Swap length, in milliseconds. */
  duration?: number
  /** Button height, in pixels. */
  size?: number
  /** How far the arriving label travels. 1 matches the original distance. */
  intensity?: number
  className?: string
}

const DEFAULT_ITEMS: ActionSwapItem[] = [
  { id: "copy", label: "Copy link", ariaLabel: "Copy link" },
  { id: "copied", label: "Copied", ariaLabel: "Copied" },
]

const TONE_CLASS: Record<ActionSwapTone, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "border border-border bg-card text-foreground",
  outline: "border border-border bg-transparent text-foreground",
  ghost: "text-muted-foreground",
}

const EASE = [0.16, 1, 0.3, 1] as const

export function ActionSwapText({
  value,
  children,
  variant = "blur",
  duration = 280,
  intensity = 1,
  still = false,
  className,
}: {
  value: string
  children: ReactNode
  variant?: ActionSwapVariant
  duration?: number
  intensity?: number
  still?: boolean
  className?: string
}) {
  const label = typeof children === "string" ? children : null
  const cascade = variant === "cascade" && label != null && !still
  const seconds = still ? 0 : duration / 1000
  const travel = `${Math.round(90 * intensity)}%`

  return (
    <span className={cn("relative inline-block max-w-full whitespace-nowrap align-bottom", className)} style={{ clipPath: "inset(0 -999px)" }}>
      <span aria-hidden className="invisible inline-block whitespace-nowrap">
        {children}
      </span>
      {cascade && label ? (
        <>
          <span className="sr-only">{label}</span>
          <AnimatePresence initial={false}>
            <motion.span key={`cascade-${value}`} aria-hidden className="absolute left-0 top-0 inline-block whitespace-pre">
              {label.split("").map((char, index) => (
                <motion.span
                  key={`${value}-${index}`}
                  initial={{ opacity: 0, y: travel, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: "0%", filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: `-${travel}`, filter: "blur(3px)" }}
                  transition={{ duration: seconds, ease: EASE, delay: still ? 0 : index * 0.025 }}
                  className="inline-block whitespace-pre"
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence initial={false}>
          <motion.span
            key={`${variant}-${value}`}
            initial={still ? { opacity: 1 } : variant === "roll" ? { opacity: 0, y: travel, filter: "blur(3px)" } : { opacity: 0, scale: 0.9, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={still ? { opacity: 0 } : variant === "roll" ? { opacity: 0, y: `-${travel}`, filter: "blur(3px)" } : { opacity: 0, scale: 0.96, filter: "blur(2px)" }}
            transition={{ duration: seconds, ease: EASE }}
            className="absolute left-0 top-0 inline-block max-w-full truncate"
          >
            {children}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  )
}

export function ActionSwapIcon({
  value,
  children,
  variant = "blur",
  duration = 280,
  intensity = 1,
  still = false,
  className,
}: {
  value: string
  children: ReactNode
  variant?: ActionSwapVariant
  duration?: number
  intensity?: number
  still?: boolean
  className?: string
}) {
  const seconds = still ? 0 : duration / 1000
  const core = variant === "cascade" ? "roll" : variant
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${variant}-${value}`}
          aria-hidden
          initial={still ? { opacity: 1 } : core === "roll" ? { opacity: 0, y: 12 * intensity } : { opacity: 0, scale: 0.25 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: seconds, ease: EASE }}
          className="col-start-1 row-start-1 inline-flex items-center justify-center"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function ActionSwap({
  items = DEFAULT_ITEMS,
  value,
  defaultValue,
  onValueChange,
  variant = "blur",
  tone = "secondary",
  iconOnly = false,
  cycle = true,
  disabled = false,
  color = "var(--foreground)",
  duration = 280,
  size = 40,
  intensity = 1,
  className,
}: ActionSwapProps) {
  const rootRef = useRef<HTMLButtonElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const still = prefersReduced || !live || disabled
  const [internalValue, setInternalValue] = useState(defaultValue ?? items[0]?.id)
  const currentValue = value ?? internalValue
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === currentValue))
  const activeItem = items[activeIndex] ?? items[0]
  const nextItem = cycle && items.length > 0 ? items[(activeIndex + 1) % items.length] : undefined
  if (!activeItem) return null
  const label = activeItem.ariaLabel ?? (iconOnly && typeof activeItem.label === "string" ? activeItem.label : undefined)
  const motionVariants: Variants = { idle: { scale: 1 }, tap: { scale: still ? 1 : 0.97 } }

  return (
    <motion.button
      ref={rootRef}
      type="button"
      disabled={disabled}
      variants={motionVariants}
      initial="idle"
      whileTap="tap"
      data-variant={variant}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      style={{ height: size, color: tone === "primary" ? undefined : color, borderRadius: 9999 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 overflow-hidden px-4 text-sm font-medium motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50",
        TONE_CLASS[tone],
        className,
      )}
      aria-label={label}
      onClick={() => {
        if (disabled || !cycle || !nextItem) return
        if (value === undefined) setInternalValue(nextItem.id)
        onValueChange?.(nextItem.id, nextItem)
      }}
    >
      {activeItem.icon ? (
        <ActionSwapIcon value={activeItem.id} variant={variant} duration={duration} intensity={intensity} still={still} className="h-4 w-4">
          {activeItem.icon}
        </ActionSwapIcon>
      ) : null}
      {iconOnly ? null : (
        <ActionSwapText value={activeItem.id} variant={variant} duration={duration} intensity={intensity} still={still}>
          {activeItem.label}
        </ActionSwapText>
      )}
    </motion.button>
  )
}
