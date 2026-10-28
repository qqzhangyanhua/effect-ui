// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HexTrailClaim, exploredPercent } from "./hex-trail-claim"

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
  const entry = getComponent("hex-trail-claim")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='hex-trail-claim']")
  if (!(node instanceof HTMLElement)) throw new Error("missing hex")
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

test("六边形探路从零认领开始，控件起始值等于默认", async () => {
  expect(getComponent("hex-trail-claim")?.batch).toBe(75)
  expect(getComponent("hex-trail-claim")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("count")).toBe(16)
  expect(start("auto")).toBe(false)
  const view = render(<HexTrailClaim />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "hex-claim")
  expect(root).toHaveAttribute("data-claimed", "0")
  expect(root).toHaveAttribute("data-percent", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-count", "16")
  expect(root.querySelectorAll("[data-hex]")).toHaveLength(16)
  expect(root.querySelector("[data-claimed='yes']")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("0% explored")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("方向键按格认领，Home 和 End 跳到两端", () => {
  const onProgressChange = vi.fn()
  const view = render(<HexTrailClaim onProgressChange={onProgressChange} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "探路进度" })
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-claimed", "1")
  expect(root).toHaveAttribute("data-percent", String(exploredPercent(1 / 16, 16)))
  expect(root).toHaveAttribute("data-state", "claiming")
  expect(view.getByRole("status")).toHaveTextContent(`${exploredPercent(1 / 16, 16)}% explored`)
  expect(root.querySelector("[data-head='yes']")).toHaveAttribute("data-hex", "0")
  expect(onProgressChange).toHaveBeenCalled()
  fireEvent.keyDown(slider, { key: "End" })
  expect(root).toHaveAttribute("data-claimed", "16")
  expect(root).toHaveAttribute("data-percent", "100")
  expect(root).toHaveAttribute("data-state", "complete")
  fireEvent.keyDown(slider, { key: "Home" })
  expect(root).toHaveAttribute("data-claimed", "0")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("路径格数可调，减弱动效瞬时点亮", () => {
  installMedia({ reduced: true })
  const view = render(<HexTrailClaim count={12} intensity={0.2} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "12")
  expect(root).toHaveAttribute("data-intensity", "0.2")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root.querySelectorAll("[data-hex]")).toHaveLength(12)
  fireEvent.change(view.getByRole("slider", { name: "探路进度" }), { target: { value: "8" } })
  expect(root).toHaveAttribute("data-claimed", "8")
  expect(root).toHaveAttribute("data-percent", String(exploredPercent(8 / 12, 12)))
  expect(root).toHaveAttribute("data-state", "scrub")
  expect(queued.size).toBe(0)
})

test("自动认领会往前点亮，离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<HexTrailClaim auto />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(4))
  expect(Number(root.getAttribute("data-claimed"))).toBeGreaterThan(0)
  expect(root).toHaveAttribute("data-state", "claiming")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
})
