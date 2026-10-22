// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import Matter from "matter-js"

import { CoinJar } from "./coin-jar"

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
  return screen.getByRole("application", { name: "投币罐" })
}

function stackedCoin() {
  return within(screen.getByRole("list", { name: "罐内" })).getByText("1元")
}

test("默认展示待投入的硬币，不标记减弱动效", () => {
  render(<CoinJar />)
  expect(screen.getByRole("list", { name: "待投入" })).toHaveTextContent("1元")
  expect(screen.getByText("还没有硬币")).toBeInTheDocument()
  expect(screen.getByText("1元")).toHaveStyle({ backgroundColor: "var(--primary)" })
  expect(document.querySelector("[data-slot='coin-jar']")).not.toHaveAttribute("data-reduced")
  expect(document.querySelector("[data-slot='coin-jar']")).toHaveAttribute("data-stacked", "0")
  expect(createSpy).toHaveBeenCalled()
})

test("点击把硬币投入罐中并回调", () => {
  const onDrop = vi.fn()
  render(<CoinJar onDrop={onDrop} />)
  fireEvent.pointerUp(jar(), { button: 0, clientX: 20, clientY: 40, pointerId: 1, pointerType: "mouse" })
  expect(onDrop).toHaveBeenCalledWith("one")
  expect(jar()).toHaveAttribute("data-stacked", "1")
  expect(screen.getByRole("list", { name: "罐内" })).toHaveTextContent("1元")
  expect(screen.getByRole("list", { name: "待投入" })).not.toHaveTextContent("1元")
  expect(screen.queryByText("还没有硬币")).toBeNull()
})

test("投入后几帧，硬币开始下落", () => {
  render(<CoinJar />)
  fireEvent.pointerUp(jar(), { button: 0, clientX: 12, clientY: 12, pointerId: 1, pointerType: "mouse" })
  const coin = stackedCoin()
  expect(coin.style.transform).toBe("")
  pump(6)
  expect(coin.style.transform).toContain("translate")
})

test("向下键投入一枚硬币", () => {
  const onDrop = vi.fn()
  render(<CoinJar onDrop={onDrop} />)
  fireEvent.keyDown(jar(), { key: "ArrowDown" })
  expect(onDrop).toHaveBeenCalledWith("one")
  expect(jar()).toHaveAttribute("data-stacked", "1")
})

test("触屏点击同样能投入，不依赖悬停", () => {
  const onDrop = vi.fn()
  render(<CoinJar onDrop={onDrop} />)
  fireEvent.pointerUp(jar(), { clientX: 16, clientY: 30, pointerId: 3, pointerType: "touch" })
  expect(onDrop).toHaveBeenCalledWith("one")
})

test("减弱动效时硬币直接叠上，不创建引擎也不申请动画帧", () => {
  reduceMotion = true
  const onDrop = vi.fn()
  render(<CoinJar onDrop={onDrop} />)
  const root = document.querySelector("[data-slot='coin-jar']")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).not.toHaveAttribute("data-physics")
  fireEvent.keyDown(jar(), { key: "Enter" })
  pump(4)
  expect(onDrop).toHaveBeenCalledWith("one")
  expect(stackedCoin().style.transform).toBe("")
  expect(createSpy).not.toHaveBeenCalled()
  expect(queue.size).toBe(0)
})
