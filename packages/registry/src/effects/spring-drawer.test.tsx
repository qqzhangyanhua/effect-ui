// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { SpringDrawer } from "./spring-drawer"

let reduceMotion = false
let now = 0
let rafId = 0
const queue = new Map<number, FrameRequestCallback>()

beforeEach(() => {
  reduceMotion = false
  now = 0
  rafId = 0
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

function handle() {
  return screen.getByRole("button", { name: "打开抽屉" })
}

function root() {
  const node = document.querySelector("[data-slot='spring-drawer']")
  if (!node) throw new Error("找不到抽屉")
  return node
}

test("甩开抽屉，惯性走完后回调", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  expect(root()).not.toHaveAttribute("data-reduced")
  expect(root()).toHaveAttribute("data-open", "false")
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 8, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(grip, { clientX: 70, clientY: 8, pointerId: 1, timeStamp: 20 })
  expect(root().querySelector("[data-offset]")?.getAttribute("data-offset")).not.toBe("0")
  fireEvent.pointerUp(grip, { clientX: 170, clientY: 8, pointerId: 1, timeStamp: 46 })
  expect(onOpenChange).not.toHaveBeenCalled()
  expect(queue.size).toBeGreaterThan(0)
  pump(28)
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(root()).toHaveAttribute("data-open", "true")
  expect(root().querySelector("[data-offset]")).toHaveAttribute("data-offset", "280")
  expect(screen.getByRole("button", { name: "关闭抽屉" })).toBeInTheDocument()
})

test("快速拉开后在原处松手，没过半宽也会打开", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(grip, { clientX: 30, clientY: 0, pointerId: 1, timeStamp: 16 })
  fireEvent.pointerMove(grip, { clientX: 90, clientY: 0, pointerId: 1, timeStamp: 32 })
  fireEvent.pointerUp(grip, { clientX: 90, clientY: 0, pointerId: 1, timeStamp: 40 })
  pump(28)
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(root()).toHaveAttribute("data-open", "true")
})

test("已经拉开后再快速回拉，松手位置仍过半宽也会关上", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(grip, { clientX: 200, clientY: 0, pointerId: 1, timeStamp: 20 })
  fireEvent.pointerUp(grip, { clientX: 200, clientY: 0, pointerId: 1, timeStamp: 30 })
  pump(28)
  expect(root()).toHaveAttribute("data-open", "true")
  const close = screen.getByRole("button", { name: "关闭抽屉" })
  fireEvent.pointerDown(close, { clientX: 280, clientY: 0, pointerId: 1, timeStamp: 100 })
  fireEvent.pointerMove(close, { clientX: 220, clientY: 0, pointerId: 1, timeStamp: 116 })
  fireEvent.pointerMove(close, { clientX: 180, clientY: 0, pointerId: 1, timeStamp: 132 })
  fireEvent.pointerUp(close, { clientX: 180, clientY: 0, pointerId: 1, timeStamp: 140 })
  pump(28)
  expect(onOpenChange).toHaveBeenLastCalledWith(false)
  expect(root()).toHaveAttribute("data-open", "false")
})

test("拖得不够远时抽屉保持关上", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(grip, { clientX: 12, clientY: 0, pointerId: 1, timeStamp: 180 })
  pump(28)
  expect(onOpenChange).not.toHaveBeenCalled()
  expect(root()).toHaveAttribute("data-open", "false")
})

test("回车把抽屉拉开", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  fireEvent.keyDown(handle(), { key: "Enter" })
  expect(onOpenChange).not.toHaveBeenCalled()
  expect(queue.size).toBeGreaterThan(0)
  pump(28)
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(root()).toHaveAttribute("data-open", "true")
})

test("触屏甩动同样可以拉开，不依赖悬停", () => {
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, pointerId: 2, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(grip, { clientX: 150, clientY: 4, pointerId: 2, pointerType: "touch", timeStamp: 32 })
  pump(28)
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(root()).toHaveAttribute("data-open", "true")
})

test("减弱动效时直接开合，并且不申请动画帧", () => {
  reduceMotion = true
  const onOpenChange = vi.fn()
  render(<SpringDrawer onOpenChange={onOpenChange} />)
  expect(root()).toHaveAttribute("data-reduced", "true")
  const grip = handle()
  fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, pointerId: 1, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(grip, { clientX: 8, clientY: 0, pointerId: 1, pointerType: "touch", timeStamp: 200 })
  fireEvent.keyDown(handle(), { key: "ArrowRight" })
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(root()).toHaveAttribute("data-open", "true")
  expect(root().querySelector("[data-offset]")).toHaveAttribute("data-offset", "280")
  expect(queue.size).toBe(0)
})
