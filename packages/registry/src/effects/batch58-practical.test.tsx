// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { AgentFlow } from "./agent-flow"
import { AgentStep, AgentTimeline } from "./agent-timeline"
import { BlueprintGrid } from "./blueprint-grid"
import { InertiaGallery } from "./inertia-gallery"
import { LiquidMetaballs } from "./liquid-metaballs"
import { MagicInput } from "./magic-input"
import { ProgressFoldButton } from "./progress-fold-button"
import { ProgressiveCardReveal } from "./progressive-card-reveal"

import { StackBadge } from "./stack-badge"
import { StoreBadge } from "./store-badge"

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 800 })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 480 })
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 168 })
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 64 })
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

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback([{ target, contentRect: { x: 0, y: 0, width: 640, height: 360, top: 0, left: 0, bottom: 360, right: 640, toJSON() { return {} } } } as ResizeObserverEntry], this as unknown as ResizeObserver)
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
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

test("折叠按钮在加载时报告进度", () => {
  render(<ProgressFoldButton status="loading" progress={40}>折叠</ProgressFoldButton>)
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40")
})

test("魔法输入可以提交，蓝图和液团会挂上", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const onSubmit = vi.fn()
  render(<MagicInput aria-label="句子" submitLabel="提交" onSubmit={onSubmit} defaultValue="你好" />)
  await user.click(screen.getByRole("button", { name: "提交" }))
  expect(onSubmit).toHaveBeenCalledWith("你好")
  cleanup()

  const { container } = render(
    <div className="relative h-40">
      <BlueprintGrid />
      <LiquidMetaballs />
    </div>,
  )
  expect(container.querySelector("[data-slot=blueprint-grid]")).toBeTruthy()
  expect(container.querySelector("[data-slot=liquid-metaballs] svg")).toBeTruthy()
})

test("画廊可以用下一张", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  render(
    <InertiaGallery>
      <div>其一</div>
      <div>其二</div>
    </InertiaGallery>,
  )
  await user.click(screen.getByRole("button", { name: "Next" }))
  expect(screen.getByText("2 / 2")).toBeInTheDocument()
})

test("渐进卡片点击后切换，时间线可以展开", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const onActiveChange = vi.fn()
  render(
    <ProgressiveCardReveal activeIndex={0} onActiveChange={onActiveChange}>
      <ProgressiveCardReveal.Card>
        <ProgressiveCardReveal.CardCollapsed>第一张</ProgressiveCardReveal.CardCollapsed>
        <ProgressiveCardReveal.CardExpanded>展开一</ProgressiveCardReveal.CardExpanded>
      </ProgressiveCardReveal.Card>
      <ProgressiveCardReveal.Card>
        <ProgressiveCardReveal.CardCollapsed>第二张</ProgressiveCardReveal.CardCollapsed>
        <ProgressiveCardReveal.CardExpanded>展开二</ProgressiveCardReveal.CardExpanded>
      </ProgressiveCardReveal.Card>
    </ProgressiveCardReveal>,
  )
  await user.click(screen.getByRole("button", { name: "第二张" }))
  expect(onActiveChange).toHaveBeenCalledWith(1)
  cleanup()

  render(
    <AgentTimeline>
      <AgentStep title="读取" status="running">正文</AgentStep>
    </AgentTimeline>,
  )
  await user.click(screen.getByRole("button", { name: "读取" }))
  expect(screen.getByText("正文")).toBeInTheDocument()
})

test("流程图、徽章和商店锁可以操作", () => {
  render(
    <AgentFlow
      className="h-64"
      nodes={[{ id: "a", label: "起点", x: 40, y: 40 }]}
      edges={[]}
      fitView={false}
    />,
  )
  expect(screen.getByText("起点")).toBeInTheDocument()
  cleanup()

  render(<StackBadge items={["react"]} />)
  expect(screen.getByText("React")).toBeInTheDocument()
  cleanup()

  render(<StoreBadge store="app-store" href="#store" />)
  expect(screen.getByRole("link", { name: /App Store/ })).toHaveAttribute("href", "#store")
  expect(screen.queryByRole("img", { name: /QR/ })).not.toBeInTheDocument()
})
