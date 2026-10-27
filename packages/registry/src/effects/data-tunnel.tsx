"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DataTunnelProps {
  className?: string
  count?: number
  speed?: number
  colors?: readonly string[]
  intensity?: number
}

const DEFAULT_COLORS = ["#0d3347", "#a6f2ff"] as const

type Rgb = [number, number, number]

function hexToRgb(hex: string, fallback: Rgb): Rgb {
  const text = hex.trim().replace(/^#/, "")
  const digits = text.length === 3 ? [...text].map((char) => `${char}${char}`).join("") : text
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) return fallback
  const value = Number.parseInt(digits, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

const VERT = `
attribute vec3 position;
attribute vec2 uv;
attribute vec3 aCenter;
attribute float aCell;
uniform float u_depth;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  float z = mod(aCenter.z - u_depth, 8.0) - 4.0;
  vec3 p = vec3(aCenter.x, aCenter.y, 0.0) + position * vec3(0.09, 0.045, 1.0);
  p.z += z;
  vUv = vec2((uv.x + mod(aCell, 16.0)) / 16.0, uv.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

const FRAG = `
precision highp float;
uniform sampler2D u_atlas;
uniform vec3 u_bg;
uniform vec3 u_glyph;
uniform float u_intensity;
varying vec2 vUv;
void main() {
  float glyph = texture2D(u_atlas, vUv).r;
  vec3 color = mix(u_bg, u_glyph * u_intensity, glyph);
  gl_FragColor = vec4(color, 0.35 + glyph * 0.65);
}
`

const CHARS = "0123456789ABCDEF"

function paintAtlas() {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 32
  const context = canvas.getContext("2d")
  if (!context) return canvas
  context.fillStyle = "#042f2e"
  context.fillRect(0, 0, 512, 32)
  context.fillStyle = "#ecfeff"
  context.font = "22px monospace"
  context.textAlign = "center"
  context.textBaseline = "middle"
  for (let index = 0; index < CHARS.length; index += 1) {
    context.fillText(CHARS[index] ?? "", index * 32 + 16, 17)
  }
  return canvas
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function DataTunnel({
  className,
  count: ringCount = 10,
  speed = 1,
  colors = DEFAULT_COLORS,
  intensity = 1,
}: DataTunnelProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const boost = React.useRef(0)
  const speedRef = React.useRef(playbackRate(speed))
  const colorsRef = React.useRef(colors)
  const intensityRef = React.useRef(intensity)
  const active = useAnimationActive(hostRef)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    speedRef.current = playbackRate(speed)
    colorsRef.current = colors
    intensityRef.current = intensity
  }, [speed, colors, intensity])

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
      const camera = new ogl.Camera(gl, { fov: 42, near: 0.1, far: 20 })
      camera.position.z = 0.2
      const rings = Math.max(1, Math.round(ringCount))
      const segments = 14
      const count = rings * segments
      const centers = new Float32Array(count * 3)
      const cells = new Float32Array(count)
      for (let ring = 0; ring < rings; ring += 1) {
        for (let segment = 0; segment < segments; segment += 1) {
          const index = ring * segments + segment
          const angle = (segment / segments) * Math.PI * 2
          const radius = 0.72 + (ring % 3) * 0.08
          centers[index * 3] = Math.cos(angle) * radius
          centers[index * 3 + 1] = Math.sin(angle) * radius
          centers[index * 3 + 2] = ring * 0.8
          cells[index] = (ring + segment) % CHARS.length
        }
      }
      const geometry = new ogl.Geometry(gl, {
        position: { size: 3, data: new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]) },
        uv: { size: 2, data: new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]) },
        index: { data: new Uint16Array([0, 1, 2, 2, 1, 3]) },
        aCenter: { size: 3, data: centers, instanced: 1 },
        aCell: { size: 1, data: cells, instanced: 1 },
      })
      const atlas = new ogl.Texture(gl, { image: paintAtlas(), minFilter: gl.LINEAR, magFilter: gl.LINEAR })
      const uniforms = {
        u_depth: { value: 0 },
        u_atlas: { value: atlas },
        u_bg: { value: hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [0.05, 0.2, 0.28]) },
        u_glyph: { value: hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.65, 0.95, 1]) },
        u_intensity: { value: intensityRef.current },
      }
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
      })
      const scene = new ogl.Transform()
      const mesh = new ogl.Mesh(gl, { geometry, program, frustumCulled: false })
      mesh.setParent(scene)
      let depth = 0
      let speed = 0.35
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1), fov: camera.fov })
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const tick = () => {
        speed += boost.current
        speed = Math.max(0.18, Math.min(2.4, speed * 0.96))
        boost.current *= 0.9
        depth += speed * 0.04 * speedRef.current
        uniforms.u_bg.value = hexToRgb(colorsRef.current[0] ?? DEFAULT_COLORS[0], [0.05, 0.2, 0.28])
        uniforms.u_glyph.value = hexToRgb(colorsRef.current[1] ?? DEFAULT_COLORS[1], [0.65, 0.95, 1])
        uniforms.u_intensity.value = intensityRef.current
        uniforms.u_depth.value = depth
        const fov = 38 + speed * 16
        camera.fov = fov
        camera.perspective({ fov, aspect: gl.canvas.width / Math.max(gl.canvas.height, 1) })
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
  }, [active, ringCount, showCanvas])

  return (
    <div data-slot="data-tunnel" className={cn("w-full space-y-2", className)}>
      <p className="text-xs text-muted-foreground">滚动或按住加速。视野会随速度张开。减弱动效时保持静止。</p>
      <div
        ref={hostRef}
        role="img"
        aria-label="数据隧道"
        className="relative h-72 overflow-hidden rounded-xl border bg-slate-950"
        onWheel={(event) => {
          if (reduced) return
          event.preventDefault()
          boost.current += Math.min(0.4, Math.abs(event.deltaY) * 0.0015)
        }}
        onPointerDown={() => {
          boost.current += 0.35
        }}
      >
        {showCanvas ? (
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, #e0f2fe 0 3%, transparent 4%), repeating-radial-gradient(circle at 50% 50%, transparent 0 16px, rgba(34,211,238,0.4) 16px 18px)",
            }}
          />
        )}
      </div>
    </div>
  )
}

export { DataTunnel }
