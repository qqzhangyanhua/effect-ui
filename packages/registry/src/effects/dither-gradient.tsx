"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DitherGradientProps {
  className?: string
  colors?: string[]
  speed?: number
  count?: number
  intensity?: number
}

const DITHER_COLORS = ["#1a0d47", "#f57338", "#33bfd1"]

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_count;
uniform float u_intensity;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;
float bayer(vec2 pixel) {
  int x = int(mod(pixel.x, 4.0));
  int y = int(mod(pixel.y, 4.0));
  int index = y * 4 + x;
  float value = 0.0;
  if (index == 0) value = 0.0;
  else if (index == 1) value = 8.0;
  else if (index == 2) value = 2.0;
  else if (index == 3) value = 10.0;
  else if (index == 4) value = 12.0;
  else if (index == 5) value = 4.0;
  else if (index == 6) value = 14.0;
  else if (index == 7) value = 6.0;
  else if (index == 8) value = 3.0;
  else if (index == 9) value = 11.0;
  else if (index == 10) value = 1.0;
  else if (index == 11) value = 9.0;
  else if (index == 12) value = 15.0;
  else if (index == 13) value = 7.0;
  else if (index == 14) value = 13.0;
  else value = 5.0;
  return value / 16.0;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float shift = u_time * 0.15 * u_speed;
  float t = uv.x * 0.75 + uv.y * 0.35 + sin(uv.y * 6.0 + shift) * 0.08;
  vec3 color = mix(u_a, u_b, clamp(t, 0.0, 1.0));
  color = mix(color, u_c, clamp(uv.y - 0.45 + sin(shift), 0.0, 1.0) * 0.55);
  float levels = u_count;
  float threshold = (bayer(gl_FragCoord.xy) - 0.5) * u_intensity;
  color = floor(color * levels + threshold + 0.5) / levels;
  gl_FragColor = vec4(color, 1.0);
}
`

function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const raw = hex.trim().replace(/^#/, "")
  const digits = raw.length === 3 ? [...raw].map((char) => `${char}${char}`).join("") : raw
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) return fallback
  const value = Number.parseInt(digits, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function DitherGradient({
  className,
  colors = DITHER_COLORS,
  speed = 1,
  count = 5,
  intensity = 1,
}: DitherGradientProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)
  const [fallback, setFallback] = React.useState(false)
  const live = React.useRef({ colors, speed: playbackRate(speed), count, intensity })

  React.useEffect(() => {
    live.current = { colors, speed: playbackRate(speed), count, intensity }
  }, [colors, speed, count, intensity])
  const stillKey = reduced ? `${colors.join("|")}|${count}|${intensity}|${speed}` : ""

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const gl = canvas.getContext("webgl")
    if (!gl) {
      setFallback(true)
      return
    }
    const vert = compile(gl, gl.VERTEX_SHADER, VERT)
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vert || !frag) {
      setFallback(true)
      return
    }
    const program = gl.createProgram()
    if (!program) {
      setFallback(true)
      return
    }
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true)
      return
    }
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const resolution = gl.getUniformLocation(program, "u_res")
    const time = gl.getUniformLocation(program, "u_time")
    const speedLoc = gl.getUniformLocation(program, "u_speed")
    const countLoc = gl.getUniformLocation(program, "u_count")
    const intensityLoc = gl.getUniformLocation(program, "u_intensity")
    const colorA = gl.getUniformLocation(program, "u_a")
    const colorB = gl.getUniformLocation(program, "u_b")
    const colorC = gl.getUniformLocation(program, "u_c")
    let frame = 0
    const started = performance.now()
    const draw = (now: number) => {
      const spec = live.current
      const a = hexToRgb(spec.colors[0] ?? "", [0.1, 0.05, 0.28])
      const b = hexToRgb(spec.colors[1] ?? "", [0.96, 0.45, 0.22])
      const c = hexToRgb(spec.colors[2] ?? "", [0.2, 0.75, 0.82])
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(rect.width * dpr))
      const height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.useProgram(program)
      gl.uniform2f(resolution, width, height)
      gl.uniform1f(time, reduced ? 0 : (now - started) / 1000)
      gl.uniform1f(speedLoc, spec.speed)
      gl.uniform1f(countLoc, spec.count)
      gl.uniform1f(intensityLoc, spec.intensity)
      gl.uniform3f(colorA, a[0], a[1], a[2])
      gl.uniform3f(colorB, b[0], b[1], b[2])
      gl.uniform3f(colorC, c[0], c[1], c[2])
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduced) frame = window.requestAnimationFrame(draw)
    }
    frame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(frame)
  }, [active, reduced, stillKey])

  if (fallback) {
    return (
      <div
        className={cn("h-64 rounded-2xl border", className)}
        style={{
          backgroundImage:
            "linear-gradient(120deg, #2e1065, #ea580c 55%, #22d3ee), radial-gradient(circle, #09090b 1px, transparent 1.4px)",
          backgroundSize: "auto, 4px 4px",
        }}
      />
    )
  }

  return <canvas ref={canvasRef} className={cn("h-64 w-full rounded-2xl border bg-zinc-950", className)} />
}

export { DitherGradient }
