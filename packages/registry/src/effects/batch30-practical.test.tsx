// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { createRef } from "react"
import { expect, test, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Announcement, AnnouncementTag } from "./announcement"
import { Banner, BannerClose, BannerTitle } from "./banner"
import { Choicebox, ChoiceboxIndicator, ChoiceboxItem, ChoiceboxItemTitle } from "./choicebox"
import { CSSBox } from "./css-box"
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackNext,
  DialogStackTitle,
  DialogStackTrigger,
} from "./dialog-stack"
import { DragElements } from "./drag-elements"
import { GooeySvgFilter } from "./gooey-svg-filter"
import { Floating, FloatingElement } from "./parallax-floating"
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
      <Floating>
        <FloatingElement>浮</FloatingElement>
      </Floating>
      <PixelateSvgFilter id="pixel-test" size={8} />
      <GooeySvgFilter id="goo-test" strength={6} />
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
  expect(view.container.querySelector("[data-slot='parallax-floating']")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector("#pixel-test")).toBeTruthy()
  expect(view.container.querySelector("#goo-test")).toBeTruthy()
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

test("对话框下一步和卡片单选可以切换", async () => {
  render(
    <div>
      <DialogStack>
        <DialogStackTrigger>打开</DialogStackTrigger>
        <DialogStackBody>
          <DialogStackContent>
            <DialogStackTitle>第一步</DialogStackTitle>
            <DialogStackNext>下一步</DialogStackNext>
          </DialogStackContent>
          <DialogStackContent>
            <DialogStackTitle>第二步</DialogStackTitle>
          </DialogStackContent>
        </DialogStackBody>
      </DialogStack>
      <Choicebox defaultValue="night">
        <ChoiceboxItem id="night" value="night">
          <ChoiceboxItemTitle>夜航</ChoiceboxItemTitle>
          <ChoiceboxIndicator />
        </ChoiceboxItem>
        <ChoiceboxItem id="day" value="day">
          <ChoiceboxItemTitle>日航</ChoiceboxItemTitle>
          <ChoiceboxIndicator />
        </ChoiceboxItem>
      </Choicebox>
    </div>,
  )

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "打开" }))
  })
  expect(screen.getByText("第一步")).toBeInTheDocument()
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "下一步" }))
  })
  expect(screen.getByText("第二步")).toBeVisible()
  const day = screen.getByRole("radio", { name: "日航" })
  fireEvent.click(day)
  expect(day).toBeChecked()
})
