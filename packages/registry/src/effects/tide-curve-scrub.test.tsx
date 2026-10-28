// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { TideCurveScrub, tideSample, tideSnap } from "./tide-curve-scrub"

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
  const entry = getComponent("tide-curve-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='tide-curve-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing tide")
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

test("潮位从 1.3 米下落开始，峰谷点可见", async () => {
  expect(getComponent("tide-curve-scrub")?.batch).toBe(76)
  expect(getComponent("tide-curve-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("marks")).toBe(true)
  expect(start("play")).toBe(false)
  expect(tideSample(0.2)).toEqual({ meters: 1.3, direction: "falling" })
  expect(tideSnap(0.12, true)).toBe(0.1)
  const view = render(<TideCurveScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "tide-curve")
  expect(root).toHaveAttribute("data-t", "0.20")
  expect(root).toHaveAttribute("data-meters", "1.3")
  expect(root).toHaveAttribute("data-direction", "falling")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByText("Station A")).toBeInTheDocument()
  expect(view.getByRole("status")).toHaveTextContent("1.3 m")
  expect(root.querySelectorAll("[data-mark]")).toHaveLength(5)
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖 playhead 改高度和涨落，松手吸到峰", async () => {
  const onValueChange = vi.fn()
  const view = render(<TideCurveScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const chart = view.getByRole("slider", { name: "Tide" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(chart, { clientX: 16, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.05")
  expect(root).toHaveAttribute("data-meters", "2.1")
  expect(root).toHaveAttribute("data-direction", "rising")
  expect(onValueChange).toHaveBeenCalledWith(0.05)
  fireEvent.pointerUp(chart, { clientX: 16, pointerId: 1 })
  fireEvent.keyDown(chart, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.07")
  fireEvent.pointerDown(chart, { clientX: 38, button: 0, pointerId: 2 })
  fireEvent.pointerUp(chart, { clientX: 38, pointerId: 2 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-t", "0.10")
  expect(root).toHaveAttribute("data-meters", "2.4")
  expect(root).toHaveAttribute("data-direction", "turn")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("Play 推进 t，空格暂停，关掉峰谷就不吸附", async () => {
  const view = render(<TideCurveScrub marks={false} />)
  const root = rootOf(view.container)
  const chart = view.getByRole("slider", { name: "Tide" })
  expect(root.querySelector("[data-mark]")).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(chart, { clientX: 38, button: 0, pointerId: 1 })
  fireEvent.pointerUp(chart, { clientX: 38, pointerId: 1 })
  expect(root).toHaveAttribute("data-t", "0.12")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  expect(root).toHaveAttribute("data-state", "playing")
  const before = root.getAttribute("data-t")
  act(() => drain(4))
  expect(root.getAttribute("data-t")).not.toBe(before)
  fireEvent.keyDown(chart, { key: " " })
  expect(root).toHaveAttribute("data-state", "paused")
})

test("减弱动效瞬时跳，离开视口停止播放", async () => {
  installMedia({ reduced: true })
  const reducedView = render(<TideCurveScrub play />)
  const reducedRoot = rootOf(reducedView.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(reducedRoot).toHaveAttribute("data-play", "off")
  expect(queued.size).toBe(0)
  fireEvent.click(reducedView.getByRole("button", { name: "Play" }))
  expect(reducedRoot).toHaveAttribute("data-t", "0.30")
  expect(reducedRoot).toHaveAttribute("data-meters", "0.2")
  expect(queued.size).toBe(0)
  fireEvent.change(reducedView.getByRole("slider", { name: "Tide time" }), { target: { value: "5" } })
  expect(reducedRoot).toHaveAttribute("data-t", "0.05")
  expect(queued.size).toBe(0)
  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<TideCurveScrub play />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-state", "playing")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const stoppedAt = root.getAttribute("data-t")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4))
  expect(root.getAttribute("data-t")).toBe(stoppedAt)
})
