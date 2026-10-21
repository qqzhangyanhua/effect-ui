"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SquareLensDistortionProps {
  className?: string
  speed?: number
  intensity?: number
  scale?: number
  color?: string
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function cssToUnit(input: string): [number, number, number] | undefined {
  const text = input.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(text)
  const raw = hex?.[1]
  if (raw) {
    const full = raw.length === 3 ? `${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}` : raw
    return [
      Number.parseInt(full.slice(0, 2), 16) / 255,
      Number.parseInt(full.slice(2, 4), 16) / 255,
      Number.parseInt(full.slice(4, 6), 16) / 255,
    ]
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,/]+([\d.]+)[\s,/]+([\d.]+)/i.exec(text)
  if (!rgb?.[1] || !rgb[2] || !rgb[3]) return undefined
  return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
}

function borderUnit(color: string | undefined, allowDom = true): [number, number, number] {
  const value = color?.trim().toLowerCase()
  if (!value || value === "#fff" || value === "#ffffff" || value === "white") return [1, 1, 1]
  const direct = cssToUnit(color ?? "")
  if (direct || !allowDom || typeof document === "undefined") return direct ?? [1, 1, 1]
  const probe = document.createElement("span")
  probe.style.color = color ?? ""
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  probe.remove()
  return cssToUnit(computed) ?? [1, 1, 1]
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
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_intensity;
uniform float u_scale;
uniform vec3 u_border;
varying vec2 vUv;

vec3 scene(vec2 uv) {
  vec3 col = mix(vec3(0.10, 0.07, 0.24), vec3(0.78, 0.36, 0.14), uv.y);
  float a = smoothstep(0.16, 0.14, length(uv - vec2(0.32, 0.58)));
  float b = smoothstep(0.13, 0.11, length(uv - vec2(0.68, 0.46)));
  col = mix(col, vec3(0.96, 0.82, 0.28), a);
  col = mix(col, vec3(0.25, 0.82, 0.95), b);
  col += 0.05 * sin(uv.x * 46.0 + uv.y * 8.0);
  return col;
}

void main() {
  vec2 uv = vUv;
  vec2 delta = uv - u_mouse;
  float halfSize = 0.16 * u_scale;
  float inside = step(abs(delta.x), halfSize) * step(abs(delta.y), halfSize);
  vec2 lensUv = u_mouse + delta / 1.85;
  lensUv += vec2(sin(lensUv.y * 26.0 + u_time), cos(lensUv.x * 22.0 - u_time)) * 0.014 * u_intensity;
  float shift = 0.012;
  vec3 magnified = vec3(
    scene(lensUv + vec2(shift, 0.0)).r,
    scene(lensUv).g,
    scene(lensUv - vec2(shift, 0.0)).b
  );
  vec3 color = mix(scene(uv), magnified, inside);
  float border = inside * (1.0 - step(abs(delta.x), halfSize - 0.008) * step(abs(delta.y), halfSize - 0.008));
  color = mix(color, u_border, border);
  gl_FragColor = vec4(color, 1.0);
}
`

function LensFallback({ x, y, color }: { x: number; y: number; color?: string }) {
  const value = color?.trim().toLowerCase()
  const keep = !value || value === "#fff" || value === "#ffffff" || value === "white"
  return (
    <div className="absolute inset-0 bg-[linear-gradient(160deg,#1e1b4b,#9a3412)]">
      <div
        className={cn("absolute size-28 border-2 bg-white/10", keep && "border-white/80")}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(-50%, -50%)",
          borderColor: keep ? undefined : color,
        }}
      />
    </div>
  )
}

function SquareLensDistortion({ className, speed, intensity, scale, color }: SquareLensDistortionProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointer = React.useRef({ x: 0.5, y: 0.45 })
  const [fallback, setFallback] = React.useState(false)
  const [lens, setLens] = React.useState({ x: 0.5, y: 0.45 })
  const showCanvas = !reduced && !fallback
  const active = useAnimationActive(hostRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const speedRef = React.useRef(pace(speed))
  const intensityRef = React.useRef(intensity)
  const scaleRef = React.useRef(scale)
  const borderRef = React.useRef(borderUnit(color, false))

  React.useEffect(() => {
    speedRef.current = pace(speed)
    intensityRef.current = intensity
    scaleRef.current = scale
    borderRef.current = borderUnit(color)
  }, [speed, intensity, scale, color])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  const moveTo = (x: number, y: number, paintFallback: boolean) => {
    const next = {
      x: Math.min(0.92, Math.max(0.08, x)),
      y: Math.min(0.92, Math.max(0.08, y)),
    }
    pointer.current = next
    if (paintFallback) setLens(next)
  }

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
        return undefined
      }
      const camera = new ogl.Camera(gl)
      camera.position.z = 1
      const scene = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const uniforms = {
        u_time: { value: 0 },
        u_mouse: { value: [0.5, 0.55] },
        u_intensity: { value: 1 },
        u_scale: { value: 1 },
        u_border: { value: [1, 1, 1] },
      }
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms,
      })
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
        if (!activeRef.current) {
          frame = 0
          return
        }
        const amount = intensityRef.current
        const sized = scaleRef.current
        uniforms.u_time.value = ((performance.now() - started) / 1000) * speedRef.current
        uniforms.u_mouse.value = [pointer.current.x, 1 - pointer.current.y]
        uniforms.u_intensity.value = amount === undefined || amount === 1 ? 1 : amount
        uniforms.u_scale.value = sized === undefined || sized === 1 ? 1 : sized
        uniforms.u_border.value = borderRef.current
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      kickRef.current = () => {
        if (activeRef.current && frame === 0) frame = window.requestAnimationFrame(tick)
      }
      kickRef.current()
      return () => {
        kickRef.current = null
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
      kickRef.current = null
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [showCanvas])

  return (
    <div
      ref={hostRef}
      data-slot="square-lens-distortion"
      tabIndex={0}
      aria-label="方形透镜。移动指针或方向键，镜片会放大、扭曲并分离色彩。"
      className={cn(
        "relative h-80 w-full overflow-hidden rounded-xl border bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        moveTo(
          (event.clientX - rect.left) / Math.max(rect.width, 1),
          (event.clientY - rect.top) / Math.max(rect.height, 1),
          !showCanvas,
        )
      }}
      onKeyDown={(event) => {
        const step = 0.04
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0
        if (!dx && !dy) return
        event.preventDefault()
        moveTo(pointer.current.x + dx, pointer.current.y + dy, !showCanvas)
      }}
    >
      {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <LensFallback x={lens.x} y={lens.y} color={color} />}
    </div>
  )
}

export { SquareLensDistortion }
