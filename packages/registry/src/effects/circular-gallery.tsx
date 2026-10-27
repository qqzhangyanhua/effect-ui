"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CircularGalleryItem {
  src: string
  title: string
}

export interface CircularGalleryProps {
  items: CircularGalleryItem[]
  className?: string
  /** 自转倍率。不传或 1 仍是每帧 0.004 弧度。 */
  speed?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function CircularGallery({ items, className, speed }: CircularGalleryProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)
  const reduced = usePrefersReducedMotion()
  const activeRef = React.useRef(false)
  const reducedRef = React.useRef(false)
  const speedRef = React.useRef(speed)
  const startRef = React.useRef<(() => void) | null>(null)
  const [fallback, setFallback] = React.useState(false)
  const [angle, setAngle] = React.useState(0)
  const drag = React.useRef({ active: false, last: 0 })

  React.useEffect(() => {
    activeRef.current = active
    if (active) startRef.current?.()
  }, [active])

  React.useEffect(() => {
    reducedRef.current = reduced
    if (!reduced && activeRef.current) startRef.current?.()
  }, [reduced])

  React.useEffect(() => {
    speedRef.current = speed
  }, [speed])

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const ogl = await import("ogl")
        const canvas = canvasRef.current
        if (!canvas || cancelled) return
        const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
        const gl = renderer.gl
        const camera = new ogl.Camera(gl, { fov: 28 })
        camera.position.z = 6
        const scene = new ogl.Transform()
        const geometry = new ogl.Plane(gl, { width: 1.2, height: 1.5 })
        const meshes: InstanceType<typeof ogl.Mesh>[] = []
        await Promise.all(
          items.map(async (item, index) => {
            const texture = new ogl.Texture(gl)
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = item.src
            await img.decode().catch(() => undefined)
            texture.image = img
            const program = new ogl.Program(gl, {
              vertex: `attribute vec2 uv; attribute vec3 position; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
              fragment: `precision highp float; uniform sampler2D tMap; varying vec2 vUv; void main(){ gl_FragColor=texture2D(tMap,vUv); }`,
              uniforms: { tMap: { value: texture } },
            })
            const mesh = new ogl.Mesh(gl, { geometry, program })
            mesh.setParent(scene)
            const theta = (index / items.length) * Math.PI * 2
            mesh.position.set(Math.sin(theta) * 2.4, 0, Math.cos(theta) * 2.4)
            mesh.rotation.y = theta
            meshes.push(mesh)
          }),
        )
        const resize = () => {
          const { width, height } = canvas.getBoundingClientRect()
          renderer.setSize(width, height)
          camera.perspective({ aspect: width / Math.max(height, 1) })
        }
        resize()
        let frame = 0
        let rot = 0
        const tick = () => {
          if (activeRef.current && !reducedRef.current) {
            const rate = pace(speedRef.current)
            rot += rate === 1 ? 0.004 : 0.004 * rate
          }
          if (!activeRef.current) {
            frame = 0
            return
          }
          scene.rotation.y = rot
          renderer.render({ scene, camera })
          if (reducedRef.current) {
            frame = 0
            return
          }
          frame = window.requestAnimationFrame(tick)
        }
        startRef.current = () => {
          if (frame) return
          frame = window.requestAnimationFrame(tick)
        }
        if (activeRef.current) startRef.current()
        window.addEventListener("resize", resize)
        return () => {
          startRef.current = null
          window.cancelAnimationFrame(frame)
          window.removeEventListener("resize", resize)
        }
      } catch {
        if (!cancelled) setFallback(true)
      }
    }
    const cleanupPromise = run()
    return () => {
      cancelled = true
      void cleanupPromise.then((fn) => fn?.())
    }
  }, [items])

  if (fallback) {
    return (
      <div
        className={cn("relative h-56 overflow-hidden rounded-xl border", className)}
        onPointerDown={(event) => {
          drag.current = { active: true, last: event.clientX }
        }}
        onPointerUp={() => {
          drag.current.active = false
        }}
        onPointerMove={(event) => {
          if (!drag.current.active) return
          setAngle((value) => value + (event.clientX - drag.current.last) * 0.4)
          drag.current.last = event.clientX
        }}
      >
        <div className="absolute inset-0 [perspective:900px]">
          <div className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: `rotateY(${angle}deg)` }}>
            {items.map((item, index) => {
              const theta = (index / items.length) * 360
              return (
                <div
                  key={item.title}
                  className="absolute top-1/2 left-1/2 h-28 w-20 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cover"
                  style={{ backgroundImage: `url(${item.src})`, transform: `rotateY(${theta}deg) translateZ(140px)` }}
                />
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return <canvas ref={canvasRef} className={cn("h-56 w-full rounded-xl border bg-zinc-950", className)} />
}

export { CircularGallery }
