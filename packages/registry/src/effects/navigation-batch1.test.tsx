// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => undefined }),
}))

import { FloatingNavbar } from "./floating-navbar"
import { FlowingMenu } from "./flowing-menu"

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
  Element.prototype.scrollTo = () => {}
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("floating navbar shows its links", () => {
  render(
    <FloatingNavbar>
      <span>Home</span>
      <span>Docs</span>
    </FloatingNavbar>,
  )
  expect(screen.getByText("Home")).toBeInTheDocument()
  expect(screen.getByText("Docs")).toBeInTheDocument()
})

test("floating navbar keeps its links when motion is reduced", () => {
  reduceMotion = true
  render(
    <FloatingNavbar>
      <span>Home</span>
    </FloatingNavbar>,
  )
  expect(screen.getByText("Home")).toBeInTheDocument()
})


test("flowing menu lists its default rows", () => {
  render(<FlowingMenu />)
  expect(screen.getByText("Index")).toBeInTheDocument()
  expect(screen.getByText("Contact")).toBeInTheDocument()
})

test("flowing menu keeps its rows when motion is reduced", () => {
  reduceMotion = true
  render(<FlowingMenu />)
  expect(screen.getByText("Studio")).toBeInTheDocument()
  expect(screen.getByText("Archive")).toBeInTheDocument()
})


