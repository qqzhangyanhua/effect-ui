// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { ReactionTray } from "./reaction-tray"

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

test("默认展示三个回应和计数，没有减弱标记", () => {
  render(<ReactionTray />)
  expect(screen.getByRole("button", { name: "赞 2" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "欢呼 1" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "灵感 0" })).toBeInTheDocument()
  expect(document.querySelector("[data-slot='reaction-tray']")).not.toHaveAttribute("data-reduced")
  expect(document.querySelector("[data-popping='true']")).toBeNull()
  expect(frameRequests).toBe(0)
})

test("指针选中后表情先弹出，落回时计数加一并回调", () => {
  const onReact = vi.fn()
  render(<ReactionTray onReact={onReact} />)
  fireEvent.pointerUp(screen.getByRole("button", { name: "欢呼 1" }), { button: 0, pointerId: 1, pointerType: "mouse" })
  const flying = document.querySelector("[data-popping='true']")
  expect(flying).toBeTruthy()
  expect(onReact).not.toHaveBeenCalled()
  const before = flying?.getAttribute("style")
  pump(4)
  expect(document.querySelector("[data-popping='true']")?.getAttribute("style")).not.toEqual(before)
  pump(24)
  expect(onReact).toHaveBeenCalledTimes(1)
  expect(onReact).toHaveBeenCalledWith("cheer", 2)
  expect(screen.getByRole("button", { name: "欢呼 2" })).toBeInTheDocument()
  expect(document.querySelector("[data-popping='true']")).toBeNull()
  expect(queue.size).toBe(0)
})

test("回车或空格可以选中回应", () => {
  const onReact = vi.fn()
  render(<ReactionTray onReact={onReact} />)
  fireEvent.keyDown(screen.getByRole("button", { name: "赞 2" }), { key: "Enter" })
  expect(onReact).not.toHaveBeenCalled()
  pump(24)
  expect(onReact).toHaveBeenCalledWith("like", 3)
  fireEvent.keyDown(screen.getByRole("button", { name: "灵感 0" }), { key: " " })
  pump(24)
  expect(onReact).toHaveBeenCalledWith("idea", 1)
})

test("触屏点按会弹出回应，不依赖悬停", () => {
  const onReact = vi.fn()
  render(<ReactionTray onReact={onReact} />)
  fireEvent.pointerUp(screen.getByRole("button", { name: "灵感 0" }), { button: 0, pointerId: 6, pointerType: "touch" })
  expect(document.querySelector("[data-popping='true']")).toBeTruthy()
  pump(24)
  expect(onReact).toHaveBeenCalledWith("idea", 1)
})

test("减弱动效时计数立刻更新，不弹出也不申请动画帧", () => {
  reduceMotion = true
  const onReact = vi.fn()
  render(<ReactionTray onReact={onReact} />)
  expect(document.querySelector("[data-slot='reaction-tray']")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(screen.getByRole("button", { name: "赞 2" }), { key: "Enter" })
  fireEvent.pointerUp(screen.getByRole("button", { name: "赞 3" }), { button: 0, pointerId: 7, pointerType: "touch" })
  expect(onReact).toHaveBeenNthCalledWith(1, "like", 3)
  expect(onReact).toHaveBeenNthCalledWith(2, "like", 4)
  expect(screen.getByRole("button", { name: "赞 4" })).toBeInTheDocument()
  expect(document.querySelector("[data-popping='true']")).toBeNull()
  expect(frameRequests).toBe(0)
  expect(queue.size).toBe(0)
})
