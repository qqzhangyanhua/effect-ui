"use client"

import * as React from "react"
import { useScroll, useMotionValueEvent } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const Hero3DCanvas = React.lazy(() =>
  import("./hero-3d-canvas").then((mod) => ({ default: mod.Hero3DCanvas })),
)

export interface Hero3DModelProps {
  title?: string
  className?: string
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

class SceneBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function StaticGem() {
  return (
    <div className="grid size-48 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#f5d0fe,#7c3aed_45%,#09090b)] shadow-[0_0_40px_#7c3aed55]">
      <span className="size-16 rounded-full bg-white/30 blur-md" />
    </div>
  )
}

function Hero3DModel({ title = "滚动带动一枚玻璃体", className }: Hero3DModelProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const progress = React.useRef(0)
  const webgl = React.useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => false,
  )
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progress.current = value
  })

  const showCanvas = webgl && !reduced

  return (
    <section ref={ref} className={cn("overflow-hidden rounded-2xl border bg-zinc-950 text-white", className)}>
      <div className="grid items-center gap-6 px-6 py-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-white/50 uppercase">Glass</p>
          <h2 className="font-display mt-3 text-4xl tracking-tight">{title}</h2>
        </div>
        <div className="relative h-80">
          {showCanvas ? (
            <SceneBoundary fallback={<div className="grid h-full place-items-center"><StaticGem /></div>}>
              <React.Suspense fallback={<div className="grid h-full place-items-center"><StaticGem /></div>}>
                <Hero3DCanvas progress={progress} />
              </React.Suspense>
            </SceneBoundary>
          ) : (
            <div className="grid h-full place-items-center">
              <StaticGem />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export { Hero3DModel }
