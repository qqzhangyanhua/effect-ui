"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author mobinkakei）— https://github.com/uiverse-io/galaxy/blob/main/loaders/mobinkakei_tricky-duck-12.html

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type HTMLAttributes } from "react"

export interface EyeBlinkLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
}

export function EyeBlinkLoader({ size = 48, color = "var(--foreground)", className, ...props }: EyeBlinkLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const pupil = Math.max(4, Math.round(size * 14 / 48))
  const shift = Math.round(size * 15 / 48)
  const blink = Math.max(4, Math.round(size * 18 / 48))
  const gap = Math.max(4, Math.round(size * 12 / 48))

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("inline-flex", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="eye-blink-loader"
      role="status"
      style={{ gap }}
    >
      <style>{`
        @keyframes effect-ui-eye-move {
          0%, 10% { background-position: 0 0; }
          13%, 40% { background-position: calc(var(--shift) * -1) 0; }
          43%, 70% { background-position: var(--shift) 0; }
          73%, 90% { background-position: 0 var(--shift); }
          93%, 100% { background-position: 0 0; }
        }
        @keyframes effect-ui-eye-blink {
          0%, 10%, 12%, 20%, 22%, 40%, 42%, 60%, 62%, 70%, 72%, 90%, 92%, 98%, 100% { height: var(--eye); }
          11%, 21%, 41%, 61%, 71%, 91%, 99% { height: var(--blink); }
        }
      `}</style>
      {[0, 1].map((eye) => (
        <span
          key={eye}
          aria-hidden
          className="block rounded-full bg-no-repeat"
          style={{
            width: size,
            height: size,
            ["--eye" as string]: `${size}px`,
            ["--blink" as string]: `${blink}px`,
            ["--shift" as string]: `${shift}px`,
            backgroundColor: color,
            backgroundImage: `radial-gradient(circle ${pupil}px, var(--background) 100%, transparent 0)`,
            animation: animate ? "effect-ui-eye-move 10s infinite, effect-ui-eye-blink 10s infinite" : "none",
          }}
        />
      ))}
    </div>
  )
}
