"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LiquidMorphSlideshowProps {
  images?: string[]
  interval?: number
  intensity?: number
  speed?: number
  className?: string
}

const FRAMES = [
  { label: "晨雾", from: "#fb7185", to: "#f59e0b" },
  { label: "海湾", from: "#38bdf8", to: "#1e3a8a" },
  { label: "林地", from: "#86efac", to: "#14532d" },
] as const

function paintFrame(label: string, from: string, to: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 640
  canvas.height = 400
  const context = canvas.getContext("2d")
  if (!context) return canvas
  const gradient = context.createLinearGradient(0, 0, 640, 400)
  gradient.addColorStop(0, from)
  gradient.addColorStop(1, to)
  context.fillStyle = gradient
  context.fillRect(0, 0, 640, 400)
  context.fillStyle = "rgba(15,23,42,0.28)"
  context.fillRect(36, 250, 280, 72)
  context.fillStyle = "#f8fafc"
  context.font = "48px sans-serif"
  context.fillText(label, 56, 300)
  return canvas
}

function LiquidMorphSlideshow({ images, interval = 3200, intensity = 0.45, speed, className }: LiquidMorphSlideshowProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const indexRef = React.useRef(0)
  const intensityRef = React.useRef(intensity)
  const rate = speed === undefined || speed === 1 ? 1 : speed
  const rateRef = React.useRef(rate)
  const count = images?.length ? images.length : FRAMES.length
  const [caption, setCaption] = React.useState(0)
  const [fallback, setFallback] = React.useState(false)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    intensityRef.current = intensity
    rateRef.current = rate
  }, [intensity, rate])

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      indexRef.current = (indexRef.current + 1) % count
    }, Math.max(800, interval))
    return () => window.clearInterval(timer)
  }, [count, interval])

  React.useEffect(() => {
    if (!showCanvas) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let cancelled = false
    let frame = 0
    let running = true
    const visibleRef = { current: true }
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
      const camera = new ogl.Camera(gl, { fov: 35 })
      camera.position.z = 2.2
      const scene = new ogl.Transform()
      const textures = (images?.length ? images : FRAMES.map((item) => item)).map((source, index) => {
        const painted = FRAMES[index % FRAMES.length] ?? FRAMES[0]
        const texture = new ogl.Texture(gl, {
          image: paintFrame(painted.label, painted.from, painted.to),
          minFilter: gl.LINEAR,
          magFilter: gl.LINEAR,
          wrapS: gl.CLAMP_TO_EDGE,
          wrapT: gl.CLAMP_TO_EDGE,
        })
        if (typeof source === "string") {
          const picture = new Image()
          picture.onload = () => {
            texture.image = picture
            texture.needsUpdate = true
          }
          picture.src = source
        }
        return texture
      })
      const uniforms = {
        u_from: { value: textures[0] },
        u_to: { value: textures[1 % textures.length] },
        u_mix: { value: 0 },
        u_time: { value: 0 },
        u_intensity: { value: intensityRef.current },
      }
      const program = new ogl.Program(gl, {
        vertex: `
          attribute vec2 uv;
          attribute vec3 position;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform sampler2D u_from;
          uniform sampler2D u_to;
          uniform float u_mix;
          uniform float u_time;
          uniform float u_intensity;
          varying vec2 vUv;
          void main() {
            float n = sin(vUv.x * 18.0 + u_time) * cos(vUv.y * 14.0 - u_time * 1.3);
            float n2 = sin((vUv.x + vUv.y) * 22.0 + u_time * 0.7);
            float wave = sin(u_mix * 3.14159);
            vec2 off = vec2(n, n2) * u_intensity * 0.18 * wave;
            vec4 fromColor = texture2D(u_from, vUv + off);
            vec4 toColor = texture2D(u_to, vUv - off);
            gl_FragColor = mix(fromColor, toColor, smoothstep(0.12, 0.88, u_mix));
          }
        `,
        uniforms,
      })
      const mesh = new ogl.Mesh(gl, { geometry: new ogl.Plane(gl, { width: 2.6, height: 1.6 }), program })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        const aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1)
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect })
        const viewHeight = 2 * Math.tan((35 * Math.PI) / 360) * camera.position.z
        mesh.scale.set((viewHeight * aspect) / 2.6, viewHeight / 1.6, 1)
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      let shown = 0
      let mix = 0
      let time = 0
      const tick = () => {
        if (!running) return
        if (!visibleRef.current) {
          frame = 0
          return
        }
        const rateNow = rateRef.current
        time += rateNow === 1 ? 0.016 : 0.016 * rateNow
        const target = indexRef.current % textures.length
        if (target !== shown) mix = Math.min(1, mix + 0.028 + intensityRef.current * 0.02)
        if (mix >= 1) {
          shown = (shown + 1) % textures.length
          mix = 0
          const nextCaption = shown
          queueMicrotask(() => {
            if (!cancelled) setCaption(nextCaption)
          })
        }
        uniforms.u_from.value = textures[shown]
        uniforms.u_to.value = textures[(shown + 1) % textures.length]
        uniforms.u_mix.value = target === shown ? 0 : mix
        uniforms.u_time.value = time
        uniforms.u_intensity.value = intensityRef.current
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      const viewObserver = new IntersectionObserver((entries) => {
        visibleRef.current = entries.some((entry) => entry.isIntersecting)
        if (visibleRef.current && running && frame === 0) frame = window.requestAnimationFrame(tick)
      })
      viewObserver.observe(host)
      frame = window.requestAnimationFrame(tick)
      return () => {
        window.cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        viewObserver.disconnect()
        gl.getExtension("WEBGL_lose_context")?.loseContext()
      }
    }
    const job = run().catch(() => {
      if (!cancelled) queueMicrotask(() => { if (!cancelled) setFallback(true) })
      return undefined
    })
    return () => {
      cancelled = true
      running = false
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [images, showCanvas])

  const slides = images?.length
    ? images.map((image, index) => ({ label: `画面 ${index + 1}`, image }))
    : FRAMES.map((frame) => ({ label: frame.label, from: frame.from, to: frame.to }))

  if (!showCanvas) {
    return (
      <div data-slot="liquid-morph-slideshow" className={cn("relative h-72 overflow-hidden rounded-xl border", className)}>
        {slides.map((slide, index) => (
          <div
            key={slide.label}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: index === caption % slides.length ? 1 : 0,
              backgroundImage: "image" in slide ? `url(${slide.image})` : `linear-gradient(135deg, ${slide.from}, ${slide.to})`,
              backgroundSize: "cover",
            }}
          />
        ))}
        <p className="absolute bottom-3 left-3 text-xs text-white">交叉淡入 {caption % slides.length + 1} / {slides.length}</p>
      </div>
    )
  }

  return (
    <div ref={hostRef} data-slot="liquid-morph-slideshow" className={cn("relative h-72 overflow-hidden rounded-xl border bg-slate-950", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label="液体变形幻灯" />
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-white/80">{(caption % count) + 1} / {count}</p>
    </div>
  )
}

export { LiquidMorphSlideshow }
