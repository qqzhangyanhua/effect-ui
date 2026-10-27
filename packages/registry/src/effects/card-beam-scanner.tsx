"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CardBeamScannerProps {
  title?: string
  className?: string
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

function CardBeamScanner({ title = "北窗卡", className }: CardBeamScannerProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = React.useState(reduced ? 1 : 0.42)
  const [width, setWidth] = React.useState(640)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const measure = () => setWidth(Math.max(host.clientWidth, 1))
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !host || !context) return
    let frame = 0
    let running = true
    const visibleRef = { current: true }
    const sparks: Spark[] = []
    let travel = 0.42
    const tick = () => {
      if (!running) return
      if (!visibleRef.current) {
        frame = 0
        return
      }
      travel = (travel + 0.004) % 1
      setProgress(travel)
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rect.width, rect.height)
      const beam = rect.width / 2
      const cardLeft = -220 + travel * (rect.width + 240)
      const overlap = cardLeft < beam && cardLeft + 220 > beam
      if (overlap && sparks.length < 48) {
        sparks.push({
          x: beam,
          y: rect.height / 2 + (Math.random() - 0.5) * 120,
          vx: (Math.random() - 0.5) * 2.4,
          vy: (Math.random() - 0.5) * 2.4,
          life: 1,
        })
      }
      sparks.forEach((spark) => {
        spark.x += spark.vx
        spark.y += spark.vy
        spark.life -= 0.02
        context.globalAlpha = Math.max(spark.life, 0)
        context.fillStyle = "#fde68a"
        context.fillRect(spark.x, spark.y, 2, 2)
      })
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        if (sparks[index]!.life <= 0) sparks.splice(index, 1)
      }
      context.globalAlpha = 1
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
  }, [reduced])

  const cardLeft = reduced ? width / 2 - 110 : -220 + progress * (width + 240)
  const beam = width / 2
  const revealed = Math.min(220, Math.max(0, beam - cardLeft))
  const hidden = 220 - revealed

  return (
    <div ref={hostRef} data-slot="card-beam-scanner" className={cn("relative h-72 overflow-hidden rounded-xl border bg-slate-950", className)}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" aria-hidden />
      {reduced ? null : <div className="pointer-events-none absolute inset-y-0 w-px bg-amber-200 shadow-[0_0_24px_6px_rgba(253,224,71,0.45)]" style={{ left: beam }} />}
      <article className="absolute top-1/2 h-44 w-[220px] -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15" style={{ left: cardLeft }}>
        <div className="absolute inset-0 bg-slate-900 p-3 font-mono text-[10px] leading-4 text-emerald-300/80">
          <p>{"function card() {"}</p>
          <p className="pl-2">return face</p>
          <p>{"}"}</p>
          <p className="mt-3 text-slate-500">wireframe</p>
        </div>
        <div
          className="absolute inset-0 bg-linear-to-br from-amber-200 to-orange-500 p-4 text-slate-950"
          style={{ clipPath: reduced ? undefined : `inset(0 ${hidden}px 0 0)` }}
        >
          <p className="text-xs uppercase tracking-wide">成品</p>
          <h3 className="mt-6 text-2xl font-medium">{title}</h3>
        </div>
      </article>
    </div>
  )
}

export { CardBeamScanner }
