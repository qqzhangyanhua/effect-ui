"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SeaWavesBackgroundProps {
  className?: string
  intensity?: number
  speed?: number
  colors?: readonly string[]
  scale?: number
}

const DEFAULT_COLORS = ["#05142e", "#0d597a", "#dbe8f2"] as const

type Rgb = [number, number, number]

function useSynced(prop: number | undefined, fallback: number) {
  const [draft, setDraft] = React.useState<{ prop: number | undefined; value: number } | null>(null)
  const value = draft && Object.is(draft.prop, prop) ? draft.value : (prop ?? fallback)
  return [value, (next: number) => setDraft({ prop, value: next })] as const
}

function hexToRgb(hex: string, fallback: Rgb): Rgb {
  const text = hex.trim().replace(/^#/, "")
  const digits = text.length === 3 ? [...text].map((char) => `${char}${char}`).join("") : text
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) return fallback
  const value = Number.parseInt(digits, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
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
uniform float u_rate;
uniform float u_scale;
uniform vec3 u_deep;
uniform vec3 u_shore;
uniform vec3 u_sky;
varying vec2 vUv;

float wave(float x, float freq, float speed, float phase) {
  return sin(x * freq * u_scale + u_time * speed * u_rate + phase);
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
  vec3 skyLow = mix(u_shore, u_sky, vec3(0.61728395, 0.66071429, 0.80851064));
  vec3 deep = mix(u_deep, u_shore, vUv.y);
  vec3 sky = mix(skyLow, u_sky, vUv.y);
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

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function SeaWavesBackground({
  className,
  intensity,
  speed = 1,
  colors = DEFAULT_COLORS,
  scale = 1,
}: SeaWavesBackgroundProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const stormRef = React.useRef(intensity ?? 0.15)
  const speedRef = React.useRef(playbackRate(speed))
  const colorsRef = React.useRef(colors)
  const scaleRef = React.useRef(scale)
  const active = useAnimationActive(hostRef)
  const [storm, setStorm] = useSynced(intensity, 0.15)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    stormRef.current = storm
    speedRef.current = playbackRate(speed)
    colorsRef.current = colors
    scaleRef.current = scale
  }, [storm, speed, colors, scale])

  React.useEffect(() => {
    if (!showCanvas || !active) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let cancelled = false
    let frame = 0
    const run = async () => {
      const ogl = await import("ogl")
      if (cancelled) return undefined
      const renderer = new ogl.Renderer({ canvas, alpha: false, dpr: Math.min(window.devicePixelRatio || 1, 2) })
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
        u_storm: { value: stormRef.current },
        u_rate: { value: speedRef.current },
        u_scale: { value: scaleRef.current },
        u_deep: { value: hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [0.02, 0.08, 0.18]) },
        u_shore: { value: hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.05, 0.35, 0.48]) },
        u_sky: { value: hexToRgb(colorsRef.current[2] ?? DEFAULT_COLORS[2], [0.86, 0.91, 0.95]) },
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
        uniforms.u_storm.value = stormRef.current
        uniforms.u_rate.value = speedRef.current
        uniforms.u_scale.value = scaleRef.current
        uniforms.u_deep.value = hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [0.02, 0.08, 0.18])
        uniforms.u_shore.value = hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.05, 0.35, 0.48])
        uniforms.u_sky.value = hexToRgb(colorsRef.current[2] ?? DEFAULT_COLORS[2], [0.86, 0.91, 0.95])
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
  }, [active, showCanvas])

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
