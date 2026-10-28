// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { CurbSpotWalk, curbWalkPath } from "./curb-spot-walk"

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
  const entry = getComponent("curb-spot-walk")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='curb-spot-walk']")
  if (!(node instanceof HTMLElement)) throw new Error("missing curb")
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

test("路边点默认停在 2 分钟，虚线连到入口", async () => {
  expect(getComponent("curb-spot-walk")?.batch).toBe(78)
  expect(getComponent("curb-spot-walk")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("flow")).toBe(true)
  expect(start("showEta")).toBe(true)
  const view = render(<CurbSpotWalk />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "curb-walk")
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-minutes", "2")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-part='walk']")).toHaveAttribute("d", curbWalkPath(0))
  expect(root.querySelector("[data-km]")).toBeNull()
  expect(view.getByText("2 MIN WALK")).toBeInTheDocument()
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(root).toHaveAttribute("data-flowing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
})

test("方向键切换停靠点和分钟，Enter 确认虚线", () => {
  const onValueChange = vi.fn()
  const view = render(<CurbSpotWalk onValueChange={onValueChange} flow={false} />)
  const root = rootOf(view.container)
  const group = view.getByRole("radiogroup", { name: "Curb spots" })
  fireEvent.keyDown(group, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-minutes", "5")
  expect(root).toHaveAttribute("data-spot", "b")
  expect(root).toHaveAttribute("data-state", "selecting")
  expect(view.getByText("5 MIN WALK")).toBeInTheDocument()
  expect(root.querySelector("[data-part='walk']")).toHaveAttribute("d", curbWalkPath(1))
  expect(onValueChange).toHaveBeenCalledWith({ spotIndex: 1, minutes: 5 })
  act(() => drain(1))
  expect(root).toHaveAttribute("data-state", "pathVisible")
  fireEvent.keyDown(group, { key: "ArrowLeft" })
  fireEvent.keyDown(group, { key: "Enter" })
  expect(root).toHaveAttribute("data-index", "0")
  expect(root).toHaveAttribute("data-state", "pathVisible")
  fireEvent.click(view.getByRole("radio", { name: /Spot C/ }))
  expect(root).toHaveAttribute("data-minutes", "8")
})

test("关闭分钟徽章后仍保留分钟数据", () => {
  const view = render(<CurbSpotWalk showEta={false} flow={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-eta", "off")
  expect(root).toHaveAttribute("data-minutes", "2")
  expect(view.queryByText("2 MIN WALK")).toBeNull()
})

test("虚线流动在视口内排队，离开后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<CurbSpotWalk />)
  const root = rootOf(view.container)
  await waitFor(() => {
    expect(root).toHaveAttribute("data-live", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-dash"))
  act(() => drain(3))
  expect(Number(root.getAttribute("data-dash"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-live", "off")
  expect(root).toHaveAttribute("data-flowing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-dash")
  act(() => drain(3))
  expect(root.getAttribute("data-dash")).toBe(stopped)
})

test("减弱动效瞬时切点，虚线不再流动", () => {
  installMedia({ reduced: true })
  const view = render(<CurbSpotWalk />)
  const root = rootOf(view.container)
  fireEvent.keyDown(view.getByRole("radiogroup"), { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-minutes", "5")
  expect(root).toHaveAttribute("data-state", "pathVisible")
  expect(root).toHaveAttribute("data-flowing", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(queued.size).toBe(0)
})
