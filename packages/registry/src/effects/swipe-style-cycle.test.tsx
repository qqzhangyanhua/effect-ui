// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SwipeStyleCycle } from "./swipe-style-cycle"

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
  const entry = getComponent("swipe-style-cycle")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='swipe-style-cycle']")
  if (!(node instanceof HTMLElement)) throw new Error("missing swipe")
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

test("换肤控件起始值等于默认", async () => {
  expect(getComponent("swipe-style-cycle")?.batch).toBe(71)
  expect(getComponent("swipe-style-cycle")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("count")).toBe(3)
  expect(start("threshold")).toBe(0.28)
  const view = render(<SwipeStyleCycle />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "style-cycle")
  expect(root).toHaveAttribute("data-theme", "0")
  expect(root).toHaveAttribute("data-theme-name", "默认")
  expect(root).toHaveAttribute("data-count", "3")
  expect(root).toHaveAttribute("data-threshold", "0.28")
  expect(root).toHaveAttribute("data-actions", "none")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.querySelector("[data-action]")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("当前主题 默认")
  expect(view.getByText("同一张卡片")).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键和横滑切换皮肤，不足阈值弹回", async () => {
  const view = render(<SwipeStyleCycle />)
  const root = rootOf(view.container)
  const card = view.getByRole("group", { name: "风格卡片" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(card, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-theme", "1")
  expect(root).toHaveAttribute("data-theme-name", "强调")
  expect(view.getByText("同一张卡片")).toBeInTheDocument()
  fireEvent.keyDown(card, { key: "ArrowLeft" })
  fireEvent.keyDown(card, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-theme", "2")
  expect(root).toHaveAttribute("data-theme-name", "深底")
  fireEvent.pointerDown(card, { clientX: 200, pointerId: 1 })
  fireEvent.pointerUp(card, { clientX: 60, pointerId: 1 })
  expect(root).toHaveAttribute("data-theme", "0")
  expect(root).toHaveAttribute("data-state", "settle")
  act(() => drain(24))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-dx", "0")
  fireEvent.pointerDown(card, { clientX: 100, pointerId: 1 })
  fireEvent.pointerUp(card, { clientX: 130, pointerId: 1 })
  expect(root).toHaveAttribute("data-theme", "0")
  expect(root).toHaveAttribute("data-state", "settle")
  expect(root).not.toHaveAttribute("data-dx", "0")
  act(() => drain(24))
  expect(root).toHaveAttribute("data-dx", "0")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("四套皮肤可以到软底", () => {
  const view = render(<SwipeStyleCycle count={4} />)
  const root = rootOf(view.container)
  const card = view.getByRole("group", { name: "风格卡片" })
  fireEvent.keyDown(card, { key: "ArrowRight" })
  fireEvent.keyDown(card, { key: "ArrowRight" })
  fireEvent.keyDown(card, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-theme-name", "软底")
  expect(view.getByRole("status")).toHaveTextContent("当前主题 软底")
})

test("减弱动效忽略拖动，按钮瞬时切换", () => {
  installMedia({ reduced: true })
  const view = render(<SwipeStyleCycle />)
  const root = rootOf(view.container)
  const card = view.getByRole("group", { name: "风格卡片" })
  expect(root).toHaveAttribute("data-motion", "off")
  fireEvent.pointerDown(card, { clientX: 200, pointerId: 1 })
  fireEvent.pointerUp(card, { clientX: 20, pointerId: 1 })
  expect(root).toHaveAttribute("data-theme", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Next style" }))
  expect(root).toHaveAttribute("data-theme", "1")
  expect(root).toHaveAttribute("data-theme-name", "强调")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("离开视口时回弹归零", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SwipeStyleCycle />)
  const root = rootOf(view.container)
  const card = view.getByRole("group", { name: "风格卡片" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(card, { clientX: 100, pointerId: 1 })
  fireEvent.pointerUp(card, { clientX: 130, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-state", "idle")
    expect(root).toHaveAttribute("data-dx", "0")
  })
})
