"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LensZoomProps {
  /** 要放大的图片。缺省时用内置色块，不请求外链。 */
  src?: string
  zoom?: number
  lensSize?: number
  className?: string
}

interface LensPoint {
  x: number
  y: number
  w: number
  h: number
}

function Artwork({ src }: { src?: string }) {
  if (src) {
    return <img src={src} alt="" draggable={false} className="h-full w-full object-cover" />
  }
  return (
    <div className="relative h-full w-full bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e1b4b_0%,#0f766e_48%,#b45309_100%)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 22% 32%, #fde68a 0 7%, transparent 8%)",
            "radial-gradient(circle at 68% 38%, #67e8f9 0 11%, transparent 12%)",
            "radial-gradient(circle at 42% 74%, #f9a8d4 0 9%, transparent 10%)",
            "repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,255,255,0.16) 18px 19px)",
          ].join(", "),
        }}
      />
      <div className="absolute inset-5 rounded-2xl border border-white/50" />
      <div className="absolute top-1/2 right-6 left-6 h-px bg-white/70" />
      <p className="absolute bottom-5 left-6 font-display text-4xl tracking-tight text-white">01</p>
    </div>
  )
}

function pointFrom(target: HTMLDivElement, clientX: number, clientY: number): LensPoint {
  const rect = target.getBoundingClientRect()
  return {
    x: Math.min(rect.width, Math.max(0, clientX - rect.left)),
    y: Math.min(rect.height, Math.max(0, clientY - rect.top)),
    w: rect.width,
    h: rect.height,
  }
}

function LensZoom({ src, zoom = 2.3, lensSize = 148, className }: LensZoomProps) {
  const reduced = usePrefersReducedMotion()
  const [lens, setLens] = React.useState<LensPoint | null>(null)

  const move = (target: HTMLDivElement, clientX: number, clientY: number) => {
    if (reduced) return
    setLens(pointFrom(target, clientX, clientY))
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (reduced) return
    const step = event.key.startsWith("Arrow") ? 14 : 0
    if (!step) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const current = lens ?? { x: rect.width / 2, y: rect.height / 2, w: rect.width, h: rect.height }
    const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0
    const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0
    setLens({
      x: Math.min(rect.width, Math.max(0, current.x + dx)),
      y: Math.min(rect.height, Math.max(0, current.y + dy)),
      w: rect.width,
      h: rect.height,
    })
  }

  return (
    <div
      data-slot="lens-zoom"
      tabIndex={0}
      aria-label="图像放大镜。悬停或用方向键移动圆形镜片。"
      className={cn(
        "relative h-72 w-full overflow-hidden rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onPointerMove={(event) => move(event.currentTarget, event.clientX, event.clientY)}
      onPointerLeave={(event) => {
        if (event.currentTarget.contains(document.activeElement)) return
        setLens(null)
      }}
      onFocus={(event) => {
        if (reduced) return
        const rect = event.currentTarget.getBoundingClientRect()
        setLens({ x: rect.width / 2, y: rect.height / 2, w: rect.width, h: rect.height })
      }}
      onBlur={() => setLens(null)}
      onKeyDown={onKeyDown}
    >
      <Artwork src={src} />
      {lens && !reduced ? (
        <div
          className="pointer-events-none absolute z-10 rounded-full border-2 border-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          style={{ width: lensSize, height: lensSize, left: lens.x - lensSize / 2, top: lens.y - lensSize / 2 }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full bg-zinc-950">
            <div
              className="absolute top-0 left-0"
              style={{
                width: lens.w,
                height: lens.h,
                transformOrigin: "top left",
                transform: `translate(${lensSize / 2 - lens.x * zoom}px, ${lensSize / 2 - lens.y * zoom}px) scale(${zoom})`,
              }}
            >
              <Artwork src={src} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { LensZoom }
