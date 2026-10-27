"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SingularityProps {
  className?: string
}

function Singularity({ className }: SingularityProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0, y: 0 })
  const [fallback, setFallback] = React.useState(false)
  const show = !fallback

  React.useEffect(() => {
    if (!show) return
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
      camera.position.z = 2
      const scene = new ogl.Transform()
      const uniforms = { u_time: { value: reduced ? 1.2 : 0 }, u_shift: { value: new Float32Array([0, 0]) } }
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
          uniform float u_time;
          uniform vec2 u_shift;
          varying vec2 vUv;
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          void main() {
            vec2 uv = (vUv - 0.5) * vec2(1.8, 1.15) - u_shift;
            float radius = length(uv);
            vec2 dir = uv / max(radius, 0.0001);
            vec2 lens = uv + dir * 0.12 / max(radius, 0.12);
            float stars = step(0.988, hash(floor(lens * 46.0)));
            float angle = atan(uv.y, uv.x) + u_time * 0.7;
            float ring = smoothstep(0.045, 0.0, abs(radius - 0.36));
            float spokes = 0.55 + 0.45 * sin(angle * 10.0);
            float disc = smoothstep(0.2, 0.08, radius);
            float glow = smoothstep(0.55, 0.2, radius);
            vec3 color = vec3(stars) * vec3(0.75, 0.86, 1.0);
            color += ring * spokes * vec3(1.0, 0.42, 0.12);
            color += glow * 0.08 * vec3(0.4, 0.55, 1.0);
            color *= 1.0 - disc;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms,
      })
      const mesh = new ogl.Mesh(gl, { geometry: new ogl.Plane(gl, { width: 3.2, height: 1.9 }), program })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      const draw = () => {
        uniforms.u_shift.value[0] = pointerRef.current.x
        uniforms.u_shift.value[1] = pointerRef.current.y
        renderer.render({ scene, camera })
      }
      if (reduced) {
        draw()
        return () => {
          resizeObserver.disconnect()
          gl.getExtension("WEBGL_lose_context")?.loseContext()
        }
      }
      const tick = () => {
        if (!running) return
        if (!visibleRef.current) {
          frame = 0
          return
        }
        uniforms.u_time.value += 0.016
        draw()
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
  }, [reduced, show])

  if (!show) {
    return <div data-slot="singularity" className={cn("h-80 rounded-xl border bg-slate-950", className)} />
  }

  return (
    <div
      ref={hostRef}
      data-slot="singularity"
      className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}
      onPointerMove={(event) => {
        if (reduced) return
        const rect = event.currentTarget.getBoundingClientRect()
        pointerRef.current = {
          x: ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.35,
          y: (0.5 - (event.clientY - rect.top) / Math.max(rect.height, 1)) * 0.22,
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label={reduced ? "黑洞静帧" : "黑洞，移动指针可以轻轻挪动它"} />
    </div>
  )
}

export { Singularity }
