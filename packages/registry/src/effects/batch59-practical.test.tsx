// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { Award } from "./award"
import { EmojiSpreeChoiceChips } from "./emoji-spree-choice-chips"
import { InlineAction } from "./inline-action"
import { LabeledProgressIndicator } from "./labeled-progress-indicator"
import { TooltipNavbar } from "./tooltip-navbar"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 168 })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 64 })
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", { configurable: true, get: () => 0 })
  Object.defineProperty(HTMLElement.prototype, "offsetTop", { configurable: true, get: () => 0 })
})

afterEach(() => {
  cleanup()
})

class IntersectingObserver {
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
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
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
  onchange: null,
}))

const user = userEvent.setup({ pointerEventsCheck: 0 })

test("inline action runs the promise", async () => {
  const onAction = vi.fn().mockResolvedValue(undefined)
  render(<InlineAction label="草稿" icon={<span>存</span>} actionText="同步" onAction={onAction} />)
  await user.click(screen.getByRole("button", { name: "同步" }))
  expect(onAction).toHaveBeenCalledOnce()
  expect(document.querySelector("[data-slot=inline-action]")).toHaveAttribute("data-status", "success")
})

test("emoji chips count a selection", async () => {
  render(<EmojiSpreeChoiceChips interests={[{ id: "read", label: "阅读", emoji: "📚" }]} />)
  await user.click(screen.getByRole("button", { name: "📚阅读" }))
  expect(screen.getByText("1 Interests")).toBeInTheDocument()
})

test("award shows the title", () => {
  render(<Award title="金奖" subtitle="年度" />)
  expect(screen.getByRole("heading", { name: "金奖" })).toBeInTheDocument()
})


test("tooltip navbar opens from a press", async () => {
  render(<TooltipNavbar direction="right" items={[{ icon: <span>讯</span>, label: "Inbox", keys: ["I"] }]} />)
  const button = screen.getByRole("button", { name: "Inbox" })
  await user.click(button)
  expect(button).toHaveAttribute("aria-pressed", "true")
})


test("labeled progress exposes the fill", () => {
  render(<LabeledProgressIndicator labels={["整理", "写入"]} progress={40} />)
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
  expect(screen.getByText("整理")).toBeInTheDocument()
})

