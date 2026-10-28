// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BlobZoomLens } from "./blob-zoom-lens"

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

function installMedia(options: { reduced?: boolean; coarse?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (options.reduced === true && query.includes("prefers-reduced-motion")) ||
      (options.coarse === true && query.includes("pointer: coarse")),
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
  const entry = getComponent("blob-zoom-lens")
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

test("放大镜控件起始值等于默认，遮罩是有机 blob", async () => {
  expect(getComponent("blob-zoom-lens")?.batch).toBe(68)
  expect(getComponent("blob-zoom-lens")?.effectCategory).toBe("page")
  expect(start("intensity")).toBe(0.65)
  expect(start("radius")).toBe(72)
  expect(start("pace")).toBe(1)
  expect(start("jagged")).toBe(0.55)
  const view = render(<BlobZoomLens />)
  const root = view.getByRole("application", { name: "有机放大镜" })
  expect(root).toHaveAttribute("data-ritual", "blob-zoom")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-radius", "72")
  expect(root).toHaveAttribute("data-jagged", "0.55")
  expect(root).toHaveAttribute("data-scale", "2.24")
  expect(root).toHaveAttribute("data-shape", "blob")
  expect(root).toHaveAttribute("data-mask", "blob")
  expect(root).toHaveAttribute("data-cx", "0.500")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.querySelector("[data-layer='zoom']")).toBeTruthy()
  expect(root.querySelector("[data-layer='base']")).toBeTruthy()
  expect(root.querySelector("canvas")).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("指针移动遮罩，方向键和加减号也能改位置和尺寸", async () => {
  const view = render(<BlobZoomLens />)
  const root = view.getByRole("application", { name: "有机放大镜" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerMove(root, { clientX: 320, clientY: 140 })
  expect(root).toHaveAttribute("data-state", "tracking")
  act(() => drain(16))
  expect(Number(root.getAttribute("data-cx"))).toBeGreaterThan(0.7)
  expect(Number(root.getAttribute("data-morph"))).toBeGreaterThan(0)
  fireEvent.pointerUp(root)
  expect(root).toHaveAttribute("data-state", "resting")

  view.unmount()
  const again = render(<BlobZoomLens />)
  const lens = again.getByRole("application", { name: "有机放大镜" })
  fireEvent.keyDown(lens, { key: "ArrowRight" })
  expect(lens).toHaveAttribute("data-state", "tracking")
  expect(Number(lens.getAttribute("data-cx"))).toBeCloseTo(0.56, 2)
  fireEvent.keyDown(lens, { key: "ArrowUp" })
  expect(Number(lens.getAttribute("data-cy"))).toBeLessThan(0.5)
  fireEvent.keyDown(lens, { key: "+" })
  expect(lens).toHaveAttribute("data-radius", "82")
  fireEvent.keyDown(lens, { key: "-" })
  expect(lens).toHaveAttribute("data-radius", "72")
})

test("粗指针悬停不跟随，按下后才拖动遮罩", async () => {
  installMedia({ coarse: true })
  const view = render(<BlobZoomLens />)
  const root = view.getByRole("application", { name: "有机放大镜" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-pointer", "coarse")
  fireEvent.pointerMove(root, { clientX: 320, clientY: 100, pointerType: "touch" })
  act(() => drain(8))
  expect(root).toHaveAttribute("data-cx", "0.500")
  fireEvent.pointerDown(root, { clientX: 320, clientY: 100, pointerId: 1, pointerType: "touch" })
  fireEvent.pointerMove(root, { clientX: 320, clientY: 100, pointerId: 1, pointerType: "touch" })
  act(() => drain(16))
  expect(Number(root.getAttribute("data-cx"))).toBeGreaterThan(0.7)
})

test("减弱动效保持居中圆遮罩，不再跟随或变形", () => {
  installMedia({ reduced: true })
  const view = render(<BlobZoomLens />)
  const root = view.getByRole("application", { name: "有机放大镜" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-shape", "round")
  expect(root).toHaveAttribute("data-follow", "off")
  expect(root).toHaveAttribute("data-state", "resting")
  expect(root).toHaveAttribute("data-cx", "0.500")
  expect(root).toHaveAttribute("data-morph", "0.00")
  expect(view.getByText("静止的圆形遮罩")).toBeInTheDocument()
  fireEvent.pointerMove(root, { clientX: 320, clientY: 40 })
  fireEvent.keyDown(root, { key: "ArrowRight" })
  fireEvent.keyDown(root, { key: "+" })
  act(() => drain(8))
  expect(root).toHaveAttribute("data-cx", "0.500")
  expect(root).toHaveAttribute("data-radius", "72")
  expect(root).toHaveAttribute("data-morph", "0.00")
  expect(queued.size).toBe(0)
})

test("离开视口后形变帧停止", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<BlobZoomLens />)
  const root = view.getByRole("application", { name: "有机放大镜" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.pointerMove(root, { clientX: 320, clientY: 40 })
  act(() => drain(8))
  expect(root).toHaveAttribute("data-cx", "0.500")
  expect(root).toHaveAttribute("data-morph", "0.00")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-cx", "0.560")
  act(() => drain(8))
  expect(root).toHaveAttribute("data-morph", "0.00")
  expect(queued.size).toBe(0)
})
