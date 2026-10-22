"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/lightboard.tsx. Modified for effect-ui.

import { useEffect, useRef, useState, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type LightCell = "0" | "1" | "2" | "3"
type Pattern = LightCell[][]

export interface LightBoardPalette {
  drawLine: string
  background: string
  textDim: string
  textBright: string
}

const defaultPalette: LightBoardPalette = {
  drawLine: "rgba(160, 160, 200, 0.7)",
  background: "rgba(30, 30, 40, 0.3)",
  textDim: "rgba(100, 100, 140, 0.5)",
  textBright: "rgba(220, 220, 255, 0.9)",
}

export interface LightBoardProps {
  text: string
  gap?: number
  rows?: number
  lightSize?: number
  updateInterval?: number
  font?: "default" | "7segment"
  palette?: Partial<LightBoardPalette>
  disableDrawing?: boolean
  controlledDrawState?: LightCell
  onDrawStateChange?: (next: LightCell) => void
  controlledHoverState?: boolean
  onHoverStateChange?: (hovered: boolean) => void
  className?: string
}

const space: Pattern = [
  ["0", "0", "0", "0"],
  ["0", "0", "0", "0"],
  ["0", "0", "0", "0"],
  ["0", "0", "0", "0"],
  ["0", "0", "0", "0"],
]

const defaultFont: Record<string, Pattern> = {
  " ": space,
  A: [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "1", "1", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"]],
  B: [["1", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "1", "1", "0"]],
  C: [["0", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "0", "0", "0"], ["1", "0", "0", "0"], ["0", "1", "1", "1"]],
  D: [["1", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "1", "1", "0"]],
  E: [["1", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "1", "1", "0"], ["1", "0", "0", "0"], ["1", "1", "1", "1"]],
  F: [["1", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "1", "1", "0"], ["1", "0", "0", "0"], ["1", "0", "0", "0"]],
  G: [["0", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "0", "1", "1"], ["1", "0", "0", "1"], ["0", "1", "1", "1"]],
  H: [["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "1", "1", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"]],
  I: [["1", "1", "1"], ["0", "1", "0"], ["0", "1", "0"], ["0", "1", "0"], ["1", "1", "1"]],
  J: [["0", "0", "1", "1"], ["0", "0", "0", "1"], ["0", "0", "0", "1"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  K: [["1", "0", "0", "1"], ["1", "0", "1", "0"], ["1", "1", "0", "0"], ["1", "0", "1", "0"], ["1", "0", "0", "1"]],
  L: [["1", "0", "0", "0"], ["1", "0", "0", "0"], ["1", "0", "0", "0"], ["1", "0", "0", "0"], ["1", "1", "1", "1"]],
  M: [["1", "0", "0", "0", "1"], ["1", "1", "0", "1", "1"], ["1", "0", "1", "0", "1"], ["1", "0", "0", "0", "1"], ["1", "0", "0", "0", "1"]],
  N: [["1", "0", "0", "1"], ["1", "1", "0", "1"], ["1", "0", "1", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"]],
  O: [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  P: [["1", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "1", "1", "0"], ["1", "0", "0", "0"], ["1", "0", "0", "0"]],
  Q: [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "1", "0"], ["0", "1", "0", "1"]],
  R: [["1", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "1", "1", "0"], ["1", "0", "1", "0"], ["1", "0", "0", "1"]],
  S: [["0", "1", "1", "1"], ["1", "0", "0", "0"], ["0", "1", "1", "0"], ["0", "0", "0", "1"], ["1", "1", "1", "0"]],
  T: [["1", "1", "1", "1", "1"], ["0", "0", "1", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "1", "0", "0"]],
  U: [["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  V: [["1", "0", "0", "0", "1"], ["1", "0", "0", "0", "1"], ["0", "1", "0", "1", "0"], ["0", "1", "0", "1", "0"], ["0", "0", "1", "0", "0"]],
  W: [["1", "0", "0", "0", "1"], ["1", "0", "0", "0", "1"], ["1", "0", "1", "0", "1"], ["1", "1", "0", "1", "1"], ["1", "0", "0", "0", "1"]],
  X: [["1", "0", "0", "1"], ["0", "1", "1", "0"], ["0", "0", "0", "0"], ["0", "1", "1", "0"], ["1", "0", "0", "1"]],
  Y: [["1", "0", "0", "0", "1"], ["0", "1", "0", "1", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "1", "0", "0"]],
  Z: [["1", "1", "1", "1"], ["0", "0", "0", "1"], ["0", "0", "1", "0"], ["0", "1", "0", "0"], ["1", "1", "1", "1"]],
  "0": [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  "1": [["0", "1", "0"], ["1", "1", "0"], ["0", "1", "0"], ["0", "1", "0"], ["1", "1", "1"]],
  "2": [["1", "1", "1", "0"], ["0", "0", "0", "1"], ["0", "1", "1", "0"], ["1", "0", "0", "0"], ["1", "1", "1", "1"]],
  "3": [["1", "1", "1", "0"], ["0", "0", "0", "1"], ["0", "1", "1", "0"], ["0", "0", "0", "1"], ["1", "1", "1", "0"]],
  "4": [["1", "0", "0", "1"], ["1", "0", "0", "1"], ["1", "1", "1", "1"], ["0", "0", "0", "1"], ["0", "0", "0", "1"]],
  "5": [["1", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "1", "1", "0"], ["0", "0", "0", "1"], ["1", "1", "1", "0"]],
  "6": [["0", "1", "1", "1"], ["1", "0", "0", "0"], ["1", "1", "1", "0"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  "7": [["1", "1", "1", "1"], ["0", "0", "0", "1"], ["0", "0", "1", "0"], ["0", "1", "0", "0"], ["0", "1", "0", "0"]],
  "8": [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["0", "1", "1", "0"], ["1", "0", "0", "1"], ["0", "1", "1", "0"]],
  "9": [["0", "1", "1", "0"], ["1", "0", "0", "1"], ["0", "1", "1", "1"], ["0", "0", "0", "1"], ["0", "1", "1", "0"]],
}

const sevenSegmentFont: Record<string, Pattern> = {
  " ": space,
  "0": [["1", "1", "1"], ["1", "0", "1"], ["1", "0", "1"], ["1", "0", "1"], ["1", "1", "1"]],
  "1": [["0", "0", "1"], ["0", "0", "1"], ["0", "0", "1"], ["0", "0", "1"], ["0", "0", "1"]],
}

function normalizeText(text: string) {
  return ` ${text.trim().toUpperCase()} `.replace(/\s+/g, "   ")
}

function textToPattern(text: string, rows: number, columns: number, font: Record<string, Pattern>): Pattern {
  const sample = font.A ?? font["0"] ?? space
  const letterHeight = sample.length
  const scale = Math.max(1, Math.floor(rows / letterHeight))
  const scaled = Object.fromEntries(
    Object.entries(font).map(([char, pattern]) => [
      char,
      pattern.flatMap((row) => Array.from({ length: scale }, () => row)).map((row) =>
        row.flatMap((cell) => Array.from({ length: scale }, () => (cell === "1" ? "3" : "0") as LightCell)),
      ),
    ]),
  )
  const letters = normalizeText(text)
    .split("")
    .map((char) => scaled[char] ?? scaled[" "] ?? space)
  const height = letters[0]?.length ?? letterHeight * scale
  let full: Pattern = Array.from({ length: height }, () => [])
  for (const letter of letters) {
    full = full.map((row, index) => [...row, ...(letter[index] ?? [])])
  }
  const width = Math.max(1, full[0]?.length ?? 1)
  const top = Math.max(0, Math.floor((rows - full.length) / 2))
  const bottom = Math.max(0, rows - full.length - top)
  const blank = () => Array.from({ length: width }, () => "0" as LightCell)
  const padded = [...Array.from({ length: top }, blank), ...full, ...Array.from({ length: bottom }, blank)]
  return padded.map((row) => {
    let next = row
    const target = Math.max(columns * 2, width)
    while (next.length < target) next = [...next, ...row]
    return next
  })
}

function colorFor(state: LightCell | undefined, palette: LightBoardPalette) {
  if (state === "1") return palette.textDim
  if (state === "2") return palette.drawLine
  if (state === "3") return palette.textBright
  return palette.background
}

export function LightBoard({
  text,
  gap = 1,
  rows = 5,
  lightSize = 4,
  updateInterval = 10,
  font = "default",
  palette,
  disableDrawing = true,
  controlledDrawState,
  onDrawStateChange,
  controlledHoverState,
  onHoverStateChange,
  className,
}: LightBoardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(rootRef)
  const moving = motionOn && !reduced
  const background = palette?.background ?? defaultPalette.background
  const drawLine = palette?.drawLine ?? defaultPalette.drawLine
  const textBright = palette?.textBright ?? defaultPalette.textBright
  const textDim = palette?.textDim ?? defaultPalette.textDim
  const selected = font === "default" ? defaultFont : sevenSegmentFont
  const [columns, setColumns] = useState(48)
  const [pattern, setPattern] = useState<Pattern>(() => textToPattern(text, rows, 48, selected))
  const [patternKey, setPatternKey] = useState(`${text}|${rows}|48|${font}`)
  const [internalHover, setInternalHover] = useState(false)
  const patternRef = useRef(pattern)
  const offsetRef = useRef(0)
  const drawingRef = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const nextKey = `${text}|${rows}|${columns}|${font}`
  if (patternKey !== nextKey) {
    setPatternKey(nextKey)
    setPattern(textToPattern(text, rows, columns, selected))
  }
  const hovered = controlledHoverState ?? internalHover
  const scrolling = moving && !hovered
  const drawState = controlledDrawState ?? "2"

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const width = node.offsetWidth
      if (width <= 0) return
      const next = Math.max(8, Math.floor(width / (lightSize + gap)))
      setColumns(next)
    }
    const observer = new ResizeObserver(() => measure())
    observer.observe(node)
    return () => observer.disconnect()
  }, [gap, lightSize])

  useEffect(() => {
    patternRef.current = pattern
    offsetRef.current = 0
  }, [pattern])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return
    const paintColors: LightBoardPalette = { background, drawLine, textBright, textDim }
    let frame = 0
    let last = 0
    const paint = () => {
      const grid = patternRef.current
      const rowWidth = grid[0]?.length ?? 1
      context.clearRect(0, 0, canvas.width, canvas.height)
      grid.forEach((row, rowIndex) => {
        for (let colIndex = 0; colIndex < columns; colIndex += 1) {
          const cell = row[(colIndex + offsetRef.current) % rowWidth]
          context.fillStyle = colorFor(cell, paintColors)
          context.beginPath()
          context.arc(
            colIndex * (lightSize + gap) + lightSize / 2,
            rowIndex * (lightSize + gap) + lightSize / 2,
            lightSize / 2,
            0,
            Math.PI * 2,
          )
          context.fill()
        }
      })
    }
    const loop = (now: number) => {
      if (scrolling && now - last >= updateInterval) {
        const rowWidth = patternRef.current[0]?.length ?? 1
        offsetRef.current = (offsetRef.current + 1) % rowWidth
        last = now
      }
      paint()
      frame = requestAnimationFrame(loop)
    }
    paint()
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [background, columns, drawLine, gap, lightSize, scrolling, textBright, textDim, updateInterval])

  function stamp(x: number, y: number) {
    if (disableDrawing) return
    const col = Math.floor(x / (lightSize + gap))
    const row = Math.floor(y / (lightSize + gap))
    if (row < 0 || col < 0 || row >= rows || col >= columns) return
    const rowWidth = patternRef.current[0]?.length ?? 1
    const actual = (col + offsetRef.current) % rowWidth
    setPattern((current) => {
      const line = current[row]
      if (!line || line[actual] === drawState) return current
      const next = current.map((item) => [...item])
      const target = next[row]
      if (!target) return current
      target[actual] = drawState
      return next
    })
    onDrawStateChange?.(drawState)
  }

  function stroke(fromX: number, fromY: number, toX: number, toY: number) {
    let x = Math.round(fromX)
    let y = Math.round(fromY)
    const endX = Math.round(toX)
    const endY = Math.round(toY)
    const dx = Math.abs(endX - x)
    const dy = Math.abs(endY - y)
    const sx = x < endX ? 1 : -1
    const sy = y < endY ? 1 : -1
    let err = dx - dy
    for (let step = 0; step < 400; step += 1) {
      stamp(x, y)
      if (x === endX && y === endY) break
      const doubled = err * 2
      if (doubled > -dy) {
        err -= dy
        x += sx
      }
      if (doubled < dx) {
        err += dx
        y += sy
      }
    }
  }

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const scaleX = rect.width > 0 ? event.currentTarget.width / rect.width : 1
    const scaleY = rect.height > 0 ? event.currentTarget.height / rect.height : 1
    return { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY }
  }

  return (
    <div ref={rootRef} className={cn("w-full", className)} data-motion={moving ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="lightboard">
      <canvas
        ref={canvasRef}
        aria-label={text}
        height={rows * (lightSize + gap)}
        role="img"
        style={{ cursor: disableDrawing ? "default" : "crosshair", touchAction: "none", width: "100%", height: "auto" }}
        width={columns * (lightSize + gap)}
        onPointerDown={(event) => {
          if (disableDrawing) return
          drawingRef.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          const next = point(event)
          lastPoint.current = next
          stroke(next.x, next.y, next.x, next.y)
        }}
        onPointerEnter={() => {
          if (controlledHoverState === undefined) setInternalHover(true)
          onHoverStateChange?.(true)
        }}
        onPointerLeave={() => {
          drawingRef.current = false
          lastPoint.current = null
          if (controlledHoverState === undefined) setInternalHover(false)
          onHoverStateChange?.(false)
        }}
        onPointerMove={(event) => {
          if (!drawingRef.current || disableDrawing) return
          const next = point(event)
          const last = lastPoint.current
          if (last) stroke(last.x, last.y, next.x, next.y)
          lastPoint.current = next
        }}
        onPointerUp={() => {
          drawingRef.current = false
          lastPoint.current = null
        }}
      />
    </div>
  )
}
