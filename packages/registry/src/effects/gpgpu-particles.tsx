"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GpgpuParticlesProps {
  className?: string
  count?: number
  text?: string
}

const SIM = `
precision highp float;
uniform sampler2D tMap;
uniform vec2 uMouse;
uniform float uTime;
uniform float uForm;
varying vec2 vUv;

void main() {
  vec4 data = texture2D(tMap, vUv);
  vec2 pos = data.xy;
  vec2 target = data.zw;
  vec2 toMouse = pos - uMouse;
  float dist = length(toMouse) + 0.0001;
  vec2 tangent = vec2(-toMouse.y, toMouse.x) / dist;
  pos += tangent * 0.012 / dist;
  pos += (target - pos) * 0.045 * uForm;
  pos += vec2(sin(uTime + pos.y * 8.0), cos(uTime + pos.x * 8.0)) * 0.0012;
  pos = clamp(pos, vec2(-1.15), vec2(1.15));
  gl_FragColor = vec4(pos, target);
}
`

const VERT = `
attribute vec2 uv;
attribute vec2 position;
uniform sampler2D tMap;
uniform float uSize;
varying float vAlpha;
void main() {
  vec4 data = texture2D(tMap, uv);
  vAlpha = 0.75;
  gl_Position = vec4(data.xy, 0.0, 1.0);
  gl_PointSize = uSize;
}
`

const FRAG = `
precision highp float;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = 1.0 - clamp(dot(p, p), 0.0, 1.0);
  gl_FragColor = vec4(0.55, 0.82, 1.0, d * vAlpha);
}
`

function textTargets(text: string, count: number) {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext("2d")
  if (!ctx) return []
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, 256, 128)
  ctx.fillStyle = "#fff"
  ctx.font = "bold 52px ui-sans-serif"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, 128, 64)
  const pixels = ctx.getImageData(0, 0, 256, 128).data
  const hits: [number, number][] = []
  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 256; x += 2) {
      if ((pixels[(y * 256 + x) * 4 + 3] ?? 0) > 80) {
        hits.push([(x / 256) * 2 - 1, 1 - (y / 128) * 2])
      }
    }
  }
  return Array.from({ length: count }, (_, index) => hits[index % Math.max(hits.length, 1)] ?? [0, 0])
}

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

function GpgpuParticles({ className, count = 1400, text = "effect-ui" }: GpgpuParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const mouse = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return

    let cancelled = false
    let frame = 0

    const run = async () => {
      const ogl = await import("ogl")
      if (!canvas || cancelled) return
      const renderer = new ogl.Renderer({ canvas, alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.25) })
      const gl = renderer.gl
      const targets = textTargets(text, count)
      const data = new Float32Array(count * 4)
      for (let i = 0; i < count; i += 1) {
        data[i * 4] = Math.random() * 2 - 1
        data[i * 4 + 1] = Math.random() * 2 - 1
        data[i * 4 + 2] = targets[i]?.[0] ?? 0
        data[i * 4 + 3] = targets[i]?.[1] ?? 0
      }
      const gpgpu = new ogl.GPGPU(gl, { data })
      gpgpu.addPass({
        fragment: SIM,
        uniforms: {
          uMouse: { value: new ogl.Vec2() },
          uTime: { value: 0 },
          uForm: { value: 0 },
        },
      })
      const geometry = new ogl.Geometry(gl, {
        position: { size: 2, data: new Float32Array(count * 2) },
        uv: { size: 2, data: gpgpu.coords },
      })
      const program = new ogl.Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: { tMap: gpgpu.uniform, uSize: { value: 2.4 } },
        transparent: true,
        depthTest: false,
      })
      const particles = new ogl.Mesh(gl, { geometry, program, mode: gl.POINTS })

      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect()
        renderer.setSize(width, height)
      }
      resize()

      let time = 0
      const tick = () => {
        time += 0.016
        const pass = gpgpu.passes[0]
        if (pass) {
          pass.uniforms.uTime.value = time
          pass.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y)
          pass.uniforms.uForm.value = 0.15 + 0.85 * (0.5 + 0.5 * Math.sin(time * 0.35))
        }
        gpgpu.render()
        renderer.render({ scene: particles })
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
  }, [count, reduced, text])

  return (
    <div
      className={cn("relative min-h-56 overflow-hidden rounded-xl border bg-zinc-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      }}
    >
      {fallback || reduced ? (
        <div className="grid h-full min-h-56 place-items-center font-mono text-2xl tracking-[0.4em] text-cyan-200">
          {text}
        </div>
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
    </div>
  )
}

export { GpgpuParticles }
