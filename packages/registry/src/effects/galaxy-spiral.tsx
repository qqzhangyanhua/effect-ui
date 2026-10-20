"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GalaxySpiralProps {
  className?: string
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
uniform float u_time;
uniform vec2 u_pointer;
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  p -= (u_pointer - 0.5) * 0.35;
  float r = length(p);
  float arm = atan(p.y, p.x) / 6.28318 + log(max(r, 0.04)) * 0.42 - u_time * 0.04;
  float band = abs(fract(arm * 2.0) - 0.5);
  float stars = smoothstep(0.07, 0.0, band) * smoothstep(1.05, 0.08, r);
  float core = smoothstep(0.42, 0.0, r);
  float spark = fract(sin(dot(floor(p * 90.0), vec2(12.9898, 78.233))) * 43758.5453);
  vec3 color = vec3(0.015, 0.02, 0.06);
  color += vec3(0.35, 0.48, 0.95) * stars;
  color += vec3(0.95, 0.78, 0.45) * core;
  color += vec3(0.85) * step(0.992, spark) * step(r, 0.92);
  gl_FragColor = vec4(color, 1.0);
}
`

function GalaxyFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #fde68a 0 6%, #312e81 18%, #020617 58%), repeating-conic-gradient(from 20deg, transparent 0 18deg, rgba(147,197,253,0.18) 18deg 20deg)",
      }}
    />
  )
}

function GalaxySpiral({ className }: GalaxySpiralProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0.5, y: 0.5 })
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

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
        u_time: { value: 0 },
        u_pointer: { value: [0.5, 0.5] },
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
      const started = performance.now()
      const tick = () => {
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_pointer.value = [pointerRef.current.x, pointerRef.current.y]
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)
      return () => {
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
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [showCanvas])

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointerRef.current = {
      x: (event.clientX - rect.left) / Math.max(rect.width, 1),
      y: 1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
    }
  }

  return (
    <div data-slot="galaxy-spiral" className={cn("w-full space-y-2", className)}>
      <div
        ref={hostRef}
        role="img"
        aria-label="螺旋星系。指针可以轻轻带动核心。减弱动效时保持静止。"
        className="relative h-72 overflow-hidden rounded-xl border"
        onPointerMove={move}
      >
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <GalaxyFallback />}
      </div>
    </div>
  )
}

export { GalaxySpiral }
