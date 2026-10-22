"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/analog-stick.tsx

import { useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const directions = ["up", "right", "down", "left"] as const

type Direction = (typeof directions)[number]

const labels: Record<Direction, string> = {
  up: "Up",
  right: "Right",
  down: "Down",
  left: "Left",
}

const icons: Record<Direction, { viewBox: string; path: string }> = {
  up: {
    viewBox: "0 0 1024 1024",
    path: "M512 330.7c14.9 0 29.9 4.3 40.5 14.9l277.3 234.7c27.7 23.5 29.9 64 8.5 89.6-23.5 27.7-64 29.9-89.6 8.5L512 477.9 275.2 678.4c-27.7 23.5-68.3 19.2-89.6-8.5-23.5-27.7-19.2-68.3 8.5-89.6l277.3-234.7c10.7-10.7 25.6-14.9 40.6-14.9z",
  },
  right: {
    viewBox: "0 0 200 200",
    path: "M135.4 100c0 2.9-.8 5.8-2.9 7.9L86.7 162.1c-4.6 5.4-12.5 5.8-17.5 1.7-5.4-4.6-5.8-12.5-1.7-17.5L106.7 100 67.5 53.8c-4.6-5.4-3.8-13.3 1.7-17.5 5.4-4.6 13.3-3.8 17.5 1.7l45.8 54.2c2.1 2.1 2.9 5 2.9 7.8z",
  },
  down: {
    viewBox: "0 0 200 200",
    path: "M100 135.4c-2.9 0-5.8-.8-7.9-2.9L37.9 86.7c-5.4-4.6-5.8-12.5-1.7-17.5 4.6-5.4 12.5-5.8 17.5-1.7L100 106.7l46.3-39.2c5.4-4.6 13.3-3.8 17.5 1.7 4.6 5.4 3.8 13.3-1.7 17.5l-54.2 45.8c-2.1 2.1-5 2.9-7.9 2.9z",
  },
  left: {
    viewBox: "0 0 200 200",
    path: "M64.6 100c0-2.9.8-5.8 2.9-7.9L113.3 37.9c4.6-5.4 12.5-5.8 17.5-1.7 5.4 4.6 5.8 12.5 1.7 17.5L93.3 100l39.2 46.3c4.6 5.4 3.8 13.3-1.7 17.5-5.4 4.6-13.3 3.8-17.5-1.7L67.5 107.9c-2.1-2.1-2.9-5-2.9-7.9z",
  },
}

const keyMap: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowRight: "right",
  ArrowDown: "down",
  ArrowLeft: "left",
}

export interface AnalogStickProps {
  color?: string
  duration?: number
  size?: number
  intensity?: number
  label?: string
  className?: string
}

export function AnalogStick({
  color = "var(--primary)",
  duration = 250,
  size = 300,
  intensity = 8,
  label = "Directional pressure button",
  className,
}: AnalogStickProps) {
  const ref = useRef<HTMLElement>(null)
  const live = useAnimationActive(ref)
  const reduced = usePrefersReducedMotion()
  const [dir, setDir] = useState<Direction | null>(null)
  const tilt = reduced ? 0 : intensity
  const nudge = reduced ? 0 : Math.max(2, size * 0.016)
  const transform =
    dir === "up"
      ? `translate3d(0, ${-nudge}px, 0) rotateX(${tilt}deg)`
      : dir === "right"
        ? `translate3d(${nudge}px, 0, 0) rotateY(${tilt}deg)`
        : dir === "left"
          ? `translate3d(${-nudge}px, 0, 0) rotateY(${-tilt}deg)`
          : dir === "down"
            ? `translate3d(0, ${nudge}px, 0) rotateX(${-tilt}deg)`
            : "none"

  return (
    <section
      ref={ref}
      aria-label={label}
      data-direction={dir ?? "none"}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative isolate", className)}
      style={{ width: size, height: size, color }}
      onKeyDown={(event) => {
        const next = keyMap[event.key]
        if (!next) return
        event.preventDefault()
        setDir(next)
      }}
      onKeyUp={(event) => {
        if (keyMap[event.key]) setDir(null)
      }}
    >
      <div className="absolute inset-[8%] rounded-full bg-[linear-gradient(180deg,var(--muted),var(--border))] shadow-[inset_0_0_18px_color-mix(in_srgb,var(--foreground)_55%,transparent)]">
        <div
          className="stick absolute top-1/2 left-1/2 size-[42%] rounded-full bg-[linear-gradient(180deg,var(--card),var(--muted))] shadow-[0_10px_16px_color-mix(in_srgb,var(--foreground)_28%,transparent),inset_0_3px_3px_color-mix(in_srgb,var(--background)_70%,transparent)] motion-reduce:transition-none motion-reduce:!transform-none"
          style={{
            transform,
            transitionProperty: "transform, box-shadow",
            transitionDuration: reduced ? "0ms" : `${duration}ms`,
            transformStyle: "preserve-3d",
          }}
        >
          <div className="absolute inset-[16%] rounded-full bg-[linear-gradient(180deg,var(--muted),var(--card))] shadow-[inset_0_3px_6px_color-mix(in_srgb,var(--foreground)_18%,transparent)]">
            {directions.map((name) => (
              <span
                key={name}
                aria-hidden="true"
                className={cn(
                  "absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--background)] shadow-[0_1px_1px_color-mix(in_srgb,var(--foreground)_30%,transparent)]",
                  name === "up" && "top-[12%] left-1/2",
                  name === "right" && "top-1/2 left-[88%]",
                  name === "down" && "top-[88%] left-1/2",
                  name === "left" && "top-1/2 left-[12%]",
                  dir === name && "bg-current",
                )}
              />
            ))}
          </div>
        </div>
        {directions.map((name) => (
          <svg
            key={name}
            aria-hidden="true"
            viewBox={icons[name].viewBox}
            className={cn(
              "pointer-events-none absolute size-[10%] -translate-x-1/2 -translate-y-1/2 fill-[var(--muted-foreground)]",
              name === "up" && "top-[6%] left-1/2",
              name === "right" && "top-1/2 left-[94%]",
              name === "down" && "top-[94%] left-1/2",
              name === "left" && "top-1/2 left-[6%]",
              dir === name && "fill-current",
            )}
          >
            <path d={icons[name].path} />
          </svg>
        ))}
      </div>
      {directions.map((name) => (
        <button
          key={name}
          type="button"
          aria-label={labels[name]}
          aria-pressed={dir === name}
          className={cn(
            "absolute z-10 size-[42%] rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
            name === "up" && "top-0 left-[29%]",
            name === "right" && "top-[29%] right-0",
            name === "down" && "bottom-0 left-[29%]",
            name === "left" && "top-[29%] left-0",
          )}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setDir(name)
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== "mouse") return
            if (event.currentTarget === document.activeElement) return
            setDir((current) => (current === name ? null : current))
          }}
          onPointerDown={() => setDir(name)}
          onPointerUp={(event) => {
            if (event.currentTarget === document.activeElement) return
            setDir((current) => (current === name ? null : current))
          }}
          onPointerCancel={() => setDir((current) => (current === name ? null : current))}
          onClick={() => setDir(name)}
          onFocus={() => setDir(name)}
          onBlur={() => setDir((current) => (current === name ? null : current))}
        />
      ))}
    </section>
  )
}

export default AnalogStick
