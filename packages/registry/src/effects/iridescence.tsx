"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface IridescenceProps {
  className?: string
  children?: React.ReactNode
}

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 83147.3); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i); float b = hash(i+vec2(1,0));
  float c = hash(i+vec2(0,1)); float d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / max(u_res.y, 1.0);
  float n = fbm(uv * 3.2 + vec2(u_time * 0.07, -u_time * 0.04));
  float m = fbm(uv * 1.6 - vec2(u_time * 0.03, u_time * 0.05));
  vec3 a = vec3(0.15, 0.05, 0.35);
  vec3 b = 0.5 + 0.5 * cos(6.2831 * (n + vec3(0.0, 0.33, 0.67)));
  vec3 c = 0.5 + 0.5 * cos(6.2831 * (m + vec3(0.18, 0.52, 0.84)));
  gl_FragColor = vec4(mix(a, mix(b, c, 0.55), 0.85), 1.0);
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

function Iridescence({ className, children }: IridescenceProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduced) return
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
    }
    resize()
    let frame = 0
    let time = 0
    const tick = () => {
      time += 0.016
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(gl.getUniformLocation(program, "u_res"), canvas.width, canvas.height)
      gl.uniform1f(gl.getUniformLocation(program, "u_time"), time)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [reduced])

  return (
    <div className={cn("relative min-h-52 overflow-hidden rounded-xl", className)}>
      {fallback || reduced ? (
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg,#7c3aed,#22d3ee,#f472b6,#7c3aed)]" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}

export { Iridescence }
