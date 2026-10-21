"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FuseButtonProps extends Omit<React.ComponentProps<typeof Button>, "color"> {
  holdMs?: number
  color?: string
  scale?: number
  onComplete?: () => void
}

const ringRadius = 46
const ringLength = 2 * Math.PI * ringRadius

function FuseButton({
  holdMs = 800,
  color,
  scale,
  onComplete,
  children = "按住确认",
  className,
  disabled,
  size,
  ref,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  ...props
}: FuseButtonProps) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = React.useState(0)
  const timeoutId = React.useRef(0)
  const intervalId = React.useRef(0)
  const holding = React.useRef(false)

  const stop = React.useCallback((reset: boolean) => {
    window.clearTimeout(timeoutId.current)
    window.clearInterval(intervalId.current)
    holding.current = false
    if (reset) setProgress(0)
  }, [])

  React.useEffect(() => () => stop(false), [stop])

  const start = () => {
    if (disabled || holding.current) return
    holding.current = true
    const complete = onComplete
    const began = performance.now()
    // 减弱动效只跳过圆环插值。按住时长仍然有效，误触不能直接完成。
    intervalId.current = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - began) / holdMs)
      setProgress(reduced ? 0 : next)
    }, 16)
    timeoutId.current = window.setTimeout(() => {
      stop(true)
      complete?.()
    }, holdMs)
  }

  return (
    <Button
      ref={ref}
      type="button"
      disabled={disabled}
      size={size}
      data-slot="fuse-button"
      className={cn("relative overflow-visible", size == null && "h-11 px-5", className)}
      onPointerDown={(event) => {
        if (event.button === 0) start()
        onPointerDown?.(event)
      }}
      onPointerUp={(event) => {
        stop(true)
        onPointerUp?.(event)
      }}
      onPointerLeave={(event) => {
        stop(true)
        onPointerLeave?.(event)
      }}
      onPointerCancel={(event) => {
        stop(true)
        onPointerCancel?.(event)
      }}
      onKeyDown={(event) => {
        if ((event.key === " " || event.key === "Enter") && !event.repeat) {
          event.preventDefault()
          start()
        }
        onKeyDown?.(event)
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") stop(true)
        onKeyUp?.(event)
      }}
      {...props}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute -inset-1 size-[calc(100%+8px)]"
        style={
          scale === undefined || scale === 1
            ? undefined
            : { transform: `scale(${scale})`, transformOrigin: "center" }
        }
      >
        <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
        <circle
          cx="50"
          cy="50"
          r={ringRadius}
          fill="none"
          stroke={color ?? "currentColor"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={ringLength}
          strokeDashoffset={ringLength * (1 - progress)}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className="relative">{children}</span>
    </Button>
  )
}

export { FuseButton }
