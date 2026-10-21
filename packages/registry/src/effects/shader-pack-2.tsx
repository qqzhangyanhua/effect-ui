"use client"

import { useRef, type ReactNode } from "react"
import {
  FlutedGlass,
  GodRays,
  LiquidMetal,
  PulsingBorder,
  SmokeRing,
  Swirl,
  Voronoi,
  Water,
} from "@paper-design/shaders-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ShaderPack2Variant =
  | "liquid-metal"
  | "god-rays"
  | "water"
  | "smoke-ring"
  | "pulsing-border"
  | "voronoi"
  | "swirl"
  | "fluted-glass"

export interface ShaderPack2Props {
  variant?: ShaderPack2Variant
  className?: string
  image?: string
  speed?: number
  scale?: number
  children?: ReactNode
}

const SAMPLE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500">
      <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#1e1b4b"/><stop offset="50%" stop-color="#7c3aed"/>
        <stop offset="100%" stop-color="#22d3ee"/>
      </linearGradient></defs>
      <rect width="800" height="500" fill="url(#g)"/>
    </svg>`,
  )

const presetSpeed: Record<ShaderPack2Variant, number> = {
  "liquid-metal": 1,
  "god-rays": 0.75,
  water: 1,
  "smoke-ring": 0.5,
  "pulsing-border": 1,
  voronoi: 0.5,
  swirl: 0.32,
  "fluted-glass": 0,
}

// defaultPreset.params.scale。没写的沿用对象尺寸 1。
const presetScale: Record<ShaderPack2Variant, number> = {
  "liquid-metal": 0.6,
  "god-rays": 1,
  water: 0.8,
  "smoke-ring": 0.8,
  "pulsing-border": 0.6,
  voronoi: 0.5,
  swirl: 1,
  "fluted-glass": 1,
}

function librarySpeed(preset: number, speed: number, paused: boolean) {
  if (paused) return 0
  const rate = Number.isFinite(speed) && speed > 0 ? speed : 1
  if (rate === 1) return undefined
  return preset * rate
}

function libraryScale(preset: number, scale: number) {
  if (scale === 1) return undefined
  return preset * scale
}

function ShaderLayer({
  variant,
  image,
  speed,
  scale,
}: {
  variant: ShaderPack2Variant
  image: string
  speed: number | undefined
  scale: number | undefined
}) {
  const shared = { className: "size-full", width: "100%", height: "100%", speed, scale }
  if (variant === "god-rays") return <GodRays {...shared} />
  if (variant === "water") return <Water {...shared} image={image} />
  if (variant === "smoke-ring") return <SmokeRing {...shared} />
  if (variant === "pulsing-border") return <PulsingBorder {...shared} />
  if (variant === "voronoi") return <Voronoi {...shared} />
  if (variant === "swirl") return <Swirl {...shared} />
  if (variant === "fluted-glass") return <FlutedGlass {...shared} image={image} />
  return <LiquidMetal {...shared} image={image} />
}

function ShaderPack2({
  variant = "liquid-metal",
  className,
  image = SAMPLE,
  speed = 1,
  scale = 1,
  children,
}: ShaderPack2Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(rootRef)
  const reducedMotion = usePrefersReducedMotion()
  const motionSpeed = librarySpeed(presetSpeed[variant], speed, !active || reducedMotion)
  const motionScale = libraryScale(presetScale[variant], scale)

  return (
    <div ref={rootRef} className={cn("relative min-h-48 overflow-hidden bg-zinc-950", className)}>
      <div className="absolute inset-0">
        <ShaderLayer variant={variant} image={image} speed={motionSpeed} scale={motionScale} />
      </div>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { ShaderPack2 }
