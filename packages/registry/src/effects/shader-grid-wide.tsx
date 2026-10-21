"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShaderGridWideProps {
  className?: string
  intensity?: number
  speed?: number
  count?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function cells(count: number | undefined) {
  return count === undefined ? 6 : count
}

const VERT = `
attribute vec2 uv;
attribute vec3 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const FRAG = `
precision highp float;
uniform vec2 u_mouse;
uniform float u_velocity;
uniform float u_warp;
uniform float u_falloff;
uniform vec2 u_grid;
varying vec2 vUv;

vec3 cellColor(float x, float y) {
  float h = fract(x * 0.17 + y * 0.29);
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return mix(vec3(0.12), rgb, 0.9);
}

void main() {
  vec2 uv = vUv;
  vec2 delta = uv - u_mouse;
  float dist = length(delta);
  uv += delta / max(dist, 0.08) * exp(-dist * dist * u_falloff) * u_warp;
  uv.y += u_velocity * 0.22 * sin(uv.x * 9.0);
  vec2 grid = uv * u_grid;
  vec2 cell = floor(grid);
  vec2 local = fract(grid);
  float inside = step(0.05, local.x) * step(0.05, local.y) * step(local.x, 0.95) * step(local.y, 0.95);
  vec3 color = cellColor(cell.x, cell.y) * inside;
  gl_FragColor = vec4(color, 1.0);
}
`

function GridFallback() {
  return (
    <div className="grid h-full grid-cols-3 gap-2 p-3 sm:grid-cols-6">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="rounded-md" style={{ background: `hsl(${index * 28} 65% 48%)` }} />
      ))}
    </div>
  )
}

function ShaderGridWide({ className, intensity, speed, count, scale }: ShaderGridWideProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointer = React.useRef({ x: 0.5, y: 0.5 })
  const velocity = React.useRef(0)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback
  const active = useAnimationActive(hostRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const intensityRef = React.useRef(intensity)
  const speedRef = React.useRef(pace(speed))
  const countRef = React.useRef(cells(count))
  const scaleRef = React.useRef(scale)

  React.useEffect(() => {
    intensityRef.current = intensity
    speedRef.current = pace(speed)
    countRef.current = cells(count)
    scaleRef.current = scale
  }, [intensity, speed, count, scale])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  React.useEffect(() => {
    if (!showCanvas) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let cancelled = false
    let frame = 0
    const run = async () => {
      const ogl = await import("ogl")
      if (cancelled) return undefined
      const renderer = new ogl.Renderer({ canvas, alpha: false, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return undefined
      }
      const camera = new ogl.Camera(gl)
      camera.position.z = 1
      const scene = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const uniforms = {
        u_mouse: { value: [0.5, 0.5] },
        u_velocity: { value: 0 },
        u_warp: { value: 0.07 },
        u_falloff: { value: 14 },
        u_grid: { value: [6, 3] },
      }
      const program = new ogl.Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
      const mesh = new ogl.Mesh(gl, { geometry, program })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const tick = () => {
        if (!activeRef.current) {
          frame = 0
          return
        }
        velocity.current *= 0.9
        const columns = countRef.current
        const sized = scaleRef.current
        const gain = intensityRef.current
        uniforms.u_mouse.value = [pointer.current.x, 1 - pointer.current.y]
        uniforms.u_velocity.value = velocity.current * (gain === undefined || gain === 1 ? 1 : gain)
        uniforms.u_warp.value = 0.07 * speedRef.current
        uniforms.u_falloff.value = 14 / (sized === undefined || sized === 1 ? 1 : sized)
        uniforms.u_grid.value = [columns, columns / 2]
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      kickRef.current = () => {
        if (activeRef.current && frame === 0) frame = window.requestAnimationFrame(tick)
      }
      kickRef.current()
      return () => {
        kickRef.current = null
        window.cancelAnimationFrame(frame)
        observer.disconnect()
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }
    const job = run().catch(() => {
      if (!cancelled) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
      }
      return undefined
    })
    return () => {
      cancelled = true
      kickRef.current = null
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [showCanvas])

  return (
    <div
      data-slot="shader-grid-wide"
      tabIndex={0}
      aria-label="作品网格会在指针附近鼓起，滚动越快，格子拉得越长。"
      className={cn(
        "h-80 w-full overflow-auto rounded-xl border bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current = {
          x: (event.clientX - rect.left) / Math.max(rect.width, 1),
          y: (event.clientY - rect.top) / Math.max(rect.height, 1),
        }
      }}
      onScroll={(event) => {
        const top = event.currentTarget.scrollTop
        const previous = Number(event.currentTarget.dataset.top ?? "0")
        velocity.current = Math.max(-1, Math.min(1, (top - previous) / 80))
        event.currentTarget.dataset.top = String(top)
      }}
    >
      <div className="h-[170vh]">
        <div ref={hostRef} className="sticky top-0 h-80">
          {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <GridFallback />}
        </div>
      </div>
    </div>
  )
}

export { ShaderGridWide }
