// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { InterlockStreakGlow, STREAK_COUNT, streakClamp } from "./interlock-streak-glow"

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
  const found = getComponent("interlock-streak-glow")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='interlock-streak-glow']")
  if (!(node instanceof HTMLElement)) throw new Error("missing streak")
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

test("连胜默认是零，控件起始值等于默认", () => {
  expect(getComponent("interlock-streak-glow")?.batch).toBe(80)
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("liquid")).toBe(true)
  expect(start("glow")).toBe(true)
  expect(streakClamp(9)).toBe(STREAK_COUNT)
  expect(streakClamp(-2)).toBe(0)
  const view = render(<InterlockStreakGlow />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "streak-glow")
  expect(root).toHaveAttribute("data-streak", "0")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-liquid", "on")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-bridge='liquid']")).toBeInTheDocument()
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Day streak")).toBeInTheDocument()
  expect(view.queryByText(/whoop|bitepal|pillow/i)).toBeNull()
  expect(queued.size).toBe(0)
})

test("步进点亮圆和桥，点圆可跳档，Reset 归零", () => {
  const onValueChange = vi.fn()
  const view = render(<InterlockStreakGlow onValueChange={onValueChange} glow={false} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Step" }))
  expect(root).toHaveAttribute("data-streak", "1")
  expect(root).toHaveAttribute("data-phase", "lighting")
  expect(root.querySelector("[data-day='1']")).toHaveAttribute("data-lit", "on")
  expect(root.querySelectorAll("[data-link='on']")).toHaveLength(0)
  expect(onValueChange).toHaveBeenLastCalledWith({ streak: 1 })
  fireEvent.click(view.getByRole("button", { name: "Day 4" }))
  expect(root).toHaveAttribute("data-streak", "4")
  expect(root.querySelector("[data-day='4']")).toHaveAttribute("data-lit", "on")
  expect(root.querySelector("[data-day='5']")).toHaveAttribute("data-lit", "off")
  expect(root.querySelectorAll("[data-link='on']")).toHaveLength(3)
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-streak", "0")
  expect(root.querySelectorAll("[data-lit='on']")).toHaveLength(0)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-streak", "1")
  fireEvent.keyDown(root, { key: " " })
  expect(root).toHaveAttribute("data-streak", "2")
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-streak", "7")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-streak", "0")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})

test("关闭液体桥时改用直线", () => {
  const view = render(<InterlockStreakGlow liquid={false} glow={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-liquid", "off")
  expect(root.querySelector("[data-bridge='line']")).toBeInTheDocument()
  expect(root.querySelector("[data-bridge='liquid']")).toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Day 2" }))
  expect(root.querySelector("line[data-link='on']")).toBeInTheDocument()
})

test("外辉呼吸离开视口后停止", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<InterlockStreakGlow />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Step" }))
  await waitFor(() => {
    expect(root).toHaveAttribute("data-playing", "on")
    expect(queued.size).toBeGreaterThan(0)
  })
  const before = Number(root.getAttribute("data-glow"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-glow"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const stopped = root.getAttribute("data-glow")
  act(() => drain(3))
  expect(root.getAttribute("data-glow")).toBe(stopped)
})

test("减弱动效瞬时点亮，没有呼吸帧", () => {
  installMedia({ reduced: true })
  const view = render(<InterlockStreakGlow />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Day 3" }))
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-streak", "3")
  expect(root).toHaveAttribute("data-phase", "settled")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root.querySelectorAll("[data-link='on']")).toHaveLength(2)
  expect(queued.size).toBe(0)
})
