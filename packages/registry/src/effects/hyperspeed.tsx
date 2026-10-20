"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HyperspeedProps {
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
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
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
  for (int i = 0; i < 46; i++) {
    float fi = float(i);
    float side = hash(fi) > 0.5 ? 1.0 : -1.0;
    float spread = 0.12 + hash(fi + 3.1) * 0.7;
    float aim = side * spread + 1.5708;
    float delta = abs(mod(ang - aim + 3.1415926, 6.2831853) - 3.1415926);
    float head = fract(hash(fi + 8.2) - u_time * u_speed * (0.12 + hash(fi + 1.7) * 0.28));
    float streakCenter = mix(0.05, 1.25, head);
    float along = smoothstep(0.16, 0.0, abs(dist - streakCenter));
    float streak = smoothstep(0.05, 0.0, delta) * along * smoothstep(0.0, 0.06, dist);
    vec3 lamp = side > 0.0 ? vec3(1.0, 0.32, 0.42) : vec3(0.42, 0.78, 1.0);
    col += lamp * streak * (0.55 + u_speed * 0.22);
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

function Hyperspeed({ className }: HyperspeedProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const labelRef = React.useRef<HTMLSpanElement>(null)
  const holding = React.useRef(false)
  const speed = React.useRef(1)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    if (!showCanvas) return
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
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
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
        u_speed: { value: 1 },
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
        const target = holding.current ? 4.4 : 1
        speed.current += (target - speed.current) * 0.045
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_speed.value = speed.current
        if (labelRef.current) labelRef.current.textContent = speed.current.toFixed(1)
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
    <div
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
