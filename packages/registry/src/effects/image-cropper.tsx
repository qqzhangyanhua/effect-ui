"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ImageCropperProps {
  className?: string
}

const SOURCE = 640

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function clampPan(pan: number, view: number, zoom: number) {
  const limit = Math.max(0, (SOURCE * zoom - view) / 2)
  return clamp(pan, -limit, limit)
}

function cropRect(view: number, zoom: number, pan: { x: number; y: number }) {
  const displayed = SOURCE * zoom
  const left = view / 2 - displayed / 2 + pan.x
  const top = view / 2 - displayed / 2 + pan.y
  return { sx: -left / zoom, sy: -top / zoom, size: view / zoom }
}

function paintSource(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const gradient = ctx.createLinearGradient(0, 0, SOURCE, SOURCE)
  gradient.addColorStop(0, "#312e81")
  gradient.addColorStop(0.45, "#0e7490")
  gradient.addColorStop(1, "#b45309")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SOURCE, SOURCE)
  for (let index = 0; index < 8; index += 1) {
    ctx.beginPath()
    ctx.fillStyle = `hsla(${index * 42}, 85%, 68%, 0.9)`
    ctx.arc(90 + (index % 4) * 150, 120 + Math.floor(index / 4) * 300, 62, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = "white"
  ctx.font = "bold 84px sans-serif"
  ctx.fillText("CROP", 168, 350)
}

function ImageCropper({ className }: ImageCropperProps) {
  const reduced = usePrefersReducedMotion()
  const sourceRef = React.useRef<HTMLCanvasElement>(null)
  const previewRef = React.useRef<HTMLCanvasElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const urlRef = React.useRef<string | null>(null)
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const [view, setView] = React.useState(288)
  const [zoom, setZoom] = React.useState(1.25)
  const [pan, setPan] = React.useState({ x: 0, y: 0 })
  const [shape, setShape] = React.useState<"round" | "square">("square")
  const [exportUrl, setExportUrl] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState("拖动或方向键平移，滚轮与加减键缩放。")

  React.useEffect(() => {
    const canvas = sourceRef.current
    if (!canvas) return
    paintSource(canvas)
  }, [])

  React.useEffect(() => {
    const node = stageRef.current
    if (!node) return
    const observer = new ResizeObserver(() => {
      const next = Math.round(node.clientWidth)
      if (next > 0) setView(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const source = sourceRef.current
    const preview = previewRef.current
    if (!source || !preview) return
    const ctx = preview.getContext("2d")
    if (!ctx) return
    const rect = cropRect(view, zoom, pan)
    ctx.clearRect(0, 0, preview.width, preview.height)
    ctx.save()
    if (shape === "round") {
      ctx.beginPath()
      ctx.arc(preview.width / 2, preview.height / 2, preview.width / 2, 0, Math.PI * 2)
      ctx.clip()
    }
    ctx.drawImage(source, rect.sx, rect.sy, rect.size, rect.size, 0, 0, preview.width, preview.height)
    ctx.restore()
  }, [pan, shape, view, zoom])

  React.useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    [],
  )

  const displayed = SOURCE * zoom
  const left = view / 2 - displayed / 2 + pan.x
  const top = view / 2 - displayed / 2 + pan.y

  const nudgeZoom = (delta: number) => {
    const next = clamp(zoom + delta, 1, 3)
    setZoom(next)
    setPan((current) => ({
      x: clampPan(current.x, view, next),
      y: clampPan(current.y, view, next),
    }))
  }

  const exportCrop = () => {
    const source = sourceRef.current
    if (!source) return
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = cropRect(view, zoom, pan)
    if (shape === "round") {
      ctx.beginPath()
      ctx.arc(128, 128, 128, 0, Math.PI * 2)
      ctx.clip()
    }
    ctx.drawImage(source, rect.sx, rect.sy, rect.size, rect.size, 0, 0, 256, 256)
    canvas.toBlob((blob) => {
      if (!blob) return
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(blob)
      urlRef.current = url
      setExportUrl(url)
      setStatus("已导出裁切图片。")
    })
  }

  return (
    <div data-slot="image-cropper" className={cn("grid w-full gap-4 md:grid-cols-[18rem_1fr]", className)}>
      <div
        ref={stageRef}
        tabIndex={0}
        role="application"
        aria-label="裁切区域。方向键平移，加号减号缩放。"
        className={cn(
          "relative h-72 w-72 touch-none overflow-hidden rounded-xl border bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-primary",
          reduced && "cursor-default",
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y }
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          setPan({
            x: clampPan(start.px + event.clientX - start.x, view, zoom),
            y: clampPan(start.py + event.clientY - start.y, view, zoom),
          })
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onWheel={(event) => {
          event.preventDefault()
          nudgeZoom(event.deltaY < 0 ? 0.08 : -0.08)
        }}
        onKeyDown={(event) => {
          const step = 16
          if (event.key === "ArrowLeft") setPan((current) => ({ ...current, x: clampPan(current.x - step, view, zoom) }))
          if (event.key === "ArrowRight") setPan((current) => ({ ...current, x: clampPan(current.x + step, view, zoom) }))
          if (event.key === "ArrowUp") setPan((current) => ({ ...current, y: clampPan(current.y - step, view, zoom) }))
          if (event.key === "ArrowDown") setPan((current) => ({ ...current, y: clampPan(current.y + step, view, zoom) }))
          if (event.key === "+" || event.key === "=") nudgeZoom(0.08)
          if (event.key === "-" || event.key === "_") nudgeZoom(-0.08)
        }}
      >
        <canvas
          ref={sourceRef}
          width={SOURCE}
          height={SOURCE}
          className="absolute max-w-none"
          style={{ width: displayed, height: displayed, left, top }}
        />
        {shape === "round" ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(circle at center, transparent 68%, rgba(0,0,0,0.62) 69%)" }}
          />
        ) : null}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => nudgeZoom(0.08)}>
            放大
          </button>
          <button type="button" className="rounded-md border px-3 py-1.5 text-sm" onClick={() => nudgeZoom(-0.08)}>
            缩小
          </button>
          <button
            type="button"
            className={cn("rounded-md border px-3 py-1.5 text-sm", shape === "square" && "bg-primary text-primary-foreground")}
            aria-pressed={shape === "square"}
            onClick={() => setShape("square")}
          >
            方形
          </button>
          <button
            type="button"
            className={cn("rounded-md border px-3 py-1.5 text-sm", shape === "round" && "bg-primary text-primary-foreground")}
            aria-pressed={shape === "round"}
            onClick={() => setShape("round")}
          >
            圆形
          </button>
          <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={exportCrop}>
            导出
          </button>
        </div>
        <div className="flex items-center gap-3">
          <canvas
            ref={previewRef}
            width={160}
            height={160}
            className={cn("size-28 border bg-muted", shape === "round" ? "rounded-full" : "rounded-md")}
          />
          <div>
            <p className="text-sm font-medium">实时预览</p>
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {status}
            </p>
            {exportUrl ? (
              <a href={exportUrl} download="crop.png" className="mt-2 inline-block text-sm text-primary">
                下载 PNG
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export { ImageCropper }
