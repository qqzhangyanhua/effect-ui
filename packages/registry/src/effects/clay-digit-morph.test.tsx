// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ClayDigitMorph } from "./clay-digit-morph"

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
  const entry = getComponent("clay-digit-morph")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='clay-digit-morph']")
  if (!(node instanceof HTMLElement)) throw new Error("missing clay")
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

test("黏土数字控件起始值等于默认", async () => {
  expect(getComponent("clay-digit-morph")?.batch).toBe(71)
  expect(getComponent("clay-digit-morph")?.effectCategory).toBe("text")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("digits")).toBe(1)
  expect(start("softness")).toBe(0.55)
  const view = render(<ClayDigitMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "clay-digit")
  expect(root).toHaveAttribute("data-value", "0")
  expect(root).toHaveAttribute("data-digits", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-squash", "1")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByLabelText("黏土数字")).toBe(root)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("数字键和加一会挤一下再停下", async () => {
  const view = render(<ClayDigitMorph />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "数字 7" }))
  expect(root).toHaveAttribute("data-value", "7")
  expect(root).toHaveAttribute("data-from", "0")
  expect(root).toHaveAttribute("data-state", "morphing")
  expect(Number(root.getAttribute("data-squash"))).toBeLessThan(1)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-squash", "1")
  fireEvent.keyDown(root, { key: "4" })
  expect(root).toHaveAttribute("data-value", "4")
  expect(root).toHaveAttribute("data-state", "morphing")
  act(() => drain(12))
  fireEvent.click(view.getByRole("button", { name: "加一" }))
  expect(root).toHaveAttribute("data-value", "5")
})

test("Replay 按 0、7、3 走完", async () => {
  const view = render(<ClayDigitMorph />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-value", "0")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "0")
  expect(root).toHaveAttribute("data-state", "morphing")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "7")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "3")
  act(() => drain(1))
  expect(root).toHaveAttribute("data-value", "3")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("两位数字会补零并移位", () => {
  const view = render(<ClayDigitMorph digits={2} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-digits", "2")
  expect(root).toHaveTextContent("00")
  fireEvent.click(view.getByRole("button", { name: "数字 4" }))
  expect(root).toHaveAttribute("data-value", "4")
  expect(root).toHaveTextContent("04")
  fireEvent.click(view.getByRole("button", { name: "数字 2" }))
  expect(root).toHaveAttribute("data-value", "42")
  expect(root).toHaveTextContent("42")
})

test("减弱动效瞬时换数字", () => {
  installMedia({ reduced: true })
  const view = render(<ClayDigitMorph />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  fireEvent.click(view.getByRole("button", { name: "数字 7" }))
  expect(root).toHaveAttribute("data-value", "7")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-squash", "1")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-value", "3")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})

test("离开视口时停在新数字", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ClayDigitMorph />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "数字 7" }))
  expect(root).toHaveAttribute("data-state", "morphing")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-value", "7")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
