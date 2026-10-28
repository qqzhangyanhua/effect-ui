// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { MoodWordRing, angleFromPointer, moodIndexFromAngle, moodSnapAngle } from "./mood-word-ring"

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
  const found = getComponent("mood-word-ring")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='mood-word-ring']")
  if (!(node instanceof HTMLElement)) throw new Error("missing ring")
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

test("词环默认停在 Calm，控件起始值等于默认", async () => {
  expect(getComponent("mood-word-ring")?.batch).toBe(79)
  expect(getComponent("mood-word-ring")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("auto")).toBe(false)
  expect(start("echo")).toBe(true)
  expect(angleFromPointer(120, 0, { left: 0, top: 0, width: 0, height: 0 })).toBe(0)
  expect(moodIndexFromAngle(90)).toBe(2)
  expect(moodSnapAngle(90)).toBe(90)
  const view = render(<MoodWordRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "mood-ring")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-word", "Calm")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-echo", "on")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Calm", { selector: "[data-part='echo']" })).toBeInTheDocument()
  expect(view.queryByText(/tinywins/i)).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("点词、拖环和方向键都会吸附到一词", () => {
  const onValueChange = vi.fn()
  const view = render(<MoodWordRing onValueChange={onValueChange} echo={false} />)
  const root = rootOf(view.container)
  expect(root.querySelector("[data-part='echo']")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Focus" }))
  expect(root).toHaveAttribute("data-word", "Focus")
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-phase", "snapped")
  expect(onValueChange).toHaveBeenCalledWith({ index: 1, word: "Focus" })
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-word", "Bright")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-word", "Focus")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-confirmed", "Focus")
  const ring = root.querySelector("[data-part='ring']")
  if (!(ring instanceof HTMLElement)) throw new Error("missing ring")
  fireEvent.pointerDown(ring, { clientX: 120, clientY: 0, button: 0, pointerId: 1 })
  fireEvent.pointerMove(ring, { clientX: 200, clientY: 40, pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "spinning")
  fireEvent.pointerUp(ring, { pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "snapped")
  expect(root).toHaveAttribute("data-word", "Bright")
  expect(root).toHaveAttribute("data-index", "2")
})

test("自动慢旋在视口内推进，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MoodWordRing auto />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-angle"))
  act(() => drain(16))
  expect(Number(root.getAttribute("data-angle"))).toBeGreaterThan(before)
  expect(root.getAttribute("data-word")).not.toBe("Calm")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-angle")
  act(() => drain(4))
  expect(root.getAttribute("data-angle")).toBe(stopped)
})

test("减弱动效瞬时换词，慢旋不再运行", () => {
  installMedia({ reduced: true })
  const view = render(<MoodWordRing auto />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-word", "Focus")
  expect(root).toHaveAttribute("data-phase", "snapped")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-angle", "45.0")
  expect(queued.size).toBe(0)
})
