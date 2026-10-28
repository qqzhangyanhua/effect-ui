// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { getComponent } from "../catalog"
import { TabMediaSwap } from "./tab-media-swap"

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

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const queued = new Map<number, FrameRequestCallback>()
let nextFrame = 1
let now = 0

function installFrames() {
  queued.clear()
  nextFrame = 1
  now = 0
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

function drain(max: number, jump = 0) {
  for (let i = 0; i < max; i += 1) {
    now += jump
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(now)
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
  const entry = getComponent("tab-media-swap")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='tab-media-swap']")
  if (!(node instanceof HTMLElement)) throw new Error("missing tabs")
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  vi.spyOn(performance, "now").mockImplementation(() => now)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test("表媒控件起始值等于默认，索引和媒体一致", async () => {
  expect(getComponent("tab-media-swap")?.batch).toBe(69)
  expect(getComponent("tab-media-swap")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("autoplay")).toBe(true)
  expect(start("count")).toBe(4)
  const view = render(<TabMediaSwap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "tab-media")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.6")
  expect(root).toHaveAttribute("data-count", "4")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-media", "scope")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-shift", "8")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("tab", { name: /范围/ })).toHaveAttribute("aria-selected", "true")
  expect(view.getByRole("tabpanel")).toHaveTextContent("色块一")
  expect(view.getByRole("status")).toHaveTextContent("当前：范围")
  expect(view.getAllByRole("tab").filter((tab) => tab.getAttribute("aria-selected") === "true")).toHaveLength(1)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-autoplay", "on")
  expect(queued.size).toBeGreaterThan(0)
})

test("点击、方向键和横滑都会让索引跟上媒体", async () => {
  const onIndexChange = vi.fn()
  const view = render(<TabMediaSwap onIndexChange={onIndexChange} autoplay={false} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-autoplay", "off")
  fireEvent.click(view.getByRole("tab", { name: /焦点/ }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-media", "focus")
  expect(view.getByRole("tabpanel")).toHaveTextContent("色块二")
  expect(view.getByRole("tab", { name: /焦点/ })).toHaveAttribute("aria-selected", "true")
  expect(view.getByRole("status")).toHaveTextContent("当前：焦点")
  expect(onIndexChange).toHaveBeenCalledWith(1)
  fireEvent.keyDown(view.getByRole("tablist"), { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-media", "swap")
  fireEvent.keyDown(view.getByRole("tablist"), { key: "End" })
  expect(root).toHaveAttribute("data-index", "3")
  fireEvent.keyDown(view.getByRole("tablist"), { key: "Home" })
  expect(root).toHaveAttribute("data-index", "0")
  const panel = view.getByRole("tabpanel")
  fireEvent.pointerDown(panel, { clientX: 180, pointerId: 1 })
  fireEvent.pointerUp(panel, { clientX: 20, pointerId: 1 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-media", "focus")
})

test("自动轮播前进，指针进入或离开视口后停住", async () => {
  const view = render(<TabMediaSwap />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-autoplay", "on"))
  act(() => drain(1, 2000))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-media", "focus")
  fireEvent.pointerEnter(root)
  expect(root).toHaveAttribute("data-paused", "on")
  expect(root).toHaveAttribute("data-autoplay", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3, 2000))
  expect(root).toHaveAttribute("data-index", "1")
})

test("离开视口后不再自动轮播", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<TabMediaSwap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-autoplay", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4, 2000))
  expect(root).toHaveAttribute("data-index", "0")
  expect(queued.size).toBe(0)
})

test("减弱动效瞬时切换并关闭自动播放", () => {
  installMedia({ reduced: true })
  const view = render(<TabMediaSwap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-autoplay", "off")
  expect(root).toHaveAttribute("data-shift", "0")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.click(view.getByRole("tab", { name: /切换/ }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-media", "swap")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(view.getByRole("tabpanel")).toHaveTextContent("色块三")
  act(() => drain(4, 2000))
  expect(queued.size).toBe(0)
  expect(root).toHaveAttribute("data-index", "2")
})
