"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DatamoshTransitionProps {
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
uniform float u_mix;
uniform float u_glitch;
varying vec2 vUv;

vec3 scene(vec2 uv, float id) {
  vec3 cool = mix(vec3(0.08, 0.10, 0.28), vec3(0.15, 0.62, 0.72), uv.y);
  vec3 warm = mix(vec3(0.28, 0.08, 0.12), vec3(0.95, 0.62, 0.18), uv.x);
  vec3 base = mix(cool, warm, id);
  vec2 center = vec2(0.32 + id * 0.36, 0.58 - id * 0.16);
  float blob = smoothstep(0.22, 0.12, length(uv - center));
  float bar = smoothstep(0.04, 0.0, abs(uv.y - (0.28 + id * 0.4)) - 0.03);
  base = mix(base, vec3(0.96, 0.93, 0.84), blob);
  base = mix(base, vec3(1.0, 0.95, 0.7), bar * 0.85);
  return base;
}

void main() {
  float band = floor(vUv.y * 22.0);
  float row = fract(sin(band * 17.13 + floor(u_time * 9.0)) * 43758.5453);
  float shift = (row - 0.5) * u_glitch * 0.22;
  vec2 uv = vUv + vec2(shift, u_glitch * 0.015 * sin(band));
  vec2 smear = vec2(u_glitch * 0.16, 0.0);
  vec3 previous = scene(uv + smear, 0.0);
  vec3 next = scene(uv - smear * 0.6, 1.0);
  vec3 color = mix(previous, next, clamp(u_mix, 0.0, 1.0));
  float tear = step(0.78, row) * u_glitch;
  color = mix(color, color.gbr, tear);
  gl_FragColor = vec4(color, 1.0);
}
`

const SCENES = [
  { id: 0, label: "冷色画面" },
  { id: 1, label: "暖色画面" },
] as const

function DatamoshFallback({ scene }: { scene: number }) {
  const warm = scene === 1
  return (
    <div
      className="absolute inset-0"
      style={{
        background: warm
          ? "linear-gradient(145deg, #7f1d1d, #f59e0b 70%)"
          : "linear-gradient(160deg, #1e1b4b, #0e7490)",
      }}
    />
  )
}

function DatamoshTransition({ className }: DatamoshTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const mix = React.useRef(0)
  const target = React.useRef(0)
  const [scene, setScene] = React.useState(0)
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
      const sceneGraph = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const uniforms = {
        u_time: { value: 0 },
        u_mix: { value: 0 },
        u_glitch: { value: 0 },
      }
      const program = new ogl.Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
      const mesh = new ogl.Mesh(gl, { geometry, program })
      mesh.setParent(sceneGraph)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const started = performance.now()
      const tick = () => {
        const delta = target.current - mix.current
        mix.current += delta * 0.08
        if (Math.abs(delta) < 0.004) mix.current = target.current
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_mix.value = mix.current
        uniforms.u_glitch.value = Math.sin(Math.min(1, Math.abs(delta) * 4) * Math.PI) * 0.85
        renderer.render({ scene: sceneGraph, camera })
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

  const pick = (id: number) => {
    target.current = id
    mix.current = reduced ? id : mix.current
    setScene(id)
  }

  return (
    <div data-slot="datamosh-transition" className={cn("w-full space-y-3", className)}>
      <div className="flex gap-2" role="radiogroup" aria-label="切换画面">
        {SCENES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={scene === item.id}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
              scene === item.id && "bg-primary text-primary-foreground",
            )}
            onClick={() => pick(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div ref={hostRef} className="relative h-80 overflow-hidden rounded-xl border bg-zinc-950">
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <DatamoshFallback scene={scene} />}
        <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-white/80">
          {reduced ? "已直接切到下一幅。" : "切换时色块会被拖影拉开，再收回新画面。"}
        </p>
      </div>
    </div>
  )
}

export { DatamoshTransition }
