// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { KnurlScrubDial } from "./knurl-scrub-dial"

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
  const entry = getComponent("knurl-scrub-dial")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='knurl-scrub-dial']")
  if (!(node instanceof HTMLElement)) throw new Error("missing knurl dial")
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

test("滚花拨盘控件起始值等于默认", async () => {
  expect(getComponent("knurl-scrub-dial")?.batch).toBe(73)
  expect(getComponent("knurl-scrub-dial")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("step")).toBe(1)
  expect(start("axis")).toBe("x")
  const view = render(<KnurlScrubDial />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-layout", "cylinder")
  expect(root).toHaveAttribute("data-value", "50")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[role='option']")).toBeNull()
  expect(view.getByRole("slider", { name: "滚花拨盘" })).toHaveAttribute("aria-valuenow", "50")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("水平拖动让齿纹偏移和数值一起变", async () => {
  const onValueChange = vi.fn()
  const view = render(<KnurlScrubDial onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "滚花拨盘" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const before = Number(root.getAttribute("data-roll"))
  fireEvent.pointerDown(dial, { clientX: 100, clientY: 40, button: 0, pointerId: 1 })
  fireEvent.pointerMove(dial, { clientX: 140, clientY: 40, pointerId: 1 })
  expect(root).toHaveAttribute("data-value", "69")
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(Number(root.getAttribute("data-roll"))).toBeGreaterThan(before)
  expect(onValueChange).toHaveBeenCalledWith(69)
  fireEvent.pointerUp(dial, { clientX: 140, clientY: 40, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "idle")
})

test("方向键、按钮和纵向轴都能改值", async () => {
  const view = render(<KnurlScrubDial />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "滚花拨盘" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(dial, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-value", "51")
  expect(root).toHaveAttribute("data-state", "settle")
  act(() => drain(10))
  fireEvent.click(view.getByRole("button", { name: "增大" }))
  expect(root).toHaveAttribute("data-value", "52")
  cleanup()
  const vertical = render(<KnurlScrubDial axis="y" step={5} />)
  const yRoot = rootOf(vertical.container)
  const yDial = vertical.getByRole("slider", { name: "滚花拨盘" })
  await waitFor(() => expect(yRoot).toHaveAttribute("data-live", "on"))
  expect(yRoot).toHaveAttribute("data-axis", "y")
  fireEvent.pointerDown(yDial, { clientX: 20, clientY: 200, button: 0, pointerId: 2 })
  fireEvent.pointerMove(yDial, { clientX: 20, clientY: 160, pointerId: 2 })
  expect(yRoot).toHaveAttribute("data-value", "70")
})

test("连续模式下松手进入惯性", async () => {
  const view = render(<KnurlScrubDial step={0} />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "滚花拨盘" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(dial, { clientX: 80, button: 0, pointerId: 1 })
  fireEvent.pointerMove(dial, { clientX: 120, pointerId: 1 })
  expect(root).toHaveAttribute("data-value", "69.2")
  fireEvent.pointerUp(dial, { clientX: 120, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "coast")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(Number(root.getAttribute("data-value"))).toBeGreaterThan(69.2)
  expect(root).toHaveAttribute("data-state", "idle")
})

test("减弱动效用滑块瞬时改值，圆柱不再排队", async () => {
  installMedia({ reduced: true })
  const view = render(<KnurlScrubDial />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "滚花拨盘" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-rolling", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(view.getByRole("slider", { name: "数值" })).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(dial, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-value", "51")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.change(view.getByRole("slider", { name: "数值" }), { target: { value: "20" } })
  expect(root).toHaveAttribute("data-value", "20")
  expect(queued.size).toBe(0)
})

test("离开视口时停惯性帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<KnurlScrubDial />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "滚花拨盘" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(dial, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-value", "51")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
