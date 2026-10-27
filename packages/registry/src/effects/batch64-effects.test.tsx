// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DragRateTiles } from "./drag-rate-tiles"
import { RadialHotspotLabels } from "./radial-hotspot-labels"
import { ScrollSplitReveal } from "./scroll-split-reveal"
import { SliceShiftText } from "./slice-shift-text"
import { SpaceJumpHero } from "./space-jump-hero"
import { SpotlightFocusBlur } from "./spotlight-focus-blur"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

function installMedia(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
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

function start(name: string, prop: string) {
  const entry = getComponent(name)
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(`${name}.${prop}`)
  return found.control.value
}

function box(top: number, height = 448): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    left: 0,
    right: 400,
    bottom: top + height,
    width: 400,
    height,
    toJSON() {
      return {}
    },
  } as DOMRect
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test("六个控件的起始值等于组件默认", () => {
  expect(start("space-jump-hero", "pace")).toBe(1)
  expect(start("space-jump-hero", "height")).toBe(104)
  expect(start("space-jump-hero", "gravity")).toBe(1)
  expect(start("scroll-split-reveal", "intensity")).toBe(0.75)
  expect(start("scroll-split-reveal", "seam")).toBe(50)
  expect(start("scroll-split-reveal", "pace")).toBe(1)
  expect(start("slice-shift-text", "slices")).toBe(8)
  expect(start("slice-shift-text", "intensity")).toBe(0.7)
  expect(start("slice-shift-text", "pace")).toBe(1)
  expect(start("radial-hotspot-labels", "spread")).toBe(1)
  expect(start("radial-hotspot-labels", "duration")).toBe(420)
  expect(start("radial-hotspot-labels", "lineOpacity")).toBe(0.55)
  expect(start("spotlight-focus-blur", "blur")).toBe(8)
  expect(start("spotlight-focus-blur", "glow")).toBe(0.65)
  expect(start("spotlight-focus-blur", "pace")).toBe(1)
  expect(start("drag-rate-tiles", "threshold")).toBe(0.34)
  expect(start("drag-rate-tiles", "snap")).toBe(0.8)
  expect(start("drag-rate-tiles", "pace")).toBe(1)
})

test("空格和按钮都能让角色跳起", async () => {
  installMedia(false)
  const onJump = vi.fn()
  render(<SpaceJumpHero onJump={onJump} />)
  const scene = document.querySelector("[data-slot='space-jump-hero']")
  expect(scene).toHaveAttribute("data-pace", "1")
  expect(scene).toHaveAttribute("data-height", "104")
  expect(scene).toHaveAttribute("data-gravity", "1")
  expect(scene).toHaveAttribute("data-motion", "on")
  expect(scene).toHaveAttribute("data-state", "ground")
  fireEvent.click(screen.getByRole("button", { name: "跳跃" }))
  expect(onJump).toHaveBeenCalledTimes(1)
  expect(scene).toHaveAttribute("data-jumps", "1")
  scene?.focus()
  fireEvent.keyDown(scene as Element, { key: " " })
  expect(onJump).toHaveBeenCalledTimes(2)
  await waitFor(() => expect(scene).toHaveAttribute("data-state", "ground"))
  expect(scene).toHaveAttribute("data-lift", "0")
})

test("减弱动效时空格跳跃不再位移", () => {
  installMedia(true)
  render(<SpaceJumpHero height={140} gravity={1.4} pace={1.2} />)
  const scene = document.querySelector("[data-slot='space-jump-hero']")
  expect(scene).toHaveAttribute("data-motion", "off")
  expect(scene).toHaveAttribute("data-state", "shown")
  expect(scene).toHaveAttribute("data-lift", "0")
  expect(screen.getByText("站在地面上")).toBeInTheDocument()
  fireEvent.keyDown(scene as Element, { key: "Enter" })
  expect(scene).toHaveAttribute("data-jumps", "1")
  expect(scene).toHaveAttribute("data-lift", "0")
  expect(scene).toHaveAttribute("data-state", "shown")
  expect(screen.getByText("已经落地")).toBeInTheDocument()
})

test("封面滚到中段时沿接缝裂开，减弱动效直接全开", () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(box(400))
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 })
  const view = render(<ScrollSplitReveal />)
  const root = view.container.querySelector("[data-slot='scroll-split-reveal']")
  expect(root).toHaveAttribute("data-intensity", "0.75")
  expect(root).toHaveAttribute("data-seam", "50")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-open", "split")
  expect(view.getByText("缝后面才是正文")).toBeVisible()
  cleanup()
  installMedia(true)
  const reduced = render(<ScrollSplitReveal seam={32} intensity={0.2} />)
  const opened = reduced.container.querySelector("[data-slot='scroll-split-reveal']")
  expect(opened).toHaveAttribute("data-motion", "off")
  expect(opened).toHaveAttribute("data-open", "full")
  expect(opened).toHaveAttribute("data-seam", "32")
  expect(reduced.getByText("缝后面才是正文")).toBeVisible()
})

test("还没进视口时竖条错开，减弱动效直接对齐", () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const waiting = render(<SliceShiftText />)
  const root = waiting.container.querySelector("[data-slot='slice-shift-text']")
  expect(root).toHaveAttribute("data-state", "waiting")
  expect(root).toHaveAttribute("data-slices", "8")
  expect(root).toHaveAttribute("data-shift", "39")
  expect(waiting.container.querySelectorAll("[data-slice]")).toHaveLength(8)
  expect(waiting.getByRole("heading", { name: "竖着切开，再对齐" })).toBeInTheDocument()
  cleanup()
  installMedia(true)
  const reduced = render(<SliceShiftText slices={5} />)
  const still = reduced.container.querySelector("[data-slot='slice-shift-text']")
  expect(still).toHaveAttribute("data-motion", "off")
  expect(still).toHaveAttribute("data-shift", "0")
  expect(still).toHaveAttribute("data-state", "aligned")
  expect(still).toHaveAttribute("data-slices", "5")
  expect(reduced.container.querySelectorAll("[data-slice]")).toHaveLength(0)
  expect(reduced.getByRole("heading", { name: "竖着切开，再对齐" })).toBeVisible()
})

test("热点用点击和键盘展开，方向键移动焦点", () => {
  installMedia(false)
  const onOpenChange = vi.fn()
  render(<RadialHotspotLabels onOpenChange={onOpenChange} />)
  const root = document.querySelector("[data-slot='radial-hotspot-labels']")
  expect(root).toHaveAttribute("data-spread", "1")
  expect(root).toHaveAttribute("data-duration", "420")
  expect(root).toHaveAttribute("data-line-opacity", "0.55")
  const orbit = screen.getByRole("button", { name: "轨道" })
  fireEvent.click(orbit)
  expect(onOpenChange).toHaveBeenCalledWith("orbit")
  expect(screen.getByRole("region", { name: "轨道" })).toHaveTextContent("说明沿着半径散开")
  fireEvent.click(orbit)
  expect(screen.queryByRole("region", { name: "轨道" })).not.toBeInTheDocument()
  orbit.focus()
  fireEvent.keyDown(orbit, { key: "ArrowRight" })
  const signal = screen.getByRole("button", { name: "信号" })
  expect(signal).toHaveFocus()
  fireEvent.click(signal)
  fireEvent.keyDown(signal, { key: "Escape" })
  expect(screen.queryByRole("region")).not.toBeInTheDocument()
  expect(onOpenChange).toHaveBeenLastCalledWith(null)
})

test("减弱动效时热点仍然能展开", () => {
  installMedia(true)
  render(<RadialHotspotLabels spread={1.2} lineOpacity={0.8} duration={200} />)
  const root = document.querySelector("[data-slot='radial-hotspot-labels']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-spread", "1.2")
  expect(root).toHaveAttribute("data-line-opacity", "0.8")
  expect(root).toHaveAttribute("data-duration", "200")
  fireEvent.click(screen.getByRole("button", { name: "核心" }))
  expect(screen.getByRole("region", { name: "核心" })).toBeVisible()
})

test("聚光句始终读得到，减弱动效去掉模糊", () => {
  installMedia(false)
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const view = render(<SpotlightFocusBlur />)
  const root = view.container.querySelector("[data-slot='spotlight-focus-blur']")
  expect(root).toHaveAttribute("data-blur", "8")
  expect(root).toHaveAttribute("data-glow", "0.65")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-mask", "on")
  const sharp = view.getAllByText("聚光停住的地方，这句话才清楚。").find((node) => node.getAttribute("aria-hidden") !== "true")
  expect(sharp).toBeVisible()
  cleanup()
  installMedia(true)
  const reduced = render(<SpotlightFocusBlur blur={12} glow={0.2} />)
  const still = reduced.container.querySelector("[data-slot='spotlight-focus-blur']")
  expect(still).toHaveAttribute("data-motion", "off")
  expect(still).toHaveAttribute("data-mask", "off")
  expect(still).toHaveAttribute("data-blur", "12")
  const clear = reduced.getAllByText("聚光停住的地方，这句话才清楚。").find((node) => node.getAttribute("aria-hidden") !== "true")
  expect(clear).toBeVisible()
})

test("方向键和拖动都能给卡片评分", async () => {
  installMedia(false)
  const onRate = vi.fn()
  render(<DragRateTiles onRate={onRate} />)
  const root = document.querySelector("[data-slot='drag-rate-tiles']")
  expect(root).toHaveAttribute("data-threshold", "0.34")
  expect(root).toHaveAttribute("data-snap", "0.8")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(screen.getByText("不爱")).toBeVisible()
  expect(screen.getByText("爱")).toBeVisible()
  const cedar = screen.getByRole("slider", { name: /雪松/ })
  fireEvent.keyDown(cedar, { key: "ArrowRight" })
  expect(onRate).toHaveBeenCalledWith("cedar", "love")
  await waitFor(() => expect(screen.queryByRole("slider", { name: /雪松/ })).not.toBeInTheDocument())
  const citrus = screen.getByRole("slider", { name: /柑橘/ })
  fireEvent.pointerDown(citrus, { button: 0, pointerId: 1, clientX: 0 })
  fireEvent.pointerMove(citrus, { pointerId: 1, clientX: -80 })
  fireEvent.pointerUp(citrus, { pointerId: 1, clientX: -80 })
  expect(onRate).toHaveBeenCalledWith("citrus", "skip")
  await waitFor(() => expect(screen.queryByRole("slider", { name: /柑橘/ })).not.toBeInTheDocument())
})

test("减弱动效时左右键立刻记分", () => {
  installMedia(true)
  const onRate = vi.fn()
  render(<DragRateTiles onRate={onRate} threshold={0.5} snap={0} pace={1.4} />)
  const root = document.querySelector("[data-slot='drag-rate-tiles']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-threshold", "0.5")
  expect(root).toHaveAttribute("data-snap", "0")
  fireEvent.keyDown(screen.getByRole("slider", { name: /墨/ }), { key: "ArrowLeft" })
  expect(onRate).toHaveBeenCalledWith("ink", "skip")
  expect(screen.queryByRole("slider", { name: /墨/ })).not.toBeInTheDocument()
  expect(root).toHaveAttribute("data-remaining", "3")
})
