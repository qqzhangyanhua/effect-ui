// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HorizonSunScrub } from "./horizon-sun-scrub"

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
  const entry = getComponent("horizon-sun-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='horizon-sun-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing horizon")
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

test("地平线控件起始值等于默认，天空和时刻从清晨开始", async () => {
  expect(getComponent("horizon-sun-scrub")?.batch).toBe(74)
  expect(getComponent("horizon-sun-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("span")).toBe(0.8)
  expect(start("snap")).toBe(true)
  const view = render(<HorizonSunScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "horizon-wash")
  expect(root).toHaveAttribute("data-t", "0.20")
  expect(root).toHaveAttribute("data-time", "08:12")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-cube]")).toBeNull()
  expect(root.querySelector("[data-sun]")).toBeTruthy()
  expect(view.getByRole("status")).toHaveTextContent("08:12")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖动改变 t、天空和时刻，松手吸到 Noon", async () => {
  const onValueChange = vi.fn()
  const view = render(<HorizonSunScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const scrub = view.getByRole("slider", { name: "地平线时刻" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const sky = root.getAttribute("data-sky")
  fireEvent.pointerDown(scrub, { clientX: 150, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root.getAttribute("data-t")).not.toBe("0.20")
  expect(root.getAttribute("data-sky")).not.toBe(sky)
  expect(root.getAttribute("data-time")).not.toBe("08:12")
  expect(onValueChange).toHaveBeenCalled()
  fireEvent.pointerUp(scrub, { clientX: 150, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-t", "0.44")
  expect(root).toHaveAttribute("data-anchor", "noon")
  expect(root).toHaveAttribute("data-time", "12:02")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("方向键微调，关闭吸附时松手不排队", async () => {
  const view = render(<HorizonSunScrub snap={false} span={0.5} />)
  const root = rootOf(view.container)
  const scrub = view.getByRole("slider", { name: "地平线时刻" })
  expect(root).toHaveAttribute("data-span", "0.5")
  expect(root).toHaveAttribute("data-snap", "off")
  fireEvent.keyDown(scrub, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-t", "0.22")
  expect(root).toHaveAttribute("data-time", "08:31")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(scrub, { clientX: 150, button: 0, pointerId: 1 })
  fireEvent.pointerUp(scrub, { clientX: 150, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-anchor", "free")
  expect(queued.size).toBe(0)
})

test("锚点按钮和减弱动效都是瞬时改时刻", () => {
  installMedia({ reduced: true })
  const view = render(<HorizonSunScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Noon" }))
  expect(root).toHaveAttribute("data-t", "0.44")
  expect(root).toHaveAttribute("data-anchor", "noon")
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.change(view.getByRole("slider", { name: "时刻" }), { target: { value: "80" } })
  expect(root).toHaveAttribute("data-t", "0.80")
  expect(queued.size).toBe(0)
})

test("离开视口时停吸附帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<HorizonSunScrub />)
  const root = rootOf(view.container)
  const scrub = view.getByRole("slider", { name: "地平线时刻" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(scrub, { clientX: 150, button: 0, pointerId: 1 })
  fireEvent.pointerUp(scrub, { clientX: 150, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
