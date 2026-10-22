// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import Matter from "matter-js"

import { TagJar } from "./tag-jar"

let reduceMotion = false
let now = 0
let rafId = 0
const queue = new Map<number, FrameRequestCallback>()
let createSpy: ReturnType<typeof vi.spyOn>

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
  createSpy = vi.spyOn(Matter.Engine, "create")
})

afterEach(() => {
  cleanup()
  createSpy.mockRestore()
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

function jar() {
  return screen.getByRole("application", { name: "标签罐" })
}

test("默认把标签放进罐子，颜色跟随主题，不标记减弱动效", () => {
  render(<TagJar />)
  expect(screen.getByText("设计")).toBeInTheDocument()
  expect(screen.getByText("动效")).toBeInTheDocument()
  expect(screen.getByText("字体")).toBeInTheDocument()
  expect(screen.getByText("配色")).toBeInTheDocument()
  expect(screen.getByText("设计")).toHaveStyle({ backgroundColor: "var(--primary)" })
  expect(document.querySelector("[data-slot='tag-jar']")).not.toHaveAttribute("data-reduced")
  expect(createSpy).toHaveBeenCalled()
})

test("落下几帧后标签离开出生点", () => {
  render(<TagJar />)
  const tag = screen.getByText("设计")
  expect(tag.style.transform).toBe("")
  pump(6)
  expect(tag.style.transform).toContain("translate")
  expect(tag.style.transform).toContain("rotate")
})

test("拖动罐子会摇晃并回调", () => {
  const onShake = vi.fn()
  render(<TagJar onShake={onShake} />)
  fireEvent.pointerDown(jar(), { clientX: 0, clientY: 0, pointerId: 1, pointerType: "mouse" })
  fireEvent.pointerMove(jar(), { clientX: 28, clientY: 6, pointerId: 1, pointerType: "mouse" })
  fireEvent.pointerUp(jar(), { clientX: 28, clientY: 6, pointerId: 1, pointerType: "mouse" })
  expect(onShake).toHaveBeenCalledTimes(1)
  expect(jar()).toHaveAttribute("data-shaken", "true")
})

test("方向键摇晃罐子并回调", () => {
  const onShake = vi.fn()
  render(<TagJar onShake={onShake} />)
  fireEvent.keyDown(jar(), { key: "ArrowRight" })
  expect(onShake).toHaveBeenCalledTimes(1)
  expect(jar()).toHaveAttribute("data-shaken", "true")
})

test("触屏拖动能摇晃，不依赖悬停", () => {
  const onShake = vi.fn()
  render(<TagJar onShake={onShake} />)
  fireEvent.pointerDown(jar(), { clientX: 4, clientY: 4, pointerId: 2, pointerType: "touch" })
  fireEvent.pointerUp(jar(), { clientX: 36, clientY: 8, pointerId: 2, pointerType: "touch" })
  expect(onShake).toHaveBeenCalledTimes(1)
})

test("减弱动效时标签静静堆着，不创建引擎也不申请动画帧", () => {
  reduceMotion = true
  const onShake = vi.fn()
  render(<TagJar onShake={onShake} />)
  const root = document.querySelector("[data-slot='tag-jar']")
  const tag = screen.getByText("设计")
  const before = tag.style.left
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).not.toHaveAttribute("data-physics")
  expect(tag.style.transform).toBe("")
  fireEvent.keyDown(jar(), { key: "ArrowRight" })
  pump(4)
  expect(onShake).toHaveBeenCalledTimes(1)
  expect(tag.style.left).not.toBe(before)
  expect(createSpy).not.toHaveBeenCalled()
  expect(queue.size).toBe(0)
})
