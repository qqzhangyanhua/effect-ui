// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { createRef } from "react"
import { afterEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ConstellationLoader } from "./constellation-loader"
import { Cursor, CursorName } from "./cursor"
import { EmojiConfetti, type EmojiConfettiHandle } from "./emoji-confetti"
import { LabeledToggle } from "./labeled-toggle"
import { MiniCalendar, MiniCalendarDay, MiniCalendarDays, MiniCalendarNavigation } from "./mini-calendar"
import { Reel, ReelContent, ReelItemView, ReelNextButton, type ReelItem } from "./reel"
import { SkewedInfiniteScroll } from "./skewed-infinite-scroll"
import { Snippet, SnippetCopyButton, SnippetHeader, SnippetTabsContent, SnippetTabsList, SnippetTabsTrigger } from "./snippet"
import { SpinningCubeLoader } from "./spinning-cube-loader"
import { Status, StatusIndicator, StatusLabel } from "./status"
import { TextDrop } from "./text-drop"

let reduceMotion = false

afterEach(() => {
  cleanup()
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

const reels: ReelItem[] = [
  { id: "a", type: "image", src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E", duration: 3, title: "第一段" },
  { id: "b", type: "image", src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E", duration: 3, title: "第二段" },
]

test("减弱动效时滚动停住、文字直接出现、状态点不闪", () => {
  reduceMotion = true
  render(
    <div>
      <SkewedInfiniteScroll items={[{ id: "1", text: "夜航" }]} />
      <ConstellationLoader count={4} />
      <SpinningCubeLoader />
      <TextDrop text="夜航开始" />
      <Status status="online">
        <StatusIndicator />
        <StatusLabel />
      </Status>
    </div>,
  )

  const scroll = document.querySelector("[data-slot='skewed-infinite-scroll']")
  expect(scroll).toHaveAttribute("data-reduced", "true")
  expect(scroll?.querySelector("div")).toHaveStyle({ animationName: "none" })
  expect(document.querySelector("[data-slot='constellation-loader']")).toHaveAttribute("data-reduced", "true")
  expect(document.querySelector("[data-slot='spinning-cube-loader']")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("夜航开始")).toBeInTheDocument()
  expect(screen.getByText("在线")).toBeInTheDocument()
  expect(document.querySelector(".animate-ping")).toBeNull()
})

test("代码片段可以复制，迷你日历可以翻页，开关可以切换", async () => {
  reduceMotion = false
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
  render(
    <div>
      <Snippet defaultValue="pnpm">
        <SnippetHeader>
          <SnippetTabsList>
            <SnippetTabsTrigger value="pnpm">pnpm</SnippetTabsTrigger>
          </SnippetTabsList>
          <SnippetCopyButton value="pnpm add effect-ui" />
        </SnippetHeader>
        <SnippetTabsContent value="pnpm">pnpm add effect-ui</SnippetTabsContent>
      </Snippet>
      <MiniCalendar days={5} defaultStartDate={new Date(2026, 9, 22)} defaultValue={new Date(2026, 9, 22)}>
        <MiniCalendarNavigation direction="next" />
        <MiniCalendarDays>{(date) => <MiniCalendarDay date={date} />}</MiniCalendarDays>
      </MiniCalendar>
      <LabeledToggle initialToggleOn={false} />
    </div>,
  )

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "复制" }))
  })
  expect(writeText).toHaveBeenCalledWith("pnpm add effect-ui")
  expect(screen.getByRole("button", { name: "已复制" })).toBeInTheDocument()

  expect(screen.getByRole("button", { name: "Oct22" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "下一页" }))
  expect(screen.getByRole("button", { name: "Oct27" })).toBeInTheDocument()

  const toggle = screen.getByRole("switch")
  expect(toggle).toHaveAttribute("aria-checked", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
})

test("短视频可以切到下一段，emoji 可以从指定坐标发射", async () => {
  reduceMotion = true
  const handle = createRef<EmojiConfettiHandle>()
  render(
    <div>
      <Reel autoPlay={false} data={reels} defaultPlaying={false}>
        <ReelContent>
          {(item) => (
            <ReelItemView>
              <p>{item.title}</p>
            </ReelItemView>
          )}
        </ReelContent>
        <ReelNextButton />
      </Reel>
      <EmojiConfetti ref={handle}>放一串</EmojiConfetti>
      <Cursor>
        <CursorName>北窗</CursorName>
      </Cursor>
    </div>,
  )

  await act(async () => {
    await Promise.resolve()
  })
  expect(screen.getByText("第一段")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "下一段" }))
  expect(screen.getByText("第二段")).toBeInTheDocument()
  act(() => {
    handle.current?.fire(12, 18)
  })
  expect(screen.getByText("🎉")).toBeInTheDocument()
  expect(screen.getByText("北窗")).toBeInTheDocument()
})
