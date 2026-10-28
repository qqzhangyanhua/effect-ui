// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SpeedNotchRail, speedIndexFromPointer, speedNotches } from "./speed-notch-rail"

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
  for (let i = 0; i < frames; i += 1) {
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
  const entry = getComponent("speed-notch-rail")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='speed-notch-rail']")
  if (!(node instanceof HTMLElement)) throw new Error("missing rail")
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

test("倍速轨默认停在 1x，控件起始值等于默认", async () => {
  expect(getComponent("speed-notch-rail")?.batch).toBe(78)
  expect(getComponent("speed-notch-rail")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("preview")).toBe(true)
  expect(start("notches")).toBe(5)
  expect(speedNotches(5)).toEqual([0.3, 0.5, 1, 2, 3])
  expect(speedIndexFromPointer(280, { left: 0, width: 0 }, 5)).toBe(4)
  expect(speedIndexFromPointer(70, { left: 0, width: 0 }, 5)).toBe(1)
  const view = render(<SpeedNotchRail />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "speed-notch")
  expect(root).toHaveAttribute("data-rate", "1")
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-notches", "5")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-year]")).toBeNull()
  expect(view.getByRole("slider", { name: "Playback speed" })).toHaveAttribute("aria-valuenow", "1")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("拖动和点刻度只落在 notch 上，方向键跳到两端", () => {
  const onValueChange = vi.fn()
  const view = render(<SpeedNotchRail onValueChange={onValueChange} preview={false} />)
  const root = rootOf(view.container)
  const rail = view.getByRole("slider", { name: "Playback speed" })
  const allowed = speedNotches(5).map(String)
  fireEvent.pointerDown(rail, { clientX: 280, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-rate", "3")
  expect(allowed).toContain("3")
  expect(onValueChange).toHaveBeenCalledWith(3)
  fireEvent.pointerUp(rail, { clientX: 280, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "snapped")
  fireEvent.click(view.getByRole("button", { name: "0.5x" }))
  expect(root).toHaveAttribute("data-rate", "0.5")
  expect(onValueChange).toHaveBeenCalledWith(0.5)
  fireEvent.keyDown(rail, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-rate", "1")
  fireEvent.keyDown(rail, { key: "Home" })
  expect(root).toHaveAttribute("data-rate", "0.3")
  fireEvent.keyDown(rail, { key: "End" })
  expect(root).toHaveAttribute("data-rate", "3")
  expect(root.querySelector("[data-part='preview']")).toBeNull()
  expect(queued.size).toBe(0)
})

test("三档和七档刻度各自落在自己的集合", () => {
  const narrow = render(<SpeedNotchRail notches={3} preview={false} />)
  const narrowRoot = rootOf(narrow.container)
  expect(narrowRoot).toHaveAttribute("data-notches", "3")
  expect(narrowRoot).toHaveAttribute("data-rate", "1")
  fireEvent.keyDown(narrow.getByRole("slider"), { key: "End" })
  expect(narrowRoot).toHaveAttribute("data-rate", "2")
  fireEvent.keyDown(narrow.getByRole("slider"), { key: "Home" })
  expect(narrowRoot).toHaveAttribute("data-rate", "0.5")
  expect(narrow.queryByRole("button", { name: "0.3x" })).toBeNull()
  narrow.unmount()
  const dense = render(<SpeedNotchRail notches={7} preview={false} />)
  const denseRoot = rootOf(dense.container)
  expect(denseRoot).toHaveAttribute("data-notches", "7")
  expect(dense.getByRole("button", { name: "0.75x" })).toBeInTheDocument()
  expect(dense.getByRole("button", { name: "1.5x" })).toBeInTheDocument()
  fireEvent.click(dense.getByRole("button", { name: "1.5x" }))
  expect(denseRoot).toHaveAttribute("data-rate", "1.5")
  expect(speedNotches(7).map(String)).toContain(denseRoot.getAttribute("data-rate"))
})

test("预览循环在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SpeedNotchRail />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-preview-t"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-preview-t"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-preview-t")
  act(() => drain(3))
  expect(root.getAttribute("data-preview-t")).toBe(stopped)
})

test("减弱动效瞬时吸附，预览不再循环", () => {
  installMedia({ reduced: true })
  const view = render(<SpeedNotchRail />)
  const root = rootOf(view.container)
  const rail = view.getByRole("slider", { name: "Playback speed" })
  fireEvent.pointerDown(rail, { clientX: 0, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-rate", "0.3")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-preview-t", "0.00")
  expect(queued.size).toBe(0)
})
