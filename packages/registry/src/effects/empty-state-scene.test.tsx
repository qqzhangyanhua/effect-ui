// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { EmptyStateScene } from "./empty-state-scene"

let reduceMotion = false
let now = 0
let rafId = 0
let frameRequests = 0
const queue = new Map<number, FrameRequestCallback>()

beforeEach(() => {
  reduceMotion = false
  now = 0
  rafId = 0
  frameRequests = 0
  queue.clear()
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    frameRequests += 1
    rafId += 1
    queue.set(rafId, cb)
    return rafId
  })
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => {
    queue.delete(handle)
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function pump(steps: number) {
  act(() => {
    for (let i = 0; i < steps; i += 1) {
      const next = queue.entries().next().value as [number, FrameRequestCallback] | undefined
      if (!next) break
      queue.delete(next[0])
      now += 32
      next[1](now)
    }
  })
}

function piece(name: string) {
  return screen.getByRole("button", { name })
}

test("默认画出空状态零件，并开始漂浮", () => {
  render(<EmptyStateScene />)
  expect(screen.getByText("还没有内容")).toBeInTheDocument()
  expect(piece("空盒子")).toBeInTheDocument()
  expect(piece("纸飞机")).toBeInTheDocument()
  expect(piece("放大镜")).toBeInTheDocument()
  const root = document.querySelector("[data-slot='empty-state-scene']")
  expect(root).not.toHaveAttribute("data-reduced")
  expect(root).toHaveAttribute("data-floating", "true")
  const before = piece("空盒子").getAttribute("style")
  expect(frameRequests).toBeGreaterThan(0)
  pump(4)
  expect(piece("空盒子").getAttribute("style")).not.toEqual(before)
})

test("指针拨动零件后回调，轻轻一碰不会触发", () => {
  const onNudge = vi.fn()
  render(<EmptyStateScene onNudge={onNudge} />)
  const glass = piece("放大镜")
  fireEvent.pointerDown(glass, { button: 0, clientX: 0, clientY: 0, pointerId: 1, pointerType: "mouse" })
  fireEvent.pointerUp(glass, { button: 0, clientX: 4, clientY: 2, pointerId: 1, pointerType: "mouse" })
  expect(onNudge).not.toHaveBeenCalled()
  const box = piece("空盒子")
  fireEvent.pointerDown(box, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "mouse" })
  fireEvent.pointerMove(box, { button: 0, clientX: 46, clientY: 14, pointerId: 1, pointerType: "mouse" })
  fireEvent.pointerUp(box, { button: 0, clientX: 46, clientY: 14, pointerId: 1, pointerType: "mouse" })
  expect(onNudge).toHaveBeenCalledTimes(1)
  expect(onNudge).toHaveBeenCalledWith("box")
  expect(box.getAttribute("style")).toContain("36px")
})

test("方向键可以拨动聚焦的零件", () => {
  const onNudge = vi.fn()
  render(<EmptyStateScene onNudge={onNudge} />)
  fireEvent.keyDown(piece("放大镜"), { key: "ArrowLeft" })
  expect(onNudge).toHaveBeenCalledWith("glass")
  expect(piece("放大镜").getAttribute("style")).toContain("-20px")
})

test("触屏拖动能拨动零件，不依赖悬停", () => {
  const onNudge = vi.fn()
  render(<EmptyStateScene onNudge={onNudge} />)
  const plane = piece("纸飞机")
  fireEvent.pointerDown(plane, { button: 0, clientX: 8, clientY: 8, pointerId: 4, pointerType: "touch" })
  fireEvent.pointerMove(plane, { button: 0, clientX: 40, clientY: 20, pointerId: 4, pointerType: "touch" })
  fireEvent.pointerUp(plane, { button: 0, clientX: 40, clientY: 20, pointerId: 4, pointerType: "touch" })
  expect(onNudge).toHaveBeenCalledWith("plane")
})

test("减弱动效时插画静止，拨动不会申请动画帧", () => {
  reduceMotion = true
  const onNudge = vi.fn()
  render(<EmptyStateScene onNudge={onNudge} />)
  const root = document.querySelector("[data-slot='empty-state-scene']")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).not.toHaveAttribute("data-floating")
  const before = piece("空盒子").getAttribute("style")
  pump(6)
  expect(piece("空盒子").getAttribute("style")).toEqual(before)
  fireEvent.keyDown(piece("空盒子"), { key: "ArrowRight" })
  const plane = piece("纸飞机")
  fireEvent.pointerDown(plane, { button: 0, clientX: 0, clientY: 0, pointerId: 5, pointerType: "touch" })
  fireEvent.pointerUp(plane, { button: 0, clientX: 28, clientY: 0, pointerId: 5, pointerType: "touch" })
  expect(onNudge).toHaveBeenNthCalledWith(1, "box")
  expect(onNudge).toHaveBeenNthCalledWith(2, "plane")
  expect(piece("空盒子").getAttribute("style")).toContain("20px")
  expect(plane.getAttribute("style")).toContain("28px")
  expect(frameRequests).toBe(0)
  expect(queue.size).toBe(0)
})
