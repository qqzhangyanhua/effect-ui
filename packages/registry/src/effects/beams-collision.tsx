"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BeamsCollisionProps {
  className?: string
  count?: number
}

interface Impact {
  id: number
  x: number
}

function ImpactSparks({ x }: { x: number }) {
  return (
    <span className="pointer-events-none absolute bottom-2" style={{ left: x }}>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = -180 + (index / 8) * 180
        const rad = (angle * Math.PI) / 180
        return (
          <motion.span
            key={index}
            className="absolute top-0 left-0 h-0.5 w-3 origin-left rounded-full bg-cyan-100"
            style={{ rotate: angle }}
            initial={{ x: 0, y: 0, opacity: 1, scaleX: 0.35 }}
            animate={{ x: Math.cos(rad) * 30, y: Math.sin(rad) * 24, opacity: 0, scaleX: 1 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          />
        )
      })}
    </span>
  )
}

function BeamsCollision({ className, count = 6 }: BeamsCollisionProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const impactId = React.useRef(0)
  const [impacts, setImpacts] = React.useState<Impact[]>([])
  const beams = React.useMemo(
    () =>
      Array.from({ length: Math.max(1, count) }, (_, index) => ({
        id: index,
        left: 10 + ((index + 0.5) * 80) / Math.max(1, count),
        duration: 1.25 + (index % 3) * 0.32,
        delay: index * 0.16,
      })),
    [count],
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
            background: "linear-gradient(to bottom, transparent, #67e8f9 70%, #ecfeff)",
            boxShadow: "0 0 12px rgba(103,232,249,0.85)",
            animation: reduced
              ? undefined
              : `effect-ui-beam-fall ${beam.duration}s linear ${beam.delay}s infinite`,
            top: reduced ? `${18 + beam.id * 7}%` : undefined,
          }}
          onAnimationIteration={() => spawn(beam.left)}
        />
      ))}
      {impacts.map((impact) => (
        <ImpactSparks key={impact.id} x={impact.x} />
      ))}
    </div>
  )
}

export { BeamsCollision }
