// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SlideRailConfirm } from "./slide-rail-confirm"

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
  const entry = getComponent("slide-rail-confirm")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='slide-rail-confirm']")
  if (!(node instanceof HTMLElement)) throw new Error("missing rail")
  return node
}

function clientXFor(root: HTMLElement, progress: number) {
  const span = Number(root.getAttribute("data-span"))
  const thumb = Number(root.getAttribute("data-thumb"))
  return progress * (span - thumb) + thumb / 2
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

test("滑轨控件起始值等于默认", async () => {
  expect(getComponent("slide-rail-confirm")?.batch).toBe(70)
  expect(getComponent("slide-rail-confirm")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("threshold")).toBe(0.9)
  const view = render(<SlideRailConfirm />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Slide to confirm" })
  expect(root).toHaveAttribute("data-ritual", "slide-rail")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-threshold", "0.90")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(slider).toHaveAttribute("aria-valuenow", "0")
  expect(view.getByText("Slide to confirm")).toBeInTheDocument()
  expect(view.getByRole("status")).toHaveTextContent("未确认")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("滑过阈值松手会成功，Reset 回到起点", async () => {
  const onConfirm = vi.fn()
  const view = render(<SlideRailConfirm onConfirm={onConfirm} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Slide to confirm" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const clientX = clientXFor(root, 0.95)
  fireEvent.pointerDown(slider, { clientX, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "success")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(slider).toHaveAttribute("aria-valuenow", "100")
  expect(slider).toHaveAttribute("aria-valuetext", "已确认")
  expect(view.getByRole("status")).toHaveTextContent("已确认")
  expect(onConfirm).toHaveBeenCalledTimes(1)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(view.getByRole("status")).toHaveTextContent("未确认")
})

test("没到阈值会回弹", async () => {
  const view = render(<SlideRailConfirm />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Slide to confirm" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const clientX = clientXFor(root, 0.2)
  fireEvent.pointerDown(slider, { clientX, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  fireEvent.pointerUp(slider, { clientX, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle-back")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(16))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(queued.size).toBe(0)
})

test("方向键加进度，Enter 到阈值才提交", () => {
  const onConfirm = vi.fn()
  const view = render(<SlideRailConfirm onConfirm={onConfirm} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Slide to confirm" })
  for (let i = 0; i < 8; i += 1) fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-progress", "0.800")
  fireEvent.keyDown(slider, { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(onConfirm).not.toHaveBeenCalled()
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  fireEvent.keyDown(slider, { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "success")
  expect(slider).toHaveAttribute("aria-valuetext", "已确认")
  expect(onConfirm).toHaveBeenCalledTimes(1)
})

test("减弱动效一键确认", () => {
  installMedia({ reduced: true })
  const onConfirm = vi.fn()
  const view = render(<SlideRailConfirm onConfirm={onConfirm} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByRole("slider")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Confirm" }))
  expect(root).toHaveAttribute("data-state", "success")
  expect(view.getByRole("status")).toHaveTextContent("已确认")
  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "idle")
})

test("离开视口时回弹帧停掉", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SlideRailConfirm />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Slide to confirm" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const clientX = clientXFor(root, 0.2)
  fireEvent.pointerDown(slider, { clientX, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle-back")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(queued.size).toBe(0)
})
