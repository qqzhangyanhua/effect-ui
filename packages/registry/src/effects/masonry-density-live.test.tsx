// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { MasonryDensityLive } from "./masonry-density-live"

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
  const entry = getComponent("masonry-density-live")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='masonry-density-live']")
  if (!(node instanceof HTMLElement)) throw new Error("missing masonry")
  return node
}

function heightOf(container: HTMLElement) {
  const tile = container.querySelector("[data-tile='a']")
  return Number(tile?.getAttribute("data-height"))
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

test("砌体默认密度，控件起始值等于默认", async () => {
  expect(getComponent("masonry-density-live")?.batch).toBe(74)
  expect(getComponent("masonry-density-live")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("size")).toBe(128)
  expect(start("gap")).toBe(12)
  expect(start("padding")).toBe(16)
  expect(start("columns")).toBe(3)
  const view = render(<MasonryDensityLive />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "masonry-density")
  expect(root).toHaveAttribute("data-size", "128")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-padding", "16")
  expect(root).toHaveAttribute("data-columns", "3")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelectorAll("[data-tile]")).toHaveLength(12)
  expect(root.querySelector("[data-part='board']")).toHaveAttribute("data-layout", "masonry")
  expect(view.getByText("Tile A")).toBeInTheDocument()
  expect(view.getByText("Tile L")).toBeInTheDocument()
  expect(heightOf(view.container)).toBeGreaterThan(0)
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("Size、Gap、Padding 和列数即时重排", async () => {
  const onLayoutChange = vi.fn()
  const view = render(<MasonryDensityLive onLayoutChange={onLayoutChange} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const before = heightOf(view.container)
  fireEvent.change(view.getByRole("slider", { name: "Size" }), { target: { value: "200" } })
  expect(root).toHaveAttribute("data-size", "200")
  expect(heightOf(view.container)).toBeGreaterThan(before)
  expect(root).toHaveAttribute("data-state", "adjusting")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(8))
  expect(root).toHaveAttribute("data-state", "settled")
  fireEvent.keyDown(view.getByRole("slider", { name: "Gap" }), { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-gap", "14")
  fireEvent.change(view.getByRole("slider", { name: "Padding" }), { target: { value: "32" } })
  expect(root).toHaveAttribute("data-padding", "32")
  expect(onLayoutChange).toHaveBeenCalledWith({ size: 200, gap: 12, padding: 16, columns: 3 })
  expect(onLayoutChange).toHaveBeenLastCalledWith({ size: 200, gap: 14, padding: 32, columns: 3 })
})

test("列数和强度改变布局，格子仍然分列", () => {
  const view = render(<MasonryDensityLive columns={4} intensity={1} />)
  const root = rootOf(view.container)
  const board = root.querySelector("[data-part='board']")
  expect(root).toHaveAttribute("data-columns", "4")
  expect(board).toHaveStyle({ columnCount: "4" })
  const calm = render(<MasonryDensityLive intensity={0} />)
  expect(heightOf(view.container)).toBeGreaterThan(heightOf(calm.container))
  expect(root.querySelectorAll("[data-tile]")).toHaveLength(12)
})

test("减弱动效瞬时改密度", () => {
  installMedia({ reduced: true })
  const view = render(<MasonryDensityLive />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.change(view.getByRole("slider", { name: "Gap" }), { target: { value: "28" } })
  expect(root).toHaveAttribute("data-gap", "28")
  expect(root).toHaveAttribute("data-state", "settled")
  expect(queued.size).toBe(0)
})

test("离开视口时停落定帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MasonryDensityLive />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.change(view.getByRole("slider", { name: "Size" }), { target: { value: "160" } })
  expect(root).toHaveAttribute("data-state", "adjusting")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "settled"))
  expect(root).toHaveAttribute("data-size", "160")
})
