// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BlurRepCount } from "./blur-rep-count"

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
  const entry = getComponent("blur-rep-count")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='blur-rep-count']")
  if (!(node instanceof HTMLElement)) throw new Error("missing blur count")
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

test("模糊计数控件起始值等于默认", async () => {
  expect(getComponent("blur-rep-count")?.batch).toBe(72)
  expect(getComponent("blur-rep-count")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("auto")).toBe(false)
  expect(start("digits")).toBe(1)
  const view = render(<BlurRepCount />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "blur-rep")
  expect(root).toHaveAttribute("data-clay", "off")
  expect(root).toHaveAttribute("data-value", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-blur", "0")
  expect(root).toHaveAttribute("data-auto", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-squash]")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("0")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("加一甩入，减一反向，Replay 走到 2", async () => {
  const view = render(<BlurRepCount />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "加" }))
  expect(root).toHaveAttribute("data-value", "1")
  expect(root).toHaveAttribute("data-from", "0")
  expect(root).toHaveAttribute("data-dir", "up")
  expect(root).toHaveAttribute("data-state", "blurring")
  expect(Number(root.getAttribute("data-blur"))).toBeGreaterThan(0)
  expect(view.getByRole("status")).toHaveTextContent("1")
  expect(root.querySelector("[data-role='out']")).not.toBeNull()
  expect(root.querySelector("[data-role='in']")).not.toBeNull()
  act(() => drain(14))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-blur", "0")
  fireEvent.keyDown(root, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-value", "0")
  expect(root).toHaveAttribute("data-dir", "down")
  expect(root).toHaveAttribute("data-state", "blurring")
  act(() => drain(14))
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-state", "blurring")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "0")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "1")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "2")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "2")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("status")).toHaveTextContent("2")
})

test("两位数字补零", () => {
  const view = render(<BlurRepCount digits={2} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-digits", "2")
  expect(root).toHaveTextContent("00")
  fireEvent.click(view.getByRole("button", { name: "加" }))
  expect(root).toHaveAttribute("data-value", "1")
  expect(view.getByRole("status")).toHaveTextContent("01")
})

test("减弱动效瞬时换数字，自动不跑", () => {
  installMedia({ reduced: true })
  const intervals: Array<() => void> = []
  vi.stubGlobal("setInterval", (callback: () => void) => {
    intervals.push(callback)
    return 7
  })
  const view = render(<BlurRepCount auto />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(intervals).toHaveLength(0)
  fireEvent.click(view.getByRole("button", { name: "加" }))
  expect(root).toHaveAttribute("data-value", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-blur", "0")
  expect(root.querySelector("[data-role='idle']")).not.toBeNull()
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-value", "2")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("自动计数离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const realSet = window.setInterval.bind(window)
  const realClear = window.clearInterval.bind(window)
  const started: Array<() => void> = []
  const cleared: number[] = []
  vi.stubGlobal("setInterval", ((callback: TimerHandler, delay?: number, ...args: unknown[]) => {
    if (typeof delay === "number" && delay >= 200 && typeof callback === "function") {
      started.push(() => callback())
      return 41
    }
    return realSet(callback, delay, ...args)
  }) as typeof window.setInterval)
  vi.stubGlobal("clearInterval", ((id: number) => {
    if (id === 41) {
      cleared.push(id)
      return
    }
    realClear(id)
  }) as typeof window.clearInterval)
  const view = render(<BlurRepCount auto />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(started).toHaveLength(1)
  act(() => started[0]?.())
  expect(root).toHaveAttribute("data-value", "1")
  expect(root).toHaveAttribute("data-state", "blurring")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(cleared).toContain(41)
  expect(started).toHaveLength(1)
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
  expect(root).toHaveAttribute("data-value", "1")
})
