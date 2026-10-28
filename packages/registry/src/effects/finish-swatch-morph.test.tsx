// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { getComponent } from "../catalog"
import { FinishSwatchMorph } from "./finish-swatch-morph"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const queued = new Map<number, FrameRequestCallback>()
let nextFrame = 1

function installFrames() {
  queued.clear()
  nextFrame = 1
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame
    nextFrame += 1
    queued.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    queued.delete(id)
  })
}

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(0)
  }
}

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

function start(prop: string) {
  const entry = getComponent("finish-swatch-morph")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='finish-swatch-morph']")
  if (!(node instanceof HTMLElement)) throw new Error("missing swatch")
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("色卡控件起始值等于默认，指示停在第一色", async () => {
  expect(getComponent("finish-swatch-morph")?.batch).toBe(70)
  expect(getComponent("finish-swatch-morph")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("count")).toBe(5)
  expect(start("gap")).toBe(12)
  const view = render(<FinishSwatchMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "finish-swatch")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.6")
  expect(root).toHaveAttribute("data-count", "5")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-hue", "Hue A")
  expect(root).toHaveAttribute("data-tone", "a")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getAllByRole("radio")).toHaveLength(5)
  expect(view.getByRole("radio", { name: "Hue A" })).toHaveAttribute("aria-checked", "true")
  expect(root.querySelector("[data-indicator]")).not.toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("当前：Hue A")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("点选色卡后序号和色名一起换", async () => {
  const onIndexChange = vi.fn()
  const view = render(<FinishSwatchMorph onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("radio", { name: "Hue C" }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-hue", "Hue C")
  expect(root).toHaveAttribute("data-tone", "c")
  expect(root).toHaveAttribute("data-from", "a")
  expect(root).toHaveAttribute("data-to", "c")
  expect(root).toHaveAttribute("data-state", "morphing")
  expect(view.getByRole("radio", { name: "Hue C" })).toHaveAttribute("aria-checked", "true")
  expect(view.getByRole("status")).toHaveTextContent("当前：Hue C")
  expect(onIndexChange).toHaveBeenCalledWith(2)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-hue", "Hue C")
})

test("方向键步进色卡", async () => {
  const view = render(<FinishSwatchMorph />)
  const root = rootOf(view.container)
  const group = view.getByRole("radiogroup", { name: "色泽" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(group, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-hue", "Hue B")
  fireEvent.keyDown(group, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-hue", "Hue A")
  fireEvent.keyDown(group, { key: "End" })
  expect(root).toHaveAttribute("data-hue", "Hue E")
})

test("减弱动效瞬时换色", () => {
  installMedia({ reduced: true })
  const view = render(<FinishSwatchMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.click(view.getByRole("radio", { name: "Hue B" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-hue", "Hue B")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-scale", "1.00")
  expect(queued.size).toBe(0)
  expect(view.getByRole("status")).toHaveTextContent("当前：Hue B")
})

test("色卡数量跟着 count", () => {
  const view = render(<FinishSwatchMorph count={4} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "4")
  expect(view.getAllByRole("radio")).toHaveLength(4)
  expect(view.queryByRole("radio", { name: "Hue E" })).toBeNull()
})
