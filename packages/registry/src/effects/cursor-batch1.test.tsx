// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true


import { RepetitionImageHover } from "./repetition-image-hover"


let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("pointer: fine"),
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
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("repetition hover stacks five echoes", () => {
  const { container } = render(<RepetitionImageHover />)
  const front = container.querySelector("[data-slot='repetition-image-hover'] > div:not([aria-hidden])")
  expect(front).toHaveTextContent("回声")
  expect(front).toHaveStyle({ opacity: "1" })
  expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(4)
})

test("repetition hover keeps one echo when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<RepetitionImageHover />)
  expect(screen.getAllByText("回声")).toHaveLength(1)
  expect(slot(container, "repetition-image-hover")).toBeInTheDocument()
})


