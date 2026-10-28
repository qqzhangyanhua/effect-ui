// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ScatterPhotoDrag } from "./scatter-photo-drag"

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

class SilentObserver {
  observe() {}
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

function drain(max: number) {
  for (let i = 0; i < max; i += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(performance.now())
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
  const entry = getComponent("scatter-photo-drag")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='scatter-photo-drag']")
  if (!(node instanceof HTMLElement)) throw new Error("missing scatter")
  return node
}

function photo(container: HTMLElement, id: string) {
  const node = container.querySelector(`[data-photo='${id}']`)
  if (!(node instanceof HTMLElement)) throw new Error(id)
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

test("散落照片控件起始值等于默认", async () => {
  expect(getComponent("scatter-photo-drag")?.batch).toBe(69)
  expect(getComponent("scatter-photo-drag")?.effectCategory).toBe("cards")
  expect(start("intensity")).toBe(0.7)
  expect(start("pace")).toBe(1)
  expect(start("count")).toBe(6)
  expect(start("gap")).toBe(12)
  const view = render(<ScatterPhotoDrag />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "scatter-photo")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-count", "6")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-state", "scattered")
  expect(root).toHaveAttribute("data-inertia", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.container.querySelectorAll("[data-photo]")).toHaveLength(6)
  const card = photo(view.container, "photo-1")
  expect(card.style.transform).toContain(`${card.getAttribute("data-x")}px`)
  expect(card.style.transform).toContain("rotate(")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖动改位置并置顶，松手后惯性再停，重散恢复新布局", async () => {
  const onMove = vi.fn()
  const view = render(<ScatterPhotoDrag onMove={onMove} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const card = photo(view.container, "photo-2")
  const before = Number(card.getAttribute("data-x"))
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(card).toHaveAttribute("data-z", "7")
  expect(card).toHaveAttribute("data-lift", "on")
  expect(onMove).toHaveBeenCalledWith("photo-2")
  fireEvent.pointerMove(card, { clientX: 30, clientY: 0, pointerId: 1 })
  fireEvent.pointerMove(card, { clientX: 90, clientY: 6, pointerId: 1 })
  const dragged = Number(card.getAttribute("data-x"))
  expect(dragged).toBeCloseTo(before + 90, 1)
  expect(card.style.transform).toContain(`${dragged.toFixed(1)}px`)
  fireEvent.pointerUp(card, { pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "resting")
  expect(root).toHaveAttribute("data-inertia", "on")
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(4))
  expect(Number(card.getAttribute("data-x"))).not.toBeCloseTo(dragged, 0)
  act(() => drain(40))
  expect(root).toHaveAttribute("data-inertia", "off")
  expect(queued.size).toBe(0)
  const parked = card.getAttribute("data-x")
  fireEvent.click(view.getByRole("button", { name: "重散" }))
  expect(root).toHaveAttribute("data-seed", "2")
  expect(root).toHaveAttribute("data-state", "scattered")
  expect(photo(view.container, "photo-2").getAttribute("data-x")).not.toBe(parked)
})

test("键盘微移和旋转，双击重散", () => {
  const view = render(<ScatterPhotoDrag />)
  const root = rootOf(view.container)
  const card = photo(view.container, "photo-1")
  const x = Number(card.getAttribute("data-x"))
  const rotate = Number(card.getAttribute("data-rotate"))
  fireEvent.keyDown(card, { key: "ArrowRight" })
  expect(Number(photo(view.container, "photo-1").getAttribute("data-x"))).toBeCloseTo(x + 12, 1)
  fireEvent.keyDown(photo(view.container, "photo-1"), { key: "]" })
  expect(Number(photo(view.container, "photo-1").getAttribute("data-rotate"))).toBeCloseTo(rotate + 8, 1)
  fireEvent.keyDown(photo(view.container, "photo-1"), { key: "[" })
  expect(Number(photo(view.container, "photo-1").getAttribute("data-rotate"))).toBeCloseTo(rotate, 1)
  fireEvent.doubleClick(photo(view.container, "photo-1"))
  expect(root).toHaveAttribute("data-seed", "2")
  expect(root).toHaveAttribute("data-state", "scattered")
})

test("减弱动效拖动后没有惯性", async () => {
  installMedia({ reduced: true })
  const view = render(<ScatterPhotoDrag />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-inertia", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  const card = photo(view.container, "photo-1")
  const before = Number(card.getAttribute("data-x"))
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1 })
  fireEvent.pointerMove(card, { clientX: 40, clientY: 0, pointerId: 1 })
  fireEvent.pointerMove(card, { clientX: 100, clientY: 0, pointerId: 1 })
  fireEvent.pointerUp(card, { pointerId: 1 })
  const released = Number(photo(view.container, "photo-1").getAttribute("data-x"))
  expect(released).toBeCloseTo(before + 100, 1)
  expect(root).toHaveAttribute("data-inertia", "off")
  act(() => drain(8))
  expect(Number(photo(view.container, "photo-1").getAttribute("data-x"))).toBeCloseTo(released, 1)
  expect(queued.size).toBe(0)
})

test("离开视口后松手不再排惯性帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<ScatterPhotoDrag />)
  const root = rootOf(view.container)
  const card = photo(view.container, "photo-1")
  expect(root).toHaveAttribute("data-live", "off")
  const before = Number(card.getAttribute("data-x"))
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1 })
  fireEvent.pointerMove(card, { clientX: 80, clientY: 0, pointerId: 1 })
  fireEvent.pointerUp(card, { pointerId: 1 })
  expect(Number(photo(view.container, "photo-1").getAttribute("data-x"))).toBeCloseTo(before + 80, 1)
  expect(root).toHaveAttribute("data-inertia", "off")
  act(() => drain(8))
  expect(Number(photo(view.container, "photo-1").getAttribute("data-x"))).toBeCloseTo(before + 80, 1)
  expect(queued.size).toBe(0)
})
