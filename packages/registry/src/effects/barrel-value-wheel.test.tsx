// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BarrelValueWheel } from "./barrel-value-wheel"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
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
  const entry = getComponent("barrel-value-wheel")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='barrel-value-wheel']")
  if (!(node instanceof HTMLElement)) throw new Error("missing wheel")
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

test("滚筒控件起始值等于默认，中心项没有倾角", async () => {
  expect(getComponent("barrel-value-wheel")?.batch).toBe(68)
  expect(getComponent("barrel-value-wheel")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("visible")).toBe(5)
  const view = render(<BarrelValueWheel />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "数值" })
  expect(root).toHaveAttribute("data-ritual", "barrel-wheel")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-visible", "5")
  expect(root).toHaveAttribute("data-value", "72")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-perspective", "on")
  expect(slider).toHaveAttribute("aria-valuenow", "72")
  expect(root.querySelector("[data-active='true']")).toHaveAttribute("data-rotate", "0.0")
  expect(root.querySelector("[data-item='74']")?.getAttribute("data-rotate")).not.toBe("0.0")
  expect(root.querySelector("canvas")).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("status")).toHaveTextContent("72")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键、滚轮和慢拖都会吸附到新的值", async () => {
  const onValueChange = vi.fn()
  const view = render(<BarrelValueWheel onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "数值" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(slider, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-value", "74")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(slider).toHaveAttribute("aria-valuenow", "74")
  expect(onValueChange).toHaveBeenCalledWith(74)
  fireEvent.keyDown(slider, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-value", "72")
  fireEvent.wheel(slider, { deltaY: 24 })
  expect(root).toHaveAttribute("data-value", "74")

  fireEvent.pointerDown(slider, { clientY: 120, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientY: 100, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientY: 80, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "spinning")
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-value", "76")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(queued.size).toBe(0)
})

test("快速拖动先停在拖动位置，惯性帧结束后再多走一档", async () => {
  const onValueChange = vi.fn()
  const view = render(<BarrelValueWheel onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "数值" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(slider, { clientY: 120, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientY: 40, pointerId: 1 })
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "spinning")
  expect(root).toHaveAttribute("data-value", "76")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(8))
  expect(root).toHaveAttribute("data-value", "78")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(onValueChange).toHaveBeenCalledWith(78)
  expect(queued.size).toBe(0)
})

test("减弱动效用选择框和按钮改值，没有透视", () => {
  installMedia({ reduced: true })
  const onValueChange = vi.fn()
  const view = render(<BarrelValueWheel onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-perspective", "off")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(root.querySelector("[data-rotate]")).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByRole("slider")).toBeNull()
  fireEvent.change(view.getByRole("combobox", { name: "数值" }), { target: { value: "80" } })
  expect(root).toHaveAttribute("data-value", "80")
  expect(onValueChange).toHaveBeenCalledWith(80)
  fireEvent.click(view.getByRole("button", { name: "下一档" }))
  expect(root).toHaveAttribute("data-value", "82")
  fireEvent.click(view.getByRole("button", { name: "上一档" }))
  expect(root).toHaveAttribute("data-value", "80")
  act(() => drain(6))
  expect(queued.size).toBe(0)
})

test("离开视口后快速拖动不再排惯性帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<BarrelValueWheel />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "数值" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.pointerDown(slider, { clientY: 120, pointerId: 1 })
  fireEvent.pointerMove(slider, { clientY: 40, pointerId: 1 })
  fireEvent.pointerUp(slider, { pointerId: 1 })
  expect(root).toHaveAttribute("data-value", "76")
  expect(root).toHaveAttribute("data-state", "snapped")
  act(() => drain(8))
  expect(root).toHaveAttribute("data-value", "76")
  expect(queued.size).toBe(0)
})
