// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HOTSPOTS, HotspotPulseMap } from "./hotspot-pulse-map"

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

function drain(frames: number) {
  for (let index = 0; index < frames; index += 1) {
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
  const found = getComponent("hotspot-pulse-map")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='hotspot-pulse-map']")
  if (!(node instanceof HTMLElement)) throw new Error("missing hotspot")
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

test("热点图默认脉冲，控件起始值等于默认", async () => {
  expect(getComponent("hotspot-pulse-map")?.batch).toBe(80)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("pulse")).toBe(true)
  expect(start("oneOpen")).toBe(true)
  expect(HOTSPOTS).toHaveLength(3)
  const view = render(<HotspotPulseMap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "hotspot-pulse")
  expect(root).toHaveAttribute("data-active", "none")
  expect(root).toHaveAttribute("data-open", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Field unit")).toBeInTheDocument()
  expect(view.queryByText(/whoop|zara/i)).toBeNull()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("点选展开 callout，默认同屏只有一个", () => {
  const onValueChange = vi.fn()
  const view = render(<HotspotPulseMap onValueChange={onValueChange} pulse={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Lens ring" }))
  expect(root).toHaveAttribute("data-active", "0")
  expect(root).toHaveAttribute("data-open", "on")
  expect(root).toHaveAttribute("data-count", "1")
  expect(view.getByText("A circular mark on the face.")).toBeInTheDocument()
  expect(onValueChange).toHaveBeenLastCalledWith({ activeIndex: 0, open: true })
  fireEvent.click(view.getByRole("button", { name: "Side seam" }))
  expect(root).toHaveAttribute("data-active", "1")
  expect(root).toHaveAttribute("data-count", "1")
  expect(root.querySelector("[data-callout='lens']")).toBeNull()
  expect(view.getByText("A quiet line along the body.")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Side seam" }))
  expect(root).toHaveAttribute("data-open", "off")
  expect(root).toHaveAttribute("data-count", "0")
  expect(queued.size).toBe(0)
})

test("关闭互斥后可以同时展开两个热点", () => {
  const view = render(<HotspotPulseMap oneOpen={false} pulse={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-one", "off")
  fireEvent.click(view.getByRole("button", { name: "Lens ring" }))
  fireEvent.click(view.getByRole("button", { name: "Foot notch" }))
  expect(root).toHaveAttribute("data-count", "2")
  expect(root.querySelector("[data-callout='lens']")).toBeInTheDocument()
  expect(root.querySelector("[data-callout='foot']")).toBeInTheDocument()
})

test("方向键切换热点，Enter 展开", () => {
  const view = render(<HotspotPulseMap pulse={false} />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-active", "0")
  expect(root).toHaveAttribute("data-open", "off")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-open", "on")
  expect(root).toHaveAttribute("data-count", "1")
  fireEvent.keyDown(root, { key: "ArrowDown" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-active", "1")
  expect(root.querySelector("[data-callout='lens']")).toBeNull()
  expect(root.querySelector("[data-callout='seam']")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-active", "2")
})

test("脉冲离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<HotspotPulseMap />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-pulse"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-pulse"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-pulse")
  act(() => drain(3))
  expect(root.getAttribute("data-pulse")).toBe(stopped)
})

test("减弱动效没有呼吸，callout 瞬时展开", () => {
  installMedia({ reduced: true })
  const view = render(<HotspotPulseMap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-pulse", "0.00")
  fireEvent.click(view.getByRole("button", { name: "Foot notch" }))
  expect(root).toHaveAttribute("data-active", "2")
  expect(root).toHaveAttribute("data-open", "on")
  expect(view.getByText("A small step at the base.")).toBeInTheDocument()
  expect(queued.size).toBe(0)
})
