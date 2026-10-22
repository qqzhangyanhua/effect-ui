// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import Matter from "matter-js"

import { PhysicsDropzone } from "./physics-dropzone"

let reduceMotion = false
let now = 0
let rafId = 0
let created = 0
const queue = new Map<number, FrameRequestCallback>()

beforeEach(() => {
  reduceMotion = false
  now = 0
  rafId = 0
  created = 0
  queue.clear()
  const original = Matter.Engine.create
  vi.spyOn(Matter.Engine, "create").mockImplementation((options) => {
    created += 1
    return original.call(Matter.Engine, options)
  })
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
  vi.restoreAllMocks()
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
  const file = screen.getByRole("button", { name })
  fireEvent.pointerDown(file, { clientX: 0, clientY: 0, pointerId: 1, pointerType, timeStamp: 0 })
  fireEvent.pointerMove(file, { clientX: 8, clientY: 70, pointerId: 1, pointerType, timeStamp: 30 })
  fireEvent.pointerUp(file, { clientX: 8, clientY: 96, pointerId: 1, pointerType, timeStamp: 60 })
}

test("默认渲染三个文件，不读减弱动效时没有 data-reduced", () => {
  render(<PhysicsDropzone />)
  expect(screen.getByRole("button", { name: "简报.pdf" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "封面.png" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "笔记.md" })).toBeInTheDocument()
  expect(screen.getByRole("region", { name: "落点" })).toHaveTextContent("拖进这里，文件会落成一堆")
  expect(screen.queryByRole("progressbar")).toBeNull()
  expect(document.querySelector("[data-slot='physics-dropzone']")).not.toHaveAttribute("data-reduced")
  expect(created).toBe(0)
  expect(queue.size).toBe(0)
})

test("拖进落点后下落并走完进度，再回调", () => {
  const onDrop = vi.fn()
  render(<PhysicsDropzone onDrop={onDrop} />)
  dragIn("简报.pdf")
  expect(created).toBe(1)
  expect(document.querySelector("[data-slot='physics-dropzone']")).toHaveAttribute("data-live", "true")
  expect(screen.getByRole("progressbar", { name: "简报.pdf" })).toHaveAttribute("aria-valuenow", "0")
  expect(onDrop).not.toHaveBeenCalled()
  pump(24)
  expect(onDrop).toHaveBeenCalledWith("brief")
  expect(screen.getByRole("progressbar", { name: "简报.pdf" })).toHaveAttribute("aria-valuenow", "100")
  expect(document.querySelector("[data-pile='true']")).toHaveTextContent("简报.pdf")
  expect(document.querySelector("[data-settled='true']")).toBeTruthy()
})

test("拖得不够远时文件不进入落点", () => {
  const onDrop = vi.fn()
  render(<PhysicsDropzone onDrop={onDrop} />)
  const file = screen.getByRole("button", { name: "简报.pdf" })
  fireEvent.pointerDown(file, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(file, { clientX: 4, clientY: 8, pointerId: 1, timeStamp: 40 })
  pump(8)
  expect(onDrop).not.toHaveBeenCalled()
  expect(screen.getByRole("button", { name: "简报.pdf" })).toBeInTheDocument()
  expect(created).toBe(0)
  expect(queue.size).toBe(0)
})

test("方向键和回车都能把文件放进落点", () => {
  const onDrop = vi.fn()
  render(<PhysicsDropzone onDrop={onDrop} />)
  fireEvent.keyDown(screen.getByRole("button", { name: "简报.pdf" }), { key: "ArrowDown" })
  expect(screen.getByRole("progressbar", { name: "简报.pdf" })).toHaveAttribute("aria-valuenow", "0")
  pump(24)
  expect(onDrop).toHaveBeenCalledWith("brief")
  fireEvent.keyDown(screen.getByRole("button", { name: "封面.png" }), { key: "Enter" })
  pump(24)
  expect(onDrop).toHaveBeenCalledWith("shot")
  expect(screen.getAllByRole("progressbar")).toHaveLength(2)
})

test("触屏拖进落点后同样下落", () => {
  const onDrop = vi.fn()
  render(<PhysicsDropzone onDrop={onDrop} />)
  dragIn("笔记.md", "touch")
  pump(24)
  expect(onDrop).toHaveBeenCalledWith("notes")
  expect(screen.getByRole("progressbar", { name: "笔记.md" })).toHaveAttribute("aria-valuenow", "100")
})

test("减弱动效时文件直接出现在堆里，不创建引擎也不申请动画帧", () => {
  reduceMotion = true
  const onDrop = vi.fn()
  render(<PhysicsDropzone onDrop={onDrop} />)
  expect(document.querySelector("[data-slot='physics-dropzone']")).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(screen.getByRole("button", { name: "简报.pdf" }), { key: "Enter" })
  expect(onDrop).toHaveBeenCalledWith("brief")
  expect(screen.getByRole("progressbar", { name: "简报.pdf" })).toHaveAttribute("aria-valuenow", "100")
  expect(document.querySelector("[data-settled='true']")).toBeTruthy()
  expect(document.querySelector("[data-live='true']")).toBeNull()
  expect(created).toBe(0)
  expect(queue.size).toBe(0)
})
