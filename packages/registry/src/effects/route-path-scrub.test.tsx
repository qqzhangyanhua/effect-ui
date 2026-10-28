// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { RoutePathScrub, routePoint, routeSample } from "./route-path-scrub"

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
  const entry = getComponent("route-path-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='route-path-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing route")
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

test("路线控件起始值等于默认，读数停在 2.4 公里", async () => {
  expect(getComponent("route-path-scrub")?.batch).toBe(77)
  expect(getComponent("route-path-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("metrics")).toBe(true)
  expect(start("auto")).toBe(false)
  expect(routeSample(0.3)).toMatchObject({ km: 2.4, paceLabel: "5'12\"", hr: 158 })
  const view = render(<RoutePathScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "route-polyline")
  expect(root).toHaveAttribute("data-t", "0.30")
  expect(root).toHaveAttribute("data-km", "2.4")
  expect(root).toHaveAttribute("data-split", "5'12\"")
  expect(root).toHaveAttribute("data-hr", "158")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-x", String(routePoint(0.3).x))
  expect(root.querySelector("[data-part='route']")).toBeTruthy()
  expect(root.querySelector("[data-marker]")).toBeTruthy()
  expect(root.querySelector("[data-part='ridge']")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("2.4 km")
  expect(view.getByRole("status")).toHaveTextContent("5'12\"/km")
  expect(view.getByRole("status")).toHaveTextContent("158 bpm")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖进度轨和方向键同步距离与配速", () => {
  const onValueChange = vi.fn()
  const view = render(<RoutePathScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const track = view.getByRole("slider", { name: "Route progress" })
  fireEvent.keyDown(track, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.32")
  expect(root).toHaveAttribute("data-km", "2.6")
  fireEvent.keyDown(track, { key: "Home" })
  expect(root).toHaveAttribute("data-t", "0.00")
  expect(root).toHaveAttribute("data-km", "0.0")
  expect(root).toHaveAttribute("data-split", "4'40\"")
  fireEvent.keyDown(track, { key: "End" })
  expect(root).toHaveAttribute("data-t", "1.00")
  expect(root).toHaveAttribute("data-km", "8.0")
  fireEvent.pointerDown(track, { clientX: 196, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.70")
  expect(root).toHaveAttribute("data-km", "5.6")
  expect(root).toHaveAttribute("data-split", "5'12\"")
  expect(root).toHaveAttribute("data-hr", "158")
  expect(root).toHaveAttribute("data-x", String(routePoint(0.7).x))
  expect(onValueChange).toHaveBeenCalledWith(0.7)
  fireEvent.pointerUp(track, { clientX: 196, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBe(0)
})

test("关闭配速后只保留距离", () => {
  const view = render(<RoutePathScrub metrics={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-metrics", "off")
  expect(view.getByRole("status")).toHaveTextContent("2.4 km")
  expect(view.getByRole("status")).not.toHaveTextContent("bpm")
  expect(view.getByRole("status")).not.toHaveTextContent("/km")
})

test("自动推进在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<RoutePathScrub auto />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-auto", "on")
  expect(root).toHaveAttribute("data-state", "playing")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-t"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-t"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-t")
  act(() => drain(3))
  expect(root.getAttribute("data-t")).toBe(stopped)
})

test("减弱动效瞬时改读数，不自动推进", () => {
  installMedia({ reduced: true })
  const view = render(<RoutePathScrub auto />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  const track = view.getByRole("slider", { name: "Route progress" })
  fireEvent.pointerDown(track, { clientX: 196, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-t", "0.70")
  expect(root).toHaveAttribute("data-km", "5.6")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})
