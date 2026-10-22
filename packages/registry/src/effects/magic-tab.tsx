"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/magic-tab/magic-tab.tsx

import { useCallback, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type MagicTabItem = {
  value: string
  label: ReactNode
  disabled?: boolean
}

export type MagicTabProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "color"> & {
  items: MagicTabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  rainbow?: boolean
}

function firstEnabled(items: MagicTabItem[]) {
  return items.find((item) => !item.disabled)?.value
}

export function MagicTab({
  items,
  value,
  defaultValue,
  onValueChange,
  color = "var(--primary)",
  duration = 600,
  intensity = 4,
  speed = 1,
  rainbow = true,
  className,
  onKeyDown,
  ...props
}: MagicTabProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const rainbowName = `magic-rainbow-${useId().replace(/:/g, "")}`
  const controlled = value !== undefined
  const [internal, setInternal] = useState(() => defaultValue ?? firstEnabled(items))
  const selected = controlled ? value : internal
  const [focusValue, setFocusValue] = useState<string | undefined>(undefined)
  const roving = focusValue ?? selected
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lift = Math.max(0, intensity)
  const cycle = `${Math.max(0.4, 2.4 / Math.max(speed, 0.1))}s`

  const select = useCallback(
    (next: string) => {
      if (!controlled) setInternal(next)
      if (next !== selected) onValueChange?.(next)
    },
    [controlled, onValueChange, selected],
  )

  const moveFocus = (next: string) => {
    setFocusValue(next)
    const index = items.findIndex((item) => item.value === next)
    tabRefs.current[index]?.focus()
  }

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    node.style.setProperty("--magic-play", live && !reduced && rainbow ? "running" : "paused")
  }, [live, reduced, rainbow])

  return (
    <div
      ref={rootRef}
      role="tablist"
      aria-orientation="horizontal"
      data-slot="magic-tab"
      data-motion={live && !reduced ? "on" : "off"}
      onKeyDown={(event) => {
        const enabled = items.filter((item) => !item.disabled)
        if (enabled.length > 0) {
          const current = Math.max(0, enabled.findIndex((item) => item.value === roving))
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault()
            const next = enabled[(current + 1) % enabled.length]
            if (next) moveFocus(next.value)
          } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault()
            const next = enabled[(current - 1 + enabled.length) % enabled.length]
            if (next) moveFocus(next.value)
          } else if (event.key === "Home") {
            event.preventDefault()
            const next = enabled[0]
            if (next) moveFocus(next.value)
          } else if (event.key === "End") {
            event.preventDefault()
            const next = enabled[enabled.length - 1]
            if (next) moveFocus(next.value)
          } else if ((event.key === "Enter" || event.key === " ") && roving) {
            event.preventDefault()
            select(roving)
          }
        }
        onKeyDown?.(event)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusValue(undefined)
      }}
      className={`inline-flex items-stretch gap-2 rounded-xl bg-muted p-2 font-medium select-none ${className ?? ""}`}
      {...props}
    >
      <style>{`@keyframes ${rainbowName}{from{background-position:0% 50%}to{background-position:200% 50%}}`}</style>
      {items.map((item, index) => {
        const active = item.value === selected
        const rainbowFill = rainbow
          ? `linear-gradient(90deg, var(--chart-1), var(--chart-5), var(--chart-3), var(--chart-4), var(--chart-2))`
          : undefined
        return (
          <button
            key={item.value}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            tabIndex={item.value === roving ? 0 : -1}
            onClick={() => {
              setFocusValue(item.value)
              select(item.value)
            }}
            className="group relative cursor-pointer border-0 bg-transparent p-0 outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-xl motion-reduce:animate-none"
              style={{
                opacity: active ? 0.7 : 0,
                transform: `translateY(${active ? 2 : 0}px)`,
                filter: active && rainbow ? "blur(12px)" : "blur(4px)",
                backgroundImage: active && rainbow ? rainbowFill : undefined,
                backgroundColor: active && !rainbow ? "color-mix(in srgb, var(--foreground) 25%, transparent)" : undefined,
                backgroundSize: "200% 100%",
                animationName: active && rainbow && !reduced ? rainbowName : undefined,
                animationDuration: active && rainbow && !reduced ? cycle : undefined,
                animationTimingFunction: active && rainbow && !reduced ? "linear" : undefined,
                animationIterationCount: active && rainbow && !reduced ? "infinite" : undefined,
                animationPlayState: "var(--magic-play, paused)",
                transition: reduced ? "none" : `transform ${duration}ms cubic-bezier(0.3,0.7,0.4,1), opacity 250ms ease`,
              }}
            />
            <span
              className="relative block rounded-xl px-4 motion-reduce:transition-none group-active:-translate-y-1 group-focus-visible:-translate-y-1"
              style={{
                minHeight: 36 + lift,
                color: active ? "var(--primary-foreground)" : "var(--muted-foreground)",
                backgroundImage: active && rainbow ? rainbowFill : undefined,
                backgroundColor: active && !rainbow ? color : active ? undefined : "transparent",
                backgroundSize: "200% 100%",
                transform: active ? `translateY(-${lift}px)` : undefined,
                transition: reduced ? "none" : `transform ${duration}ms cubic-bezier(0.3,0.7,0.4,1), background-color 250ms ease, background-image 250ms ease, color 250ms ease`,
                animationName: active && rainbow && !reduced ? rainbowName : undefined,
                animationDuration: active && rainbow && !reduced ? cycle : undefined,
                animationTimingFunction: active && rainbow && !reduced ? "linear" : undefined,
                animationIterationCount: active && rainbow && !reduced ? "infinite" : undefined,
                animationPlayState: "var(--magic-play, paused)",
              }}
            >
              <span className="grid h-full place-items-center">{item.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
