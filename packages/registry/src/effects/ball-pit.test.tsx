// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import Matter from "matter-js"

import { BallPit } from "./ball-pit"

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

function pit() {
  return screen.getByRole("application", { name: "头像球池" })
}

test("默认渲染头像球，颜色跟随主题，不标记减弱动效", () => {
  render(<BallPit />)
  expect(screen.getByText("林")).toBeInTheDocument()
  expect(screen.getByText("赵")).toBeInTheDocument()
  expect(screen.getByText("陈")).toBeInTheDocument()
  expect(screen.getByText("吴")).toBeInTheDocument()
  expect(screen.getByText("何")).toBeInTheDocument()
  expect(screen.getByText("徐")).toBeInTheDocument()
  expect(screen.getByText("林")).toHaveStyle({ backgroundColor: "var(--primary)" })
  expect(document.querySelector("[data-slot='ball-pit']")).not.toHaveAttribute("data-reduced")
  expect(createSpy).toHaveBeenCalled()
})

test("几帧之后球体位置跟着刚体走", () => {
  render(<BallPit />)
  const ball = screen.getByText("林")
  expect(ball.style.transform).toBe("")
  pump(6)
  expect(ball.style.transform).toContain("translate")
})

test("指针靠近时把球拨开并回调", () => {
  const onNudge = vi.fn()
  render(<BallPit onNudge={onNudge} />)
  fireEvent.pointerMove(pit(), { clientX: 80, clientY: 128, pointerId: 1, pointerType: "mouse" })
  expect(onNudge).toHaveBeenCalledWith("lin")
})

test("方向键拨动球池里的第一颗球", () => {
  const onNudge = vi.fn()
  render(<BallPit onNudge={onNudge} />)
  fireEvent.keyDown(pit(), { key: "ArrowRight" })
  expect(onNudge).toHaveBeenCalledWith("lin")
})

test("触屏按下同样能拨开，不依赖悬停", () => {
  const onNudge = vi.fn()
  render(<BallPit onNudge={onNudge} />)
  fireEvent.pointerDown(pit(), { clientX: 80, clientY: 128, pointerId: 4, pointerType: "touch" })
  expect(onNudge).toHaveBeenCalledWith("lin")
})

test("减弱动效时球停在原位，不创建引擎也不申请动画帧", () => {
  reduceMotion = true
  const onNudge = vi.fn()
  render(<BallPit onNudge={onNudge} />)
  const root = document.querySelector("[data-slot='ball-pit']")
  const ball = screen.getByText("林")
  const before = ball.style.left
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).not.toHaveAttribute("data-physics")
  expect(ball.style.transform).toBe("")
  fireEvent.keyDown(pit(), { key: "ArrowRight" })
  fireEvent.pointerDown(pit(), { clientX: 80, clientY: 128, pointerId: 5, pointerType: "touch" })
  pump(4)
  expect(onNudge).toHaveBeenCalledWith("lin")
  expect(ball).toHaveAttribute("data-nudged", "true")
  expect(ball.style.left).not.toBe(before)
  expect(ball.style.transform).toBe("")
  expect(createSpy).not.toHaveBeenCalled()
  expect(queue.size).toBe(0)
})
