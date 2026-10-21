"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface MouseFlowmapProps {
  className?: string
  image?: string
  intensity?: number
  speed?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const SAMPLE =
  "https://picsum.photos/id/1015/960/540"

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
uniform sampler2D tMap;
uniform sampler2D tFlow;
varying vec2 vUv;
void main() {
  vec4 flow = texture2D(tFlow, vUv);
  vec2 uv = vUv - flow.xy * 0.18;
  gl_FragColor = texture2D(tMap, uv);
}
`

function useReducedMotion() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

function MouseFlowmap({ className, image = SAMPLE, intensity, speed, scale }: MouseFlowmapProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const pointer = React.useRef({ x: 0.5, y: 0.5 })
  const active = useAnimationActive(hostRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const speedRef = React.useRef(pace(speed))
  const scaleRef = React.useRef(scale)
  const falloff = intensity === undefined ? 0.28 : intensity

  React.useEffect(() => {
    speedRef.current = pace(speed)
    scaleRef.current = scale
  }, [speed, scale])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let cancelled = false
    let frame = 0
    const last = { x: 0.5, y: 0.5 }

    const run = async () => {
      const ogl = await import("ogl")
      if (!canvas || cancelled) return
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.5) })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => setFallback(true))
        return
      }
      const camera = new ogl.Camera(gl, { fov: 35 })
      camera.position.z = 2
      const scene = new ogl.Transform()
      const flowmap = new ogl.Flowmap(gl, { falloff, dissipation: 0.96 })
      const texture = new ogl.Texture(gl)
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = image
      await img.decode().catch(() => undefined)
      if (cancelled) return
      texture.image = img
      const geometry = new ogl.Plane(gl, { width: 2, height: 1.15 })
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          tMap: { value: texture },
          tFlow: flowmap.uniform,
        },
      })
      const mesh = new ogl.Mesh(gl, { geometry, program })
      mesh.setParent(scene)

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect()
        renderer.setSize(width, height)
        camera.perspective({ aspect: width / Math.max(height, 1) })
        flowmap.aspect = width / Math.max(height, 1)
      }
      resize()

      const tick = () => {
        if (!activeRef.current) {
          frame = 0
          return
        }
        const dx = pointer.current.x - last.x
        const dy = pointer.current.y - last.y
        last.x = pointer.current.x
        last.y = pointer.current.y
        const rate = speedRef.current
        const follow = 0.35 * (scaleRef.current === undefined || scaleRef.current === 1 ? 1 : scaleRef.current)
        flowmap.mouse.set(pointer.current.x, 1 - pointer.current.y)
        flowmap.velocity.lerp(new ogl.Vec2(dx * 12 * rate, dy * 12 * rate), follow)
        flowmap.update()
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      kickRef.current = () => {
        if (activeRef.current && frame === 0) frame = window.requestAnimationFrame(tick)
      }
      kickRef.current()
      window.addEventListener("resize", resize)
      return () => {
        kickRef.current = null
        window.cancelAnimationFrame(frame)
        window.removeEventListener("resize", resize)
      }
    }

    const cleanup = run().catch(() => {
      if (!cancelled) queueMicrotask(() => setFallback(true))
    })
    return () => {
      cancelled = true
      kickRef.current = null
      void cleanup.then((fn) => fn?.())
    }
  }, [image, reduced, falloff])

  return (
    <div
      ref={hostRef}
      data-slot="mouse-flowmap"
      className={cn("relative min-h-52 overflow-hidden rounded-xl border bg-zinc-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current.x = (event.clientX - rect.left) / rect.width
        pointer.current.y = (event.clientY - rect.top) / rect.height
        event.currentTarget.style.setProperty("--sx", `${pointer.current.x * 100}%`)
        event.currentTarget.style.setProperty("--sy", `${pointer.current.y * 100}%`)
      }}
    >
      {fallback || reduced ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `radial-gradient(circle at var(--sx,50%) var(--sy,50%), transparent 8%, #0008 42%), url(${image})`,
          }}
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
    </div>
  )
}

export { MouseFlowmap }
