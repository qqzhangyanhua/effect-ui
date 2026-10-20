"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SeaWavesBackgroundProps {
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
uniform float u_storm;
varying vec2 vUv;

float wave(float x, float freq, float speed, float phase) {
  return sin(x * freq + u_time * speed + phase);
}

void main() {
  float amp = mix(0.025, 0.09, u_storm);
  float speed = mix(0.7, 2.4, u_storm);
  float y = 0.42;
  y += wave(vUv.x, 7.0, speed, 0.0) * amp;
  y += wave(vUv.x, 13.0, speed * 1.3, 1.7) * amp * 0.55;
  y += wave(vUv.x, 3.0, speed * 0.6, 0.4) * amp * 1.3;
  float crest = smoothstep(0.03, 0.0, abs(vUv.y - y));
  float below = step(vUv.y, y);
  vec3 deep = mix(vec3(0.02, 0.08, 0.18), vec3(0.05, 0.35, 0.48), vUv.y);
  vec3 sky = mix(vec3(0.55, 0.72, 0.86), vec3(0.86, 0.91, 0.95), vUv.y);
  vec3 color = mix(sky, deep, below);
  color = mix(color, vec3(0.95, 0.98, 1.0), crest * mix(0.65, 1.0, u_storm));
  gl_FragColor = vec4(color, 1.0);
}
`

function SeaFallback({ storm }: { storm: number }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          storm > 0.5
            ? "linear-gradient(#94a3b8, #0f172a 45%, #082f49)"
            : "linear-gradient(#dbeafe, #38bdf8 40%, #0c4a6e)",
      }}
    />
  )
}

function SeaWavesBackground({ className }: SeaWavesBackgroundProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const stormRef = React.useRef(0.15)
  const [storm, setStorm] = React.useState(0.15)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    stormRef.current = storm
  }, [storm])

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
      const uniforms = { u_time: { value: 0 }, u_storm: { value: 0.15 } }
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
        uniforms.u_storm.value = stormRef.current
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

  const label = storm < 0.35 ? "平静" : storm < 0.7 ? "有浪" : "风暴"

  return (
    <div data-slot="sea-waves-background" className={cn("w-full space-y-3", className)}>
      <label className="flex items-center gap-3 text-sm">
        海况
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={storm}
          aria-valuetext={label}
          className="w-40"
          onChange={(event) => setStorm(Number(event.target.value))}
        />
        <span>{label}</span>
      </label>
      <div ref={hostRef} className="relative h-72 overflow-hidden rounded-xl border">
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <SeaFallback storm={storm} />}
      </div>
    </div>
  )
}

export { SeaWavesBackground }
