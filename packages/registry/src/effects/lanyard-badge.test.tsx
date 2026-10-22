// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { LanyardBadge } from "./lanyard-badge"

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

function badge() {
  return screen.getByRole("button", { name: "访客证" })
}

test("拖开工牌后松手会摆回来并回调", () => {
  const onSettle = vi.fn()
  render(<LanyardBadge onSettle={onSettle} />)
  expect(document.querySelector("[data-slot='lanyard-badge']")).not.toHaveAttribute("data-reduced")
  const card = badge()
  fireEvent.pointerDown(card, { clientX: 10, clientY: 20, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(card, { clientX: 96, clientY: 48, pointerId: 1, timeStamp: 40 })
  expect(card.getAttribute("data-x")).not.toBe("0")
  fireEvent.pointerUp(card, { clientX: 110, clientY: 40, pointerId: 1, timeStamp: 70 })
  expect(onSettle).not.toHaveBeenCalled()
  expect(queue.size).toBeGreaterThan(0)
  pump(28)
  expect(onSettle).toHaveBeenCalledTimes(1)
  expect(card.getAttribute("data-x")).toBe("0")
  expect(card.getAttribute("data-y")).toBe("0")
  expect(queue.size).toBe(0)
})

test("方向键拨动挂绳，停住后回调", () => {
  const onSettle = vi.fn()
  render(<LanyardBadge onSettle={onSettle} />)
  fireEvent.keyDown(badge(), { key: "ArrowRight" })
  expect(onSettle).not.toHaveBeenCalled()
  expect(badge().getAttribute("data-x")).not.toBe("0")
  pump(28)
  expect(onSettle).toHaveBeenCalledTimes(1)
  expect(badge().getAttribute("data-x")).toBe("0")
})

test("触屏拖拽同样会摆动，不依赖悬停", () => {
  const onSettle = vi.fn()
  render(<LanyardBadge onSettle={onSettle} />)
  const card = badge()
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 2, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(card, { clientX: 88, clientY: 24, pointerId: 2, pointerType: "touch", timeStamp: 36 })
  expect(card.getAttribute("data-x")).not.toBe("0")
  pump(28)
  expect(onSettle).toHaveBeenCalledTimes(1)
})

test("减弱动效时工牌保持竖直，并且不申请动画帧", () => {
  reduceMotion = true
  const onSettle = vi.fn()
  render(<LanyardBadge onSettle={onSettle} />)
  expect(document.querySelector("[data-slot='lanyard-badge']")).toHaveAttribute("data-reduced", "true")
  const card = badge()
  fireEvent.pointerDown(card, { clientX: 0, clientY: 0, pointerId: 1, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerMove(card, { clientX: 80, clientY: 20, pointerId: 1, pointerType: "touch", timeStamp: 30 })
  fireEvent.pointerUp(card, { clientX: 90, clientY: 16, pointerId: 1, pointerType: "touch", timeStamp: 48 })
  fireEvent.keyDown(card, { key: "ArrowLeft" })
  expect(card.getAttribute("data-x")).toBe("0")
  expect(card.getAttribute("data-y")).toBe("0")
  expect(queue.size).toBe(0)
})
