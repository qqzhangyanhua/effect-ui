// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { SeedSlotDrop } from "./seed-slot-drop"

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

function installSlots() {
  const original = Element.prototype.getBoundingClientRect
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const slot = this.getAttribute("data-slot-index")
    if (slot !== null) {
      const index = Number(slot)
      return new DOMRect(index * 140, 0, 96, 64)
    }
    return original.call(this)
  })
}

function start(prop: string) {
  const entry = getComponent("seed-slot-drop")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='seed-slot-drop']")
  if (!(node instanceof HTMLElement)) throw new Error("missing slots")
  return node
}

function chip(container: HTMLElement, id: string) {
  const node = container.querySelector(`[data-pool] [data-seed='${id}']`)
  if (!(node instanceof HTMLElement)) throw new Error(id)
  return node
}

function slot(container: HTMLElement, index: number) {
  const node = container.querySelector(`[data-slot-index='${index}']`)
  if (!(node instanceof HTMLElement)) throw new Error(String(index))
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
  installSlots()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test("词块控件起始值等于默认，空槽还在池外", async () => {
  expect(getComponent("seed-slot-drop")?.batch).toBe(69)
  expect(getComponent("seed-slot-drop")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("slots")).toBe(3)
  expect(start("gap")).toBe(12)
  const view = render(<SeedSlotDrop />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "seed-slot")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.65")
  expect(root).toHaveAttribute("data-slots", "3")
  expect(root).toHaveAttribute("data-gap", "12")
  expect(root).toHaveAttribute("data-state", "pool")
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.container.querySelectorAll("[data-slot-index]")).toHaveLength(3)
  expect(view.getByRole("status")).toHaveTextContent("把词块放进空槽")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖近空槽会吸附，取出后回到词池", async () => {
  const onPlace = vi.fn()
  const view = render(<SeedSlotDrop onPlace={onPlace} />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  const amber = chip(view.container, "amber")
  fireEvent.pointerDown(amber, { clientX: 0, clientY: 220, pointerId: 1 })
  fireEvent.pointerMove(amber, { clientX: 48, clientY: 32, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "dragging")
  expect(slot(view.container, 0)).toHaveAttribute("data-aim", "on")
  fireEvent.pointerUp(amber, { clientX: 48, clientY: 32, pointerId: 1 })
  expect(slot(view.container, 0)).toHaveAttribute("data-filled", "amber")
  expect(root).toHaveAttribute("data-state", "snapped")
  expect(root).toHaveAttribute("data-spring", "on")
  expect(root).toHaveAttribute("data-filled", "1")
  expect(view.getByRole("status")).toHaveTextContent("琥珀放入槽 1")
  expect(onPlace).toHaveBeenCalledWith("amber", 0)
  expect(view.container.querySelector("[data-pool] [data-seed='amber']")).toBeNull()
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(12))
  expect(root).toHaveAttribute("data-spring", "off")
  expect(slot(view.container, 0)).toHaveAttribute("data-filled", "amber")
  fireEvent.click(view.getByRole("button", { name: "取出琥珀" }))
  expect(slot(view.container, 0)).toHaveAttribute("data-filled", "")
  expect(view.getByRole("status")).toHaveTextContent("琥珀回到池中")
  expect(onPlace).toHaveBeenCalledWith("amber", null)
  expect(chip(view.container, "amber")).toBeInTheDocument()
})

test("键盘可以放满一轮，减弱动效改为点选", async () => {
  const view = render(<SeedSlotDrop />)
  const root = rootOf(view.container)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  for (const id of ["amber", "moss", "ink"]) {
    const button = chip(view.container, id)
    fireEvent.keyDown(button, { key: "ArrowRight" })
    fireEvent.keyDown(button, { key: "Enter" })
  }
  expect(root).toHaveAttribute("data-filled", "3")
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-pulse", "on")
  expect(view.getByRole("status")).toHaveTextContent("全部填满")
  expect(slot(view.container, 0)).toHaveAttribute("data-filled", "amber")
  expect(slot(view.container, 1)).toHaveAttribute("data-filled", "moss")
  expect(slot(view.container, 2)).toHaveAttribute("data-filled", "ink")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-pulse", "off")
  expect(root).toHaveAttribute("data-state", "complete")
})

test("减弱动效点选填满，没有弹簧帧", () => {
  installMedia({ reduced: true })
  const view = render(<SeedSlotDrop />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root.className).toContain("motion-reduce:transition-none")
  const names = ["琥珀", "苔绿", "墨蓝"]
  names.forEach((name, index) => {
    fireEvent.click(view.getByRole("button", { name }))
    expect(view.getByRole("status")).toHaveTextContent(`已选中${name}`)
    fireEvent.click(slot(view.container, index))
  })
  expect(root).toHaveAttribute("data-state", "complete")
  expect(root).toHaveAttribute("data-filled", "3")
  expect(root).toHaveAttribute("data-spring", "off")
  expect(root).toHaveAttribute("data-pulse", "off")
  act(() => drain(8))
  expect(queued.size).toBe(0)
})
