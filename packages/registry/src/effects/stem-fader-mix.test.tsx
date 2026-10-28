// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { StemFaderMix, applyStem, stemLevel } from "./stem-fader-mix"

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
  const entry = getComponent("stem-fader-mix")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='stem-fader-mix']")
  if (!(node instanceof HTMLElement)) throw new Error("missing stems")
  return node
}

const INITIAL = [0.72, 0.48, 0.84, 0.6]

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("推子默认四列，电平是平均值", async () => {
  expect(getComponent("stem-fader-mix")?.batch).toBe(76)
  expect(getComponent("stem-fader-mix")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("count")).toBe(4)
  expect(start("link")).toBe(false)
  expect(stemLevel(INITIAL)).toBe(0.66)
  const view = render(<StemFaderMix />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "stem-mix")
  expect(root).toHaveAttribute("data-values", "0.72,0.48,0.84,0.60")
  expect(root).toHaveAttribute("data-level", "0.66")
  expect(root).toHaveAttribute("data-count", "4")
  expect(view.getAllByRole("slider")).toHaveLength(4)
  expect(root.querySelectorAll("[data-notch]").length).toBe(12)
  expect(root.querySelector("[data-part='wave']")).toBeTruthy()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("拖杆、方向键和 Reset 改各列增益", () => {
  const onValuesChange = vi.fn()
  const view = render(<StemFaderMix onValuesChange={onValuesChange} />)
  const root = rootOf(view.container)
  const lead = view.getByRole("slider", { name: "Lead" })
  fireEvent.pointerDown(lead, { clientY: 32, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "adjusting")
  expect(root).toHaveAttribute("data-adjust", "Lead")
  expect(root).toHaveAttribute("data-values", "0.80,0.48,0.84,0.60")
  expect(onValuesChange).toHaveBeenCalledWith([0.8, 0.48, 0.84, 0.6])
  fireEvent.pointerUp(lead, { clientY: 32, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "mixed")
  fireEvent.keyDown(view.getByRole("slider", { name: "Knock" }), { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-values", "0.80,0.53,0.84,0.60")
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-values", "1.00,1.00,1.00,1.00")
  expect(root).toHaveAttribute("data-level", "1.00")
})

test("联动保住总和，列数可以收到三根", () => {
  const linked = applyStem(INITIAL, 0, 0.8, true)
  expect(linked[1]).toBeLessThan(0.48)
  const view = render(<StemFaderMix link />)
  const root = rootOf(view.container)
  fireEvent.pointerDown(view.getByRole("slider", { name: "Lead" }), { clientY: 32, button: 0, pointerId: 1 })
  expect(root.getAttribute("data-values")).toBe(linked.map((value) => value.toFixed(2)).join(","))
  cleanup()
  const trio = render(<StemFaderMix count={3} />)
  const next = rootOf(trio.container)
  expect(next).toHaveAttribute("data-count", "3")
  expect(trio.getAllByRole("slider")).toHaveLength(3)
  expect(trio.queryByRole("slider", { name: "Air" })).toBeNull()
  expect(next).toHaveAttribute("data-values", "0.72,0.48,0.84")
})

test("减弱动效不微抖，离开视口后停止", async () => {
  installMedia({ reduced: true })
  const reducedView = render(<StemFaderMix />)
  const reducedRoot = rootOf(reducedView.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-ease", "0")
  await waitFor(() => expect(reducedRoot).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
  fireEvent.pointerDown(reducedView.getByRole("slider", { name: "Low" }), { clientY: 80, button: 0, pointerId: 1 })
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(reducedRoot.getAttribute("data-values")?.split(",")[2]).toBe("0.50")
  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<StemFaderMix />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
})
