// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CardTossStack } from "./card-toss-stack"

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

function topCard() {
  return screen.getByRole("button", { name: /草案/ })
}

test("默认渲染三张卡片，不读减弱动效时没有 data-reduced", () => {
  render(<CardTossStack />)
  expect(screen.getByText("草案")).toBeInTheDocument()
  expect(screen.getByText("评审")).toBeInTheDocument()
  expect(screen.getByText("发布")).toBeInTheDocument()
  expect(document.querySelector("[data-slot='card-toss-stack']")).not.toHaveAttribute("data-reduced")
})

test("方向键把顶卡甩出，惯性走完后回调", () => {
  const onToss = vi.fn()
  render(<CardTossStack onToss={onToss} />)
  fireEvent.keyDown(topCard(), { key: "ArrowRight" })
  expect(onToss).not.toHaveBeenCalled()
  expect(document.querySelector("[data-flying='true']")).toBeTruthy()
  pump(24)
  expect(onToss).toHaveBeenCalledWith("draft")
  expect(screen.getByRole("button", { name: /评审/ })).toBeInTheDocument()
  expect(screen.queryByRole("button", { name: /草案/ })).toBeNull()
})

test("拖得不够远时卡片回到原处，不回调", () => {
  const onToss = vi.fn()
  render(<CardTossStack onToss={onToss} />)
  const card = topCard()
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(card, { clientX: 10, clientY: 4, pointerId: 1, timeStamp: 80 })
  fireEvent.pointerUp(card, { clientX: 10, clientY: 4, pointerId: 1, timeStamp: 100 })
  pump(8)
  expect(onToss).not.toHaveBeenCalled()
  expect(screen.getByRole("button", { name: /草案/ })).toBeInTheDocument()
  expect(queue.size).toBe(0)
})

test("拖过阈值后沿出手方向飞走", () => {
  const onToss = vi.fn()
  render(<CardTossStack onToss={onToss} />)
  const card = topCard()
  fireEvent.pointerDown(card, { clientX: 20, clientY: 20, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(card, { clientX: 160, clientY: 30, pointerId: 1, timeStamp: 30 })
  fireEvent.pointerUp(card, { clientX: 160, clientY: 30, pointerId: 1, timeStamp: 40 })
  expect(document.querySelector("[data-flying='true']")).toBeTruthy()
  pump(24)
  expect(onToss).toHaveBeenCalledWith("draft")
})

test("触屏拖拽同样可以甩出，不依赖悬停", () => {
  const onToss = vi.fn()
  render(<CardTossStack onToss={onToss} />)
  const card = topCard()
  fireEvent.pointerDown(card, { button: 0, clientX: 0, clientY: 0, pointerId: 2, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(card, { button: 0, clientX: 140, clientY: 10, pointerId: 2, pointerType: "touch", timeStamp: 40 })
  pump(24)
  expect(onToss).toHaveBeenCalledWith("draft")
})

test("减弱动效时方向键立刻拿走顶卡，并且不申请动画帧", () => {
  reduceMotion = true
  const onToss = vi.fn()
  render(<CardTossStack onToss={onToss} />)
  expect(document.querySelector("[data-slot='card-toss-stack']")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(topCard(), { key: "ArrowRight" })
  expect(onToss).toHaveBeenCalledWith("draft")
  expect(document.querySelector("[data-flying='true']")).toBeNull()
  expect(queue.size).toBe(0)
})
