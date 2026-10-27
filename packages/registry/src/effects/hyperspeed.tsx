"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HyperspeedProps {
  className?: string
  speed?: number
  count?: number
  colors?: readonly string[]
  intensity?: number
}

const DEFAULT_COLORS = ["#ff526b", "#6bc7ff"] as const

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
uniform float u_intensity;
uniform vec3 u_lampA;
uniform vec3 u_lampB;
varying vec2 vUv;

float hash(float n) {
  return fract(sin(n * 91.73) * 43758.5453);
}

void main() {
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (vUv - vec2(0.5, 0.42)) * aspect;
  float ang = atan(p.y, p.x);
  float dist = length(p);
  vec3 col = vec3(0.012, 0.016, 0.04);
  float road = smoothstep(0.22, 0.02, abs(p.x) * 0.35 + max(p.y, 0.0) * 0.05);
  col += vec3(0.03, 0.035, 0.06) * road;
  for (int i = 0; i < 64; i++) {
    float fi = float(i);
    float useStreak = step(fi + 0.5, u_count);
    float side = hash(fi) > 0.5 ? 1.0 : -1.0;
    float spread = 0.12 + hash(fi + 3.1) * 0.7;
    float aim = side * spread + 1.5708;
    float delta = abs(mod(ang - aim + 3.1415926, 6.2831853) - 3.1415926);
    float head = fract(hash(fi + 8.2) - u_time * u_speed * (0.12 + hash(fi + 1.7) * 0.28));
    float streakCenter = mix(0.05, 1.25, head);
    float along = smoothstep(0.16, 0.0, abs(dist - streakCenter));
    float streak = smoothstep(0.05, 0.0, delta) * along * smoothstep(0.0, 0.06, dist);
    vec3 lamp = side > 0.0 ? u_lampA : u_lampB;
    col += lamp * streak * (0.55 + u_speed * 0.22) * u_intensity * useStreak;
  }
  float vignette = smoothstep(1.25, 0.15, dist);
  gl_FragColor = vec4(col * vignette, 1.0);
}
`

function HighwayFallback({ live }: { live: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#05060f]">
      <style>
        {`@keyframes hyper-streak { 0% { opacity: 0; transform: scaleY(0.15); } 35% { opacity: 0.9; } 100% { opacity: 0; transform: scaleY(1); } }`}
      </style>
      {Array.from({ length: 16 }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1
        const spread = 6 + (index % 8) * 5
        return (
          <span
            key={index}
            className="absolute bottom-[18%] h-[70%] w-px"
            style={{
              left: `calc(50% + ${side * spread}%)`,
              transform: `rotate(${side * spread * 0.35}deg)`,
            }}
          >
            <span
              className="block h-full w-px origin-bottom"
              style={{
                background: side < 0 ? "linear-gradient(to top, transparent, #7dd3fc)" : "linear-gradient(to top, transparent, #fb7185)",
                animation: live ? `hyper-streak ${1.4 + (index % 5) * 0.18}s linear infinite` : undefined,
                opacity: live ? undefined : 0.7,
              }}
            />
          </span>
        )
      })}
    </div>
  )
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function Hyperspeed({
  className,
  speed = 1,
  count = 46,
  colors = DEFAULT_COLORS,
  intensity = 1,
}: HyperspeedProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const holding = React.useRef(false)
  const velocity = React.useRef(speed)
  const speedRef = React.useRef(playbackRate(speed))
  const countRef = React.useRef(count)
  const colorsRef = React.useRef(colors)
  const intensityRef = React.useRef(intensity)
  const active = useAnimationActive(hostRef)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    speedRef.current = playbackRate(speed)
    countRef.current = count
    colorsRef.current = colors
    intensityRef.current = intensity
  }, [speed, count, colors, intensity])

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
        alpha: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return
      }
      gl.clearColor(0.01, 0.012, 0.03, 1)
      const camera = new ogl.Camera(gl)
      camera.position.z = 1
      const scene = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const uniforms = {
        u_time: { value: 0 },
        u_speed: { value: velocity.current },
        u_count: { value: countRef.current },
        u_intensity: { value: intensityRef.current },
        u_lampA: { value: hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [1, 0.32, 0.42]) },
        u_lampB: { value: hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.42, 0.78, 1]) },
        u_resolution: { value: [canvas.clientWidth, canvas.clientHeight] },
      }
      const program = new ogl.Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
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
        const cruise = speedRef.current
        const target = holding.current ? cruise * 4.4 : cruise
        velocity.current += (target - velocity.current) * 0.045
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_speed.value = velocity.current
        uniforms.u_count.value = countRef.current
        uniforms.u_intensity.value = intensityRef.current
        uniforms.u_lampA.value = hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [1, 0.32, 0.42])
        uniforms.u_lampB.value = hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.42, 0.78, 1])
        if (labelRef.current) labelRef.current.textContent = velocity.current.toFixed(1)
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

  return (
    <div
      ref={hostRef}
      data-slot="hyperspeed"
      className={cn("relative h-72 w-full touch-none overflow-hidden rounded-xl bg-[#05060f] select-none", className)}
      onPointerDown={(event) => {
        if (reduced) return
        holding.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerUp={() => {
        holding.current = false
      }}
      onPointerCancel={() => {
        holding.current = false
      }}
    >
      {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-hidden /> : <HighwayFallback live={!reduced} />}
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-zinc-300">
        按住加速 · <span ref={labelRef}>1.0</span>
      </p>
    </div>
  )
}

export { Hyperspeed }
