// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PuzzleSlideFit } from "./puzzle-slide-fit"

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
  const entry = getComponent("puzzle-slide-fit")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='puzzle-slide-fit']")
  if (!(node instanceof HTMLElement)) throw new Error("missing puzzle")
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

test("拼图控件起始值等于默认，块还停在起点", async () => {
  expect(getComponent("puzzle-slide-fit")?.batch).toBe(69)
  expect(getComponent("puzzle-slide-fit")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.55)
  expect(start("target")).toBe(0.62)
  expect(start("jagged")).toBe(0.45)
  const view = render(<PuzzleSlideFit />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "拼图滑块" })
  expect(root).toHaveAttribute("data-ritual", "puzzle-slide")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.55")
  expect(root).toHaveAttribute("data-target", "0.620")
  expect(root).toHaveAttribute("data-jagged", "0.45")
  expect(root).toHaveAttribute("data-x", "0.000")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(slider).toHaveAttribute("aria-valuenow", "0")
  expect(root.querySelector("[data-notch]")).not.toBeNull()
  expect(root.querySelector("[data-piece]")).not.toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("未对齐")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("滑到缺口会成功，重排换一个目标", async () => {
  const onSuccess = vi.fn()
  const view = render(<PuzzleSlideFit onSuccess={onSuccess} />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "拼图滑块" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(slider, { clientX: 198.4, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: 198.4, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "success")
  expect(root).toHaveAttribute("data-fit", "ok")
  expect(root).toHaveAttribute("data-x", "0.620")
  expect(view.getByText("对齐了")).toBeInTheDocument()
  expect(view.getByRole("status")).toHaveTextContent("已对齐")
  expect(onSuccess).toHaveBeenCalledTimes(1)
  fireEvent.click(view.getByRole("button", { name: "重排" }))
  expect(root).toHaveAttribute("data-seed", "2")
  expect(root).toHaveAttribute("data-target", "0.740")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-x", "0.000")
  expect(view.queryByText("对齐了")).toBeNull()
})

test("方向键微调后回车可以提交", () => {
  const view = render(<PuzzleSlideFit />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "拼图滑块" })
  for (let i = 0; i < 12; i += 1) fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-x", "0.600")
  fireEvent.keyDown(slider, { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "success")
  expect(root).toHaveAttribute("data-x", "0.620")
})

test("没对准会回弹", async () => {
  const view = render(<PuzzleSlideFit />)
  const root = rootOf(view.container)
  const slider = view.getByRole("slider", { name: "拼图滑块" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(slider, { clientX: 16, pointerId: 1 })
  fireEvent.pointerUp(slider, { clientX: 16, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "retry")
  expect(root).toHaveAttribute("data-fit", "miss")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(16))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-x", "0.000")
  expect(queued.size).toBe(0)
})

test("减弱动效一键对齐，不再拖动", () => {
  installMedia({ reduced: true })
  const onSuccess = vi.fn()
  const view = render(<PuzzleSlideFit onSuccess={onSuccess} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByRole("slider")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "对齐" }))
  expect(root).toHaveAttribute("data-state", "success")
  expect(root).toHaveAttribute("data-x", root.getAttribute("data-target"))
  expect(onSuccess).toHaveBeenCalledTimes(1)
  act(() => drain(6))
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "重排" }))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-target", "0.740")
})
