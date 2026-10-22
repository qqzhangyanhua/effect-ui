"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/timer.tsx. Modified for effect-ui.

import { useEffect, useRef, useState, type ComponentProps, type ComponentType, type ReactNode } from "react"
import { cva } from "class-variance-authority"
import { Clock } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const rootVariants = cva("inline-flex items-center rounded-full font-medium", {
  variants: {
    variant: {
      default: "border border-border bg-background text-foreground shadow-[0_2px_4px_rgba(0,0,0,0.04)]",
      outline: "border border-input bg-background text-foreground",
      ghost: "bg-transparent text-foreground",
      destructive: "border border-destructive/20 bg-destructive/10 text-destructive",
    },
    size: {
      sm: "h-8 gap-1.5 px-2 text-xs",
      md: "h-11 gap-2 px-2.5 text-sm",
      lg: "h-12 gap-2.5 px-3 text-base",
    },
  },
  defaultVariants: { variant: "default", size: "md" },
})

export interface ElapsedTimerProps extends Omit<ComponentProps<"div">, "children"> {
  children?: ReactNode
  loading?: boolean
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  format?: "SS.MS" | "MM:SS" | "HH:MM:SS"
  resetOnLoadingChange?: boolean
  time?: string
  icon?: ComponentType<{ className?: string }>
  label?: string
  onTick?: (seconds: number, milliseconds: number) => void
}

function formatClock(totalMs: number, format: NonNullable<ElapsedTimerProps["format"]>) {
  const totalSeconds = Math.floor(totalMs / 1000)
  const hundredths = Math.floor((totalMs % 1000) / 10)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (value: number) => value.toString().padStart(2, "0")
  if (format === "HH:MM:SS") return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  if (format === "MM:SS") return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
  return `${pad(totalSeconds)}.${pad(hundredths)}`
}

export function TimerRoot({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div {...props} className={className} role="timer">
      {children}
    </div>
  )
}

export function TimerIcon({ icon: Icon = Clock, className }: { icon?: ElapsedTimerProps["icon"]; className?: string }) {
  return (
    <span className={className} data-part="icon">
      <Icon className="size-full" />
    </span>
  )
}

export function TimerDisplay({ time, label, className }: { time: string; label?: string; className?: string }) {
  return (
    <span aria-label={label || `计时 ${time}`} className={cn("font-mono tabular-nums tracking-tight", className)}>
      {time}
    </span>
  )
}

export function ElapsedTimer({
  loading = false,
  variant = "default",
  size = "md",
  format = "SS.MS",
  resetOnLoadingChange = true,
  time,
  icon,
  onTick,
  className,
  label,
  ...props
}: ElapsedTimerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced && loading
  const [elapsed, setElapsed] = useState(0)
  const onTickRef = useRef(onTick)
  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    if (!moving) return
    const origin = performance.now() - (resetOnLoadingChange ? 0 : elapsed)
    let frame = 0
    const tick = (now: number) => {
      const next = Math.max(0, now - origin)
      setElapsed(next)
      onTickRef.current?.(Math.floor(next / 1000), Math.floor(next % 1000))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // elapsed 只在启动时作为续跑起点，不能放进依赖，否则每帧都重置。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moving, resetOnLoadingChange])

  const iconSize = size === "sm" ? "size-3" : size === "lg" ? "size-4" : "size-3.5"
  const shown = time ?? formatClock(loading ? elapsed : 0, format)

  return (
    <TimerRoot
      {...props}
      ref={ref}
      aria-atomic="true"
      aria-live="polite"
      className={cn(rootVariants({ variant, size }), className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="elapsed-timer"
    >
      <style>
        {`@keyframes elapsed-timer-spin { to { transform: rotate(360deg); } }
[data-slot="elapsed-timer"][data-motion="on"] [data-part="icon"] { animation: elapsed-timer-spin 2s linear infinite; }`}
      </style>
      <TimerIcon className={iconSize} icon={icon} />
      <TimerDisplay label={label} time={shown} />
    </TimerRoot>
  )
}
