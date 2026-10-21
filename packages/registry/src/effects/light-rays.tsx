"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LightRaysProps {
  className?: string
  /** 为 true 时原点跟随指针；否则原点自己缓慢摆动。 */
  followMouse?: boolean
  count?: number
  speed?: number
  colors?: readonly string[]
}

const DEFAULT_COLORS = ["#ffc261", "#73adff"] as const

type Rgb = [number, number, number]

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
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_count;
uniform vec2 u_origin;
uniform vec3 u_warm;
uniform vec3 u_cool;
varying vec2 vUv;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

void main() {
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (vUv - u_origin) * aspect;
  float ang = atan(p.y, p.x);
  float dist = length(p);
  float glow = 0.0;
  for (int i = 0; i < 24; i++) {
    float fi = float(i);
    float beamOn = step(fi + 0.5, u_count);
    float base = hash(fi) * 6.2831853;
    float sway = sin(u_time * u_speed * (0.35 + hash(fi + 4.0) * 0.85) + fi) * 0.14;
    float delta = abs(mod(ang - base - sway + 3.1415926, 6.2831853) - 3.1415926);
    float width = 0.01 + hash(fi + 9.0) * 0.04;
    float beam = smoothstep(width, 0.0, delta);
    float falloff = exp(-dist * (1.05 + hash(fi + 2.0) * 1.5));
    glow += beam * falloff * beamOn;
  }
  float core = exp(-dist * 16.0);
  vec3 col = mix(u_cool, u_warm, 0.72) * glow * 1.55 + u_warm * core;
  float alpha = clamp(glow * 1.25 + core, 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}
`

function RayFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: [
          "radial-gradient(circle at var(--ox, 50%) var(--oy, 72%), rgba(255,214,150,0.95), transparent 16%)",
          "conic-gradient(from 18deg at var(--ox, 50%) var(--oy, 72%), transparent 0deg, rgba(255,196,120,0.7) 8deg, transparent 16deg, transparent 34deg, rgba(150,196,255,0.45) 42deg, transparent 52deg, transparent 78deg, rgba(255,186,96,0.55) 88deg, transparent 100deg, transparent 140deg, rgba(255,220,170,0.4) 150deg, transparent 164deg, transparent 210deg, rgba(170,205,255,0.38) 220deg, transparent 234deg, transparent 360deg)",
        ].join(", "),
      }}
    />
  )
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function LightRays({
  className,
  followMouse = true,
  count = 14,
  speed = 1,
  colors = DEFAULT_COLORS,
}: LightRaysProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointer = React.useRef({ x: 0.5, y: 0.72 })
  const countRef = React.useRef(count)
  const speedRef = React.useRef(playbackRate(speed))
  const colorsRef = React.useRef(colors)
  const active = useAnimationActive(hostRef)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    countRef.current = count
    speedRef.current = playbackRate(speed)
    colorsRef.current = colors
  }, [count, speed, colors])

  React.useEffect(() => {
    if (!showCanvas || !active) return
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    let frame = 0

    const run = async () => {
      const ogl = await import("ogl")
      if (cancelled) return
      const renderer = new ogl.Renderer({
        canvas,
        alpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return
      }
      gl.clearColor(0, 0, 0, 0)
      const camera = new ogl.Camera(gl)
      camera.position.z = 1
      const scene = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const uniforms = {
        u_time: { value: 0 },
        u_speed: { value: 1 },
        u_count: { value: countRef.current },
        u_resolution: { value: [canvas.clientWidth, canvas.clientHeight] },
        u_origin: { value: [0.5, 0.28] },
        u_warm: { value: hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [1, 0.76, 0.38]) },
        u_cool: { value: hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.45, 0.68, 1]) },
      }
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        transparent: true,
        uniforms,
      })
      const mesh = new ogl.Mesh(gl, { geometry, program })
      mesh.setParent(scene)

      const resize = () => {
        const host = canvas.parentElement ?? canvas
        const rect = host.getBoundingClientRect()
        const width = Math.max(rect.width, 1)
        const height = Math.max(rect.height, 1)
        renderer.setSize(width, height)
        uniforms.u_resolution.value = [width, height]
      }
      resize()
      const observer = new ResizeObserver(resize)
      if (canvas.parentElement) observer.observe(canvas.parentElement)
      const started = performance.now()
      const tick = () => {
        const time = (performance.now() - started) / 1000
        const rate = speedRef.current
        uniforms.u_time.value = time
        uniforms.u_speed.value = rate
        uniforms.u_count.value = countRef.current
        uniforms.u_warm.value = hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [1, 0.76, 0.38])
        uniforms.u_cool.value = hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.45, 0.68, 1])
        const originX = followMouse ? pointer.current.x : 0.5 + Math.sin(time * 0.35 * rate) * 0.08
        const originY = followMouse ? pointer.current.y : 0.72 + Math.sin(time * 0.22 * rate) * 0.04
        uniforms.u_origin.value = [originX, 1 - originY]
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
  }, [active, followMouse, showCanvas])

  return (
    <div
      ref={hostRef}
      data-slot="light-rays"
      className={cn("relative h-72 w-full overflow-hidden rounded-xl bg-[#07060b]", className)}
      onPointerMove={(event) => {
        if (!followMouse) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1)
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1)
        pointer.current = { x, y }
        event.currentTarget.style.setProperty("--ox", `${x * 100}%`)
        event.currentTarget.style.setProperty("--oy", `${y * 100}%`)
      }}
    >
      {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden /> : <RayFallback />}
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-zinc-400">
        体积光锥{followMouse ? " · 跟随指针" : " · 自行摆动"}
      </p>
    </div>
  )
}

export { LightRays }
