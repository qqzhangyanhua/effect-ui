"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface HoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  duration?: number
  onConfirm?: () => void
}

function HoldButton({
  className,
  children = "长按确认",
  duration = 1000,
  onConfirm,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...props
}: HoldButtonProps) {
  const [progress, setProgress] = React.useState(0)
  const timer = React.useRef(0)

  const stop = () => {
    window.clearInterval(timer.current)
    setProgress(0)
  }

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-10 overflow-hidden rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground",
        className,
      )}
      onPointerDown={(event) => {
        const began = performance.now()
        timer.current = window.setInterval(() => {
          const next = Math.min(1, (performance.now() - began) / duration)
          setProgress(next)
          if (next >= 1) {
            window.clearInterval(timer.current)
            onConfirm?.()
            setProgress(0)
          }
        }, 16)
        onPointerDown?.(event)
      }}
      onPointerUp={(event) => {
        stop()
        onPointerUp?.(event)
      }}
      onPointerLeave={(event) => {
        stop()
        onPointerLeave?.(event)
      }}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-primary-foreground/20"
        style={{ width: `${progress * 100}%` }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export { HoldButton }
