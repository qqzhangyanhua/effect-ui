// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { VinylClipWindow } from "./vinyl-clip-window"

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
  const entry = getComponent("vinyl-clip-window")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='vinyl-clip-window']")
  if (!(node instanceof HTMLElement)) throw new Error("missing vinyl clip")
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

test("黑胶剪辑窗控件起始值等于默认", async () => {
  expect(getComponent("vinyl-clip-window")?.batch).toBe(73)
  expect(getComponent("vinyl-clip-window")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("spin")).toBe(true)
  expect(start("window")).toBe(0.35)
  const view = render(<VinylClipWindow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-layout", "disc-window")
  expect(root).toHaveAttribute("data-start", "0.200")
  expect(root).toHaveAttribute("data-end", "0.550")
  expect(root).toHaveAttribute("data-playing", "yes")
  expect(root.querySelector("[data-part='disc']")).toHaveAttribute("data-label", "Clip A")
  expect(view.getByText("Clip A")).toBeInTheDocument()
  expect(root.querySelectorAll("[data-part='wave'] rect")).toHaveLength(48)
  expect(view.getByRole("status")).toHaveTextContent("选区 0:06 到 0:18")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-spinning", "yes"))
  expect(root).toHaveAttribute("data-state", "spinning")
  expect(queued.size).toBeGreaterThan(0)
})

test("播放旋转黑胶，暂停后停帧", async () => {
  const view = render(<VinylClipWindow />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-spinning", "yes"))
  act(() => drain(1))
  expect(root.getAttribute("data-angle")).not.toBe("0")
  fireEvent.click(view.getByRole("button", { name: "暂停" }))
  expect(root).toHaveAttribute("data-playing", "no")
  expect(root).toHaveAttribute("data-spinning", "no")
  expect(root).toHaveAttribute("data-state", "paused")
  expect(queued.size).toBe(0)
})

test("键盘和拖动改选区，手柄改起点", async () => {
  const onRangeChange = vi.fn()
  const view = render(<VinylClipWindow onRangeChange={onRangeChange} />)
  const root = rootOf(view.container)
  const windowPane = view.getByRole("slider", { name: "剪辑选区" })
  const track = root.querySelector("[data-part='track']")
  if (!(track instanceof HTMLElement)) throw new Error("missing track")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(windowPane, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-start", "0.250")
  expect(root).toHaveAttribute("data-end", "0.600")
  fireEvent.keyDown(windowPane, { key: "]" })
  expect(root).toHaveAttribute("data-end", "0.650")
  fireEvent.keyDown(windowPane, { key: "[" })
  expect(root).toHaveAttribute("data-end", "0.600")
  expect(onRangeChange).toHaveBeenCalled()
  fireEvent.pointerDown(windowPane, { clientX: 10, button: 0, pointerId: 1 })
  fireEvent.pointerMove(track, { clientX: 38, pointerId: 1 })
  expect(root).toHaveAttribute("data-start", "0.350")
  expect(root).toHaveAttribute("data-end", "0.700")
  expect(root).toHaveAttribute("data-state", "scrubbing")
  fireEvent.pointerUp(track, { pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "spinning")
  const handle = root.querySelector("[data-part='start-handle']")
  if (!(handle instanceof HTMLElement)) throw new Error("missing handle")
  fireEvent.pointerDown(handle, { clientX: 0, button: 0, pointerId: 2 })
  fireEvent.pointerMove(track, { clientX: 28, pointerId: 2 })
  expect(root).toHaveAttribute("data-start", "0.450")
  expect(root).toHaveAttribute("data-end", "0.700")
})

test("初始选区占比和关闭旋转", async () => {
  const wide = render(<VinylClipWindow window={0.5} />)
  expect(rootOf(wide.container)).toHaveAttribute("data-start", "0.200")
  expect(rootOf(wide.container)).toHaveAttribute("data-end", "0.700")
  cleanup()
  const still = render(<VinylClipWindow spin={false} />)
  const root = rootOf(still.container)
  expect(root).toHaveAttribute("data-playing", "no")
  expect(root).toHaveAttribute("data-state", "paused")
  expect(still.getByRole("button", { name: "播放" })).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-spinning", "no")
  expect(queued.size).toBe(0)
})

test("减弱动效不旋转，并用滑块改选区", async () => {
  installMedia({ reduced: true })
  const view = render(<VinylClipWindow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-angle", "0")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-spinning", "no")
  expect(queued.size).toBe(0)
  fireEvent.change(view.getByRole("slider", { name: "起点" }), { target: { value: "100" } })
  expect(root).toHaveAttribute("data-start", "0.100")
  fireEvent.change(view.getByRole("slider", { name: "终点" }), { target: { value: "800" } })
  expect(root).toHaveAttribute("data-end", "0.800")
  expect(root).toHaveAttribute("data-angle", "0")
  expect(queued.size).toBe(0)
})

test("离开视口时停转", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<VinylClipWindow />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-spinning", "yes"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-spinning", "no")
  expect(queued.size).toBe(0)
  expect(root).toHaveAttribute("data-start", "0.200")
})
