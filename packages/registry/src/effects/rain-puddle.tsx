"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RainPuddleProps {
  className?: string
}

function RainPuddle({ className }: RainPuddleProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const clickRef = React.useRef({ x: 0.5, y: 0.55, time: -10 })
  const timeRef = React.useRef(0)
  const [fallback, setFallback] = React.useState(false)

  React.useEffect(() => {
    if (fallback) return
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
      gl.clearColor(0.02, 0.05, 0.1, 1)
      const camera = new ogl.Camera(gl, { fov: 35 })
      camera.position.z = 2
      const scene = new ogl.Transform()
      const uniforms = {
        u_time: { value: reduced ? 1.4 : 0 },
        u_click: { value: new Float32Array([0.5, 0.55, -10]) },
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
          uniform float u_time;
          uniform vec3 u_click;
          varying vec2 vUv;
          float hash(float n) { return fract(sin(n) * 43758.5453); }
          void main() {
            vec2 uv = vUv;
            float warp = 0.0;
            for (int i = 0; i < 6; i++) {
              float id = float(i);
              float cycle = mod(u_time * 0.65 + id * 0.73, 3.4);
              vec2 center = vec2(hash(id + 2.0), hash(id + 8.0));
              float radius = cycle * 0.16;
              float ring = exp(-abs(length(uv - center) - radius) * 48.0) * exp(-cycle * 0.85);
              warp += ring;
            }
            float age = max(u_time - u_click.z, 0.0);
            float big = exp(-abs(length(uv - u_click.xy) - age * 0.18) * 36.0) * exp(-age * 0.55);
            warp += big * 1.8;
            vec2 dir = uv - u_click.xy;
            vec2 shifted = uv + normalize(dir + 0.001) * warp * 0.045;
            vec3 sky = mix(vec3(0.05, 0.1, 0.18), vec3(0.35, 0.55, 0.72), shifted.y);
            float shore = smoothstep(0.42, 0.58, shifted.y + sin(shifted.x * 8.0) * 0.03);
            vec3 ground = mix(vec3(0.1, 0.16, 0.14), vec3(0.45, 0.38, 0.28), shore);
            vec3 color = mix(sky, ground, step(0.5, shifted.y));
            color += warp * vec3(0.55, 0.75, 0.9);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms,
      })
      const mesh = new ogl.Mesh(gl, { geometry: new ogl.Plane(gl, { width: 2, height: 2 }), program })
      mesh.setParent(scene)
      const resize = () => {
        const rect = host.getBoundingClientRect()
        const aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1)
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect })
        const viewHeight = 2 * Math.tan((35 * Math.PI) / 360) * camera.position.z
        mesh.scale.set((viewHeight * aspect) / 2, viewHeight / 2, 1)
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      const draw = () => {
        uniforms.u_click.value[0] = clickRef.current.x
        uniforms.u_click.value[1] = clickRef.current.y
        uniforms.u_click.value[2] = clickRef.current.time
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
        timeRef.current = uniforms.u_time.value
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
  }, [fallback, reduced])

  return (
    <div
      ref={hostRef}
      data-slot="rain-puddle"
      className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        clickRef.current = {
          x: (event.clientX - rect.left) / Math.max(rect.width, 1),
          y: 1 - (event.clientY - rect.top) / Math.max(rect.height, 1),
          time: timeRef.current,
        }
      }}
    >
      {fallback ? <div className="absolute inset-0 bg-linear-to-b from-slate-700 to-slate-900" /> : <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label={reduced ? "雨后水面静帧" : "雨滴在水面荡开涟漪，点击制造大涟漪"} />}
    </div>
  )
}

export { RainPuddle }
