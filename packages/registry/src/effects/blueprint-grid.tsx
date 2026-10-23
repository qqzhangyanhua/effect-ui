"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/blueprint-grid/blueprint-grid.tsx

import { useEffect, useId, useRef, type CSSProperties, type HTMLAttributes } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type BlueprintGridProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "lines" | "dots" | "perspective"
  color?: string
  duration?: number
  intensity?: number
  size?: number
  sweep?: boolean
  spotlight?: boolean
  spotlightColor?: string
  spotlightRadius?: number
}

export function BlueprintGrid({
  variant = "lines",
  color = "var(--border)",
  duration = 8000,
  intensity = 1,
  size = 32,
  sweep = true,
  spotlight = true,
  spotlightColor = "var(--primary)",
  spotlightRadius = 200,
  className,
  style,
  ...props
}: BlueprintGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const sweepName = `blueprint-sweep-${useId().replace(/:/g, "")}`
  const cell = Math.max(8, size)

  useEffect(() => {
    const root = ref.current
    if (!root || !spotlight) return
    const target = root.offsetParent instanceof HTMLElement ? root.offsetParent : root
    const place = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      root.style.setProperty("--bx", `${event.clientX - rect.left}px`)
      root.style.setProperty("--by", `${event.clientY - rect.top}px`)
      root.style.setProperty("--bo", "0.55")
    }
    const clear = () => root.style.setProperty("--bo", "0")
    target.addEventListener("pointermove", place)
    target.addEventListener("pointerdown", place)
    target.addEventListener("pointerleave", clear)
    target.addEventListener("pointercancel", clear)
    return () => {
      target.removeEventListener("pointermove", place)
      target.removeEventListener("pointerdown", place)
      target.removeEventListener("pointerleave", clear)
      target.removeEventListener("pointercancel", clear)
    }
  }, [spotlight])

  const grid =
    variant === "dots"
      ? `radial-gradient(${color} 1px, transparent 1.5px)`
      : `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`
  const gridSize = `${cell}px ${cell}px`
  const opacity = Math.max(0.15, Math.min(1, intensity)) * 0.5
  const mask = `radial-gradient(circle ${spotlightRadius}px at var(--bx, 50%) var(--by, 50%), #000 0%, #000 35%, transparent 75%)`

  return (
    <div
      ref={ref}
      data-slot="blueprint-grid"
      data-motion={live && !reduced ? "on" : "off"}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ "--bo": "0", ...style } as CSSProperties}
      {...props}
    >
      <style>{`@keyframes ${sweepName}{0%{transform:translate(-50%,-50%) rotate(25deg);opacity:0}15%,85%{opacity:1}100%{transform:translate(150%,150%) rotate(25deg);opacity:0}}`}</style>
      {variant === "perspective" ? (
        <div className="absolute inset-0" style={{ perspective: 600, perspectiveOrigin: "50% 0%" }}>
          <div
            className="absolute right-[-50%] bottom-0 left-[-50%] h-[160%] origin-bottom"
            style={{
              opacity,
              backgroundImage: grid,
              backgroundSize: `${gridSize}, ${gridSize}`,
              transform: "rotateX(72deg)",
              maskImage: "linear-gradient(to top, #000, transparent)",
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0" style={{ opacity, backgroundImage: grid, backgroundSize: variant === "dots" ? gridSize : `${gridSize}, ${gridSize}` }} />
      )}
      {spotlight && variant !== "perspective" ? (
        <div
          className="absolute inset-0 motion-reduce:transition-none"
          style={{
            opacity: "var(--bo)",
            transition: "opacity 300ms ease-out",
            backgroundImage: `radial-gradient(circle ${spotlightRadius}px at var(--bx, 50%) var(--by, 50%), color-mix(in oklab, ${spotlightColor}, transparent 90%), transparent 65%), ${
              variant === "dots"
                ? `radial-gradient(color-mix(in oklab, ${spotlightColor}, transparent 35%) 1px, transparent 1.5px)`
                : `linear-gradient(to right, color-mix(in oklab, ${spotlightColor}, transparent 35%) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, ${spotlightColor}, transparent 35%) 1px, transparent 1px)`
            }`,
            backgroundSize: variant === "dots" ? `auto, ${gridSize}` : `auto, ${gridSize}, ${gridSize}`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      ) : null}
      {sweep ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-[140%] w-[55%] motion-reduce:hidden"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, color-mix(in oklab, ${color}, transparent 20%), transparent)`,
            filter: "blur(14px)",
            animationName: reduced ? undefined : sweepName,
            animationDuration: reduced ? undefined : `${Math.max(200, duration)}ms`,
            animationTimingFunction: reduced ? undefined : "linear",
            animationIterationCount: reduced ? undefined : "infinite",
            animationPlayState: live && !reduced ? "running" : "paused",
          }}
        />
      ) : null}
    </div>
  )
}
