// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { FrostDotReveal } from "./frost-dot-reveal"

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
  const entry = getComponent("frost-dot-reveal")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='frost-dot-reveal']")
  if (!(node instanceof HTMLElement)) throw new Error("missing frost")
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

test("霜点控件起始值等于默认", async () => {
  expect(getComponent("frost-dot-reveal")?.batch).toBe(72)
  expect(getComponent("frost-dot-reveal")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("span")).toBe(47)
  expect(start("persist")).toBe(false)
  const view = render(<FrostDotReveal />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "frost-dot")
  expect(root).toHaveAttribute("data-fog", "off")
  expect(root).toHaveAttribute("data-label", "Value")
  expect(root).toHaveAttribute("data-value", "32")
  expect(root).toHaveAttribute("data-min", "18")
  expect(root).toHaveAttribute("data-max", "65")
  expect(root).toHaveAttribute("data-render", "dots")
  expect(root).toHaveAttribute("data-state", "frosted")
  expect(Number(root.getAttribute("data-clarity"))).toBeLessThan(0.5)
  expect(root.textContent?.toLowerCase()).not.toContain("age")
  expect(view.getByRole("slider", { name: "Value" })).toBeInTheDocument()
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-jitter", "on")
  expect(queued.size).toBeGreaterThan(0)
})

test("拖滑条揭开数值，松手回到霜态", async () => {
  const view = render(<FrostDotReveal />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Value" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(slider, { pointerId: 1, button: 0 })
  expect(root).toHaveAttribute("data-state", "revealing")
  act(() => drain(16))
  expect(Number(root.getAttribute("data-clarity"))).toBeGreaterThan(0.9)
  fireEvent.change(slider, { target: { value: "41" } })
  expect(root).toHaveAttribute("data-value", "41")
  fireEvent.pointerUp(slider, { pointerId: 1 })
  act(() => drain(16))
  expect(root).toHaveAttribute("data-state", "frosted")
  expect(Number(root.getAttribute("data-clarity"))).toBeLessThan(0.5)
  expect(queued.size).toBeGreaterThan(0)
})

test("persist 松手保持清晰，键盘改值", async () => {
  const view = render(<FrostDotReveal persist span={20} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "Value" })
  expect(root).toHaveAttribute("data-max", "38")
  expect(root).toHaveAttribute("data-span", "20")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(root, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-value", "33")
  act(() => drain(16))
  fireEvent.pointerDown(slider, { pointerId: 1, button: 0 })
  act(() => drain(16))
  fireEvent.pointerUp(slider, { pointerId: 1 })
  act(() => drain(16))
  expect(root).toHaveAttribute("data-state", "held")
  expect(Number(root.getAttribute("data-clarity"))).toBeGreaterThan(0.9)
  expect(root).toHaveAttribute("data-jitter", "off")
})

test("减弱动效显示实心数字", () => {
  installMedia({ reduced: true })
  const view = render(<FrostDotReveal />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-render", "solid")
  expect(root).toHaveAttribute("data-state", "solid")
  expect(root).toHaveAttribute("data-clarity", "1.00")
  expect(root).toHaveAttribute("data-jitter", "off")
  expect(view.getByText("32")).toBeInTheDocument()
  expect(root.querySelector("[data-canvas='frost']")).toBeNull()
  fireEvent.change(view.getByRole("slider", { name: "Value" }), { target: { value: "40" } })
  expect(root).toHaveAttribute("data-value", "40")
  expect(view.getByText("40")).toBeInTheDocument()
  expect(queued.size).toBe(0)
})

test("离开视口时停抖动", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<FrostDotReveal />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-jitter", "on"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-jitter", "off")
  expect(queued.size).toBe(0)
})
