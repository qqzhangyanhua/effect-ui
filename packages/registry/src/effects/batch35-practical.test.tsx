// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ExpandableActionBar } from "./expandable-action-bar"
import { FaceRating } from "./face-rating"
import { FAQTabsCard } from "./faq-tabs-card"
import { FollowButton } from "./follow-button"
import { HologramText } from "./hologram-text"
import { InkMorphText } from "./ink-morph"
import { MorphButton } from "./async-morph-button"
import { NavListCard } from "./nav-list-card"
import { NotificationBell } from "./notification-bell"
import { OrbitalText } from "./orbital-text"
import { ScratchCard } from "./scratch-card"
import { ShareButton } from "./share-button"
import { SkeletonReveal } from "./skeleton-reveal"
import { TaskCheckbox } from "./task-checkbox"
import { TextStates } from "./text-states"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
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

const tabs = [
  { label: "通用", faqs: [{ question: "问一", answer: "答一" }] },
  { label: "账单", faqs: [{ question: "问二", answer: "答二" }] },
]

test("减弱动效时全息、墨迹和轨道保留名称", () => {
  reduceMotion = true
  render(
    <>
      <HologramText text="全息" />
      <InkMorphText text="墨迹" />
      <OrbitalText text="轨道" />
    </>,
  )
  expect(screen.getByRole("img", { name: "全息" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("img", { name: "墨迹" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("img", { name: "轨道" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("img", { name: "轨道" })).toHaveAttribute("aria-label", "轨道")
})

test("刮刮卡按 Enter 揭开并播报", () => {
  const onReveal = vi.fn()
  render(
    <ScratchCard onReveal={onReveal} revealAnnouncement="隐藏内容已显示">
      <span>优惠码</span>
    </ScratchCard>,
  )
  fireEvent.keyDown(screen.getByRole("button", { name: /刮开/ }), { key: "Enter" })
  expect(onReveal).toHaveBeenCalledTimes(1)
  expect(screen.getByText("隐藏内容已显示")).toBeInTheDocument()
  expect(screen.getByText("优惠码")).toBeInTheDocument()
})

test("骨架在加载时标记忙碌，减弱动效时文字直接替换", () => {
  reduceMotion = true
  const view = render(
    <SkeletonReveal loading skeleton={<span>占位</span>}>
      正文
    </SkeletonReveal>,
  )
  expect(view.container.querySelector("[data-slot='skeleton-reveal']")).toHaveAttribute("aria-busy", "true")
  view.rerender(
    <>
      <SkeletonReveal loading={false} skeleton={<span>占位</span>}>
        正文
      </SkeletonReveal>
      <TextStates text="已保存" />
    </>,
  )
  expect(screen.getByText("正文")).toBeInTheDocument()
  expect(screen.getByText("已保存")).toBeInTheDocument()
})

test("未减弱时状态文字先保留旧文案", () => {
  const view = render(<TextStates text="保存" />)
  view.rerender(<TextStates text="已保存" />)
  expect(screen.getByText("保存")).toBeInTheDocument()
  expect(screen.queryByText("已保存")).not.toBeInTheDocument()
})

test("铃铛播报未读数，任务勾选和关注可以切换", () => {
  render(
    <>
      <NotificationBell count={3} />
      <TaskCheckbox label="写说明" />
      <FollowButton followLabel="关注" unfollowLabel="取消关注" />
    </>,
  )
  expect(screen.getByRole("button", { name: "通知，3 条未读" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("checkbox"))
  expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true")
  const follow = screen.getByRole("button", { name: "关注" })
  fireEvent.click(follow)
  expect(follow).toHaveAttribute("aria-pressed", "true")
})

test("异步按钮完成后显示成功文字", async () => {
  render(<MorphButton onAction={async () => undefined}>保存</MorphButton>)
  fireEvent.click(screen.getByRole("button", { name: "保存" }))
  expect(await screen.findByRole("status")).toHaveTextContent("Done")
})

test("表情评分用方向键移动", () => {
  render(<FaceRating />)
  const first = screen.getByRole("radio", { name: /Rate 1/ })
  fireEvent.keyDown(first, { key: "ArrowRight" })
  fireEvent.keyDown(first, { key: "ArrowRight" })
  expect(screen.getByRole("radio", { name: /Rate 2/ })).toHaveAttribute("aria-checked", "true")
})

test("分享菜单复制链接", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<ShareButton copyValue="https://example.com" label="Share" />)
  fireEvent.click(screen.getByRole("button", { name: "Share" }))
  fireEvent.click(await screen.findByRole("menuitem", { name: "Copy link" }))
  expect(writeText).toHaveBeenCalledWith("https://example.com")
})

test("动作条、常见问题和导航可以操作", () => {
  const onAction = vi.fn()
  render(
    <>
      <ExpandableActionBar expandOnHover={false} expandOnFocus={false} items={[{ id: "save", label: "保存", icon: <span>记</span> }]} onAction={onAction} />
      <FAQTabsCard tabs={tabs} />
      <NavListCard title="规划" items={[{ label: "文档", href: "#docs" }]} />
    </>,
  )
  fireEvent.click(screen.getByRole("button", { name: "保存" }))
  expect(onAction).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole("tab", { name: "账单" }))
  expect(screen.getByText("问二")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "文档" })).toHaveAttribute("href", "#docs")
})
