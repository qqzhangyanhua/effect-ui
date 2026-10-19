"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SplashCursorProps {
  className?: string
  splatRadius?: number
  fade?: number
}

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_splat;
uniform vec3 u_color;
uniform float u_radius;
uniform float u_fade;
uniform int u_mode;
void main() {
  vec4 prev = texture2D(u_tex, v_uv) * u_fade;
  if (u_mode == 1) {
    vec2 d = (v_uv - u_splat) * vec2(1.0, 1.0);
    float inf = exp(-dot(d, d) / max(u_radius, 0.0002));
    prev.rgb += u_color * inf;
    prev.a = max(prev.a, inf);
  }
  gl_FragColor = prev;
}`

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

function SplashCursor({ className, splatRadius = 0.012, fade = 0.975 }: SplashCursorProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = React.useState(false)
  const pointer = React.useRef({ x: 0.5, y: 0.5, down: false, hue: 0 })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true })
    if (!gl) {
      setFallback(true)
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    const program = gl.createProgram()
    if (!vs || !fs || !program) {
      setFallback(true)
      return
    }
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true)
      return
    }

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "a_pos")

    const makeTex = () => {
      const tex = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return tex
    }

    let texA = makeTex()
    let texB = makeTex()
    const fbo = gl.createFramebuffer()

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      for (const tex of [texA, texB]) {
        gl.bindTexture(gl.TEXTURE_2D, tex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      }
    }
    resize()

    const draw = (src: WebGLTexture | null, mode: number) => {
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0)
      gl.uniform2f(gl.getUniformLocation(program, "u_splat"), pointer.current.x, 1 - pointer.current.y)
      const hue = pointer.current.hue
      gl.uniform3f(
        gl.getUniformLocation(program, "u_color"),
        0.45 + 0.55 * Math.sin(hue),
        0.35 + 0.55 * Math.sin(hue + 2.1),
        0.55 + 0.45 * Math.sin(hue + 4.2),
      )
      gl.uniform1f(gl.getUniformLocation(program, "u_radius"), splatRadius)
      gl.uniform1f(gl.getUniformLocation(program, "u_fade"), fade)
      gl.uniform1i(gl.getUniformLocation(program, "u_mode"), mode)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, src)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    let frame = 0
    const tick = () => {
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texB, 0)
      draw(texA, pointer.current.down ? 1 : 0)
      const swap = texA
      texA = texB
      texB = swap
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      draw(texA, 0)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [fade, splatRadius])

  return (
    <div
      className={cn("relative min-h-48 overflow-hidden rounded-xl border bg-zinc-950", className)}
      onPointerDown={() => {
        pointer.current.down = true
      }}
      onPointerUp={() => {
        pointer.current.down = false
      }}
      onPointerLeave={() => {
        pointer.current.down = false
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        pointer.current.x = (event.clientX - rect.left) / rect.width
        pointer.current.y = (event.clientY - rect.top) / rect.height
        pointer.current.down = true
        pointer.current.hue += 0.08
      }}
    >
      {fallback ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--sx,50%)_var(--sy,50%),#7c3aed,transparent_28%),radial-gradient(circle_at_70%_40%,#22d3ee33,transparent_40%)]" />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      )}
      <p className="relative z-10 grid h-full min-h-48 place-items-center text-sm text-white/70">拖动鼠标喷溅流体</p>
    </div>
  )
}

export { SplashCursor }
