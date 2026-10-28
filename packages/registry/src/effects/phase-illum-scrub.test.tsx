// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PhaseIllumScrub, phaseSample } from "./phase-illum-scrub"

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
  const entry = getComponent("phase-illum-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='phase-illum-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing phase")
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

test("月相控件起始值等于默认，照度从盈月开始", async () => {
  expect(getComponent("phase-illum-scrub")?.batch).toBe(76)
  expect(getComponent("phase-illum-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("span")).toBe("7")
  expect(start("auto")).toBe(false)
  expect(phaseSample(0)).toMatchObject({ illum: 0, phase: "New" })
  expect(phaseSample(0.5)).toMatchObject({ illum: 100, phase: "Full" })
  const view = render(<PhaseIllumScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "moon-illum")
  expect(root).toHaveAttribute("data-t", "0.18")
  expect(root).toHaveAttribute("data-illum", "54")
  expect(root).toHaveAttribute("data-phase", "Waxing")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-moon]")).toBeTruthy()
  expect(root.querySelector("[data-crater]")).toBeTruthy()
  expect(root.querySelector("[data-sun]")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("54%")
  expect(view.getByRole("status")).toHaveTextContent("Waxing")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖日轨、方向键和 Home/End 改照度与相位", async () => {
  const onValueChange = vi.fn()
  const view = render(<PhaseIllumScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const track = view.getByRole("slider", { name: "Moon phase" })
  fireEvent.keyDown(track, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.20")
  expect(root).toHaveAttribute("data-illum", "59")
  fireEvent.keyDown(track, { key: "Home" })
  expect(root).toHaveAttribute("data-t", "0.00")
  expect(root).toHaveAttribute("data-phase", "New")
  expect(root).toHaveAttribute("data-illum", "0")
  fireEvent.keyDown(track, { key: "End" })
  expect(root).toHaveAttribute("data-t", "0.50")
  expect(root).toHaveAttribute("data-phase", "Full")
  expect(root).toHaveAttribute("data-illum", "100")
  fireEvent.pointerDown(track, { clientX: 196, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-t", "0.70")
  expect(root).toHaveAttribute("data-phase", "Waning")
  expect(root).toHaveAttribute("data-illum", "81")
  expect(onValueChange).toHaveBeenCalledWith(0.7)
  fireEvent.pointerUp(track, { clientX: 196, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBe(0)
})

test("刻度天数和 TODAY 跳到满月", () => {
  const view = render(<PhaseIllumScrub span="5" />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-span", "5")
  expect(view.getAllByRole("button")).toHaveLength(5)
  expect(view.queryByRole("button", { name: "+3" })).toBeNull()
  cleanup()
  const week = render(<PhaseIllumScrub />)
  fireEvent.click(week.getByRole("button", { name: "TODAY" }))
  expect(rootOf(week.container)).toHaveAttribute("data-t", "0.50")
  expect(rootOf(week.container)).toHaveAttribute("data-phase", "Full")
})

test("自动推进在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PhaseIllumScrub auto span="14" />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-span", "14")
  expect(root).toHaveAttribute("data-auto", "on")
  expect(root).toHaveAttribute("data-state", "playing")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-t"))
  act(() => drain(6))
  expect(Number(root.getAttribute("data-t"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-t")
  act(() => drain(4))
  expect(root.getAttribute("data-t")).toBe(stopped)
})

test("减弱动效瞬时切遮罩，不排队", () => {
  installMedia({ reduced: true })
  const view = render(<PhaseIllumScrub auto />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  const track = view.getByRole("slider", { name: "Moon phase" })
  fireEvent.pointerDown(track, { clientX: 140, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-t", "0.50")
  expect(root).toHaveAttribute("data-phase", "Full")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.change(view.getByRole("slider", { name: "Illumination" }), { target: { value: "20" } })
  expect(root).toHaveAttribute("data-t", "0.20")
  expect(root).toHaveAttribute("data-illum", "59")
  expect(queued.size).toBe(0)
})
