// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BearingCompassTurn, bearingFromPointer, bearingHeading, bearingHeld } from "./bearing-compass-turn"

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

const empty = { left: 0, top: 0, width: 0, height: 0 }

function start(prop: string) {
  const entry = getComponent("bearing-compass-turn")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='bearing-compass-turn']")
  if (!(node instanceof HTMLElement)) throw new Error("missing bearing")
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

test("罗盘控件起始值等于默认，248 度读作 WSW", async () => {
  expect(getComponent("bearing-compass-turn")?.batch).toBe(77)
  expect(getComponent("bearing-compass-turn")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("snap")).toBe(false)
  expect(start("noise")).toBe(false)
  expect(bearingHeading(248)).toBe("WSW")
  expect(bearingHeading(0)).toBe("N")
  expect(bearingHeading(90)).toBe("E")
  const view = render(<BearingCompassTurn />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "bearing-rose")
  expect(root).toHaveAttribute("data-bearing", "248")
  expect(root).toHaveAttribute("data-heading", "WSW")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-part='rose']")).toBeTruthy()
  expect(root.querySelector("[data-part='needle']")).toBeTruthy()
  expect(view.getByRole("status")).toHaveTextContent("248°")
  expect(root).toHaveTextContent("WSW")
  expect(root).toHaveTextContent("N")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖转盘、方向键和 45 度吸附", () => {
  const onBearingChange = vi.fn()
  const view = render(<BearingCompassTurn onBearingChange={onBearingChange} />)
  const root = rootOf(view.container)
  const dial = view.getByRole("slider", { name: "Bearing" })
  expect(bearingFromPointer(70, 50, empty)).toBe(324)
  fireEvent.pointerDown(dial, { clientX: 70, clientY: 50, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "turning")
  expect(root).toHaveAttribute("data-bearing", "324")
  expect(root).toHaveAttribute("data-heading", "NW")
  expect(onBearingChange).toHaveBeenCalledWith(324)
  fireEvent.pointerUp(dial, { clientX: 70, clientY: 50, pointerId: 1 })
  expect(root).toHaveAttribute("data-bearing", "324")
  expect(root).toHaveAttribute("data-state", "settle")
  fireEvent.keyDown(dial, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-bearing", "326")
  cleanup()
  const snapped = render(<BearingCompassTurn snap />)
  const next = rootOf(snapped.container)
  const nextDial = snapped.getByRole("slider", { name: "Bearing" })
  expect(bearingHeld(324, true)).toBe(315)
  fireEvent.pointerDown(nextDial, { clientX: 70, clientY: 50, button: 0, pointerId: 2 })
  expect(next).toHaveAttribute("data-bearing", "324")
  fireEvent.pointerUp(nextDial, { clientX: 70, clientY: 50, pointerId: 2 })
  expect(next).toHaveAttribute("data-bearing", "315")
  expect(next).toHaveAttribute("data-heading", "NW")
  fireEvent.keyDown(nextDial, { key: "ArrowRight", shiftKey: true })
  expect(next).toHaveAttribute("data-bearing", "330")
  expect(next).toHaveAttribute("data-heading", "NNW")
  fireEvent.keyDown(snapped.getByRole("slider", { name: "Bearing" }), { key: "Home" })
  expect(next).toHaveAttribute("data-bearing", "0")
  expect(next).toHaveAttribute("data-heading", "N")
  expect(queued.size).toBe(0)
})

test("微抖在视口内排队，离开后停止且方位不变", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<BearingCompassTurn noise />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-noise", "on")
  expect(root).toHaveAttribute("data-bearing", "248")
  expect(root).toHaveAttribute("data-wobble", "0.0")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  act(() => drain(3))
  expect(root.getAttribute("data-wobble")).not.toBe("0.0")
  expect(root).toHaveAttribute("data-bearing", "248")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const wobble = root.getAttribute("data-wobble")
  act(() => drain(3))
  expect(root.getAttribute("data-wobble")).toBe(wobble)
  expect(root).toHaveAttribute("data-bearing", "248")
})

test("减弱动效瞬时改方位，没有微抖", () => {
  installMedia({ reduced: true })
  const view = render(<BearingCompassTurn noise snap />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-wobble", "0.0")
  expect(queued.size).toBe(0)
  const dial = view.getByRole("slider", { name: "Bearing" })
  fireEvent.pointerDown(dial, { clientX: 70, clientY: 50, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-bearing", "324")
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.pointerUp(dial, { clientX: 70, clientY: 50, pointerId: 1 })
  expect(root).toHaveAttribute("data-bearing", "315")
  expect(queued.size).toBe(0)
})
