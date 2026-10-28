// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BreathExpandRing } from "./breath-expand-ring"

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
  const entry = getComponent("breath-expand-ring")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='breath-expand-ring']")
  if (!(node instanceof HTMLElement)) throw new Error("missing breath")
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

test("呼吸环默认暂停在 Inhale，控件起始值等于默认", async () => {
  expect(getComponent("breath-expand-ring")?.batch).toBe(74)
  expect(getComponent("breath-expand-ring")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("phases")).toBe("4-2-6-2")
  expect(start("loops")).toBe(true)
  const view = render(<BreathExpandRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "breath-ring")
  expect(root).toHaveAttribute("data-phase", "inhale")
  expect(root).toHaveAttribute("data-scale", "0.72")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-running", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(view.getByRole("status")).toHaveTextContent("Inhale")
  expect(root.querySelector("[data-part='ratio']")).toHaveTextContent("4 / 6")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("Start 后相位扩缩，空格暂停，方向键改节奏", async () => {
  const onPhaseChange = vi.fn()
  const view = render(<BreathExpandRing onPhaseChange={onPhaseChange} />)
  const root = rootOf(view.container)
  const stage = view.getByRole("region", { name: "呼吸环" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Start" }))
  expect(root).toHaveAttribute("data-running", "on")
  expect(root).toHaveAttribute("data-state", "inhaling")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(8))
  expect(Number(root.getAttribute("data-scale"))).toBeGreaterThan(0.72)
  expect(root).toHaveAttribute("data-phase", "inhale")
  fireEvent.keyDown(stage, { key: " " })
  expect(root).toHaveAttribute("data-running", "off")
  expect(root).toHaveAttribute("data-state", "paused")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(stage, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-tempo", "1.25")
  expect(onPhaseChange).not.toHaveBeenCalled()
})

test("相位预设改吸呼秒数", () => {
  const view = render(<BreathExpandRing phases="4-4-4-4" loops={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-phases", "4-4-4-4")
  expect(root).toHaveAttribute("data-loops", "off")
  expect(root.querySelector("[data-part='ratio']")).toHaveTextContent("4 / 4")
})

test("减弱动效不扩缩，只切换相位文案", () => {
  installMedia({ reduced: true })
  const view = render(<BreathExpandRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-scale", "1.00")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Start" }))
  expect(root).toHaveAttribute("data-phase", "hold")
  expect(root).toHaveAttribute("data-scale", "1.00")
  expect(view.getByRole("status")).toHaveTextContent("Hold")
  expect(root).toHaveAttribute("data-running", "off")
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Next" }))
  expect(root).toHaveAttribute("data-phase", "exhale")
  expect(view.getByRole("status")).toHaveTextContent("Exhale")
})

test("离开视口时停相位循环", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<BreathExpandRing />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Start" }))
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const scale = root.getAttribute("data-scale")
  act(() => drain(6))
  expect(root).toHaveAttribute("data-scale", scale)
})
