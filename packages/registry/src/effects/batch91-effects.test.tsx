// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { asciiGlyph, AsciiHalftoneFilter, halftoneRadius } from "./ascii-halftone-filter"
import { flutePhase, fluteSample, FlutedGlassPane } from "./fluted-glass-pane"

function installMedia(options: { reduced?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: options.reduced === true && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

beforeEach(() => {
  installMedia()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("不移动指针时 8 条棱仍然在，相位保持 0", () => {
  expect(flutePhase(false, 1)).toBe(0)
  expect(flutePhase(true, 1)).toBe(1)
  expect(fluteSample(0, 0, 8, 0, 1, flutePhase(false, 1))).toEqual({ u: -0.0625, v: 0, ridge: 0 })
  expect(fluteSample(0, 0, 8, 0, 1, flutePhase(true, 1))).toEqual({ u: -0.0625, v: 0, ridge: 1 })
  expect(
    [0, 1, 2, 3, 4, 5, 6, 7].map((index) => fluteSample((index + 0.5) / 8, 0, 8, 0, 1, 0)),
  ).toEqual([
    { u: 0.125, v: 0, ridge: 0 },
    { u: 0.25, v: 0, ridge: 1 },
    { u: 0.375, v: 0, ridge: 2 },
    { u: 0.5, v: 0, ridge: 3 },
    { u: 0.625, v: 0, ridge: 4 },
    { u: 0.75, v: 0, ridge: 5 },
    { u: 0.875, v: 0, ridge: 6 },
    { u: 1, v: 0, ridge: 7 },
  ])

  const view = render(<FlutedGlassPane count={8} />)
  const root = view.container.querySelector("[data-slot='fluted-glass-pane']")
  expect(root).toHaveAttribute("data-ridges", "8")
  expect(root).toHaveAttribute("data-interactive", "false")
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(view.getByText("North light")).toBeInTheDocument()
})

test("图片加载失败时回到程序化图，不抛", () => {
  const view = render(<FlutedGlassPane src="/missing-pane.png" count={8} />)
  const root = view.container.querySelector("[data-slot='fluted-glass-pane']")
  expect(root).toHaveAttribute("data-image", "pending")
  const img = view.container.querySelector("img")
  expect(img).not.toBeNull()
  expect(() => {
    if (img) fireEvent.error(img)
  }).not.toThrow()
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(img).toHaveClass("hidden")
})

test("没有 WebGL 时停在静帧，棱的条数仍在", async () => {
  const view = render(<FlutedGlassPane className="extra-pane" count={8} />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='fluted-glass-pane']")
  expect(root).toHaveClass("extra-pane")
  expect(root).toHaveAttribute("data-ridges", "8")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.getByText("North light")).toBeInTheDocument()
})

test("减弱动效不挂 canvas", () => {
  installMedia({ reduced: true })
  const view = render(<FlutedGlassPane count={8} />)
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.container.querySelector("[data-slot='fluted-glass-pane']")).toHaveAttribute("data-ridges", "8")
})

test("fluted-glass-pane 在 batch 91，卡片分类，默认预设等于控件起点", () => {
  const entry = getComponent("fluted-glass-pane")
  expect(entry?.batch).toBe(91)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("cards")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
  expect(entry?.props.some((prop) => prop.name === "interactive" && prop.control)).toBe(false)
  expect(entry?.props.some((prop) => prop.name === "src" && prop.control)).toBe(false)
  expect(auditExemptions.some((item) => item.name === "fluted-glass-pane")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.count).toBe(18)
  expect(preset?.values.angle).toBe(90)
  expect(preset?.values.intensity).toBe(0.45)
  expect(preset?.values.interactive).toBeUndefined()
  expect(preset?.values.src).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/fluted-glass-pane.tsx",
    "components/ui/gl/gl-loop.tsx",
  ])
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "fluted-glass-pane.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).toMatch(/mountGlLoop/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})

test("明度经过对比后，暗处取井号，亮处留空，半调半径按格子像素", () => {
  expect(asciiGlyph(0, 1)).toBe("#")
  expect(asciiGlyph(1, 1)).toBe(" ")
  expect(asciiGlyph(0.5, 1)).toBe("=")
  expect(asciiGlyph(0, 0)).toBe("=")
  expect(asciiGlyph(0.125, 1)).toBe("*")
  expect(asciiGlyph(0.875, 1)).toBe(".")
  expect(halftoneRadius(0, 1, 8)).toBe(4)
  expect(halftoneRadius(1, 1, 8)).toBe(0)
  expect(halftoneRadius(0.5, 1, 8)).toBe(2)
  expect(halftoneRadius(0.25, 0.5, 16)).toBe(5)
})

test("ascii-halftone-filter 能在 ascii 和 halftone 之间切换", () => {
  const view = render(<AsciiHalftoneFilter />)
  const root = view.container.querySelector("[data-slot='ascii-halftone-filter']")
  expect(root).toHaveAttribute("data-mode", "ascii")
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(view.container.querySelector("img")).toBeNull()
  view.rerender(<AsciiHalftoneFilter mode="halftone" size={12} />)
  expect(root).toHaveAttribute("data-mode", "halftone")
  expect(root).toHaveAttribute("data-size", "12")
  view.rerender(<AsciiHalftoneFilter mode="ascii" />)
  expect(root).toHaveAttribute("data-mode", "ascii")
  expect(view.getByText("North type")).toBeInTheDocument()
})

test("ascii-halftone-filter 图片加载失败时留程序化图，不抛", () => {
  const view = render(<AsciiHalftoneFilter src="/missing-filter.png" mode="halftone" />)
  const root = view.container.querySelector("[data-slot='ascii-halftone-filter']")
  expect(root).toHaveAttribute("data-image", "pending")
  expect(root).toHaveAttribute("data-mode", "halftone")
  const img = view.container.querySelector("img")
  expect(img).not.toBeNull()
  expect(() => {
    if (img) fireEvent.error(img)
  }).not.toThrow()
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(img).toHaveClass("hidden")
})

test("ascii-halftone-filter 没有 WebGL 时停在静帧", async () => {
  const view = render(<AsciiHalftoneFilter className="extra-filter" mode="ascii" size={12} />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='ascii-halftone-filter']")
  expect(root).toHaveClass("extra-filter")
  expect(root).toHaveAttribute("data-mode", "ascii")
  expect(root).toHaveAttribute("data-size", "12")
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.getByText("North type")).toBeInTheDocument()
})

test("ascii-halftone-filter 减弱动效不挂 canvas", () => {
  installMedia({ reduced: true })
  const view = render(<AsciiHalftoneFilter mode="halftone" />)
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.container.querySelector("[data-slot='ascii-halftone-filter']")).toHaveAttribute("data-mode", "halftone")
})

test("ascii-halftone-filter 在 batch 91，卡片分类，默认预设等于控件起点", () => {
  const entry = getComponent("ascii-halftone-filter")
  expect(entry?.batch).toBe(91)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("cards")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
  expect(entry?.props.some((prop) => prop.name === "count")).toBe(false)
  expect(entry?.props.some((prop) => prop.name === "src" && prop.control)).toBe(false)
  const mode = entry?.props.find((prop) => prop.name === "mode")
  expect(mode?.control?.kind).toBe("select")
  if (mode?.control?.kind === "select") {
    expect(mode.control.value).toBe("ascii")
    expect(mode.control.options).toEqual(["ascii", "halftone"])
  }
  const size = entry?.props.find((prop) => prop.name === "size")
  expect(size?.control?.kind).toBe("range")
  expect(size?.description).toMatch(/像素/)
  expect(auditExemptions.some((item) => item.name === "ascii-halftone-filter")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.mode).toBe("ascii")
  expect(preset?.values.size).toBe(8)
  expect(preset?.values.intensity).toBe(0.8)
  expect(preset?.values.src).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/ascii-halftone-filter.tsx",
    "components/ui/gl/gl-loop.tsx",
  ])
  const source = fs.readFileSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "ascii-halftone-filter.tsx"),
    "utf8",
  )
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).toMatch(/mountGlLoop/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
})
