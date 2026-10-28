// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DOT_COUNT, DotScaleMatrix, dotLabel, dotRadius, dotValue } from "./dot-scale-matrix"

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
  for (let index = 0; index < frames; index += 1) {
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
  const found = getComponent("dot-scale-matrix")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='dot-scale-matrix']")
  if (!(node instanceof HTMLElement)) throw new Error("missing dots")
  return node
}

function richestIndex() {
  let index = 0
  for (let cursor = 1; cursor < DOT_COUNT; cursor += 1) {
    if (dotValue(cursor) > dotValue(index)) index = cursor
  }
  return index
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

test("圆点半径按 value 映射，控件起始值等于默认", async () => {
  expect(getComponent("dot-scale-matrix")?.batch).toBe(80)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("colorScale")).toBe(true)
  expect(start("showChip")).toBe(true)
  expect(dotRadius(0, 0.7)).toBeLessThan(dotRadius(1, 0.7))
  expect(dotRadius(1, 1)).toBeGreaterThan(dotRadius(1, 0.35))
  const rich = richestIndex()
  const view = render(<DotScaleMatrix />)
  const root = rootOf(view.container)
  const cell = root.querySelector(`[data-cell='${rich}']`)
  expect(root).toHaveAttribute("data-ritual", "dot-scale")
  expect(root).toHaveAttribute("data-focus", "0")
  expect(root).toHaveAttribute("data-locked", "off")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-color", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(cell).toHaveAttribute("data-r", dotRadius(dotValue(rich), 0.7).toFixed(1))
  expect(cell).toHaveAttribute("data-value", dotValue(rich).toFixed(2))
  expect(view.getByText("Activity")).toBeInTheDocument()
  expect(view.queryByText(/whoop|mood/i)).toBeNull()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("方向键移动焦点，Enter 锁定读数", () => {
  const onValueChange = vi.fn()
  const view = render(<DotScaleMatrix onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  fireEvent.pointerEnter(view.getByRole("button", { name: dotLabel(3) }))
  expect(root).toHaveAttribute("data-hover", "3")
  expect(root).toHaveAttribute("data-locked", "off")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "1")
  expect(root).toHaveAttribute("data-phase", "focus")
  expect(root).toHaveAttribute("data-locked", "off")
  fireEvent.keyDown(root, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-focus", "8")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root).toHaveAttribute("data-phase", "locked")
  expect(root).toHaveAttribute("data-value", dotValue(8).toFixed(2))
  expect(view.getByRole("status")).toHaveTextContent(dotLabel(8))
  expect(onValueChange).toHaveBeenLastCalledWith({ focusIndex: 8, locked: true, value: dotValue(8) })
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-focus", "0")
  expect(root).toHaveAttribute("data-locked", "off")
})

test("点选锁定后再点同一格会放开，关闭色阶和 chip", () => {
  const view = render(<DotScaleMatrix colorScale={false} showChip={false} />)
  const root = rootOf(view.container)
  const cell = view.getByRole("button", { name: dotLabel(4) })
  fireEvent.click(cell)
  expect(root).toHaveAttribute("data-focus", "4")
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root).toHaveAttribute("data-color", "off")
  expect(root).toHaveAttribute("data-chip", "off")
  expect(root.querySelector("[data-chip-readout]")).toBeNull()
  const dot = cell.querySelector("[data-dot]")
  expect(dot?.getAttribute("style") ?? "").toContain("var(--foreground)")
  fireEvent.click(cell)
  expect(root).toHaveAttribute("data-locked", "off")
})

test("微呼吸离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<DotScaleMatrix />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-breath"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-breath"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-breath")
  act(() => drain(3))
  expect(root.getAttribute("data-breath")).toBe(stopped)
})

test("减弱动效瞬时锁定，半径仍按 value，没有呼吸帧", () => {
  installMedia({ reduced: true })
  const rich = richestIndex()
  const view = render(<DotScaleMatrix />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-breath", "0.00")
  fireEvent.click(view.getByRole("button", { name: dotLabel(rich) }))
  expect(root).toHaveAttribute("data-focus", String(rich))
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root).toHaveAttribute("data-phase", "locked")
  expect(root.querySelector(`[data-cell='${rich}']`)).toHaveAttribute("data-r", dotRadius(dotValue(rich), 0.7).toFixed(1))
  expect(queued.size).toBe(0)
})
