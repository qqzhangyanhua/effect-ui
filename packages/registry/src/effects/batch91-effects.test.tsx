// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { flutePhase, fluteSample, FlutedGlassPane } from "./fluted-glass-pane"
import { galleryBend, settleBend, VelocityBendGallery } from "./velocity-bend-gallery"

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

test("滚动越快，弯曲和色差越大；停住后按速度回正", () => {
  expect(galleryBend(0, 16, 1, 1)).toEqual({ bend: 0, fringe: 0 })
  expect(galleryBend(100, 0, 1, 1)).toEqual({ bend: 0, fringe: 0 })
  expect(galleryBend(100, 100, 1, 0)).toEqual({ bend: 0, fringe: 0 })
  expect(galleryBend(100, 100, 1, Number.NaN)).toEqual({ bend: 0, fringe: 0 })
  expect(galleryBend(50, 100, 1, 1)).toEqual({ bend: 0.25, fringe: 0.125 })
  expect(galleryBend(100, 100, 1, 1)).toEqual({ bend: 0.5, fringe: 0.25 })
  expect(galleryBend(-100, 100, 1, 1)).toEqual({ bend: -0.5, fringe: 0.25 })
  expect(galleryBend(200, 100, 1, 1)).toEqual({ bend: 1, fringe: 0.5 })
  expect(galleryBend(400, 100, 1, 0.5)).toEqual({ bend: 0.5, fringe: 0.25 })
  expect(galleryBend(100, 100, 2, 1)).toEqual({ bend: 1, fringe: 0.5 })
  expect(galleryBend(100, 50, 1, 0.5)).toEqual({ bend: 0.5, fringe: 0.25 })
  expect(galleryBend(100, 100, 0.25, 1)).toEqual({ bend: 0.125, fringe: 0.0625 })
  expect(galleryBend(100, 100, Number.NaN, 1)).toEqual({ bend: 0.5, fringe: 0.25 })
  expect(settleBend(0.5, 0, 1)).toBe(0.5)
  expect(settleBend(0.5, 80, 1)).toBe(0.25)
  expect(settleBend(0.5, 80, 2)).toBe(0.125)
  expect(settleBend(-0.5, 160, 1)).toBe(-0.125)
  expect(settleBend(0.001, 80, 1)).toBe(0)
  expect(settleBend(0, 80, 1)).toBe(0)
})

test("在组件内部滚动，没有 WebGL 时卡片不弯", async () => {
  const view = render(<VelocityBendGallery className="extra-gallery" />)
  await waitFor(() => {
    expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  })
  const root = view.container.querySelector("[data-slot='velocity-bend-gallery']")
  const scroller = root?.querySelector("[data-scroller='velocity-bend-gallery']") as HTMLDivElement
  expect(root).toHaveClass("extra-gallery")
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(scroller.querySelectorAll("[data-card]")).toHaveLength(4)
  expect(view.getByText("North aisle")).toBeInTheDocument()
  expect(view.getByText("South aisle")).toBeInTheDocument()
  expect(view.getByText("East court")).toBeInTheDocument()
  expect(view.getByText("West stair")).toBeInTheDocument()
  expect(root).toHaveAttribute("data-image", "procedural")
  scroller.scrollTop = 96
  fireEvent.scroll(scroller)
  expect(root).toHaveAttribute("data-scroll", "96")
  expect(root).toHaveAttribute("data-bend", "0")
})

test("减弱动效不挂 canvas，滚动时卡片仍然不弯", () => {
  installMedia({ reduced: true })
  const view = render(<VelocityBendGallery />)
  const root = view.container.querySelector("[data-slot='velocity-bend-gallery']")
  const scroller = view.container.querySelector("[data-scroller='velocity-bend-gallery']") as HTMLDivElement
  expect(view.container.querySelector("canvas")).toBeNull()
  expect(view.container.querySelector("[data-fallback='still']")).not.toBeNull()
  expect(view.getByText("East court")).toBeInTheDocument()
  scroller.scrollTop = 40
  fireEvent.scroll(scroller)
  expect(root).toHaveAttribute("data-bend", "0")
  expect(root).toHaveAttribute("data-scroll", "40")
})

test("图片加载失败时回到程序化卡片，不抛", () => {
  const view = render(<VelocityBendGallery images={["/missing-gallery.png"]} />)
  const root = view.container.querySelector("[data-slot='velocity-bend-gallery']")
  expect(root).toHaveAttribute("data-image", "pending")
  expect(view.getAllByText("North aisle")).toHaveLength(1)
  expect(view.queryByText("South aisle")).toBeNull()
  const img = view.container.querySelector("img")
  expect(img).not.toBeNull()
  expect(() => {
    if (img) fireEvent.error(img)
  }).not.toThrow()
  expect(root).toHaveAttribute("data-image", "procedural")
  expect(view.container.querySelector("[data-card='0']")).toHaveAttribute("data-image", "procedural")
  expect(img).toHaveClass("hidden")
})

test("间距按像素落在卡片之间，超出范围时夹住", () => {
  const view = render(<VelocityBendGallery />)
  const root = () => view.container.querySelector("[data-slot='velocity-bend-gallery']")
  const track = () => view.container.querySelector("[data-track='velocity-bend-gallery']") as HTMLElement
  expect(root()).toHaveAttribute("data-gap", "16")
  expect(track().style.gap).toBe("16px")
  view.rerender(<VelocityBendGallery gap={28} />)
  expect(root()).toHaveAttribute("data-gap", "28")
  expect(track().style.gap).toBe("28px")
  view.rerender(<VelocityBendGallery gap={-4} />)
  expect(root()).toHaveAttribute("data-gap", "0")
  expect(track().style.gap).toBe("0px")
  view.rerender(<VelocityBendGallery gap={80} />)
  expect(root()).toHaveAttribute("data-gap", "48")
  view.rerender(<VelocityBendGallery gap={Number.NaN} />)
  expect(root()).toHaveAttribute("data-gap", "16")
})

test("velocity-bend-gallery 在 batch 91，滚动分类，默认预设等于控件起点", () => {
  const entry = getComponent("velocity-bend-gallery")
  expect(entry?.batch).toBe(91)
  expect(entry?.layer).toBe("effect")
  expect(entry?.effectCategory).toBe("scroll")
  expect(entry?.source).toBe("original")
  expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
  expect(entry?.props.some((prop) => prop.name === "images" && prop.control)).toBe(false)
  expect(auditExemptions.some((item) => item.name === "velocity-bend-gallery")).toBe(false)
  const preset = entry?.presets?.find((item) => item.name === "default")
  expect(preset?.values.speed).toBe(1)
  expect(preset?.values.intensity).toBe(0.6)
  expect(preset?.values.gap).toBe(16)
  expect(preset?.values.images).toBeUndefined()
  for (const prop of entry?.props ?? []) {
    if (!prop.control || !("value" in prop.control)) continue
    expect(preset?.values[prop.name]).toBe(prop.control.value)
  }
  expect(entry?.files?.map((file) => file.target)).toEqual([
    "components/ui/velocity-bend-gallery.tsx",
    "components/ui/gl/gl-loop.tsx",
  ])
  const source = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "velocity-bend-gallery.tsx"), "utf8")
  expect(source).toMatch(/usePrefersReducedMotion/)
  expect(source).toMatch(/original implementation/)
  expect(source).toMatch(/mountGlLoop/)
  expect(source).toMatch(/onScroll/)
  expect(source).not.toMatch(/documentElement/)
  expect(source).not.toMatch(/\bpace\b/)
  expect(source).not.toMatch(/\bwindow\b/)
  expect(source).not.toMatch(/addEventListener/)
})
