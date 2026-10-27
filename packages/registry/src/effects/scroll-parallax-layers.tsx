"use client"

import { Children, isValidElement, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type ScrollParallaxDirection = "left" | "right" | "up" | "down"

export interface ScrollParallaxLayersProps {
  intensity?: number
  layers?: number
  direction?: ScrollParallaxDirection
  className?: string
  children?: ReactNode
}

const rates = { back: 0.18, mid: 0.46, front: 0.92 } as const

function subscribeCoarse(onChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function coarseNow() {
  return window.matchMedia("(pointer: coarse)").matches
}

function useCoarsePointer() {
  return useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function layerCount(layers: number) {
  if (!Number.isFinite(layers)) return 3
  return Math.min(3, Math.max(2, Math.round(layers)))
}

function slotOf(children: ReactNode, type: (props: { children?: ReactNode }) => ReactNode) {
  let content: ReactNode
  let found = false
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== type) return
    content = (child.props as { children?: ReactNode }).children
    found = true
  })
  return found ? content : undefined
}

export function ScrollParallaxLayersBack({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export function ScrollParallaxLayersMid({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

export function ScrollParallaxLayersFront({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

const fallback = {
  back: <div className="absolute inset-0 bg-primary/15" />,
  mid: <div className="absolute left-[14%] top-[22%] h-36 w-52 rounded-3xl bg-chart-2/50" />,
  front: (
    <div className="absolute bottom-[16%] right-[12%] max-w-xs rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <p className="font-display text-2xl tracking-tight">前景先走一步</p>
      <p className="mt-2 text-sm text-muted-foreground">后面的两层跟得更慢。</p>
    </div>
  ),
}

export function ScrollParallaxLayers({
  intensity = 0.6,
  layers = 3,
  direction = "up",
  className,
  children,
}: ScrollParallaxLayersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const coarse = useCoarsePointer()
  const count = layerCount(layers)
  const back = slotOf(children, ScrollParallaxLayersBack) ?? fallback.back
  const mid = slotOf(children, ScrollParallaxLayersMid) ?? fallback.mid
  const front = slotOf(children, ScrollParallaxLayersFront) ?? fallback.front
  const amp = clamp01(intensity)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-layer]")]
    const clear = () => {
      for (const node of nodes) node.style.transform = ""
    }
    if (reduced || !live) {
      clear()
      return
    }
    let frame = 0
    const measure = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      const view = window.innerHeight || 800
      const span = view + (rect.height || 1)
      const progress = Math.min(1, Math.max(0, (view - rect.top) / span))
      const travel = amp * 160 * (coarse ? 0.5 : 1)
      const signed = (progress - 0.5) * 2
      for (const node of nodes) {
        const rate = Number(node.dataset.rate ?? "0")
        const delta = signed * travel * rate
        const x = direction === "left" ? -delta : direction === "right" ? delta : 0
        const y = direction === "up" ? -delta : direction === "down" ? delta : 0
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [amp, coarse, direction, live, reduced])

  return (
    <div
      ref={ref}
      data-slot="scroll-parallax-layers"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "true" : "false"}
      data-coarse={coarse ? "true" : "false"}
      data-layers={count}
      data-direction={direction}
      data-intensity={intensity}
      className={cn("relative h-[28rem] overflow-hidden rounded-3xl border border-border bg-background motion-reduce:transform-none", className)}
    >
      <div data-layer="back" data-rate={rates.back} className="absolute inset-0 motion-reduce:transform-none">
        {back}
      </div>
      {count === 3 ? (
        <div data-layer="mid" data-rate={rates.mid} className="absolute inset-0 motion-reduce:transform-none">
          {mid}
        </div>
      ) : null}
      <div data-layer="front" data-rate={rates.front} className="absolute inset-0 motion-reduce:transform-none">
        {front}
      </div>
    </div>
  )
}
