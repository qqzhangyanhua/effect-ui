// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SolarOrbitScrub, solarClock, solarPoint, solarShadow, solarTAt } from "./solar-orbit-scrub"

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
  const entry = getComponent("solar-orbit-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='solar-orbit-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing solar")
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

test("太阳轨道控件起始值等于默认", async () => {
  expect(getComponent("solar-orbit-scrub")?.batch).toBe(71)
  expect(getComponent("solar-orbit-scrub")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("span")).toBe(0.75)
  expect(start("snap")).toBe(false)
  const view = render(<SolarOrbitScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "solar-shadow")
  expect(root).toHaveAttribute("data-t", "0.50")
  expect(root).toHaveAttribute("data-shadow-x", "0")
  expect(root).toHaveAttribute("data-time", "13:00")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-snap", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("status")).toHaveTextContent("13:00")
  expect(root.querySelector("[data-tick]")).toBeNull()
  expect(root.querySelector("[data-cube]")).not.toBeNull()
  expect(root.querySelector("[data-cast]")).not.toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键改变时刻和投影", async () => {
  const view = render(<SolarOrbitScrub />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "太阳轨道" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(slider, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-t", "0.45")
  expect(root).toHaveAttribute("data-time", solarClock(0.45))
  expect(root).not.toHaveAttribute("data-time", "13:00")
  expect(Number(root.getAttribute("data-shadow-x"))).toBeGreaterThan(0)
  expect(Number(root.getAttribute("data-shadow-x"))).toBe(solarShadow(0.45, 0.7).x)
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.50")
  expect(root).toHaveAttribute("data-time", "13:00")
})

test("拖到日出附近会吸到起点", async () => {
  const onValueChange = vi.fn()
  const view = render(<SolarOrbitScrub snap onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "太阳轨道" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const point = solarPoint(0.1, 0.75)
  expect(solarTAt(point.x, point.y, 0.75)).toBeLessThan(0.18)
  fireEvent.pointerDown(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  fireEvent.pointerUp(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-t", "0.00")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(Number(root.getAttribute("data-shadow-x"))).toBe(solarShadow(0, 0.7).x)
  expect(onValueChange).toHaveBeenCalledWith(0)
})

test("不吸边时松手停在采样点", async () => {
  const view = render(<SolarOrbitScrub />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "太阳轨道" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const point = solarPoint(0.45, 0.75)
  const sampled = solarTAt(point.x, point.y, 0.75)
  fireEvent.pointerDown(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-t", sampled.toFixed(2))
  expect(queued.size).toBe(0)
})

test("减弱动效用按钮瞬时改时刻", () => {
  installMedia({ reduced: true })
  const view = render(<SolarOrbitScrub snap />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "太阳轨道" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(view.getByRole("button", { name: "更早" })).toBeInTheDocument()
  expect(view.getByRole("button", { name: "更晚" })).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "更早" }))
  expect(root).toHaveAttribute("data-t", "0.45")
  fireEvent.click(view.getByRole("button", { name: "更晚" }))
  expect(root).toHaveAttribute("data-t", "0.50")
  const point = solarPoint(0.1, 0.75)
  fireEvent.pointerDown(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  expect(root).toHaveAttribute("data-t", "0.00")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("离开视口时弹簧停在当前方位", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SolarOrbitScrub snap />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "太阳轨道" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const point = solarPoint(0.1, 0.75)
  const sampled = solarTAt(point.x, point.y, 0.75).toFixed(2)
  fireEvent.pointerDown(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: point.x, clientY: point.y, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-t", sampled)
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
  act(() => drain(20))
  expect(root).toHaveAttribute("data-t", sampled)
})
