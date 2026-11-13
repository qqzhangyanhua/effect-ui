"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { compileShader, mountGlLoop, type GlContext, type GlLoopHandle, type GlSize } from "./gl/gl-loop"

/** original implementation. Ridges are already cut before the pointer moves. */

/** 棱心处的最大纹理位移。选二进制小数，静止采样可以手算。 */
const FLUTE_AMPLITUDE = 0.0625

export interface FluteSample {
  u: number
  v: number
  ridge: number
}

export interface FlutedGlassPaneProps {
  count?: number
  angle?: number
  intensity?: number
  interactive?: boolean
  src?: string
  className?: string
}

type Picture = "pending" | "procedural" | "photo"

interface Tuning {
  count: number
  angle: number
  intensity: number
}

interface PaneGpu {
  program: WebGLProgram
  texture: WebGLTexture
  paint: HTMLCanvasElement
  mode: "none" | "procedural" | "photo"
  tex: WebGLUniformLocation | null
  count: WebGLUniformLocation | null
  angle: WebGLUniformLocation | null
  intensity: WebGLUniformLocation | null
  phase: WebGLUniformLocation | null
}

function fluteCount(count: number) {
  if (!Number.isFinite(count)) return 18
  const rounded = Math.round(count)
  if (rounded < 4) return 4
  if (rounded > 48) return 48
  return rounded
}

function fluteAngle(angle: number) {
  if (!Number.isFinite(angle)) return 90
  return ((angle % 360) + 360) % 360
}

function fluteIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.45
  if (intensity < 0) return 0
  if (intensity > 1) return 1
  return intensity
}

/** 未打开 interactive 时相位是 0。打开后只把指针横向位置换成至多一条棱。 */
export function flutePhase(interactive: boolean, pointerX: number | null) {
  if (!interactive || pointerX === null || !Number.isFinite(pointerX)) return 0
  const x = Math.min(1, Math.max(0, pointerX))
  return (x - 0.5) * 2
}

/**
 * 沿棱法线的采样。相位 0 时三角波已经弯折，不是一张平图。
 * 指针只改变 phase，不另加一种变形。
 */
export function fluteSample(
  u: number,
  v: number,
  count: number,
  angleDeg: number,
  intensity: number,
  phase: number,
): FluteSample {
  const n = fluteCount(count)
  const rad = (fluteAngle(angleDeg) * Math.PI) / 180
  const along = Math.cos(rad)
  const across = Math.sin(rad)
  const axis = u * along + v * across
  const t = axis * n + phase
  const index = Math.floor(t)
  const frac = t - index
  const bend = frac < 0.5 ? frac * 4 - 1 : 3 - frac * 4
  const shift = bend * fluteIntensity(intensity) * FLUTE_AMPLITUDE
  const ridge = ((index % n) + n) % n
  return { u: u + along * shift, v: v + across * shift, ridge }
}

function panePicture(src: string | undefined, loadedSrc: string | null, failedSrc: string | null): Picture {
  if (!src || failedSrc === src) return "procedural"
  if (loadedSrc === src) return "photo"
  return "pending"
}

function token(style: CSSStyleDeclaration, name: string, fallback: string) {
  const value = style.getPropertyValue(name).trim()
  if (value.length === 0 || value.includes("var(")) return fallback
  return value
}

function paintStandIn(canvas: HTMLCanvasElement, style: CSSStyleDeclaration) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false
  const width = canvas.width
  const height = canvas.height
  ctx.fillStyle = token(style, "--background", "#f4f1ea")
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = token(style, "--chart-2", "#0f766e")
  ctx.beginPath()
  ctx.arc(width * 0.74, height * 0.3, Math.min(width, height) * 0.14, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = token(style, "--primary", "#334155")
  ctx.fillRect(width * 0.16, height * 0.18, width * 0.3, height * 0.52)
  ctx.fillStyle = token(style, "--chart-4", "#b45309")
  ctx.fillRect(0, height * 0.76, width, height * 0.08)
  return true
}

function stillBackground(angle: number, count: number, picture: Picture) {
  const gap = Math.max(3, Math.round(72 / count))
  const lines = `repeating-linear-gradient(${angle}deg, rgba(15,23,42,0.34) 0px, rgba(15,23,42,0.34) 1px, transparent 1px, transparent ${gap}px)`
  if (picture === "photo") return lines
  return `${lines}, linear-gradient(165deg, var(--background), var(--primary) 46%, var(--chart-2) 74%, var(--chart-4))`
}

function paneShaders(webgl2: boolean) {
  const vert = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 vUv;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const frag = `${head}
uniform sampler2D uTex;
uniform float uCount;
uniform float uAngle;
uniform float uIntensity;
uniform float uPhase;
void main() {
  float c = cos(uAngle);
  float s = sin(uAngle);
  float axis = vUv.x * c + vUv.y * s;
  float t = axis * uCount + uPhase;
  float frac = t - floor(t);
  float bend = frac < 0.5 ? frac * 4.0 - 1.0 : 3.0 - frac * 4.0;
  float shift = bend * uIntensity * ${FLUTE_AMPLITUDE};
  vec2 uv = clamp(vUv + vec2(c, s) * shift, 0.0, 1.0);
  WRITE = TEX(uTex, uv);
}
`
  return { vert, frag }
}

function linkPane(gl: GlContext) {
  const source = paneShaders("drawBuffers" in gl)
  const program = gl.createProgram()
  if (!program) return null
  const vertex = compileShader(gl, gl.VERTEX_SHADER, source.vert)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, source.frag)
  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex)
    if (fragment) gl.deleteShader(fragment)
    gl.deleteProgram(program)
    return null
  }
  gl.bindAttribLocation(program, 0, "a")
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function bootPane(gl: GlContext): PaneGpu | null {
  const program = linkPane(gl)
  const texture = gl.createTexture()
  if (!program || !texture) {
    if (program) gl.deleteProgram(program)
    if (texture) gl.deleteTexture(texture)
    return null
  }
  const paint = document.createElement("canvas")
  paint.width = 256
  paint.height = 160
  return {
    program,
    texture,
    paint,
    mode: "none",
    tex: gl.getUniformLocation(program, "uTex"),
    count: gl.getUniformLocation(program, "uCount"),
    angle: gl.getUniformLocation(program, "uAngle"),
    intensity: gl.getUniformLocation(program, "uIntensity"),
    phase: gl.getUniformLocation(program, "uPhase"),
  }
}

function upload(gl: GlContext, texture: WebGLTexture, source: HTMLCanvasElement | HTMLImageElement) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
}

function drawPane(
  gl: GlContext,
  gpu: PaneGpu,
  size: GlSize,
  host: HTMLElement,
  tuning: Tuning,
  phase: number,
  picture: Picture,
  image: HTMLImageElement | null,
  draw: () => void,
) {
  const photo = picture === "photo" && image !== null && image.complete && image.naturalWidth > 0
  const mode = photo ? "photo" : "procedural"
  if (gpu.mode !== mode) {
    try {
      if (mode === "photo" && image) upload(gl, gpu.texture, image)
      else if (!paintStandIn(gpu.paint, getComputedStyle(host))) return
      else upload(gl, gpu.texture, gpu.paint)
      gpu.mode = mode
    } catch {
      gpu.mode = "none"
      return
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, size.width, size.height)
  gl.useProgram(gpu.program)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
  gl.uniform1i(gpu.tex, 0)
  gl.uniform1f(gpu.count, tuning.count)
  gl.uniform1f(gpu.angle, tuning.angle)
  gl.uniform1f(gpu.intensity, tuning.intensity)
  gl.uniform1f(gpu.phase, phase)
  draw()
}

export function FlutedGlassPane({
  count = 18,
  angle = 90,
  intensity = 0.45,
  interactive = false,
  src,
  className,
}: FlutedGlassPaneProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const phaseRef = useRef(0)
  const [blocked, setBlocked] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const picture = panePicture(src, loadedSrc, failedSrc)
  const ridges = fluteCount(count)
  const tilt = fluteAngle(angle)
  const still = reduced || blocked
  const tuningRef = useRef<Tuning>({
    count: ridges,
    angle: (tilt * Math.PI) / 180,
    intensity: fluteIntensity(intensity),
  })
  const pictureRef = useRef<Picture>(picture)

  useEffect(() => {
    tuningRef.current = {
      count: fluteCount(count),
      angle: (fluteAngle(angle) * Math.PI) / 180,
      intensity: fluteIntensity(intensity),
    }
    pictureRef.current = picture
    if (!interactive) phaseRef.current = 0
  }, [angle, count, intensity, interactive, picture])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let gone = false
    let gpu: PaneGpu | null = null
    let handle: GlLoopHandle | null = null
    handle = mountGlLoop(canvas, {
      host,
      frame: ({ gl, size }) => {
        if (gone || !handle) return
        if (!gpu) {
          gpu = bootPane(gl)
          if (!gpu) {
            gone = true
            handle.dispose()
            setBlocked(true)
            return
          }
        }
        const current = gpu
        drawPane(gl, current, size, host, tuningRef.current, phaseRef.current, pictureRef.current, imgRef.current, () => {
          handle?.draw()
        })
      },
    })
    if (!handle) {
      setBlocked(true)
      return
    }
    return () => {
      gone = true
      if (gpu) {
        handle?.gl.deleteProgram(gpu.program)
        handle?.gl.deleteTexture(gpu.texture)
      }
      handle?.dispose()
    }
  }, [reduced])

  function slide(event: PointerEvent<HTMLDivElement>) {
    const host = hostRef.current
    if (!host) return
    const rect = host.getBoundingClientRect()
    const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0.5
    phaseRef.current = flutePhase(true, x)
  }

  const tracking = interactive && !still
  const showPhoto = still && picture === "photo"

  return (
    <div
      ref={hostRef}
      data-slot="fluted-glass-pane"
      data-ridges={ridges}
      data-interactive={interactive ? "true" : "false"}
      data-image={picture}
      data-state={still ? "still" : "live"}
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-xl bg-background text-foreground select-none",
        tracking && "touch-none",
        className,
      )}
      onPointerDown={tracking ? slide : undefined}
      onPointerMove={tracking ? slide : undefined}
    >
      {src ? (
        <img
          ref={imgRef}
          src={src}
          alt=""
          aria-hidden
          className={showPhoto ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      ) : null}
      {still ? (
        <div
          data-fallback="still"
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundColor: showPhoto ? "transparent" : "var(--background)",
            backgroundImage: stillBackground(tilt, ridges, picture),
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
      <p className="pointer-events-none relative z-10 p-4 text-sm">North light</p>
    </div>
  )
}
