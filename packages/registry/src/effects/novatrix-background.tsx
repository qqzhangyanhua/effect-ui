"use client"

// Ported from Eldora UI (MIT) — https://github.com/karthikmudunuri/eldoraui/blob/main/apps/www/registry/eldoraui/novatrix-background.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { Color, Mesh, Program, Renderer, Triangle } from "ogl"
import { useEffect, useRef, useState } from "react"

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`

export interface NovatrixBackgroundProps {
  /** How far the cursor pushes the wave. */
  amplitude?: number
  className?: string
  /** RGB multipliers, each channel from 0 to 1. */
  color?: [number, number, number]
  /** Disturb the wave with the pointer. */
  mouseReact?: boolean
  /** Time multiplier for the flow. */
  speed?: number
}

interface NovatrixController {
  destroy: () => void
  render: () => void
  setRunning: (running: boolean) => void
}

const createNovatrix = (
  container: HTMLDivElement,
  color: [number, number, number],
  speed: number,
  amplitude: number,
  mouseReact: boolean,
): NovatrixController | null => {
  const support = document.createElement("canvas").getContext("webgl")
  if (!support) return null

  let renderer: Renderer
  try {
    renderer = new Renderer({
      alpha: false,
      antialias: false,
      depth: false,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    })
  } catch {
    return null
  }
  const gl = renderer.gl
  if (!gl) return null
  gl.clearColor(1, 1, 1, 1)

  const canvas = gl.canvas as HTMLCanvasElement
  canvas.className = "block h-full w-full"
  canvas.setAttribute("aria-hidden", "true")
  const mouse = new Float32Array([0.5, 0.5])
  const red = color[0] ?? 1
  const green = color[1] ?? 1
  const blue = color[2] ?? 1

  const geometry = new Triangle(gl)
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new Color(red, green, blue) },
      uResolution: { value: new Color(1, 1, 1) },
      uMouse: { value: mouse },
      uAmplitude: { value: amplitude },
      uSpeed: { value: speed },
    },
  })
  if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) return null

  const mesh = new Mesh(gl, { geometry, program, frustumCulled: false })
  container.appendChild(canvas)

  const resize = () => {
    const width = Math.max(container.offsetWidth, 1)
    const height = Math.max(container.offsetHeight, 1)
    renderer.setSize(width, height)
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    program.uniforms.uResolution.value = new Color(
      canvas.width,
      canvas.height,
      canvas.width / Math.max(canvas.height, 1),
    )
  }
  resize()

  let frame = 0
  let running = false
  let destroyed = false

  const draw = (time: number) => {
    if (destroyed) return
    program.uniforms.uTime.value = time * 0.001
    renderer.render({ scene: mesh, frustumCull: false })
  }

  const tick = (time: number) => {
    if (destroyed || !running) return
    draw(time)
    frame = requestAnimationFrame(tick)
  }

  const onMouse = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect()
    mouse[0] = rect.width === 0 ? 0.5 : (event.clientX - rect.left) / rect.width
    mouse[1] = rect.height === 0 ? 0.5 : 1 - (event.clientY - rect.top) / rect.height
  }

  if (mouseReact) container.addEventListener("mousemove", onMouse)
  window.addEventListener("resize", resize)

  return {
    destroy: () => {
      destroyed = true
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      container.removeEventListener("mousemove", onMouse)
      if (canvas.parentElement === container) container.removeChild(canvas)
    },
    render: () => {
      resize()
      draw(performance.now())
    },
    setRunning: (next: boolean) => {
      if (destroyed || running === next) return
      running = next
      if (next) frame = requestAnimationFrame(tick)
      else cancelAnimationFrame(frame)
    },
  }
}

export function NovatrixBackground({
  amplitude = 0.1,
  className,
  color = [1, 1, 1],
  mouseReact = false,
  speed = 1,
}: NovatrixBackgroundProps) {
  const shouldReduceMotion = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const motionOn = useAnimationActive(hostRef)
  const controllerRef = useRef<NovatrixController | null>(null)
  const runRef = useRef(false)
  const [supported, setSupported] = useState(true)
  const colorKey = color.join(",")

  useEffect(() => {
    runRef.current = motionOn && !shouldReduceMotion
    const controller = controllerRef.current
    if (!controller) return
    controller.setRunning(runRef.current)
    if (!runRef.current) controller.render()
  }, [motionOn, shouldReduceMotion])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const [red = 1, green = 1, blue = 1] = colorKey.split(",").map(Number)
    const controller = createNovatrix(host, [red, green, blue], speed, amplitude, mouseReact)
    controllerRef.current = controller
    controller?.setRunning(runRef.current)
    if (controller && !runRef.current) controller.render()
    queueMicrotask(() => setSupported(controller !== null))
    return () => {
      controller?.destroy()
      controllerRef.current = null
    }
  }, [amplitude, colorKey, mouseReact, speed])

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden bg-slate-950", className)}
      data-reduced={shouldReduceMotion ? "true" : "false"}
      data-slot="novatrix-background"
      ref={hostRef}
    >
      {supported ? null : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,#c4b5fd,transparent_55%),radial-gradient(circle_at_70%_60%,#67e8f9,transparent_50%)]" />
      )}
    </div>
  )
}
