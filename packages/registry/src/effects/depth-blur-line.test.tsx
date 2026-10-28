// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DepthBlurLine } from "./depth-blur-line"

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
  const entry = getComponent("depth-blur-line")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='depth-blur-line']")
  if (!(node instanceof HTMLElement)) throw new Error("missing depth blur")
  return node
}

function blurOf(name: string, falloff: "linear" | "quadratic") {
  const view = render(<DepthBlurLine falloff={falloff} intensity={1} lines={7} />)
  const value = Number(view.getByRole("option", { name }).getAttribute("data-blur"))
  view.unmount()
  return value
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

test("景深标题控件起始值等于默认", async () => {
  expect(getComponent("depth-blur-line")?.batch).toBe(73)
  expect(getComponent("depth-blur-line")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("lines")).toBe(5)
  expect(start("falloff")).toBe("linear")
  const view = render(<DepthBlurLine />)
  const root = rootOf(view.container)
  const focus = view.getByRole("option", { name: "North wind" })
  const next = view.getByRole("option", { name: "Quiet harbor" })
  expect(root).toHaveAttribute("data-layout", "line-stack")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-line", "North wind")
  expect(root.querySelector("sup")).toBeNull()
  expect(focus).toHaveAttribute("data-blur", "0")
  expect(focus).toHaveAttribute("data-active", "yes")
  expect(Number(next.getAttribute("data-blur"))).toBeGreaterThan(0)
  expect(view.getByRole("status")).toHaveTextContent("North wind")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("二次衰减比线性更糊远处的行", () => {
  expect(blurOf("Pale lantern", "quadratic")).toBeGreaterThan(blurOf("Pale lantern", "linear"))
})

test("键盘、滚轮、拖动和点选换焦点行", async () => {
  const onIndexChange = vi.fn()
  const view = render(<DepthBlurLine onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "景深标题" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-line", "Quiet harbor")
  expect(root).toHaveAttribute("data-state", "shifting")
  expect(view.getByRole("option", { name: "Quiet harbor" })).toHaveAttribute("data-blur", "0")
  expect(Number(view.getByRole("option", { name: "North wind" }).getAttribute("data-blur"))).toBeGreaterThan(0)
  expect(onIndexChange).toHaveBeenCalledWith(1)
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.wheel(list, { deltaY: 24 })
  expect(root).toHaveAttribute("data-index", "2")
  act(() => drain(10))
  fireEvent.click(view.getByRole("option", { name: "North wind" }))
  expect(root).toHaveAttribute("data-index", "0")
  act(() => drain(10))
  fireEvent.pointerDown(list, { clientY: 200, button: 0, pointerId: 1 })
  fireEvent.pointerMove(list, { clientY: 136, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-line", "Quiet harbor")
})

test("lines 收起末行", () => {
  const view = render(<DepthBlurLine lines={4} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-lines", "4")
  expect(view.getByRole("option", { name: "Open meadow" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Soft meridian" })).toBeNull()
})

test("减弱动效用透明度，不再模糊", () => {
  installMedia({ reduced: true })
  const view = render(<DepthBlurLine />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "景深标题" })
  const next = view.getByRole("option", { name: "Quiet harbor" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(next).toHaveAttribute("data-blur", "0")
  expect(Number(next.getAttribute("data-opacity"))).toBeLessThan(1)
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("option", { name: "North wind" })).toHaveAttribute("data-blur", "0")
  expect(queued.size).toBe(0)
})

test("离开视口时停换焦帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<DepthBlurLine />)
  const root = rootOf(view.container)
  const list = view.getByRole("listbox", { name: "景深标题" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(list, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-state", "shifting")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
