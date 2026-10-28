// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BorderFocusStrip } from "./border-focus-strip"

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
  const entry = getComponent("border-focus-strip")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='border-focus-strip']")
  if (!(node instanceof HTMLElement)) throw new Error("missing border strip")
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

test("描边海报条控件起始值等于默认", async () => {
  expect(getComponent("border-focus-strip")?.batch).toBe(73)
  expect(getComponent("border-focus-strip")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("count")).toBe(8)
  expect(start("snap")).toBe(true)
  const view = render(<BorderFocusStrip />)
  const root = rootOf(view.container)
  const focus = view.getByRole("option", { name: "Series 01" })
  const next = view.getByRole("option", { name: "Series 02" })
  expect(root).toHaveAttribute("data-layout", "poster-strip")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-title", "Series 01")
  expect(focus).toHaveAttribute("data-active", "yes")
  expect(Number(focus.getAttribute("data-border"))).toBeGreaterThan(0)
  expect(Number(focus.getAttribute("data-scale"))).toBeGreaterThan(1)
  expect(next).toHaveAttribute("data-border", "0")
  expect(next).toHaveAttribute("data-scale", "1.00")
  expect(Number(next.getAttribute("data-opacity"))).toBeLessThan(1)
  expect(view.getByRole("status")).toHaveTextContent("Series 01")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("键盘、滚轮和点选把粗边交给下一张", async () => {
  const onIndexChange = vi.fn()
  const view = render(<BorderFocusStrip onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "海报条" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-title", "Series 02")
  expect(root).toHaveAttribute("data-state", "settle")
  expect(view.getByRole("option", { name: "Series 02" })).toHaveAttribute("data-active", "yes")
  expect(Number(view.getByRole("option", { name: "Series 02" }).getAttribute("data-border"))).toBeGreaterThan(0)
  expect(view.getByRole("option", { name: "Series 01" })).toHaveAttribute("data-border", "0")
  expect(onIndexChange).toHaveBeenCalledWith(1)
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.wheel(strip, { deltaX: 20 })
  expect(root).toHaveAttribute("data-index", "2")
  act(() => drain(10))
  fireEvent.click(view.getByRole("option", { name: "Series 05" }))
  expect(root).toHaveAttribute("data-index", "4")
  expect(view.getByRole("status")).toHaveTextContent("Series 05")
})

test("横拖改焦点", async () => {
  const view = render(<BorderFocusStrip />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "海报条" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(strip, { clientX: 280, button: 0, pointerId: 1 })
  fireEvent.pointerMove(strip, { clientX: 140, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "scrolling")
  fireEvent.pointerUp(strip, { clientX: 140, pointerId: 1 })
  expect(root).toHaveAttribute("data-title", "Series 02")
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
})

test("count 收起末张，关闭吸附时不再排队", async () => {
  const view = render(<BorderFocusStrip count={6} snap={false} />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "海报条" })
  expect(root).toHaveAttribute("data-count", "6")
  expect(view.getByRole("option", { name: "Series 06" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Series 07" })).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("减弱动效保留描边，不再放大", () => {
  installMedia({ reduced: true })
  const view = render(<BorderFocusStrip />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "海报条" })
  const focus = view.getByRole("option", { name: "Series 01" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(focus).toHaveAttribute("data-scale", "1.00")
  expect(Number(focus.getAttribute("data-border"))).toBeGreaterThan(0)
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("option", { name: "Series 02" })).toHaveAttribute("data-scale", "1.00")
  expect(queued.size).toBe(0)
})

test("离开视口时停吸附帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<BorderFocusStrip />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "海报条" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
