"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ClothWindBannerProps {
  className?: string
  texture?: string
  intensity?: number
  speed?: number
  colors?: readonly string[]
}

const DEFAULT_COLORS = ["#7c3aed", "#ea580c"] as const

function useSynced(prop: number | undefined, fallback: number) {
  const [draft, setDraft] = React.useState<{ prop: number | undefined; value: number } | null>(null)
  const value = draft && Object.is(draft.prop, prop) ? draft.value : (prop ?? fallback)
  return [value, (next: number) => setDraft({ prop, value: next })] as const
}

const VERT = `
attribute vec2 uv;
attribute vec3 position;
uniform float u_time;
uniform float u_wind;
uniform float u_speed;
uniform vec2 u_mouse;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
varying float vLight;

float heightAt(vec2 p) {
  float wave = sin(p.x * 7.0 + u_time * u_speed * (0.7 + u_wind)) * 0.12;
  wave += sin(p.x * 15.0 - u_time * u_speed * 1.6 + p.y * 5.0) * 0.05;
  wave += sin(p.x * 28.0 + p.y * 19.0 + u_time * u_speed * 2.2) * 0.02;
  float dx = p.x - u_mouse.x;
  float dy = p.y - u_mouse.y;
  float bulge = exp(-(dx * dx + dy * dy) * 14.0) * 0.28;
  float pin = smoothstep(0.0, 0.2, p.x);
  return (wave * u_wind + bulge) * pin;
}

void main() {
  vUv = uv;
  float lift = heightAt(uv);
  float e = 0.02;
  float dx = heightAt(uv + vec2(e, 0.0)) - heightAt(uv - vec2(e, 0.0));
  float dy = heightAt(uv + vec2(0.0, e)) - heightAt(uv - vec2(0.0, e));
  vec3 normal = normalize(vec3(-dx, -dy, 1.0));
  vLight = clamp(dot(normal, normalize(vec3(-0.2, 0.35, 1.0))), 0.25, 1.0);
  vec3 displaced = position + vec3(0.0, 0.0, lift);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`

const FRAG = `
precision highp float;
uniform sampler2D u_map;
varying vec2 vUv;
varying float vLight;
void main() {
  vec3 tex = texture2D(u_map, vUv).rgb;
  gl_FragColor = vec4(tex * vLight, 1.0);
}
`

function paintBanner(primary: string, secondary: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext("2d")
  if (!context) return canvas
  for (let row = 0; row < 8; row += 1) {
    context.fillStyle = row % 2 === 0 ? primary : secondary
    context.fillRect(0, row * 32, 512, 32)
  }
  context.fillStyle = "#fef3c7"
  context.beginPath()
  context.arc(390, 128, 42, 0, Math.PI * 2)
  context.fill()
  return canvas
}

function ClothFallback({ colors }: { colors: readonly string[] }) {
  const primary = colors[0] ?? DEFAULT_COLORS[0]
  const secondary = colors[1] ?? DEFAULT_COLORS[1]
  return (
    <div
      className="absolute inset-x-10 inset-y-16 rounded-md"
      style={{ background: `repeating-linear-gradient(180deg, ${primary} 0 16px, ${secondary} 16px 32px)` }}
    />
  )
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function ClothWindBanner({
  className,
  texture,
  intensity,
  speed = 1,
  colors = DEFAULT_COLORS,
}: ClothWindBannerProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const mouseRef = React.useRef({ x: 0.7, y: 0.5 })
  const windRef = React.useRef(intensity ?? 0.65)
  const speedRef = React.useRef(playbackRate(speed))
  const colorsRef = React.useRef(colors)
  const active = useAnimationActive(hostRef)
  const [wind, setWind] = useSynced(intensity, 0.65)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback
  const label = wind < 0.34 ? "微风" : wind < 0.7 ? "和风" : "劲风"

  React.useEffect(() => {
    windRef.current = wind
    speedRef.current = playbackRate(speed)
    colorsRef.current = colors
  }, [wind, speed, colors])

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
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 2) })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return undefined
      }
      const camera = new ogl.Camera(gl, { fov: 32 })
      camera.position.set(0, 0, 2.4)
      const scene = new ogl.Transform()
      const geometry = new ogl.Plane(gl, { width: 2.4, height: 0.9, widthSegments: 56, heightSegments: 18 })
      const stripe = texture
        ? [DEFAULT_COLORS[0], DEFAULT_COLORS[1]]
        : [colorsRef.current[0] ?? DEFAULT_COLORS[0], colorsRef.current[1] ?? DEFAULT_COLORS[1]]
      const image = paintBanner(stripe[0] ?? DEFAULT_COLORS[0], stripe[1] ?? DEFAULT_COLORS[1])
      const map = new ogl.Texture(gl, { image, wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE })
      if (texture) {
        const picture = new Image()
        picture.onload = () => {
          map.image = picture
          map.needsUpdate = true
        }
        picture.src = texture
      }
      const uniforms = {
        u_time: { value: 0 },
        u_wind: { value: windRef.current },
        u_speed: { value: speedRef.current },
        u_mouse: { value: [0.7, 0.5] },
        u_map: { value: map },
      }
      const program = new ogl.Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
      program.cullFace = false
      const mesh = new ogl.Mesh(gl, { geometry, program, frustumCulled: false })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const started = performance.now()
      let stripeKey = texture ? "" : `${stripe[0]}|${stripe[1]}`
      const tick = () => {
        if (!texture) {
          const primary = colorsRef.current[0] ?? DEFAULT_COLORS[0]
          const secondary = colorsRef.current[1] ?? DEFAULT_COLORS[1]
          const key = `${primary}|${secondary}`
          if (key !== stripeKey) {
            stripeKey = key
            map.image = paintBanner(primary, secondary)
            map.needsUpdate = true
          }
        }
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_wind.value = windRef.current
        uniforms.u_speed.value = speedRef.current
        uniforms.u_mouse.value = [mouseRef.current.x, mouseRef.current.y]
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
  }, [active, showCanvas, texture])

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
      <div
        ref={hostRef}
        className="relative h-64 overflow-hidden rounded-xl border bg-slate-950"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          mouseRef.current = {
            x: (event.clientX - rect.left) / Math.max(rect.width, 1),
            y: 1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
          }
        }}
      >
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <ClothFallback colors={colors} />}
      </div>
    </div>
  )
}

export { ClothWindBanner }
