"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface PolylineRibbonCursorProps {
  className?: string
  color?: string
  points?: number
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

function PolylineRibbonCursor({ className, color = "#a78bfa", points = 18, speed, intensity }: PolylineRibbonCursorProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const [trail, setTrail] = React.useState<string>("")
  const mouse = React.useRef({ x: 0, y: 0 })
  const active = useAnimationActive(hostRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const speedRef = React.useRef(pace(speed))
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const gainRef = React.useRef(gain)

  React.useEffect(() => {
    speedRef.current = pace(speed)
    gainRef.current = intensity === undefined || intensity === 1 ? 1 : intensity
  }, [speed, intensity])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let cancelled = false
    let frame = 0

    const run = async () => {
      const ogl = await import("ogl")
      if (!canvas || cancelled) return
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      const camera = new ogl.Camera(gl, { fov: 15 })
      camera.position.z = 3
      const scene = new ogl.Transform()
      const curve = Array.from({ length: points }, () => new ogl.Vec3())
      const polyline = new ogl.Polyline(gl, {
        points: curve,
        uniforms: {
          uThickness: { value: 18 * gainRef.current },
          uColor: { value: new ogl.Color(color) },
        },
      })
      polyline.mesh.setParent(scene)

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect()
        renderer.setSize(width, height)
        camera.perspective({ aspect: width / Math.max(height, 1) })
        polyline.resize()
      }
      resize()

      const tick = () => {
        if (!activeRef.current) {
          frame = 0
          return
        }
        const { width, height } = canvas.getBoundingClientRect()
        const nx = (mouse.current.x / Math.max(width, 1)) * 2 - 1
        const ny = -((mouse.current.y / Math.max(height, 1)) * 2 - 1)
        const rate = speedRef.current
        curve[0]?.lerp(new ogl.Vec3(nx, ny, 0), 0.45 * rate)
        for (let i = 1; i < curve.length; i += 1) {
          curve[i]?.lerp(curve[i - 1] ?? new ogl.Vec3(), 0.32 * rate)
        }
        const thickness = polyline.mesh.program.uniforms.uThickness
        if (thickness) thickness.value = 18 * gainRef.current
        polyline.updateGeometry()
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      kickRef.current = () => {
        if (activeRef.current && frame === 0) frame = window.requestAnimationFrame(tick)
      }
      kickRef.current()
      window.addEventListener("resize", resize)
      return () => {
        kickRef.current = null
        window.cancelAnimationFrame(frame)
        window.removeEventListener("resize", resize)
      }
    }

    const cleanup = run().catch(() => {
      if (!cancelled) queueMicrotask(() => setFallback(true))
    })
    return () => {
      cancelled = true
      kickRef.current = null
      void cleanup.then((fn) => fn?.())
    }
  }, [color, points, reduced])

  return (
    <div
      ref={hostRef}
      data-slot="polyline-ribbon-cursor"
      className={cn("relative min-h-52 overflow-hidden rounded-xl border bg-zinc-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        mouse.current.x = event.clientX - rect.left
        mouse.current.y = event.clientY - rect.top
        setTrail((prev) => {
          const next = `${mouse.current.x.toFixed(1)},${mouse.current.y.toFixed(1)}`
          const points = prev ? [...prev.split(" ").slice(-24), next] : [next]
          return points.join(" ")
        })
      }}
    >
      {fallback || reduced ? (
        <svg className="absolute inset-0 size-full">
          <polyline points={trail} fill="none" stroke={color} strokeWidth={6 * gain} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
      <p className="relative z-10 grid min-h-52 place-items-center text-sm text-white/60">移动指针画出丝带</p>
    </div>
  )
}

export { PolylineRibbonCursor }
