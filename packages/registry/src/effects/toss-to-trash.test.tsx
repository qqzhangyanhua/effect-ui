// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { TossToTrash } from "./toss-to-trash"

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

function row(name: string) {
  return screen.getByRole("button", { name })
}

test("默认有三条和垃圾桶", () => {
  render(<TossToTrash />)
  expect(row("旧稿")).toBeInTheDocument()
  expect(row("重复")).toBeInTheDocument()
  expect(row("过期")).toBeInTheDocument()
  expect(screen.getByLabelText("垃圾桶")).toBeInTheDocument()
})

test("向下拖过阈值后沿抛物线落入，结束时删除并回调", () => {
  const onDelete = vi.fn()
  render(<TossToTrash onDelete={onDelete} />)
  const item = row("旧稿")
  fireEvent.pointerDown(item, { clientX: 10, clientY: 10, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerMove(item, { clientX: 12, clientY: 100, pointerId: 1, timeStamp: 30 })
  fireEvent.pointerUp(item, { clientX: 12, clientY: 100, pointerId: 1, timeStamp: 40 })
  expect(onDelete).not.toHaveBeenCalled()
  expect(item.style.transform).toContain("translate")
  pump(24)
  expect(onDelete).toHaveBeenCalledWith("old")
  expect(screen.queryByRole("button", { name: "旧稿" })).toBeNull()
})

test("拖得不够远时条目回到原处", () => {
  const onDelete = vi.fn()
  render(<TossToTrash onDelete={onDelete} />)
  const item = row("重复")
  fireEvent.pointerDown(item, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(item, { clientX: 8, clientY: 20, pointerId: 1, timeStamp: 40 })
  pump(8)
  expect(onDelete).not.toHaveBeenCalled()
  expect(row("重复")).toBeInTheDocument()
  expect(queue.size).toBe(0)
})

test("Delete 键把焦点条目抛进垃圾桶", () => {
  const onDelete = vi.fn()
  render(<TossToTrash onDelete={onDelete} />)
  fireEvent.keyDown(row("过期"), { key: "Delete" })
  pump(24)
  expect(onDelete).toHaveBeenCalledWith("stale")
  expect(screen.queryByRole("button", { name: "过期" })).toBeNull()
})

test("触屏向下拖也可以扔", () => {
  const onDelete = vi.fn()
  render(<TossToTrash onDelete={onDelete} />)
  const item = row("旧稿")
  fireEvent.pointerDown(item, { button: 0, clientX: 0, clientY: 0, pointerId: 3, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(item, { button: 0, clientX: 4, clientY: 110, pointerId: 3, pointerType: "touch", timeStamp: 50 })
  pump(24)
  expect(onDelete).toHaveBeenCalledWith("old")
})

test("减弱动效时 Delete 立刻删除，并且不申请动画帧", () => {
  reduceMotion = true
  const onDelete = vi.fn()
  render(<TossToTrash onDelete={onDelete} />)
  expect(document.querySelector("[data-slot='toss-to-trash']")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(row("旧稿"), { key: "Backspace" })
  expect(onDelete).toHaveBeenCalledWith("old")
  expect(queue.size).toBe(0)
})
