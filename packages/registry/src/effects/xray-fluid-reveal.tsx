"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface XrayFluidRevealProps {
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

const MASK = `
precision highp float;
uniform sampler2D u_prev;
uniform vec2 u_pointer;
uniform float u_down;
varying vec2 vUv;
void main() {
  float prev = texture2D(u_prev, vUv).r * 0.955;
  float dist = distance(vUv, u_pointer);
  float circle = (1.0 - smoothstep(0.05, 0.14, dist)) * u_down;
  gl_FragColor = vec4(vec3(max(prev, circle)), 1.0);
}
`

const MIX = `
precision highp float;
uniform sampler2D u_mask;
uniform sampler2D u_skin;
uniform sampler2D u_bone;
uniform float u_time;
varying vec2 vUv;
void main() {
  float n = sin(vUv.x * 40.0 + u_time) * sin(vUv.y * 33.0 - u_time * 1.3);
  float mask = smoothstep(0.28, 0.62, texture2D(u_mask, vUv).r + n * 0.06);
  vec3 skin = texture2D(u_skin, vUv).rgb;
  vec3 bone = texture2D(u_bone, vUv).rgb;
  gl_FragColor = vec4(mix(skin, bone, mask), 1.0);
}
`

function paintSkin() {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 320
  const context = canvas.getContext("2d")
  if (!context) return canvas
  const sky = context.createLinearGradient(0, 0, 0, 320)
  sky.addColorStop(0, "#1c1917")
  sky.addColorStop(1, "#44403c")
  context.fillStyle = sky
  context.fillRect(0, 0, 640, 320)
  context.fillStyle = "#e7b8a0"
  context.beginPath()
  context.ellipse(320, 168, 230, 78, 0, 0, Math.PI * 2)
  context.fill()
  return canvas
}

function paintBone() {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 320
  const context = canvas.getContext("2d")
  if (!context) return canvas
  context.fillStyle = "#082f49"
  context.fillRect(0, 0, 640, 320)
  context.strokeStyle = "#e0f2fe"
  context.lineWidth = 3
  for (let index = 0; index < 7; index += 1) {
    context.beginPath()
    context.moveTo(140, 70 + index * 28)
    context.lineTo(500, 70 + index * 28)
    context.stroke()
  }
  context.lineWidth = 8
  context.beginPath()
  context.moveTo(320, 60)
  context.lineTo(320, 250)
  context.stroke()
  return canvas
}

function XrayFluidReveal({ className }: XrayFluidRevealProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0.5, y: 0.55, down: 0 })
  const [fallback, setFallback] = React.useState(false)
  const [showBone, setShowBone] = React.useState(false)
  const showCanvas = !reduced && !fallback

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
      const size = { width: 480, height: 240 }
      let read = new ogl.RenderTarget(gl, { width: size.width, height: size.height, depth: false })
      let write = new ogl.RenderTarget(gl, { width: size.width, height: size.height, depth: false })
      const geometry = new ogl.Plane(gl, { width: 2, height: 2 })
      const maskUniforms = {
        u_prev: { value: read.texture },
        u_pointer: { value: [0.5, 0.55] },
        u_down: { value: 0 },
      }
      const maskProgram = new ogl.Program(gl, { vertex: VERT, fragment: MASK, uniforms: maskUniforms, depthTest: false })
      const maskMesh = new ogl.Mesh(gl, { geometry, program: maskProgram, frustumCulled: false })
      const maskScene = new ogl.Transform()
      maskMesh.setParent(maskScene)
      const skin = new ogl.Texture(gl, { image: paintSkin() })
      const bone = new ogl.Texture(gl, { image: paintBone() })
      const mixUniforms = {
        u_mask: { value: read.texture },
        u_skin: { value: skin },
        u_bone: { value: bone },
        u_time: { value: 0 },
      }
      const mixProgram = new ogl.Program(gl, { vertex: VERT, fragment: MIX, uniforms: mixUniforms, depthTest: false })
      const mixMesh = new ogl.Mesh(gl, { geometry, program: mixProgram, frustumCulled: false })
      const mixScene = new ogl.Transform()
      mixMesh.setParent(mixScene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const started = performance.now()
      const tick = () => {
        maskUniforms.u_prev.value = read.texture
        maskUniforms.u_pointer.value = [pointerRef.current.x, pointerRef.current.y]
        maskUniforms.u_down.value = pointerRef.current.down
        renderer.render({ scene: maskScene, camera, target: write })
        const swap = read
        read = write
        write = swap
        mixUniforms.u_mask.value = read.texture
        mixUniforms.u_time.value = (performance.now() - started) / 1000
        renderer.render({ scene: mixScene, camera })
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

  const place = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointerRef.current = {
      x: (event.clientX - rect.left) / Math.max(rect.width, 1),
      y: 1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
      down: event.buttons > 0 || event.type === "pointermove" ? 1 : 0,
    }
  }

  return (
    <div data-slot="xray-fluid-reveal" className={cn("w-full space-y-2", className)}>
      <p className="text-xs text-muted-foreground">
        {reduced || fallback ? "点击切换外表和内部。" : "按住并移动指针，轨迹会留下柔边的透视。"}
      </p>
      <div
        ref={hostRef}
        role="img"
        aria-label="透视揭示"
        className="relative h-72 overflow-hidden rounded-xl border"
        onPointerMove={place}
        onPointerDown={place}
        onPointerUp={() => {
          pointerRef.current = { ...pointerRef.current, down: 0 }
        }}
        onClick={() => {
          if (reduced || fallback) setShowBone((current) => !current)
        }}
      >
        {showCanvas ? (
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        ) : (
          <div className={cn("absolute inset-0", showBone ? "bg-sky-950" : "bg-stone-700")}>
            <div className={cn("absolute top-1/2 left-1/2 h-24 w-3/5 -translate-x-1/2 -translate-y-1/2 rounded-full", showBone ? "border-y-4 border-sky-100" : "bg-orange-200")} />
          </div>
        )}
      </div>
    </div>
  )
}

export { XrayFluidReveal }
