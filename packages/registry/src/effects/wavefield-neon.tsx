"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WavefieldNeonProps {
  color?: string
  density?: number
  amplitude?: number
  className?: string
}

function hexToRgb(hex: string) {
  const value = hex.replace("#", "")
  const safe = value.length === 6 ? value : "22d3ee"
  return [
    Number.parseInt(safe.slice(0, 2), 16) / 255,
    Number.parseInt(safe.slice(2, 4), 16) / 255,
    Number.parseInt(safe.slice(4, 6), 16) / 255,
  ]
}

function WavefieldNeon({ color = "#22d3ee", density = 18, amplitude = 0.28, className }: WavefieldNeonProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0, z: 0, active: false })
  const colorRef = React.useRef(color)
  const amplitudeRef = React.useRef(amplitude)
  const lines = Math.min(28, Math.max(8, Math.round(density)))
  const [fallback, setFallback] = React.useState(false)

  React.useEffect(() => {
    colorRef.current = color
    amplitudeRef.current = amplitude
  }, [amplitude, color])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host || fallback) return
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
      gl.clearColor(0.01, 0.02, 0.06, 1)
      const camera = new ogl.Camera(gl, { fov: 45, near: 0.1, far: 30 })
      camera.position.set(0.2, 1.7, 2.6)
      camera.lookAt(new ogl.Vec3(0, 0, 0))
      const scene = new ogl.Transform()
      const segments = 48
      const rgb = new Float32Array(hexToRgb(colorRef.current))
      const uniforms = { u_color: { value: rgb } }
      const program = new ogl.Program(gl, {
        vertex: `
          attribute vec3 position;
          attribute float height;
          uniform mat4 modelViewMatrix;
          uniform mat4 projectionMatrix;
          varying float vHeight;
          void main() {
            vHeight = height;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragment: `
          precision highp float;
          uniform vec3 u_color;
          varying float vHeight;
          void main() {
            float glow = 0.45 + abs(vHeight) * 1.6;
            gl_FragColor = vec4(u_color * glow, 1.0);
          }
        `,
        uniforms,
        depthTest: true,
      })
      const strips = Array.from({ length: lines }, () => {
        const geometry = new ogl.Geometry(gl, {
          position: { size: 3, data: new Float32Array((segments + 1) * 3) },
          height: { size: 1, data: new Float32Array(segments + 1) },
        })
        const mesh = new ogl.Mesh(gl, { geometry, program, mode: gl.LINE_STRIP, frustumCulled: false })
        mesh.setParent(scene)
        return geometry
      })
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
        camera.lookAt(new ogl.Vec3(0, 0, 0))
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      let time = reduced ? 0.8 : 0
      const draw = () => {
        const rgbNow = hexToRgb(colorRef.current)
        uniforms.u_color.value[0] = rgbNow[0] ?? 0
        uniforms.u_color.value[1] = rgbNow[1] ?? 1
        uniforms.u_color.value[2] = rgbNow[2] ?? 1
        const amp = amplitudeRef.current
        const pointer = pointerRef.current
        strips.forEach((geometry, row) => {
          const position = geometry.attributes.position
          const height = geometry.attributes.height
          if (!position || !height) return
          const pos = position.data as Float32Array
          const heights = height.data as Float32Array
          const v = lines === 1 ? 0.5 : row / (lines - 1)
          const z = (v - 0.5) * 3.2
          for (let column = 0; column <= segments; column += 1) {
            const u = column / segments
            const x = (u - 0.5) * 4.2
            const dx = x - pointer.x
            const dz = z - pointer.z
            const dist = Math.hypot(dx, dz)
            const ripple = pointer.active ? Math.sin(dist * 7.0 - time * 3.2) * Math.exp(-dist * 1.5) * amp : 0
            const wave = Math.sin(x * 1.8 + time + z * 0.6) * Math.cos(z * 1.4 - time * 0.8) * amp
            const y = reduced ? wave * 0.35 : wave + ripple
            const slot = column * 3
            pos[slot] = x
            pos[slot + 1] = y
            pos[slot + 2] = z
            heights[column] = y
          }
          position.needsUpdate = true
          height.needsUpdate = true
        })
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
        time += 0.016
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
  }, [fallback, lines, reduced])

  return (
    <div
      ref={hostRef}
      data-slot="wavefield-neon"
      className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointerRef.current = {
          x: ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 4.2,
          z: ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 3.2,
          active: true,
        }
      }}
      onPointerLeave={() => {
        pointerRef.current = { ...pointerRef.current, active: false }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label={reduced ? "霓虹波场静帧" : "霓虹波场，指针处会荡开涟漪"} />
    </div>
  )
}

export { WavefieldNeon }
