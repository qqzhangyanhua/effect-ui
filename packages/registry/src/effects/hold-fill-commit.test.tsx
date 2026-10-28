// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HoldFillCommit } from "./hold-fill-commit"

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
  const entry = getComponent("hold-fill-commit")
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

test("按住填环控件起始值等于默认，demo 从圆环开始", async () => {
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("threshold")).toBe(1)
  expect(start("mode")).toBe("ring")
  const view = render(<HoldFillCommit />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']")
  expect(root).toHaveAttribute("data-ritual", "hold-fill")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-threshold", "1")
  expect(root).toHaveAttribute("data-mode", "ring")
  expect(root).toHaveAttribute("data-state", "ready")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root?.querySelector("[data-ring]")).toBeInTheDocument()
  expect(root?.querySelector("[data-rail]")).toBeNull()
  expect(root?.querySelector("[data-bar]")).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("未满松手会回落，并且不提交", async () => {
  const onCommit = vi.fn()
  const view = render(<HoldFillCommit onCommit={onCommit} />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']") as HTMLElement
  const hold = view.getByRole("button", { name: "按住提交" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(hold, { button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-holding", "on")
  act(() => drain(4))
  const mid = Number(root.getAttribute("data-progress"))
  expect(mid).toBeGreaterThan(0)
  expect(mid).toBeLessThan(1)
  fireEvent.pointerUp(hold, { pointerId: 1 })
  expect(root).toHaveAttribute("data-holding", "off")
  act(() => drain(4))
  expect(Number(root.getAttribute("data-progress"))).toBeLessThan(mid)
  expect(onCommit).not.toHaveBeenCalled()
  expect(root).not.toHaveAttribute("data-state", "committed")
})

test("填满只提交一次，Reset 之后可以再提交", async () => {
  const onCommit = vi.fn()
  const view = render(<HoldFillCommit onCommit={onCommit} />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']") as HTMLElement
  const hold = view.getByRole("button", { name: "按住提交" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(hold, { button: 0, pointerId: 1 })
  act(() => drain(70))
  expect(onCommit).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "committed")
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(view.getByRole("progressbar", { name: "按住进度" })).toHaveAttribute("aria-valuenow", "100")
  act(() => drain(10))
  fireEvent.pointerDown(view.getByRole("button", { name: "已提交" }), { button: 0, pointerId: 2 })
  act(() => drain(10))
  expect(onCommit).toHaveBeenCalledTimes(1)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "ready")
  expect(root).toHaveAttribute("data-progress", "0.000")
  const again = view.getByRole("button", { name: "按住提交" })
  fireEvent.pointerDown(again, { button: 0, pointerId: 3 })
  act(() => drain(70))
  expect(onCommit).toHaveBeenCalledTimes(2)
})

test("空格和 Enter 可以按住，松开就回落", async () => {
  const view = render(<HoldFillCommit />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']") as HTMLElement
  const hold = view.getByRole("button", { name: "按住提交" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(hold, { key: " " })
  expect(root).toHaveAttribute("data-holding", "on")
  expect(root).toHaveAttribute("data-state", "holding")
  act(() => drain(3))
  const mid = Number(root.getAttribute("data-progress"))
  expect(mid).toBeGreaterThan(0)
  fireEvent.keyUp(hold, { key: " " })
  expect(root).toHaveAttribute("data-holding", "off")
  act(() => drain(4))
  expect(Number(root.getAttribute("data-progress"))).toBeLessThan(mid)
  fireEvent.keyDown(hold, { key: "Enter" })
  expect(root).toHaveAttribute("data-holding", "on")
  fireEvent.keyUp(hold, { key: "Enter" })
  expect(root).toHaveAttribute("data-holding", "off")
})

test("底条模式没有圆环", () => {
  const view = render(<HoldFillCommit mode="bar" />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']")
  expect(root).toHaveAttribute("data-mode", "bar")
  expect(root?.querySelector("[data-bar]")).toBeInTheDocument()
  expect(root?.querySelector("[data-ring]")).toBeNull()
})

test("减弱动效点一次就提交", () => {
  installMedia({ reduced: true })
  const onCommit = vi.fn()
  const view = render(<HoldFillCommit onCommit={onCommit} />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root?.className).toContain("motion-reduce:transition-none")
  act(() => drain(10))
  expect(onCommit).not.toHaveBeenCalled()
  fireEvent.click(view.getByRole("button", { name: "提交" }))
  expect(onCommit).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "committed")
  expect(root).toHaveAttribute("data-progress", "1.000")
  fireEvent.click(view.getByRole("button", { name: "已提交" }))
  expect(onCommit).toHaveBeenCalledTimes(1)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  fireEvent.keyDown(view.getByRole("button", { name: "提交" }), { key: " " })
  expect(onCommit).toHaveBeenCalledTimes(2)
})

test("离开视口后按住不再累计", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const onCommit = vi.fn()
  const view = render(<HoldFillCommit onCommit={onCommit} />)
  const root = view.container.querySelector("[data-slot='hold-fill-commit']") as HTMLElement
  const hold = view.getByRole("button", { name: "按住提交" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.pointerDown(hold, { button: 0, pointerId: 1 })
  act(() => drain(30))
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-holding", "off")
  expect(onCommit).not.toHaveBeenCalled()
})
