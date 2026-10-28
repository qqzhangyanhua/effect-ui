// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { WindStreakScrub, windSample } from "./wind-streak-scrub"

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
  const entry = getComponent("wind-streak-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='wind-streak-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing wind")
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

test("风纹控件起始值等于默认，粒子帧在视口内排队", async () => {
  expect(getComponent("wind-streak-scrub")?.batch).toBe(75)
  expect(getComponent("wind-streak-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("span")).toBe(5)
  expect(start("play")).toBe(false)
  expect(windSample(0.2, 0.65).angle).not.toBe(windSample(0.8, 0.65).angle)
  expect(windSample(0.2, 0.2).density).not.toBe(windSample(0.2, 1).density)
  const view = render(<WindStreakScrub />)
  const root = rootOf(view.container)
  const sample = windSample(0.2, 0.65)
  expect(root).toHaveAttribute("data-ritual", "wind-field")
  expect(root).toHaveAttribute("data-t", "0.20")
  expect(root).toHaveAttribute("data-time", "08:24")
  expect(root).toHaveAttribute("data-angle", String(sample.angle))
  expect(root).toHaveAttribute("data-density", String(sample.density))
  expect(root).toHaveAttribute("data-speed", sample.speed.toFixed(2))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-span", "5")
  expect(root.querySelector("[data-part='particles']")).toBeTruthy()
  expect(root.querySelector("[data-part='static-streaks']")).toBeNull()
  expect(root.querySelector("[data-part='legend']")).toBeTruthy()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("拖时刻轨和方向键会改风向与密度，Play 推进 t", async () => {
  const onValueChange = vi.fn()
  const view = render(<WindStreakScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const track = view.getByRole("slider", { name: "风场时刻" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(track, { clientX: 240, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.75")
  expect(root).toHaveAttribute("data-angle", String(windSample(0.75, 0.65).angle))
  expect(root).toHaveAttribute("data-density", String(windSample(0.75, 0.65).density))
  expect(onValueChange).toHaveBeenCalledWith(0.75)
  fireEvent.pointerUp(track, { clientX: 240, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(track, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.77")
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  expect(root).toHaveAttribute("data-state", "playing")
  const before = root.getAttribute("data-t")
  act(() => drain(4))
  expect(root.getAttribute("data-t")).not.toBe(before)
  expect(root).toHaveAttribute("data-state", "playing")
  fireEvent.keyDown(track, { key: " " })
  expect(root).toHaveAttribute("data-state", "paused")
})

test("时刻标签数量、强度和自动播放跟着控件走", async () => {
  const view = render(<WindStreakScrub span={3} intensity={1} play />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-span", "3")
  expect(root.querySelector("[data-part='labels']")?.querySelectorAll("button")).toHaveLength(3)
  expect(root).toHaveAttribute("data-density", String(windSample(0.2, 1).density))
  expect(root).toHaveAttribute("data-state", "playing")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const before = root.getAttribute("data-angle")
  act(() => drain(8))
  expect(root.getAttribute("data-angle")).not.toBe(before)
})

test("减弱动效只留静态短纹，时刻瞬时跳", () => {
  installMedia({ reduced: true })
  const view = render(<WindStreakScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root.querySelector("[data-part='static-streaks']")).toBeTruthy()
  expect(root.querySelector("[data-streak]")).toBeTruthy()
  expect(root.querySelector("[data-part='particles']")).toBeNull()
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Play" }))
  expect(root).toHaveAttribute("data-t", "0.45")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-angle", String(windSample(0.45, 0.65).angle))
  expect(queued.size).toBe(0)
  fireEvent.change(view.getByRole("slider", { name: "时刻" }), { target: { value: "80" } })
  expect(root).toHaveAttribute("data-t", "0.80")
  expect(queued.size).toBe(0)
})

test("离开视口后停掉风粒子帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<WindStreakScrub />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
})
