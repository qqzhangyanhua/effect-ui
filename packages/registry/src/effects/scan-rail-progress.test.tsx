// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ScanRailProgress } from "./scan-rail-progress"

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
    for (const callback of batch) callback(performance.now())
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
  const entry = getComponent("scan-rail-progress")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
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

test("扫描轨控件起始值等于默认，demo 从 auto 开始", async () => {
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("mode")).toBe("auto")
  const view = render(<ScanRailProgress />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-mode", "auto")
  expect(root).toHaveAttribute("data-state", "ready")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("auto 走到 1 时只调用一次 onComplete，扫描轨会移动", async () => {
  const onComplete = vi.fn()
  const view = render(<ScanRailProgress onComplete={onComplete} />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']") as HTMLElement
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-progress"))).toBeGreaterThan(0)
  expect(root.getAttribute("data-scan")).not.toBe("0.000")
  expect(root.querySelector("[data-rail]")).toBeInTheDocument()
  expect(onComplete).not.toHaveBeenCalled()
  act(() => drain(80))
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(view.getByRole("progressbar", { name: "扫描进度" })).toHaveAttribute("aria-valuenow", "100")
  act(() => drain(10))
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test("hold 松手后进度不再增加", async () => {
  const onComplete = vi.fn()
  const view = render(<ScanRailProgress mode="hold" onComplete={onComplete} />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']") as HTMLElement
  const target = root.querySelector("[data-hold-target]") as HTMLElement
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  act(() => drain(6))
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-holding", "off")
  fireEvent.pointerDown(target, { button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-holding", "on")
  act(() => drain(3))
  const mid = root.getAttribute("data-progress")
  expect(Number(mid)).toBeGreaterThan(0)
  expect(Number(mid)).toBeLessThan(1)
  fireEvent.pointerUp(target, { pointerId: 1 })
  expect(root).toHaveAttribute("data-holding", "off")
  act(() => drain(8))
  expect(root.getAttribute("data-progress")).toBe(mid)
  expect(onComplete).not.toHaveBeenCalled()
})

test("hold 可以用空格按住，松开就停", async () => {
  const view = render(<ScanRailProgress mode="hold" pace={2} />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']") as HTMLElement
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(root, { key: " " })
  expect(root).toHaveAttribute("data-holding", "on")
  act(() => drain(2))
  const mid = Number(root.getAttribute("data-progress"))
  expect(mid).toBeGreaterThan(0)
  fireEvent.keyUp(root, { key: " " })
  expect(root).toHaveAttribute("data-holding", "off")
  act(() => drain(4))
  expect(Number(root.getAttribute("data-progress"))).toBe(mid)
})

test("减弱动效用 Complete 一次完成，没有扫描轨", () => {
  installMedia({ reduced: true })
  const onComplete = vi.fn()
  const view = render(<ScanRailProgress onComplete={onComplete} />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root?.querySelector("[data-rail]")).toBeNull()
  act(() => drain(10))
  expect(onComplete).not.toHaveBeenCalled()
  fireEvent.click(view.getByRole("button", { name: "Complete" }))
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(view.queryByRole("button", { name: "Complete" })).not.toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "ready")
  expect(root).toHaveAttribute("data-progress", "0.000")
  fireEvent.click(view.getByRole("button", { name: "Complete" }))
  expect(onComplete).toHaveBeenCalledTimes(2)
})

test("离开视口后 auto 不再推进", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const onComplete = vi.fn()
  const view = render(<ScanRailProgress onComplete={onComplete} />)
  const root = view.container.querySelector("[data-slot='scan-rail-progress']")
  expect(root).toHaveAttribute("data-live", "off")
  act(() => drain(30))
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-state", "ready")
  expect(onComplete).not.toHaveBeenCalled()
})
