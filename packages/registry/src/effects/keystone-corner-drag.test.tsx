// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { KeystoneCornerDrag, keystoneFromPointer } from "./keystone-corner-drag"

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
  const entry = getComponent("keystone-corner-drag")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='keystone-corner-drag']")
  if (!(node instanceof HTMLElement)) throw new Error("missing keystone")
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

test("透视框控件起始值等于默认，四角可聚焦", async () => {
  expect(getComponent("keystone-corner-drag")?.batch).toBe(77)
  expect(getComponent("keystone-corner-drag")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("loupe")).toBe(true)
  expect(start("midpoints")).toBe(false)
  const view = render(<KeystoneCornerDrag />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "keystone-quad")
  expect(root).toHaveAttribute("data-nw", "24,22")
  expect(root).toHaveAttribute("data-ne", "78,14")
  expect(root).toHaveAttribute("data-se", "86,80")
  expect(root).toHaveAttribute("data-sw", "16,76")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelectorAll("[data-handle]")).toHaveLength(4)
  expect(root.querySelector("[data-loupe='open']")).toBeNull()
  expect(root.querySelector("img")).toBeNull()
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root.className).toContain("bg-card")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("拖角出现放大镜，方向键微调，中点可平移边", () => {
  const onQuadChange = vi.fn()
  const view = render(<KeystoneCornerDrag onQuadChange={onQuadChange} />)
  const root = rootOf(view.container)
  const nw = view.getByRole("button", { name: "Northwest corner" })
  expect(keystoneFromPointer(140, 40, empty)).toEqual({ x: 50, y: 20 })
  fireEvent.pointerDown(nw, { clientX: 140, clientY: 40, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-corner", "nw")
  expect(root).toHaveAttribute("data-nw", "50,20")
  expect(root.querySelector("[data-loupe='open']")).toBeTruthy()
  expect(onQuadChange).toHaveBeenCalled()
  fireEvent.pointerUp(nw, { clientX: 140, clientY: 40, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "settle")
  expect(root).toHaveAttribute("data-nw", "50,20")
  expect(root.querySelector("[data-loupe='open']")).toBeNull()
  fireEvent.keyDown(nw, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-nw", "52,20")
  fireEvent.keyDown(view.getByRole("button", { name: "Northeast corner" }), { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-ne", "78,16")
  cleanup()
  const marked = render(<KeystoneCornerDrag midpoints loupe={false} />)
  const markedRoot = rootOf(marked.container)
  expect(markedRoot.querySelectorAll("[data-handle]")).toHaveLength(8)
  const north = marked.getByRole("button", { name: "North edge" })
  fireEvent.pointerDown(north, { clientX: 140, clientY: 40, button: 0, pointerId: 3 })
  expect(markedRoot).toHaveAttribute("data-nw", "24,20")
  expect(markedRoot).toHaveAttribute("data-ne", "78,20")
  expect(markedRoot.querySelector("[data-loupe='open']")).toBeNull()
  expect(queued.size).toBe(0)
})

test("Reset 沿弹簧回到矩形", async () => {
  const view = render(<KeystoneCornerDrag />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-nw", "18,16")
  expect(root).toHaveAttribute("data-ne", "82,16")
  expect(root).toHaveAttribute("data-se", "82,84")
  expect(root).toHaveAttribute("data-sw", "18,84")
  expect(root).toHaveAttribute("data-state", "idle")
})

test("减弱动效瞬时回正，离开视口停掉弹簧", async () => {
  installMedia({ reduced: true })
  const reducedView = render(<KeystoneCornerDrag />)
  const reducedRoot = rootOf(reducedView.container)
  expect(reducedRoot).toHaveAttribute("data-motion", "off")
  expect(reducedRoot).toHaveAttribute("data-ease", "0")
  const nw = reducedView.getByRole("button", { name: "Northwest corner" })
  fireEvent.pointerDown(nw, { clientX: 140, clientY: 40, button: 0, pointerId: 1 })
  expect(reducedRoot).toHaveAttribute("data-nw", "50,20")
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(reducedRoot.querySelector("[data-loupe='open']")).toBeTruthy()
  expect(queued.size).toBe(0)
  fireEvent.click(reducedView.getByRole("button", { name: "Reset" }))
  expect(reducedRoot).toHaveAttribute("data-nw", "18,16")
  expect(reducedRoot).toHaveAttribute("data-state", "idle")
  expect(queued.size).toBe(0)
  cleanup()
  installMedia()
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<KeystoneCornerDrag />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-state", "settle")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "idle"))
})
