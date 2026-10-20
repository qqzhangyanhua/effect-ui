"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SignaturePadProps {
  className?: string
}

function sizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.floor(rect.width * dpr))
  canvas.height = Math.max(1, Math.floor(rect.height * dpr))
  const context = canvas.getContext("2d")
  if (!context) return null
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.lineCap = "round"
  context.lineJoin = "round"
  context.strokeStyle = "#e2e8f0"
  context.lineWidth = 2.4
  return context
}

function SignaturePad({ className }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const drawing = React.useRef(false)
  const [signed, setSigned] = React.useState(false)

  const contextOf = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    if (!contextRef.current) contextRef.current = sizeCanvas(canvas)
    return contextRef.current
  }

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const sample = () => {
    const canvas = canvasRef.current
    const context = canvas ? sizeCanvas(canvas) : null
    contextRef.current = context
    if (!context || !canvas) {
      setSigned(true)
      return
    }
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    context.beginPath()
    context.moveTo(width * 0.12, height * 0.62)
    context.bezierCurveTo(width * 0.28, height * 0.2, width * 0.4, height * 0.9, width * 0.55, height * 0.48)
    context.bezierCurveTo(width * 0.7, height * 0.15, width * 0.82, height * 0.7, width * 0.9, height * 0.4)
    context.stroke()
    setSigned(true)
  }

  return (
    <section data-slot="signature-pad" className={cn("w-full space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">签名</p>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {signed ? "已签名" : "空白"}
        </p>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="签名区域。按住指针绘制，或使用示例签名。"
        className="h-40 w-full touch-none rounded-xl border bg-slate-950"
        onPointerDown={(event) => {
          const context = contextOf()
          if (!context) return
          const cursor = point(event)
          drawing.current = true
          context.beginPath()
          context.moveTo(cursor.x, cursor.y)
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return
          const context = contextRef.current
          if (!context) return
          const cursor = point(event)
          context.lineTo(cursor.x, cursor.y)
          context.stroke()
          setSigned(true)
        }}
        onPointerUp={() => {
          drawing.current = false
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={sample}
        >
          示例签名
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => {
            const canvas = canvasRef.current
            if (canvas) contextRef.current = sizeCanvas(canvas)
            setSigned(false)
          }}
        >
          清除
        </button>
      </div>
    </section>
  )
}

export { SignaturePad }
