// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { NeoStarShapes } from "./neo-star-shapes"
import { SquiggleArrow } from "./squiggle-arrow"

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











test("手绘箭头第一支向右，另外两支保持原样", () => {
  const view = render(
    <div>
      <SquiggleArrow direction="right" label="波浪箭头" variant="wavy" />
      <SquiggleArrow direction="up" variant="bouncy" />
      <SquiggleArrow direction="left" variant="smooth" />
    </div>,
  )
  const arrows = view.container.querySelectorAll("[data-slot=squiggle-arrow]")
  expect(arrows).toHaveLength(3)
  expect(arrows[0]).toHaveAttribute("data-direction", "right")
  expect(arrows[0]).toHaveAttribute("data-variant", "wavy")
  expect(arrows[0]).toHaveAttribute("aria-label", "波浪箭头")
  expect(arrows[1]).toHaveAttribute("data-direction", "up")
  expect(arrows[2]).toHaveAttribute("data-direction", "left")
  expect(arrows[0]).toHaveAttribute("data-reduced", "false")
})

test("手绘箭头在减弱动效下仍读出名称", () => {
  reduceMotion = true
  render(<SquiggleArrow direction="right" label="波浪箭头" variant="wavy" />)
  expect(screen.getByRole("img", { name: "波浪箭头" })).toHaveAttribute("data-reduced", "true")
})



test("星星形状画出预览的三颗", () => {
  const view = render(
    <div>
      <NeoStarShapes color="#05e17a" shape={1} size={72} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={19} size={72} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={32} size={72} stroke="#111111" strokeWidth={3} />
    </div>,
  )
  const stars = view.container.querySelectorAll("[data-slot=neo-star-shapes]")
  expect(stars).toHaveLength(3)
  expect(stars[0]).toHaveAttribute("data-shape", "1")
  expect(stars[0]).toHaveAttribute("width", "72")
  expect(stars[1]).toHaveAttribute("data-shape", "19")
  expect(stars[2]).toHaveAttribute("data-shape", "32")
  expect(stars[0]).toHaveAttribute("data-reduced", "false")
})

test("星星形状在减弱动效下仍保留编号", () => {
  reduceMotion = true
  const view = render(<NeoStarShapes color="#05e17a" shape={1} size={72} stroke="#111111" strokeWidth={3} />)
  const root = slot(view.container, "neo-star-shapes")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-shape", "1")
})
