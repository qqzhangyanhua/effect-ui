"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HyperspaceTextProps {
  phrases?: string[]
  className?: string
}

interface Bit {
  x: number
  y: number
  tx: number
  ty: number
  vx: number
  vy: number
}

const DEFAULTS = ["把句子拆成光", "再把它拼回来", "下一段已经就位"]

function samplePhrase(text: string, width: number, height: number) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) return [] as { x: number; y: number }[]
  context.clearRect(0, 0, width, height)
  context.fillStyle = "#fff"
  context.font = "600 54px sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillText(text, width / 2, height / 2)
  const pixels = context.getImageData(0, 0, width, height).data
  const points: { x: number; y: number }[] = []
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if ((pixels[(y * width + x) * 4 + 3] ?? 0) > 140) points.push({ x, y })
    }
  }
  return points
}

function HyperspaceText({ phrases = DEFAULTS, className }: HyperspaceTextProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [index, setIndex] = React.useState(0)
  const [fading, setFading] = React.useState(false)
  const indexRef = React.useRef(0)
  const jumpRef = React.useRef(0)

  const next = () => {
    const following = (indexRef.current + 1) % Math.max(phrases.length, 1)
    indexRef.current = following
    jumpRef.current += 1
    setIndex(following)
    if (reduced) {
      setFading(true)
      window.setTimeout(() => setFading(false), 280)
    }
  }

  React.useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !host || !context) return
    let frame = 0
    let running = true
    const visibleRef = { current: true }
    let bits: Bit[] = []
    let mode: "hold" | "fly" | "form" = "hold"
    let modeTime = 0
    let seenJump = 0
    const width = 640
    const height = 220
    const place = (phrase: string) => {
      const points = samplePhrase(phrase, width, height)
      if (bits.length === 0) {
        bits = points.map((point) => ({ x: point.x, y: point.y, tx: point.x, ty: point.y, vx: 0, vy: 0 }))
        return
      }
      bits.forEach((bit, bitIndex) => {
        const point = points[bitIndex % Math.max(points.length, 1)] ?? { x: width / 2, y: height / 2 }
        bit.tx = point.x
        bit.ty = point.y
      })
    }
    place(phrases[0] ?? "")
    const tick = () => {
      if (!running) return
      if (!visibleRef.current) {
        frame = 0
        return
      }
      if (jumpRef.current !== seenJump) {
        seenJump = jumpRef.current
        mode = "fly"
        modeTime = 0
        bits.forEach((bit) => {
          const dx = bit.x - width / 2
          const dy = bit.y - height / 2
          const length = Math.hypot(dx, dy) || 1
          bit.vx = (dx / length) * (8 + Math.random() * 10)
          bit.vy = (dy / length) * (8 + Math.random() * 10)
        })
      }
      modeTime += 0.016
      if (mode === "fly" && modeTime > 0.45) {
        mode = "form"
        modeTime = 0
        place(phrases[indexRef.current] ?? "")
      }
      if (mode === "form" && modeTime > 0.7) mode = "hold"
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rect.width, rect.height)
      const scale = rect.width / width
      context.save()
      context.translate(0, (rect.height - height * scale) / 2)
      context.scale(scale, scale)
      context.strokeStyle = "#e0f2fe"
      context.fillStyle = "#f8fafc"
      bits.forEach((bit) => {
        if (mode === "fly") {
          bit.x += bit.vx
          bit.y += bit.vy
          context.beginPath()
          context.moveTo(bit.x, bit.y)
          context.lineTo(bit.x - bit.vx * 3, bit.y - bit.vy * 3)
          context.stroke()
        } else if (mode === "form") {
          bit.x += (bit.tx - bit.x) * 0.12
          bit.y += (bit.ty - bit.y) * 0.12
          context.fillRect(bit.x, bit.y, 2, 2)
        } else {
          bit.x += (bit.tx - bit.x) * 0.2
          bit.y += (bit.ty - bit.y) * 0.2
          context.fillRect(bit.x, bit.y, 2.2, 2.2)
        }
      })
      context.restore()
      frame = window.requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (visibleRef.current && running && frame === 0) frame = window.requestAnimationFrame(tick)
    })
    observer.observe(host)
    frame = window.requestAnimationFrame(tick)
    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [phrases, reduced])

  const phrase = phrases[index] ?? ""
  return (
    <div ref={hostRef} data-slot="hyperspace-text" className={cn("relative h-64 overflow-hidden rounded-xl border bg-slate-950", className)}>
      {reduced ? (
        <p className={cn("flex h-full items-center justify-center text-4xl font-semibold text-white transition-opacity", fading ? "opacity-30" : "opacity-100")}>{phrase}</p>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
      <p className="sr-only" aria-live="polite">{phrase}</p>
      <button type="button" className="absolute bottom-3 left-3 rounded-md border border-white/20 px-2 py-1 text-xs text-white" onClick={next}>下一段</button>
    </div>
  )
}

export { HyperspaceText }
