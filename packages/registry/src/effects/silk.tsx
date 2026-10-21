"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface SilkProps {
  className?: string
  children?: React.ReactNode
  colors?: string[]
  speed?: number
  scale?: number
  intensity?: number
}

const SILK_COLORS = ["#120d1f", "#472e6b", "#c7b8db"]

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_intensity;
uniform vec3 u_deep;
uniform vec3 u_mid;
uniform vec3 u_lite;
float hash(vec2 p){ return fract(sin(dot(p, vec2(27.1, 61.7))) * 14527.2); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i); float b = hash(i+vec2(1,0));
  float c = hash(i+vec2(0,1)); float d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.55;
  for (int i = 0; i < 6; i++) { v += a * vnoise(p); p = p * 2.07 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / max(u_res.y, 1.0);
  vec2 q = uv * vec2(1.8, 3.4);
  q.y += u_time * 0.08 * u_speed;
  q.x += sin(uv.y * 3.2 + u_time * 0.4 * u_speed) * 0.15;
  float n = fbm(q);
  float folds = pow(abs(sin(n * 9.0 * u_scale + uv.x * 4.0 * u_scale)), 1.4);
  vec3 color = mix(u_deep, u_mid, n);
  color = mix(color, u_lite, folds * u_intensity);
  gl_FragColor = vec4(color, 1.0);
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

function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const raw = hex.trim().replace(/^#/, "")
  const digits = raw.length === 3 ? [...raw].map((char) => `${char}${char}`).join("") : raw
  if (!/^[0-9a-fA-F]{6}$/.test(digits)) return fallback
  const value = Number.parseInt(digits, 16)
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
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

function Silk({
  className,
  children,
  colors = SILK_COLORS,
  speed = 1,
  scale = 1,
  intensity = 0.35,
}: SilkProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(hostRef)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)
  const live = React.useRef({ colors, speed: playbackRate(speed), scale, intensity })

  React.useEffect(() => {
    live.current = { colors, speed: playbackRate(speed), scale, intensity }
  }, [colors, speed, scale, intensity])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced || !active) return
    const gl = canvas.getContext("webgl", { alpha: false })
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
      const deep = hexToRgb(spec.colors[0] ?? "", [0.07, 0.05, 0.12])
      const mid = hexToRgb(spec.colors[1] ?? "", [0.28, 0.18, 0.42])
      const lite = hexToRgb(spec.colors[2] ?? "", [0.78, 0.72, 0.86])
      time += 0.016
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(gl.getUniformLocation(program, "u_res"), canvas.width, canvas.height)
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time)
      gl.uniform1f(gl.getUniformLocation(program, "u_speed"), spec.speed)
      gl.uniform1f(gl.getUniformLocation(program, "u_scale"), spec.scale)
      gl.uniform1f(gl.getUniformLocation(program, "u_intensity"), spec.intensity)
      gl.uniform3f(gl.getUniformLocation(program, "u_deep"), deep[0], deep[1], deep[2])
      gl.uniform3f(gl.getUniformLocation(program, "u_mid"), mid[0], mid[1], mid[2])
      gl.uniform3f(gl.getUniformLocation(program, "u_lite"), lite[0], lite[1], lite[2])
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
    <div ref={hostRef} className={cn("relative min-h-52 overflow-hidden rounded-xl", className)}>
      {fallback || reduced ? (
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#1e1b4b,#4c1d95,#111827)]" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { Silk }
