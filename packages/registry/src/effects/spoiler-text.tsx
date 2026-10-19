"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(subscribeReducedMotion, reducedMotionSnapshot, () => false)
}

export interface SpoilerTextProps {
  text: string
  className?: string
}

interface Speck {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

function SpoilerText({ text, className }: SpoilerTextProps) {
  const reduced = usePrefersReducedMotion()
  const [revealed, setRevealed] = React.useState(false)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const specks = React.useRef<Speck[]>([])
  const visible = revealed || reduced

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || visible) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      specks.current = Array.from({ length: 90 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        life: 1,
      }))
    }
    resize()
    let frame = 0
    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      for (const speck of specks.current) {
        speck.x += (Math.random() - 0.5) * 0.8
        speck.y += (Math.random() - 0.5) * 0.8
        ctx.fillStyle = `color-mix(in oklab, var(--foreground) ${40 + speck.life * 40}%, transparent)`
        ctx.fillRect(speck.x, speck.y, 2.2, 2.2)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [visible])

  const reveal = () => {
    if (reduced) {
      setRevealed(true)
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) {
      setRevealed(true)
      return
    }
    const { width, height } = canvas.getBoundingClientRect()
    specks.current = specks.current.map((speck) => ({
      ...speck,
      vx: (speck.x - width / 2) * 0.08,
      vy: (speck.y - height / 2) * 0.08,
    }))
    let steps = 0
    const burst = () => {
      ctx.clearRect(0, 0, width, height)
      for (const speck of specks.current) {
        speck.x += speck.vx
        speck.y += speck.vy
        speck.life *= 0.9
        ctx.globalAlpha = speck.life
        ctx.fillRect(speck.x, speck.y, 2.2, 2.2)
      }
      steps += 1
      if (steps < 18) window.requestAnimationFrame(burst)
      else setRevealed(true)
    }
    burst()
  }

  return (
    <button
      type="button"
      onClick={reveal}
      className={cn("relative inline-block rounded-md px-2 py-1 text-left", className)}
      aria-label={visible ? text : "点击揭示隐藏文本"}
    >
      <span className={cn(!visible && "opacity-0")}>{text}</span>
      {!visible ? <canvas ref={canvasRef} className="absolute inset-0 size-full cursor-pointer" /> : null}
    </button>
  )
}

export { SpoilerText }
