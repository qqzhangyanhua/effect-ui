// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { StressBandMeter, stressLevel } from "./stress-band-meter"

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
  const entry = getComponent("stress-band-meter")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='stress-band-meter']")
  if (!(node instanceof HTMLElement)) throw new Error("missing stress")
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

test("应力色带从中档开始，控件起始值等于默认", async () => {
  expect(getComponent("stress-band-meter")?.batch).toBe(75)
  expect(getComponent("stress-band-meter")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("scaleMax")).toBe("3")
  expect(start("breathe")).toBe(true)
  expect(stressLevel(1.2, 3)).toBe("medium")
  expect(stressLevel(1.2, 5)).toBe("low")
  expect(stressLevel(2.6, 3)).toBe("high")
  const view = render(<StressBandMeter />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "stress-band")
  expect(root).toHaveAttribute("data-value", "1.2")
  expect(root).toHaveAttribute("data-level", "medium")
  expect(root).toHaveAttribute("data-label", "MEDIUM")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-max", "3")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-blob='medium']")).toHaveAttribute("data-hot", "on")
  expect(root.querySelector("[data-blob='low']")).toHaveAttribute("data-hot", "off")
  expect(view.getByRole("status")).toHaveTextContent("MEDIUM")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("滑杆、色带和方向键同步级别", () => {
  const onValueChange = vi.fn()
  const view = render(<StressBandMeter onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "应力" })
  fireEvent.change(slider, { target: { value: "2.6" } })
  expect(root).toHaveAttribute("data-value", "2.6")
  expect(root).toHaveAttribute("data-level", "high")
  expect(root).toHaveAttribute("data-label", "HIGH")
  expect(root).toHaveAttribute("data-state", "labeled")
  expect(root.querySelector("[data-blob='high']")).toHaveAttribute("data-hot", "on")
  expect(onValueChange).toHaveBeenCalledWith(2.6)
  fireEvent.click(view.getByRole("button", { name: "LOW" }))
  expect(root).toHaveAttribute("data-level", "low")
  expect(root).toHaveAttribute("data-value", "0.5")
  fireEvent.keyDown(slider, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-value", "0.6")
})

test("满刻度改变级别，关闭微动后不再排队", async () => {
  const wide = render(<StressBandMeter scaleMax="5" intensity={1} />)
  const wideRoot = rootOf(wide.container)
  expect(wideRoot).toHaveAttribute("data-max", "5")
  expect(wideRoot).toHaveAttribute("data-level", "low")
  expect(wideRoot).toHaveAttribute("data-intensity", "1")
  wide.unmount()
  const view = render(<StressBandMeter breathe={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-breathe", "off")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
  expect(root).toHaveAttribute("data-sway", "0.00")
})

test("微动离开视口后停止，减弱动效瞬时改级别", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const live = render(<StressBandMeter />)
  const liveRoot = rootOf(live.container)
  await waitFor(() => {
    expect(liveRoot).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(1))
  expect(liveRoot.getAttribute("data-sway")).not.toBe("0.00")
  act(() => emitView(false))
  expect(liveRoot).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  live.unmount()

  installMedia({ reduced: true })
  const view = render(<StressBandMeter />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "HIGH" }))
  expect(root).toHaveAttribute("data-level", "high")
  expect(root).toHaveAttribute("data-label", "HIGH")
  expect(root).toHaveAttribute("data-state", "labeled")
  expect(queued.size).toBe(0)
})
