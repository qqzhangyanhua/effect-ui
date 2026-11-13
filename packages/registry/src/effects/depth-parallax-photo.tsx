"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { compileShader, mountGlLoop, type GlContext, type GlLoopHandle, type GlSize } from "./gl/gl-loop"

/** original implementation. Pointer and touch shift the photo by depth. */

const LUMA_R = 299
const LUMA_G = 587
const LUMA_B = 114

export interface DepthParallaxPhotoProps {
  intensity?: number
  size?: number
  speed?: number
  src?: string
  depthSrc?: string
  className?: string
}

type Picture = "pending" | "procedural" | "photo"
type DepthKind = "pending" | "map" | "luminance" | "drawn"
type DepthSample = "map" | "luminance" | "drawn"

interface Tuning {
  intensity: number
  size: number
  speed: number
}

interface Axis {
  x: number
  y: number
}

interface PhotoGpu {
  program: WebGLProgram
  color: WebGLTexture
  depth: WebGLTexture
  paint: HTMLCanvasElement
  depthPaint: HTMLCanvasElement
  colorMode: "none" | "procedural" | "photo"
  depthMode: "none" | DepthSample
  tex: WebGLUniformLocation | null
  depthTex: WebGLUniformLocation | null
  pointer: WebGLUniformLocation | null
  intensity: WebGLUniformLocation | null
  size: WebGLUniformLocation | null
  css: WebGLUniformLocation | null
  luma: WebGLUniformLocation | null
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}
function depthIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.5
  return clamp01(intensity)
}
function depthSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 24
  return size
}
function depthSpeed(speed: number) {
  if (!Number.isFinite(speed)) return 1
  if (speed < 0.25) return 0.25
  if (speed > 2.5) return 2.5
  return speed
}

/** 指针在元素内的位置，换成相对中心的 -1 到 1。跨度无效时停在 0。 */
export function pointerAxis(client: number, origin: number, span: number) {
  if (!Number.isFinite(client) || !Number.isFinite(origin) || !(span > 0)) return 0
  const ratio = (client - origin) / span
  return (Math.min(1, Math.max(0, ratio)) - 0.5) * 2
}

/** 采样点按深度错开的像素。深度 0 不动；深度 1、指针贴边、intensity 为 1 时走满 size。 */
export function depthOffset(axis: number, depth: number, intensity: number, size: number) {
  const along = !Number.isFinite(axis) ? 0 : Math.min(1, Math.max(-1, axis))
  return along * clamp01(depth) * depthIntensity(intensity) * depthSize(size)
}

/** 没有深度图时用亮度。权重 299、587、114，加起来是 1000，中灰仍是 0.5。 */
export function luminanceDepth(red: number, green: number, blue: number) {
  return (clamp01(red) * LUMA_R + clamp01(green) * LUMA_G + clamp01(blue) * LUMA_B) / 1000
}

/** 一帧靠近目标。speed 为 1、dt 为 0.25 时走完剩余的四分之一。 */
export function easeDepth(current: number, target: number, speed: number, dt: number) {
  if (!Number.isFinite(current)) return Number.isFinite(target) ? target : 0
  if (!Number.isFinite(target)) return current
  const time = !Number.isFinite(dt) || dt < 0 ? 0 : dt
  const gain = Math.min(1, time * depthSpeed(speed))
  return current + (target - current) * gain
}

function photoPicture(src: string | undefined, loaded: string | null, failed: string | null): Picture {
  if (!src || failed === src) return "procedural"
  if (loaded === src) return "photo"
  return "pending"
}
function depthKind(depthSrc: string | undefined, loaded: string | null, failed: string | null, picture: Picture): DepthKind {
  if (depthSrc && failed !== depthSrc && loaded === depthSrc) return "map"
  if (depthSrc && failed !== depthSrc && loaded !== depthSrc) return "pending"
  if (picture === "procedural") return "drawn"
  return "luminance"
}
function depthSample(kind: DepthKind, picture: Picture): DepthSample {
  if (kind === "map") return "map"
  if (picture === "photo") return "luminance"
  return "drawn"
}
function token(style: CSSStyleDeclaration, name: string, fallback: string) {
  const value = style.getPropertyValue(name).trim()
  if (value.length === 0 || value.includes("var(")) return fallback
  return value
}

function paintColor(canvas: HTMLCanvasElement, style: CSSStyleDeclaration) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false
  const width = canvas.width
  const height = canvas.height
  ctx.fillStyle = token(style, "--background", "#f4f1ea")
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = token(style, "--chart-2", "#0f766e")
  ctx.beginPath()
  ctx.arc(width * 0.72, height * 0.28, Math.min(width, height) * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = token(style, "--primary", "#334155")
  ctx.fillRect(width * 0.18, height * 0.34, width * 0.28, height * 0.5)
  ctx.fillStyle = token(style, "--chart-4", "#b45309")
  ctx.fillRect(0, height * 0.78, width, height * 0.22)
  return true
}

function paintDepth(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false
  const width = canvas.width
  const height = canvas.height
  ctx.fillStyle = "#1a1a1a"
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = "#6e6e6e"
  ctx.beginPath()
  ctx.arc(width * 0.72, height * 0.28, Math.min(width, height) * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#c8c8c8"
  ctx.fillRect(width * 0.18, height * 0.34, width * 0.28, height * 0.5)
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, height * 0.78, width, height * 0.22)
  return true
}

function photoShaders(webgl2: boolean) {
  const vert = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 vUv;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const frag = `${head}
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uPointer;
uniform float uIntensity;
uniform float uSize;
uniform vec2 uCss;
uniform float uLuma;
void main() {
  vec4 color = TEX(uColor, vUv);
  float depth = uLuma > 0.5 ? dot(color.rgb, vec3(0.299, 0.587, 0.114)) : TEX(uDepth, vUv).r;
  vec2 shift = uPointer * depth * uIntensity * uSize / max(uCss, vec2(1.0));
  WRITE = TEX(uColor, clamp(vUv + shift, 0.0, 1.0));
}
`
  return { vert, frag }
}

function linkPhoto(gl: GlContext) {
  const source = photoShaders("drawBuffers" in gl)
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

function bootPhoto(gl: GlContext): PhotoGpu | null {
  const program = linkPhoto(gl)
  const color = gl.createTexture()
  const depth = gl.createTexture()
  if (!program || !color || !depth) {
    if (program) gl.deleteProgram(program)
    if (color) gl.deleteTexture(color)
    if (depth) gl.deleteTexture(depth)
    return null
  }
  const paint = document.createElement("canvas")
  paint.width = 256
  paint.height = 160
  const depthPaint = document.createElement("canvas")
  depthPaint.width = 256
  depthPaint.height = 160
  return {
    program,
    color,
    depth,
    paint,
    depthPaint,
    colorMode: "none",
    depthMode: "none",
    tex: gl.getUniformLocation(program, "uColor"),
    depthTex: gl.getUniformLocation(program, "uDepth"),
    pointer: gl.getUniformLocation(program, "uPointer"),
    intensity: gl.getUniformLocation(program, "uIntensity"),
    size: gl.getUniformLocation(program, "uSize"),
    css: gl.getUniformLocation(program, "uCss"),
    luma: gl.getUniformLocation(program, "uLuma"),
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

function resolvedDepth(sample: DepthSample, photo: boolean, depthImage: HTMLImageElement | null): DepthSample {
  const mapped = sample === "map" && depthImage !== null && depthImage.complete && depthImage.naturalWidth > 0
  if (mapped) return "map"
  if (sample === "luminance" && photo) return "luminance"
  return "drawn"
}

function drawPhoto(
  gl: GlContext,
  gpu: PhotoGpu,
  frameSize: GlSize,
  host: HTMLElement,
  tuning: Tuning,
  pointer: Axis,
  picture: Picture,
  sample: DepthSample,
  image: HTMLImageElement | null,
  depthImage: HTMLImageElement | null,
  draw: () => void,
) {
  const photo = picture === "photo" && image !== null && image.complete && image.naturalWidth > 0
  const colorMode = photo ? "photo" : "procedural"
  const depthMode = resolvedDepth(sample, photo, depthImage)
  if (gpu.colorMode !== colorMode || gpu.depthMode !== depthMode) {
    try {
      if (colorMode === "photo" && image) upload(gl, gpu.color, image)
      else if (!paintColor(gpu.paint, getComputedStyle(host))) return
      else upload(gl, gpu.color, gpu.paint)
      if (depthMode === "map" && depthImage) upload(gl, gpu.depth, depthImage)
      else if (!paintDepth(gpu.depthPaint)) return
      else upload(gl, gpu.depth, gpu.depthPaint)
      gpu.colorMode = colorMode
      gpu.depthMode = depthMode
    } catch {
      gpu.colorMode = "none"
      gpu.depthMode = "none"
      return
    }
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, frameSize.width, frameSize.height)
  gl.useProgram(gpu.program)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gpu.color)
  gl.uniform1i(gpu.tex, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, gpu.depth)
  gl.uniform1i(gpu.depthTex, 1)
  gl.uniform2f(gpu.pointer, pointer.x, pointer.y)
  gl.uniform1f(gpu.intensity, tuning.intensity)
  gl.uniform1f(gpu.size, tuning.size)
  gl.uniform2f(gpu.css, frameSize.cssWidth, frameSize.cssHeight)
  gl.uniform1f(gpu.luma, depthMode === "luminance" ? 1 : 0)
  draw()
}

export function DepthParallaxPhoto({
  intensity = 0.5,
  size = 24,
  speed = 1,
  src,
  depthSrc,
  className,
}: DepthParallaxPhotoProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const depthImgRef = useRef<HTMLImageElement>(null)
  const targetRef = useRef<Axis>({ x: 0, y: 0 })
  const pointerRef = useRef<Axis>({ x: 0, y: 0 })
  const [blocked, setBlocked] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const [loadedDepth, setLoadedDepth] = useState<string | null>(null)
  const [failedDepth, setFailedDepth] = useState<string | null>(null)
  const picture = photoPicture(src, loadedSrc, failedSrc)
  const kind = depthKind(depthSrc, loadedDepth, failedDepth, picture)
  const still = reduced || blocked
  const tuningRef = useRef<Tuning>({
    intensity: depthIntensity(intensity),
    size: depthSize(size),
    speed: depthSpeed(speed),
  })
  const pictureRef = useRef(picture)
  const sampleRef = useRef<DepthSample>(depthSample(kind, picture))

  useEffect(() => {
    tuningRef.current = {
      intensity: depthIntensity(intensity),
      size: depthSize(size),
      speed: depthSpeed(speed),
    }
    pictureRef.current = picture
    sampleRef.current = depthSample(kind, picture)
  }, [intensity, kind, picture, size, speed])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let gone = false
    let gpu: PhotoGpu | null = null
    let handle: GlLoopHandle | null = null
    handle = mountGlLoop(canvas, {
      host,
      frame: ({ gl, dt, size: frameSize }) => {
        if (gone || !handle) return
        if (!gpu) {
          gpu = bootPhoto(gl)
          if (!gpu) {
            gone = true
            handle.dispose()
            setBlocked(true)
            return
          }
        }
        const tuning = tuningRef.current
        const pointer = pointerRef.current
        pointer.x = easeDepth(pointer.x, targetRef.current.x, tuning.speed, dt)
        pointer.y = easeDepth(pointer.y, targetRef.current.y, tuning.speed, dt)
        drawPhoto(
          gl,
          gpu,
          frameSize,
          host,
          tuning,
          pointer,
          pictureRef.current,
          sampleRef.current,
          imgRef.current,
          depthImgRef.current,
          () => {
            handle?.draw()
          },
        )
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
        handle?.gl.deleteTexture(gpu.color)
        handle?.gl.deleteTexture(gpu.depth)
      }
      handle?.dispose()
    }
  }, [reduced])

  function place(event: PointerEvent<HTMLDivElement>) {
    const host = hostRef.current
    if (!host) return
    const rect = host.getBoundingClientRect()
    targetRef.current = {
      x: pointerAxis(event.clientX, rect.left, rect.width),
      y: pointerAxis(event.clientY, rect.top, rect.height),
    }
  }

  function rest() {
    targetRef.current = { x: 0, y: 0 }
  }

  const showPhoto = still && picture === "photo"
  const tracking = !still

  return (
    <div
      ref={hostRef}
      data-slot="depth-parallax-photo"
      data-image={picture}
      data-depth={kind}
      data-state={still ? "still" : "live"}
      className={cn(
        "relative h-64 w-full overflow-hidden rounded-xl bg-background text-foreground select-none",
        tracking && "touch-none",
        className,
      )}
      onPointerDown={tracking ? place : undefined}
      onPointerMove={tracking ? place : undefined}
      onPointerLeave={tracking ? rest : undefined}
      onPointerCancel={tracking ? rest : undefined}
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
      {depthSrc ? (
        <img
          ref={depthImgRef}
          src={depthSrc}
          alt=""
          aria-hidden
          className="hidden"
          onLoad={() => setLoadedDepth(depthSrc)}
          onError={() => setFailedDepth(depthSrc)}
        />
      ) : null}
      {still ? (
        <div
          data-fallback="still"
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundColor: showPhoto ? "transparent" : "var(--background)",
            backgroundImage: showPhoto
              ? "none"
              : "linear-gradient(165deg, var(--background), var(--primary) 46%, var(--chart-2) 74%, var(--chart-4))",
          }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
      <p className="pointer-events-none relative z-10 p-4 text-sm">North window</p>
    </div>
  )
}
