"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface XrayFluidRevealProps {
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
uniform vec2 u_pointer;
uniform float u_time;
varying vec2 vUv;

float blob(vec2 p) {
  float n = sin(p.x * 18.0 + u_time) * 0.012 + sin(p.y * 14.0 - u_time * 1.3) * 0.012;
  return length(p) + n;
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float body = smoothstep(0.72, 0.55, length(p * vec2(0.85, 1.15)));
  vec3 skin = mix(vec3(0.55, 0.32, 0.28), vec3(0.93, 0.72, 0.58), body);
  skin = mix(vec3(0.05, 0.07, 0.1), skin, body);
  float rib = smoothstep(0.015, 0.0, abs(fract(p.y * 7.0) - 0.5) - 0.42);
  float spine = smoothstep(0.03, 0.0, abs(p.x));
  vec3 bone = vec3(0.75, 0.9, 0.95) * max(rib, spine) * body;
  vec3 xray = vec3(0.03, 0.08, 0.12) + bone;
  vec2 pointer = u_pointer * 2.0 - 1.0;
  float reveal = 1.0 - smoothstep(0.16, 0.34, blob(p - pointer));
  vec3 color = mix(skin, xray, reveal);
  gl_FragColor = vec4(color, 1.0);
}
`

function XrayFallback({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute inset-0 bg-linear-to-br from-stone-700 to-stone-950">
      <div
        className="absolute size-28 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${x * 100}%`,
          top: `${(1 - y) * 100}%`,
          background: "radial-gradient(circle, rgba(186,230,253,0.9), rgba(12,74,110,0.2) 70%, transparent 72%)",
        }}
      />
    </div>
  )
}

function XrayFluidReveal({ className }: XrayFluidRevealProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0.5, y: 0.62 })
  const [pointer, setPointer] = React.useState({ x: 0.5, y: 0.62 })
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
      const uniforms = { u_time: { value: 0 }, u_pointer: { value: [0.5, 0.62] } }
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
        uniforms.u_time.value = reduced ? 0 : (performance.now() - started) / 1000
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
  }, [reduced, showCanvas])

  const place = (x: number, y: number) => {
    const next = { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) }
    pointerRef.current = next
    setPointer((current) => (showCanvas ? current : next))
  }

  return (
    <div data-slot="xray-fluid-reveal" className={cn("w-full space-y-2", className)}>
      <p className="text-xs text-muted-foreground">移动指针，或用方向键，查看流动的内部。</p>
      <div
        ref={hostRef}
        tabIndex={0}
        role="application"
        aria-label="透视揭示。方向键移动观察点。"
        className="relative h-72 overflow-hidden rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          place((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height)
        }}
        onKeyDown={(event) => {
          const step = 0.06
          if (event.key === "ArrowLeft") place(pointerRef.current.x - step, pointerRef.current.y)
          if (event.key === "ArrowRight") place(pointerRef.current.x + step, pointerRef.current.y)
          if (event.key === "ArrowUp") place(pointerRef.current.x, pointerRef.current.y + step)
          if (event.key === "ArrowDown") place(pointerRef.current.x, pointerRef.current.y - step)
        }}
      >
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <XrayFallback x={pointer.x} y={pointer.y} />}
      </div>
    </div>
  )
}

export { XrayFluidReveal }
