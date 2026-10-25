// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AuroraCurtain } from "./aurora-curtain"
import { DurationPicker } from "./duration-picker"
import { ExposureSlider } from "./exposure-slider"
import { GravityStars } from "./gravity-stars"
import { InteractiveImageSelector } from "./interactive-image-selector"
import { LiquidMetal } from "./liquid-metal"
import { MagneticField } from "./magnetic-field"
import { RansomNote } from "./ransom-note"
import { Scrubber } from "./scrubber"

import { SwitchboardCard } from "./switchboard-card"
import { TimeMachineStack } from "./time-machine-stack"


let reduceMotion = false

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
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("hover") ? false : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
)
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))

const swatch = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

function slot(container: HTMLElement, name: string) {
  return container.querySelector(`[data-slot=${name}]`)
}

test("减弱动效时极光、星星和金属停在标记上", () => {
  reduceMotion = true
  const aurora = render(
    <AuroraCurtain>
      <span>夜</span>
    </AuroraCurtain>,
  )
  expect(slot(aurora.container, "aurora-curtain")).toHaveAttribute("data-reduced", "true")
  cleanup()

  const stars = render(
    <GravityStars>
      <span>星</span>
    </GravityStars>,
  )
  expect(slot(stars.container, "gravity-stars")).toHaveAttribute("data-reduced", "true")
  cleanup()

  const metal = render(
    <LiquidMetal>
      <span>金</span>
    </LiquidMetal>,
  )
  expect(slot(metal.container, "liquid-metal")).toHaveAttribute("data-reduced", "true")
  cleanup()
  reduceMotion = false
})

test("时长、擦洗和图片选择能改状态", () => {
  reduceMotion = false
  render(<DurationPicker defaultValue={60} />)
  const minutes = screen.getByRole("spinbutton", { name: "minute" })
  fireEvent.keyDown(minutes, { key: "ArrowUp" })
  expect(minutes).toHaveAttribute("aria-valuenow", "2")
  cleanup()

  const scrubber = render(<Scrubber defaultValue={2} label="光圈" max={8} min={1} />)
  expect(slot(scrubber.container, "scrubber")).toHaveTextContent("光圈")
  cleanup()

  render(
    <InteractiveImageSelector
      images={[
        { id: 1, src: swatch },
        { id: 2, src: swatch },
      ]}
      selectable
    />,
  )
  fireEvent.click(screen.getByRole("img", { name: "Gallery item 1" }))
  expect(screen.getByText("1 selected")).toBeInTheDocument()
  cleanup()
})

test("其余 SmoothUI 组件都挂上槽位", () => {
  reduceMotion = false
  const field = render(
    <MagneticField>
      <span data-magnetic="">点</span>
    </MagneticField>,
  )
  expect(slot(field.container, "magnetic-field")).toHaveTextContent("点")
  cleanup()

  const note = render(<RansomNote text="北窗" />)
  expect(slot(note.container, "ransom-note")).toHaveTextContent("北窗")
  cleanup()

  const exposure = render(<ExposureSlider defaultValue={0} />)
  expect(slot(exposure.container, "exposure-slider")).toBeTruthy()
  cleanup()

  const board = render(<SwitchboardCard subtitle="灯还在。" title="交换台" />)
  expect(slot(board.container, "switchboard-card")).toHaveTextContent("交换台")
  cleanup()

  const stack = render(
    <TimeMachineStack items={[{ id: "one", content: <span>黎明</span> }]} />,
  )
  expect(slot(stack.container, "time-machine-stack")).toHaveTextContent("黎明")
  cleanup()
})
