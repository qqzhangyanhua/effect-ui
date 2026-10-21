"use client"

import * as React from "react"
import { useMotionValueEvent, useScroll } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ImageTubeScrollProps {
  images?: string[]
  radius?: number
  speed?: number
  className?: string
}

const DEFAULTS = [
  ["晨窗", "#fb7185"],
  ["长廊", "#38bdf8"],
  ["书架", "#f59e0b"],
  ["港口", "#34d399"],
  ["夜市", "#818cf8"],
  ["雪线", "#e2e8f0"],
  ["剧场", "#f472b6"],
  ["庭院", "#22d3ee"],
] as const

function paintCard(label: string, color: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 320
  const context = canvas.getContext("2d")
  if (!context) return canvas
  context.fillStyle = color
  context.fillRect(0, 0, 512, 320)
  context.fillStyle = "rgba(15,23,42,0.28)"
  context.fillRect(0, 220, 512, 100)
  context.fillStyle = "#0f172a"
  context.font = "64px sans-serif"
  context.fillText(label, 36, 120)
  return canvas
}

function ImageTubeScroll({ images, radius = 1.35, speed = 1, className }: ImageTubeScrollProps) {
  const reduced = usePrefersReducedMotion()
  const sectionRef = React.useRef<HTMLElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const progressRef = React.useRef(0)
  const speedRef = React.useRef(speed)
  const radiusRef = React.useRef(radius)
  const dragRef = React.useRef<{ x: number; speed: number } | null>(null)
  const [fallback, setFallback] = React.useState(false)
  const [dragSpeed, setDragSpeed] = React.useState<number | null>(null)
  const shownSpeed = dragSpeed ?? speed
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] })
  const cards = images?.length ? images : DEFAULTS.map(([label]) => label)
  const showCanvas = !reduced && !fallback

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    progressRef.current = value
  })

  React.useEffect(() => {
    speedRef.current = shownSpeed
  }, [shownSpeed])

  React.useEffect(() => {
    radiusRef.current = radius
  }, [radius])

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
      const camera = new ogl.Camera(gl, { fov: 55, near: 0.1, far: 40 })
      const scene = new ogl.Transform()
      const tube = new ogl.Transform()
      tube.setParent(scene)
      const around = 4
      const records: { mesh: InstanceType<typeof ogl.Mesh>; angle: number; layer: number }[] = []
      const sources = images?.length ? images : DEFAULTS.map(([label, color]) => ({ label, color }))
      const rings = Math.max(6, Math.ceil(sources.length / around))
      for (let index = 0; index < rings * around; index += 1) {
        const source = sources[index % sources.length]
        if (!source) continue
        const label = typeof source === "string" ? `画面 ${(index % sources.length) + 1}` : source.label
        const color = typeof source === "string" ? "#334155" : source.color
        const image = typeof source === "string" ? undefined : paintCard(label, color)
        const texture = new ogl.Texture(gl, {
          image: image ?? undefined,
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
        const geometry = new ogl.Plane(gl, { width: 1.45, height: 0.92 })
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
            uniform sampler2D u_map;
            varying vec2 vUv;
            void main() {
              gl_FragColor = texture2D(u_map, vUv);
            }
          `,
          uniforms: { u_map: { value: texture } },
          cullFace: false,
        })
        const mesh = new ogl.Mesh(gl, { geometry, program, frustumCulled: false })
        mesh.setParent(tube)
        records.push({ mesh, angle: (index % around) * ((Math.PI * 2) / around), layer: Math.floor(index / around) })
      }
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const tick = () => {
        const progress = progressRef.current
        const currentRadius = radiusRef.current
        const spacing = 2.35
        const travel = Math.max(rings - 1, 1) * spacing
        const paced = Math.min(1, progress * Math.max(speedRef.current, 0.35))
        tube.rotation.z = progress * Math.PI * 2 * speedRef.current
        camera.position.z = 1.7 - paced * travel
        for (const record of records) {
          const z = -record.layer * spacing
          record.mesh.position.set(Math.sin(record.angle) * currentRadius, Math.cos(record.angle) * currentRadius, z)
          record.mesh.rotation.x = -Math.cos(record.angle) * 0.55
          record.mesh.rotation.y = Math.sin(record.angle) * 0.55
          record.mesh.rotation.z = 0
        }
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
  }, [images, showCanvas])

  return (
    <section ref={sectionRef} data-slot="image-tube-scroll" className={cn(showCanvas ? "relative h-[220vh]" : "relative", className)}>
      <div className={cn(showCanvas && "sticky top-0 h-svh")}>
        <p className="px-4 pt-4 text-xs text-muted-foreground">滚动穿过图片管道。左右拖动可以改变速度，当前 {shownSpeed.toFixed(2)}。</p>
        {showCanvas ? (
          <div
            ref={hostRef}
            className="relative h-[calc(100svh-4rem)] touch-none"
            onPointerDown={(event) => {
              dragRef.current = { x: event.clientX, speed: speedRef.current }
              event.currentTarget.setPointerCapture(event.pointerId)
            }}
            onPointerMove={(event) => {
              if (!dragRef.current) return
              const next = Math.min(2.4, Math.max(0.25, dragRef.current.speed + (event.clientX - dragRef.current.x) * 0.004))
              setDragSpeed(next)
            }}
            onPointerUp={() => {
              dragRef.current = null
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 size-full" />
          </div>
        ) : (
          <ul className="grid gap-3 p-4">
            {cards.map((card) => (
              <li key={card} className="rounded-xl border bg-muted px-4 py-8 text-lg">
                {card}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export { ImageTubeScroll }
