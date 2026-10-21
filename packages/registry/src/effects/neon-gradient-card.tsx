"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/neon-gradient-card.tsx

import { useRef, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useMeasure } from "@/hooks/use-measure"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface NeonGradientCardProps {
  children?: ReactNode
  colors?: readonly string[]
  borderSize?: number
  borderRadius?: number
  className?: string
}

function NeonGradientCard({
  children,
  colors = ["#ff00aa", "#00fff1"],
  borderSize = 2,
  borderRadius = 20,
  className,
}: NeonGradientCardProps) {
  const reduced = usePrefersReducedMotion()
  const nodeRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(nodeRef)
  const [measureRef, size] = useMeasure<HTMLDivElement>()
  const first = colors[0] ?? "#ff00aa"
  const second = colors[1] ?? "#00fff1"
  const animated = !reduced && active

  return (
    <div
      ref={(node) => {
        nodeRef.current = node
        measureRef(node)
      }}
      data-slot="neon-gradient-card"
      data-animated={animated ? "true" : "false"}
      className={cn("relative w-full", className)}
      style={
        {
          "--neon-border": `${borderSize}px`,
          "--neon-radius": `${borderRadius}px`,
          "--neon-first": first,
          "--neon-second": second,
          "--neon-blur": `${Math.max(16, size.width / 3)}px`,
        } as CSSProperties
      }
    >
      <style>
        {`@keyframes effect-ui-neon-flow { from { background-position: 0% 0%; } to { background-position: 0% 200%; } }
[data-slot="neon-gradient-card"] .neon-flow {
  position: absolute;
  inset: calc(var(--neon-border) * -1);
  border-radius: var(--neon-radius);
  background-image: linear-gradient(0deg, var(--neon-first), var(--neon-second), var(--neon-first));
  background-size: 100% 200%;
  z-index: 0;
}
[data-slot="neon-gradient-card"] .neon-glow { filter: blur(var(--neon-blur)); opacity: 0.75; }
[data-slot="neon-gradient-card"][data-animated="true"] .neon-flow { animation: effect-ui-neon-flow 3.2s linear infinite; }`}
      </style>
      <div aria-hidden className="neon-flow neon-glow" />
      <div aria-hidden className="neon-flow" />
      <div
        className="relative z-10 bg-card p-6 text-card-foreground"
        style={{ borderRadius: Math.max(0, borderRadius - borderSize) }}
      >
        {children}
      </div>
    </div>
  )
}

export { NeonGradientCard }
