"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GalaxySpiralProps {
  className?: string
  arms?: number
  radius?: number
  count?: number
  randomness?: number
  speed?: number
  colors?: readonly string[]
}

const VERT = `
attribute vec3 position;
attribute float aRadius;
uniform float u_time;
uniform float u_speed;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying float vRadius;
void main() {
  float spin = (1.35 - clamp(aRadius, 0.0, 1.2)) * u_time * u_speed;
  float c = cos(spin);
  float s = sin(spin);
  vec3 p = vec3(position.x * c - position.z * s, position.y, position.x * s + position.z * c);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(140.0 / max(0.4, -mv.z), 1.0, 12.0);
  vRadius = aRadius;
}
`

const FRAG = `
precision highp float;
uniform vec3 u_inner;
uniform vec3 u_outer;
varying float vRadius;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float glow = pow(1.0 - d, 1.4);
  vec3 color = mix(u_inner, u_outer, clamp(vRadius, 0.0, 1.0));
  gl_FragColor = vec4(color * glow, glow);
}
`

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let next = state
    next = Math.imul(next ^ (next >>> 15), next | 1)
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

function useSynced<T>(prop: T | undefined, fallback: T): [T, (next: T) => void] {
  const [draft, setDraft] = React.useState<{ prop: T | undefined; value: T } | null>(null)
  const value = draft && Object.is(draft.prop, prop) ? draft.value : (prop ?? fallback)
  return [value, (next) => setDraft({ prop, value: next })]
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

function fillGalaxy(positions: Float32Array, radii: Float32Array, arms: number, radius: number, randomness: number) {
  const rand = mulberry32(arms * 1000 + Math.round(radius * 100) + Math.round(randomness * 50))
  const count = radii.length
  for (let index = 0; index < count; index += 1) {
    const arm = index % arms
    const along = Math.pow(rand(), 0.85)
    const distance = 0.08 + along * radius
    const angle = (arm / arms) * Math.PI * 2 + distance * 4.2
    const scatter = randomness * distance * 0.45
    positions[index * 3] = Math.cos(angle) * distance + (rand() - 0.5) * scatter
    positions[index * 3 + 1] = (rand() - 0.5) * scatter * 0.28
    positions[index * 3 + 2] = Math.sin(angle) * distance + (rand() - 0.5) * scatter
    radii[index] = distance / Math.max(radius, 0.2)
  }
}

function GalaxyFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(circle at 50% 55%, #fde68a 0 5%, #312e81 16%, #020617 58%), repeating-conic-gradient(from 12deg, transparent 0 16deg, rgba(147,197,253,0.2) 16deg 18deg)",
      }}
    />
  )
}

function GalaxySpiral({
  className,
  arms: armsProp,
  radius: radiusProp,
  count: countProp,
  randomness: randomnessProp,
  speed: speedProp,
  colors: colorsProp,
}: GalaxySpiralProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(hostRef)
  const [arms, setArms] = useSynced(armsProp, 3)
  const [radius, setRadius] = useSynced(radiusProp, 1)
  const [count, setCount] = useSynced(countProp, 1800)
  const [randomness, setRandomness] = useSynced(randomnessProp, 0.45)
  const [speed, setSpeed] = useSynced(speedProp, 0.7)
  const [inner, setInner] = useSynced(colorsProp?.[0], "#f8e7b0")
  const [outer, setOuter] = useSynced(colorsProp?.[1], "#7dd3fc")
  const [fallback, setFallback] = React.useState(false)
  const live = React.useRef({ arms, radius, count, randomness, speed, inner, outer, tiltX: 0.35, tiltY: 0.2 })
  const drag = React.useRef<{ x: number; y: number; tiltX: number; tiltY: number } | null>(null)
  const showCanvas = !reduced && !fallback

  React.useEffect(() => {
    live.current = { ...live.current, arms, radius, count, randomness, speed, inner, outer }
  }, [arms, radius, count, randomness, speed, inner, outer])

  React.useEffect(() => {
    if (!showCanvas || !active) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let cancelled = false
    let frame = 0
    const run = async () => {
      const ogl = await import("ogl")
      if (cancelled) return undefined
      const renderer = new ogl.Renderer({ canvas, alpha: false, dpr: Math.min(window.devicePixelRatio || 1, 2) })
      const gl = renderer.gl
      if (!gl) {
        queueMicrotask(() => {
          if (!cancelled) setFallback(true)
        })
        return undefined
      }
      const camera = new ogl.Camera(gl, { fov: 42 })
      camera.position.set(0, 0.85, 2.7)
      camera.rotation.x = -0.28
      const scene = new ogl.Transform()
      const group = new ogl.Transform()
      group.setParent(scene)
      const positions = new Float32Array(live.current.count * 3)
      const radii = new Float32Array(live.current.count)
      fillGalaxy(positions, radii, live.current.arms, live.current.radius, live.current.randomness)
      const geometry = new ogl.Geometry(gl, {
        position: { size: 3, data: positions },
        aRadius: { size: 1, data: radii },
      })
      const uniforms = {
        u_time: { value: 0 },
        u_speed: { value: live.current.speed },
        u_inner: { value: hexToRgb(live.current.inner) },
        u_outer: { value: hexToRgb(live.current.outer) },
      }
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      })
      program.setBlendFunc(gl.SRC_ALPHA, gl.ONE)
      const mesh = new ogl.Mesh(gl, { geometry, program, mode: gl.POINTS, frustumCulled: false })
      mesh.setParent(group)
      let stamp = ""
      const resize = () => {
        const rect = host.getBoundingClientRect()
        renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1))
        camera.perspective({ aspect: Math.max(rect.width, 1) / Math.max(rect.height, 1) })
      }
      resize()
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const started = performance.now()
      const tick = () => {
        const spec = live.current
        const next = `${spec.count}|${spec.arms}|${spec.radius}|${spec.randomness}`
        if (next !== stamp && spec.count === radii.length) {
          stamp = next
          fillGalaxy(positions, radii, spec.arms, spec.radius, spec.randomness)
          const positionAttr = geometry.attributes.position
          const radiusAttr = geometry.attributes.aRadius
          if (positionAttr) positionAttr.needsUpdate = true
          if (radiusAttr) radiusAttr.needsUpdate = true
        }
        uniforms.u_time.value = (performance.now() - started) / 1000
        uniforms.u_speed.value = spec.speed
        uniforms.u_inner.value = hexToRgb(spec.inner)
        uniforms.u_outer.value = hexToRgb(spec.outer)
        group.rotation.x = spec.tiltX
        group.rotation.y = spec.tiltY
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
  }, [active, showCanvas, count])

  return (
    <div data-slot="galaxy-spiral" className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap gap-3 text-xs">
        <label className="flex items-center gap-2">旋臂<input aria-label="旋臂" type="range" min={2} max={6} step={1} value={arms} onChange={(event) => setArms(Number(event.target.value))} /></label>
        <label className="flex items-center gap-2">半径<input aria-label="半径" type="range" min={0.4} max={1.4} step={0.02} value={radius} onChange={(event) => setRadius(Number(event.target.value))} /></label>
        <label className="flex items-center gap-2">粒子<input aria-label="粒子数" type="range" min={600} max={3200} step={200} value={count} onChange={(event) => setCount(Number(event.target.value))} /></label>
        <label className="flex items-center gap-2">随机<input aria-label="随机度" type="range" min={0} max={1} step={0.01} value={randomness} onChange={(event) => setRandomness(Number(event.target.value))} /></label>
        <label className="flex items-center gap-2">速度<input aria-label="速度" type="range" min={0} max={2} step={0.01} value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /></label>
        <label className="flex items-center gap-2">内色<input aria-label="内色" type="color" value={inner} onChange={(event) => setInner(event.target.value)} /></label>
        <label className="flex items-center gap-2">外色<input aria-label="外色" type="color" value={outer} onChange={(event) => setOuter(event.target.value)} /></label>
      </div>
      <div
        ref={hostRef}
        role="img"
        aria-label="螺旋星系。拖动可倾斜，内圈转得更快。"
        className="relative h-80 touch-none overflow-hidden rounded-xl border bg-slate-950"
        onPointerDown={(event) => {
          drag.current = { x: event.clientX, y: event.clientY, tiltX: live.current.tiltX, tiltY: live.current.tiltY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          live.current.tiltY = drag.current.tiltY + (event.clientX - drag.current.x) * 0.005
          live.current.tiltX = drag.current.tiltX + (event.clientY - drag.current.y) * 0.005
        }}
        onPointerUp={() => {
          drag.current = null
        }}
      >
        {showCanvas ? <canvas ref={canvasRef} className="absolute inset-0 size-full" /> : <GalaxyFallback />}
      </div>
    </div>
  )
}

export { GalaxySpiral }
