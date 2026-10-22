"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/halo-switch.tsx. Modified for effect-ui.

import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react"
import { Switch } from "@base-ui/react/switch"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const layoutSpring = { type: "spring" as const, bounce: 0.12, damping: 34, stiffness: 420 }

function travelFor(size: "sm" | "default") {
  const track = size === "sm" ? 34 : 40
  const thumb = size === "sm" ? 12 : 14
  return Math.max(0, track - thumb - 6)
}

export interface HaloSwitchProps extends Omit<ComponentProps<typeof Switch.Root>, "className"> {
  className?: string
  translucent?: boolean
  size?: "sm" | "default"
}

export function HaloSwitch({
  className,
  translucent = true,
  size = "default",
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  ...props
}: HaloSwitchProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLElement | null>(null)
  const thumbRef = useRef<HTMLSpanElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(shellRef)
  const moving = motionOn && !reduced
  const [thumbTravel, setThumbTravel] = useState(() => travelFor(size))
  const measure = useCallback(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    const styles = getComputedStyle(track)
    const pad = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight)
    const next = Math.max(0, track.clientWidth - pad - thumb.getBoundingClientRect().width)
    setThumbTravel(next)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(track)
    return () => observer.disconnect()
  }, [measure, size])

  const trackSize = size === "sm" ? "h-[18px] min-h-[18px] w-[34px] min-w-[34px]" : "h-[22px] min-h-[22px] w-10 min-w-10"
  const thumbSize = size === "sm" ? "size-3" : "size-3.5"
  const hitY = size === "sm" ? "after:-inset-y-[13px]" : "after:-inset-y-[11px]"

  return (
    <div
      ref={shellRef}
      className={cn("relative inline-flex max-w-full rounded-full", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="halo-switch"
    >
      {translucent ? (
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" style={{ opacity: reduced ? 0.38 : 0.5 }}>
          <span
            className="absolute inset-0 blur-2xl"
            style={{
              background:
                "radial-gradient(90% 70% at 50% 100%, rgba(255,0,128,0.28), rgba(121,40,202,0.12) 48%, transparent 62%)",
            }}
          />
          <span
            className="absolute inset-0 blur-xl"
            style={{
              background:
                "radial-gradient(70% 55% at 30% 0%, rgba(0,212,255,0.22), rgba(0,112,243,0.08) 45%, transparent 58%)",
            }}
          />
        </span>
      ) : null}
      <span
        className={cn("relative rounded-full border border-border", translucent && "backdrop-blur-xl")}
        style={{
          background: translucent
            ? "linear-gradient(to bottom, color-mix(in oklch, var(--card) 82%, oklch(0.92 0.04 330)), color-mix(in oklch, var(--card) 76%, oklch(0.9 0.05 245)))"
            : "linear-gradient(to bottom, color-mix(in oklch, var(--card) 95%, oklch(0.97 0.02 315)), var(--card))",
        }}
      >
        <Switch.Root
          {...props}
          ref={trackRef}
          checked={checked}
          className={cn(
            "group/switch relative isolate flex cursor-pointer items-center rounded-full px-[3px] outline-none",
            "after:absolute after:-inset-x-3 after:z-0 after:rounded-full after:bg-transparent after:content-['']",
            hitY,
            "focus-visible:ring-2 focus-visible:ring-ring/30",
            "data-unchecked:bg-muted data-checked:bg-[linear-gradient(180deg,#ff7ab8,#8b5cf6_55%,#22d3ee)]",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
            trackSize,
          )}
          data-size={size}
          defaultChecked={checked === undefined ? defaultChecked : undefined}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
        >
          <Switch.Thumb
            render={(thumbProps, thumbState) => {
              const {
              className: thumbClassName,
              style: thumbStyle,
              ref: thumbRefProp,
              onDrag,
              onDragStart,
              onDragEnd,
              onAnimationStart,
              onAnimationEnd,
              ...rest
            } = thumbProps
            void thumbStyle
            void onDrag
            void onDragStart
            void onDragEnd
            void onAnimationStart
            void onAnimationEnd
              return (
                <motion.span
                  {...rest}
                  ref={(node) => {
                    thumbRef.current = node
                    if (typeof thumbRefProp === "function") thumbRefProp(node)
                    else if (thumbRefProp) thumbRefProp.current = node
                  }}
                  animate={{ x: thumbState.checked ? thumbTravel : 0 }}
                  className={cn(
                    thumbClassName,
                    "pointer-events-none relative z-[1] block shrink-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-black/10",
                    thumbSize,
                  )}
                  initial={false}
                  transition={moving ? layoutSpring : { duration: 0 }}
                  whileTap={moving ? { scale: 0.96 } : undefined}
                />
              )
            }}
          />
        </Switch.Root>
      </span>
    </div>
  )
}
