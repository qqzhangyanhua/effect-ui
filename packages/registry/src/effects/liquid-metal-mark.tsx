"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

import { useEffect, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { compileShader, mountGlLoop, parseCssColor, type GlContext, type GlLoopHandle, type GlSize } from "./gl/gl-loop"

/** original implementation. The word is the mark until an image mask replaces it. */

/** speed 为 1 时，高光 4 秒走一圈。着色器里的周期必须和这里一致。 */
const FLOW_CYCLE = 4

const MASK_WIDTH = 512
const MASK_HEIGHT = 192

const THEME_FALLBACK = ["#0f172a", "#334155", "#0f766e"] as const

export interface LiquidMetalMarkProps {
  text?: string
  src?: string
  speed?: number
  intensity?: number
  colors?: readonly string[]
  className?: string
}

export interface MetalMark {
  kind: "text" | "mask"
  text: string
}

interface Tuning {
  speed: number
  intensity: number
  colors: readonly string[] | undefined
  mark: MetalMark
}

interface MetalGpu {
  program: WebGLProgram
  texture: WebGLTexture
  paint: HTMLCanvasElement
  signature: string
  tex: WebGLUniformLocation | null
  time: WebGLUniformLocation | null
  speed: WebGLUniformLocation | null
  intensity: WebGLUniformLocation | null
  c0: WebGLUniformLocation | null
  c1: WebGLUniformLocation | null
  c2: WebGLUniformLocation | null
}

export function metalSpeed(speed: number) {
  if (!Number.isFinite(speed)) return 1
  if (speed < 0.25) return 0.25
  if (speed > 2.5) return 2.5
  return speed
}

export function metalIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.6
  if (intensity < 0) return 0
  if (intensity > 1) return 1
  return intensity
}

/** 流动相位，0 到 1。time 为 0 时停在带心。 */
export function metalFlow(time: number, speed: number) {
  if (!Number.isFinite(time)) return 0
  const turns = (time * metalSpeed(speed)) / FLOW_CYCLE
  return turns - Math.floor(turns)
}

/**
 * 对角高光权重。phase 为 0、u 为 0.25、v 为 0.5 时，采样点落在带心，权重等于 intensity。
 * 着色器使用同一条带，不另算一种高光。
 */
export function metalSheen(u: number, v: number, phase: number, intensity: number) {
  const band = u + v * 0.5 - phase
  const wrapped = band - Math.floor(band)
  const dist = Math.abs(wrapped - 0.5)
  return (1 - dist * 2) * metalIntensity(intensity)
}

/** 传了遮罩且尚未加载失败时，文字不再作为标记。空白文字回到 Metal。 */
export function metalMark(text: string | undefined, src: string | undefined, failedSrc: string | null): MetalMark {
  const word = text !== undefined && text.trim().length > 0 ? text : "Metal"
  if (src && src.length > 0 && failedSrc !== src) return { kind: "mask", text: word }
  return { kind: "text", text: word }
}

function token(style: CSSStyleDeclaration, name: string, fallback: string) {
  const value = style.getPropertyValue(name).trim()
  if (value.length === 0 || value.includes("var(")) return fallback
  return value
}

function rgbOf(host: HTMLElement, input: string, fallback: string): [number, number, number] {
  return parseCssColor(host, input) ?? parseCssColor(host, fallback) ?? [0, 0, 0]
}

function metalColors(style: CSSStyleDeclaration, colors: readonly string[] | undefined): [string, string, string] {
  if (colors && colors.length >= 3) {
    return [colors[0] ?? THEME_FALLBACK[0], colors[1] ?? THEME_FALLBACK[1], colors[2] ?? THEME_FALLBACK[2]]
  }
  return [
    token(style, "--foreground", THEME_FALLBACK[0]),
    token(style, "--primary", THEME_FALLBACK[1]),
    token(style, "--chart-2", THEME_FALLBACK[2]),
  ]
}

function stillGradient(colors: readonly string[] | undefined, intensity: number) {
  const shine = metalSheen(0.25, 0.5, metalFlow(0, 1), intensity)
  const mid = Math.round(28 + shine * 36)
  const [from, body, highlight] =
    colors && colors.length >= 3
      ? [colors[0] ?? THEME_FALLBACK[0], colors[1] ?? THEME_FALLBACK[1], colors[2] ?? THEME_FALLBACK[2]]
      : ["var(--foreground)", "var(--primary)", "var(--chart-2)"]
  return `linear-gradient(105deg, ${from}, ${body} ${mid}%, ${highlight})`
}

function metalShaders(webgl2: boolean) {
  const vert = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 vUv;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const frag = `${head}
uniform sampler2D uMask;
uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
void main() {
  float phase = uTime * uSpeed / ${FLOW_CYCLE}.0;
  phase = phase - floor(phase);
  float band = vUv.x + vUv.y * 0.5 - phase;
  float wrapped = band - floor(band);
  float dist = abs(wrapped - 0.5);
  float peak = (1.0 - dist * 2.0) * uIntensity;
  float rip = sin(vUv.x * 8.0 - vUv.y * 5.0 + phase * 6.2831853) * 0.5 + 0.5;
  vec3 metal = mix(uC0, uC1, rip);
  metal = mix(metal, uC2, clamp(peak, 0.0, 1.0));
  WRITE = vec4(metal, TEX(uMask, vUv).a);
}
`
  return { vert, frag }
}

function linkMetal(gl: GlContext) {
  const source = metalShaders("drawBuffers" in gl)
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

function bootMetal(gl: GlContext): MetalGpu | null {
  const program = linkMetal(gl)
  const texture = gl.createTexture()
  if (!program || !texture) {
    if (program) gl.deleteProgram(program)
    if (texture) gl.deleteTexture(texture)
    return null
  }
  const paint = document.createElement("canvas")
  paint.width = MASK_WIDTH
  paint.height = MASK_HEIGHT
  return {
    program,
    texture,
    paint,
    signature: "",
    tex: gl.getUniformLocation(program, "uMask"),
    time: gl.getUniformLocation(program, "uTime"),
    speed: gl.getUniformLocation(program, "uSpeed"),
    intensity: gl.getUniformLocation(program, "uIntensity"),
    c0: gl.getUniformLocation(program, "uC0"),
    c1: gl.getUniformLocation(program, "uC1"),
    c2: gl.getUniformLocation(program, "uC2"),
  }
}

function upload(gl: GlContext, texture: WebGLTexture, source: HTMLCanvasElement) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
}

function maskSignature(mark: MetalMark, image: HTMLImageElement | null) {
  if (mark.kind === "text") return `text:${mark.text}`
  if (image && image.complete && image.naturalWidth > 0) return `mask:${image.currentSrc || image.src}`
  return "mask:wait"
}

function paintMask(canvas: HTMLCanvasElement, mark: MetalMark, image: HTMLImageElement | null) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (mark.kind === "mask") {
    if (!image || !image.complete || image.naturalWidth === 0) return true
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    return true
  }
  ctx.fillStyle = "#ffffff"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `700 ${Math.floor(canvas.height * 0.46)}px sans-serif`
  ctx.fillText(mark.text, canvas.width / 2, canvas.height / 2)
  return true
}

function writeColor(gl: GlContext, host: HTMLElement, slot: WebGLUniformLocation | null, color: string, fallback: string) {
  const channels = rgbOf(host, color, fallback)
  gl.uniform3f(slot, channels[0], channels[1], channels[2])
}

function drawMetal(
  gl: GlContext,
  gpu: MetalGpu,
  size: GlSize,
  host: HTMLElement,
  tuning: Tuning,
  time: number,
  image: HTMLImageElement | null,
  draw: () => void,
) {
  if (size.width === 0 || size.height === 0) return
  const signature = maskSignature(tuning.mark, image)
  if (gpu.signature !== signature) {
    try {
      if (!paintMask(gpu.paint, tuning.mark, image)) return
      upload(gl, gpu.texture, gpu.paint)
      gpu.signature = signature
    } catch {
      gpu.signature = ""
      return
    }
  }
  const [shade, body, highlight] = metalColors(getComputedStyle(host), tuning.colors)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, size.width, size.height)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.useProgram(gpu.program)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
  gl.uniform1i(gpu.tex, 0)
  gl.uniform1f(gpu.time, time)
  gl.uniform1f(gpu.speed, tuning.speed)
  gl.uniform1f(gpu.intensity, tuning.intensity)
  writeColor(gl, host, gpu.c0, shade, THEME_FALLBACK[0])
  writeColor(gl, host, gpu.c1, body, THEME_FALLBACK[1])
  writeColor(gl, host, gpu.c2, highlight, THEME_FALLBACK[2])
  draw()
}

export function LiquidMetalMark({
  text,
  src,
  speed = 1,
  intensity = 0.6,
  colors,
  className,
}: LiquidMetalMarkProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [blocked, setBlocked] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const mark = metalMark(text, src, failedSrc)
  const still = reduced || blocked
  const kind = mark.kind
  const word = mark.text
  const tuningRef = useRef<Tuning>({
    speed: metalSpeed(speed),
    intensity: metalIntensity(intensity),
    colors,
    mark,
  })

  useEffect(() => {
    tuningRef.current = {
      speed: metalSpeed(speed),
      intensity: metalIntensity(intensity),
      colors,
      mark: { kind, text: word },
    }
  }, [colors, intensity, kind, speed, word])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let gone = false
    let gpu: MetalGpu | null = null
    let handle: GlLoopHandle | null = null
    handle = mountGlLoop(canvas, {
      host,
      frame: ({ gl, time, size }) => {
        if (gone || !handle) return
        if (!gpu) {
          gpu = bootMetal(gl)
          if (!gpu) {
            gone = true
            handle.dispose()
            setBlocked(true)
            return
          }
        }
        const current = gpu
        drawMetal(gl, current, size, host, tuningRef.current, time, imgRef.current, () => {
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

  const showMask = still && mark.kind === "mask" && loadedSrc === src
  const gradient = stillGradient(colors, metalIntensity(intensity))

  return (
    <div
      ref={hostRef}
      data-slot="liquid-metal-mark"
      data-mark={mark.kind}
      data-state={still ? "still" : "live"}
      className={cn(
        "relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-background text-foreground",
        className,
      )}
    >
      {src ? (
        <img
          ref={imgRef}
          src={src}
          alt=""
          aria-hidden
          className={showMask ? "absolute inset-0 h-full w-full object-contain p-10" : "hidden"}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setFailedSrc(src)}
        />
      ) : null}
      {still ? (
        <div data-fallback="still" className="absolute inset-0 flex items-center justify-center">
          {mark.kind === "text" ? (
            <p
              className="bg-clip-text text-6xl font-semibold tracking-tight text-transparent"
              style={{ backgroundImage: gradient }}
            >
              {mark.text}
            </p>
          ) : null}
        </div>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
    </div>
  )
}
