// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { InfiniteCanvasGallery } from "./infinite-canvas-gallery"
import { LoomThreadsMarquee } from "./loom-threads-marquee"


import { SortableList } from "./sortable-list"


let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } })
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})


test("无限画布显示第一块", () => {
  render(<InfiniteCanvasGallery />)
  expect(screen.getAllByText("01").length).toBeGreaterThan(0)
})

test("无限画布在减弱动效下仍显示第一块", () => {
  reduceMotion = true
  render(<InfiniteCanvasGallery />)
  expect(screen.getAllByText("01").length).toBeGreaterThan(0)
})
test("可排序列表显示第一项", () => {
  render(<SortableList />)
  expect(screen.getByText("起草说明")).toBeInTheDocument()
})

test("可排序列表在减弱动效下仍显示第一项", () => {
  reduceMotion = true
  render(<SortableList />)
  expect(screen.getByText("起草说明")).toBeInTheDocument()
})
test("织机按钮可以拆成丝线", () => {
  render(<LoomThreadsMarquee />)
  fireEvent.click(screen.getByRole("button", { name: "拆成丝线" }))
  expect(screen.getByRole("button", { name: "织回画面" })).toHaveAttribute("aria-pressed", "true")
})

test("织机在减弱动效下不挂画布", () => {
  reduceMotion = true
  const view = render(<LoomThreadsMarquee />)
  fireEvent.click(screen.getByRole("button", { name: "拆成丝线" }))
  expect(screen.getByRole("button", { name: "织回画面" })).toBeInTheDocument()
  expect(view.container.querySelector("canvas")).toBeNull()
})


