// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ActiveSessionsList } from "./active-sessions-list"
import { AnimatedSubscribeButton } from "./animated-subscribe-button"
import { DiaTextReveal } from "./dia-text-reveal"
import { GlyphMatrix } from "./glyph-matrix"

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", ObserverStub)
vi.stubGlobal("ResizeObserver", ObserverStub)

Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, value: 480 })
Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, value: 720 })
Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 })
Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 720 })
HTMLElement.prototype.getBoundingClientRect = () =>
  ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 720,
    bottom: 480,
    width: 720,
    height: 480,
    toJSON() {
      return {}
    },
  }) as DOMRect
document.elementFromPoint = () => document.body

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }),
})

afterEach(() => {
  cleanup()
})

test("字符点阵和斜向揭示会渲染文字", () => {
  render(
    <>
      <GlyphMatrix text="北窗" />
      <DiaTextReveal text="斜向扫过" />
    </>,
  )
  expect(screen.getByLabelText("字符点阵 北窗")).toBeInTheDocument()
  expect(screen.getByText("斜")).toBeInTheDocument()
})

test("订阅按钮受控并设置 aria-pressed", async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<AnimatedSubscribeButton subscribed={false} onChange={onChange} />)
  await user.click(screen.getByRole("button", { name: "Subscribe" }))
  expect(onChange).toHaveBeenCalledWith(true)
  expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false")
})

test("会话登出需要确认，确认后行消失", async () => {
  const user = userEvent.setup()
  render(
    <ActiveSessionsList
      sessions={[
        { id: "here", device: "desktop", browser: "Chrome", os: "macOS", city: "上海", lastActive: new Date().toISOString(), current: true },
        { id: "phone", device: "mobile", browser: "Safari", os: "iOS", city: "杭州", lastActive: new Date(Date.now() - 60_000).toISOString() },
      ]}
    />,
  )
  expect(screen.getByText("当前设备")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "登出" }))
  await user.click(screen.getByRole("button", { name: "确认登出" }))
  expect(screen.queryByText("杭州")).not.toBeInTheDocument()
})
