// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { createRef } from "react"
import { expect, test, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AutosizeTextarea, type AutosizeTextAreaRef } from "./autosize-textarea"
import { BreathingText } from "./breathing-text"
import { DualRangeSlider } from "./dual-range-slider"
import { ElasticLine } from "./elastic-line"
import { HeadingWithAnchor } from "./heading-with-anchor"
import { Letter3DSwap } from "./letter-3d-swap"
import { LoadingButton } from "./loading-button"
import { MediaBetweenText } from "./media-between-text"
import { PixelTrail } from "./pixel-trail"
import { ProgressWithValue } from "./progress-with-value"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "./responsive-modal"
import { Screensaver } from "./screensaver"
import { TextCursorProximity } from "./text-cursor-proximity"
import { TextHighlighter } from "./text-highlighter"
import { VerticalCutReveal } from "./vertical-cut-reveal"

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
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
)
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))

const swatch = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

function slot(container: HTMLElement, name: string) {
  return container.querySelector(`[data-slot="${name}"]`)
}

test("减弱动效时拖尾、屏保、翻面、裁切和荧光笔停在标记上", async () => {
  reduceMotion = true
  const rect = () =>
    ({
      width: 80,
      height: 40,
      top: 0,
      left: 0,
      right: 80,
      bottom: 40,
      x: 0,
      y: 0,
      toJSON() {},
    }) as DOMRect
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(rect)

  const trail = render(<PixelTrail pixelSize={20} />)
  await act(async () => {
    await Promise.resolve()
  })
  const trailRoot = slot(trail.container, "pixel-trail")
  expect(trailRoot).toHaveAttribute("data-reduced", "true")
  fireEvent.mouseMove(trailRoot as Element, { clientX: 10, clientY: 10 })
  const pixel = trail.container.querySelector("[id$='-pixel-0-0']")
  expect(pixel).toBeTruthy()
  expect(pixel).not.toHaveStyle({ opacity: "1" })

  const containerRef = createRef<HTMLDivElement>()
  const bounce = render(
    <div ref={containerRef}>
      <Screensaver containerRef={containerRef}>停</Screensaver>
    </div>,
  )
  expect(slot(bounce.container, "screensaver")).toHaveAttribute("data-reduced", "true")

  const flip = render(<Letter3DSwap>翻</Letter3DSwap>)
  expect(slot(flip.container, "letter-3d-swap")).toHaveAttribute("data-reduced", "true")
  fireEvent.mouseEnter(slot(flip.container, "letter-3d-swap") as Element)
  expect(flip.container.querySelector(".letter-3d-swap-char-box-item")).toBeTruthy()

  const cut = render(<VerticalCutReveal>港口亮了</VerticalCutReveal>)
  expect(slot(cut.container, "vertical-cut-reveal")).toHaveAttribute("data-reduced", "true")
  expect(cut.container).toHaveTextContent("港口亮了")

  const mark = render(
    <TextHighlighter highlightColor="rgb(250, 204, 21)" triggerType="hover">
      荧光笔
    </TextHighlighter>,
  )
  const highlight = slot(mark.container, "text-highlighter")
  expect(highlight).toHaveAttribute("data-reduced", "true")
  expect(highlight?.querySelector("span")).toHaveStyle({ backgroundSize: "100% 100%" })

  vi.restoreAllMocks()
  reduceMotion = false
})

test("加载按钮在减弱动效时不旋转，进度和弹性线保持标记", () => {
  reduceMotion = true
  const button = render(<LoadingButton loading>保存</LoadingButton>)
  const node = screen.getByRole("button", { name: "保存" })
  expect(node).toBeDisabled()
  expect(node).toHaveAttribute("aria-busy", "true")
  expect(node.querySelector(".animate-spin")).toBeNull()
  expect(slot(button.container, "loading-button")).toHaveAttribute("data-reduced", "true")

  const bar = render(<ProgressWithValue value={40} />)
  expect(slot(bar.container, "progress-with-value")).toHaveAttribute("data-reduced", "true")
  expect(bar.container.querySelector(".transition-all")).toBeNull()
  expect(screen.getByText("40%")).toBeInTheDocument()

  const line = render(<ElasticLine />)
  expect(slot(line.container, "elastic-line")).toHaveAttribute("data-reduced", "true")
  expect(line.container.querySelector("path")).toBeTruthy()
  reduceMotion = false
})

test("文本框、双滑块、标题锚点和抽屉可以操作", async () => {
  reduceMotion = false
  const ref = createRef<AutosizeTextAreaRef>()
  render(<AutosizeTextarea defaultValue="夜航" ref={ref} />)
  expect(ref.current?.textArea).toBeInstanceOf(HTMLTextAreaElement)
  expect(ref.current?.textArea).toHaveAttribute("data-slot", "autosize-textarea")
  ref.current?.focus()
  expect(ref.current?.textArea).toHaveFocus()

  const range = render(<DualRangeSlider defaultValue={[10, 90]} label={(value) => value} max={100} min={0} />)
  expect(range.container.querySelectorAll('[role="slider"]')).toHaveLength(2)

  render(
    <HeadingWithAnchor anchor="north" variant="h2">
      北窗
    </HeadingWithAnchor>,
  )
  const link = screen.getByRole("link")
  expect(link.tagName).toBe("A")
  expect(link).toHaveAttribute("href", "#north")

  render(
    <ResponsiveModal>
      <ResponsiveModalTrigger>打开</ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalTitle>标题</ResponsiveModalTitle>
        抽屉内容
      </ResponsiveModalContent>
    </ResponsiveModal>,
  )
  fireEvent.click(screen.getByText("打开"))
  expect(await screen.findByText("抽屉内容")).toBeInTheDocument()
  expect(document.querySelector("[data-slot='responsive-modal']")).toBeTruthy()
})

test("靠近指针的字和呼吸字在普通动效下仍标出偏好", () => {
  reduceMotion = false
  const containerRef = createRef<HTMLDivElement>()
  const proximity = render(
    <div ref={containerRef}>
      <TextCursorProximity containerRef={containerRef} styles={{ scale: { from: 1, to: 2 } }}>
        北
      </TextCursorProximity>
    </div>,
  )
  expect(slot(proximity.container, "text-cursor-proximity")).toHaveAttribute("data-reduced", "false")

  const breath = render(
    <BreathingText fromFontVariationSettings="'wght' 400" toFontVariationSettings="'wght' 700">
      呼吸
    </BreathingText>,
  )
  expect(slot(breath.container, "breathing-text")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByText("呼吸")).toBeInTheDocument()

  const media = render(
    <MediaBetweenText alt="色块" firstText="北" mediaType="image" mediaUrl={swatch} secondText="窗" />,
  )
  expect(slot(media.container, "media-between-text")).toHaveAttribute("data-reduced", "false")
  expect(screen.getByRole("img", { name: "色块" })).toHaveAttribute("src", swatch)
})
