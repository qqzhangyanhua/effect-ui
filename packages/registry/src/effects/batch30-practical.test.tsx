// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { createRef } from "react"
import { expect, test, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Announcement, AnnouncementTag } from "./announcement"
import { Banner, BannerClose, BannerTitle } from "./banner"
import { Choicebox, ChoiceboxIndicator, ChoiceboxItem, ChoiceboxItemTitle } from "./choicebox"
import { CSSBox } from "./css-box"
import { DragElements } from "./drag-elements"


import { Pill, PillIndicator } from "./pill"
import { PixelateSvgFilter } from "./pixelate-svg-filter"
import { RelativeTime, RelativeTimeZone, RelativeTimeZoneLabel } from "./relative-time"
import { ScrollAndSwapText } from "./scroll-and-swap-text"
import { Ticker, TickerPrice, TickerSymbol } from "./ticker"
import { UnderlineToBackground } from "./underline-to-background"
import { AnimatedGradient } from "./animated-gradient-with-svg"

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

test("减弱动效时盒子、拖拽、滚动字和滤镜保持静止标记", () => {
  reduceMotion = true
  const containerRef = createRef<HTMLDivElement>()
  const view = render(
    <div>
      <CSSBox depth={40} height={40} width={40} />
      <DragElements>
        <span>贴纸</span>
      </DragElements>
      <div ref={containerRef}>
        <ScrollAndSwapText containerRef={containerRef}>港口亮了</ScrollAndSwapText>
      </div>
      <UnderlineToBackground>航线</UnderlineToBackground>
      <PixelateSvgFilter id="pixel-test" size={8} />
      <AnimatedGradient colors={["#111", "#222"]} />
      <Pill>
        <PillIndicator pulse />
      </Pill>
    </div>,
  )

  expect(view.container.querySelector("[data-slot='scroll-and-swap-text']")).toHaveTextContent("港口亮了")
  expect(view.container.querySelector("[data-slot='scroll-and-swap-text']")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector("[data-slot='css-box']")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector("[data-slot='drag-elements']")).toHaveAttribute("data-momentum", "false")
  expect(view.container.querySelector("[data-slot='underline-to-background']")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector("#pixel-test")).toBeTruthy()
  expect(view.container.querySelector("[data-slot='animated-gradient-with-svg'] svg")).toHaveStyle({ animationName: "none" })
  expect(view.container.querySelector(".animate-ping")).toBeNull()
  view.unmount()
  reduceMotion = false
})

test("公告、横幅、胶囊、时钟和行情能渲染", () => {
  reduceMotion = false
  const onClose = vi.fn()
  render(
    <div>
      <Announcement>
        <AnnouncementTag>新</AnnouncementTag>
      </Announcement>
      <Banner onClose={onClose}>
        <BannerTitle>提醒</BannerTitle>
        <BannerClose />
      </Banner>
      <RelativeTime time={new Date("2026-01-02T03:04:05Z")}>
        <RelativeTimeZone zone="UTC">
          <RelativeTimeZoneLabel>UTC</RelativeTimeZoneLabel>
        </RelativeTimeZone>
      </RelativeTime>
      <Ticker>
        <TickerSymbol symbol="nwin" />
        <TickerPrice price={12} />
      </Ticker>
    </div>,
  )

  expect(screen.getByText("新")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "关闭" }))
  expect(onClose).toHaveBeenCalled()
  expect(screen.queryByText("提醒")).not.toBeInTheDocument()
  expect(screen.getByText("UTC")).toBeInTheDocument()
  expect(screen.getByText("NWIN")).toBeInTheDocument()
  expect(screen.getByText("$12.00")).toBeInTheDocument()
})

test("卡片单选可以切换", () => {
  render(
    <Choicebox defaultValue="night">
      <ChoiceboxItem id="night" value="night">
        <ChoiceboxItemTitle>夜航</ChoiceboxItemTitle>
        <ChoiceboxIndicator />
      </ChoiceboxItem>
      <ChoiceboxItem id="day" value="day">
        <ChoiceboxItemTitle>日航</ChoiceboxItemTitle>
        <ChoiceboxIndicator />
      </ChoiceboxItem>
    </Choicebox>,
  )

  const day = screen.getByRole("radio", { name: "日航" })
  fireEvent.click(day)
  expect(day).toBeChecked()
})
