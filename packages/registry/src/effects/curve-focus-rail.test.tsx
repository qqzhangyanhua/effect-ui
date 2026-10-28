// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { CurveFocusRail } from "./curve-focus-rail"

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
  const entry = getComponent("curve-focus-rail")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='curve-focus-rail']")
  if (!(node instanceof HTMLElement)) throw new Error("missing curve")
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

test("弧形焦点控件起始值等于默认", async () => {
  expect(getComponent("curve-focus-rail")?.batch).toBe(71)
  expect(getComponent("curve-focus-rail")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("count")).toBe(5)
  expect(start("spread")).toBe(2)
  const view = render(<CurveFocusRail />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "curve-rail")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-count", "5")
  expect(root).toHaveAttribute("data-spread", "2")
  expect(root).toHaveAttribute("data-layout", "arc")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.querySelector("[data-media]")).toHaveAttribute("data-media", "capture")
  expect(view.getByRole("status")).toHaveTextContent("Capture")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键、点选和滚轮同步媒体", async () => {
  const view = render(<CurveFocusRail />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "弧形焦点" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root.querySelector("[data-media]")).toHaveAttribute("data-media", "triage")
  expect(root.querySelector("[data-media-title]")).toHaveAttribute("data-media-title", "Triage")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(list, { key: "ArrowUp" })
  fireEvent.keyDown(list, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.click(view.getByRole("option", { name: "Triage" }))
  expect(root).toHaveAttribute("data-index", "1")
  fireEvent.wheel(list, { deltaY: 40 })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root.querySelector("[data-media]")).toHaveAttribute("data-media", "align")
  expect(view.getByRole("status")).toHaveTextContent("Align")
})

test("大幅拖动带惯性，小幅拖动留在原地", async () => {
  const view = render(<CurveFocusRail />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "弧形焦点" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(list, { clientY: 200, pointerId: 1 })
  fireEvent.pointerUp(list, { clientY: 80, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root.querySelector("[data-media-title]")).toHaveAttribute("data-media-title", "Align")
  expect(root).toHaveAttribute("data-state", "scrolling")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-index", "2")
  fireEvent.pointerDown(list, { clientY: 200, pointerId: 1 })
  fireEvent.pointerUp(list, { clientY: 180, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("spread 会藏起远处条目", () => {
  const view = render(<CurveFocusRail spread={1} />)
  const root = rootOf(view.container)
  const options = view.getAllByRole("option")
  expect(root).toHaveAttribute("data-spread", "1")
  expect(options[2]).toHaveAttribute("data-hidden", "yes")
  expect(options[0]).toHaveAttribute("data-hidden", "no")
})

test("减弱动效改成平铺并瞬时换项", () => {
  installMedia({ reduced: true })
  const view = render(<CurveFocusRail />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "弧形焦点" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-layout", "flat")
  expect(root).toHaveAttribute("data-ease", "0")
  for (const option of view.getAllByRole("option")) {
    expect(option).toHaveAttribute("data-rotate", "0.0")
    expect(option).toHaveAttribute("data-hidden", "no")
  }
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("离开视口时惯性停止但焦点保留", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<CurveFocusRail />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "弧形焦点" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(list, { clientY: 200, pointerId: 1 })
  fireEvent.pointerUp(list, { clientY: 80, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-state", "scrolling")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-index", "2")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
  act(() => drain(12))
  expect(root).toHaveAttribute("data-index", "2")
})
