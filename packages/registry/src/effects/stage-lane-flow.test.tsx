// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { StageLaneFlow, stageAt, stageShare } from "./stage-lane-flow"

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
  const entry = getComponent("stage-lane-flow")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='stage-lane-flow']")
  if (!(node instanceof HTMLElement)) throw new Error("missing stages")
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

test("阶段图默认落在 Deep，四道和图例都在", async () => {
  expect(getComponent("stage-lane-flow")?.batch).toBe(76)
  expect(getComponent("stage-lane-flow")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("lanes")).toBe("4")
  expect(start("flow")).toBe(false)
  expect(stageAt(0.3, "4")).toBe("Deep")
  expect(stageShare("Deep", "4")).toBe(30)
  const view = render(<StageLaneFlow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "stage-lanes")
  expect(root).toHaveAttribute("data-t", "0.30")
  expect(root).toHaveAttribute("data-stage", "Deep")
  expect(root).toHaveAttribute("data-share", "30")
  expect(root).toHaveAttribute("data-time", "00:24")
  expect(root).toHaveAttribute("data-lanes", "4")
  expect(root).toHaveAttribute("data-flow", "off")
  expect(view.getByRole("status")).toHaveTextContent("Deep · 30% · 00:24")
  expect(view.getByRole("button", { name: "REM" })).toBeInTheDocument()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖竖线改阶段，图例过滤降低其它道", () => {
  const onValueChange = vi.fn()
  const view = render(<StageLaneFlow onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const chart = view.getByRole("slider", { name: "Sleep stages" })
  fireEvent.pointerDown(chart, { clientX: 256, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.80")
  expect(root).toHaveAttribute("data-stage", "REM")
  expect(root).toHaveAttribute("data-share", "24")
  expect(root).toHaveAttribute("data-time", "04:24")
  expect(onValueChange).toHaveBeenCalledWith(0.8)
  fireEvent.pointerUp(chart, { clientX: 256, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "labeled")
  fireEvent.keyDown(chart, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-t", "0.78")
  fireEvent.click(view.getByRole("button", { name: "REM" }))
  expect(root).toHaveAttribute("data-filter", "REM")
  expect(root.querySelector("[data-lane='Awake']")).toHaveAttribute("data-dim", "on")
  expect(root.querySelector("[data-lane='REM']")).toHaveAttribute("data-dim", "off")
  fireEvent.click(view.getByRole("button", { name: "REM" }))
  expect(root).toHaveAttribute("data-filter", "none")
})

test("三道把 REM 并进 Light", () => {
  const view = render(<StageLaneFlow lanes="3" />)
  const root = rootOf(view.container)
  const chart = view.getByRole("slider", { name: "Sleep stages" })
  expect(root).toHaveAttribute("data-lanes", "3")
  expect(view.queryByRole("button", { name: "REM" })).toBeNull()
  fireEvent.pointerDown(chart, { clientX: 256, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-stage", "Light")
  expect(stageAt(0.8, "3")).toBe("Light")
})

test("微流在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<StageLaneFlow flow />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-flow", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(2))
  expect(Number(root.getAttribute("data-shift"))).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-flow", "off")
  expect(queued.size).toBe(0)
})

test("减弱动效不微流，时刻瞬时跳", () => {
  installMedia({ reduced: true })
  const view = render(<StageLaneFlow flow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-flow", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(queued.size).toBe(0)
  fireEvent.change(view.getByRole("slider", { name: "Stage time" }), { target: { value: "80" } })
  expect(root).toHaveAttribute("data-t", "0.80")
  expect(root).toHaveAttribute("data-stage", "REM")
  expect(root).toHaveAttribute("data-state", "labeled")
  expect(queued.size).toBe(0)
})
