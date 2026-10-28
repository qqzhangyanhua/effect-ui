// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { OscillationArcDial } from "./oscillation-arc-dial"

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

class SilentObserver {
  observe() {}
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

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(performance.now())
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
  const entry = getComponent("oscillation-arc-dial")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='oscillation-arc-dial']")
  if (!(node instanceof HTMLElement)) throw new Error("missing dial")
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

test("弧拨控件起始值等于默认，读数停在 40", async () => {
  expect(getComponent("oscillation-arc-dial")?.batch).toBe(69)
  expect(getComponent("oscillation-arc-dial")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("step")).toBe(1)
  expect(start("span")).toBe(180)
  const view = render(<OscillationArcDial />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "弧度拨盘" })
  expect(root).toHaveAttribute("data-ritual", "arc-dial")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-step", "1")
  expect(root).toHaveAttribute("data-span", "180")
  expect(root).toHaveAttribute("data-value", "40.0")
  expect(root).toHaveAttribute("data-state", "rest")
  expect(root).toHaveAttribute("data-oscillation", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(slider).toHaveAttribute("aria-valuemin", "0")
  expect(slider).toHaveAttribute("aria-valuemax", "100")
  expect(slider).toHaveAttribute("aria-valuenow", "40")
  expect(root.querySelector("canvas")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("40")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键按步进改值", () => {
  const onValueChange = vi.fn()
  const view = render(<OscillationArcDial onValueChange={onValueChange} step={10} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "弧度拨盘" })
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-value", "50.0")
  expect(slider).toHaveAttribute("aria-valuenow", "50")
  expect(root).toHaveAttribute("data-state", "rest")
  expect(onValueChange).toHaveBeenCalledWith(50)
  fireEvent.keyDown(slider, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-value", "40.0")
  expect(queued.size).toBe(0)
})

test("拖角改值，松手振荡后吸附到刻度", async () => {
  const onValueChange = vi.fn()
  const view = render(<OscillationArcDial onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "弧度拨盘" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(slider).toHaveAttribute("aria-valuenow", "70")
  fireEvent.pointerUp(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "oscillating")
  expect(root).toHaveAttribute("data-wobble", "on")
  expect(root.getAttribute("data-value")).not.toBe("70.0")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(24))
  expect(root).toHaveAttribute("data-state", "rest")
  expect(root).toHaveAttribute("data-value", "70.0")
  expect(root).toHaveAttribute("data-wobble", "off")
  expect(slider).toHaveAttribute("aria-valuenow", "70")
  expect(onValueChange).toHaveBeenCalledWith(70)
  expect(queued.size).toBe(0)
})

test("减弱动效松手直接吸附，没有振荡", () => {
  installMedia({ reduced: true })
  const onValueChange = vi.fn()
  const view = render(<OscillationArcDial onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "弧度拨盘" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-oscillation", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.pointerDown(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "rest")
  expect(root).toHaveAttribute("data-value", "70.0")
  expect(root).toHaveAttribute("data-wobble", "off")
  expect(onValueChange).toHaveBeenCalledWith(70)
  act(() => drain(8))
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "加一档" }))
  expect(root).toHaveAttribute("data-value", "71.0")
  fireEvent.click(view.getByRole("button", { name: "减一档" }))
  expect(root).toHaveAttribute("data-value", "70.0")
})

test("离开视口后松手不再排振荡帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<OscillationArcDial />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "弧度拨盘" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.pointerDown(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: 240, clientY: 12.36, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "rest")
  expect(root).toHaveAttribute("data-value", "70.0")
  act(() => drain(8))
  expect(root).toHaveAttribute("data-value", "70.0")
  expect(queued.size).toBe(0)
})
