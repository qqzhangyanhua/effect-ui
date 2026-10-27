// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  const progress = actual.motionValue(0)
  return {
    ...actual,
    useScroll: () => ({
      scrollX: progress,
      scrollY: progress,
      scrollXProgress: progress,
      scrollYProgress: progress,
    }),
  }
})

import { HyperspaceText } from "./hyperspace-text"

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
  HTMLMediaElement.prototype.play = () => Promise.resolve()
  HTMLMediaElement.prototype.pause = () => {}
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
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


test("超空间文字显示第一句，点下一段换句", () => {
  const view = render(<HyperspaceText />)
  expect(screen.getByText("把句子拆成光")).toBeInTheDocument()
  expect(view.container.querySelector("canvas")).not.toBeNull()
  fireEvent.click(screen.getByRole("button", { name: "下一段" }))
  expect(screen.getByText("再把它拼回来")).toBeInTheDocument()
})

test("超空间文字在减弱动效下直接显示句子", () => {
  reduceMotion = true
  const view = render(<HyperspaceText />)
  expect(screen.getAllByText("把句子拆成光").length).toBeGreaterThan(0)
  expect(view.container.querySelector("canvas")).toBeNull()
})


