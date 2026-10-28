// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { FloorUnitGlow } from "./floor-unit-glow"

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
  const entry = getComponent("floor-unit-glow")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='floor-unit-glow']")
  if (!(node instanceof HTMLElement)) throw new Error("missing floor")
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

test("楼层控件起始值等于默认，停在一层且没有选中单元", async () => {
  expect(getComponent("floor-unit-glow")?.batch).toBe(78)
  expect(getComponent("floor-unit-glow")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("breath")).toBe(false)
  expect(start("showLegend")).toBe(true)
  const view = render(<FloorUnitGlow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "floor-plan")
  expect(root).toHaveAttribute("data-floor", "1")
  expect(root).toHaveAttribute("data-unit", "")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-pin]")).toBeNull()
  expect(view.getByRole("tab", { name: "Floor 1" })).toHaveAttribute("aria-selected", "true")
  expect(view.getByText("Open")).toBeInTheDocument()
  expect(view.getByText("Taken")).toBeInTheDocument()
  expect(view.getAllByText("Select a unit").length).toBeGreaterThan(0)
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("方向键切楼层，Enter 点亮单元并写上侧卡", () => {
  const onValueChange = vi.fn()
  const view = render(<FloorUnitGlow onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-floor", "2")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(onValueChange).toHaveBeenCalledWith({ floor: 2, unitId: null })
  const unit = view.getByRole("button", { name: "Unit B2" })
  fireEvent.keyDown(unit, { key: "Enter" })
  expect(root).toHaveAttribute("data-unit", "B2")
  expect(root).toHaveAttribute("data-status", "open")
  expect(root).toHaveAttribute("data-state", "selecting")
  expect(root.querySelector("[data-part='card']")).toHaveTextContent("Unit B2 · Open")
  expect(onValueChange).toHaveBeenCalledWith({ floor: 2, unitId: "B2" })
  act(() => drain(1))
  expect(root).toHaveAttribute("data-state", "glowing")
  fireEvent.click(view.getByRole("button", { name: "Unit B4 taken" }))
  expect(root).toHaveAttribute("data-unit", "B2")
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-unit", "")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("关闭图例后不显示 Open 和 Taken", () => {
  const view = render(<FloorUnitGlow showLegend={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-legend", "off")
  expect(view.queryByText("Open")).toBeNull()
  expect(view.queryByText("Taken")).toBeNull()
})

test("呼吸辉光在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<FloorUnitGlow breath />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Unit A1" }))
  act(() => drain(1))
  await waitFor(() => {
    expect(root).toHaveAttribute("data-state", "glowing")
    expect(root).toHaveAttribute("data-breathing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(2))
  const clock = root.getAttribute("data-clock")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-breathing", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3))
  expect(root.getAttribute("data-clock")).toBe(clock)
})

test("减弱动效瞬时发光，没有呼吸帧", () => {
  installMedia({ reduced: true })
  const view = render(<FloorUnitGlow breath />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("tab", { name: "Floor 2" }))
  fireEvent.click(view.getByRole("button", { name: "Unit B2" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-floor", "2")
  expect(root).toHaveAttribute("data-unit", "B2")
  expect(root).toHaveAttribute("data-state", "glowing")
  expect(root).toHaveAttribute("data-breathing", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(queued.size).toBe(0)
})
