"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import {
  inkAdvect,
  inkDisplay,
  inkDiverge,
  inkJacobi,
  inkProject,
  inkSplatDye,
  inkSplatVelocity,
  inkVertex,
} from "./fluid-ink-shaders"
import { mountGlLoop, type GlContext, type GlFrame, type GlLoopHandle, type GlPair, type GlTarget } from "./gl/gl-loop"

/** original implementation. Pointer and touch stir ink inside this element. */

export interface InkPoint {
  x: number
  y: number
}

export interface InkImpulse {
  x: number
  y: number
  vx: number
  vy: number
  amount: number
}

export interface FluidInkCursorProps {
  speed?: number
  intensity?: number
  colors?: readonly string[]
  className?: string
}

/** 离开指针后的墨量。seconds 为 0 时原样返回；过小则归零。 */
export function decayInk(amount: number, speed: number, seconds: number): number {
  if (!(amount > 0)) return 0
  if (!(seconds > 0)) return amount
  const kept = amount / (1 + seconds * (2 + speed))
  return kept < 0.001 ? 0 : kept
}

/** 按下是一小团墨，移动把位移乘进速度。强度为 0 时不注入。 */
export function injectPointer(
  amount: number,
  previous: InkPoint | null,
  next: InkPoint,
  speed: number,
  intensity: number,
): InkImpulse {
  const dx = previous ? next.x - previous.x : 0
  const dy = previous ? next.y - previous.y : 0
  const gain = (speed > 0 ? speed : 0) * (intensity > 0 ? intensity : 0)
  const stir = previous ? Math.min(1, Math.hypot(dx, dy) * gain) : Math.min(1, gain * 0.25)
  const base = amount > 0 ? amount : 0
  return {
    x: next.x,
    y: next.y,
    vx: dx * gain,
    vy: dy * gain,
    amount: Math.min(1, base + stir),
  }
}

function clampSpeed(speed: number) {
  if (!Number.isFinite(speed)) return 1
  return Math.min(2.5, Math.max(0.25, speed))
}

function clampIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.55
  return Math.min(1, Math.max(0, intensity))
}

function parseCssColor(input: string): [number, number, number] | null {
  const text = input.trim()
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(text)
  const body = hex?.[1]
  if (body) {
    const full = body.length === 3 ? body.split("").map((char) => char + char).join("") : body
    const value = Number.parseInt(full, 16)
    return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255]
  }
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(text)
  if (!rgb?.[1] || !rgb[2] || !rgb[3]) return null
  return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255]
}

const TOKEN_NAMES = ["--primary", "--chart-2", "--chart-4"] as const
const TOKEN_FALLBACK: [number, number, number][] = [
  [0.2, 0.28, 0.45],
  [0.12, 0.4, 0.38],
  [0.55, 0.32, 0.16],
]

function inkAt(index: number): [number, number, number] {
  return TOKEN_FALLBACK[index] ?? TOKEN_FALLBACK[0] ?? [0.2, 0.28, 0.45]
}

function themeInkColors(style: CSSStyleDeclaration): [number, number, number][] {
  return TOKEN_NAMES.map((name, index) => parseCssColor(style.getPropertyValue(name)) ?? inkAt(index))
}

function paletteFrom(style: CSSStyleDeclaration, colors: readonly string[] | undefined) {
  if (!colors || colors.length === 0) return themeInkColors(style)
  return [0, 1, 2].map((index) => parseCssColor(colors[index] ?? "") ?? inkAt(index))
}

function backdropOf(style: CSSStyleDeclaration): [number, number, number] {
  return parseCssColor(style.backgroundColor) ?? parseCssColor(style.getPropertyValue("--background")) ?? [0.97, 0.96, 0.94]
}

function stillPaint(colors: readonly string[] | undefined) {
  const a = colors?.[0] || "var(--primary)"
  const b = colors?.[1] || "var(--chart-2)"
  const c = colors?.[2] || "var(--chart-4)"
  return [
    `radial-gradient(42% 48% at 28% 42%, color-mix(in oklab, ${a} 70%, transparent), transparent 70%)`,
    `radial-gradient(36% 42% at 72% 62%, color-mix(in oklab, ${b} 60%, transparent), transparent 72%)`,
    `radial-gradient(28% 34% at 48% 28%, color-mix(in oklab, ${c} 50%, transparent), transparent 74%)`,
  ].join(",")
}

function localPoint(host: HTMLElement, clientX: number, clientY: number): InkPoint {
  const rect = host.getBoundingClientRect()
  const width = rect.width || 1
  const height = rect.height || 1
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / width)),
    y: Math.min(1, Math.max(0, 1 - (clientY - rect.top) / height)),
  }
}

interface Compiled {
  program: WebGLProgram
  loc: (name: string) => WebGLUniformLocation | null
}

function shaderOf(gl: GlContext, type: number, source: string) {
  const item = gl.createShader(type)
  if (!item) return null
  gl.shaderSource(item, source)
  gl.compileShader(item)
  if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) {
    gl.deleteShader(item)
    return null
  }
  return item
}

function compile(gl: GlContext, vertex: string, fragment: string): Compiled | null {
  const program = gl.createProgram()
  if (!program) return null
  const vs = shaderOf(gl, gl.VERTEX_SHADER, vertex)
  const fs = shaderOf(gl, gl.FRAGMENT_SHADER, fragment)
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

interface Tuning {
  speed: number
  intensity: number
  colors: readonly string[] | undefined
}

interface InkSession {
  stir: (previous: InkPoint | null, next: InkPoint, speed: number, intensity: number) => void
  draw: (frame: GlFrame) => void
  dispose: () => void
}

const SIM = 128
const JACOBI = 4

function bindTex(gl: GlContext, unit: number, texture: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
}

function begin(gl: GlContext, program: WebGLProgram, target: GlTarget) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  gl.viewport(0, 0, target.width, target.height)
  gl.useProgram(program)
}

function clearTarget(gl: GlContext, target: GlTarget) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer)
  gl.viewport(0, 0, target.width, target.height)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
}

function startSession(loop: GlLoopHandle, host: HTMLElement, tuning: { readonly current: Tuning }): InkSession | null {
  const gl = loop.gl
  const webgl2 = typeof (gl as WebGL2RenderingContext).drawBuffers === "function"
  const vertex = inkVertex(webgl2)
  const made: Compiled[] = []
  function take(fragment: string) {
    const item = compile(gl, vertex, fragment)
    if (item) made.push(item)
    return item
  }
  const splatVel = take(inkSplatVelocity(webgl2))
  const splatDye = take(inkSplatDye(webgl2))
  const advect = take(inkAdvect(webgl2))
  const diverge = take(inkDiverge(webgl2))
  const jacobi = take(inkJacobi(webgl2))
  const project = take(inkProject(webgl2))
  const display = take(inkDisplay(webgl2))
  const programs = [splatVel, splatDye, advect, diverge, jacobi, project, display]
  const vel = loop.createPair(SIM, SIM)
  const dye = loop.createPair(SIM, SIM)
  const press = loop.createPair(SIM, SIM)
  const scratch = loop.createPair(SIM, SIM)
  const pairs = [vel, dye, press, scratch]
  if (programs.some((item) => !item) || pairs.some((item) => !item)) {
    for (const item of made) gl.deleteProgram(item.program)
    for (const pair of pairs) pair?.dispose()
    return null
  }
  const ready = {
    splatVel: splatVel as Compiled,
    splatDye: splatDye as Compiled,
    advect: advect as Compiled,
    diverge: diverge as Compiled,
    jacobi: jacobi as Compiled,
    project: project as Compiled,
    display: display as Compiled,
    vel: vel as GlPair,
    dye: dye as GlPair,
    press: press as GlPair,
    scratch: scratch as GlPair,
  }
  const splats: InkImpulse[] = []
  let ink = 0
  let colorIndex = 0
  const texel: [number, number] = [1 / SIM, 1 / SIM]

  return {
    stir(previous, next, speed, intensity) {
      const impulse = injectPointer(ink, previous, next, speed, intensity)
      const added = Math.max(0, impulse.amount - ink)
      ink = impulse.amount
      if (added <= 0 && impulse.vx === 0 && impulse.vy === 0) return
      splats.push({ ...impulse, amount: added })
      if (splats.length > 8) splats.shift()
    },
    draw(frame) {
      const speed = clampSpeed(tuning.current.speed)
      const intensity = clampIntensity(tuning.current.intensity)
      const step = Math.min(0.05, frame.dt) * speed
      const dyeKeep = decayInk(1, speed, frame.dt)
      const velKeep = decayInk(1, speed, frame.dt * 0.2)
      ink = decayInk(ink, speed, frame.dt)
      const style = getComputedStyle(host)
      const palette = paletteFrom(style, tuning.current.colors)
      const radius = 0.03 + intensity * 0.07
      gl.disable(gl.BLEND)
      const queued = splats.splice(0, splats.length)
      for (const splat of queued) {
        const color = palette[colorIndex % palette.length] ?? inkAt(0)
        colorIndex += 1
        if (splat.vx !== 0 || splat.vy !== 0) {
          const prog = ready.splatVel
          begin(gl, prog.program, ready.vel.write)
          bindTex(gl, 0, ready.vel.read.texture)
          gl.uniform1i(prog.loc("uTex"), 0)
          gl.uniform2f(prog.loc("uPoint"), splat.x, splat.y)
          gl.uniform2f(prog.loc("uForce"), splat.vx * 16, splat.vy * 16)
          gl.uniform1f(prog.loc("uRadius"), radius)
          loop.draw()
          ready.vel.swap()
        }
        if (splat.amount > 0) {
          const prog = ready.splatDye
          begin(gl, prog.program, ready.dye.write)
          bindTex(gl, 0, ready.dye.read.texture)
          gl.uniform1i(prog.loc("uTex"), 0)
          gl.uniform2f(prog.loc("uPoint"), splat.x, splat.y)
          gl.uniform3f(prog.loc("uColor"), color[0], color[1], color[2])
          gl.uniform1f(prog.loc("uAmount"), splat.amount)
          gl.uniform1f(prog.loc("uRadius"), radius)
          loop.draw()
          ready.dye.swap()
        }
      }
      const flow = ready.advect
      begin(gl, flow.program, ready.vel.write)
      bindTex(gl, 0, ready.vel.read.texture)
      bindTex(gl, 1, ready.vel.read.texture)
      gl.uniform1i(flow.loc("uTex"), 0)
      gl.uniform1i(flow.loc("uVel"), 1)
      gl.uniform1f(flow.loc("uDt"), step)
      gl.uniform1f(flow.loc("uKeep"), velKeep)
      gl.uniform1f(flow.loc("uDye"), 0)
      loop.draw()
      ready.vel.swap()
      const div = ready.diverge
      begin(gl, div.program, ready.scratch.write)
      bindTex(gl, 0, ready.vel.read.texture)
      gl.uniform1i(div.loc("uVel"), 0)
      gl.uniform2f(div.loc("uTexel"), texel[0], texel[1])
      loop.draw()
      ready.scratch.swap()
      clearTarget(gl, ready.press.read)
      clearTarget(gl, ready.press.write)
      for (let pass = 0; pass < JACOBI; pass += 1) {
        const prog = ready.jacobi
        begin(gl, prog.program, ready.press.write)
        bindTex(gl, 0, ready.press.read.texture)
        bindTex(gl, 1, ready.scratch.read.texture)
        gl.uniform1i(prog.loc("uPress"), 0)
        gl.uniform1i(prog.loc("uDiv"), 1)
        gl.uniform2f(prog.loc("uTexel"), texel[0], texel[1])
        loop.draw()
        ready.press.swap()
      }
      const grad = ready.project
      begin(gl, grad.program, ready.vel.write)
      bindTex(gl, 0, ready.vel.read.texture)
      bindTex(gl, 1, ready.press.read.texture)
      gl.uniform1i(grad.loc("uVel"), 0)
      gl.uniform1i(grad.loc("uPress"), 1)
      gl.uniform2f(grad.loc("uTexel"), texel[0], texel[1])
      loop.draw()
      ready.vel.swap()
      begin(gl, flow.program, ready.dye.write)
      bindTex(gl, 0, ready.dye.read.texture)
      bindTex(gl, 1, ready.vel.read.texture)
      gl.uniform1i(flow.loc("uTex"), 0)
      gl.uniform1i(flow.loc("uVel"), 1)
      gl.uniform1f(flow.loc("uDt"), step)
      gl.uniform1f(flow.loc("uKeep"), dyeKeep)
      gl.uniform1f(flow.loc("uDye"), 1)
      loop.draw()
      ready.dye.swap()
      const [red, green, blue] = backdropOf(style)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, frame.size.width, frame.size.height)
      gl.clearColor(red, green, blue, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.useProgram(ready.display.program)
      bindTex(gl, 0, ready.dye.read.texture)
      gl.uniform1i(ready.display.loc("uTex"), 0)
      loop.draw()
      gl.disable(gl.BLEND)
    },
    dispose() {
      ready.vel.dispose()
      ready.dye.dispose()
      ready.press.dispose()
      ready.scratch.dispose()
      for (const item of made) gl.deleteProgram(item.program)
    },
  }
}

function FluidInkCursor({ speed = 1, intensity = 0.55, colors, className }: FluidInkCursorProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<InkSession | null>(null)
  const pointerRef = useRef<number | null>(null)
  const lastRef = useRef<InkPoint | null>(null)
  const tuningRef = useRef<Tuning>({ speed, intensity, colors })
  const [blocked, setBlocked] = useState(false)
  const still = reduced || blocked

  useEffect(() => {
    tuningRef.current = { speed, intensity, colors }
  }, [speed, intensity, colors])

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
        if (!sessionRef.current) {
          const session = startSession(loop, host, tuningRef)
          if (!session) {
            gone = true
            loop.dispose()
            setBlocked(true)
            return
          }
          sessionRef.current = session
        }
        sessionRef.current.draw(frame)
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
    return localPoint(host, event.clientX, event.clientY)
  }

  function stir(previous: InkPoint | null, next: InkPoint) {
    const tuning = tuningRef.current
    sessionRef.current?.stir(previous, next, clampSpeed(tuning.speed), clampIntensity(tuning.intensity))
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    const next = pointOf(event)
    if (!next) return
    pointerRef.current = event.pointerId
    lastRef.current = next
    stir(null, next)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (pointerRef.current !== event.pointerId) return
    const next = pointOf(event)
    if (!next) return
    stir(lastRef.current, next)
    lastRef.current = next
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (pointerRef.current !== null && event.pointerId !== pointerRef.current) return
    pointerRef.current = null
    lastRef.current = null
  }

  return (
    <div
      ref={hostRef}
      data-slot="fluid-ink-cursor"
      data-state={still ? "still" : "live"}
      className={cn(
        "relative h-64 w-full touch-none overflow-hidden rounded-xl bg-background text-foreground select-none",
        className,
      )}
      onPointerDown={still ? undefined : onPointerDown}
      onPointerMove={still ? undefined : onPointerMove}
      onPointerUp={still ? undefined : onPointerEnd}
      onPointerLeave={still ? undefined : onPointerEnd}
      onPointerCancel={still ? undefined : onPointerEnd}
    >
      {still ? (
        <div
          data-fallback="still"
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: "var(--background)", backgroundImage: stillPaint(colors) }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
      <p className="pointer-events-none relative z-10 p-4 text-sm">{still ? "Ink at rest" : "Stir the ink"}</p>
    </div>
  )
}

export { FluidInkCursor }
