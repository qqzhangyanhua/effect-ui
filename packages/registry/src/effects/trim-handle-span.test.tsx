// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { TrimHandleSpan, trimEnd, trimFromPointer, trimMinSpan, trimStart } from "./trim-handle-span"

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
  const found = getComponent("trim-handle-span")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='trim-handle-span']")
  if (!(node instanceof HTMLElement)) throw new Error("missing trim")
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

test("剪辑跨度默认停在起点，控件起始值等于默认", async () => {
  expect(getComponent("trim-handle-span")?.batch).toBe(80)
  expect(getComponent("trim-handle-span")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("minSpan")).toBe(0.08)
  expect(start("showFilm")).toBe(true)
  expect(trimMinSpan(0.08)).toBe(0.08)
  expect(trimStart(0.9, 0.74, 0.2)).toBe(0.54)
  expect(trimEnd(0.18, 0.1, 0.2)).toBe(0.38)
  expect(trimFromPointer(32, { left: 0, width: 0 })).toBe(0.1)
  const view = render(<TrimHandleSpan />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "trim-span")
  expect(root).toHaveAttribute("data-start", "0.18")
  expect(root).toHaveAttribute("data-end", "0.74")
  expect(root).toHaveAttribute("data-t", "0.18")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-film", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelectorAll("[data-handle]")).toHaveLength(3)
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Trim clip")).toBeInTheDocument()
  expect(view.queryByText(/capcut|riveo|premiere/i)).toBeNull()
  expect(queued.size).toBe(0)
})

test("左右柄受最小跨度钳制，playhead 可拖", () => {
  const onValueChange = vi.fn()
  const view = render(<TrimHandleSpan minSpan={0.2} onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const lane = root.querySelector("[data-lane]")
  if (!(lane instanceof HTMLElement)) throw new Error("missing lane")
  fireEvent.pointerDown(view.getByRole("slider", { name: "Trim end" }), { clientX: 120, button: 0, pointerId: 1 })
  fireEvent.pointerUp(lane, { clientX: 120, pointerId: 1 })
  expect(root).toHaveAttribute("data-end", "0.38")
  expect(root).toHaveAttribute("data-start", "0.18")
  expect(root).toHaveAttribute("data-phase", "idle")
  fireEvent.pointerDown(view.getByRole("slider", { name: "Trim start" }), { clientX: 300, button: 0, pointerId: 2 })
  fireEvent.pointerUp(lane, { clientX: 300, pointerId: 2 })
  expect(root).toHaveAttribute("data-start", "0.18")
  fireEvent.pointerDown(view.getByRole("slider", { name: "Playhead" }), { clientX: 160, button: 0, pointerId: 3 })
  expect(root).toHaveAttribute("data-phase", "dragging")
  expect(root).toHaveAttribute("data-t", "0.50")
  fireEvent.pointerUp(lane, { clientX: 160, pointerId: 3 })
  expect(onValueChange).toHaveBeenCalledWith({ start: 0.18, end: 0.38, t: 0.5 })
})

test("键盘调左右柄和 playhead", () => {
  const view = render(<TrimHandleSpan />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "[" })
  expect(root).toHaveAttribute("data-start", "0.16")
  fireEvent.keyDown(root, { key: "]" })
  expect(root).toHaveAttribute("data-start", "0.18")
  fireEvent.keyDown(root, { key: "{" })
  expect(root).toHaveAttribute("data-end", "0.72")
  fireEvent.keyDown(root, { key: "}", altKey: false })
  expect(root).toHaveAttribute("data-end", "0.74")
  fireEvent.keyDown(root, { key: "ArrowLeft", altKey: true })
  expect(root).toHaveAttribute("data-end", "0.72")
  fireEvent.keyDown(root, { key: "ArrowRight", altKey: true })
  expect(root).toHaveAttribute("data-end", "0.74")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.20")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-t", "0.18")
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-t", "0.74")
  expect(root).toHaveAttribute("data-playing", "off")
})

test("播放在视口内推进，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<TrimHandleSpan />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-t"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-t"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-t")
  act(() => drain(3))
  expect(root.getAttribute("data-t")).toBe(stopped)
})

test("减弱动效瞬时改界，播放不排队", () => {
  installMedia({ reduced: true })
  const view = render(<TrimHandleSpan showFilm={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-film", "off")
  expect(root.querySelector("[data-film='flat']")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "]" })
  expect(root).toHaveAttribute("data-start", "0.20")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  expect(root).toHaveAttribute("data-t", "0.74")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})
