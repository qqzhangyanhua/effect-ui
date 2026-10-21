"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface LightningProps {
  className?: string
  hue?: number
  speed?: number
  intensity?: number
  count?: number
}

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_hue;
uniform float u_intensity;
uniform float u_count;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i); float b = hash(i+vec2(1,0));
  float c = hash(i+vec2(0,1)); float d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / max(u_res.y, 1.0);
  float bolt = 1.0;
  float x = p.x;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_count) break;
    float fi = float(i);
    x += (noise(vec2(p.y * (8.0 + fi * 5.0), u_time * 1.8 + fi)) - 0.5) * (0.18 + fi * 0.05);
  }
  float d = abs(x);
  float core = smoothstep(0.045, 0.0, d);
  float glow = smoothstep(0.28, 0.0, d);
  float branch = smoothstep(0.03, 0.0, abs(p.x + 0.35 * sin(p.y * 6.0 + u_time) - 0.2 * noise(vec2(p.y*12.0, u_time))));
  vec3 tint = vec3(0.45 + 0.4 * sin(u_hue), 0.55 + 0.35 * sin(u_hue + 2.1), 1.0);
  vec3 color = tint * (core * 1.4 + glow * 0.45 + branch * 0.25) * u_intensity;
  gl_FragColor = vec4(color, clamp(core + glow * 0.7, 0.0, 1.0));
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
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

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function Lightning({ className, hue = 3.8, speed = 1, intensity = 1, count = 4 }: LightningProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(hostRef)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const live = React.useRef({ hue, speed: playbackRate(speed), intensity, count })

  React.useEffect(() => {
    live.current = { hue, speed: playbackRate(speed), intensity, count }
  }, [hue, speed, intensity, count])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced || !active) return
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false })
    if (!gl) {
      queueMicrotask(() => setFallback(true))
      return
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) {
      queueMicrotask(() => setFallback(true))
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      queueMicrotask(() => setFallback(true))
      return
    }
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "a_pos")
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
    }
    resize()
    let frame = 0
    let time = 0
    const tick = () => {
      const spec = live.current
      time += 0.016 * spec.speed
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(gl.getUniformLocation(program, "u_res"), canvas.width, canvas.height)
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time)
      gl.uniform1f(gl.getUniformLocation(program, "u_hue"), spec.hue)
      gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), spec.intensity)
      gl.uniform1f(gl.getUniformLocation(program, "u_count"), spec.count)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [active, reduced])

  return (
    <div ref={hostRef} className={cn("relative min-h-52 overflow-hidden rounded-xl border bg-zinc-950", className)}>
      {fallback || reduced ? (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,42%,#93c5fd,50%,transparent,58%)] opacity-70" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
    </div>
  )
}

export { Lightning }
