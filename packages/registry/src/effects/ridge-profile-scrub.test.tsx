// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { RidgeProfileScrub, ridgeElevation } from "./ridge-profile-scrub"

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
  const entry = getComponent("ridge-profile-scrub")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='ridge-profile-scrub']")
  if (!(node instanceof HTMLElement)) throw new Error("missing ridge")
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

test("脊线从合成海拔开始，控件起始值等于默认", async () => {
  expect(getComponent("ridge-profile-scrub")?.batch).toBe(75)
  expect(getComponent("ridge-profile-scrub")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("marks")).toBe(true)
  expect(start("tint")).toBe(true)
  expect(ridgeElevation(0)).toBe(86)
  expect(ridgeElevation(1)).toBe(132)
  expect(ridgeElevation(0.32)).not.toBe(ridgeElevation(0.75))
  const view = render(<RidgeProfileScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "ridge-profile")
  expect(root).toHaveAttribute("data-d", "0.32")
  expect(root).toHaveAttribute("data-elevation", String(ridgeElevation(0.32)))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-marks", "on")
  expect(root).toHaveAttribute("data-tint", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(view.getByRole("status")).toHaveTextContent(`${ridgeElevation(0.32)} m`)
  expect(view.getByText("86 m")).toBeTruthy()
  expect(view.getByText("132 m")).toBeTruthy()
  expect(root.querySelectorAll("[data-segment]").length).toBeGreaterThan(1)
  expect(root.querySelector("[data-marker]")).toBeTruthy()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖剖面和方向键同步海拔读数", () => {
  const onValueChange = vi.fn()
  const view = render(<RidgeProfileScrub onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const profile = view.getByRole("slider", { name: "海拔剖面" })
  fireEvent.pointerDown(profile, { clientX: 240, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "scrubbing")
  expect(root).toHaveAttribute("data-d", "0.75")
  expect(root).toHaveAttribute("data-elevation", String(ridgeElevation(0.75)))
  expect(view.getByRole("status")).toHaveTextContent(`${ridgeElevation(0.75)} m`)
  expect(onValueChange).toHaveBeenCalledWith(0.75)
  fireEvent.pointerUp(profile, { clientX: 240, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.keyDown(profile, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-d", "0.73")
  expect(root).toHaveAttribute("data-elevation", String(ridgeElevation(0.73)))
  fireEvent.change(view.getByRole("slider", { name: "距离" }), { target: { value: "10" } })
  expect(root).toHaveAttribute("data-d", "0.10")
  expect(root).toHaveAttribute("data-elevation", String(ridgeElevation(0.1)))
})

test("可以关掉起终点和斜率着色", () => {
  const view = render(<RidgeProfileScrub marks={false} tint={false} intensity={1} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-marks", "off")
  expect(root).toHaveAttribute("data-tint", "off")
  expect(root).toHaveAttribute("data-intensity", "1")
  expect(view.queryByText("86 m")).toBeNull()
  expect(root.querySelectorAll("[data-segment]")).toHaveLength(1)
})

test("减弱动效瞬时改读数，没有循环帧", async () => {
  installMedia({ reduced: true })
  const view = render(<RidgeProfileScrub />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  const profile = view.getByRole("slider", { name: "海拔剖面" })
  fireEvent.pointerDown(profile, { clientX: 64, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-d", "0.20")
  expect(root).toHaveAttribute("data-elevation", String(ridgeElevation(0.2)))
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})
