// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { getComponent } from "../catalog"
import { StripStepExpand } from "./strip-step-expand"

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

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(performance.now())
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
  const entry = getComponent("strip-step-expand")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='strip-step-expand']")
  if (!(node instanceof HTMLElement)) throw new Error("missing strip")
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

test("编号条控件起始值等于默认，并且只有一条展开", async () => {
  expect(getComponent("strip-step-expand")?.batch).toBe(69)
  expect(getComponent("strip-step-expand")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("count")).toBe(3)
  expect(start("gap")).toBe(8)
  const view = render(<StripStepExpand />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "strip-step")
  expect(root).toHaveAttribute("data-layout", "horizontal-strips")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-count", "3")
  expect(root).toHaveAttribute("data-gap", "8")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-state", "expanded")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByRole("dialog")).toBeNull()
  const tabs = view.getAllByRole("tab")
  expect(tabs).toHaveLength(3)
  expect(tabs.filter((tab) => tab.getAttribute("data-open") === "true")).toHaveLength(1)
  expect(tabs[0]).toHaveAttribute("data-writing", "horizontal")
  expect(tabs[1]).toHaveAttribute("data-writing", "vertical")
  expect(tabs[1]?.querySelector("[data-title]")).toHaveStyle({ writingMode: "vertical-rl" })
  expect(view.getByRole("status")).toHaveTextContent("取景")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键和点击只展开一条，展开帧结束后落定", async () => {
  const onIndexChange = vi.fn()
  const view = render(<StripStepExpand onIndexChange={onIndexChange} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "expanding")
  expect(onIndexChange).toHaveBeenCalledWith(1)
  expect(view.getAllByRole("tab").filter((tab) => tab.getAttribute("data-open") === "true")).toHaveLength(1)
  expect(view.getByRole("tab", { name: "02 展开" })).toHaveAttribute("aria-selected", "true")
  expect(view.getByRole("tab", { name: "01 取景" })).toHaveAttribute("data-state", "collapsed")
  act(() => drain(4))
  expect(root).toHaveAttribute("data-state", "expanded")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("tab", { name: "03 收窄" }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(view.getAllByRole("tab").filter((tab) => tab.getAttribute("data-open") === "true")).toHaveLength(1)
})

test("减弱动效瞬时换条，不再排展开帧", () => {
  installMedia({ reduced: true })
  const view = render(<StripStepExpand />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.click(view.getByRole("tab", { name: "03 收窄" }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(root).toHaveAttribute("data-state", "expanded")
  expect(view.getByRole("tab", { name: "03 收窄" })).toHaveAttribute("data-writing", "horizontal")
  expect(view.getAllByRole("tab").filter((tab) => tab.getAttribute("data-open") === "true")).toHaveLength(1)
  act(() => drain(4))
  expect(queued.size).toBe(0)
})
