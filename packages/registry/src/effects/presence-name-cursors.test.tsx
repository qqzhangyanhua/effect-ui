// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PresenceNameCursors } from "./presence-name-cursors"

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
  const entry = getComponent("presence-name-cursors")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='presence-name-cursors']")
  if (!(node instanceof HTMLElement)) throw new Error("missing cursors")
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

test("默认四枚具名光标在漂移，控件起始值等于默认", async () => {
  expect(getComponent("presence-name-cursors")?.batch).toBe(74)
  expect(getComponent("presence-name-cursors")?.effectCategory).toBe("cursor")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("count")).toBe(4)
  expect(start("trail")).toBe(true)
  const view = render(<PresenceNameCursors />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "named-cursors")
  expect(root).toHaveAttribute("data-count", "4")
  expect(root).toHaveAttribute("data-state", "drifting")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(view.getByRole("option", { name: "Ada" })).toHaveAttribute("data-x", "18.0")
  expect(view.getByRole("option", { name: "Noor" })).toBeInTheDocument()
  expect(view.queryByRole("option", { name: "Jules" })).toBeNull()
  expect(view.getByRole("status")).toHaveTextContent("Drifting")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBeGreaterThan(0)
})

test("漂移改位置，点选和方向键聚焦，Enter 钉住", async () => {
  const onFocusChange = vi.fn()
  const view = render(<PresenceNameCursors onFocusChange={onFocusChange} />)
  const root = rootOf(view.container)
  const ada = view.getByRole("option", { name: "Ada" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const x = ada.getAttribute("data-x")
  act(() => drain(6))
  expect(ada.getAttribute("data-x")).not.toBe(x)
  fireEvent.click(ada)
  expect(root).toHaveAttribute("data-focus", "0")
  expect(root).toHaveAttribute("data-state", "focused")
  expect(ada).toHaveAttribute("data-active", "yes")
  expect(ada).toHaveAttribute("data-opacity", "1")
  expect(Number(view.getByRole("option", { name: "Kai" }).getAttribute("data-opacity"))).toBeLessThan(1)
  expect(ada.querySelector("[data-part='trail']")).toBeTruthy()
  expect(view.getByRole("status")).toHaveTextContent("Ada selected")
  expect(onFocusChange).toHaveBeenCalledWith(0)
  fireEvent.keyDown(ada, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "1")
  expect(view.getByRole("status")).toHaveTextContent("Kai selected")
  fireEvent.keyDown(view.getByRole("option", { name: "Kai" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-pinned", "yes")
  expect(root).toHaveAttribute("data-state", "pinned")
  expect(queued.size).toBe(0)
})

test("count 收起多余光标，关闭拖尾", () => {
  const view = render(<PresenceNameCursors count={3} trail={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-count", "3")
  expect(root).toHaveAttribute("data-trail", "off")
  expect(view.queryByRole("option", { name: "Noor" })).toBeNull()
  fireEvent.click(view.getByRole("option", { name: "Ada" }))
  expect(view.getByRole("option", { name: "Ada" }).querySelector("[data-part='trail']")).toBeNull()
})

test("减弱动效光标静止，焦点瞬时切换", () => {
  installMedia({ reduced: true })
  const view = render(<PresenceNameCursors />)
  const root = rootOf(view.container)
  const ada = view.getByRole("option", { name: "Ada" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(ada).toHaveAttribute("data-x", "18.0")
  act(() => drain(6))
  expect(ada).toHaveAttribute("data-x", "18.0")
  expect(queued.size).toBe(0)
  fireEvent.click(ada)
  expect(root).toHaveAttribute("data-state", "focused")
  expect(view.getByRole("status")).toHaveTextContent("Ada selected")
  expect(ada).toHaveAttribute("data-scale", "1")
})

test("离开视口时停漂移", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PresenceNameCursors />)
  const root = rootOf(view.container)
  const ada = view.getByRole("option", { name: "Ada" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(2))
  const x = ada.getAttribute("data-x")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  act(() => drain(4))
  expect(ada).toHaveAttribute("data-x", x)
})
