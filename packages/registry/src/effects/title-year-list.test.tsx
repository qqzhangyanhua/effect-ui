// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { TitleYearList } from "./title-year-list"

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
  const entry = getComponent("title-year-list")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='title-year-list']")
  if (!(node instanceof HTMLElement)) throw new Error("missing title year list")
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

test("片名年份控件起始值等于默认", async () => {
  expect(getComponent("title-year-list")?.batch).toBe(72)
  expect(getComponent("title-year-list")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("count")).toBe(7)
  expect(start("leading")).toBe(1)
  const view = render(<TitleYearList />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "title-year")
  expect(root).toHaveAttribute("data-layout", "title-list")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-year", "2018")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-rail='year']")).toBeNull()
  const active = view.getByRole("option", { name: "Alpha, 2018" })
  expect(active).toHaveAttribute("data-active", "yes")
  expect(active).toHaveAttribute("data-opacity", "1.00")
  const year = active.querySelector("sup[data-part='year']")
  expect(year).toHaveTextContent("2018")
  expect(year?.className).toContain("align-super")
  expect(view.getByRole("status")).toHaveTextContent("Alpha, 2018")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("焦点项更亮更重，邻项变淡", () => {
  const view = render(<TitleYearList />)
  const active = view.getByRole("option", { name: "Alpha, 2018" })
  const next = view.getByRole("option", { name: "Bravo, 2019" })
  expect(Number(active.getAttribute("data-weight"))).toBeGreaterThan(Number(next.getAttribute("data-weight")))
  expect(Number(next.getAttribute("data-opacity"))).toBeLessThan(1)
})

test("键盘、滚轮和点选改焦点", async () => {
  const view = render(<TitleYearList />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "片名列表" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-year", "2019")
  expect(root).toHaveAttribute("data-state", "scrolling")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.wheel(list, { deltaY: 40 })
  expect(root).toHaveAttribute("data-index", "2")
  act(() => drain(10))
  fireEvent.click(view.getByRole("option", { name: "Echo, 2022" }))
  expect(root).toHaveAttribute("data-index", "4")
  expect(root).toHaveAttribute("data-title", "Echo")
})

test("count 收起末项，年份仍贴在标题上", () => {
  const view = render(<TitleYearList count={6} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "6")
  expect(view.getByRole("option", { name: "Foxtrot, 2023" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Golf, 2024" })).toBeNull()
  expect(view.queryByRole("option", { name: "Hotel, 2025" })).toBeNull()
})

test("减弱动效瞬时切焦点", () => {
  installMedia({ reduced: true })
  const view = render(<TitleYearList />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "片名列表" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(list, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-index", "0")
  expect(queued.size).toBe(0)
})

test("离开视口时停惯性帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<TitleYearList />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "片名列表" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-state", "scrolling")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
