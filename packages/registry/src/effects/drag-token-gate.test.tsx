// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DragTokenGate } from "./drag-token-gate"

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
  const entry = getComponent("drag-token-gate")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='drag-token-gate']")
  if (!(node instanceof HTMLElement)) throw new Error("missing token gate")
  return node
}

function withinHit(root: HTMLElement) {
  const radius = Number(root.getAttribute("data-radius"))
  const target = Number(root.getAttribute("data-target-x"))
  const x = Number(root.getAttribute("data-x"))
  const y = Number(root.getAttribute("data-y"))
  const homeY = 58
  return Math.hypot(x - target, y - homeY) <= radius
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

test("令牌闸控件起始值等于默认", async () => {
  expect(getComponent("drag-token-gate")?.batch).toBe(72)
  expect(getComponent("drag-token-gate")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("hint")).toBe(true)
  expect(start("threshold")).toBe(0.45)
  const view = render(<DragTokenGate />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "token-gate")
  expect(root).toHaveAttribute("data-seeds", "off")
  expect(root).toHaveAttribute("data-escape", "off")
  expect(root).toHaveAttribute("data-tokens", "1")
  expect(root).toHaveAttribute("data-locked", "no")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-hint", "on")
  expect(root.querySelector("[data-hint-line]")).not.toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("unlocked")
  expect(view.getByRole("button", { name: "Enter" })).toBeDisabled()
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("未命中弹回，命中后锁定并启用 Enter", async () => {
  const view = render(<DragTokenGate />)
  const root = rootOf(view.container)
  const token = view.getByRole("button", { name: "令牌" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(token, { key: "ArrowRight" })
  expect(withinHit(root)).toBe(false)
  fireEvent.keyDown(token, { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "miss")
  expect(root).toHaveAttribute("data-locked", "no")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-x", root.getAttribute("data-home-x"))
  for (let step = 0; step < 12 && !withinHit(root); step += 1) {
    fireEvent.keyDown(token, { key: "ArrowRight" })
  }
  expect(withinHit(root)).toBe(true)
  fireEvent.keyDown(token, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "yes")
  expect(root).toHaveAttribute("data-state", "success")
  expect(view.getByRole("status")).toHaveTextContent("locked")
  expect(view.getByRole("button", { name: "Enter" })).toBeEnabled()
  expect(token.className).toContain("pointer-events-none")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-x", root.getAttribute("data-target-x"))
  fireEvent.click(view.getByRole("button", { name: "Replay" }))
  expect(root).toHaveAttribute("data-locked", "no")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-x", root.getAttribute("data-home-x"))
  expect(view.getByRole("button", { name: "Enter" })).toBeDisabled()
})

test("拖进目标区命中，拖在外面弹回", async () => {
  const view = render(<DragTokenGate />)
  const root = rootOf(view.container)
  const token = view.getByRole("button", { name: "令牌" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const home = Number(root.getAttribute("data-home-x"))
  const target = Number(root.getAttribute("data-target-x"))
  fireEvent.pointerDown(token, { pointerId: 1, button: 0, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(token, { pointerId: 1, clientX: 16, clientY: 0 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(root).toHaveAttribute("data-hit", "no")
  fireEvent.pointerUp(token, { pointerId: 1, clientX: 16, clientY: 0 })
  expect(root).toHaveAttribute("data-state", "miss")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-x", String(home))
  fireEvent.pointerDown(token, { pointerId: 2, button: 0, clientX: 0, clientY: 0 })
  fireEvent.pointerMove(token, { pointerId: 2, clientX: target - home, clientY: 0 })
  expect(root).toHaveAttribute("data-hit", "yes")
  fireEvent.pointerUp(token, { pointerId: 2, clientX: target - home, clientY: 0 })
  expect(root).toHaveAttribute("data-locked", "yes")
  expect(view.getByRole("status")).toHaveTextContent("locked")
})

test("减弱动效用 Place token 瞬时入槽", () => {
  installMedia({ reduced: true })
  const view = render(<DragTokenGate hint={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-hint", "off")
  expect(root.querySelector("[data-hint-line]")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Place token" }))
  expect(root).toHaveAttribute("data-locked", "yes")
  expect(root).toHaveAttribute("data-state", "success")
  expect(root).toHaveAttribute("data-x", root.getAttribute("data-target-x"))
  expect(view.getByRole("status")).toHaveTextContent("locked")
  expect(view.getByRole("button", { name: "Enter" })).toBeEnabled()
  expect(queued.size).toBe(0)
})

test("离开视口时停回弹帧", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<DragTokenGate />)
  const root = rootOf(view.container)
  const token = view.getByRole("button", { name: "令牌" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(token, { key: "ArrowRight" })
  fireEvent.keyDown(token, { key: "Enter" })
  expect(root).toHaveAttribute("data-state", "miss")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
})
