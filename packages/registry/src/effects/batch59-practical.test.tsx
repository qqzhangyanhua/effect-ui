// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { Award } from "./award"
import { BudgetCard } from "./budget-card"
import { CarouselNavigator } from "./carousel-navigator"
import { ContextualAiBar } from "./contextual-ai-bar"
import { EmojiSpreeChoiceChips } from "./emoji-spree-choice-chips"
import { FeatureTour } from "./feature-tour"
import { FrequencySelector } from "./frequency-selector"
import { InlineAction } from "./inline-action"
import { JournalNavigation } from "./journal-navigation"
import { LabeledProgressIndicator } from "./labeled-progress-indicator"
import { PredictiveText } from "./predictive-text"
import { QuickPaste } from "./quick-paste"
import { StatusPicker } from "./status-picker"
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

test("journal navigation moves to the next entry", async () => {
  render(
    <JournalNavigation
      entries={[
        { id: "a", day: 12, month: "十月", content: "清晨" },
        { id: "b", day: 13, month: "十月", content: "午后" },
      ]}
    />,
  )
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(document.querySelector("[data-slot=journal-navigation]")?.textContent).toContain("午后")
})

test("tooltip navbar opens from a press", async () => {
  render(<TooltipNavbar direction="right" items={[{ icon: <span>讯</span>, label: "Inbox", keys: ["I"] }]} />)
  const button = screen.getByRole("button", { name: "Inbox" })
  await user.click(button)
  expect(button).toHaveAttribute("aria-pressed", "true")
})

test("carousel navigator requests the next slide", async () => {
  const onIndexChange = vi.fn()
  render(<CarouselNavigator currentIndex={0} totalSlides={3} onIndexChange={onIndexChange} />)
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(onIndexChange).toHaveBeenCalledWith(1)
})

test("labeled progress exposes the fill", () => {
  render(<LabeledProgressIndicator labels={["整理", "写入"]} progress={40} />)
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
  expect(screen.getByText("整理")).toBeInTheDocument()
})

test("frequency selector confirms a new cadence", async () => {
  const onChange = vi.fn()
  render(<FrequencySelector value={{ type: "Daily" }} onChange={onChange} />)
  await user.click(screen.getByRole("button", { name: /Frequency/ }))
  await user.click(screen.getByRole("button", { name: "Weekly" }))
  await user.click(screen.getByRole("button", { name: "Confirm frequency" }))
  expect(onChange).toHaveBeenCalledWith({ type: "Weekly", subValue: "Sun" })
})

test("status picker selects an emoji", async () => {
  render(<StatusPicker items={[{ id: 1, emoji: "🎯", name: "专注" }]} />)
  await user.click(screen.getByRole("button", { name: "Status" }))
  await user.click(screen.getByRole("button", { name: "专注" }))
  expect(screen.getByRole("button", { name: /专注/ })).toBeInTheDocument()
})

test("quick paste turns input into a card", async () => {
  render(<QuickPaste onPaste={(value) => ({ name: value })} />)
  await user.type(screen.getByPlaceholderText("Email Address"), "周宁")
  await user.click(screen.getByRole("button", { name: "Paste" }))
  expect(screen.getByText("周宁")).toBeInTheDocument()
})

test("contextual bar reveals the prompt", async () => {
  render(<ContextualAiBar musicIcon={<span>乐</span>} sparkleIcon={<span>星</span>} />)
  await user.click(screen.getByRole("button", { name: "Refine with AI" }))
  expect(screen.getByPlaceholderText("Refine with AI")).toBeInTheDocument()
})

test("predictive text offers a completion", async () => {
  render(<PredictiveText />)
  await user.type(screen.getByPlaceholderText("Write a message"), "br")
  expect(screen.getByRole("button", { name: "brighter" })).toBeInTheDocument()
})

test("feature tour jumps to a step", async () => {
  render(
    <FeatureTour
      steps={[
        { id: "a", title: "标一笔", description: "先留下。", icon: <span>一</span> },
        { id: "b", title: "注释", description: "再改。", icon: <span>二</span> },
      ]}
      onClose={() => undefined}
    />,
  )
  await user.click(screen.getByRole("tab", { name: "Go to 注释" }))
  expect(screen.getByRole("heading", { name: "注释" })).toBeInTheDocument()
})

test("budget card opens the sample ledger", async () => {
  render(
    <BudgetCard
      month="July"
      totalBudget={100}
      spentAmount={40}
      breakdown={[{ label: "餐饮", amount: 40, color: "var(--chart-2)" }]}
    />,
  )
  await user.click(screen.getByRole("button", { name: "View Details" }))
  expect(screen.getByText("Whole Foods")).toBeInTheDocument()
})
