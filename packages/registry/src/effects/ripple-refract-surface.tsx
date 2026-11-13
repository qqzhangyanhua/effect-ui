"use client"

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { compileShader, mountGlLoop, parseCssColor, type GlContext, type GlFrame, type GlLoopHandle } from "./gl/gl-loop"

/** original implementation. Pointer move and click ripple a picture or a gradient. */

export interface RippleRefractSurfaceProps {
  speed?: number
  intensity?: number
  color?: string
  src?: string
  className?: string
  children?: ReactNode
}

const GRID = 64
const FALLBACK_TINT: [number, number, number] = [0.23, 0.39, 0.62]

interface RippleDrop {
  x: number
  y: number
  kind: "move" | "click"
}

interface Field {
  current: Float32Array
  previous: Float32Array
}

interface Tuning {
  speed: number
  intensity: number
  color: string | undefined
}

interface PictureState {
  image: HTMLImageElement | null
  generation: number
}

interface Compiled {
  program: WebGLProgram
  loc: (name: string) => WebGLUniformLocation | null
}

interface RippleSession {
  draw: (frame: GlFrame) => void
  dispose: () => void
}

function clampSpeed(speed: number) {
  if (!Number.isFinite(speed)) return 1
  return Math.min(2.5, Math.max(0.25, speed))
}

function clampIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.5
  return Math.min(1, Math.max(0, intensity))
}

/** 邻域和的一半减去上一帧，再乘 1 - speed/16。过小归零，超出 ±2 截断。 */
export function advanceRipple(left: number, right: number, up: number, down: number, previous: number, speed: number) {
  const next = ((left + right + up + down) / 2 - previous) * (1 - clampSpeed(speed) / 16)
  if (Math.abs(next) < 0.0001) return 0
  return Math.min(2, Math.max(-2, next))
}

/** 点击落 0.5 倍强度，移动落 0.25 倍。强度限制在 0 到 1。 */
export function rippleDrop(intensity: number, kind: "move" | "click"): number {
  const gain = Number.isFinite(intensity) ? Math.min(1, Math.max(0, intensity)) : 0
  return gain * (kind === "click" ? 0.5 : 0.25)
}

/** 每帧推进次数。至少 1，按速度四舍五入。 */
export function rippleSubsteps(speed: number): number {
  return Math.max(1, Math.round(clampSpeed(speed)))
}

function colorReader(host: HTMLElement) {
  let key = "\0"
  let tint = FALLBACK_TINT
  return (color: string | undefined) => {
    const given = color?.trim() ?? ""
    const raw = given || getComputedStyle(host).getPropertyValue("--primary").trim()
    if (raw === key) return tint
    key = raw
    tint = parseCssColor(host, raw) ?? FALLBACK_TINT
    return tint
  }
}

function stillPaint(color: string | undefined) {
  const tint = color?.trim() || "var(--primary)"
  return [
    `radial-gradient(48% 55% at 32% 62%, color-mix(in oklab, ${tint} 62%, transparent), transparent 72%)`,
    `linear-gradient(165deg, color-mix(in oklab, ${tint} 22%, var(--background)), var(--background) 70%)`,
  ].join(",")
}

function gradientPixels(tint: [number, number, number]) {
  const data = new Uint8Array(GRID * GRID * 4)
  for (let index = 0; index < GRID * GRID; index += 1) {
    const u = (index % GRID) / (GRID - 1)
    const v = Math.floor(index / GRID) / (GRID - 1)
    const glow = Math.max(0, 1 - Math.hypot(u - 0.32, v - 0.7) * 1.35)
    const shore = v * 0.18
    const offset = index * 4
    data[offset] = Math.round(Math.min(1, 0.08 + tint[0] * (0.35 + glow * 0.55) + shore) * 255)
    data[offset + 1] = Math.round(Math.min(1, 0.16 + tint[1] * (0.3 + glow * 0.4) + shore) * 255)
    data[offset + 2] = Math.round(Math.min(1, 0.22 + tint[2] * (0.28 + glow * 0.35) + (1 - v) * 0.12) * 255)
    data[offset + 3] = 255
  }
  return data
}

function sample(field: Float32Array, x: number, y: number) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) return 0
  return field[y * GRID + x] ?? 0
}

function stepOnce(field: Field, speed: number) {
  const read = field.current
  const write = field.previous
  for (let index = 0; index < read.length; index += 1) {
    const x = index % GRID
    const y = Math.floor(index / GRID)
    const here = write[index] ?? 0
    write[index] = advanceRipple(sample(read, x - 1, y), sample(read, x + 1, y), sample(read, x, y + 1), sample(read, x, y - 1), here, speed)
  }
  field.current = write
  field.previous = read
}

function disturb(field: Float32Array, drop: RippleDrop, intensity: number) {
  const amount = rippleDrop(intensity, drop.kind)
  if (amount === 0) return
  const x = Math.min(GRID - 1, Math.max(0, Math.round(drop.x * (GRID - 1))))
  const y = Math.min(GRID - 1, Math.max(0, Math.round(drop.y * (GRID - 1))))
  const index = y * GRID + x
  field[index] = Math.min(2, (field[index] ?? 0) + amount)
}

function packHeight(field: Float32Array, into: Uint8Array) {
  for (let index = 0; index < field.length; index += 1) {
    const encoded = Math.min(1, Math.max(0, (field[index] ?? 0) * 0.25 + 0.5))
    const offset = index * 4
    into[offset] = Math.round(encoded * 255)
    into[offset + 1] = 0
    into[offset + 2] = 0
    into[offset + 3] = 255
  }
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

function shaderPair(webgl2: boolean) {
  const vertex = webgl2
    ? "#version 300 es\nin vec2 a;\nout vec2 v;\nvoid main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
    : "attribute vec2 a;\nvarying vec2 v;\nvoid main(){v=a*0.5+0.5;gl_Position=vec4(a,0.0,1.0);}"
  const prefix = webgl2
    ? "#version 300 es\nprecision highp float;\nin vec2 v;\nout vec4 frag;\n#define TEX texture\n#define WRITE frag\n"
    : "precision mediump float;\nvarying vec2 v;\n#define TEX texture2D\n#define WRITE gl_FragColor\n"
  const body =
    "uniform sampler2D uHeight;uniform sampler2D uPicture;uniform vec2 uTexel;uniform float uStrength;uniform vec3 uTint;" +
    "float H(vec2 uv){return (TEX(uHeight,uv).r-0.5)*4.0;}" +
    "void main(){float l=H(v-vec2(uTexel.x,0.0));float r=H(v+vec2(uTexel.x,0.0));float b=H(v-vec2(0.0,uTexel.y));float t=H(v+vec2(0.0,uTexel.y));" +
    "vec2 uv=clamp(v+vec2(r-l,t-b)*uStrength,vec2(0.0),vec2(1.0));vec3 base=TEX(uPicture,uv).rgb;float crest=clamp(H(v),-1.0,1.0);" +
    "WRITE=vec4(mix(base,uTint,0.08+crest*0.22),1.0);}"
  return { vertex, fragment: prefix + body }
}

function makeTexture(gl: GlContext) {
  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return texture
}

function uploadBytes(gl: GlContext, texture: WebGLTexture, pixels: Uint8Array, size: number, fresh: boolean) {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  if (fresh) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
}

function uploadImage(gl: GlContext, texture: WebGLTexture, image: HTMLImageElement) {
  try {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    return true
  } catch {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
    return false
  }
}

function sameTint(left: [number, number, number], right: [number, number, number]) {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2]
}

function startSession(
  loop: GlLoopHandle,
  host: HTMLElement,
  tuningRef: { readonly current: Tuning },
  queueRef: { readonly current: RippleDrop[] },
  pictureRef: { readonly current: PictureState },
): RippleSession | null {
  const gl = loop.gl
  const webgl2 = typeof (gl as WebGL2RenderingContext).drawBuffers === "function"
  const shaders = shaderPair(webgl2)
  const program = compile(gl, shaders.vertex, shaders.fragment)
  const heightTex = makeTexture(gl)
  const pictureTex = makeTexture(gl)
  if (!program || !heightTex || !pictureTex) {
    if (program) gl.deleteProgram(program.program)
    if (heightTex) gl.deleteTexture(heightTex)
    if (pictureTex) gl.deleteTexture(pictureTex)
    return null
  }
  const field: Field = { current: new Float32Array(GRID * GRID), previous: new Float32Array(GRID * GRID) }
  const packed = new Uint8Array(GRID * GRID * 4)
  const readTint = colorReader(host)
  let heightReady = false
  let seenPicture = -1
  let gradientTint: [number, number, number] | null = null
  const texel = 1 / GRID

  return {
    draw(frame) {
      const speed = clampSpeed(tuningRef.current.speed)
      const intensity = clampIntensity(tuningRef.current.intensity)
      const queued = queueRef.current.splice(0, queueRef.current.length)
      for (const drop of queued) disturb(field.current, drop, intensity)
      const times = rippleSubsteps(speed)
      for (let step = 0; step < times; step += 1) stepOnce(field, speed)
      packHeight(field.current, packed)
      uploadBytes(gl, heightTex, packed, GRID, !heightReady)
      heightReady = true
      const tint = readTint(tuningRef.current.color)
      const picture = pictureRef.current
      const pictureChanged = picture.generation !== seenPicture
      const tintChanged = gradientTint === null || !sameTint(gradientTint, tint)
      if (pictureChanged || (picture.image === null && tintChanged)) {
        const uploaded = picture.image ? uploadImage(gl, pictureTex, picture.image) : false
        if (!uploaded) {
          uploadBytes(gl, pictureTex, gradientPixels(tint), GRID, true)
          gradientTint = tint
        }
        seenPicture = picture.generation
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, frame.size.width, frame.size.height)
      gl.useProgram(program.program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, heightTex)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, pictureTex)
      gl.uniform1i(program.loc("uHeight"), 0)
      gl.uniform1i(program.loc("uPicture"), 1)
      gl.uniform2f(program.loc("uTexel"), texel, texel)
      gl.uniform1f(program.loc("uStrength"), intensity * 0.16)
      gl.uniform3f(program.loc("uTint"), tint[0], tint[1], tint[2])
      loop.draw()
    },
    dispose() {
      gl.deleteProgram(program.program)
      gl.deleteTexture(heightTex)
      gl.deleteTexture(pictureTex)
    },
  }
}

function RippleRefractSurface({
  speed = 1,
  intensity = 0.5,
  color,
  src,
  className,
  children,
}: RippleRefractSurfaceProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<RippleSession | null>(null)
  const queueRef = useRef<RippleDrop[]>([])
  const lastRef = useRef<{ x: number; y: number } | null>(null)
  const tuningRef = useRef<Tuning>({ speed, intensity, color })
  const pictureRef = useRef<PictureState>({ image: null, generation: 0 })
  const [blocked, setBlocked] = useState(false)
  const still = reduced || blocked

  useEffect(() => {
    tuningRef.current = { speed, intensity, color }
  }, [speed, intensity, color])

  useEffect(() => {
    const address = src?.trim()
    const bump = (image: HTMLImageElement | null) => {
      pictureRef.current = { image, generation: pictureRef.current.generation + 1 }
    }
    if (!address) {
      if (pictureRef.current.image) bump(null)
      return
    }
    let gone = false
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => {
      if (!gone) bump(image)
    }
    image.onerror = () => {
      if (!gone) bump(null)
    }
    try {
      image.src = address
    } catch {
      bump(null)
    }
    return () => {
      gone = true
    }
  }, [src])

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    let gone = false
    let loop: GlLoopHandle | null = null
    loop = mountGlLoop(canvas, {
      host,
      frame: (frame) => {
        if (gone || !loop) return
        let session = sessionRef.current
        if (!session) {
          session = startSession(loop, host, tuningRef, queueRef, pictureRef)
          if (!session) {
            gone = true
            loop.dispose()
            setBlocked(true)
            return
          }
          sessionRef.current = session
        }
        session.draw(frame)
      },
    })
    if (!loop) {
      setBlocked(true)
      return () => {
        gone = true
      }
    }
    return () => {
      gone = true
      sessionRef.current?.dispose()
      sessionRef.current = null
      loop?.dispose()
    }
  }, [reduced])

  function pointOf(event: PointerEvent<HTMLDivElement>) {
    const host = hostRef.current
    if (!host) return null
    const rect = host.getBoundingClientRect()
    const width = rect.width || 1
    const height = rect.height || 1
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / width)),
      y: Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / height)),
    }
  }

  function pushDrop(kind: "move" | "click", event: PointerEvent<HTMLDivElement>) {
    const next = pointOf(event)
    if (!next) return
    if (kind === "move") {
      const last = lastRef.current
      lastRef.current = next
      if (last && (next.x - last.x) ** 2 + (next.y - last.y) ** 2 < 0.000016) return
    }
    const queue = queueRef.current
    queue.push({ ...next, kind })
    if (queue.length > 16) queue.shift()
  }

  return (
    <div
      ref={hostRef}
      data-slot="ripple-refract-surface"
      data-state={still ? "still" : "live"}
      className={cn(
        "relative isolate h-64 w-full overflow-hidden rounded-xl bg-background text-foreground",
        className,
      )}
      onPointerDown={still ? undefined : (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return
        pushDrop("click", event)
      }}
      onPointerMove={still ? undefined : (event) => pushDrop("move", event)}
      onPointerLeave={still ? undefined : () => {
        lastRef.current = null
      }}
    >
      {still ? (
        <div
          data-fallback="still"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: "var(--background)", backgroundImage: stillPaint(color) }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { RippleRefractSurface }
