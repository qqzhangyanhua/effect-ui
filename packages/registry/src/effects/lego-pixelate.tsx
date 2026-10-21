"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LegoPixelateProps {
  image?: string
  blockSize?: number
  trigger?: "hover" | "view"
  className?: string
}

const VERT = `
attribute vec2 uv;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const FRAG = `
precision highp float;
uniform sampler2D u_map;
uniform float u_blocks;
varying vec2 vUv;
void main() {
  float blocks = max(u_blocks, 1.0);
  vec2 cell = floor(vUv * blocks);
  vec2 sampleUv = (cell + 0.5) / blocks;
  vec3 color = texture2D(u_map, sampleUv).rgb;
  vec2 local = fract(vUv * blocks) - 0.5;
  float stud = smoothstep(0.2, 0.08, length(local));
  float edge = smoothstep(0.5, 0.38, max(abs(local.x), abs(local.y)));
  color = color * mix(0.62, 1.0, edge) + stud * 0.22;
  gl_FragColor = vec4(color, 1.0);
}
`

function paintScene() {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 400
  const context = canvas.getContext("2d")
  if (!context) return canvas
  const sky = context.createLinearGradient(0, 0, 0, 400)
  sky.addColorStop(0, "#7dd3fc")
  sky.addColorStop(1, "#fde68a")
  context.fillStyle = sky
  context.fillRect(0, 0, 640, 400)
  context.fillStyle = "#166534"
  context.fillRect(0, 250, 640, 150)
  context.fillStyle = "#b45309"
  context.fillRect(250, 150, 140, 120)
  context.fillStyle = "#f8fafc"
  context.fillRect(270, 180, 36, 36)
  context.fillRect(334, 180, 36, 36)
  return canvas
}

function LegoPixelate({ image, blockSize = 12, trigger = "hover", className }: LegoPixelateProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const targetRef = React.useRef(blockSize)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback
  const preview = image

  React.useEffect(() => {
    targetRef.current = blockSize
  }, [blockSize])

  React.useEffect(() => {
    if (trigger !== "view" || !showCanvas) return
    const node = hostRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) targetRef.current = 140
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [showCanvas, trigger])

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
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return undefined
      }
      const camera = new ogl.Camera(gl, { fov: 35 })
      camera.position.z = 2.2
      const scene = new ogl.Transform()
      const map = new ogl.Texture(gl, { image: paintScene() })
      if (image) {
        const picture = new Image()
        picture.onload = () => {
          map.image = picture
          map.needsUpdate = true
        }
        picture.src = image
      }
      const uniforms = { u_map: { value: map }, u_blocks: { value: blockSize } }
      const program = new ogl.Program(gl, { vertex: VERT, fragment: FRAG, uniforms })
      const mesh = new ogl.Mesh(gl, { geometry: new ogl.Plane(gl, { width: 2.4, height: 1.5 }), program })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const tick = () => {
        uniforms.u_blocks.value += (targetRef.current - uniforms.u_blocks.value) * 0.08
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
      if (!cancelled) queueMicrotask(() => { if (!cancelled) setFallback(true) })
      return undefined
    })
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [blockSize, image, showCanvas])

  return (
    <div
      ref={hostRef}
      data-slot="lego-pixelate"
      className={cn("relative h-72 overflow-hidden rounded-xl border bg-slate-950", className)}
      onPointerEnter={() => {
        if (trigger === "hover") targetRef.current = 140
      }}
      onPointerLeave={() => {
        if (trigger === "hover") targetRef.current = blockSize
      }}
    >
      {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : preview ? <div aria-hidden className="size-full bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(preview)})` }} /> : <div className="absolute inset-6 rounded-lg bg-linear-to-b from-sky-300 to-amber-200" />}
    </div>
  )
}

export { LegoPixelate }
