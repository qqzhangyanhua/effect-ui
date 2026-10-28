// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { GaugeSentimentSweep, sentimentAt } from "./gauge-sentiment-sweep"

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
  const entry = getComponent("gauge-sentiment-sweep")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='gauge-sentiment-sweep']")
  if (!(node instanceof HTMLElement)) throw new Error("missing gauge")
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

test("情绪针停在 Neutral，控件起始值等于默认", async () => {
  expect(getComponent("gauge-sentiment-sweep")?.batch).toBe(75)
  expect(getComponent("gauge-sentiment-sweep")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("zones")).toBe(5)
  expect(start("snap")).toBe(true)
  const view = render(<GaugeSentimentSweep />)
  const root = rootOf(view.container)
  const sample = sentimentAt(0.5, 5)
  expect(root).toHaveAttribute("data-ritual", "sentiment-arc")
  expect(root).toHaveAttribute("data-value", "0.50")
  expect(root).toHaveAttribute("data-zone", String(sample.index))
  expect(root).toHaveAttribute("data-label", "Neutral")
  expect(root).toHaveAttribute("data-theta", "90")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-snap", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(view.getByRole("button", { name: "Neutral" })).toHaveAttribute("data-active", "on")
  expect(view.getByRole("status")).toHaveTextContent("Neutral")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖到右侧后吸附到 Strong up，方向键进入 Up", async () => {
  const onValueChange = vi.fn()
  const view = render(<GaugeSentimentSweep onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const arc = view.getByRole("slider", { name: "情绪指针" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const before = Number(root.getAttribute("data-up"))
  fireEvent.pointerDown(arc, { clientX: 260, clientY: 142, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-label", "Strong up")
  expect(root.getAttribute("data-value")).not.toBe("0.50")
  fireEvent.pointerUp(arc, { clientX: 260, clientY: 142, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-value", "0.90")
  expect(root).toHaveAttribute("data-label", "Strong up")
  expect(root).toHaveAttribute("data-zone", "4")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(Number(root.getAttribute("data-up"))).toBeGreaterThan(before)
  expect(onValueChange).toHaveBeenCalled()
  fireEvent.keyDown(arc, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-label", "Up")
  expect(root).toHaveAttribute("data-value", "0.70")
})

test("关闭吸附时停在落点，三区用 Up 和 Down", async () => {
  const loose = render(<GaugeSentimentSweep snap={false} />)
  const looseRoot = rootOf(loose.container)
  const arc = loose.getByRole("slider", { name: "情绪指针" })
  await waitFor(() => expect(looseRoot).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(arc, { clientX: 260, clientY: 142, button: 0, pointerId: 1 })
  fireEvent.pointerUp(arc, { clientX: 260, clientY: 142, pointerId: 1 })
  expect(looseRoot).toHaveAttribute("data-snap", "off")
  expect(looseRoot).toHaveAttribute("data-value", "1.00")
  expect(looseRoot).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  loose.unmount()
  const view = render(<GaugeSentimentSweep zones={3} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-zones", "3")
  expect(root).toHaveAttribute("data-label", "Neutral")
  fireEvent.keyDown(view.getByRole("slider", { name: "情绪指针" }), { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-label", "Up")
  expect(root).toHaveAttribute("data-value", sentimentAt(0.83, 3).center.toFixed(2))
  fireEvent.click(view.getByRole("button", { name: "Down" }))
  expect(root).toHaveAttribute("data-label", "Down")
  expect(root).toHaveAttribute("data-value", "0.17")
})

test("减弱动效瞬时跳针，离开视口停吸附帧", async () => {
  installMedia({ reduced: true })
  const reduced = render(<GaugeSentimentSweep />)
  const reducedRoot = rootOf(reduced.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(reduced.getByRole("slider", { name: "情绪指针" }), { key: "ArrowRight" })
  expect(reducedRoot).toHaveAttribute("data-label", "Up")
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  reduced.unmount()

  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<GaugeSentimentSweep />)
  const root = rootOf(view.container)
  const arc = view.getByRole("slider", { name: "情绪指针" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(arc, { clientX: 260, clientY: 142, button: 0, pointerId: 1 })
  fireEvent.pointerUp(arc, { clientX: 260, clientY: 142, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
