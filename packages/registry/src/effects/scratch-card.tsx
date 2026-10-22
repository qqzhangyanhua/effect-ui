"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，减弱动效时不生成粉尘，箔层淡出时长为 0。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/scratch-card/scratch-card.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"

export interface ScratchCardProps {
  children: ReactNode
  onReveal?: () => void
  onProgress?: (progress: number) => void
  revealThreshold?: number
  brushSize?: number
  overlayLabel?: string
  overlayColor?: string
  overlayLabelColor?: string
  particleColor?: string
  ariaLabel?: string
  revealAnnouncement?: string
  className?: string
}

interface DustParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

const PROGRESS_SAMPLE_STRIDE = 32
const PROGRESS_CHECK_EVERY_N_MOVES = 10
const MAX_PARTICLES = 120

export function ScratchCard({
  children,
  onReveal,
  onProgress,
  revealThreshold = 0.5,
  brushSize = 28,
  overlayLabel = "Scratch to reveal",
  overlayColor = "var(--foreground)",
  overlayLabelColor = "var(--muted-foreground)",
  particleColor = "var(--muted-foreground)",
  ariaLabel = "刮开表面。按 Enter 显示隐藏内容。",
  revealAnnouncement = "隐藏内容已显示",
  className,
}: ScratchCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<DustParticle[]>([])
  const particleRafRef = useRef(0)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const scratchingRef = useRef(false)
  const moveCountRef = useRef(0)
  const revealedRef = useRef(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const paintOverlay = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = overlayColor
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
      ctx.lineWidth = 1
      for (let x = -height; x < width; x += 8) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + height, height)
        ctx.stroke()
      }
      if (overlayLabel) {
        ctx.fillStyle = overlayLabelColor
        ctx.font = "500 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(overlayLabel.toUpperCase(), width / 2, height / 2)
      }
    },
    [overlayColor, overlayLabel, overlayLabelColor],
  )

  useEffect(() => {
    const container = containerRef.current
    const scratchCanvas = scratchCanvasRef.current
    const particleCanvas = particleCanvasRef.current
    if (!container || !scratchCanvas || !particleCanvas) return
    let lastWidth = 0
    let lastHeight = 0
    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (width === lastWidth && height === lastHeight) return
      lastWidth = width
      lastHeight = height
      if (revealedRef.current || width === 0 || height === 0) return
      paintOverlay(scratchCanvas, width, height)
      const dpr = window.devicePixelRatio || 1
      particleCanvas.width = Math.max(1, Math.round(width * dpr))
      particleCanvas.height = Math.max(1, Math.round(height * dpr))
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    return () => observer.disconnect()
  }, [paintOverlay])

  useEffect(() => () => cancelAnimationFrame(particleRafRef.current), [])

  const reveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setIsRevealed(true)
    onReveal?.()
  }, [onReveal])

  const checkProgress = useCallback(() => {
    const canvas = scratchCanvasRef.current
    if (!canvas || revealedRef.current) return
    const ctx = canvas.getContext("2d")
    if (!ctx || canvas.width === 0 || canvas.height === 0) return
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let cleared = 0
    let sampled = 0
    for (let index = 3; index < data.length; index += 4 * PROGRESS_SAMPLE_STRIDE) {
      if ((data[index] ?? 255) < 128) cleared += 1
      sampled += 1
    }
    if (sampled === 0) return
    const progress = cleared / sampled
    onProgress?.(progress)
    if (progress >= revealThreshold) reveal()
  }, [onProgress, reveal, revealThreshold])

  const runParticleLoop = useCallback(() => {
    const canvas = particleCanvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    cancelAnimationFrame(particleRafRef.current)
    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      const alive: DustParticle[] = []
      for (const particle of particlesRef.current) {
        particle.vy += 0.18
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 1
        if (particle.life <= 0) continue
        ctx.globalAlpha = particle.life / particle.maxLife
        ctx.fillStyle = particleColor
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
        alive.push(particle)
      }
      ctx.globalAlpha = 1
      particlesRef.current = alive
      if (alive.length > 0) particleRafRef.current = requestAnimationFrame(tick)
    }
    particleRafRef.current = requestAnimationFrame(tick)
  }, [particleColor])

  const spawnParticles = useCallback(
    (x: number, y: number) => {
      if (prefersReducedMotion || particlesRef.current.length >= MAX_PARTICLES) return
      for (let index = 0; index < 2; index += 1) {
        const maxLife = 24 + Math.random() * 20
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * brushSize * 0.6,
          y: y + (Math.random() - 0.5) * brushSize * 0.6,
          vx: (Math.random() - 0.5) * 1.6,
          vy: -Math.random() * 1.4,
          size: 1.5 + Math.random() * 2,
          life: maxLife,
          maxLife,
        })
      }
      runParticleLoop()
    },
    [brushSize, prefersReducedMotion, runParticleLoop],
  )

  const scratchLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const ctx = scratchCanvasRef.current?.getContext("2d")
      if (!ctx) return
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(to.x, to.y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = "source-over"
    },
    [brushSize],
  )

  const pointFrom = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  return (
    <div
      ref={containerRef}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="scratch-card"
      className={cn("relative w-full select-none overflow-hidden rounded-2xl border border-border bg-card", className)}
    >
      <div inert={isRevealed ? undefined : true}>{children}</div>
      <AnimatePresence>
        {!isRevealed ? (
          <motion.div
            key="scratch-foil"
            className="absolute inset-0 z-10"
            initial={false}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
          >
            <canvas
              ref={scratchCanvasRef}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                scratchingRef.current = true
                const point = pointFrom(event)
                scratchLine(point, point)
                spawnParticles(point.x, point.y)
                lastPointRef.current = point
              }}
              onPointerMove={(event) => {
                if (!scratchingRef.current) return
                const point = pointFrom(event)
                scratchLine(lastPointRef.current ?? point, point)
                lastPointRef.current = point
                moveCountRef.current += 1
                if (moveCountRef.current % 2 === 0) spawnParticles(point.x, point.y)
                if (moveCountRef.current % PROGRESS_CHECK_EVERY_N_MOVES === 0) checkProgress()
              }}
              onPointerUp={() => {
                scratchingRef.current = false
                lastPointRef.current = null
                checkProgress()
              }}
              onPointerCancel={() => {
                scratchingRef.current = false
                lastPointRef.current = null
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  reveal()
                }
              }}
              className="block h-full w-full cursor-crosshair touch-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <canvas ref={particleCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <span className="sr-only" aria-live="polite">
        {isRevealed ? revealAnnouncement : ""}
      </span>
    </div>
  )
}
