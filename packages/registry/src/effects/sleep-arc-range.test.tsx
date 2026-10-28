// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SleepArcRange, sleepDuration, sleepPoint, sleepPointerMinutes } from "./sleep-arc-range"

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
  const entry = getComponent("sleep-arc-range")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='sleep-arc-range']")
  if (!(node instanceof HTMLElement)) throw new Error("missing sleep")
  return node
}

function point(minutes: number) {
  const spot = sleepPoint(minutes)
  return { clientX: spot.x, clientY: spot.y }
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

test("睡眠弧默认 23:00 到 07:00，总时长 8 小时", async () => {
  expect(getComponent("sleep-arc-range")?.batch).toBe(76)
  expect(getComponent("sleep-arc-range")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("snap")).toBe(true)
  expect(start("minHours")).toBe(4)
  expect(sleepDuration(23 * 60, 7 * 60)).toBe(8 * 60)
  for (const minutes of [0, 180, 420, 1380]) {
    const spot = sleepPoint(minutes)
    expect(sleepPointerMinutes(spot.x, spot.y)).toBe(minutes)
  }
  const view = render(<SleepArcRange />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "sleep-arc")
  expect(root).toHaveAttribute("data-start", "1380")
  expect(root).toHaveAttribute("data-end", "420")
  expect(root).toHaveAttribute("data-duration", "480")
  expect(root).toHaveAttribute("aria-label", "Sleep range, 8 hours")
  expect(view.getByText("23:00")).toBeInTheDocument()
  expect(view.getByText("07:00")).toBeInTheDocument()
  expect(view.getByText("8h 0m")).toBeInTheDocument()
  expect(root.querySelector("[data-glyph='moon']")).toBeTruthy()
  expect(root.querySelector("[data-glyph='sun']")).toBeTruthy()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键微调醒来柄，拖弧身平移整段", async () => {
  const onRangeChange = vi.fn()
  const view = render(<SleepArcRange snap={false} onRangeChange={onRangeChange} />)
  const root = rootOf(view.container)
  const wake = view.getByRole("slider", { name: "Wake" })
  const bed = view.getByRole("slider", { name: "Bedtime" })
  expect(bed.compareDocumentPosition(wake) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  fireEvent.keyDown(wake, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-end", "430")
  expect(root).toHaveAttribute("data-duration", "490")
  expect(root).toHaveAttribute("aria-label", "Sleep range, 8 hours 10 minutes")
  expect(view.getByText("07:10")).toBeInTheDocument()
  expect(onRangeChange).toHaveBeenCalled()
  const arc = root.querySelector("[data-part='arc']")
  if (!(arc instanceof Element)) throw new Error("missing arc")
  const from = point(420)
  const to = point(480)
  fireEvent.pointerDown(arc, { ...from, button: 0, pointerId: 2 })
  fireEvent.pointerMove(arc, { ...to, pointerId: 2 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-drag", "body")
  expect(root).toHaveAttribute("data-start", "0")
  expect(root).toHaveAttribute("data-end", "490")
  expect(root).toHaveAttribute("data-duration", "490")
  fireEvent.pointerUp(arc, { ...to, pointerId: 2 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBe(0)
})

test("最短时长钳制，松手把离格分钟吸到 15 分钟", async () => {
  const view = render(<SleepArcRange minHours={4} />)
  const root = rootOf(view.container)
  const wake = view.getByRole("slider", { name: "Wake" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const midnight = point(0)
  fireEvent.pointerDown(wake, { ...midnight, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-end", "180")
  expect(root).toHaveAttribute("data-duration", "240")
  expect(root).toHaveAttribute("aria-label", "Sleep range, 4 hours")
  fireEvent.pointerUp(wake, { ...midnight, pointerId: 1 })
  expect(root).toHaveAttribute("data-end", "180")
  expect(queued.size).toBe(0)
  cleanup()
  const again = render(<SleepArcRange />)
  const next = rootOf(again.container)
  const handle = again.getByRole("slider", { name: "Wake" })
  await waitFor(() => expect(next).toHaveAttribute("data-live", "on"))
  const off = point(186)
  fireEvent.pointerDown(handle, { ...off, button: 0, pointerId: 3 })
  expect(next).toHaveAttribute("data-end", "186")
  fireEvent.pointerUp(handle, { ...off, pointerId: 3 })
  expect(next).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(next).toHaveAttribute("data-end", "180")
  expect(next).toHaveAttribute("data-state", "settle")
})

test("减弱动效瞬时改弧，不排队", () => {
  installMedia({ reduced: true })
  const view = render(<SleepArcRange />)
  const root = rootOf(view.container)
  const wake = view.getByRole("slider", { name: "Wake" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  const off = point(186)
  fireEvent.pointerDown(wake, { ...off, button: 0, pointerId: 1 })
  fireEvent.pointerUp(wake, { ...off, pointerId: 1 })
  expect(root).toHaveAttribute("data-end", "180")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(wake, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-end", "195")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})
