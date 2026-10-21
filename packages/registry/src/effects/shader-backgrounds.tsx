"use client"

import { useRef, type ReactNode } from "react"
import {
  Dithering,
  GrainGradient,
  MeshGradient,
  Metaballs,
  Warp,
} from "@paper-design/shaders-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ShaderBackgroundVariant =
  | "mesh"
  | "grain"
  | "dithering"
  | "metaballs"
  | "warp"

export interface ShaderBackgroundProps {
  variant?: ShaderBackgroundVariant
  className?: string
  colors?: string[]
  speed?: number
  scale?: number
  children?: ReactNode
}

const defaults: Record<ShaderBackgroundVariant, string[]> = {
  mesh: ["#1e1b4b", "#7c3aed", "#22d3ee", "#0f172a"],
  grain: ["#0f172a", "#6366f1", "#f472b6"],
  dithering: ["#111827", "#22d3ee"],
  metaballs: ["#4f46e5", "#ec4899", "#22d3ee"],
  warp: ["#020617", "#6366f1", "#f59e0b"],
}

const presetSpeed: Record<ShaderBackgroundVariant, number> = {
  mesh: 1,
  grain: 1,
  dithering: 1,
  metaballs: 1,
  warp: 1,
}

// defaultPreset.params.scale。对象尺寸默认是 1，dithering 自己写成 0.6。
const presetScale: Record<ShaderBackgroundVariant, number> = {
  mesh: 1,
  grain: 1,
  dithering: 0.6,
  metaballs: 1,
  warp: 1,
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
  colors,
  speed,
  scale,
}: {
  variant: ShaderBackgroundVariant
  colors: string[]
  speed: number | undefined
  scale: number | undefined
}) {
  const shared = {
    className: "size-full",
    width: "100%",
    height: "100%",
    speed,
    scale,
  }

  if (variant === "grain") {
    return <GrainGradient {...shared} colors={colors} colorBack={colors[0]} />
  }
  if (variant === "dithering") {
    return (
      <Dithering
        {...shared}
        colorBack={colors[0] ?? "#111827"}
        colorFront={colors[1] ?? "#22d3ee"}
      />
    )
  }
  if (variant === "metaballs") {
    return <Metaballs {...shared} colors={colors} colorBack={colors[0]} />
  }
  if (variant === "warp") {
    return <Warp {...shared} colors={colors} />
  }
  return <MeshGradient {...shared} colors={colors} />
}

function ShaderBackground({
  variant = "mesh",
  className,
  colors,
  speed = 1,
  scale = 1,
  children,
}: ShaderBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(rootRef)
  const reducedMotion = usePrefersReducedMotion()
  const palette = colors ?? defaults[variant]
  const motionSpeed = librarySpeed(presetSpeed[variant], speed, !active || reducedMotion)
  const motionScale = libraryScale(presetScale[variant], scale)

  return (
    <div
      ref={rootRef}
      className={cn("relative min-h-48 overflow-hidden", className)}
      style={{ background: `linear-gradient(135deg, ${palette.join(", ")})` }}
    >
      <div className="absolute inset-0">
        <ShaderLayer variant={variant} colors={palette} speed={motionSpeed} scale={motionScale} />
      </div>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { ShaderBackground }
