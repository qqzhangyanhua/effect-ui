"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/liquid-gradient.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent, type ReactNode, type Ref } from "react"

const FALLBACK = [
  "var(--background)",
  "var(--primary)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--accent)",
  "var(--foreground)",
]

export interface LiquidGradientButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  colors?: string[]
  duration?: number
  href?: string
}

function colorAt(colors: readonly string[], index: number) {
  return colors[index % colors.length] ?? "var(--primary)"
}

function LiquidFill({
  palette,
  animate,
  hovered,
  cycle,
}: {
  palette: readonly string[]
  animate: boolean
  hovered: boolean
  cycle: number
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-[-20%] opacity-90">
      <style>{`@keyframes liquid-gradient-spin { to { transform: rotate(1turn); } }`}</style>
      {Array.from({ length: 7 }, (_, index) => {
        const style: CSSProperties = {
          background: `radial-gradient(circle at 30% 40%, ${colorAt(palette, index)} 0%, ${colorAt(palette, index + 3)} 28%, ${colorAt(palette, index + 7)} 58%, transparent 72%)`,
          animation: animate ? `liquid-gradient-spin ${hovered ? cycle / 4 : cycle}s linear infinite` : "none",
          animationDelay: `${index * -0.7}s`,
          transform: `rotate(${index * 28}deg) scale(1.15)`,
          mixBlendMode: index === 6 ? "hard-light" : "difference",
        }
        return <span key={index} className="absolute inset-0 blur-md" style={style} />
      })}
    </span>
  )
}

export function LiquidGradientButton({
  colors,
  duration = 14,
  href,
  className,
  children,
  type,
  onMouseEnter,
  onMouseLeave,
  ...props
}: LiquidGradientButtonProps) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !reduced && motionOn
  const [hovered, setHovered] = useState(false)
  const palette = colors && colors.length > 0 ? colors : FALLBACK
  const cycle = Math.max(0.2, duration)
  const classNames = cn(
    "relative inline-flex h-11 min-w-36 items-center justify-center overflow-hidden rounded-lg border-2 border-foreground bg-background px-4 text-sm font-semibold text-white",
    className,
  )
  const body: ReactNode = (
    <>
      <LiquidFill animate={animate} cycle={cycle} hovered={hovered} palette={palette} />
      <span className="relative z-10 inline-flex items-center gap-1 drop-shadow">{children}</span>
    </>
  )
  const enter = (event: MouseEvent<HTMLButtonElement> & MouseEvent<HTMLAnchorElement>) => {
    setHovered(true)
    onMouseEnter?.(event)
  }
  const leave = (event: MouseEvent<HTMLButtonElement> & MouseEvent<HTMLAnchorElement>) => {
    setHovered(false)
    onMouseLeave?.(event)
  }
  if (href) {
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        className={classNames}
        data-reduced={reduced ? "true" : "false"}
        data-slot="liquid-gradient-button"
        href={href}
        onMouseEnter={enter}
        onMouseLeave={leave}
      >
        {body}
      </a>
    )
  }
  return (
    <button
      {...props}
      ref={ref as Ref<HTMLButtonElement>}
      className={classNames}
      data-reduced={reduced ? "true" : "false"}
      data-slot="liquid-gradient-button"
      onMouseEnter={enter}
      onMouseLeave={leave}
      type={type ?? "button"}
    >
      {body}
    </button>
  )
}
