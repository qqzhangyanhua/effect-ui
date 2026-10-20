"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LoomThreadsMarqueeProps {
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
uniform float u_unravel;
varying vec2 vUv;

vec3 cardColor(float index) {
  float h = fract(index * 0.17);
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return mix(vec3(0.16), rgb, 0.85);
}

void main() {
  float scroll = u_time * 0.12;
  float x = fract(vUv.x + scroll);
  float index = floor(x * 5.0);
  float local = fract(x * 5.0);
  float threadCount = mix(1.0, 28.0, u_unravel);
  float thread = fract((vUv.y + sin(index + u_time) * 0.02 * u_unravel) * threadCount);
  float solid = step(0.06, local) * step(local, 0.94);
  float line = smoothstep(0.5, 0.15, abs(thread - 0.5));
  float mask = mix(solid, line, u_unravel);
  float gap = mix(step(0.08, vUv.y) * step(vUv.y, 0.92), 1.0, u_unravel);
  vec3 color = cardColor(index) * mask * gap;
  gl_FragColor = vec4(color, 1.0);
}
`

function LoomFallback({ unravel }: { unravel: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center gap-3 overflow-hidden bg-zinc-950 px-4">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className={unravel ? "h-24 w-1 rounded-full" : "h-28 w-24 rounded-lg"}
          style={{ background: `hsl(${index * 48 + 18} 70% 52%)` }}
        />
      ))}
    </div>
  )
}

function LoomThreadsMarquee({ className }: LoomThreadsMarqueeProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const unravelRef = React.useRef(0)
  const [unravel, setUnravel] = React.useState(false)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    unravelRef.current = unravel ? 1 : 0
  }, [unravel])

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
      const uniforms = { u_time: { value: 0 }, u_unravel: { value: 0 } }
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
      let shown = 0
      const tick = () => {
        shown += (unravelRef.current - shown) * 0.06
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_unravel.value = shown
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

  return (
    <div data-slot="loom-threads-marquee" className={cn("w-full space-y-3", className)}>
      <button
        type="button"
        aria-pressed={unravel}
        className="rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setUnravel((current) => !current)}
      >
        {unravel ? "织回画面" : "拆成丝线"}
      </button>
      <div ref={hostRef} className="relative h-64 overflow-hidden rounded-xl border bg-zinc-950">
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <LoomFallback unravel={unravel} />}
      </div>
    </div>
  )
}

export { LoomThreadsMarquee }
