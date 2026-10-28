// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { CaseStudyCarousel } from "./case-study-carousel"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
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
  const entry = getComponent("case-study-carousel")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
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

test("作品集控件起始值等于默认，并标成 carousel", async () => {
  expect(start("pace")).toBe(1)
  expect(start("peek")).toBe(0.22)
  expect(start("intensity")).toBe(0.7)
  expect(start("gap")).toBe(12)
  const view = render(<CaseStudyCarousel />)
  const root = view.getByRole("region", { name: "作品集" })
  expect(root).toHaveAttribute("aria-roledescription", "carousel")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-peek", "0.22")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-count", "5")
  expect(view.getByRole("heading", { name: "晨港" })).toBeInTheDocument()
  const current = root.querySelector("[data-distance='0']")
  const peek = root.querySelector("[data-distance='1']")
  expect(current).toHaveAttribute("data-scale", "1")
  expect(current).toHaveAttribute("data-role", "current")
  expect(Number(peek?.getAttribute("data-scale"))).toBeLessThan(1)
  expect(peek).toHaveAttribute("data-role", "peek")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("方向键和按钮步进，并更新说明", async () => {
  const onIndexChange = vi.fn()
  const view = render(<CaseStudyCarousel onIndexChange={onIndexChange} />)
  const root = view.getByRole("region", { name: "作品集" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "transitioning")
  expect(view.getByRole("heading", { name: "纸灯" })).toBeInTheDocument()
  expect(onIndexChange).toHaveBeenCalledWith(1)
  act(() => drain(4))
  expect(root).toHaveAttribute("data-state", "settled")
  fireEvent.click(view.getByRole("button", { name: "下一则" }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(view.getByRole("heading", { name: "盐田" })).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "1")
})

test("从第一张按左方向键回到最后一张", async () => {
  const view = render(<CaseStudyCarousel />)
  const root = view.getByRole("region", { name: "作品集" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "4")
  expect(view.getByRole("heading", { name: "回线" })).toBeInTheDocument()
})

test("横向拖过阈值才换卡", async () => {
  const view = render(<CaseStudyCarousel />)
  const root = view.getByRole("region", { name: "作品集" })
  const track = root.querySelector("[data-track]") as HTMLElement
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(track, { button: 0, pointerId: 1, clientX: 100, clientY: 20 })
  fireEvent.pointerMove(track, { pointerId: 1, clientX: 80, clientY: 22 })
  fireEvent.pointerUp(track, { pointerId: 1, clientX: 80, clientY: 20 })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.pointerDown(track, { button: 0, pointerId: 2, clientX: 180, clientY: 20 })
  fireEvent.pointerMove(track, { pointerId: 2, clientX: 20, clientY: 24 })
  fireEvent.pointerUp(track, { pointerId: 2, clientX: 20, clientY: 20 })
  expect(root).toHaveAttribute("data-index", "1")
  expect(view.getByRole("heading", { name: "纸灯" })).toBeInTheDocument()
})

test("减弱动效瞬时切卡，邻卡不再缩小", async () => {
  installMedia({ reduced: true })
  const view = render(<CaseStudyCarousel />)
  const root = view.getByRole("region", { name: "作品集" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-instant", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  const peek = root.querySelector("[data-distance='1']")
  expect(peek).toHaveAttribute("data-scale", "1")
  expect(peek?.getAttribute("style")).toContain("transition: none")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "settled")
  expect(view.getByRole("heading", { name: "纸灯" })).toBeInTheDocument()
  act(() => drain(4))
  expect(root).toHaveAttribute("data-state", "settled")
})

test("离开视口后方向键仍然换卡，但不再排动画帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<CaseStudyCarousel />)
  const root = view.getByRole("region", { name: "作品集" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "settled")
  act(() => drain(4))
  expect(queued.size).toBe(0)
})
