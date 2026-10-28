// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ArcFilmCarousel } from "./arc-film-carousel"

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
  const entry = getComponent("arc-film-carousel")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='arc-film-carousel']")
  if (!(node instanceof HTMLElement)) throw new Error("missing arc film")
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

test("弧形胶片控件起始值等于默认，焦点在弧顶", async () => {
  expect(getComponent("arc-film-carousel")?.batch).toBe(73)
  expect(getComponent("arc-film-carousel")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("count")).toBe(7)
  expect(start("depth")).toBe(0.55)
  const view = render(<ArcFilmCarousel />)
  const root = rootOf(view.container)
  const focus = view.getByRole("option", { name: "Alpha Studio" })
  const side = view.getByRole("option", { name: "Bravo Atelier" })
  expect(root).toHaveAttribute("data-layout", "bent-strip")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-title", "Alpha Studio")
  expect(root.querySelector("[data-media]")).toBeNull()
  expect(focus).toHaveAttribute("data-y", "0")
  expect(focus).toHaveAttribute("data-active", "yes")
  expect(Number(side.getAttribute("data-y"))).toBeGreaterThan(0)
  expect(Number(focus.getAttribute("data-scale"))).toBeGreaterThan(Number(side.getAttribute("data-scale")))
  expect(view.getByRole("status")).toHaveTextContent("Alpha Studio")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("箭头、键盘、滚轮和点选换焦点", async () => {
  const onIndexChange = vi.fn()
  const view = render(<ArcFilmCarousel onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  const arc = view.getByRole("listbox", { name: "弧形胶片" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "下一帧" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-title", "Bravo Atelier")
  expect(root).toHaveAttribute("data-state", "sliding")
  expect(onIndexChange).toHaveBeenCalledWith(1)
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(arc, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "2")
  act(() => drain(10))
  fireEvent.wheel(arc, { deltaX: 30 })
  expect(root).toHaveAttribute("data-index", "3")
  act(() => drain(10))
  fireEvent.click(view.getByRole("option", { name: "Echo Line" }))
  expect(root).toHaveAttribute("data-index", "4")
  expect(view.getByRole("option", { name: "Echo Line" })).toHaveAttribute("data-y", "0")
})

test("拖动让下一帧来到弧顶", async () => {
  const view = render(<ArcFilmCarousel />)
  const root = rootOf(view.container)
  const arc = view.getByRole("listbox", { name: "弧形胶片" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(arc, { clientX: 300, button: 0, pointerId: 1 })
  fireEvent.pointerMove(arc, { clientX: 204, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "sliding")
  fireEvent.pointerUp(arc, { clientX: 204, pointerId: 1 })
  expect(root).toHaveAttribute("data-title", "Bravo Atelier")
  expect(queued.size).toBeGreaterThan(0)
})

test("count 收起弧尾的帧", () => {
  const view = render(<ArcFilmCarousel count={5} depth={1} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "5")
  expect(root).toHaveAttribute("data-depth", "1")
  expect(view.getByRole("option", { name: "Echo Line" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Foxtrot Hall" })).toBeNull()
})

test("减弱动效瞬时换焦", () => {
  installMedia({ reduced: true })
  const view = render(<ArcFilmCarousel />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "下一帧" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("option", { name: "Bravo Atelier" })).toHaveAttribute("data-y", "0")
  expect(queued.size).toBe(0)
})

test("离开视口时停滑动帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ArcFilmCarousel />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "下一帧" }))
  expect(root).toHaveAttribute("data-state", "sliding")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
