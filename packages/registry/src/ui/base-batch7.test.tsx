// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { HeroScrollZoom } from "../sections/hero-scroll-zoom"
import { SectionHorizontalScroll } from "../sections/section-horizontal-scroll"
import { AnchorPopover } from "./anchor-popover"
import { PlaceholderVanishInput } from "../effects/placeholder-vanish-input"
import { ShuffleGridHero } from "../effects/shuffle-grid-hero"
import { CookieConsent } from "../effects/cookie-consent"
import { DiffViewer } from "../effects/diff-viewer"
import { JsonViewer } from "../effects/json-viewer"
import { HeatmapCalendar } from "../effects/heatmap-calendar"
import { ResourceSearchHero } from "../effects/resource-search-hero"

beforeEach(() => {
  window.localStorage.clear()
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.unstubAllGlobals()
})


test("hero scroll zoom shows the default title", () => {
  render(<HeroScrollZoom />)
  expect(screen.getByText("全屏画面收成圆角窗口")).toBeInTheDocument()
})

test("horizontal scroll shows the three chapters", () => {
  render(<SectionHorizontalScroll />)
  expect(screen.getByRole("heading", { name: "起势" })).toBeInTheDocument()
  expect(screen.getByText("先把画面撑满一屏。")).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: "收束" })).toBeInTheDocument()
})


test("anchor popover opens its note", async () => {
  const user = userEvent.setup()
  render(<AnchorPopover />)
  await user.click(screen.getByRole("button", { name: "打开说明" }))
  expect(screen.getByText("优先用 CSS anchor 定位，不够放就翻到另一侧。")).toBeInTheDocument()
})

test("placeholder vanish input submits the typed text", async () => {
  const user = userEvent.setup()
  render(<PlaceholderVanishInput />)
  await user.type(screen.getByRole("textbox", { name: "搜索" }), "lens")
  await user.click(screen.getByRole("button", { name: "提交" }))
  expect(screen.getByText("已提交「lens」")).toBeInTheDocument()
})

test("shuffle grid hero shows the title and first tile", () => {
  render(<ShuffleGridHero />)
  expect(screen.getByRole("heading", { name: "版面自己换位" })).toBeInTheDocument()
  expect(screen.getByText("01")).toBeInTheDocument()
  expect(screen.getByText("08")).toBeInTheDocument()
})

test("cookie consent saves an accept-all choice", async () => {
  const user = userEvent.setup()
  render(<CookieConsent />)
  expect(screen.getByRole("dialog", { name: "Cookie 偏好" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "全部接受" }))
  expect(screen.getByText("偏好已保存")).toBeInTheDocument()
  expect(screen.getByText("分析 开启 · 营销 开启")).toBeInTheDocument()
})


test("diff viewer switches to the unified view", async () => {
  const user = userEvent.setup()
  render(<DiffViewer />)
  const unified = screen.getByRole("button", { name: "合并" })
  await user.click(unified)
  expect(unified).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByRole("button", { name: "并排" })).toHaveAttribute("aria-pressed", "false")
})

test("json viewer shows the sample row count", () => {
  render(<JsonViewer />)
  expect(screen.getByRole("textbox", { name: "搜索" })).toHaveAttribute("placeholder", "路径或值")
  expect(screen.getByText(/\d+ 行/)).toBeInTheDocument()
})

test("heatmap calendar shows the default year", () => {
  render(<HeatmapCalendar />)
  expect(screen.getByText("2026")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /2026-01-01/ })).toBeInTheDocument()
})

test("resource search hero filters cards by the query", async () => {
  const user = userEvent.setup()
  render(<ResourceSearchHero />)
  expect(screen.getByRole("heading", { name: "找一个主题" })).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: "信号墙" })).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "搜索主题" }), "透镜")
  expect(screen.getByRole("heading", { name: "方形透镜" })).toBeInTheDocument()
  expect(screen.queryByRole("heading", { name: "信号墙" })).not.toBeInTheDocument()
})
