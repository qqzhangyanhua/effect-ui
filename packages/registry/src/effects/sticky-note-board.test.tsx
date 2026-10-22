// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { StickyNoteBoard } from "./sticky-note-board"

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

function note(name: string) {
  return screen.getByRole("button", { name })
}

test("默认贴出三张便利贴", () => {
  render(<StickyNoteBoard />)
  expect(note("先写标题")).toHaveStyle({ left: "24px", top: "28px" })
  expect(note("留白")).toBeInTheDocument()
  expect(note("明天再改")).toBeInTheDocument()
})

test("方向键立刻挪动便利贴并回调", () => {
  const onMove = vi.fn()
  render(<StickyNoteBoard onMove={onMove} />)
  fireEvent.keyDown(note("先写标题"), { key: "ArrowRight" })
  expect(onMove).toHaveBeenCalledWith("title", 48, 28)
  expect(note("先写标题")).toHaveStyle({ left: "48px" })
  expect(queue.size).toBe(0)
})

test("松手后惯性继续滑一段，停下时回调最终位置", () => {
  const onMove = vi.fn()
  render(<StickyNoteBoard onMove={onMove} />)
  const pad = note("留白")
  fireEvent.pointerDown(pad, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(pad, { clientX: 48, clientY: 8, pointerId: 1, timeStamp: 20 })
  fireEvent.pointerUp(pad, { clientX: 48, clientY: 8, pointerId: 1, timeStamp: 32 })
  expect(onMove).not.toHaveBeenCalled()
  pump(24)
  expect(onMove).toHaveBeenCalledTimes(1)
  const [id, x, y] = onMove.mock.calls[0] as [string, number, number]
  expect(id).toBe("space")
  expect(x).toBeGreaterThan(168 + 48)
  expect(y).toBeGreaterThan(76)
})

test("触屏拖动后同样带惯性", () => {
  const onMove = vi.fn()
  render(<StickyNoteBoard onMove={onMove} />)
  const pad = note("明天再改")
  fireEvent.pointerDown(pad, { button: 0, clientX: 0, clientY: 0, pointerId: 4, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(pad, { button: 0, clientX: 36, clientY: -12, pointerId: 4, pointerType: "touch", timeStamp: 30 })
  pump(24)
  expect(onMove).toHaveBeenCalledTimes(1)
  expect(onMove.mock.calls[0]?.[0]).toBe("later")
})

test("减弱动效时松手就停在落点，不倾斜，也不申请动画帧", () => {
  reduceMotion = true
  const onMove = vi.fn()
  render(<StickyNoteBoard onMove={onMove} />)
  expect(document.querySelector("[data-slot='sticky-note-board']")).toHaveAttribute("data-reduced", "true")
  const pad = note("先写标题")
  fireEvent.pointerDown(pad, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(pad, { clientX: 40, clientY: 10, pointerId: 1, timeStamp: 20 })
  fireEvent.pointerUp(pad, { clientX: 40, clientY: 10, pointerId: 1, timeStamp: 40 })
  expect(onMove).toHaveBeenCalledWith("title", 64, 38)
  expect(pad.style.transform).not.toContain("rotate")
  expect(queue.size).toBe(0)
})
