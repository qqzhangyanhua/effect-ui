"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TubesCursorProps {
  tubes?: number
  className?: string
  speed?: number
  intensity?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const PALETTES = [
  { name: "极光", colors: ["#5eead4", "#38bdf8", "#818cf8", "#e879f9"] },
  { name: "晚霞", colors: ["#fb7185", "#fb923c", "#facc15", "#f472b6"] },
  { name: "深海", colors: ["#22d3ee", "#2563eb", "#67e8f9", "#a5b4fc"] },
] as const

const MAX_POINTS = 36

function hexToRgb(hex: string) {
  const value = hex.replace("#", "")
  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ]
}

function TubesCursor({ tubes = 4, className, speed, intensity, scale }: TubesCursorProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pointerRef = React.useRef({ x: 0.5, y: 0.55 })
  const paletteRef = React.useRef(0)
  const active = useAnimationActive(hostRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const speedRef = React.useRef(pace(speed))
  const intensityRef = React.useRef(intensity)
  const scaleRef = React.useRef(scale)
  const count = Math.min(5, Math.max(3, Math.round(tubes)))
  const [palette, setPalette] = React.useState(0)
  const [fallback, setFallback] = React.useState(false)
  const show = !reduced && !fallback

  React.useEffect(() => {
    paletteRef.current = palette
  }, [palette])

  React.useEffect(() => {
    speedRef.current = pace(speed)
    intensityRef.current = intensity
    scaleRef.current = scale
  }, [speed, intensity, scale])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  React.useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let cancelled = false
    let frame = 0
    let running = true

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
      gl.clearColor(0.02, 0.03, 0.08, 1)
      const camera = new ogl.Camera(gl, { fov: 38, near: 0.1, far: 20 })
      camera.position.set(0.1, 0.55, 3.4)
      camera.lookAt(new ogl.Vec3(0, 0, 0))
      const scene = new ogl.Transform()
      const index = new Uint16Array((MAX_POINTS - 1) * 6)
      for (let segment = 0; segment < MAX_POINTS - 1; segment += 1) {
        const vertex = segment * 2
        const offset = segment * 6
        index[offset] = vertex
        index[offset + 1] = vertex + 1
        index[offset + 2] = vertex + 2
        index[offset + 3] = vertex + 1
        index[offset + 4] = vertex + 3
        index[offset + 5] = vertex + 2
      }
      const heads = Array.from({ length: count }, (_, tube) => ({ x: 0.72, y: 0.46 + tube * 0.02 }))
      const trails = Array.from({ length: count }, (_, tube) => (
        Array.from({ length: 24 }, (__, point) => ({
          x: 0.78 - point * 0.026,
          y: 0.42 + tube * 0.035 + Math.sin(point * 0.42 + tube) * 0.07,
        }))
      ))
      const ribbons = heads.map((_, tube) => {
        const color = new Float32Array(hexToRgb(PALETTES[0].colors[tube % 4] ?? "#ffffff"))
        const tip = new Float32Array(hexToRgb(PALETTES[0].colors[(tube + 1) % 4] ?? "#ffffff"))
        const uniforms = { u_color: { value: color }, u_tip: { value: tip } }
        const geometry = new ogl.Geometry(gl, {
          position: { size: 3, data: new Float32Array(MAX_POINTS * 2 * 3) },
          along: { size: 1, data: new Float32Array(MAX_POINTS * 2) },
          side: { size: 1, data: new Float32Array(MAX_POINTS * 2) },
          index: { data: index },
        })
        geometry.drawRange.count = 0
        const program = new ogl.Program(gl, {
          transparent: true,
          depthWrite: false,
          cullFace: false,
          vertex: `
            attribute vec3 position;
            attribute float along;
            attribute float side;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            varying float vAlong;
            varying float vSide;
            void main() {
              vAlong = along;
              vSide = side;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragment: `
            precision highp float;
            uniform vec3 u_color;
            uniform vec3 u_tip;
            varying float vAlong;
            varying float vSide;
            void main() {
              float core = smoothstep(1.0, 0.15, abs(vSide));
              float fade = smoothstep(0.0, 0.18, vAlong);
              vec3 color = mix(u_color, u_tip, vAlong);
              gl_FragColor = vec4(color * (0.65 + core * 0.9), core * fade);
            }
          `,
          uniforms,
        })
        const mesh = new ogl.Mesh(gl, { geometry, program, frustumCulled: false })
        mesh.setParent(scene)
        return { geometry, uniforms, mesh }
      })

      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      let time = 0

      const tick = () => {
        if (!running) return
        if (!activeRef.current) {
          frame = 0
          return
        }
        time += 0.016
        const rate = speedRef.current
        const thick = intensityRef.current === undefined || intensityRef.current === 1 ? 1 : intensityRef.current
        const depth = scaleRef.current === undefined || scaleRef.current === 1 ? 1 : scaleRef.current
        const paletteIndex = paletteRef.current % PALETTES.length
        const colors = PALETTES[paletteIndex]?.colors ?? PALETTES[0].colors
        const pointer = pointerRef.current
        ribbons.forEach((ribbon, tube) => {
          const head = heads[tube]
          if (!head) return
          const follow = (0.22 - tube * 0.035) * rate
          head.x += (pointer.x - head.x) * follow
          head.y += (pointer.y + (tube - (count - 1) / 2) * 0.08 - head.y) * follow
          const trail = trails[tube]
          if (!trail) return
          const last = trail[0]
          if (!last || Math.hypot(last.x - head.x, last.y - head.y) > 0.008) {
            trail.unshift({ x: head.x, y: head.y })
            if (trail.length > MAX_POINTS) trail.pop()
          }
          const position = ribbon.geometry.attributes.position
          const along = ribbon.geometry.attributes.along
          const side = ribbon.geometry.attributes.side
          if (!position || !along || !side) return
          const pos = position.data as Float32Array
          const alongData = along.data as Float32Array
          const sideData = side.data as Float32Array
          const total = Math.max(trail.length, 1)
          for (let point = 0; point < MAX_POINTS; point += 1) {
            const sample = trail[Math.min(point, trail.length - 1)] ?? head
            const prev = trail[Math.min(point + 1, trail.length - 1)] ?? sample
            const next = trail[Math.max(point - 1, 0)] ?? sample
            const dx = next.x - prev.x
            const dy = next.y - prev.y
            const length = Math.hypot(dx, dy) || 1
            const thickness = (0.14 + tube * 0.02) * thick
            const nx = (-dy / length) * thickness
            const ny = (dx / length) * thickness
            const x = (sample.x - 0.5) * 6.4
            const y = (0.5 - sample.y) * 2.6 + Math.sin(point * 0.28 + tube) * 0.16
            const z = Math.sin(point * 0.22 + time * 0.6 + tube) * 0.55 * depth
            const slot = point * 6
            pos[slot] = x + nx
            pos[slot + 1] = y + ny
            pos[slot + 2] = z
            pos[slot + 3] = x - nx
            pos[slot + 4] = y - ny
            pos[slot + 5] = z
            const progress = 1 - point / total
            alongData[point * 2] = progress
            alongData[point * 2 + 1] = progress
            sideData[point * 2] = -1
            sideData[point * 2 + 1] = 1
          }
          position.needsUpdate = true
          along.needsUpdate = true
          side.needsUpdate = true
          ribbon.geometry.drawRange.count = Math.max(0, trail.length - 1) * 6
          const rgb = hexToRgb(colors[tube % colors.length] ?? "#ffffff")
          const tip = hexToRgb(colors[(tube + 1) % colors.length] ?? "#ffffff")
          ribbon.uniforms.u_color.value[0] = rgb[0] ?? 1
          ribbon.uniforms.u_color.value[1] = rgb[1] ?? 1
          ribbon.uniforms.u_color.value[2] = rgb[2] ?? 1
          ribbon.uniforms.u_tip.value[0] = tip[0] ?? 1
          ribbon.uniforms.u_tip.value[1] = tip[1] ?? 1
          ribbon.uniforms.u_tip.value[2] = tip[2] ?? 1
        })
        renderer.render({ scene, camera })
        frame = window.requestAnimationFrame(tick)
      }

      kickRef.current = () => {
        if (activeRef.current && running && frame === 0) frame = window.requestAnimationFrame(tick)
      }
      kickRef.current()
      return () => {
        kickRef.current = null
        window.cancelAnimationFrame(frame)
        resizeObserver.disconnect()
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
      kickRef.current = null
      window.cancelAnimationFrame(frame)
      void job.then((cleanup) => cleanup?.())
    }
  }, [count, show])

  if (!show) {
    return <div data-slot="tubes-cursor" className={cn("sr-only", className)}>减弱动效时不渲染光管。</div>
  }

  const current = PALETTES[palette % PALETTES.length] ?? PALETTES[0]
  return (
    <div
      ref={hostRef}
      data-slot="tubes-cursor"
      className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointerRef.current = {
          x: (event.clientX - rect.left) / Math.max(rect.width, 1),
          y: (event.clientY - rect.top) / Math.max(rect.height, 1),
        }
      }}
      onClick={() => setPalette((value) => (value + 1) % PALETTES.length)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label="拖动光标拉出发光管道，点击切换配色" />
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-white/70">拖动拉出光管。点击切换配色，当前 {current.name}。</p>
    </div>
  )
}

export { TubesCursor }
