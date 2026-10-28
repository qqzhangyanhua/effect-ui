// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import {
  ParticleVeilCaption,
  createVeilParticles,
  stepVeilParticles,
  veilCoreRadius,
  veilDensity,
  veilNear,
} from "./particle-veil-caption"

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
  for (let index = 0; index < frames; index += 1) {
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
  const found = getComponent("particle-veil-caption")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='particle-veil-caption']")
  if (!(node instanceof HTMLElement)) throw new Error("missing veil")
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

test("粒子帷幕默认盖住标题，控件起始值等于默认", async () => {
  expect(getComponent("particle-veil-caption")?.batch).toBe(79)
  expect(getComponent("particle-veil-caption")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("sphere")).toBe(true)
  expect(start("caption")).toBe(true)
  const created = createVeilParticles(veilDensity(0.7), true)
  const before = veilNear(created, 160, 90, veilCoreRadius(0.7))
  let moved = created
  for (let index = 0; index < 6; index += 1) {
    moved = stepVeilParticles(moved, { x: 160, y: 90, active: true }, 1 / 12, 1, 0.7).particles
  }
  expect(before).toBeGreaterThan(10)
  expect(veilNear(moved, 160, 90, veilCoreRadius(0.7))).toBeLessThan(before)
  const view = render(<ParticleVeilCaption />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "particle-veil")
  expect(root).toHaveAttribute("data-sphere", "on")
  expect(root).toHaveAttribute("data-caption", "on")
  expect(root).toHaveAttribute("data-parting", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Welcome ahead")).toBeInTheDocument()
  expect(view.queryByText(/squarespace/i)).toBeNull()
  expect(root.querySelector("canvas")).toBeInTheDocument()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("指针把中心粒子推开，方向键移动焦点", async () => {
  const onValueChange = vi.fn()
  const view = render(<ParticleVeilCaption onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const stage = root.querySelector("[data-part='stage']")
  if (!(stage instanceof HTMLElement)) throw new Error("missing stage")
  await waitFor(() => expect(Number(root.getAttribute("data-core"))).toBeGreaterThan(10))
  const before = Number(root.getAttribute("data-core"))
  fireEvent.pointerMove(stage, { clientX: 160, clientY: 90 })
  act(() => drain(8))
  expect(Number(root.getAttribute("data-core"))).toBeLessThan(before)
  expect(root).toHaveAttribute("data-parting", "on")
  expect(onValueChange).toHaveBeenCalledWith({ parting: true })
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus-x", "178")
  expect(root).toHaveAttribute("data-focus-y", "90")
})

test("漫场可以关掉标题", () => {
  const view = render(<ParticleVeilCaption sphere={false} caption={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-sphere", "off")
  expect(root).toHaveAttribute("data-caption", "off")
  expect(view.queryByText("Welcome ahead")).toBeNull()
})

test("粒子漂移离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ParticleVeilCaption />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(3))
  expect(Number(root.getAttribute("data-tick"))).toBeGreaterThan(0)
  const tick = root.getAttribute("data-tick")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  act(() => drain(3))
  expect(root.getAttribute("data-tick")).toBe(tick)
})

test("减弱动效停在静帧，标题仍在，指针不再推开粒子", async () => {
  installMedia({ reduced: true })
  const view = render(<ParticleVeilCaption />)
  const root = rootOf(view.container)
  const stage = root.querySelector("[data-part='stage']")
  if (!(stage instanceof HTMLElement)) throw new Error("missing stage")
  await waitFor(() => expect(Number(root.getAttribute("data-core"))).toBeGreaterThan(10))
  const before = root.getAttribute("data-core")
  fireEvent.pointerMove(stage, { clientX: 160, clientY: 90 })
  act(() => drain(6))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-parting", "off")
  expect(root).toHaveAttribute("data-tick", "0")
  expect(root.getAttribute("data-core")).toBe(before)
  expect(view.getByText("Welcome ahead")).toBeInTheDocument()
  expect(queued.size).toBe(0)
})
