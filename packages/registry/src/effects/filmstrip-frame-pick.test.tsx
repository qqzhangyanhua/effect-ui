// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { FilmstripFramePick } from "./filmstrip-frame-pick"

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
  const entry = getComponent("filmstrip-frame-pick")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='filmstrip-frame-pick']")
  if (!(node instanceof HTMLElement)) throw new Error("missing filmstrip")
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

test("胶片帧控件起始值等于默认，预览对准第一帧", async () => {
  expect(getComponent("filmstrip-frame-pick")?.batch).toBe(73)
  expect(getComponent("filmstrip-frame-pick")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("count")).toBe(10)
  expect(start("snap")).toBe(true)
  const view = render(<FilmstripFramePick />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-layout", "frame-pick")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-frame", "a")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-year]")).toBeNull()
  expect(root.querySelector("[data-rail='year']")).toBeNull()
  expect(root.querySelector("[data-part='preview']")).toHaveAttribute("data-frame", "a")
  expect(view.getByRole("option", { name: "Frame A" })).toHaveAttribute("data-active", "yes")
  expect(view.getByRole("status")).toHaveTextContent("Frame 1 of 10")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("焦点帧比邻帧更大", () => {
  const view = render(<FilmstripFramePick />)
  const active = view.getByRole("option", { name: "Frame A" })
  const next = view.getByRole("option", { name: "Frame B" })
  expect(Number(active.getAttribute("data-scale"))).toBeGreaterThan(Number(next.getAttribute("data-scale")))
})

test("键盘、滚轮和点选同步预览", async () => {
  const onIndexChange = vi.fn()
  const view = render(<FilmstripFramePick onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "胶片条" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-frame", "b")
  expect(root.querySelector("[data-part='preview']")).toHaveAttribute("data-frame", "b")
  expect(root).toHaveAttribute("data-state", "settle")
  expect(view.getByRole("status")).toHaveTextContent("Frame 2 of 10")
  expect(onIndexChange).toHaveBeenCalledWith(1)
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.wheel(strip, { deltaY: 40 })
  expect(root).toHaveAttribute("data-index", "2")
  act(() => drain(10))
  fireEvent.click(view.getByRole("option", { name: "Frame E" }))
  expect(root).toHaveAttribute("data-index", "4")
  expect(root).toHaveAttribute("data-label", "Frame E")
})

test("拖动胶片时预览跟着走，松手吸附", async () => {
  const view = render(<FilmstripFramePick />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "胶片条" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(strip, { clientX: 200, button: 0, pointerId: 1 })
  fireEvent.pointerMove(strip, { clientX: 112, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root.querySelector("[data-part='preview']")).toHaveAttribute("data-frame", "b")
  fireEvent.pointerUp(strip, { clientX: 112, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
})

test("count 收起后面的帧，关闭吸附时松手不再排队", async () => {
  const view = render(<FilmstripFramePick count={8} snap={false} />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "胶片条" })
  expect(root).toHaveAttribute("data-count", "8")
  expect(root).toHaveAttribute("data-snap", "off")
  expect(view.getByRole("option", { name: "Frame H" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Frame I" })).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("减弱动效瞬时切帧", () => {
  installMedia({ reduced: true })
  const view = render(<FilmstripFramePick />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "胶片条" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(strip, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-frame", "b")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("离开视口时停吸附帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<FilmstripFramePick />)
  const root = rootOf(view.container)
  const strip = view.getByRole("listbox", { name: "胶片条" })
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
