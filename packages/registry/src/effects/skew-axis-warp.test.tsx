// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SkewAxisWarp, skewFromPointer, skewRelease, skewText } from "./skew-axis-warp"

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

const empty = { left: 0, top: 0, width: 0, height: 0 }

function start(prop: string) {
  const entry = getComponent("skew-axis-warp")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='skew-axis-warp']")
  if (!(node instanceof HTMLElement)) throw new Error("missing skew")
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

test("扭曲控件起始值等于默认，读数是 X +12 · Y −8", async () => {
  expect(getComponent("skew-axis-warp")?.batch).toBe(77)
  expect(getComponent("skew-axis-warp")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("grid")).toBe(true)
  expect(start("snap")).toBe(true)
  expect(skewText(12)).toBe("+12")
  expect(skewText(-8)).toBe("\u22128")
  const view = render(<SkewAxisWarp />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "axis-warp")
  expect(root).toHaveAttribute("data-x", "12")
  expect(root).toHaveAttribute("data-y", "-8")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-roty", "5.88")
  expect(root).toHaveAttribute("data-rotx", "3.92")
  expect(root.querySelector("[data-part='warp-grid']")).toBeTruthy()
  expect(root.querySelector("[data-puck]")).toBeNull()
  expect(view.getAllByRole("slider")).toHaveLength(2)
  expect(view.getByRole("status").textContent).toContain("X +12")
  expect(view.getByRole("status").textContent).toContain("Y \u22128")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖两轴、方向键和零位吸附", () => {
  const onValueChange = vi.fn()
  const view = render(<SkewAxisWarp onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const axisX = view.getByRole("slider", { name: "Skew X" })
  const axisY = view.getByRole("slider", { name: "Skew Y" })
  expect(skewFromPointer(180, empty)).toBe(20)
  fireEvent.pointerDown(axisX, { clientX: 180, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-axis", "x")
  expect(root).toHaveAttribute("data-x", "20")
  expect(onValueChange).toHaveBeenCalledWith({ x: 20, y: -8 })
  fireEvent.pointerUp(axisX, { clientX: 180, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  fireEvent.keyDown(axisX, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-x", "19")
  fireEvent.keyDown(axisY, { key: "ArrowLeft", shiftKey: true })
  expect(root).toHaveAttribute("data-y", "-12")
  expect(root).toHaveAttribute("data-axis", "y")
  expect(skewRelease(2, true)).toBe(0)
  fireEvent.pointerDown(axisX, { clientX: 126, button: 0, pointerId: 2 })
  expect(root).toHaveAttribute("data-x", "2")
  fireEvent.pointerUp(axisX, { clientX: 126, pointerId: 2 })
  expect(root).toHaveAttribute("data-x", "0")
  expect(queued.size).toBe(0)
})

test("关闭栅格后网格消失，Reset 沿弹簧回零", async () => {
  const hidden = render(<SkewAxisWarp grid={false} />)
  expect(rootOf(hidden.container).querySelector("[data-part='warp-grid']")).toBeNull()
  expect(rootOf(hidden.container)).toHaveAttribute("data-grid", "off")
  cleanup()
  const view = render(<SkewAxisWarp />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-x", "0")
  expect(root).toHaveAttribute("data-y", "0")
  expect(root).toHaveAttribute("data-state", "zero")
  expect(root).toHaveAttribute("data-rotx", "0.00")
  expect(root).toHaveAttribute("data-roty", "0.00")
})

test("减弱动效瞬时回零，离开视口停掉弹簧", async () => {
  installMedia({ reduced: true })
  const reducedView = render(<SkewAxisWarp />)
  const reducedRoot = rootOf(reducedView.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-ease", "0")
  fireEvent.click(reducedView.getByRole("button", { name: "Reset" }))
  expect(reducedRoot).toHaveAttribute("data-x", "0")
  expect(reducedRoot).toHaveAttribute("data-y", "0")
  expect(reducedRoot).toHaveAttribute("data-state", "zero")
  expect(queued.size).toBe(0)
  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SkewAxisWarp />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
