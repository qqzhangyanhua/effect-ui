"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Burst {
  id: number
  x: number
  y: number
}

export type ParticleButtonProps = React.ComponentProps<typeof Button> & {
  /** 爆散时长，毫秒。不传或 700 仍是 0.7s。 */
  duration?: number
  /** 粒子个数。不传或 10 仍是 10。 */
  count?: number
  /** 飞出距离倍率。不传或 1 仍是 28px。 */
  scale?: number
}

function ParticleButton({
  className,
  children = "粒子爆散",
  duration,
  count,
  scale,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: ParticleButtonProps) {
  const [bursts, setBursts] = React.useState<Burst[]>([])
  const slotted =
    asChild && React.isValidElement<{ children?: React.ReactNode }>(children) ? children : null
  const label = slotted ? slotted.props.children : children
  const timed = duration === undefined || duration === 700
  const ms = timed ? 700 : duration
  const total = count === undefined || count === 10 ? 10 : count
  const reach = scale === undefined || scale === 1 ? 28 : 28 * scale

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
    }, ms)
  }

  const body = (
    <>
      <span className="relative z-10">{label}</span>
      {bursts.map((burst) => (
        <span key={burst.id} className="pointer-events-none absolute" style={{ left: burst.x, top: burst.y }}>
          {Array.from({ length: total }, (_, index) => {
            const angle = (index / total) * Math.PI * 2
            return (
              <span
                key={index}
                className="absolute size-1.5 rounded-full bg-primary-foreground animate-[particle-burst_0.7s_ease-out_forwards]"
                style={
                  {
                    "--dx": `${Math.cos(angle) * reach}px`,
                    "--dy": `${Math.sin(angle) * reach}px`,
                    ...(timed ? {} : { animationDuration: `${ms}ms` }),
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
      asChild={slotted !== null}
      className={cn(
        "relative overflow-visible",
        variant == null && "hover:bg-primary",
        size == null && "h-10 px-5",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {slotted ? React.cloneElement(slotted, undefined, body) : body}
    </Button>
  )
}

export { ParticleButton }
