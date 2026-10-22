// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { MagnetChips } from "./magnet-chips"

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

function dragIn(name: string, pointerType: "mouse" | "touch" = "mouse") {
  const chip = screen.getByRole("button", { name })
  fireEvent.pointerDown(chip, { clientX: 0, clientY: 0, pointerId: 1, pointerType, timeStamp: 0 })
  fireEvent.pointerMove(chip, { clientX: 4, clientY: 64, pointerId: 1, pointerType, timeStamp: 40 })
  fireEvent.pointerUp(chip, { clientX: 4, clientY: 80, pointerId: 1, pointerType, timeStamp: 80 })
}

test("默认渲染三枚芯片，不读减弱动效时没有 data-reduced", () => {
  render(<MagnetChips />)
  expect(screen.getByRole("button", { name: "设计" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "工程" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "研究" })).toBeInTheDocument()
  expect(screen.getByRole("region", { name: "对齐区域" })).toHaveTextContent("拖进这里，芯片会对齐")
  expect(document.querySelector("[data-slot='magnet-chips']")).not.toHaveAttribute("data-reduced")
  expect(queue.size).toBe(0)
})

test("拖进对齐区后吸附，动画走完再回调", () => {
  const onSnap = vi.fn()
  render(<MagnetChips onSnap={onSnap} />)
  dragIn("设计")
  expect(onSnap).not.toHaveBeenCalled()
  expect(screen.queryByRole("button", { name: "设计" })).toBeNull()
  expect(document.querySelector("[data-snapping='true']")).toBeTruthy()
  pump(20)
  expect(onSnap).toHaveBeenCalledWith("design")
  expect(document.querySelector("[data-snapping='true']")).toBeNull()
  expect(document.querySelector("[data-placed='true']")).toHaveTextContent("设计")
  expect(queue.size).toBe(0)
})

test("拖得不够远时留在原处，不回调", () => {
  const onSnap = vi.fn()
  render(<MagnetChips onSnap={onSnap} />)
  const chip = screen.getByRole("button", { name: "设计" })
  fireEvent.pointerDown(chip, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(chip, { clientX: 6, clientY: 10, pointerId: 1, timeStamp: 40 })
  pump(8)
  expect(onSnap).not.toHaveBeenCalled()
  expect(screen.getByRole("button", { name: "设计" })).toBeInTheDocument()
  expect(queue.size).toBe(0)
})

test("方向键和回车都能把芯片放进对齐区", () => {
  const onSnap = vi.fn()
  render(<MagnetChips onSnap={onSnap} />)
  fireEvent.keyDown(screen.getByRole("button", { name: "设计" }), { key: "ArrowDown" })
  expect(onSnap).not.toHaveBeenCalled()
  pump(20)
  expect(onSnap).toHaveBeenCalledWith("design")
  fireEvent.keyDown(screen.getByRole("button", { name: "工程" }), { key: "Enter" })
  pump(20)
  expect(onSnap).toHaveBeenCalledWith("build")
  expect(screen.getByRole("region", { name: "对齐区域" })).toHaveTextContent("工程")
})

test("触屏拖进对齐区同样会吸附", () => {
  const onSnap = vi.fn()
  render(<MagnetChips onSnap={onSnap} />)
  dragIn("研究", "touch")
  pump(20)
  expect(onSnap).toHaveBeenCalledWith("research")
  expect(document.querySelector("[data-placed='true']")).toHaveTextContent("研究")
})

test("减弱动效时回车立刻对齐，并且不申请动画帧", () => {
  reduceMotion = true
  const onSnap = vi.fn()
  render(<MagnetChips onSnap={onSnap} />)
  expect(document.querySelector("[data-slot='magnet-chips']")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(screen.getByRole("button", { name: "设计" }), { key: "Enter" })
  expect(onSnap).toHaveBeenCalledWith("design")
  expect(document.querySelector("[data-snapping='true']")).toBeNull()
  expect(document.querySelector("[data-placed='true']")).toHaveTextContent("设计")
  expect(queue.size).toBe(0)
})
