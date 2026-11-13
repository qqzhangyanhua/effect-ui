"use client"

import { useEffect, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

import { mountGlLoop, parseCssColor, type GlContext, type GlFrame, type GlLoopHandle, type GlPair, type GlTarget } from "./gl/gl-loop"
import { compileField, type FieldProgram } from "./reaction-diffusion-shaders"

/** original implementation. Gray-Scott field grown from a built-in pattern. */

export type ReactionPattern = "spots" | "print" | "coral"

export interface ReactionDiffusionFieldProps {
  pattern?: ReactionPattern
  speed?: number
  intensity?: number
  colors?: readonly string[]
  className?: string
}

export interface GrayScottRates {
  feed: number
  kill: number
}

type Rgb = [number, number, number]

interface Tuning {
  pattern: ReactionPattern
  speed: number
  intensity: number
  colors: readonly string[] | undefined
}
interface FieldSession {
  draw: (frame: GlFrame) => void
  dispose: () => void
}

const RATES: Record<ReactionPattern, GrayScottRates> = {
  spots: { feed: 0.035, kill: 0.065 },
  print: { feed: 0.037, kill: 0.06 },
  coral: { feed: 0.0545, kill: 0.062 },
}

const SPOTS: readonly (readonly [number, number, number])[] = [
  [0.375, 0.375, 0.0625],
  [0.625, 0.5, 0.046875],
  [0.5, 0.6875, 0.0625],
]

const BRANCHES: readonly (readonly [number, number, number, number, number])[] = [
  [0.5, 0.8125, 0.5, 0.1875, 0.03125],
  [0.5, 0.5, 0.25, 0.25, 0.0234375],
  [0.5, 0.375, 0.75, 0.1875, 0.0234375],
  [0.5, 0.625, 0.6875, 0.5, 0.0234375],
]

const TOKENS = ["--primary", "--chart-2", "--chart-4"] as const
const FALLBACK: readonly Rgb[] = [
  [0.2, 0.28, 0.45],
  [0.12, 0.4, 0.38],
  [0.55, 0.32, 0.16],
]

const GRID = 128

export function patternRates(pattern: ReactionPattern): GrayScottRates {
  const rates = RATES[pattern]
  return { feed: rates.feed, kill: rates.kill }
}

export function fieldPattern(value: string | undefined): ReactionPattern {
  if (value === "print" || value === "coral") return value
  return "spots"
}

function unit(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/** 五点和的拉普拉斯由调用方算好。扩散 0.16 / 0.08。强度只乘反应项。 */
export function grayScottStep(
  u: number,
  v: number,
  lapU: number,
  lapV: number,
  rates: GrayScottRates,
  dt: number,
  intensity: number,
): { u: number; v: number } {
  const step = dt > 0 ? dt : 0
  const react = unit(intensity, 0)
  const uvv = u * v * v * react
  const nextU = u + step * (0.16 * lapU - uvv + rates.feed * react * (1 - u))
  const nextV = v + step * (0.08 * lapV + uvv - (rates.feed + rates.kill) * react * v)
  return { u: clamp01(nextU), v: clamp01(nextV) }
}

/** 0 秒不走。否则大约每秒 240 步，封在 1 到 16。 */
export function stepsForFrame(speed: number, seconds: number): number {
  if (!(seconds > 0)) return 0
  const rate = !Number.isFinite(speed) ? 1 : Math.min(2.5, Math.max(0.25, speed))
  const raw = Math.round(seconds * rate * 240)
  if (raw < 1) return 1
  if (raw > 16) return 16
  return raw
}

/** 浓度乘上强度。强度 0 仍留 0.25，避免图案灭掉。 */
export function dyeWeight(concentration: number, intensity: number): number {
  const chem = concentration > 0 ? clamp01(concentration) : 0
  return chem * (0.25 + 0.75 * unit(intensity, 0.75))
}

function insideDisk(x: number, y: number, cx: number, cy: number, radius: number): boolean {
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= radius * radius
}

function spotsAt(x: number, y: number): number {
  for (const [cx, cy, radius] of SPOTS) {
    if (insideDisk(x, y, cx, cy, radius)) return 1
  }
  return 0
}

function printAt(x: number, y: number): number {
  const dx = x - 0.5
  const dy = y - 0.5
  if (dx * dx + dy * dy > 0.140625) return 0
  const height = y - 0.25 - 2 * dx * dx
  const mod = height % 0.125
  const phase = mod < 0 ? mod + 0.125 : mod
  const dist = phase < 0.0625 ? phase : 0.125 - phase
  return dist <= 0.015625 ? 1 : 0
}

function nearSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number, half: number): boolean {
  const abx = bx - ax
  const aby = by - ay
  const ab2 = abx * abx + aby * aby
  let t = ab2 === 0 ? 0 : ((px - ax) * abx + (py - ay) * aby) / ab2
  if (t < 0) t = 0
  else if (t > 1) t = 1
  const dx = px - (ax + abx * t)
  const dy = py - (ay + aby * t)
  return dx * dx + dy * dy <= half * half
}

function coralAt(x: number, y: number): number {
  for (const [ax, ay, bx, by, half] of BRANCHES) {
    if (nearSegment(x, y, ax, ay, bx, by, half)) return 1
  }
  return 0
}

/** 催化剂 v。斑点是圆盘，指纹是拱形脊，珊瑚是分叉线段。 */
export function seedChemicals(pattern: ReactionPattern, x: number, y: number): { u: number; v: number } {
  let v = spotsAt(x, y)
  if (pattern === "print") v = printAt(x, y)
  else if (pattern === "coral") v = coralAt(x, y)
  return { u: v > 0 ? 0.5 : 1, v }
}

function fallbackAt(index: number): Rgb {
  return FALLBACK[index] ?? FALLBACK[0] ?? [0.2, 0.28, 0.45]
}

function tokenColor(host: HTMLElement, style: CSSStyleDeclaration, index: number): Rgb {
  const token = TOKENS[index] ?? "--primary"
  const raw = style.getPropertyValue(token).trim()
  if (!raw) return fallbackAt(index)
  return parseCssColor(host, raw) ?? fallbackAt(index)
}

function themeColors(host: HTMLElement): [Rgb, Rgb, Rgb] {
  const style = getComputedStyle(host)
  return [tokenColor(host, style, 0), tokenColor(host, style, 1), tokenColor(host, style, 2)]
}

function paletteOf(host: HTMLElement, colors: readonly string[] | undefined): [Rgb, Rgb, Rgb] {
  if (!colors || colors.length === 0) return themeColors(host)
  return [
    parseCssColor(host, colors[0] ?? "") ?? fallbackAt(0),
    parseCssColor(host, colors[1] ?? "") ?? fallbackAt(1),
    parseCssColor(host, colors[2] ?? "") ?? fallbackAt(2),
  ]
}

function backdropOf(host: HTMLElement): Rgb {
  const style = getComputedStyle(host)
  return parseCssColor(host, style.backgroundColor) ?? parseCssColor(host, "var(--background)") ?? [0.97, 0.96, 0.94]
}

function stillPaint(pattern: ReactionPattern, colors: readonly string[] | undefined) {
  const a = colors?.[0] || "var(--primary)"
  const b = colors?.[1] || "var(--chart-2)"
  const c = colors?.[2] || "var(--chart-4)"
  if (pattern === "print") {
    return `repeating-radial-gradient(circle at 50% 58%, color-mix(in oklab, ${a} 78%, transparent) 0 2px, transparent 2px 11px), radial-gradient(70% 76% at 50% 58%, transparent 42%, var(--background) 74%)`
  }
  if (pattern === "coral") {
    return [
      `linear-gradient(90deg, transparent 47%, color-mix(in oklab, ${a} 82%, transparent) 47% 53%, transparent 53%)`,
      `linear-gradient(38deg, transparent 42%, color-mix(in oklab, ${b} 74%, transparent) 42% 48%, transparent 48%)`,
      `linear-gradient(-32deg, transparent 44%, color-mix(in oklab, ${c} 74%, transparent) 44% 50%, transparent 50%)`,
    ].join(",")
  }
  return [
    `radial-gradient(14% 16% at 38% 38%, color-mix(in oklab, ${a} 82%, transparent), transparent 70%)`,
    `radial-gradient(11% 13% at 62% 50%, color-mix(in oklab, ${b} 76%, transparent), transparent 72%)`,
    `radial-gradient(13% 15% at 50% 69%, color-mix(in oklab, ${c} 74%, transparent), transparent 70%)`,
  ].join(",")
}

function paint(gl: GlContext, loop: GlLoopHandle, compiled: FieldProgram, target: GlTarget | null, width: number, height: number) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target?.framebuffer ?? null)
  gl.viewport(0, 0, width, height)
  gl.useProgram(compiled.program)
  loop.draw()
}

function createSeedTexture(gl: GlContext): WebGLTexture | null {
  const texture = gl.createTexture()
  if (!texture) return null
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]))
  gl.bindTexture(gl.TEXTURE_2D, null)
  return texture
}

function writeSeed(gl: GlContext, texture: WebGLTexture, pattern: ReactionPattern) {
  const data = new Uint8Array(GRID * GRID * 4)
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const chem = seedChemicals(pattern, (x + 0.5) / GRID, (y + 0.5) / GRID)
      const index = (y * GRID + x) * 4
      data[index] = Math.round(chem.u * 255)
      data[index + 1] = Math.round(chem.v * 255)
      data[index + 3] = 255
    }
  }
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GRID, GRID, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
  gl.bindTexture(gl.TEXTURE_2D, null)
}

function uniform3(gl: GlContext, loc: WebGLUniformLocation | null, color: Rgb) {
  gl.uniform3f(loc, color[0], color[1], color[2])
}

function startSession(loop: GlLoopHandle, host: HTMLElement, tuning: { readonly current: Tuning }): FieldSession | null {
  const gl = loop.gl
  const webgl2 = typeof (gl as WebGL2RenderingContext).drawBuffers === "function"
  const compiled = compileField(gl, webgl2)
  if (!compiled) return null
  const [seed, step, display] = compiled
  const pair = loop.createPair(GRID, GRID)
  const seedTex = createSeedTexture(gl)
  if (!pair || !seedTex) {
    pair?.dispose()
    if (seedTex) gl.deleteTexture(seedTex)
    gl.deleteProgram(seed.program)
    gl.deleteProgram(step.program)
    gl.deleteProgram(display.program)
    return null
  }
  gl.disable(gl.BLEND)
  gl.disable(gl.DEPTH_TEST)
  gl.useProgram(seed.program)
  gl.uniform1i(seed.loc("uSeed"), 0)
  gl.useProgram(step.program)
  gl.uniform1i(step.loc("uState"), 0)
  gl.uniform2f(step.loc("uTexel"), 1 / GRID, 1 / GRID)
  gl.useProgram(display.program)
  gl.uniform1i(display.loc("uState"), 0)
  let seeded: ReactionPattern | null = null

  function drop(target: GlPair) {
    target.dispose()
    gl.deleteTexture(seedTex)
    gl.deleteProgram(seed.program)
    gl.deleteProgram(step.program)
    gl.deleteProgram(display.program)
  }

  return {
    draw(frame) {
      const pattern = fieldPattern(tuning.current.pattern)
      const react = unit(tuning.current.intensity, 0.75)
      if (seeded !== pattern) {
        writeSeed(gl, seedTex, pattern)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, seedTex)
        paint(gl, loop, seed, pair.write, GRID, GRID)
        pair.swap()
        seeded = pattern
      }
      const rates = patternRates(pattern)
      gl.useProgram(step.program)
      gl.uniform2f(step.loc("uRates"), rates.feed, rates.kill)
      gl.uniform1f(step.loc("uReact"), react)
      const steps = stepsForFrame(tuning.current.speed, frame.dt)
      for (let index = 0; index < steps; index += 1) {
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, pair.read.texture)
        paint(gl, loop, step, pair.write, GRID, GRID)
        pair.swap()
      }
      const [first, second, third] = paletteOf(host, tuning.current.colors)
      gl.useProgram(display.program)
      uniform3(gl, display.loc("uBg"), backdropOf(host))
      uniform3(gl, display.loc("uA"), first)
      uniform3(gl, display.loc("uB"), second)
      uniform3(gl, display.loc("uC"), third)
      gl.uniform1f(display.loc("uScale"), dyeWeight(1, react))
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, pair.read.texture)
      paint(gl, loop, display, null, frame.size.width, frame.size.height)
    },
    dispose() {
      drop(pair)
    },
  }
}

function liveCaption(pattern: ReactionPattern): string {
  if (pattern === "print") return "Print growing"
  if (pattern === "coral") return "Coral growing"
  return "Spots growing"
}

function ReactionDiffusionField({
  pattern = "spots",
  speed = 1,
  intensity = 0.75,
  colors,
  className,
}: ReactionDiffusionFieldProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sessionRef = useRef<FieldSession | null>(null)
  const tuningRef = useRef<Tuning>({ pattern, speed, intensity, colors })
  const [blocked, setBlocked] = useState(false)
  const chosen = fieldPattern(pattern)
  const still = reduced || blocked

  useEffect(() => {
    tuningRef.current = { pattern, speed, intensity, colors }
  }, [pattern, speed, intensity, colors])

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

  return (
    <div
      ref={hostRef}
      data-slot="reaction-diffusion-field"
      data-state={still ? "still" : "live"}
      className={cn("relative h-64 w-full overflow-hidden rounded-xl bg-background text-foreground select-none", className)}
    >
      {still ? (
        <div
          data-fallback="still"
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: "var(--background)", backgroundImage: stillPaint(chosen, colors) }}
        />
      ) : (
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      )}
      <p className="pointer-events-none relative z-10 p-4 text-sm">{still ? "Pattern at rest" : liveCaption(chosen)}</p>
    </div>
  )
}

export { ReactionDiffusionField }
