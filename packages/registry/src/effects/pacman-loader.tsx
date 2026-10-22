"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author andrew-demchenk0）— https://github.com/uiverse-io/galaxy/blob/main/loaders/andrew-demchenk0_kind-ladybug-7.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PacmanLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
}

const keyframes = `
@keyframes pacman-loader-top {
  0% { transform: translate(-50%, -50%) rotate(0); }
  50% { transform: translate(-50%, -50%) rotate(-30deg); }
  100% { transform: translate(-50%, -50%) rotate(0); }
}
@keyframes pacman-loader-bottom {
  0% { transform: translate(-50%, 50%) rotate(0); }
  50% { transform: translate(-50%, 50%) rotate(30deg); }
  100% { transform: translate(-50%, 50%) rotate(0); }
}
@keyframes pacman-loader-dot {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-24px, 0); }
}
@keyframes pacman-loader-eat {
  0% { transform: scale(1); }
  5%, 100% { transform: scale(0); }
}
`

export function PacmanLoader({ size = 50, color = "var(--primary)", className, ...props }: PacmanLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const scale = size / 50
  const dotLeft = [90, 60, 30, 10]

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("relative inline-block", className)}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="pacman-loader"
      role="status"
      style={{ width: 130 * scale, height: 56 * scale }}
    >
      <style>{keyframes}</style>
      <div
        className="absolute isolate"
        style={{ left: 25 * scale, top: 28 * scale, width: 110, height: 30, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <span
          aria-hidden
          className="absolute z-[1]"
          style={{
            width: 50,
            height: 25,
            backgroundColor: color,
            borderRadius: "100px 100px 0 0",
            transformOrigin: "center bottom",
            animation: active ? "pacman-loader-top 0.5s linear infinite" : "none",
            transform: active ? undefined : "translate(-50%, -50%) rotate(-30deg)",
          }}
        />
        <span
          aria-hidden
          className="absolute z-[1]"
          style={{
            width: 50,
            height: 25,
            backgroundColor: color,
            borderRadius: "0 0 100px 100px",
            transformOrigin: "center top",
            animation: active ? "pacman-loader-bottom 0.5s linear infinite" : "none",
            transform: active ? undefined : "translate(-50%, 50%) rotate(30deg)",
          }}
        />
        {dotLeft.map((left, index) => (
          <span
            key={left}
            aria-hidden
            className="absolute top-2 size-2.5 rounded-full"
            style={{
              left,
              backgroundColor: "var(--foreground)",
              animation: !active ? "none" : index === 3 ? "pacman-loader-eat 0.5s infinite" : "pacman-loader-dot 0.5s infinite",
              transform: active ? undefined : "translate(0, 0) scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
