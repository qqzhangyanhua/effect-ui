"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ClothWindBannerProps {
  className?: string
}

const VERT = `
attribute vec2 uv;
attribute vec3 position;
uniform float u_time;
uniform float u_wind;
varying vec2 vUv;
varying float vLift;
void main() {
  vUv = uv;
  float wave = sin(position.x * 4.0 + u_time * (0.8 + u_wind * 2.4) + uv.y * 2.0);
  float lift = wave * u_wind * 0.16 * sin(uv.y * 3.14159);
  vLift = lift;
  gl_Position = vec4(position.x, position.y + lift, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;
varying float vLift;
void main() {
  float stripe = step(0.5, fract(vUv.y * 6.0));
  vec3 a = vec3(0.45, 0.28, 0.72);
  vec3 b = vec3(0.93, 0.45, 0.28);
  vec3 color = mix(a, b, stripe);
  color += vec3(0.35) * smoothstep(0.02, 0.12, abs(vLift));
  float edge = smoothstep(0.0, 0.03, vUv.x) * smoothstep(1.0, 0.97, vUv.x);
  gl_FragColor = vec4(color * edge, 1.0);
}
`

function ClothFallback() {
  return <div className="absolute inset-x-8 inset-y-16 rounded-md bg-[repeating-linear-gradient(180deg,#7c3aed_0_16px,#ea580c_16px_32px)]" />
}

function ClothWindBanner({ className }: ClothWindBannerProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const windRef = React.useRef(0.55)
  const [wind, setWind] = React.useState(0.55)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback
  const label = wind < 0.34 ? "微风" : wind < 0.7 ? "和风" : "劲风"

  React.useEffect(() => {
    windRef.current = wind
  }, [wind])

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
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
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
      const geometry = new ogl.Plane(gl, { width: 1.7, height: 0.7, widthSegments: 48, heightSegments: 16 })
      const uniforms = { u_time: { value: 0 }, u_wind: { value: 0.55 } }
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
        uniforms.u_wind.value = windRef.current
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
    <div data-slot="cloth-wind-banner" className={cn("w-full space-y-3", className)}>
      <label className="flex items-center gap-3 text-sm">
        风力
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={wind}
          aria-valuetext={label}
          className="w-40"
          onChange={(event) => setWind(Number(event.target.value))}
        />
        <span>{label}</span>
      </label>
      <div ref={hostRef} className="relative h-56 overflow-hidden rounded-xl border bg-slate-950">
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <ClothFallback />}
      </div>
    </div>
  )
}

export { ClothWindBanner }
