"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DataTunnelProps {
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
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float depth = fract(0.18 / max(r, 0.025) - u_time * 0.35);
  float ring = smoothstep(0.05, 0.0, abs(fract(depth * 5.0) - 0.5) - 0.4);
  float spoke = smoothstep(0.035, 0.0, abs(fract(atan(p.y, p.x) * 1.2) - 0.5) - 0.45);
  float lane = max(ring, spoke) * smoothstep(0.0, 0.12, r);
  vec3 color = mix(vec3(0.01, 0.03, 0.08), vec3(0.15, 0.75, 0.85), lane);
  color += vec3(0.9, 0.95, 1.0) * smoothstep(0.12, 0.0, r);
  gl_FragColor = vec4(color, 1.0);
}
`

function TunnelFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #e2e8f0 0 4%, transparent 5%), repeating-radial-gradient(circle at 50% 50%, transparent 0 18px, rgba(34,211,238,0.45) 18px 20px)",
      }}
    />
  )
}

function DataTunnel({ className }: DataTunnelProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
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
      const uniforms = { u_time: { value: 0 } }
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
    <div data-slot="data-tunnel" className={cn("w-full space-y-2", className)}>
      <p className="text-xs text-muted-foreground">数据沿隧道向前。减弱动效时画面静止。</p>
      <div ref={hostRef} role="img" aria-label="数据隧道" className="relative h-72 overflow-hidden rounded-xl border bg-slate-950">
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <TunnelFallback />}
      </div>
    </div>
  )
}

export { DataTunnel }
