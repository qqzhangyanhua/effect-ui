// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PerforateTicketTear } from "./perforate-ticket-tear"

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
  const entry = getComponent("perforate-ticket-tear")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='perforate-ticket-tear']")
  if (!(node instanceof HTMLElement)) throw new Error("missing ticket")
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

test("票根默认完整，控件起始值等于默认", async () => {
  expect(getComponent("perforate-ticket-tear")?.batch).toBe(74)
  expect(getComponent("perforate-ticket-tear")?.effectCategory).toBe("cards")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.65)
  expect(start("threshold")).toBe(0.45)
  expect(start("axis")).toBe("vertical")
  const view = render(<PerforateTicketTear />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "ticket-tear")
  expect(root).toHaveAttribute("data-progress", "0.00")
  expect(root).toHaveAttribute("data-state", "intact")
  expect(root).toHaveAttribute("data-torn", "no")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-perforation]")).toBeTruthy()
  expect(view.getByText("Admit One")).toBeInTheDocument()
  expect(view.getByText("Stub A")).toBeInTheDocument()
  expect(view.queryByText("Redeemed")).toBeNull()
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("拖过阈值撕开，没过阈值回弹", async () => {
  const onTear = vi.fn()
  const view = render(<PerforateTicketTear onTear={onTear} />)
  const root = rootOf(view.container)
  const stub = view.getByRole("slider", { name: "撕开票根" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(stub, { clientX: 0, clientY: 0, button: 0, pointerId: 1 })
  fireEvent.pointerMove(stub, { clientX: 0, clientY: 30, pointerId: 1 })
  expect(root).toHaveAttribute("data-progress", "0.17")
  expect(root).toHaveAttribute("data-state", "dragging")
  fireEvent.pointerUp(stub, { clientX: 0, clientY: 30, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "rebound")
  expect(onTear).not.toHaveBeenCalled()
  expect(queued.size).toBeGreaterThan(0)
  act(() => drain(10))
  expect(root).toHaveAttribute("data-state", "intact")
  expect(root).toHaveAttribute("data-progress", "0.00")
  fireEvent.pointerDown(stub, { clientX: 0, clientY: 0, button: 0, pointerId: 2 })
  fireEvent.pointerMove(stub, { clientX: 0, clientY: 100, pointerId: 2 })
  expect(root).toHaveAttribute("data-progress", "0.56")
  fireEvent.pointerUp(stub, { clientX: 0, clientY: 100, pointerId: 2 })
  expect(root).toHaveAttribute("data-torn", "yes")
  expect(root).toHaveAttribute("data-state", "torn")
  expect(view.getByText("Redeemed")).toBeInTheDocument()
  expect(onTear).toHaveBeenCalledTimes(1)
})

test("更高阈值不撕开，方向键加进度后 Enter 确认，横向用水平位移", async () => {
  const held = render(<PerforateTicketTear threshold={0.8} />)
  const heldRoot = rootOf(held.container)
  const heldStub = held.getByRole("slider", { name: "撕开票根" })
  await waitFor(() => expect(heldRoot).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(heldStub, { clientX: 0, clientY: 0, button: 0, pointerId: 1 })
  fireEvent.pointerUp(heldStub, { clientX: 0, clientY: 100, pointerId: 1 })
  expect(heldRoot).toHaveAttribute("data-state", "rebound")
  expect(heldRoot).toHaveAttribute("data-torn", "no")
  held.unmount()

  const view = render(<PerforateTicketTear axis="horizontal" />)
  const root = rootOf(view.container)
  const stub = view.getByRole("slider", { name: "撕开票根" })
  expect(root).toHaveAttribute("data-axis", "horizontal")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  for (let i = 0; i < 5; i += 1) fireEvent.keyDown(stub, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-progress", "0.50")
  expect(root).toHaveAttribute("data-torn", "no")
  fireEvent.keyDown(stub, { key: "Enter" })
  expect(root).toHaveAttribute("data-torn", "yes")
  expect(view.getByText("Redeemed")).toBeInTheDocument()
  fireEvent.pointerDown(stub, { clientX: 0, clientY: 40, button: 0, pointerId: 3 })
  fireEvent.pointerMove(stub, { clientX: 40, clientY: 40, pointerId: 3 })
  expect(root).toHaveAttribute("data-torn", "yes")
})

test("减弱动效瞬时撕开和复位", () => {
  installMedia({ reduced: true })
  const view = render(<PerforateTicketTear />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.click(view.getByRole("button", { name: "Tear" }))
  expect(root).toHaveAttribute("data-torn", "yes")
  expect(root).toHaveAttribute("data-state", "torn")
  expect(view.getByText("Redeemed")).toBeInTheDocument()
  expect(queued.size).toBe(0)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-torn", "no")
  expect(root).toHaveAttribute("data-state", "intact")
  expect(root).toHaveAttribute("data-progress", "0.00")
})

test("离开视口时停回弹", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<PerforateTicketTear />)
  const root = rootOf(view.container)
  const stub = view.getByRole("slider", { name: "撕开票根" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.pointerDown(stub, { clientX: 0, clientY: 0, button: 0, pointerId: 1 })
  fireEvent.pointerUp(stub, { clientX: 0, clientY: 30, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "rebound")
  expect(queued.size).toBeGreaterThan(0)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(queued.size).toBe(0)
  await waitFor(() => expect(root).toHaveAttribute("data-state", "intact"))
  expect(root).toHaveAttribute("data-progress", "0.00")
})
