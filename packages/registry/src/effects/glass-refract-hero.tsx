"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { compileShader, mountGlLoop, parseCssColor, type GlContext, type GlFrame, type GlLoopHandle } from "./gl/gl-loop"

/** original implementation. A glass body refracts the backdrop behind it, with dispersion. */

export interface GlassRefractHeroProps {
  speed?: number
  intensity?: number
  size?: number
  src?: string
  className?: string
  children?: ReactNode
}

type Rgb = [number, number, number]

interface Tuning {
  speed: number
  intensity: number
  size: number
}

interface Compiled {
  program: WebGLProgram
  loc: (name: string) => WebGLUniformLocation | null
}

interface GlassSession {
  draw: (frame: GlFrame) => void
  dispose: () => void
}

export function clampGlassSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 1
  return Math.min(2.5, Math.max(0.25, speed))
}

export function clampGlassIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) return 0.45
  return Math.min(1, Math.max(0, intensity))
}

export function clampGlassSize(size: number): number {
  if (!Number.isFinite(size)) return 180
  return Math.min(320, Math.max(72, size))
}

/** 像素直径在这块 CSS 盒子上的 UV 半径。宽高为 0 时按 1。 */
export function glassRadiusUv(size: number, cssWidth: number, cssHeight: number): { x: number; y: number } {
  const diameter = clampGlassSize(size)
  const width = cssWidth > 0 && Number.isFinite(cssWidth) ? cssWidth : 1
  const height = cssHeight > 0 && Number.isFinite(cssHeight) ? cssHeight : 1
  return { x: diameter / 2 / width, y: diameter / 2 / height }
}

/** 相对画面中心的 UV 偏移。time 为秒，speed 先夹到 0.25–2.5。 */
export function glassDrift(time: number, speed: number): { x: number; y: number } {
  const seconds = Number.isFinite(time) ? time : 0
  const angle = seconds * clampGlassSpeed(speed)
  return { x: Math.sin(angle) * 0.08, y: Math.cos(angle) * 0.05 }
}

/** 镜片边缘的折射位移，单位 UV。 */
export function glassBend(intensity: number): number {
  return clampGlassIntensity(intensity) * 0.125
}

/** 红蓝通道分开的距离，单位 UV。 */
export function glassShift(intensity: number): number {
  return clampGlassIntensity(intensity) * 0.03125
}

/** 空地址或加载失败时留在程序化后景。 */
export function glassBackdrop(src: string | undefined, failed: boolean): "procedural" | "image" {
  if (failed) return "procedural"
  if (typeof src !== "string" || src.trim().length === 0) return "procedural"
  return "image"
}

const colorCache = new Map<string, Rgb>()

function themeChannel(host: HTMLElement, style: CSSStyleDeclaration, token: string, fallback: Rgb): Rgb {
  const raw = style.getPropertyValue(token).trim()
  if (!raw) return fallback
  const hit = colorCache.get(raw)
  if (hit) return hit
  const resolved = parseCssColor(host, raw) ?? fallback
  colorCache.set(raw, resolved)
  return resolved
}

function backdropColor(host: HTMLElement, style: CSSStyleDeclaration): Rgb {
  if (style.getPropertyValue("--background").trim()) {
    return themeChannel(host, style, "--background", [0.96, 0.95, 0.93])
  }
  return parseCssColor(host, style.backgroundColor) ?? [0.96, 0.95, 0.93]
}

function glassVertex(webgl2: boolean) {
  const head = webgl2 ? "#version 300 es\nin vec2 a;\nout vec2 v;\n" : "attribute vec2 a;\nvarying vec2 v;\n"
  return `${head}void main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}`
}

function glassFragment(webgl2: boolean) {
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 v;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 v;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  return `${head}
uniform vec2 uCenter;
uniform vec2 uRadius;
uniform float uBend;
uniform float uShift;
uniform float uImage;
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uWarm;
uniform sampler2D uTex;
vec3 field(vec2 uv) {
  vec2 p = clamp(uv, 0.0, 1.0);
  float bands = 0.5 + 0.5 * sin(p.x * 10.0 + p.y * 3.0);
  float bloom = smoothstep(0.72, 0.0, length(p - vec2(0.28, 0.7)));
  vec3 color = mix(uBg, uInk, bands * 0.62);
  return mix(color, uWarm, bloom * 0.7);
}
vec3 sampleAt(vec2 uv) {
  vec2 clamped = clamp(uv, 0.0, 1.0);
  vec3 drawn = field(clamped);
  vec2 tex = vec2(clamped.x, 1.0 - clamped.y);
  return mix(drawn, TEX(uTex, tex).rgb, clamp(uImage, 0.0, 1.0));
}
void main() {
  vec2 radius = max(uRadius, vec2(0.0008));
  vec2 local = (v - uCenter) / radius;
  float dist = length(local);
  float mask = 1.0 - smoothstep(0.96, 1.04, dist);
  vec2 dir = dist > 0.0001 ? local / dist : vec2(0.0);
  float rim = clamp(dist, 0.0, 1.0);
  vec2 bend = dir * rim * uBend;
  float split = rim * uShift;
  vec3 bent;
  bent.r = sampleAt(v - bend - dir * split).r;
  bent.g = sampleAt(v - bend).g;
  bent.b = sampleAt(v - bend + dir * split).b;
  float edge = smoothstep(0.62, 1.0, dist) * mask;
  bent = mix(bent, vec3(1.0), edge * 0.28);
  WRITE = vec4(mix(sampleAt(v), bent, mask), 1.0);
}`
}

function compile(gl: GlContext, vertex: string, fragment: string): Compiled | null {
  const program = gl.createProgram()
  if (!program) return null
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertex)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    gl.deleteProgram(program)
    return null
  }
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, "a")
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return { program, loc: (name) => gl.getUniformLocation(program, name) }
}

function makeTexture(gl: GlContext): WebGLTexture | null {
  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  gl.bindTexture(gl.TEXTURE_2D, null)
  return texture
}

function uploadImage(gl: GlContext, texture: WebGLTexture, image: HTMLImageElement): boolean {
  if (image.naturalWidth <= 0) return false
  try {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    return true
  } catch {
    return false
  }
}

function startSession(
  loop: GlLoopHandle,
  host: HTMLElement,
  tuning: RefObject<Tuning>,
  imageRef: RefObject<HTMLImageElement | null>,
): GlassSession | null {
  const gl = loop.gl
  const webgl2 = typeof (gl as WebGL2RenderingContext).drawBuffers === "function"
  const compiled = compile(gl, glassVertex(webgl2), glassFragment(webgl2))
  const texture = makeTexture(gl)
  if (!compiled || !texture) {
    if (compiled) gl.deleteProgram(compiled.program)
    if (texture) gl.deleteTexture(texture)
    return null
  }
  let uploaded: HTMLImageElement | null = null
  let usable = false
  return {
    draw(frame) {
      const current = tuning.current
      const speed = clampGlassSpeed(current?.speed ?? 1)
      const intensity = clampGlassIntensity(current?.intensity ?? 0.45)
      const size = clampGlassSize(current?.size ?? 180)
      const image = imageRef.current
      if (image !== uploaded) {
        uploaded = image
        usable = image ? uploadImage(gl, texture, image) : false
      }
      const drift = glassDrift(frame.time, speed)
      const radius = glassRadiusUv(size, frame.size.cssWidth, frame.size.cssHeight)
      const style = getComputedStyle(host)
      const bg = backdropColor(host, style)
      const ink = themeChannel(host, style, "--primary", [0.28, 0.33, 0.62])
      const warm = themeChannel(host, style, "--chart-2", [0.55, 0.36, 0.18])
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, frame.size.width, frame.size.height)
      gl.disable(gl.BLEND)
      gl.useProgram(compiled.program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(compiled.loc("uTex"), 0)
      gl.uniform2f(compiled.loc("uCenter"), 0.5 + drift.x, 0.5 + drift.y)
      gl.uniform2f(compiled.loc("uRadius"), radius.x, radius.y)
      gl.uniform1f(compiled.loc("uBend"), glassBend(intensity))
      gl.uniform1f(compiled.loc("uShift"), glassShift(intensity))
      gl.uniform1f(compiled.loc("uImage"), usable ? 1 : 0)
      gl.uniform3f(compiled.loc("uBg"), bg[0], bg[1], bg[2])
      gl.uniform3f(compiled.loc("uInk"), ink[0], ink[1], ink[2])
      gl.uniform3f(compiled.loc("uWarm"), warm[0], warm[1], warm[2])
      loop.draw()
    },
    dispose() {
      gl.deleteProgram(compiled.program)
      gl.deleteTexture(texture)
    },
  }
}

function cssUrl(src: string) {
  return `url("${src.replace(/["'\\()\n\r]/g, "")}")`
}

function stillStyle(backdrop: "procedural" | "image", src: string | undefined): CSSProperties {
  if (backdrop === "image" && src?.trim()) {
    return {
      backgroundColor: "var(--background)",
      backgroundImage: cssUrl(src.trim()),
      backgroundPosition: "center",
      backgroundSize: "cover",
    }
  }
  return {
    backgroundColor: "var(--background)",
    backgroundImage: [
      "radial-gradient(42% 48% at 28% 70%, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
      "radial-gradient(34% 40% at 74% 28%, color-mix(in oklab, var(--chart-2) 50%, transparent), transparent 72%)",
      "linear-gradient(165deg, var(--background), var(--muted))",
    ].join(", "),
  }
}

function bodyStyle(size: number): CSSProperties {
  const px = `${clampGlassSize(size)}px`
  return {
    position: "absolute",
    left: "50%",
    top: "46%",
    width: px,
    height: px,
    transform: "translate(-50%, -50%)",
    borderRadius: "9999px",
    background:
      "radial-gradient(circle at 34% 30%, color-mix(in oklab, white 72%, transparent), color-mix(in oklab, var(--primary) 16%, transparent) 46%, transparent 70%)",
    boxShadow:
      "inset 0 0 0 1px color-mix(in oklab, white 70%, transparent), inset 0 0 28px color-mix(in oklab, var(--primary) 22%, transparent)",
  }
}

function GlassRefractHero({
  speed = 1,
  intensity = 0.45,
  size = 180,
  src,
  className,
  children,
}: GlassRefractHeroProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const tuningRef = useRef<Tuning>({ speed, intensity, size })
  const address = src?.trim() ?? ""
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [tracked, setTracked] = useState(address)
  const [blocked, setBlocked] = useState(false)
  if (address !== tracked) {
    setTracked(address)
    setLoadedSrc(null)
  }
  const backdrop = glassBackdrop(address, loadedSrc !== address)
  const still = reduced || blocked

  useEffect(() => {
    tuningRef.current = { speed, intensity, size }
  }, [speed, intensity, size])

  useEffect(() => {
    imageRef.current = null
    if (glassBackdrop(address, false) !== "image") return
    let gone = false
    const image = new Image()
    if (/^https?:\/\//i.test(address)) image.crossOrigin = "anonymous"
    image.onload = () => {
      if (gone) return
      imageRef.current = image
      setLoadedSrc(address)
    }
    image.onerror = () => {
      if (gone) return
      imageRef.current = null
      setLoadedSrc(null)
    }
    image.src = address
    return () => {
      gone = true
    }
  }, [address])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let gone = false
    let session: GlassSession | null = null
    let loop: GlLoopHandle | null = null
    loop = mountGlLoop(canvas, {
      host,
      frame: (frame) => {
        if (gone || !loop) return
        if (!session) {
          session = startSession(loop, host, tuningRef, imageRef)
          if (!session) {
            gone = true
            loop.dispose()
            setBlocked(true)
            return
          }
        }
        session.draw(frame)
      },
    })
    if (!loop) {
      setBlocked(true)
      return
    }
    return () => {
      gone = true
      session?.dispose()
      loop?.dispose()
    }
  }, [reduced])

  return (
    <div
      ref={hostRef}
      data-slot="glass-refract-hero"
      data-state={still ? "still" : "live"}
      data-backdrop={backdrop}
      className={cn("relative h-96 w-full overflow-hidden rounded-xl bg-background text-foreground", className)}
    >
      {still ? (
        <div data-fallback="still" aria-hidden className="pointer-events-none absolute inset-0" style={stillStyle(backdrop, src)}>
          <div data-glass="body" style={bodyStyle(size)} />
        </div>
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
      <div className="relative z-10 p-6">{children}</div>
    </div>
  )
}

export { GlassRefractHero }
