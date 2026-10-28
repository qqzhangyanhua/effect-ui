// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DragLockEscape } from "./drag-lock-escape"

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
  const entry = getComponent("drag-lock-escape")
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

test("拖锁控件起始值等于默认", async () => {
  expect(start("radius")).toBe(88)
  expect(start("threshold")).toBe(1)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  const view = render(<DragLockEscape />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']")
  expect(root).toHaveAttribute("data-ritual", "drag-lock")
  expect(root).toHaveAttribute("data-radius", "88")
  expect(root).toHaveAttribute("data-threshold", "1")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.6")
  expect(root).toHaveAttribute("data-state", "locked")
  expect(root).toHaveAttribute("data-distance", "0.0")
  expect(root).toHaveAttribute("data-outside", "off")
  expect(root?.querySelector("[data-safe-circle]")).toBeInTheDocument()
  expect(view.queryByRole("button", { name: "Unlock" })).not.toBeInTheDocument()
  expect(view.getByRole("status")).toHaveTextContent("拖拽进度 0%")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖出安全圆才解锁，而且只解锁一次", async () => {
  const onUnlock = vi.fn()
  const view = render(<DragLockEscape onUnlock={onUnlock} />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']") as HTMLElement
  const lock = view.getByRole("button", { name: "锁" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(lock, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(lock, { pointerId: 1, clientX: 40, clientY: 0 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-outside", "off")
  expect(onUnlock).not.toHaveBeenCalled()
  fireEvent.pointerMove(lock, { pointerId: 1, clientX: 200, clientY: 0 })
  expect(onUnlock).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "unlocked")
  expect(root).toHaveAttribute("data-outside", "on")
  expect(view.getByRole("status")).toHaveTextContent("已解锁")
  fireEvent.pointerMove(lock, { pointerId: 1, clientX: 260, clientY: 20 })
  fireEvent.pointerUp(lock, { pointerId: 1, clientX: 260, clientY: 20 })
  expect(onUnlock).toHaveBeenCalledTimes(1)
})

test("未出界松手会弹回圆心", async () => {
  const onUnlock = vi.fn()
  const view = render(<DragLockEscape onUnlock={onUnlock} />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']") as HTMLElement
  const lock = view.getByRole("button", { name: "锁" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(lock, { button: 0, pointerId: 1, clientX: 10, clientY: 10 })
  fireEvent.pointerMove(lock, { pointerId: 1, clientX: 50, clientY: 10 })
  fireEvent.pointerUp(lock, { pointerId: 1, clientX: 50, clientY: 10 })
  expect(root).toHaveAttribute("data-snapping", "on")
  expect(Number(root.getAttribute("data-distance"))).toBeGreaterThan(0)
  act(() => drain(20))
  expect(root).toHaveAttribute("data-state", "snapped-back")
  expect(root).toHaveAttribute("data-distance", "0.0")
  expect(root).toHaveAttribute("data-snapping", "off")
  expect(onUnlock).not.toHaveBeenCalled()
})

test("方向键把锁移出圆后，Enter 才解锁，Esc 复位", () => {
  const onUnlock = vi.fn()
  const view = render(<DragLockEscape onUnlock={onUnlock} />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']") as HTMLElement
  const lock = view.getByRole("button", { name: "锁" })
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-outside", "off")
  fireEvent.keyDown(lock, { key: "Enter" })
  expect(onUnlock).not.toHaveBeenCalled()
  expect(root).toHaveAttribute("data-state", "dragging")
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-outside", "on")
  expect(view.getByRole("status")).toHaveTextContent("已离开安全圆，按 Enter 确认")
  fireEvent.keyDown(lock, { key: "Enter" })
  expect(onUnlock).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "unlocked")
  fireEvent.keyDown(lock, { key: "Enter" })
  expect(onUnlock).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-state", "locked")
  expect(root).toHaveAttribute("data-distance", "0.0")
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  fireEvent.keyDown(lock, { key: "ArrowRight" })
  fireEvent.keyDown(lock, { key: "Enter" })
  expect(onUnlock).toHaveBeenCalledTimes(2)
})

test("减弱动效用 Unlock 一次完成", () => {
  installMedia({ reduced: true })
  const onUnlock = vi.fn()
  const view = render(<DragLockEscape onUnlock={onUnlock} />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root?.className).toContain("motion-reduce:transition-none")
  fireEvent.click(view.getByRole("button", { name: "Unlock" }))
  expect(onUnlock).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "unlocked")
  fireEvent.click(view.getByRole("button", { name: "Unlock" }))
  expect(onUnlock).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(root as HTMLElement, { key: "Escape" })
  expect(root).toHaveAttribute("data-state", "locked")
  fireEvent.click(view.getByRole("button", { name: "Unlock" }))
  expect(onUnlock).toHaveBeenCalledTimes(2)
})

test("离开视口后回弹帧暂停", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const onUnlock = vi.fn()
  const view = render(<DragLockEscape onUnlock={onUnlock} />)
  const root = view.container.querySelector("[data-slot='drag-lock-escape']") as HTMLElement
  const lock = view.getByRole("button", { name: "锁" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.pointerDown(lock, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(lock, { pointerId: 1, clientX: 30, clientY: 0 })
  fireEvent.pointerUp(lock, { pointerId: 1, clientX: 30, clientY: 0 })
  const distance = root.getAttribute("data-distance")
  expect(root).toHaveAttribute("data-snapping", "on")
  expect(Number(distance)).toBeGreaterThan(0)
  act(() => drain(20))
  expect(root.getAttribute("data-distance")).toBe(distance)
  expect(root).not.toHaveAttribute("data-state", "snapped-back")
  expect(onUnlock).not.toHaveBeenCalled()
})
