"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Burst {
  id: number
  x: number
  y: number
}

export type ParticleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function ParticleButton({ className, children = "粒子爆散", onClick, ...props }: ParticleButtonProps) {
  const [bursts, setBursts] = React.useState<Burst[]>([])

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-10 overflow-visible rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground",
        className,
      )}
      onClick={(event) => {
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
        onClick?.(event)
      }}
      {...props}
    >
      <span className="relative z-10">{children}</span>
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
    </button>
  )
}

export { ParticleButton }
