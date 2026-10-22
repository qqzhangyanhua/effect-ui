// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { FolderStack } from "./folder-stack"

let reduceMotion = false
let coarse = false
let now = 0
let rafId = 0
const queue = new Map<number, FrameRequestCallback>()

beforeEach(() => {
  reduceMotion = false
  coarse = false
  now = 0
  rafId = 0
  queue.clear()
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("coarse") ? coarse : false,
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

function stack() {
  return screen.getByRole("group", { name: "文件夹堆" })
}

test("默认叠着三本文件夹，不读减弱动效时没有 data-reduced", () => {
  render(<FolderStack />)
  expect(screen.getByRole("button", { name: /草稿/ })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /评审/ })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /归档/ })).toBeInTheDocument()
  expect(stack()).not.toHaveAttribute("data-open")
  expect(stack()).not.toHaveAttribute("data-reduced")
  expect(queue.size).toBe(0)
})

test("细指针悬停展开，离开后收回", () => {
  const onOpenChange = vi.fn()
  render(<FolderStack onOpenChange={onOpenChange} />)
  fireEvent.pointerEnter(stack(), { pointerType: "mouse" })
  expect(stack()).toHaveAttribute("data-open", "true")
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(queue.size).toBe(0)
  fireEvent.pointerLeave(stack(), { pointerType: "mouse" })
  expect(stack()).not.toHaveAttribute("data-open")
  expect(onOpenChange).toHaveBeenCalledWith(false)
})

test("鼠标点击不会切换扇形", () => {
  render(<FolderStack />)
  fireEvent.pointerDown(stack(), { pointerType: "mouse" })
  fireEvent.click(stack())
  expect(stack()).not.toHaveAttribute("data-open")
})

test("触屏悬停不展开，点击才切换", () => {
  render(<FolderStack />)
  fireEvent.pointerEnter(stack(), { pointerType: "touch" })
  expect(stack()).not.toHaveAttribute("data-open")
  fireEvent.pointerDown(stack(), { pointerId: 2, pointerType: "touch" })
  fireEvent.click(stack())
  expect(stack()).toHaveAttribute("data-open", "true")
  fireEvent.pointerDown(stack(), { pointerId: 2, pointerType: "touch" })
  fireEvent.click(stack())
  expect(stack()).not.toHaveAttribute("data-open")
})

test("粗指针悬停不展开，点击才切换", () => {
  coarse = true
  render(<FolderStack />)
  fireEvent.pointerEnter(stack(), { pointerType: "mouse" })
  expect(stack()).not.toHaveAttribute("data-open")
  fireEvent.pointerDown(stack(), { pointerType: "mouse" })
  fireEvent.click(stack())
  expect(stack()).toHaveAttribute("data-open", "true")
})

test("回车切换扇形", () => {
  const onOpenChange = vi.fn()
  render(<FolderStack onOpenChange={onOpenChange} />)
  fireEvent.keyDown(stack(), { key: "Enter" })
  expect(stack()).toHaveAttribute("data-open", "true")
  expect(onOpenChange).toHaveBeenCalledWith(true)
  fireEvent.keyDown(stack(), { key: " " })
  expect(stack()).not.toHaveAttribute("data-open")
  expect(queue.size).toBe(0)
})

test("拖出文件夹后沿动画离开，再回调", () => {
  const onExtract = vi.fn()
  render(<FolderStack onExtract={onExtract} />)
  const folder = screen.getByRole("button", { name: /草稿/ })
  fireEvent.pointerDown(folder, { clientX: 0, clientY: 0, pointerId: 1, pointerType: "mouse", timeStamp: 0 })
  fireEvent.pointerMove(folder, { clientX: 90, clientY: 8, pointerId: 1, pointerType: "mouse", timeStamp: 40 })
  fireEvent.pointerUp(folder, { clientX: 120, clientY: 12, pointerId: 1, pointerType: "mouse", timeStamp: 80 })
  expect(onExtract).not.toHaveBeenCalled()
  expect(screen.queryByRole("button", { name: /草稿/ })).toBeNull()
  expect(document.querySelector("[data-leaving='true']")).toBeTruthy()
  pump(24)
  expect(onExtract).toHaveBeenCalledWith("draft")
  expect(document.querySelector("[data-leaving='true']")).toBeNull()
})

test("拖得不够远时文件夹还在", () => {
  const onExtract = vi.fn()
  render(<FolderStack onExtract={onExtract} />)
  const folder = screen.getByRole("button", { name: /评审/ })
  fireEvent.pointerDown(folder, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(folder, { clientX: 10, clientY: 4, pointerId: 1, timeStamp: 40 })
  pump(8)
  expect(onExtract).not.toHaveBeenCalled()
  expect(screen.getByRole("button", { name: /评审/ })).toBeInTheDocument()
  expect(queue.size).toBe(0)
})

test("触屏可以把文件夹拖出去", () => {
  const onExtract = vi.fn()
  render(<FolderStack onExtract={onExtract} />)
  const folder = screen.getByRole("button", { name: /归档/ })
  fireEvent.pointerDown(folder, { clientX: 0, clientY: 0, pointerId: 3, pointerType: "touch", timeStamp: 0 })
  fireEvent.pointerUp(folder, { clientX: 140, clientY: 6, pointerId: 3, pointerType: "touch", timeStamp: 50 })
  pump(24)
  expect(onExtract).toHaveBeenCalledWith("archive")
})

test("减弱动效时回车仍能切换，拖出后立刻拿走并且不申请动画帧", () => {
  reduceMotion = true
  const onExtract = vi.fn()
  render(<FolderStack onExtract={onExtract} />)
  expect(stack()).toHaveAttribute("data-reduced", "true")
  fireEvent.keyDown(stack(), { key: "Enter" })
  expect(stack()).toHaveAttribute("data-open", "true")
  expect(queue.size).toBe(0)
  const folder = screen.getByRole("button", { name: /草稿/ })
  fireEvent.pointerDown(folder, { clientX: 0, clientY: 0, pointerId: 1, timeStamp: 0 })
  fireEvent.pointerUp(folder, { clientX: 130, clientY: 0, pointerId: 1, timeStamp: 40 })
  expect(onExtract).toHaveBeenCalledWith("draft")
  expect(document.querySelector("[data-leaving='true']")).toBeNull()
  expect(queue.size).toBe(0)
})
