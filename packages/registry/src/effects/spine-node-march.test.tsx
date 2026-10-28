// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SpineNodeMarch, spineSolid } from "./spine-node-march"

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
  const found = getComponent("spine-node-march")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='spine-node-march']")
  if (!(node instanceof HTMLElement)) throw new Error("missing spine")
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

test("竖脊默认停在第一步，控件起始值等于默认", async () => {
  expect(getComponent("spine-node-march")?.batch).toBe(79)
  expect(getComponent("spine-node-march")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("flow")).toBe(true)
  expect(start("showChecks")).toBe(true)
  expect(spineSolid(0)).toBe(0)
  expect(spineSolid(1)).toBe(0.25)
  expect(spineSolid(4)).toBe(1)
  const view = render(<SpineNodeMarch />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "spine-march")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-solid", "0.00")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-checks", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Steps")).toBeInTheDocument()
  expect(view.queryByText(/alan|klarna|bank/i)).toBeNull()
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("步进拉长实线并展开 pill，方向键和节点都能到", () => {
  const onValueChange = vi.fn()
  const view = render(<SpineNodeMarch onValueChange={onValueChange} flow={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Next" }))
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-phase", "marching")
  expect(root).toHaveAttribute("data-solid", "0.25")
  expect(onValueChange).toHaveBeenCalledWith({ activeIndex: 1 })
  expect(view.getByRole("button", { name: /Sketch the frame/ })).toHaveAttribute("aria-current", "step")
  expect(root.querySelector("[data-node='gather']")).toHaveAttribute("data-check", "on")
  fireEvent.click(view.getByRole("button", { name: /Ship the draft/ }))
  expect(root).toHaveAttribute("data-index", "4")
  expect(root).toHaveAttribute("data-solid", "1.00")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.keyDown(root, { key: "j" })
  expect(root).toHaveAttribute("data-index", "1")
  fireEvent.keyDown(root, { key: "k" })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-index", "4")
  fireEvent.keyDown(root, { key: "ArrowUp" })
  expect(root).toHaveAttribute("data-index", "3")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-index", "4")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})

test("关闭打勾时完成节点不显示勾", () => {
  const view = render(<SpineNodeMarch showChecks={false} flow={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Next" }))
  expect(root).toHaveAttribute("data-checks", "off")
  expect(root.querySelector("[data-node='gather']")).toHaveAttribute("data-check", "off")
  expect(root.querySelector("[data-node='gather']")).not.toHaveTextContent("✓")
})

test("虚线流动在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SpineNodeMarch />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-flow-t"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-flow-t"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-flow-t")
  act(() => drain(3))
  expect(root.getAttribute("data-flow-t")).toBe(stopped)
})

test("减弱动效瞬时落在节点上，虚线不再流动", () => {
  installMedia({ reduced: true })
  const view = render(<SpineNodeMarch />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Next" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-phase", "settled")
  expect(root).toHaveAttribute("data-solid", "0.25")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})
