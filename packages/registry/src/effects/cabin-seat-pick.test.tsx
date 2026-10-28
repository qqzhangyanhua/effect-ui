// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { CabinSeatPick } from "./cabin-seat-pick"

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
  const entry = getComponent("cabin-seat-pick")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='cabin-seat-pick']")
  if (!(node instanceof HTMLElement)) throw new Error("missing cabin")
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

test("座位控件起始值等于默认，底栏没有座号", async () => {
  expect(getComponent("cabin-seat-pick")?.batch).toBe(78)
  expect(getComponent("cabin-seat-pick")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("preferred")).toBe(true)
  expect(start("multi")).toBe(false)
  const view = render(<CabinSeatPick />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "cabin-grid")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-seats", "")
  expect(root).toHaveAttribute("data-focus", "10A")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-hex]")).toBeNull()
  expect(view.getByRole("gridcell", { name: "Seat 10C" })).toHaveAttribute("data-tone", "preferred")
  expect(view.getByRole("gridcell", { name: "Seat 10B taken" })).toHaveAttribute("data-tone", "taken")
  expect(view.getByRole("status")).toHaveTextContent("No seat")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.queryByText(/Delta|Booking/)).toBeNull()
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(queued.size).toBe(0)
})

test("方向键走过占用座，Enter 选中空座，Escape 清除", () => {
  const onValueChange = vi.fn()
  const view = render(<CabinSeatPick onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  const grid = view.getByRole("grid", { name: "Cabin seats" })
  fireEvent.keyDown(grid, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "10B")
  expect(root).toHaveAttribute("data-state", "focusing")
  fireEvent.keyDown(grid, { key: "Enter" })
  expect(root).toHaveAttribute("data-seats", "")
  expect(onValueChange).not.toHaveBeenCalled()
  fireEvent.keyDown(grid, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "10C")
  fireEvent.keyDown(grid, { key: "Enter" })
  expect(root).toHaveAttribute("data-seats", "10C")
  expect(root).toHaveAttribute("data-state", "selected")
  expect(view.getByRole("status")).toHaveTextContent("Seat 10C")
  expect(onValueChange).toHaveBeenCalledWith(["10C"])
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 12C" }))
  expect(root).toHaveAttribute("data-seats", "12C")
  expect(view.getByRole("status")).toHaveTextContent("Seat 12C")
  fireEvent.keyDown(grid, { key: "Escape" })
  expect(root).toHaveAttribute("data-seats", "")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(onValueChange).toHaveBeenLastCalledWith([])
})

test("占用座不可选，多选停在两席，关闭 preferred 后改成普通色", () => {
  const view = render(<CabinSeatPick multi preferred={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 10B taken" }))
  expect(root).toHaveAttribute("data-seats", "")
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 12C" }))
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 14A" }))
  expect(root).toHaveAttribute("data-seats", "12C,14A")
  expect(view.getByRole("status")).toHaveTextContent("Seat 12C · Seat 14A")
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 10A" }))
  expect(root).toHaveAttribute("data-seats", "12C,14A")
  expect(view.getByRole("gridcell", { name: "Seat 10C" })).toHaveAttribute("data-tone", "open")
  expect(root).toHaveAttribute("data-preferred", "off")
  expect(root).toHaveAttribute("data-multi", "on")
})

test("减弱动效瞬时选中，没有动画帧", () => {
  installMedia({ reduced: true })
  const view = render(<CabinSeatPick />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("gridcell", { name: "Seat 12C" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-seats", "12C")
  expect(root).toHaveAttribute("data-state", "selected")
  expect(queued.size).toBe(0)
})
