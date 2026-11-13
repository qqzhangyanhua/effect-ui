"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { mountGlLoop, type GlContext, type GlLoopHandle, type GlSize } from "./gl/gl-loop"

/** original implementation. One picture reads as ASCII or as a halftone. */

/** 从空到井号，8 级。暗处取井号。对比为 1、明度为 0.5 时落在等号。 */
const ASCII_RAMP = " .:-=+*#"
const ASCII_LAST = ASCII_RAMP.length - 1

export type FilterMode = "ascii" | "halftone"

export interface AsciiHalftoneFilterProps {
  mode?: FilterMode
  size?: number
  intensity?: number
  src?: string
  className?: string
}

type Picture = "pending" | "procedural" | "photo"
type Rgb = readonly [number, number, number]

interface Tuning {
  mode: number
  size: number
  intensity: number
}

interface FilterGpu {
  program: WebGLProgram
  texture: WebGLTexture
  paint: HTMLCanvasElement
  mode: "none" | "procedural" | "photo"
  key: string
  loc: (name: string) => WebGLUniformLocation | null
}

const PAPER: Rgb = [244 / 255, 241 / 255, 234 / 255]
const INK: Rgb = [15 / 255, 23 / 255, 42 / 255]

export function filterMode(mode: string | undefined): FilterMode {
  return mode === "halftone" ? "halftone" : "ascii"
}

/** 格子边长，单位像素。非数字回到 8，并夹在 4 到 32。 */
export function filterSize(size: number) {
  if (!Number.isFinite(size)) return 8
  const rounded = Math.round(size)
  if (rounded < 4) return 4
  if (rounded > 32) return 32
  return rounded
}

export function filterIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.8
  if (intensity < 0) return 0
  if (intensity > 1) return 1
  return intensity
}

function unit(value: number) {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/** 对比把明度往 0.5 收。intensity 为 0 时整幅都是中间调。 */
export function filterContrast(luminance: number, intensity: number) {
  const luma = unit(luminance)
  return 0.5 + (luma - 0.5) * filterIntensity(intensity)
}

export function asciiGlyph(luminance: number, intensity: number) {
  const tone = filterContrast(luminance, intensity)
  const index = Math.min(ASCII_LAST, Math.max(0, Math.round((1 - tone) * ASCII_LAST)))
  return ASCII_RAMP[index] ?? " "
}

/** 暗处圆点更大。返回值是像素半径，格子边长先夹到合法像素。 */
export function halftoneRadius(luminance: number, intensity: number, size: number) {
  const tone = filterContrast(luminance, intensity)
  return (1 - tone) * (filterSize(size) / 2)
}

function filterPicture(src: string | undefined, loadedSrc: string | null, failedSrc: string | null): Picture {
  if (!src || failedSrc === src) return "procedural"
  if (loadedSrc === src) return "photo"
  return "pending"
}

function cssToken(style: CSSStyleDeclaration, name: string, fallback: string) {
  const value = style.getPropertyValue(name).trim()
  if (value.length === 0 || value.includes("var(")) return fallback
  return value
}

function paintStandIn(canvas: HTMLCanvasElement, style: CSSStyleDeclaration) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false
  const width = canvas.width
  const height = canvas.height
  ctx.fillStyle = cssToken(style, "--background", "#f4f1ea")
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = cssToken(style, "--foreground", "#0f172a")
  ctx.fillRect(width * 0.14, height * 0.18, width * 0.34, height * 0.56)
  ctx.fillStyle = cssToken(style, "--chart-2", "#0f766e")
  ctx.beginPath()
  ctx.arc(width * 0.72, height * 0.34, Math.min(width, height) * 0.16, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = cssToken(style, "--chart-4", "#b45309")
  ctx.fillRect(0, height * 0.74, width, height * 0.1)
  return true
}

let toneKey = ""
let tonePaper: Rgb = PAPER
let toneInk: Rgb = INK

function themeTone(style: CSSStyleDeclaration) {
  const paper = cssToken(style, "--background", "#f4f1ea")
  const ink = cssToken(style, "--foreground", "#0f172a")
  const key = `${paper}|${ink}`
  if (key === toneKey) return { paper: tonePaper, ink: toneInk }
  const canvas = document.createElement("canvas")
  canvas.width = 2
  canvas.height = 1
  const ctx = canvas.getContext("2d")
  if (!ctx) return { paper: PAPER, ink: INK }
  ctx.fillStyle = "#f4f1ea"
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = "#0f172a"
  ctx.fillStyle = ink
  ctx.fillRect(1, 0, 1, 1)
  try {
    const data = ctx.getImageData(0, 0, 2, 1).data
    const nextPaper = rgbAt(data, 0)
    const nextInk = rgbAt(data, 4)
    if (!nextPaper || !nextInk) return { paper: PAPER, ink: INK }
    tonePaper = nextPaper
    toneInk = nextInk
    toneKey = key
  } catch {
    return { paper: PAPER, ink: INK }
  }
  return { paper: tonePaper, ink: toneInk }
}

function rgbAt(data: Uint8ClampedArray, offset: number): Rgb | null {
  const red = data[offset]
  const green = data[offset + 1]
  const blue = data[offset + 2]
  if (red === undefined || green === undefined || blue === undefined) return null
  return [red / 255, green / 255, blue / 255]
}

function filterShaders(webgl2: boolean) {
  const vert = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 v;\nvoid main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 v;\nvoid main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 v;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 v;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const frag = `${head}
uniform sampler2D uTex;
uniform vec2 uResolution;
uniform float uCell;
uniform float uMode;
uniform float uIntensity;
uniform vec3 uPaper;
uniform vec3 uInk;
float glyph(float index, vec2 uv) {
  vec2 p = uv - 0.5;
  float ax = abs(p.x);
  float ay = abs(p.y);
  float bar = step(ay, 0.07);
  float bars = step(abs(ay - 0.16), 0.055);
  float stem = step(ax, 0.07);
  float stems = step(abs(ax - 0.14), 0.05);
  float dot1 = step(length(p), 0.09);
  float dot2 = step(length(vec2(p.x, ay - 0.16)), 0.07);
  float ink = 0.0;
  if (index > 0.5) {
    if (index < 1.5) ink = dot1;
    else if (index < 2.5) ink = dot2;
    else if (index < 3.5) ink = bar;
    else if (index < 4.5) ink = bars;
    else if (index < 5.5) ink = max(bar, stem);
    else if (index < 6.5) ink = max(max(bar, stem), step(abs(ax - ay), 0.07));
    else ink = max(bars, stems);
  }
  return ink;
}
void main() {
  vec2 px = v * uResolution;
  float cell = max(uCell, 1.0);
  vec2 local = fract(px / cell);
  vec2 center = (floor(px / cell) + 0.5) * cell / uResolution;
  vec2 uv = clamp(center, 0.0, 1.0);
  vec3 swatch = TEX(uTex, vec2(uv.x, 1.0 - uv.y)).rgb;
  float luma = dot(swatch, vec3(0.2126, 0.7152, 0.0722));
  float tone = clamp(0.5 + (luma - 0.5) * uIntensity, 0.0, 1.0);
  float mask = 0.0;
  if (uMode < 0.5) {
    float index = clamp(floor((1.0 - tone) * ${ASCII_LAST}.0 + 0.5), 0.0, ${ASCII_LAST}.0);
    mask = glyph(index, local);
  } else {
    mask = step(length(local - 0.5), (1.0 - tone) * 0.5);
  }
  WRITE = vec4(mix(uPaper, uInk, mask), 1.0);
}
`
  return { vert, frag }
}

function compileShader(gl: GlContext, type: number, source: string) {
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

function linkFilter(gl: GlContext) {
  const source = filterShaders("drawBuffers" in gl)
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

function bootFilter(gl: GlContext): FilterGpu | null {
  const program = linkFilter(gl)
  const texture = gl.createTexture()
  if (!program || !texture) {
    if (program) gl.deleteProgram(program)
    if (texture) gl.deleteTexture(texture)
    return null
  }
  const paint = document.createElement("canvas")
  paint.width = 256
  paint.height = 160
  return { program, texture, paint, mode: "none", key: "", loc: (name) => gl.getUniformLocation(program, name) }
}

function upload(gl: GlContext, texture: WebGLTexture, source: HTMLCanvasElement | HTMLImageElement) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
}

function paintKey(style: CSSStyleDeclaration) {
  return [
    style.getPropertyValue("--background"),
    style.getPropertyValue("--foreground"),
    style.getPropertyValue("--chart-2"),
    style.getPropertyValue("--chart-4"),
  ].join("|")
}

function drawFilter(
  gl: GlContext,
  gpu: FilterGpu,
  view: GlSize,
  host: HTMLElement,
  tuning: Tuning,
  picture: Picture,
  image: HTMLImageElement | null,
  draw: () => void,
) {
  const style = getComputedStyle(host)
  const photo = picture === "photo" && image !== null && image.complete && image.naturalWidth > 0
  const next = photo ? "photo" : "procedural"
  const key = photo ? "" : paintKey(style)
  if (gpu.mode !== next || gpu.key !== key) {
    try {
      if (photo && image) upload(gl, gpu.texture, image)
      else if (!paintStandIn(gpu.paint, style)) return
      else upload(gl, gpu.texture, gpu.paint)
      gpu.mode = next
      gpu.key = key
    } catch {
      gpu.mode = "none"
      gpu.key = ""
      return
    }
  }
  const tone = themeTone(style)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, view.width, view.height)
  gl.useProgram(gpu.program)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
  gl.uniform1i(gpu.loc("uTex"), 0)
  gl.uniform2f(gpu.loc("uResolution"), view.width, view.height)
  gl.uniform1f(gpu.loc("uCell"), tuning.size * view.dpr)
  gl.uniform1f(gpu.loc("uMode"), tuning.mode)
  gl.uniform1f(gpu.loc("uIntensity"), tuning.intensity)
  gl.uniform3f(gpu.loc("uPaper"), tone.paper[0], tone.paper[1], tone.paper[2])
  gl.uniform3f(gpu.loc("uInk"), tone.ink[0], tone.ink[1], tone.ink[2])
  draw()
}

function startFilter(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  tuningRef: { current: Tuning },
  pictureRef: { current: Picture },
  imageRef: { current: HTMLImageElement | null },
  block: () => void,
) {
  let gone = false
  let gpu: FilterGpu | null = null
  let handle: GlLoopHandle | null = null
  handle = mountGlLoop(canvas, {
    host,
    frame: ({ gl, size }) => {
      if (gone || !handle) return
      gpu = gpu ?? bootFilter(gl)
      if (!gpu || !handle) {
        gone = true
        handle?.dispose()
        block()
        return
      }
      const current = gpu
      drawFilter(gl, current, size, host, tuningRef.current, pictureRef.current, imageRef.current, () => {
        handle?.draw()
      })
    },
  })
  if (!handle) {
    block()
    return null
  }
  const loop = handle
  return {
    stop() {
      gone = true
      if (gpu) {
        loop.gl.deleteProgram(gpu.program)
        loop.gl.deleteTexture(gpu.texture)
      }
      loop.dispose()
    },
  }
}

function stillStyle(mode: FilterMode, size: number, picture: Picture): CSSProperties {
  const photo = picture === "photo"
  if (mode === "halftone") {
    const dot = Math.max(1, Math.round(size * 0.28))
    return {
      backgroundColor: photo ? "transparent" : "var(--background)",
      backgroundImage: `radial-gradient(circle, var(--foreground) ${dot}px, transparent ${dot + 1}px)`,
      backgroundSize: `${size}px ${size}px`,
    }
  }
  return {
    backgroundColor: photo ? "transparent" : "var(--background)",
    backgroundImage: photo
      ? "none"
      : "linear-gradient(165deg, var(--background), var(--primary) 48%, var(--chart-2) 76%, var(--chart-4))",
  }
}

function stillType() {
  const row = `${ASCII_RAMP} ${ASCII_RAMP}`
  return `${row}\n${row}\n${row}`
}

export function AsciiHalftoneFilter({
  mode = "ascii",
  size = 8,
  intensity = 0.8,
  src,
  className,
}: AsciiHalftoneFilterProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [blocked, setBlocked] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const look = filterMode(mode)
  const cell = filterSize(size)
  const contrast = filterIntensity(intensity)
  const picture = filterPicture(src, loadedSrc, failedSrc)
  const still = reduced || blocked
  const tuningRef = useRef<Tuning>({ mode: look === "halftone" ? 1 : 0, size: cell, intensity: contrast })
  const pictureRef = useRef<Picture>(picture)

  useEffect(() => {
    tuningRef.current = { mode: look === "halftone" ? 1 : 0, size: cell, intensity: contrast }
    pictureRef.current = picture
  }, [cell, contrast, look, picture])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const session = startFilter(canvas, host, tuningRef, pictureRef, imgRef, () => setBlocked(true))
    return () => session?.stop()
  }, [reduced])

  const showPhoto = still && picture === "photo"

  return (
    <div
      ref={hostRef}
      data-slot="ascii-halftone-filter"
      data-mode={look}
      data-size={cell}
      data-image={picture}
      data-state={still ? "still" : "live"}
      className={cn("relative h-64 w-full overflow-hidden rounded-xl bg-background text-foreground select-none", className)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件不能依赖 next/image
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
        <div data-fallback="still" aria-hidden className="absolute inset-0" style={stillStyle(look, cell, picture)}>
          {look === "ascii" ? (
            <pre className="m-0 p-4 font-mono text-[10px] leading-3 tracking-widest text-foreground/70">{stillType()}</pre>
          ) : null}
        </div>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
      <p className="pointer-events-none relative z-10 p-4 text-sm">North type</p>
    </div>
  )
}
