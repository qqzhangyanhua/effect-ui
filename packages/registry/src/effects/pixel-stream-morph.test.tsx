// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PixelStreamMorph } from "./pixel-stream-morph"

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

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

let emitView: (on: boolean) => void = () => {}

class ToggleObserver {
  constructor(callback: IntersectionObserverCallback) {
    emitView = (on: boolean) => {
      callback(
        [{ isIntersecting: on, intersectionRatio: on ? 1 : 0, target: document.documentElement } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
  }

  observe() {
    emitView(true)
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
  const entry = getComponent("pixel-stream-morph")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='pixel-stream-morph']")
  if (!(node instanceof HTMLElement)) throw new Error("missing pixel")
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

test("像素流控件起始值等于默认，字面有色带", async () => {
  expect(getComponent("pixel-stream-morph")?.batch).toBe(70)
  expect(getComponent("pixel-stream-morph")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("density")).toBe(28)
  expect(start("text")).toBe("flow")
  const view = render(<PixelStreamMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "pixel-stream")
  expect(root).toHaveAttribute("data-text", "flow")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-density", "28")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(Number(root.getAttribute("data-cells"))).toBeGreaterThan(8)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "streaming"))
  const cell = root.querySelector("[data-cell]")
  expect(cell?.getAttribute("style")).toContain("var(--primary)")
  expect(cell?.getAttribute("style")).toContain("var(--accent)")
  expect(view.getByRole("img", { name: "flow" })).toBeInTheDocument()
})

test("色流会推进，Replay 回到起点", async () => {
  const view = render(<PixelStreamMorph />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-stream", "on"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(3))
  expect(Number(root.getAttribute("data-phase"))).toBeGreaterThan(0)
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-phase", "0.000")
})

test("不同短词的蒙版不一样", () => {
  const yes = render(<PixelStreamMorph text="yes" />)
  const flow = render(<PixelStreamMorph text="flow" />)
  const yesRoot = rootOf(yes.container)
  const flowRoot = rootOf(flow.container)
  expect(yesRoot).toHaveAttribute("data-text", "yes")
  expect(flowRoot).toHaveAttribute("data-text", "flow")
  expect(Number(yesRoot.getAttribute("data-cells"))).toBeGreaterThan(8)
  expect(Number(flowRoot.getAttribute("data-cells"))).toBeGreaterThan(8)
  expect(yesRoot.getAttribute("data-mask")).not.toBe(flowRoot.getAttribute("data-mask"))
})

test("减弱动效是静止像素字", () => {
  installMedia({ reduced: true })
  const view = render(<PixelStreamMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "paused")
  expect(root).toHaveAttribute("data-stream", "off")
  expect(root).toHaveAttribute("data-phase", "0.000")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(Number(root.getAttribute("data-cells"))).toBeGreaterThan(8)
  expect(root.querySelector("[data-cell]")?.className).toContain("bg-primary")
  expect(queued.size).toBe(0)
  act(() => drain(6))
  expect(root).toHaveAttribute("data-phase", "0.000")
})

test("离开视口后色流帧停住", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PixelStreamMorph />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  act(() => drain(3))
  const phase = root.getAttribute("data-phase")
  expect(Number(phase)).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-state", "paused")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-phase")
  act(() => drain(4))
  expect(root.getAttribute("data-phase")).toBe(frozen)
})

test("一开始就在视口外时不排队", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<PixelStreamMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-stream", "off")
  expect(queued.size).toBe(0)
})
