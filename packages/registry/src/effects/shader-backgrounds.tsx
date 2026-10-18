"use client"

import type { ReactNode } from "react"
import {
  Dithering,
  GrainGradient,
  MeshGradient,
  Metaballs,
  Warp,
} from "@paper-design/shaders-react"

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
  children?: ReactNode
}

const defaults: Record<ShaderBackgroundVariant, string[]> = {
  mesh: ["#1e1b4b", "#7c3aed", "#22d3ee", "#0f172a"],
  grain: ["#0f172a", "#6366f1", "#f472b6"],
  dithering: ["#111827", "#22d3ee"],
  metaballs: ["#4f46e5", "#ec4899", "#22d3ee"],
  warp: ["#020617", "#6366f1", "#f59e0b"],
}

function ShaderLayer({
  variant,
  colors,
}: {
  variant: ShaderBackgroundVariant
  colors: string[]
}) {
  const shared = { className: "size-full", width: "100%", height: "100%" }

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
  children,
}: ShaderBackgroundProps) {
  const palette = colors ?? defaults[variant]

  return (
    <div className={cn("relative min-h-48 overflow-hidden", className)}>
      <div className="absolute inset-0">
        <ShaderLayer variant={variant} colors={palette} />
      </div>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { ShaderBackground }
