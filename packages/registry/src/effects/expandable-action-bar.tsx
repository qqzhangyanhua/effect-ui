"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 三个手势钩子改从 @/hooks 引入，减弱动效时标签直接显隐，展开状态回落在渲染阶段清掉点击展开标记。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/components/motion/expandable-action-bar.tsx

import { useDismiss } from "@/hooks/use-dismiss"
import { useHoverGesture } from "@/hooks/use-hover-gesture"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { useTapGesture } from "@/hooks/use-tap-gesture"
import { cn } from "@/lib/utils"

import { LayoutGroup, motion } from "motion/react"
import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react"

export type ExpandableActionBarItem = {
  id: string
  label: ReactNode
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  badge?: ReactNode
  shortcut?: ReactNode
}

export interface ExpandableActionBarProps {
  items: ExpandableActionBarItem[]
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  activeId?: string
  onAction?: (item: ExpandableActionBarItem) => void
  size?: "sm" | "md"
  expandOnHover?: boolean
  expandOnFocus?: boolean
  collapseDelay?: number
  className?: string
  classNames?: {
    root?: string
    track?: string
    item?: string
    activeItem?: string
    icon?: string
    label?: string
    badge?: string
    shortcut?: string
  }
  renderItem?: (item: ExpandableActionBarItem, state: { expanded: boolean; active: boolean }) => ReactNode
}

const SIZE_CLASS = { sm: "min-h-9 gap-1 p-1 text-xs", md: "min-h-11 gap-1.5 p-1.5 text-sm" }
const ITEM_SIZE = { sm: "h-7 min-w-7 px-1.5", md: "h-8 min-w-8 px-2" }
const ICON_SIZE = { sm: "h-3.5 w-3.5", md: "h-4 w-4" }

export function ExpandableActionBar({
  items,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  activeId,
  onAction,
  size = "md",
  expandOnHover = true,
  expandOnFocus = true,
  collapseDelay = 90,
  className,
  classNames,
  renderItem,
}: ExpandableActionBarProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const layoutId = useId()
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isControlled = expanded !== undefined
  const isExpanded = expanded ?? internalExpanded
  const setIsExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next)
      onExpandedChange?.(next)
    },
    [isControlled, onExpandedChange],
  )
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tapExpanded, setTapExpanded] = useState(false)
  const [wasExpanded, setWasExpanded] = useState(isExpanded)
  if (wasExpanded !== isExpanded) {
    setWasExpanded(isExpanded)
    if (wasExpanded && !isExpanded) setTapExpanded(false)
  }
  const collapseTimer = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const tap = useTapGesture<boolean>()
  const hover = useHoverGesture()

  const clearCollapseTimer = useCallback(() => {
    if (collapseTimer.current) window.clearTimeout(collapseTimer.current)
    collapseTimer.current = null
  }, [])
  const open = useCallback(() => {
    clearCollapseTimer()
    setIsExpanded(true)
  }, [clearCollapseTimer, setIsExpanded])
  const close = useCallback(() => {
    clearCollapseTimer()
    collapseTimer.current = window.setTimeout(() => {
      setIsExpanded(false)
      setHoveredId(null)
      setTapExpanded(false)
    }, prefersReducedMotion ? 0 : collapseDelay)
  }, [clearCollapseTimer, collapseDelay, prefersReducedMotion, setIsExpanded])

  useEffect(() => clearCollapseTimer, [clearCollapseTimer])
  useDismiss(tapExpanded && isExpanded, close, trackRef, { behavior: "consume" })

  const activeItemId = activeId ?? items.find((item) => item.active)?.id
  const highlightId = hoveredId ?? activeItemId
  const labelTransition = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 32 }

  return (
    <LayoutGroup id={layoutId}>
      <div
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="expandable-action-bar"
        onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
          if (hover.enter(event) && expandOnHover) open()
        }}
        onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
          if (!hover.leave(event)) return
          setHoveredId(null)
          if (expandOnHover) close()
        }}
        onFocus={() => {
          if (expandOnFocus) open()
        }}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node) && expandOnFocus) close()
        }}
        className={cn("inline-flex max-w-full", classNames?.root, className)}
      >
        <div ref={trackRef} className={cn("relative inline-flex max-w-full items-center overflow-x-auto rounded-full border border-border bg-card/90 shadow-lg backdrop-blur-xl", SIZE_CLASS[size], classNames?.track)}>
          {items.map((item) => {
            const isActive = item.active || activeId === item.id
            const isHighlighted = highlightId === item.id
            return (
              <motion.button
                key={item.id}
                type="button"
                disabled={item.disabled}
                aria-label={typeof item.label === "string" ? item.label : undefined}
                title={typeof item.label === "string" ? item.label : undefined}
                onPointerEnter={(event) => {
                  if (!hover.enter(event)) return
                  clearCollapseTimer()
                  setHoveredId(item.id)
                }}
                onPointerDown={(event) => tap.start(event, isExpanded)}
                onPointerCancel={tap.drop}
                onKeyDown={tap.drop}
                onClick={() => {
                  const gesture = tap.take()
                  const firstTap = gesture !== null && gesture.pointerType !== "mouse" && !gesture.state && !tapExpanded
                  if (firstTap && expandOnHover) {
                    setTapExpanded(true)
                    open()
                    setHoveredId(item.id)
                    return
                  }
                  item.onClick?.()
                  onAction?.(item)
                }}
                whileTap={prefersReducedMotion || item.disabled ? undefined : { scale: 0.96 }}
                className={cn(
                  "relative isolate inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium text-muted-foreground outline-none focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-40",
                  isHighlighted && "text-foreground",
                  ITEM_SIZE[size],
                  classNames?.item,
                  isActive && classNames?.activeItem,
                )}
              >
                {isHighlighted ? <motion.span layoutId="action-bar-highlight" className="absolute inset-0 -z-10 rounded-full bg-primary/10" transition={labelTransition} /> : null}
                {renderItem ? (
                  renderItem(item, { expanded: isExpanded, active: isActive })
                ) : (
                  <>
                    <span className={cn("inline-flex shrink-0 items-center justify-center", ICON_SIZE[size], classNames?.icon)}>{item.icon}</span>
                    <motion.span
                      aria-hidden={!isExpanded}
                      animate={{ width: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0, marginLeft: isExpanded ? 8 : 0, x: prefersReducedMotion || isExpanded ? 0 : -4, filter: prefersReducedMotion || isExpanded ? "blur(0px)" : "blur(3px)" }}
                      transition={labelTransition}
                      className={cn("inline-block overflow-hidden whitespace-nowrap", classNames?.label)}
                    >
                      {item.label}
                    </motion.span>
                    {item.badge ? (
                      <span className={cn("ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-primary-foreground", !isExpanded && "absolute right-0.5 top-0.5", classNames?.badge)}>
                        {item.badge}
                      </span>
                    ) : null}
                  </>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </LayoutGroup>
  )
}

export function useExpandableActionBar(items: ExpandableActionBarItem[]) {
  const [expanded, setExpanded] = useState(false)
  const [activeId, setActiveId] = useState(items[0]?.id)
  const activeItem = useMemo(() => items.find((item) => item.id === activeId), [activeId, items])
  return useMemo(() => ({ expanded, setExpanded, activeId, setActiveId, activeItem }), [activeId, activeItem, expanded])
}
