// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ChargeTargetRing, chargeFromPointer, chargeReadout } from "./charge-target-ring"

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
  const entry = getComponent("charge-target-ring")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='charge-target-ring']")
  if (!(node instanceof HTMLElement)) throw new Error("missing charge")
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

test("充电环控件起始值等于默认，当前 70% 目标 80%", async () => {
  expect(getComponent("charge-target-ring")?.batch).toBe(77)
  expect(getComponent("charge-target-ring")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("pulse")).toBe(false)
  expect(start("showEta")).toBe(true)
  expect(chargeReadout(0.8)).toMatchObject({ pct: 70, mark: 80, minutes: 42 })
  const view = render(<ChargeTargetRing />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "charge-target")
  expect(root).toHaveAttribute("data-current", "0.70")
  expect(root).toHaveAttribute("data-target", "0.80")
  expect(root).toHaveAttribute("data-minutes", "42")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelectorAll("[data-notch]")).toHaveLength(1)
  expect(root.querySelector("[data-handle='end']")).toBeNull()
  expect(root.querySelector("[data-part='charge-arc']")).toBeTruthy()
  expect(view.getByRole("status")).toHaveTextContent("~70%")
  expect(root.querySelector("[data-part='eta']")).toHaveTextContent("Target 80% · ~42m")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖目标刻度会被钳在当前电量之上，方向键可调", () => {
  const onTargetChange = vi.fn()
  const view = render(<ChargeTargetRing onTargetChange={onTargetChange} />)
  const root = rootOf(view.container)
  const ring = view.getByRole("slider", { name: "Charge target" })
  expect(chargeFromPointer(80, 30, empty)).toBe(0.94)
  fireEvent.pointerDown(ring, { clientX: 80, clientY: 30, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-target", "0.94")
  expect(root).toHaveAttribute("data-minutes", "101")
  expect(root.querySelector("[data-part='eta']")).toHaveTextContent("Target 94% · ~101m")
  expect(onTargetChange).toHaveBeenCalledWith(0.94)
  expect(chargeFromPointer(160, 40, empty)).toBe(0.7)
  fireEvent.pointerDown(ring, { clientX: 160, clientY: 40, button: 0, pointerId: 2 })
  expect(root).toHaveAttribute("data-target", "0.70")
  expect(root).toHaveAttribute("data-minutes", "0")
  fireEvent.pointerUp(ring, { clientX: 160, clientY: 40, pointerId: 2 })
  expect(root).toHaveAttribute("data-state", "settle")
  fireEvent.keyDown(ring, { key: "End" })
  expect(root).toHaveAttribute("data-target", "1.00")
  expect(root).toHaveAttribute("data-minutes", "126")
  fireEvent.keyDown(ring, { key: "Home" })
  expect(root).toHaveAttribute("data-target", "0.70")
  fireEvent.keyDown(ring, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-target", "0.71")
  fireEvent.keyDown(ring, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-target", "0.70")
  expect(queued.size).toBe(0)
})

test("可以隐藏剩余时间", () => {
  const view = render(<ChargeTargetRing showEta={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-eta", "off")
  expect(root.querySelector("[data-part='eta']")).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("~70%")
})

test("充电脉冲在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<ChargeTargetRing pulse />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-pulse", "on")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-beat"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-beat"))).toBeGreaterThan(before)
  const target = root.getAttribute("data-target")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  const beat = root.getAttribute("data-beat")
  act(() => drain(3))
  expect(root.getAttribute("data-beat")).toBe(beat)
  expect(root.getAttribute("data-target")).toBe(target)
})

test("减弱动效瞬时改目标，不脉冲", () => {
  installMedia({ reduced: true })
  const view = render(<ChargeTargetRing pulse />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  fireEvent.pointerDown(view.getByRole("slider", { name: "Charge target" }), { clientX: 80, clientY: 30, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-target", "0.94")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
})
