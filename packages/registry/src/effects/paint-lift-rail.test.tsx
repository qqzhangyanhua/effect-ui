// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PaintLiftRail } from "./paint-lift-rail"

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
  const entry = getComponent("paint-lift-rail")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='paint-lift-rail']")
  if (!(node instanceof HTMLElement)) throw new Error("missing paint rail")
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

test("油漆轨控件起始值等于默认", async () => {
  expect(getComponent("paint-lift-rail")?.batch).toBe(72)
  expect(getComponent("paint-lift-rail")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("snap")).toBe(false)
  expect(start("hue")).toBe(28)
  const view = render(<PaintLiftRail />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "paint-lift")
  expect(root).toHaveAttribute("data-axis", "vertical")
  expect(root).toHaveAttribute("data-confirm", "off")
  expect(root).toHaveAttribute("data-t", "0.000")
  expect(root).toHaveAttribute("data-clip", "inset(100.0% 0 0 0)")
  expect(root).toHaveAttribute("data-edge", "straight")
  expect(root).not.toHaveAttribute("data-progress")
  expect(root.querySelector("[data-track='vertical']")).not.toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖竖轨时 t 改 clip，松手可吸附", async () => {
  const view = render(<PaintLiftRail snap />)
  const root = rootOf(view.container)
  const handle = view.getByRole("slider", { name: "油漆手柄" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientY: 100 })
  fireEvent.pointerMove(handle, { pointerId: 1, clientY: 52 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-t", "0.300")
  expect(root).toHaveAttribute("data-clip", "inset(70.0% 0 0 0)")
  expect(root).toHaveAttribute("data-edge", "brush")
  expect(root.querySelector("[data-brush]")).not.toBeNull()
  fireEvent.pointerUp(handle, { pointerId: 1, clientY: 52 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-t", "0.500")
  expect(root).toHaveAttribute("data-clip", "inset(50.0% 0 0 0)")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-edge", "straight")
})

test("键盘微调，方向是竖向", async () => {
  const view = render(<PaintLiftRail />)
  const root = rootOf(view.container)
  const handle = view.getByRole("slider", { name: "油漆手柄" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(handle).toHaveAttribute("aria-orientation", "vertical")
  fireEvent.keyDown(handle, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-state", "settle")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-t", "0.050")
  expect(root).toHaveAttribute("data-clip", "inset(95.0% 0 0 0)")
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(handle, { key: "ArrowDown" })
  act(() => drain(12))
  expect(root).toHaveAttribute("data-t", "0.000")
})

test("减弱动效瞬时改 t，没有笔触", () => {
  installMedia({ reduced: true })
  const view = render(<PaintLiftRail />)
  const root = rootOf(view.container)
  const handle = view.getByRole("slider", { name: "油漆手柄" })
  expect(root).toHaveAttribute("data-motion", "off")
  fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientY: 80 })
  fireEvent.pointerMove(handle, { pointerId: 1, clientY: 40 })
  expect(root).toHaveAttribute("data-t", "0.250")
  expect(root).toHaveAttribute("data-clip", "inset(75.0% 0 0 0)")
  expect(root).toHaveAttribute("data-edge", "straight")
  expect(root).toHaveAttribute("data-jitter", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "抬高" }))
  expect(root).toHaveAttribute("data-t", "0.500")
  expect(queued.size).toBe(0)
})

test("离开视口时停弹簧帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PaintLiftRail />)
  const root = rootOf(view.container)
  const handle = view.getByRole("slider", { name: "油漆手柄" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(handle, { key: "ArrowUp" })
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
