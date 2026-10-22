// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { JellyButton } from "./jelly-button"

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

function button() {
  return screen.getByRole("button", { name: "按一下" })
}

test("按下时变扁，点击仍然触发，松手后弹回", () => {
  const onClick = vi.fn()
  render(<JellyButton onClick={onClick} />)
  expect(document.querySelector("[data-slot='jelly-button']")).not.toHaveAttribute("data-reduced")
  const node = button()
  fireEvent.pointerDown(node, { button: 0, clientX: 4, clientY: 4, pointerId: 1 })
  expect(node).toHaveAttribute("data-pressed", "true")
  pump(4)
  expect(Number(node.getAttribute("data-scale-y"))).toBeLessThan(0.95)
  fireEvent.pointerUp(node, { button: 0, clientX: 4, clientY: 4, pointerId: 1 })
  fireEvent.click(node)
  expect(onClick).toHaveBeenCalledTimes(1)
  pump(24)
  expect(Number(node.getAttribute("data-scale-y"))).toBeGreaterThan(0.97)
  expect(queue.size).toBe(0)
})

test("回车激活按钮", () => {
  const onClick = vi.fn()
  render(<JellyButton onClick={onClick} />)
  fireEvent.keyDown(button(), { key: "Enter" })
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(button()).toHaveAttribute("data-pressed", "true")
  pump(4)
  expect(Number(button().getAttribute("data-scale-y"))).toBeLessThan(0.95)
  fireEvent.keyUp(button(), { key: "Enter" })
  pump(24)
  expect(Number(button().getAttribute("data-scale-y"))).toBeGreaterThan(0.97)
})

test("触屏按下会压扁并在松开时触发，不依赖悬停", () => {
  const onClick = vi.fn()
  render(<JellyButton onClick={onClick} />)
  const node = button()
  fireEvent.pointerDown(node, { clientX: 2, clientY: 2, pointerId: 2, pointerType: "touch" })
  pump(4)
  expect(Number(node.getAttribute("data-scale-y"))).toBeLessThan(0.95)
  fireEvent.pointerUp(node, { clientX: 2, clientY: 2, pointerId: 2, pointerType: "touch" })
  expect(onClick).toHaveBeenCalledTimes(1)
})

test("减弱动效时不压扁，键盘仍能触发，并且不申请动画帧", () => {
  reduceMotion = true
  const onClick = vi.fn()
  render(<JellyButton onClick={onClick} />)
  const node = button()
  expect(node).toHaveAttribute("data-reduced", "true")
  fireEvent.pointerDown(node, { clientX: 0, clientY: 0, pointerId: 1, pointerType: "touch" })
  fireEvent.keyDown(node, { key: " " })
  expect(onClick).toHaveBeenCalledTimes(1)
  expect(node.getAttribute("data-scale-y")).toBe("1.000")
  expect(node.getAttribute("data-scale-x")).toBe("1.000")
  expect(queue.size).toBe(0)
})
