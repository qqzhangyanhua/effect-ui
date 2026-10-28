// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { WaveClipWindow, waveHot, waveSecondsFromPointer, waveStartFromPointer } from "./wave-clip-window"

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

const empty = { left: 0, top: 0, width: 0, height: 0 }

function start(prop: string) {
  const entry = getComponent("wave-clip-window")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='wave-clip-window']")
  if (!(node instanceof HTMLElement)) throw new Error("missing wave")
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

test("波形窗控件起始值等于默认，15 秒窗口高亮窗内条", async () => {
  expect(getComponent("wave-clip-window")?.batch).toBe(77)
  expect(getComponent("wave-clip-window")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("seconds")).toBe("15")
  expect(start("play")).toBe(false)
  expect(waveHot(10, 0.2, 15)).toBe(true)
  expect(waveHot(0, 0.2, 15)).toBe(false)
  const view = render(<WaveClipWindow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "wave-window")
  expect(root).toHaveAttribute("data-start", "0.20")
  expect(root).toHaveAttribute("data-width", "15")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-part='wave']")).toBeTruthy()
  expect(root.querySelector("[data-vinyl]")).toBeNull()
  expect(root.querySelector("[data-bar='10']")).toHaveAttribute("data-hot", "on")
  expect(root.querySelector("[data-bar='0']")).toHaveAttribute("data-hot", "off")
  expect(view.getByRole("status")).toHaveTextContent("15s")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖窗体、右缘和键盘改起点与秒数", () => {
  const onClipChange = vi.fn()
  const view = render(<WaveClipWindow onClipChange={onClipChange} />)
  const root = rootOf(view.container)
  const windowClip = view.getByRole("slider", { name: "Clip window" })
  expect(waveStartFromPointer(120, empty, 15)).toBe(0.4)
  fireEvent.pointerDown(windowClip, { clientX: 120, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-drag", "body")
  expect(root).toHaveAttribute("data-start", "0.40")
  expect(root).toHaveAttribute("data-width", "15")
  expect(onClipChange).toHaveBeenCalledWith({ start: 0.4, seconds: 15 })
  fireEvent.pointerUp(windowClip, { clientX: 120, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  cleanup()
  const again = render(<WaveClipWindow />)
  const next = rootOf(again.container)
  const edge = again.container.querySelector("[data-edge='end']")
  if (!(edge instanceof HTMLElement)) throw new Error("missing edge")
  expect(waveSecondsFromPointer(210, empty, 0.2)).toBe(30)
  fireEvent.pointerDown(edge, { clientX: 210, button: 0, pointerId: 2 })
  expect(next).toHaveAttribute("data-drag", "end")
  expect(next).toHaveAttribute("data-width", "30")
  expect(next).toHaveAttribute("data-start", "0.20")
  const keys = again.getByRole("slider", { name: "Clip window" })
  fireEvent.keyDown(keys, { key: "ArrowRight" })
  expect(next).toHaveAttribute("data-start", "0.22")
  fireEvent.keyDown(keys, { key: "]" })
  expect(next).toHaveAttribute("data-width", "30")
  cleanup()
  const fresh = render(<WaveClipWindow />)
  fireEvent.keyDown(fresh.getByRole("slider", { name: "Clip window" }), { key: "]" })
  expect(rootOf(fresh.container)).toHaveAttribute("data-width", "16")
  fireEvent.keyDown(fresh.getByRole("slider", { name: "Clip window" }), { key: "[" })
  fireEvent.keyDown(fresh.getByRole("slider", { name: "Clip window" }), { key: "[" })
  expect(rootOf(fresh.container)).toHaveAttribute("data-width", "14")
  expect(queued.size).toBe(0)
})

test("秒数控件重置窗口宽度", () => {
  const view = render(<WaveClipWindow seconds="8" />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-seconds", "8")
  expect(root).toHaveAttribute("data-width", "8")
  view.rerender(<WaveClipWindow seconds="30" />)
  expect(root).toHaveAttribute("data-width", "30")
})

test("窗内播放在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<WaveClipWindow play />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-play", "on")
  expect(root).toHaveAttribute("data-state", "playing")
  expect(root.querySelector("[data-part='playhead']")).toBeTruthy()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-head"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-head"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-head")
  act(() => drain(3))
  expect(root.getAttribute("data-head")).toBe(stopped)
})

test("减弱动效瞬时改窗口，不播放", () => {
  installMedia({ reduced: true })
  const view = render(<WaveClipWindow play />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.pointerDown(view.getByRole("slider", { name: "Clip window" }), { clientX: 90, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-start", "0.30")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})
