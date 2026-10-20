"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SignaturePadProps {
  className?: string
  onChange?: (signed: boolean) => void
}

interface Stroke {
  color: string
  width: number
  points: { x: number; y: number }[]
}

function SignaturePad({ className, onChange }: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const strokesRef = React.useRef<Stroke[]>([])
  const activeRef = React.useRef<Stroke | null>(null)
  const [color, setColor] = React.useState("#111827")
  const [width, setWidth] = React.useState(3)
  const [name, setName] = React.useState("")
  const [signed, setSigned] = React.useState(false)
  const colorRef = React.useRef(color)
  const widthRef = React.useRef(width)

  React.useEffect(() => {
    colorRef.current = color
    widthRef.current = width
  }, [color, width])

  function redraw(context: CanvasRenderingContext2D, widthPx: number, heightPx: number) {
    context.clearRect(0, 0, widthPx, heightPx)
    for (const stroke of strokesRef.current) paintStroke(context, stroke)
  }

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    const context = canvas.getContext("2d")
    if (!context) return
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw(context, rect.width, rect.height)
  }, [])

  React.useEffect(() => {
    resize()
    const canvas = canvasRef.current
    if (!canvas || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [resize])

  const mark = (next: boolean) => {
    setSigned(next)
    onChange?.(next)
  }

  const paintLive = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    redraw(context, rect.width, rect.height)
  }

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const undo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1)
    paintLive()
    mark(strokesRef.current.length > 0)
  }

  const clear = () => {
    strokesRef.current = []
    paintLive()
    mark(false)
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = "signature.png"
    link.click()
  }

  const exportSvg = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const paths = strokesRef.current
      .map((stroke) => {
        const d = stroke.points
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
          .join(" ")
        return `<path d="${d}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`
      })
      .join("")
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">${paths}</svg>`
    const link = document.createElement("a")
    link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`
    link.download = "signature.svg"
    link.click()
  }

  const signName = () => {
    const canvas = canvasRef.current
    if (!canvas || !name.trim()) return
    const context = canvas.getContext("2d")
    const rect = canvas.getBoundingClientRect()
    strokesRef.current = [
      {
        color: colorRef.current,
        width: widthRef.current + 1,
        points: name
          .trim()
          .split("")
          .map((char, index) => ({
            x: 28 + index * 28 + (char.charCodeAt(0) % 5),
            y: rect.height * 0.62 + Math.sin(index + char.charCodeAt(0)) * 8,
          })),
      },
    ]
    if (context) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, rect.width, rect.height)
      context.fillStyle = colorRef.current
      context.font = `${Math.max(28, widthRef.current * 12)}px "Segoe Script", "Comic Sans MS", cursive`
      context.textBaseline = "middle"
      context.fillText(name.trim(), 24, rect.height * 0.58)
    }
    mark(true)
  }

  return (
    <div data-slot="signature-pad" className={cn("w-full max-w-xl space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          颜色
          <input aria-label="颜色" type="color" value={color} onChange={(event) => setColor(event.target.value)} />
        </label>
        <label className="flex items-center gap-2">
          粗细
          <input aria-label="粗细" type="range" min={1} max={8} step={1} value={width} onChange={(event) => setWidth(Number(event.target.value))} />
        </label>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={undo}>
          撤销
        </button>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={clear}>
          清除
        </button>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={exportPng}>
          导出 PNG
        </button>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={exportSvg}>
          导出 SVG
        </button>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="签名板"
        className="h-48 w-full touch-none rounded-xl border bg-white"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          activeRef.current = { color: colorRef.current, width: widthRef.current, points: [pointFrom(event)] }
        }}
        onPointerMove={(event) => {
          const stroke = activeRef.current
          if (!stroke) return
          const next = pointFrom(event)
          const last = stroke.points.at(-1)
          const speed = last ? Math.hypot(next.x - last.x, next.y - last.y) : 0
          stroke.width = Math.max(1, widthRef.current - speed * 0.08)
          stroke.points.push(next)
          const context = event.currentTarget.getContext("2d")
          if (!context || !last) return
          const dpr = Math.min(window.devicePixelRatio || 1, 2)
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.strokeStyle = stroke.color
          context.lineWidth = stroke.width
          context.lineCap = "round"
          context.beginPath()
          const mid = { x: (last.x + next.x) / 2, y: (last.y + next.y) / 2 }
          context.moveTo(last.x, last.y)
          context.quadraticCurveTo(last.x, last.y, mid.x, mid.y)
          context.stroke()
        }}
        onPointerUp={() => {
          if (activeRef.current && activeRef.current.points.length > 1) {
            strokesRef.current = [...strokesRef.current, activeRef.current]
            mark(true)
          }
          activeRef.current = null
        }}
      />
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          signName()
        }}
      >
        <label className="text-sm">
          姓名
          <input
            aria-label="姓名"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 block h-9 rounded-md border px-2"
          />
        </label>
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          生成签名
        </button>
        <span className="text-xs text-muted-foreground">{signed ? "已签名" : "未签名"}</span>
      </form>
    </div>
  )
}

function paintStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length < 2) return
  context.strokeStyle = stroke.color
  context.lineWidth = stroke.width
  context.lineCap = "round"
  context.lineJoin = "round"
  context.beginPath()
  const first = stroke.points[0]
  if (!first) return
  context.moveTo(first.x, first.y)
  for (let index = 1; index < stroke.points.length; index += 1) {
    const previous = stroke.points[index - 1]
    const point = stroke.points[index]
    if (!previous || !point) continue
    const mid = { x: (previous.x + point.x) / 2, y: (previous.y + point.y) / 2 }
    context.quadraticCurveTo(previous.x, previous.y, mid.x, mid.y)
  }
  context.stroke()
}

export { SignaturePad }
