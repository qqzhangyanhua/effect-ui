// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BalancePlanePuck, balanceFromPointer, balanceReadout } from "./balance-plane-puck"

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
  const entry = getComponent("balance-plane-puck")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='balance-plane-puck']")
  if (!(node instanceof HTMLElement)) throw new Error("missing balance")
  return node
}

const empty = { left: 0, top: 0, width: 0, height: 0 }

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("平衡盘从偏右偏前开始", async () => {
  expect(getComponent("balance-plane-puck")?.batch).toBe(76)
  expect(getComponent("balance-plane-puck")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("snap")).toBe(true)
  expect(start("grid")).toBe(false)
  expect(balanceReadout(0.24, -0.16)).toEqual({ balance: "R 24", fade: "F 16" })
  const view = render(<BalancePlanePuck />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "balance-plane")
  expect(root).toHaveAttribute("data-x", "0.24")
  expect(root).toHaveAttribute("data-y", "-0.16")
  expect(root).toHaveAttribute("data-balance", "R 24")
  expect(root).toHaveAttribute("data-fade", "F 16")
  expect(root.querySelector("[data-puck]")).toBeTruthy()
  expect(root.querySelector("[data-part='grid-line']")).toBeNull()
  expect(view.getByText("L")).toBeInTheDocument()
  expect(view.getByText("F")).toBeInTheDocument()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖 puck、方向键和中心死区", () => {
  const onValueChange = vi.fn()
  const view = render(<BalancePlanePuck onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const plane = view.getByRole("slider", { name: "Balance plane" })
  fireEvent.pointerDown(plane, { clientX: 165, clientY: 55, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-x", "0.50")
  expect(root).toHaveAttribute("data-y", "-0.50")
  expect(root).toHaveAttribute("data-balance", "R 50")
  expect(root).toHaveAttribute("data-fade", "F 50")
  expect(onValueChange).toHaveBeenCalledWith({ x: 0.5, y: -0.5 })
  fireEvent.pointerUp(plane, { clientX: 165, clientY: 55, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(plane, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-x", "0.55")
  fireEvent.keyDown(plane, { key: "ArrowUp", shiftKey: true })
  expect(root).toHaveAttribute("data-y", "-0.70")
  const held = balanceFromPointer(124, 116, empty, true)
  expect(held).toEqual({ x: 0, y: 0 })
  fireEvent.pointerDown(plane, { clientX: 124, clientY: 116, button: 0, pointerId: 2 })
  expect(root).toHaveAttribute("data-x", "0.00")
  expect(root).toHaveAttribute("data-y", "0.00")
  expect(root).toHaveAttribute("data-balance", "Center")
  expect(queued.size).toBe(0)
})

test("Reset 沿弹簧回中，网格只在打开时出现", async () => {
  const view = render(<BalancePlanePuck grid />)
  const root = rootOf(view.container)
  expect(root.querySelectorAll("[data-part='grid-line']")).toHaveLength(4)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-x", "0.00")
  expect(root).toHaveAttribute("data-y", "0.00")
  expect(root).toHaveAttribute("data-state", "idle")
  cleanup()
  const again = render(<BalancePlanePuck />)
  const next = rootOf(again.container)
  await waitFor(() => expect(next).toHaveAttribute("data-live", "on"))
  fireEvent.doubleClick(again.getByRole("slider", { name: "Balance plane" }))
  expect(next).toHaveAttribute("data-state", "settle")
  act(() => drain(12))
  expect(next).toHaveAttribute("data-balance", "Center")
  expect(next).toHaveAttribute("data-fade", "Center")
})

test("减弱动效瞬时回中，离开视口停掉弹簧", async () => {
  installMedia({ reduced: true })
  const reducedView = render(<BalancePlanePuck />)
  const reducedRoot = rootOf(reducedView.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-ease", "0")
  fireEvent.click(reducedView.getByRole("button", { name: "Reset" }))
  expect(reducedRoot).toHaveAttribute("data-x", "0.00")
  expect(reducedRoot).toHaveAttribute("data-y", "0.00")
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<BalancePlanePuck />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
