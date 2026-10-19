"use client"

import type { ReactNode } from "react"
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

function ShaderLayer({ variant, image }: { variant: ShaderPack2Variant; image: string }) {
  const shared = { className: "size-full", width: "100%", height: "100%" }
  if (variant === "god-rays") return <GodRays {...shared} />
  if (variant === "water") return <Water {...shared} image={image} />
  if (variant === "smoke-ring") return <SmokeRing {...shared} />
  if (variant === "pulsing-border") return <PulsingBorder {...shared} />
  if (variant === "voronoi") return <Voronoi {...shared} />
  if (variant === "swirl") return <Swirl {...shared} />
  if (variant === "fluted-glass") return <FlutedGlass {...shared} image={image} />
  return <LiquidMetal {...shared} image={image} />
}

function ShaderPack2({ variant = "liquid-metal", className, image = SAMPLE, children }: ShaderPack2Props) {
  return (
    <div className={cn("relative min-h-48 overflow-hidden bg-zinc-950", className)}>
      <div className="absolute inset-0">
        <ShaderLayer variant={variant} image={image} />
      </div>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { ShaderPack2 }
