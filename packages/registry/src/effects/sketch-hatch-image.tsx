"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SketchHatchImageProps {
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
uniform vec2 u_mouse;
varying vec2 vUv;

vec3 photo(vec2 uv) {
  vec3 sky = mix(vec3(0.45, 0.62, 0.78), vec3(0.95, 0.78, 0.55), smoothstep(0.35, 0.8, uv.y));
  float hill = smoothstep(0.02, 0.0, uv.y - (0.28 + 0.08 * sin(uv.x * 9.0)));
  vec3 land = mix(vec3(0.18, 0.28, 0.16), vec3(0.42, 0.32, 0.18), uv.y * 2.0);
  vec3 color = mix(land, sky, hill);
  float sun = smoothstep(0.08, 0.0, length(uv - vec2(0.72, 0.68)));
  return mix(color, vec3(1.0, 0.93, 0.7), sun);
}

void main() {
  vec3 picture = photo(vUv);
  float luma = dot(picture, vec3(0.3, 0.59, 0.11));
  float angle = 0.8;
  vec2 rotated = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * vUv;
  float density = 28.0 + (1.0 - luma) * 70.0;
  float hatch = smoothstep(0.42, 0.58, fract(rotated.y * density));
  vec3 pencil = mix(vec3(0.16, 0.15, 0.13), vec3(0.94, 0.92, 0.86), hatch);
  float reveal = smoothstep(0.2, 0.1, length(vUv - u_mouse));
  vec3 color = mix(pencil, picture, reveal);
  gl_FragColor = vec4(color, 1.0);
}
`

function SketchFallback({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#d6d3d1_0_2px,#78716c_2px_3px)]">
      <div
        className="absolute size-28 rounded-full"
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(#7dd3fc, #86efac 60%, #a16207)",
        }}
      />
    </div>
  )
}

function SketchHatchImage({ className }: SketchHatchImageProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointer = React.useRef({ x: 0.7, y: 0.35 })
  const [spot, setSpot] = React.useState({ x: 0.7, y: 0.35 })
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  const moveTo = (x: number, y: number, paint: boolean) => {
    const next = { x: Math.min(0.95, Math.max(0.05, x)), y: Math.min(0.95, Math.max(0.05, y)) }
    pointer.current = next
    if (paint) setSpot(next)
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
      const uniforms = { u_mouse: { value: [0.7, 0.65] } }
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
      const tick = () => {
        uniforms.u_mouse.value = [pointer.current.x, 1 - pointer.current.y]
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
      ref={hostRef}
      data-slot="sketch-hatch-image"
      tabIndex={0}
      aria-label="铅笔排线画面。移动指针或方向键，局部露出原来的颜色。"
      className={cn(
        "relative h-80 w-full overflow-hidden rounded-xl border bg-stone-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        moveTo((event.clientX - rect.left) / Math.max(rect.width, 1), (event.clientY - rect.top) / Math.max(rect.height, 1), !showCanvas)
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
      {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <SketchFallback x={spot.x} y={spot.y} />}
    </div>
  )
}

export { SketchHatchImage }
