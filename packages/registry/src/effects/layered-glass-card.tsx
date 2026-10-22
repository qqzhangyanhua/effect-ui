"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author Smit-Prajapati）— https://github.com/uiverse-io/galaxy/blob/main/Cards/Smit-Prajapati_smart-liger-5.html
// Uiverse 标志和社交图标已去掉，中心图形由 icon 传入。

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type HTMLAttributes, type ReactNode } from "react"

export interface LayeredGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const rings = [
  { id: "1", size: 170, inset: 8, z: 20 },
  { id: "2", size: 140, inset: 10, z: 40 },
  { id: "3", size: 110, inset: 17, z: 60 },
  { id: "4", size: 80, inset: 23, z: 80 },
  { id: "5", size: 50, inset: 30, z: 100 },
] as const

export function LayeredGlassCard({
  icon,
  title = "分层玻璃",
  description = "悬停时同心圆向前探出。",
  actionLabel,
  onAction,
  className,
  ...props
}: LayeredGlassCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      {...props}
      className={cn("relative h-[300px] w-[290px] [perspective:1000px]", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="layered-glass-card"
    >
      <style>{`
        [data-slot="layered-glass-card"][data-reduced="false"]:hover [data-face] {
          transform: rotate3d(1, 1, 0, 30deg);
        }
        [data-slot="layered-glass-card"][data-reduced="false"]:hover [data-ring="3"] { transform: translate3d(0,0,80px); }
        [data-slot="layered-glass-card"][data-reduced="false"]:hover [data-ring="4"] { transform: translate3d(0,0,100px); }
        [data-slot="layered-glass-card"][data-reduced="false"]:hover [data-ring="5"] { transform: translate3d(0,0,120px); }
      `}</style>
      <div
        className={cn(
          "relative h-full rounded-[50px] bg-primary text-primary-foreground shadow-xl [transform-style:preserve-3d]",
          prefersReducedMotion ? "transition-none" : "transition-transform duration-500",
        )}
        data-face
      >
        <div className="absolute top-0 right-0 [transform-style:preserve-3d]">
          {rings.map((ring) => (
            <span
              key={ring.id}
              className="absolute grid place-content-center rounded-full border border-primary-foreground/30 bg-primary-foreground/15 shadow-lg backdrop-blur-sm"
              data-ring={ring.id}
              style={{
                width: ring.size,
                height: ring.size,
                top: ring.inset,
                right: ring.inset,
                transform: `translate3d(0,0,${ring.z}px)`,
                transition: prefersReducedMotion ? "none" : "transform 500ms ease-in-out",
              }}
            >
              {ring.id === "5" ? icon : null}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-6 bottom-6 z-10" style={{ transform: "translate3d(0,0,26px)" }}>
          <p className="text-lg font-black">{title}</p>
          <p className="mt-2 text-sm text-primary-foreground/80">{description}</p>
          {actionLabel ? (
            <button className="mt-3 text-sm font-semibold underline-offset-2 hover:underline" onClick={onAction} type="button">
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
