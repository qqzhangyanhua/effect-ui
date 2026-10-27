// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { GooeyButton } from "./gooey-button"
import { NeonButton } from "./neon-button"

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
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  Object.getPrototypeOf(path).getTotalLength = () => 120
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
})


test("霓虹按钮写出文字", () => {
  render(<NeonButton>Neon</NeonButton>)
  expect(screen.getByRole("button", { name: "Neon" })).toBeInTheDocument()
})

test("霓虹按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<NeonButton>Neon</NeonButton>)
  expect(screen.getByRole("button", { name: "Neon" })).toBeInTheDocument()
})


test("液态按钮写出文字", () => {
  render(<GooeyButton>Gooey</GooeyButton>)
  expect(screen.getByRole("button", { name: "Gooey" })).toBeInTheDocument()
})

test("液态按钮在减弱动效下仍写出文字", () => {
  reduceMotion = true
  render(<GooeyButton>Gooey</GooeyButton>)
  expect(screen.getByRole("button", { name: "Gooey" })).toBeInTheDocument()
})


