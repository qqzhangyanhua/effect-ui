// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { LiveStageCapsule } from "./live-stage-capsule"

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
let clock = 1000

function installFrames() {
  queued.clear()
  nextFrame = 1
  clock = 1000
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

function drain(frames: number, step = 0) {
  for (let i = 0; i < frames; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    clock += step
    for (const callback of batch) callback(clock)
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
  const entry = getComponent("live-stage-capsule")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='live-stage-capsule']")
  if (!(node instanceof HTMLElement)) throw new Error("missing stage")
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

test("阶段胶囊控件起始值等于默认", async () => {
  expect(getComponent("live-stage-capsule")?.batch).toBe(71)
  expect(getComponent("live-stage-capsule")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("stages")).toBe(4)
  expect(start("autoAdvance")).toBe(false)
  const view = render(<LiveStageCapsule />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "stage-capsule")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-expanded", "on")
  expect(root).toHaveAttribute("data-stages", "4")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-label", "Stage A")
  expect(root).toHaveAttribute("data-auto", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(Number(root.getAttribute("data-ease"))).toBeGreaterThan(0)
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("status")).toHaveTextContent("当前 Stage A，1 / 4")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("Next stage 与方向键推进，到末尾完成", async () => {
  const view = render(<LiveStageCapsule />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Next stage" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "advancing")
  act(() => drain(2))
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "2")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "1")
  fireEvent.click(view.getByRole("button", { name: "Stage C" }))
  expect(root).toHaveAttribute("data-index", "2")
  expect(view.getByRole("button", { name: "Stage C" })).toHaveAttribute("aria-current", "step")
  fireEvent.click(view.getByRole("button", { name: "Next stage" }))
  fireEvent.click(view.getByRole("button", { name: "Next stage" }))
  expect(root).toHaveAttribute("data-index", "3")
  act(() => drain(2))
  expect(root).toHaveAttribute("data-state", "complete")
  expect(view.getByRole("button", { name: "Next stage" })).toBeDisabled()
})

test("收起后阶段节点不可见，展开后回来", () => {
  const view = render(<LiveStageCapsule />)
  fireEvent.click(view.getByRole("button", { name: "收起" }))
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-expanded", "off")
  expect(view.queryByRole("button", { name: "Stage A" })).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "展开" }))
  expect(root).toHaveAttribute("data-expanded", "on")
  expect(view.getByRole("button", { name: "Stage A" })).toBeInTheDocument()
})

test("stages 决定节点数量", () => {
  const view = render(<LiveStageCapsule stages={3} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-stages", "3")
  expect(view.getByRole("button", { name: "Stage C" })).toBeInTheDocument()
  expect(view.queryByRole("button", { name: "Stage D" })).toBeNull()
})

test("减弱动效瞬时切换，自动推进不跑", () => {
  installMedia({ reduced: true })
  const view = render(<LiveStageCapsule autoAdvance />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Next stage" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  act(() => drain(6, 400))
  expect(root).toHaveAttribute("data-index", "1")
})

test("自动推进离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<LiveStageCapsule autoAdvance />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => {
    drain(1, 0)
    drain(3, 400)
  })
  expect(Number(root.getAttribute("data-index"))).toBeGreaterThanOrEqual(1)
  const held = root.getAttribute("data-index")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  act(() => drain(6, 400))
  expect(root).toHaveAttribute("data-index", held)
})
