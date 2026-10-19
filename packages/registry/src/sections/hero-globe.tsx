"use client"

import * as React from "react"
import createGlobe, { type Arc, type Marker } from "cobe"

import { Button } from "@/components/ui/button"
import { GlobeSphere } from "@/components/ui/globe-sphere"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HeroGlobeProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
}

const defaultMarkers: Marker[] = [
  { location: [37.77, -122.42], size: 0.06 },
  { location: [40.71, -74.01], size: 0.05 },
  { location: [51.51, -0.13], size: 0.05 },
  { location: [35.68, 139.69], size: 0.06 },
  { location: [1.35, 103.82], size: 0.045 },
]

const defaultArcs: Arc[] = [
  { from: [37.77, -122.42], to: [40.71, -74.01] },
  { from: [40.71, -74.01], to: [51.51, -0.13] },
  { from: [51.51, -0.13], to: [35.68, 139.69] },
  { from: [35.68, 139.69], to: [1.35, 103.82] },
]

function canUseWebGL() {
  try {
    const probe = document.createElement("canvas")
    return Boolean(probe.getContext("webgl") || probe.getContext("experimental-webgl"))
  } catch {
    return false
  }
}

function HeroGlobe({
  title = "把全球节点画在一颗 5KB 的球上",
  subtitle = "cobe（MIT）地球仪，带城市标记与航线。无 WebGL 或减弱动效时回退静态渐变与 CSS 球。",
  ctaLabel = "查看覆盖",
  markers = defaultMarkers,
  arcs = defaultArcs,
  className,
}: HeroGlobeProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
    if (!canUseWebGL()) {
      queueMicrotask(() => setFallback(true))
      return
    }
    const size = () => {
      const box = canvas.getBoundingClientRect()
      return Math.max(1, Math.floor(Math.min(box.width, box.height)))
    }
    let phi = 0
    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: size() * 2,
      height: size() * 2,
      phi: 0,
      theta: 0.15,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 14000,
      mapBrightness: 6,
      baseColor: [0.22, 0.2, 0.32],
      markerColor: [0.67, 0.51, 1],
      glowColor: [0.85, 0.8, 1],
      markers,
      arcs,
      arcColor: [0.55, 0.4, 1],
      arcWidth: 0.55,
      arcHeight: 0.28,
      markerElevation: 0.02,
    })
    let frame = 0
    const tick = () => {
      phi += 0.004
      globe.update({ phi, width: size() * 2, height: size() * 2 })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      globe.destroy()
    }
  }, [arcs, markers, reduced])

  const showFallback = reduced || fallback

  return (
    <section
      className={cn(
        "relative isolate grid min-h-[28rem] overflow-hidden rounded-2xl border bg-zinc-950 md:grid-cols-2",
        className,
      )}
    >
      {showFallback ? (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e1b4b,#312e81,#0f172a)]" />
      ) : null}
      <div className="relative z-10 flex flex-col justify-center gap-4 px-8 py-14 text-white">
        <p className="text-xs tracking-[0.28em] text-white/55 uppercase">Hero Globe</p>
        <h2 className="font-display text-4xl tracking-tight text-balance">{title}</h2>
        <p className="max-w-md text-sm text-white/65">{subtitle}</p>
        <div className="flex gap-2">
          <ShimmerButton>{ctaLabel}</ShimmerButton>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            文档
          </Button>
        </div>
      </div>
      <div className="relative grid min-h-72 place-items-center">
        {showFallback ? (
          <GlobeSphere className="size-56" dots={56} />
        ) : (
          <canvas
            ref={canvasRef}
            className="size-[min(100%,22rem)] max-w-full"
            aria-hidden
          />
        )}
      </div>
    </section>
  )
}

export { HeroGlobe }
