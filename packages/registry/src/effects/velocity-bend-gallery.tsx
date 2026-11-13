"use client"

import { useEffect, useRef, useState, type UIEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { mountGlLoop, type GlContext, type GlLoopHandle, type GlSize } from "./gl/gl-loop"

/** original implementation. Cards bend with this gallery's own scroll speed. */

const FULL_PX_PER_MS = 2
const HALF_LIFE_MS = 80
const DEFAULT_SPEED = 1
const DEFAULT_INTENSITY = 0.6
const DEFAULT_GAP = 16

export interface GalleryBend {
  bend: number
  fringe: number
}

export interface VelocityBendGalleryProps {
  speed?: number
  intensity?: number
  gap?: number
  images?: readonly string[]
  className?: string
}

const TITLES = ["North aisle", "South aisle", "East court", "West stair"] as const
const TONES = ["--primary", "--chart-2", "--chart-4", "--primary"] as const

interface CardModel {
  title: string
  tone: string
  src?: string
}

interface StripCard extends CardModel {
  picture: Picture
}

type Picture = "pending" | "procedural" | "photo"

interface Tuning {
  rate: number
  amount: number
  spacing: number
  still: boolean
}

interface GalleryGpu {
  program: WebGLProgram
  texture: WebGLTexture
  paint: HTMLCanvasElement
  key: string
  tex: WebGLUniformLocation | null
  scroll: WebGLUniformLocation | null
  span: WebGLUniformLocation | null
  bend: WebGLUniformLocation | null
  fringe: WebGLUniformLocation | null
}

function gallerySpeed(speed: number) {
  if (!Number.isFinite(speed)) return DEFAULT_SPEED
  if (speed < 0.25) return 0.25
  if (speed > 2.5) return 2.5
  return speed
}

function galleryIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0
  if (intensity < 0) return 0
  if (intensity > 1) return 1
  return intensity
}

function galleryGap(gap: number) {
  if (!Number.isFinite(gap)) return DEFAULT_GAP
  if (gap < 0) return 0
  if (gap > 48) return 48
  return gap
}

/** 2 px/ms at speed 1 and intensity 1 is a full bend. Fringe is half of |bend|. */
export function galleryBend(deltaPx: number, deltaMs: number, speed: number, intensity: number): GalleryBend {
  const amount = galleryIntensity(intensity)
  if (!Number.isFinite(deltaPx) || !Number.isFinite(deltaMs) || deltaMs <= 0 || amount === 0) {
    return { bend: 0, fringe: 0 }
  }
  const scaled = (deltaPx / deltaMs) * gallerySpeed(speed)
  const bend = Math.max(-1, Math.min(1, scaled / FULL_PX_PER_MS)) * amount
  return { bend, fringe: Math.abs(bend) * 0.5 }
}

/** speed 1 halves the remaining bend every 80ms. */
export function settleBend(bend: number, dtMs: number, speed: number): number {
  if (!Number.isFinite(bend) || bend === 0) return 0
  if (!Number.isFinite(dtMs) || dtMs <= 0) return bend
  const next = bend * 0.5 ** ((dtMs * gallerySpeed(speed)) / HALF_LIFE_MS)
  if (Math.abs(next) < 0.001) return 0
  return next
}

function cardsOf(images: readonly string[] | undefined): CardModel[] {
  if (!images || images.length === 0) {
    return TITLES.map((title, index) => ({ title, tone: TONES[index] ?? "--primary" }))
  }
  return images.map((src, index) => ({
    title: TITLES[index % TITLES.length] ?? "North aisle",
    tone: TONES[index % TONES.length] ?? "--primary",
    src,
  }))
}

function cardPicture(src: string | undefined, loaded: ReadonlySet<string>, failed: ReadonlySet<string>): Picture {
  if (!src || failed.has(src)) return "procedural"
  if (loaded.has(src)) return "photo"
  return "pending"
}

function galleryPicture(cards: readonly CardModel[], loaded: ReadonlySet<string>, failed: ReadonlySet<string>): Picture {
  let photo = false
  let pending = false
  for (const card of cards) {
    const picture = cardPicture(card.src, loaded, failed)
    if (picture === "pending") pending = true
    if (picture === "photo") photo = true
  }
  if (pending) return "pending"
  if (photo) return "photo"
  return "procedural"
}

function token(style: CSSStyleDeclaration, name: string, fallback: string) {
  const value = style.getPropertyValue(name).trim()
  if (value.length === 0 || value.includes("var(")) return fallback
  return value
}

function remember(set: ReadonlySet<string>, value: string) {
  if (set.has(value)) return set
  const next = new Set(set)
  next.add(value)
  return next
}

function galleryShaders(webgl2: boolean) {
  const vert = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 vUv;\nvoid main(){vUv=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const head = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 vUv;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 vUv;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const frag = `${head}
uniform sampler2D uTex;
uniform float uScroll;
uniform float uSpan;
uniform float uBend;
uniform float uFringe;
void main() {
  float span = clamp(uSpan, 0.05, 1.0);
  float v = clamp(uScroll * (1.0 - span) + vUv.y * span, 0.0, 1.0);
  float y = vUv.y - 0.5;
  float x = clamp(vUv.x + uBend * y * y * 0.35 - uBend * 0.08, 0.0, 1.0);
  vec2 uv = vec2(x, v);
  float shift = uFringe * 0.04;
  float r = TEX(uTex, vec2(clamp(uv.x + shift, 0.0, 1.0), uv.y)).r;
  float g = TEX(uTex, uv).g;
  float b = TEX(uTex, vec2(clamp(uv.x - shift, 0.0, 1.0), uv.y)).b;
  WRITE = vec4(r, g, b, TEX(uTex, uv).a);
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

function linkGallery(gl: GlContext) {
  const source = galleryShaders("drawBuffers" in gl)
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

function bootGallery(gl: GlContext): GalleryGpu | null {
  const program = linkGallery(gl)
  const texture = gl.createTexture()
  if (!program || !texture) {
    if (program) gl.deleteProgram(program)
    if (texture) gl.deleteTexture(texture)
    return null
  }
  const paint = document.createElement("canvas")
  paint.width = 256
  paint.height = 640
  return {
    program,
    texture,
    paint,
    key: "",
    tex: gl.getUniformLocation(program, "uTex"),
    scroll: gl.getUniformLocation(program, "uScroll"),
    span: gl.getUniformLocation(program, "uSpan"),
    bend: gl.getUniformLocation(program, "uBend"),
    fringe: gl.getUniformLocation(program, "uFringe"),
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

function loadedPhoto(host: HTMLElement, src: string) {
  for (const node of host.querySelectorAll("img")) {
    if (!(node instanceof HTMLImageElement)) continue
    if (node.getAttribute("src") !== src) continue
    if (node.complete && node.naturalWidth > 0) return node
  }
  return null
}

function paintStrip(canvas: HTMLCanvasElement, host: HTMLElement, cards: readonly StripCard[], gap: number) {
  const ctx = canvas.getContext("2d")
  if (!ctx || cards.length === 0) return false
  const width = 256
  const cardH = 160
  const raw = cards.length * cardH + (cards.length - 1) * gap
  const height = Math.min(2048, Math.max(1, Math.round(raw)))
  const scale = raw > 0 ? height / raw : 1
  canvas.width = width
  canvas.height = height
  const style = getComputedStyle(host)
  const background = token(style, "--background", "#f4f1ea")
  const foreground = token(style, "--foreground", "#1c1917")
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  let y = 0
  const drawnH = cardH * scale
  const drawnGap = gap * scale
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index]
    if (!card) continue
    ctx.fillStyle = token(style, card.tone, index % 2 === 0 ? "#334155" : "#0f766e")
    ctx.fillRect(0, y, width, drawnH)
    const photo = card.picture === "photo" && card.src ? loadedPhoto(host, card.src) : null
    if (photo) {
      try {
        ctx.drawImage(photo, 0, y, width, drawnH)
      } catch {
        ctx.fillStyle = background
        ctx.fillRect(width * 0.12, y + drawnH * 0.18, width * 0.28, drawnH * 0.46)
      }
    }
    ctx.fillStyle = foreground
    ctx.font = "16px sans-serif"
    ctx.fillText(card.title, 16, y + drawnH * 0.82)
    y += drawnH + drawnGap
  }
  return true
}

function scrollSlice(el: HTMLElement) {
  const total = el.scrollHeight
  const view = el.clientHeight
  const span = total > 0 ? Math.min(1, Math.max(0.05, view / total)) : 1
  const max = Math.max(0, total - view)
  const scroll = max <= 0 ? 0 : el.scrollTop / max
  return { scroll, span }
}

function drawGallery(
  gl: GlContext,
  gpu: GalleryGpu,
  size: GlSize,
  host: HTMLElement,
  scroller: HTMLElement,
  cards: readonly StripCard[],
  gap: number,
  bend: number,
  fringe: number,
  draw: () => void,
) {
  const key = `${gap}|${cards.map((card) => `${card.picture}:${card.src ?? ""}:${card.title}`).join("|")}`
  if (gpu.key !== key) {
    try {
      if (!paintStrip(gpu.paint, host, cards, gap)) return
      upload(gl, gpu.texture, gpu.paint)
      gpu.key = key
    } catch {
      gpu.key = ""
      return
    }
  }
  const slice = scrollSlice(scroller)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, size.width, size.height)
  gl.useProgram(gpu.program)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, gpu.texture)
  gl.uniform1i(gpu.tex, 0)
  gl.uniform1f(gpu.scroll, slice.scroll)
  gl.uniform1f(gpu.span, slice.span)
  gl.uniform1f(gpu.bend, bend)
  gl.uniform1f(gpu.fringe, fringe)
  draw()
}

export function VelocityBendGallery({
  speed = DEFAULT_SPEED,
  intensity = DEFAULT_INTENSITY,
  gap = DEFAULT_GAP,
  images,
  className,
}: VelocityBendGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bendRef = useRef(0)
  const fringeRef = useRef(0)
  const lastTop = useRef(0)
  const lastTime = useRef(0)
  const [blocked, setBlocked] = useState(false)
  const [scrollPx, setScrollPx] = useState(0)
  const [bendText, setBendText] = useState("0")
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set())
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set())
  const cards = cardsOf(images)
  const spacing = galleryGap(gap)
  const picture = galleryPicture(cards, loaded, failed)
  const still = reduced || blocked
  const tuningRef = useRef<Tuning>({ rate: DEFAULT_SPEED, amount: DEFAULT_INTENSITY, spacing: DEFAULT_GAP, still: false })
  const cardsRef = useRef<StripCard[]>([])

  useEffect(() => {
    const next = cardsOf(images)
    tuningRef.current = { rate: gallerySpeed(speed), amount: galleryIntensity(intensity), spacing, still }
    cardsRef.current = next.map((card) => ({ ...card, picture: cardPicture(card.src, loaded, failed) }))
  }, [failed, images, intensity, loaded, spacing, speed, still])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    const scroller = scrollerRef.current
    if (!canvas || !host || !scroller) return
    let gone = false
    let gpu: GalleryGpu | null = null
    let handle: GlLoopHandle | null = null
    handle = mountGlLoop(canvas, {
      host,
      frame: ({ gl, dt, size }) => {
        if (gone || !handle) return
        if (!gpu) {
          gpu = bootGallery(gl)
          if (!gpu) {
            gone = true
            handle.dispose()
            setBlocked(true)
            return
          }
        }
        const tuning = tuningRef.current
        if (tuning.still) return
        drawGallery(gl, gpu, size, host, scroller, cardsRef.current, tuning.spacing, bendRef.current, fringeRef.current, () => {
          handle?.draw()
        })
        const next = settleBend(bendRef.current, dt * 1000, tuning.rate)
        bendRef.current = next
        fringeRef.current = Math.abs(next) * 0.5
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

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop
    setScrollPx(top)
    if (tuningRef.current.still) {
      bendRef.current = 0
      fringeRef.current = 0
      lastTop.current = top
      lastTime.current = 0
      return
    }
    const now = performance.now()
    const deltaMs = lastTime.current === 0 ? 0 : now - lastTime.current
    const next = galleryBend(top - lastTop.current, deltaMs, tuningRef.current.rate, tuningRef.current.amount)
    lastTop.current = top
    lastTime.current = now
    bendRef.current = next.bend
    fringeRef.current = next.fringe
    setBendText(String(next.bend))
  }

  return (
    <div
      ref={hostRef}
      data-slot="velocity-bend-gallery"
      data-bend={still ? "0" : bendText}
      data-scroll={String(Math.round(scrollPx))}
      data-gap={String(spacing)}
      data-image={picture}
      data-state={still ? "still" : "live"}
      className={cn("relative h-80 w-full overflow-hidden rounded-xl bg-background text-foreground", className)}
    >
      <div
        ref={scrollerRef}
        data-scroller="velocity-bend-gallery"
        data-fallback={still ? "still" : undefined}
        className="absolute inset-0 overflow-y-auto"
        onScroll={onScroll}
      >
        <div className="flex flex-col px-3 py-3" data-track="velocity-bend-gallery" style={{ gap: `${spacing}px` }}>
          {cards.map((card, index) => {
            const src = card.src
            const shot = cardPicture(src, loaded, failed)
            const showPhoto = still && shot === "photo"
            return (
              <article
                key={`${card.title}-${src ?? "stand-in"}-${index}`}
                data-card={index}
                data-image={shot}
                className={cn("relative min-h-36 shrink-0 overflow-hidden rounded-lg border border-border p-4", !still && "opacity-0")}
                style={showPhoto ? undefined : { backgroundImage: `linear-gradient(165deg, var(--background), var(${card.tone}))` }}
              >
                {src ? (
                  <img
                    src={src}
                    alt=""
                    className={showPhoto ? "absolute inset-0 h-full w-full object-cover" : "hidden"}
                    onLoad={() => setLoaded((prev) => remember(prev, src))}
                    onError={() => setFailed((prev) => remember(prev, src))}
                  />
                ) : null}
                <p className="relative text-sm font-medium">{card.title}</p>
              </article>
            )
          })}
        </div>
      </div>
      {still ? null : <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />}
    </div>
  )
}
