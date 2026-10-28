// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { InkStrokeDraw } from "./ink-stroke-draw"

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
  const entry = getComponent("ink-stroke-draw")
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

test("描边控件起始值等于默认，读屏拿到终稿", async () => {
  expect(getComponent("ink-stroke-draw")?.batch).toBe(68)
  expect(getComponent("ink-stroke-draw")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("stagger")).toBe(0.35)
  expect(start("fillAfter")).toBe(true)
  const view = render(<InkStrokeDraw />)
  const root = view.getByRole("group", { name: "墨线" })
  expect(root).toHaveAttribute("data-ritual", "ink-stroke")
  expect(root).toHaveAttribute("aria-label", "墨线")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-stagger", "0.35")
  expect(root).toHaveAttribute("data-stroke", "4.6")
  expect(root).toHaveAttribute("data-state", "ready")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-fill", "off")
  expect(view.getByRole("img", { name: "墨线" }).querySelectorAll("path")).toHaveLength(2)
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("button", { name: "开始" })).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("进入视口后描完，两条路径错峰，重播和 Enter 可以再画", async () => {
  const onComplete = vi.fn()
  const view = render(<InkStrokeDraw onComplete={onComplete} />)
  const root = view.getByRole("group", { name: "墨线" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(2))
  expect(root).toHaveAttribute("data-state", "drawing")
  expect(root).toHaveAttribute("data-progress", "0.100")
  const offsets = [...root.querySelectorAll("path")].map((node) => Number(node.getAttribute("data-offset")))
  expect(offsets[0]).toBeLessThan(offsets[1] ?? 0)
  act(() => drain(30))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(root).toHaveAttribute("data-fill", "on")
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(queued.size).toBe(0)

  fireEvent.click(view.getByRole("button", { name: "重播" }))
  expect(root).toHaveAttribute("data-state", "drawing")
  expect(root).toHaveAttribute("data-progress", "0.000")
  act(() => drain(30))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(onComplete).toHaveBeenCalledTimes(2)

  fireEvent.keyDown(view.getByRole("button", { name: "重播" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "drawing")
  expect(root).toHaveAttribute("data-progress", "0.000")
  act(() => drain(30))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(onComplete).toHaveBeenCalledTimes(3)
})

test("关掉填色后画完仍然不填", async () => {
  const view = render(<InkStrokeDraw fillAfter={false} />)
  const root = view.getByRole("group", { name: "墨线" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  act(() => drain(30))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-fill", "off")
})

test("减弱动效直接显示描完的终态", () => {
  installMedia({ reduced: true })
  const onComplete = vi.fn()
  const view = render(<InkStrokeDraw onComplete={onComplete} />)
  const root = view.getByRole("group", { name: "墨线" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(root).toHaveAttribute("data-fill", "on")
  expect(root).toHaveAttribute("aria-label", "墨线")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.click(view.getByRole("button", { name: "重播" }))
  fireEvent.keyDown(view.getByRole("button", { name: "重播" }), { key: "Enter" })
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(onComplete).not.toHaveBeenCalled()
  expect(queued.size).toBe(0)
})

test("离开视口后描边帧取消", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const onComplete = vi.fn()
  const view = render(<InkStrokeDraw onComplete={onComplete} />)
  const root = view.getByRole("group", { name: "墨线" })
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-state", "ready")
  expect(root).toHaveAttribute("data-progress", "0.000")
  act(() => drain(12))
  fireEvent.click(view.getByRole("button", { name: "开始" }))
  expect(root).toHaveAttribute("data-state", "ready")
  expect(onComplete).not.toHaveBeenCalled()
  expect(queued.size).toBe(0)
  view.unmount()
  expect(queued.size).toBe(0)
})
