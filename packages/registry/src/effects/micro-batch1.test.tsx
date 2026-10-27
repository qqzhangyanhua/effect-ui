// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { RubberBandDrag } from "./rubber-band-drag"

let reduceMotion = false
const frames: FrameRequestCallback[] = []

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
  frames.length = 0
  HTMLElement.prototype.scrollTo = () => {}
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
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
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback)
    return frames.length
  })
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("拖动橡皮筋节点会离开静止点", () => {
  const originalCtm = SVGSVGElement.prototype.getScreenCTM
  const originalCapture = Element.prototype.setPointerCapture
  class FakePoint {
    x: number
    y: number
    constructor(x = 0, y = 0) {
      this.x = x
      this.y = y
    }
    matrixTransform() {
      return this
    }
  }
  vi.stubGlobal("DOMPoint", FakePoint)
  SVGSVGElement.prototype.getScreenCTM = function getScreenCTM() {
    return { inverse() { return this } } as unknown as DOMMatrix
  }
  Element.prototype.setPointerCapture = () => {}
  try {
    render(<RubberBandDrag />)
    const node = screen.getByRole("button", { name: "拖拽节点" })
    expect(node).toHaveAttribute("cx", "280")
    fireEvent.pointerDown(node, { clientX: 300, clientY: 160, pointerId: 1 })
    fireEvent.pointerMove(node, { clientX: 360, clientY: 200, pointerId: 1 })
    expect(node.getAttribute("cx")).not.toBe("280")
  } finally {
    SVGSVGElement.prototype.getScreenCTM = originalCtm
    Element.prototype.setPointerCapture = originalCapture
    vi.unstubAllGlobals()
  }
})

test("减弱动效时松开橡皮筋不再排动画帧", () => {
  reduceMotion = true
  render(<RubberBandDrag />)
  fireEvent.pointerUp(screen.getByRole("button", { name: "拖拽节点" }))
  expect(frames).toHaveLength(0)
})


