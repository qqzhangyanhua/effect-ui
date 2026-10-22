"use client"

import { cn } from "@/lib/utils"

const ANGLES = {
  top: 0,
  right: 90,
  bottom: 180,
  left: 270,
} as const

export interface ProgressiveBlurProps {
  direction?: keyof typeof ANGLES
  blurLayers?: number
  blurIntensity?: number
  intensity?: number
  className?: string
}

function ProgressiveBlur({
  direction = "bottom",
  blurLayers = 8,
  blurIntensity = 0.25,
  intensity,
  className,
}: ProgressiveBlurProps) {
  const layers = Math.max(blurLayers, 2)
  const segment = 1 / (layers + 1)
  const angle = ANGLES[direction]
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity

  return (
    <div className={cn("pointer-events-none relative", className)}>
      {Array.from({ length: layers }, (_, index) => {
        const stops = [index * segment, (index + 1) * segment, (index + 2) * segment, (index + 3) * segment]
          .map((pos, posIndex) => `rgba(255,255,255,${posIndex === 1 || posIndex === 2 ? 1 : 0}) ${pos * 100}%`)
          .join(", ")
        const gradient = `linear-gradient(${angle}deg, ${stops})`
        const blur = gain === 1 ? index * blurIntensity : index * blurIntensity * gain
        return (
          <div
            key={index}
            className="absolute inset-0 rounded-[inherit]"
            style={{
              maskImage: gradient,
              WebkitMaskImage: gradient,
              backdropFilter: `blur(${blur}px)`,
            }}
          />
        )
      })}
    </div>
  )
}

export { ProgressiveBlur }
