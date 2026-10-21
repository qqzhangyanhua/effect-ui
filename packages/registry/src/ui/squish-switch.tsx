"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const tracks = {
  sm: { track: "h-5 w-9", thumb: "size-4", travel: 16 },
  md: { track: "h-6 w-11", thumb: "size-5", travel: 20 },
  lg: { track: "h-7 w-14", thumb: "size-6", travel: 28 },
} as const

export interface SquishSwitchProps
  extends Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "color"> {
  size?: keyof typeof tracks
  color?: string
  squish?: number
  speed?: number
}

function SquishSwitch({
  className,
  size = "md",
  color,
  squish = 0.35,
  speed,
  disabled,
  checked,
  defaultChecked,
  onCheckedChange,
  ref,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: SquishSwitchProps) {
  const reduced = usePrefersReducedMotion()
  const [pressed, setPressed] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked === true)
  const on = checked ?? uncontrolled
  const metric = tracks[size] ?? tracks.md
  const amount = Math.min(1, Math.max(0, squish))
  const release = (event: React.PointerEvent<HTMLButtonElement>, notify?: (event: React.PointerEvent<HTMLButtonElement>) => void) => {
    setPressed(false)
    notify?.(event)
  }

  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="squish-switch"
      disabled={disabled}
      className={cn(
        "peer inline-flex shrink-0 items-center rounded-full border border-transparent p-0.5 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:bg-input",
        color
          ? "data-[state=checked]:bg-(--squish-color)"
          : "data-[state=checked]:bg-primary",
        metric.track,
        className,
      )}
      style={color ? ({ "--squish-color": color } as React.CSSProperties) : undefined}
      {...(checked !== undefined ? { checked } : { defaultChecked })}
      onCheckedChange={(value) => {
        if (checked === undefined) setUncontrolled(value)
        onCheckedChange?.(value)
      }}
      onPointerDown={(event) => {
        if (!disabled) {
          setPressed(true)
          event.currentTarget.setPointerCapture(event.pointerId)
        }
        onPointerDown?.(event)
      }}
      onPointerUp={(event) => release(event, onPointerUp)}
      onPointerCancel={(event) => release(event, onPointerCancel)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="squish-switch-thumb"
        className={cn("pointer-events-none block", metric.thumb)}
      >
        <motion.span
          aria-hidden
          className="block size-full rounded-full bg-background shadow-sm"
          animate={{
            x: on ? metric.travel : 0,
            scaleX: pressed && !reduced ? 1 + amount * 0.7 : 1,
            scaleY: pressed && !reduced ? 1 - amount * 0.45 : 1,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : speed === undefined || speed === 1
                ? { type: "spring", stiffness: 520, damping: 18 }
                : { type: "spring", stiffness: 520 * speed, damping: 18 }
          }
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { SquishSwitch }
