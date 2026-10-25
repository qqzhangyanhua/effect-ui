// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BarList } from "./bar-list"
import { EcoModeButton } from "./eco-mode-button"
import { HoverAttentionButton } from "./hover-attention-button"
import { MorphingShapesLoader } from "./morphing-shapes-loader"
import { NeonGlowLoader } from "./neon-glow-loader"
import { RotatingCompleteButton } from "./rotating-complete-button"
import { StitchesButton } from "./stitches-button"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

class IntersectingObserver {
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
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
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

test("减弱动效时色块停住，节能按钮直接切换", () => {
  reduceMotion = true
  render(
    <div>
      <MorphingShapesLoader />
      <NeonGlowLoader />
      <EcoModeButton />
    </div>,
  )
  expect(screen.getByText("节能关").closest("[data-slot=eco-mode-button]")).toHaveAttribute("data-reduced", "true")
  expect(document.querySelector("[data-slot=morphing-shapes-loader]")).toHaveAttribute("data-reduced", "true")
  expect(document.querySelector("[data-slot=neon-glow-loader]")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByText("节能关"))
  expect(screen.getByText("节能开")).toBeInTheDocument()
})

test("完成按钮和排行可以操作", () => {
  render(
    <div>
      <RotatingCompleteButton duration={0} />
      <BarList
        data={[
          { name: "夜航", value: 10 },
          { name: "灯塔", value: 4 },
        ]}
        onValueChange={() => {}}
      />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "标为完成" }))
  expect(screen.getByText("完成 ✓")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "灯塔" })).toBeInTheDocument()
})

test("缝线按钮和注意力按钮都在", () => {
  render(
    <div>
      <StitchesButton>缝线</StitchesButton>
      <HoverAttentionButton effect="shake">摇一下</HoverAttentionButton>
    </div>,
  )
  expect(screen.getByRole("button", { name: "缝线" })).toHaveAttribute("data-slot", "stitches-button")
  expect(screen.getByRole("button", { name: "摇一下" })).toHaveAttribute("data-effect", "shake")
})
