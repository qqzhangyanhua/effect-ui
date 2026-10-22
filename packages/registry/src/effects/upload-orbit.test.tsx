// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { UploadOrbit } from "./upload-orbit"

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

function action(name: string) {
  return screen.getByRole("button", { name })
}

test("默认停在准备上传，不绕圈也不标减弱动效", () => {
  render(<UploadOrbit />)
  expect(screen.getByText("需求.pdf")).toBeInTheDocument()
  expect(screen.getByText("草图.png")).toBeInTheDocument()
  expect(screen.getByText("备注.txt")).toBeInTheDocument()
  expect(screen.getByText("准备上传")).toBeInTheDocument()
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "ready")
  expect(document.querySelector("[data-slot='upload-orbit']")).not.toHaveAttribute("data-reduced")
  expect(frameRequests).toBe(0)
})

test("指针开始上传后文件离开待命位置，完成后再排成一行并回调", () => {
  const onComplete = vi.fn()
  render(<UploadOrbit onComplete={onComplete} />)
  const before = document.querySelector("[data-file='brief']")?.getAttribute("style")
  fireEvent.pointerUp(action("开始上传"), { button: 0, pointerId: 1, pointerType: "mouse" })
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "orbit")
  expect(onComplete).not.toHaveBeenCalled()
  pump(3)
  expect(document.querySelector("[data-file='brief']")?.getAttribute("style")).not.toEqual(before)
  fireEvent.pointerUp(action("完成上传"), { button: 0, pointerId: 1, pointerType: "mouse" })
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "settle")
  pump(60)
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "row")
  expect(screen.getByText("文件已排成一行")).toBeInTheDocument()
  expect(queue.size).toBe(0)
})

test("回车可以开始并完成上传", () => {
  const onComplete = vi.fn()
  render(<UploadOrbit onComplete={onComplete} />)
  fireEvent.keyDown(action("开始上传"), { key: "Enter" })
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "orbit")
  fireEvent.keyDown(action("完成上传"), { key: " " })
  pump(60)
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(action("已完成")).toBeDisabled()
})

test("触屏点按同样可以开始并完成，不依赖悬停", () => {
  const onComplete = vi.fn()
  render(<UploadOrbit onComplete={onComplete} />)
  fireEvent.pointerUp(action("开始上传"), { button: 0, pointerId: 2, pointerType: "touch" })
  expect(document.querySelector("[data-slot='upload-orbit']")).toHaveAttribute("data-layout", "orbit")
  fireEvent.pointerUp(action("完成上传"), { button: 0, pointerId: 2, pointerType: "touch" })
  pump(60)
  expect(onComplete).toHaveBeenCalledTimes(1)
})

test("减弱动效时文件直接排成一行，完成不申请动画帧", () => {
  reduceMotion = true
  const onComplete = vi.fn()
  render(<UploadOrbit onComplete={onComplete} />)
  const root = document.querySelector("[data-slot='upload-orbit']")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-layout", "row")
  expect(screen.getByText("文件已排成一行")).toBeInTheDocument()
  fireEvent.keyDown(action("完成上传"), { key: "Enter" })
  fireEvent.pointerUp(action("已完成"), { button: 0, pointerId: 3, pointerType: "touch" })
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(frameRequests).toBe(0)
  expect(queue.size).toBe(0)
})
