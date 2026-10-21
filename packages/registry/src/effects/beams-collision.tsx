"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BeamsCollisionProps {
  className?: string
  count?: number
  speed?: number
  color?: string
  intensity?: number
}

interface Impact {
  id: number
  x: number
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function themeBeamColor(color: string | undefined) {
  return color === undefined || color.toLowerCase() === "#cffafe"
}

function intensityStyle(intensity: number): React.CSSProperties {
  if (intensity === 1) return {}
  if (intensity > 1) return { filter: `brightness(${intensity})` }
  return { opacity: intensity }
}

function ImpactSparks({
  x,
  color,
  intensity,
  themeColor,
}: {
  x: number
  color: string
  intensity: number
  themeColor: boolean
}) {
  return (
    <span className="pointer-events-none absolute bottom-2" style={{ left: x, ...intensityStyle(intensity) }}>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = -180 + (index / 8) * 180
        const rad = (angle * Math.PI) / 180
        return (
          <motion.span
            key={index}
            className={cn(
              "absolute top-0 left-0 h-0.5 w-3 origin-left rounded-full",
              themeColor && "bg-cyan-100",
            )}
            style={{ rotate: angle, backgroundColor: themeColor ? undefined : color }}
            initial={{ x: 0, y: 0, opacity: 1, scaleX: 0.35 }}
            animate={{ x: Math.cos(rad) * 30, y: Math.sin(rad) * 24, opacity: 0, scaleX: 1 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          />
        )
      })}
    </span>
  )
}

function BeamsCollision({
  className,
  count = 6,
  speed = 1,
  color,
  intensity = 1,
}: BeamsCollisionProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const impactId = React.useRef(0)
  const [impacts, setImpacts] = React.useState<Impact[]>([])
  const rate = playbackRate(speed)
  const themeColor = themeBeamColor(color)
  const sparkColor = color ?? "#cffafe"
  const beams = React.useMemo(
    () =>
      Array.from({ length: Math.max(1, count) }, (_, index) => ({
        id: index,
        left: 10 + ((index + 0.5) * 80) / Math.max(1, count),
        duration: (1.25 + (index % 3) * 0.32) / rate,
        delay: index * 0.16,
      })),
    [count, rate],
  )

  const spawn = (leftPercent: number) => {
    const host = hostRef.current
    if (!host || reduced) return
    impactId.current += 1
    const id = impactId.current
    const x = (leftPercent / 100) * host.clientWidth
    setImpacts((current) => [...current.slice(-18), { id, x }])
    window.setTimeout(() => {
      setImpacts((current) => current.filter((impact) => impact.id !== id))
    }, 460)
  }

  return (
    <div
      ref={hostRef}
      data-slot="beams-collision"
      className={cn(
        "relative h-72 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-950",
        className,
      )}
    >
      <style>
        {`@keyframes effect-ui-beam-fall { from { top: -28%; } to { top: 100%; } }
          @media (prefers-reduced-motion: reduce) {
            [data-slot="beams-collision"] .effect-ui-beam { animation: none; top: 42%; }
          }`}
      </style>
      <div className="absolute inset-x-0 bottom-0 h-px bg-cyan-200/70" />
      {beams.map((beam) => (
        <span
          key={beam.id}
          className="effect-ui-beam absolute w-px"
          style={{
            left: `${beam.left}%`,
            height: "24%",
            background: themeColor
              ? "linear-gradient(to bottom, transparent, #67e8f9 70%, #ecfeff)"
              : `linear-gradient(to bottom, transparent, ${sparkColor} 70%, ${sparkColor})`,
            boxShadow: themeColor
              ? "0 0 12px rgba(103,232,249,0.85)"
              : `0 0 12px color-mix(in srgb, ${sparkColor} 85%, transparent)`,
            ...intensityStyle(intensity),
            animation: reduced
              ? undefined
              : `effect-ui-beam-fall ${beam.duration}s linear ${beam.delay}s infinite`,
            top: reduced ? `${18 + beam.id * 7}%` : undefined,
          }}
          onAnimationIteration={() => spawn(beam.left)}
        />
      ))}
      {impacts.map((impact) => (
        <ImpactSparks key={impact.id} x={impact.x} color={sparkColor} intensity={intensity} themeColor={themeColor} />
      ))}
    </div>
  )
}

export { BeamsCollision }
