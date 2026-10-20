"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface HoldButtonProps extends React.ComponentProps<typeof Button> {
  duration?: number
  onConfirm?: () => void
}

function slotTargetOf(asChild: boolean, children: React.ReactNode) {
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) return children
  return null
}

function HoldButton({
  className,
  children = "长按确认",
  duration = 1000,
  onConfirm,
  variant,
  size = "lg",
  asChild = false,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...props
}: HoldButtonProps) {
  const [progress, setProgress] = React.useState(0)
  const timer = React.useRef(0)
  const slotTarget = slotTargetOf(asChild, children)
  const label = slotTarget ? slotTarget.props.children : children

  const stop = () => {
    window.clearInterval(timer.current)
    setProgress(0)
  }

  const body = (
    <>
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-(--hold) bg-primary-foreground/20 motion-reduce:w-full motion-reduce:[opacity:var(--hold-opacity)]"
        style={
          {
            "--hold": `${progress * 100}%`,
            "--hold-opacity": progress,
          } as React.CSSProperties
        }
      />
      <span className="relative z-10">{label}</span>
    </>
  )

  return (
    <Button
      type="button"
      // Button 在 props 之前写入 data-slot="button"；这个组件原先没有 data-slot。
      data-slot={undefined}
      variant={variant}
      size={size}
      asChild={slotTarget !== null}
      className={cn("relative overflow-hidden", className)}
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
      {slotTarget ? React.cloneElement(slotTarget, undefined, body) : body}
    </Button>
  )
}

export { HoldButton }
