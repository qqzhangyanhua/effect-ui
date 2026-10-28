// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { WavePinAnchor, nextWavePin, waveAmp, waveFromPointer } from "./wave-pin-anchor"

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
  const found = getComponent("wave-pin-anchor")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='wave-pin-anchor']")
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

test("波形钉默认停在起点，没有音频元素", () => {
  expect(getComponent("wave-pin-anchor")?.batch).toBe(80)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("autoPlay")).toBe(false)
  expect(start("showPins")).toBe(true)
  expect(waveAmp(0)).toBeGreaterThan(0)
  expect(nextWavePin(null)).toBe(0)
  expect(nextWavePin(2)).toBe(0)
  expect(waveFromPointer(160, { left: 0, width: 0 })).toBe(0.5)
  const view = render(<WavePinAnchor />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "wave-pin")
  expect(root).toHaveAttribute("data-t", "0.00")
  expect(root).toHaveAttribute("data-pin", "none")
  expect(root).toHaveAttribute("data-open", "off")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("button", { name: "Note A" })).toBeInTheDocument()
  expect(view.container.querySelector("audio")).toBeNull()
  expect(view.queryByText(/spotify|soundcloud|artist/i)).toBeNull()
  expect(queued.size).toBe(0)
})

test("拖动改进度，点钉吸附并展开", () => {
  const onValueChange = vi.fn()
  const view = render(<WavePinAnchor onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const lane = view.getByRole("slider", { name: "Wave position" })
  fireEvent.pointerDown(lane, { clientX: 160, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.50")
  fireEvent.pointerUp(lane, { clientX: 160, pointerId: 1 })
  expect(root).toHaveAttribute("data-phase", "idle")
  fireEvent.click(view.getByRole("button", { name: "Note B" }))
  expect(root).toHaveAttribute("data-t", "0.46")
  expect(root).toHaveAttribute("data-pin", "1")
  expect(root).toHaveAttribute("data-open", "on")
  expect(root).toHaveAttribute("data-phase", "pinned")
  expect(view.getByText("The middle crest holds one line.")).toBeInTheDocument()
  expect(onValueChange).toHaveBeenLastCalledWith({ t: 0.46, activePin: 1 })
  const played = root.querySelectorAll("[data-bar='played']").length
  expect(played).toBeGreaterThan(0)
  expect(played).toBeLessThan(36)
})

test("方向键步进，P 下一钉，Enter 展开", () => {
  const view = render(<WavePinAnchor />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.02")
  fireEvent.keyDown(root, { key: "P" })
  expect(root).toHaveAttribute("data-pin", "0")
  expect(root).toHaveAttribute("data-t", "0.18")
  expect(root).toHaveAttribute("data-open", "on")
  fireEvent.keyDown(root, { key: "p" })
  expect(root).toHaveAttribute("data-pin", "1")
  expect(root).toHaveAttribute("data-t", "0.46")
  fireEvent.keyDown(root, { key: "p" })
  expect(root).toHaveAttribute("data-pin", "2")
  expect(root).toHaveAttribute("data-t", "0.74")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-open", "off")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-open", "on")
  expect(view.getByText("Note C")).toBeInTheDocument()
})

test("自动播放离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<WavePinAnchor autoPlay />)
  const root = rootOf(view.container)
  await waitFor(() => {
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

test("减弱动效瞬时吸附，关闭钉评后不再显示气泡", () => {
  installMedia({ reduced: true })
  const hidden = render(<WavePinAnchor autoPlay showPins={false} />)
  const hiddenRoot = rootOf(hidden.container)
  expect(hiddenRoot).toHaveAttribute("data-motion", "off")
  expect(hiddenRoot).toHaveAttribute("data-pins", "off")
  expect(hiddenRoot).toHaveAttribute("data-playing", "off")
  expect(hiddenRoot).toHaveAttribute("data-ease", "0")
  expect(hidden.queryByRole("button", { name: "Note A" })).toBeNull()
  expect(queued.size).toBe(0)
  hidden.unmount()
  const view = render(<WavePinAnchor />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Note A" }))
  expect(root).toHaveAttribute("data-t", "0.18")
  expect(root).toHaveAttribute("data-open", "on")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})
