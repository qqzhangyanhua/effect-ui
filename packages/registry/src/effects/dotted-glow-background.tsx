"use client"

// Ported from Velora UI (MIT, (c) 2026 Aigars Silkalns) — https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/dotted-glow-background.tsx. Modified for effect-ui.

import { useEffect, useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DottedGlowBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  gap?: number
  radius?: number
  opacity?: number
  speed?: number
  glows?: number
  pauseOnHover?: boolean
}

const LEVELS = 16

function rgb(color: string): [number, number, number] {
  try {
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })
    if (!context) return [0, 0, 0]
    context.fillStyle = color
    context.fillRect(0, 0, 1, 1)
    const data = context.getImageData(0, 0, 1, 1).data
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0]
  } catch {
    return [0, 0, 0]
  }
}

export function DottedGlowBackground({
  gap = 18,
  radius = 1.2,
  opacity = 0.25,
  speed = 1,
  glows = 3,
  pauseOnHover = true,
  className,
  ...props
}: DottedGlowBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(rootRef)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    const host = canvas?.parentElement?.parentElement
    if (!canvas || !context || !host) return

    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    let width = 0
    let height = 0
    let elapsed = 0
    let last = 0
    let frameId = 0
    let seen = false
    let hover = false
    let focus = false
    let tint = "0,0,0"
    let styles: string[] = []

    const colors = () => {
      const computed = getComputedStyle(canvas)
      const ink = rgb(computed.color)
      const brand = rgb(computed.getPropertyValue("--brand").trim() || computed.color)
      tint = brand.join()
      styles = Array.from({ length: LEVELS + 1 }, (_, level) => {
        const mix = level / LEVELS
        const channels = ink.map((channel, index) => Math.round(channel + ((brand[index] ?? channel) - channel) * mix))
        return `rgba(${channels.join(",")},${opacity + (1 - opacity) * mix})`
      })
    }

    const draw = () => {
      context.clearRect(0, 0, width, height)
      const travel = (elapsed / 1000) * speed * 0.15
      const reach = Math.max(width, height) * 0.13 + 30
      const lights = Array.from({ length: Math.max(0, glows) }, (_, index) => {
        const x = width * (0.5 + 0.45 * Math.sin(travel * (0.9 + index * 0.37) + index * 2.1))
        const y = height * (0.5 + 0.45 * Math.cos(travel * (0.7 + index * 0.23) + index * 1.3))
        const halo = context.createRadialGradient(x, y, 0, x, y, reach * 1.5)
        halo.addColorStop(0, `rgba(${tint},.1)`)
        halo.addColorStop(1, `rgba(${tint},0)`)
        context.fillStyle = halo
        context.fillRect(0, 0, width, height)
        return [x, y] as const
      })
      if (typeof Path2D === "undefined") return
      const paths = styles.map(() => new Path2D())
      const inverse = 1 / (2 * reach * reach)
      const spacing = Math.max(gap, 4)
      for (let x = (width % spacing) / 2 + spacing / 2; x < width; x += spacing) {
        for (let y = (height % spacing) / 2 + spacing / 2; y < height; y += spacing) {
          let brightness = 0
          for (const [lightX, lightY] of lights) {
            brightness += Math.exp(-((x - lightX) ** 2 + (y - lightY) ** 2) * inverse)
          }
          const level = Math.round(Math.min(brightness, 1) * LEVELS)
          const dot = paths[level]
          if (!dot) continue
          const dotRadius = radius * (1 + (0.6 * level) / LEVELS)
          dot.moveTo(x + dotRadius, y)
          dot.arc(x, y, dotRadius, 0, 7)
        }
      }
      paths.forEach((path, level) => {
        const fill = styles[level]
        if (!fill) return
        context.fillStyle = fill
        context.fill(path)
      })
    }

    const frame = (now: number) => {
      elapsed += Math.min(now - last, 50)
      last = now
      draw()
      frameId = requestAnimationFrame(frame)
    }

    const sync = () => {
      cancelAnimationFrame(frameId)
      const hold = media.matches || reduced || !seen || !motionOn || document.hidden || focus || (hover && pauseOnHover)
      if (hold || typeof requestAnimationFrame !== "function") draw()
      else {
        last = performance.now()
        frameId = requestAnimationFrame(frame)
      }
    }

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.max(1, width * ratio)
      canvas.height = Math.max(1, height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      sync()
    }

    const onHost = (event: Event) => {
      if (event.type === "pointerenter") hover = true
      else if (event.type === "pointerleave") hover = false
      else {
        const next = event instanceof FocusEvent ? event.relatedTarget : null
        const inside = next instanceof Node && host.contains(next)
        focus = inside || event.type === "focusin"
      }
      sync()
    }

    const events = ["pointerenter", "pointerleave", "focusin", "focusout"]
    colors()
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize)
    const intersectionObserver = new IntersectionObserver((entries) => {
      seen = entries[entries.length - 1]?.isIntersecting ?? false
      sync()
    })
    const mutationObserver = new MutationObserver(() => {
      colors()
      sync()
    })
    resizeObserver?.observe(canvas)
    intersectionObserver.observe(canvas)
    mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] })
    for (const name of events) host.addEventListener(name, onHost)
    document.addEventListener("visibilitychange", sync)
    media.addEventListener("change", sync)
    if (!resizeObserver) resize()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      intersectionObserver.disconnect()
      mutationObserver.disconnect()
      for (const name of events) host.removeEventListener(name, onHost)
      document.removeEventListener("visibilitychange", sync)
      media.removeEventListener("change", sync)
    }
  }, [gap, glows, motionOn, opacity, pauseOnHover, radius, reduced, speed])

  return (
    <div
      ref={rootRef}
      aria-hidden
      {...props}
      data-slot="dotted-glow-background"
      data-reduced={reduced ? "true" : "false"}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-fallback="dots"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  )
}
