// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Announcement } from "./announcement"
import { BookmarkBurstToggle } from "./bookmark-burst-toggle"
import { CheckCrossSwitch } from "./check-cross-switch"
import { EmojiConfetti } from "./emoji-confetti"
import { GitHubStarsAnimation } from "./github-stars-animation"
import { LockToggle } from "./lock-toggle"
import { Pill, PillIndicator } from "./pill"
import { PinToggle } from "./pin-toggle"
import { PlusShareBurst } from "./plus-share-burst"
import { ProgressWithValue } from "./progress-with-value"
import { SlideToggle } from "./slide-toggle"
import { StarFavoriteToggle } from "./star-favorite-toggle"
import { StarRating } from "./star-rating"
import { Status, StatusIndicator, StatusLabel } from "./status"
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from "./ticker"

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
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot=${name}]`)
  expect(node).toBeTruthy()
  return node as HTMLElement
}

const face = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

const stars = (
  <GitHubStarsAnimation
    repo="effect-ui"
    starCount={1280}
    stargazers={[{ avatar_url: face, html_url: "https://github.com/north", login: "north" }]}
  />
)

function countText(text: string) {
  return text.replace(/[^\d]/g, "") === "1280"
}

test("星标在给出数字时不请求网络", async () => {
  const fetchSpy = vi.spyOn(globalThis, "fetch")
  const view = render(stars)
  expect(fetchSpy).not.toHaveBeenCalled()
  expect(screen.getByRole("link", { name: "north's GitHub profile" })).toBeInTheDocument()
  expect(await screen.findByText(countText, {}, { timeout: 3000 })).toBeInTheDocument()
  expect(slot(view.container, "github-stars-animation")).toHaveAttribute("data-reduced", "false")
  fetchSpy.mockRestore()
})

test("星标在减弱动效时直接显示终值", async () => {
  reduceMotion = true
  const view = render(stars)
  expect(slot(view.container, "github-stars-animation")).toHaveAttribute("data-reduced", "true")
  expect(await screen.findByText(countText)).toBeInTheDocument()
})

test("进度条显示当前百分比", () => {
  const view = render(<ProgressWithValue value={64} />)
  expect(slot(view.container, "progress-with-value")).toHaveTextContent("64%")
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "64")
})

test("进度条在减弱动效时仍显示百分比", () => {
  reduceMotion = true
  const view = render(<ProgressWithValue value={64} />)
  expect(slot(view.container, "progress-with-value")).toHaveAttribute("data-reduced", "true")
  expect(view.container).toHaveTextContent("64%")
})

test("公告渲染标题", () => {
  const view = render(<Announcement themed>夜航窗口已打开</Announcement>)
  expect(slot(view.container, "announcement")).toHaveTextContent("夜航窗口已打开")
})

test("公告在减弱动效时仍渲染标题", () => {
  reduceMotion = true
  const view = render(<Announcement themed>夜航窗口已打开</Announcement>)
  expect(slot(view.container, "announcement")).toHaveAttribute("data-reduced", "true")
  expect(view.container).toHaveTextContent("夜航窗口已打开")
})

test("胶囊在脉冲时画出外圈", () => {
  const view = render(
    <Pill>
      <PillIndicator pulse />
      在航
    </Pill>,
  )
  expect(slot(view.container, "pill")).toHaveTextContent("在航")
  expect(view.container.querySelector(".animate-ping")).toBeTruthy()
})

test("胶囊在减弱动效时不再脉冲", () => {
  reduceMotion = true
  const view = render(
    <Pill>
      <PillIndicator pulse />
      在航
    </Pill>,
  )
  expect(view.container.querySelector("[data-reduced]")).toHaveAttribute("data-reduced", "true")
  expect(view.container.querySelector(".animate-ping")).toBeNull()
  expect(view.container).toHaveTextContent("在航")
})

test("行情显示价格和百分比", () => {
  render(
    <Ticker currency="USD" locale="en-US">
      <TickerSymbol symbol="nwin" />
      <TickerPrice price={128.4} />
      <TickerPriceChange change={2.35} isPercent />
    </Ticker>,
  )
  expect(screen.getByText("NWIN")).toBeInTheDocument()
  expect(screen.getByText("$128.40")).toBeInTheDocument()
  expect(screen.getByText("2.35%")).toBeInTheDocument()
})

test("行情在减弱动效时仍显示价格", () => {
  reduceMotion = true
  const view = render(
    <Ticker currency="USD" locale="en-US">
      <TickerSymbol symbol="nwin" />
      <TickerPrice price={128.4} />
      <TickerPriceChange change={2.35} isPercent />
    </Ticker>,
  )
  expect(slot(view.container, "ticker")).toHaveTextContent("$128.40")
})

test("点击后弹出一个 emoji", async () => {
  const view = render(<EmojiConfetti>放一串</EmojiConfetti>)
  fireEvent.click(screen.getByRole("button", { name: "放一串" }))
  expect(await screen.findByText("🎉")).toBeInTheDocument()
  expect(slot(view.container, "emoji-confetti")).toHaveAttribute("data-reduced", "false")
})

test("emoji 在减弱动效时仍弹出一个", async () => {
  reduceMotion = true
  const view = render(<EmojiConfetti>放一串</EmojiConfetti>)
  expect(slot(view.container, "emoji-confetti")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "放一串" }))
  expect(await screen.findByText("🎉")).toBeInTheDocument()
})

test("服务状态显示在线并脉冲", () => {
  const view = render(
    <Status status="online">
      <StatusIndicator />
      <StatusLabel />
    </Status>,
  )
  expect(slot(view.container, "status")).toHaveAttribute("data-status", "online")
  expect(screen.getByText("在线")).toBeInTheDocument()
  expect(view.container.querySelector(".animate-ping")).toBeTruthy()
})

test("服务状态在减弱动效时不再脉冲", () => {
  reduceMotion = true
  const view = render(
    <Status status="online">
      <StatusIndicator />
      <StatusLabel />
    </Status>,
  )
  expect(view.container.querySelector("[data-reduced]")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("在线")).toBeInTheDocument()
  expect(view.container.querySelector(".animate-ping")).toBeNull()
})

test("滑动开关能打开", () => {
  render(<SlideToggle offLabel="关" onLabel="开" />)
  const toggle = screen.getByRole("switch")
  expect(toggle).toHaveAttribute("aria-checked", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
  expect(toggle).toHaveTextContent("开")
})

test("滑动开关在减弱动效时仍能打开", () => {
  reduceMotion = true
  const view = render(<SlideToggle offLabel="关" onLabel="开" />)
  expect(slot(view.container, "slide-toggle")).toHaveAttribute("data-reduced", "true")
  const toggle = screen.getByRole("switch")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
})

test("对勾开关能打开", () => {
  render(<CheckCrossSwitch />)
  const toggle = screen.getByRole("switch", { name: "开关" })
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
})

test("对勾开关在减弱动效时仍能打开", () => {
  reduceMotion = true
  const view = render(<CheckCrossSwitch />)
  expect(slot(view.container, "check-cross-switch")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("switch", { name: "开关" }))
  expect(screen.getByRole("switch", { name: "开关" })).toHaveAttribute("aria-checked", "true")
})

test("分享按钮能选中一项", () => {
  const onSelect = vi.fn()
  const view = render(<PlusShareBurst items={[{ icon: <span>机</span>, label: "相机", onSelect }]} />)
  fireEvent.click(screen.getByRole("button", { name: "分享" }))
  expect(slot(view.container, "plus-share-burst")).toHaveAttribute("data-open", "true")
  fireEvent.click(screen.getByRole("button", { name: "相机" }))
  expect(onSelect).toHaveBeenCalledOnce()
})

test("分享按钮在减弱动效时仍能选中一项", () => {
  reduceMotion = true
  const onSelect = vi.fn()
  const view = render(<PlusShareBurst items={[{ icon: <span>机</span>, label: "相机", onSelect }]} />)
  expect(slot(view.container, "plus-share-burst")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "分享" }))
  fireEvent.click(screen.getByRole("button", { name: "相机" }))
  expect(onSelect).toHaveBeenCalledOnce()
})

test("星级评分能选中 4 星", () => {
  render(<StarRating />)
  fireEvent.click(screen.getByRole("radio", { name: "4 星" }))
  expect(screen.getByRole("radio", { name: "4 星" })).toHaveAttribute("aria-checked", "true")
})

test("星级评分在减弱动效时仍能选中 4 星", () => {
  reduceMotion = true
  const view = render(<StarRating />)
  expect(slot(view.container, "star-rating")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("radio", { name: "4 星" }))
  expect(screen.getByRole("radio", { name: "4 星" })).toHaveAttribute("aria-checked", "true")
})

test("大头针能按下", () => {
  render(<PinToggle aria-label="置顶" />)
  const pin = screen.getByRole("button", { name: "置顶" })
  fireEvent.click(pin)
  expect(pin).toHaveAttribute("aria-pressed", "true")
})

test("大头针在减弱动效时仍能按下", () => {
  reduceMotion = true
  const view = render(<PinToggle aria-label="置顶" />)
  expect(slot(view.container, "pin-toggle")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "置顶" }))
  expect(screen.getByRole("button", { name: "置顶" })).toHaveAttribute("aria-pressed", "true")
})

test("收藏星能按下", () => {
  render(<StarFavoriteToggle />)
  const star = screen.getByRole("button", { name: "收藏" })
  fireEvent.click(star)
  expect(star).toHaveAttribute("aria-pressed", "true")
})

test("收藏星在减弱动效时仍能按下", () => {
  reduceMotion = true
  const view = render(<StarFavoriteToggle />)
  expect(slot(view.container, "star-favorite-toggle")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "收藏" }))
  expect(screen.getByRole("button", { name: "收藏" })).toHaveAttribute("aria-pressed", "true")
})

test("书签能勾选", () => {
  render(<BookmarkBurstToggle aria-label="收藏" />)
  const mark = screen.getByRole("checkbox", { name: "收藏" })
  fireEvent.click(mark)
  expect(mark).toBeChecked()
})

test("书签在减弱动效时仍能勾选", () => {
  reduceMotion = true
  const view = render(<BookmarkBurstToggle aria-label="收藏" />)
  expect(slot(view.container, "bookmark-burst-toggle")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("checkbox", { name: "收藏" }))
  expect(screen.getByRole("checkbox", { name: "收藏" })).toBeChecked()
})

test("锁能锁上", () => {
  render(<LockToggle />)
  fireEvent.click(screen.getByRole("button", { name: "未锁定" }))
  expect(screen.getByRole("button", { name: "已锁定" })).toHaveAttribute("aria-pressed", "true")
})

test("锁在减弱动效时仍能锁上", () => {
  reduceMotion = true
  const view = render(<LockToggle />)
  expect(slot(view.container, "lock-toggle")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "未锁定" }))
  expect(screen.getByRole("button", { name: "已锁定" })).toHaveAttribute("aria-pressed", "true")
})
