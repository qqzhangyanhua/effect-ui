"use client"

import { useRef, type CSSProperties, type ReactNode } from "react"

import { AuroraBackground } from "@/components/ui/aurora-background"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type HomeAtmosphereProps = {
  children: ReactNode
  className?: string
  /** 极光不透明度。保持偏低，让标题和按钮落在可读的底上。 */
  intensity?: number
  speed?: number
  size?: number
  /** 盖在极光上的径向遮罩，保护正文对比度。 */
  veil?: CSSProperties["background"]
}

export function HomeAtmosphere({
  children,
  className,
  intensity = 0.46,
  speed = 0.32,
  size = 72,
  veil,
}: HomeAtmosphereProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const motion = reduced ? "off" : live ? "live" : "paused"

  return (
    <div ref={ref} data-home-atmosphere="" data-motion={motion} className={cn("group/atmos", className)}>
      <AuroraBackground
        intensity={intensity}
        speed={speed}
        size={size}
        className={cn(
          "rounded-none bg-transparent",
          motion !== "live" && "[&_*]:[animation-play-state:paused]",
        )}
      >
        {veil ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: veil }} />
        ) : null}
        <div className="relative z-10">{children}</div>
      </AuroraBackground>
    </div>
  )
}
