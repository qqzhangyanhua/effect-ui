"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface MouseFlowmapProps {
  className?: string
  image?: string
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

function MouseFlowmap({ className, image = SAMPLE }: MouseFlowmapProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const pointer = React.useRef({ x: 0.5, y: 0.5 })

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
      const flowmap = new ogl.Flowmap(gl, { falloff: 0.28, dissipation: 0.96 })
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
        const dx = pointer.current.x - last.x
        const dy = pointer.current.y - last.y
        last.x = pointer.current.x
        last.y = pointer.current.y
        flowmap.mouse.set(pointer.current.x, 1 - pointer.current.y)
        flowmap.velocity.lerp(new ogl.Vec2(dx * 12, dy * 12), 0.35)
        flowmap.update()
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)
      window.addEventListener("resize", resize)
      return () => {
        window.cancelAnimationFrame(frame)
        window.removeEventListener("resize", resize)
      }
    }

    const cleanup = run().catch(() => {
      if (!cancelled) queueMicrotask(() => setFallback(true))
    })
    return () => {
      cancelled = true
      void cleanup.then((fn) => fn?.())
    }
  }, [image, reduced])

  return (
    <div
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
