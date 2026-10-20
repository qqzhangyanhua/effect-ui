"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Burst {
  id: number
  x: number
  y: number
}

export type ParticleButtonProps = React.ComponentProps<typeof Button>

function slotTargetOf(asChild: boolean, children: React.ReactNode) {
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) return children
  return null
}

function ParticleButton({
  className,
  children = "粒子爆散",
  variant,
  size = "lg",
  asChild = false,
  onClick,
  ...props
}: ParticleButtonProps) {
  const [bursts, setBursts] = React.useState<Burst[]>([])
  const slotTarget = slotTargetOf(asChild, children)
  const label = slotTarget ? slotTarget.props.children : children

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const next = {
      id: Date.now(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setBursts((current) => [...current, next])
    window.setTimeout(() => {
      setBursts((current) => current.filter((item) => item.id !== next.id))
    }, 700)
  }

  const body = (
    <>
      <span className="relative z-10">{label}</span>
      {bursts.map((burst) => (
        <span key={burst.id} className="pointer-events-none absolute" style={{ left: burst.x, top: burst.y }}>
          {Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2
            return (
              <span
                key={index}
                className="absolute size-1.5 rounded-full bg-primary-foreground animate-[particle-burst_0.7s_ease-out_forwards]"
                style={
                  {
                    "--dx": `${Math.cos(angle) * 28}px`,
                    "--dy": `${Math.sin(angle) * 28}px`,
                  } as React.CSSProperties
                }
              />
            )
          })}
        </span>
      ))}
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
      className={cn("relative overflow-visible", className)}
      onClick={handleClick}
      {...props}
    >
      {slotTarget ? React.cloneElement(slotTarget, undefined, body) : body}
    </Button>
  )
}

export { ParticleButton }
