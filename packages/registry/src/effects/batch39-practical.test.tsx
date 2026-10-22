// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BlogCard } from "./blog-card"
import { BlurUnveilCard } from "./blur-unveil-card"
import { CollapsibleSideMenu } from "./collapsible-side-menu"
import { ContactForm } from "./contact-form"
import { DetailsList } from "./details-list"
import { GlitchSliceButton } from "./glitch-slice-button"
import { GlowWanderCard } from "./glow-wander-card"
import { NeonHoldCard } from "./neon-hold-card"
import { Alert, Badge, Checkbox, Input, NeoCard, Progress, Select, Tabs, Textarea } from "./neo-brutal-kit"
import { PinToggle } from "./pin-toggle"
import { SendArrowButton } from "./send-arrow-button"
import { StarFavoriteToggle } from "./star-favorite-toggle"
import { StatTrendCards } from "./stat-trend-cards"
import { TeamSection } from "./team-section"
import { TrashDeleteButton } from "./trash-delete-button"

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

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E"

test("减弱动效时按钮、卡片和区块保持可读", () => {
  reduceMotion = true
  render(
    <div>
      <GlitchSliceButton label="切片">切片</GlitchSliceButton>
      <SendArrowButton>发送</SendArrowButton>
      <TrashDeleteButton tooltip="删除" />
      <NeonHoldCard>按住</NeonHoldCard>
      <PinToggle aria-label="置顶" />
      <BlurUnveilCard caption="项目" value="3" />
      <GlowWanderCard />
      <StarFavoriteToggle />
      <DetailsList items={[{ term: "姓名", detail: "林昭" }]} />
      <BlogCard imageAlt="色块" imageUrl={pixel} title="一篇" />
      <NeoCard heading="卡片" />
      <ContactForm fields={[{ name: "name", label: "姓名" }]} />
      <TeamSection members={[{ name: "江衡", role: "设计", imageUrl: pixel, imageAlt: "肖像", href: "https://example.com", linkLabel: "主页" }]} />
      <StatTrendCards items={[{ label: "利润", value: "¥1", from: "¥2", delta: "1%", direction: "up" }]} />
      <CollapsibleSideMenu items={[{ id: "home", label: "总览", href: "#home", current: true }]} />
    </div>,
  )
  for (const slot of [
    "glitch-slice-button",
    "send-arrow-button",
    "trash-delete-button",
    "neon-hold-card",
    "pin-toggle",
    "blur-unveil-card",
    "glow-wander-card",
    "star-favorite-toggle",
    "details-list",
    "blog-card",
    "neo-brutal-kit",
    "contact-form",
    "team-section",
    "stat-trend-cards",
    "collapsible-side-menu",
  ]) {
    expect(document.querySelector(`[data-slot='${slot}']`)).toHaveAttribute("data-reduced", "true")
  }
  expect(document.querySelector("[data-slot='glitch-slice-button']")).toHaveAttribute("data-motion", "off")
  expect(document.querySelector("[data-slot='neon-hold-card']")).toHaveAttribute("data-motion", "off")
  expect(document.querySelector("[data-slot='glow-wander-card']")).toHaveAttribute("data-motion", "off")
})

test("图钉和星星用 aria-pressed 切换", () => {
  const onPin = vi.fn()
  const onStar = vi.fn()
  render(
    <div>
      <PinToggle aria-label="置顶" onPressedChange={onPin} />
      <StarFavoriteToggle onPressedChange={onStar} />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "置顶" }))
  fireEvent.click(screen.getByRole("button", { name: "收藏" }))
  expect(screen.getByRole("button", { name: "置顶" })).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByRole("button", { name: "收藏" })).toHaveAttribute("aria-pressed", "true")
  expect(onPin).toHaveBeenCalledWith(true)
  expect(onStar).toHaveBeenCalledWith(true)
})

test("详情列表、博客卡和涨跌徽章读出结构", () => {
  render(
    <div>
      <DetailsList items={[{ term: "姓名", detail: "林昭" }]} variant="bordered-striped" />
      <BlogCard href="#a" imageAlt="靠窗的色块" imageUrl={pixel} title="靠窗" variant="overlay" />
      <StatTrendCards
        items={[
          { label: "利润", value: "¥4", from: "¥2", delta: "10%", direction: "up" },
          { label: "回落", value: "¥2", from: "¥4", delta: "10%", direction: "down" },
        ]}
      />
    </div>,
  )
  expect(screen.getByText("姓名").tagName).toBe("DT")
  expect(document.querySelector("[data-slot='details-list']")).toHaveAttribute("data-variant", "bordered-striped")
  expect(screen.getByRole("img", { name: "靠窗的色块" })).toBeInTheDocument()
  expect(screen.getByText("上涨：")).toBeInTheDocument()
  expect(screen.getByText("下跌：")).toBeInTheDocument()
})

test("联系表单提交字段，侧栏折叠并标出当前项", () => {
  const onSubmit = vi.fn()
  render(
    <div>
      <ContactForm
        fields={[
          { name: "name", label: "姓名" },
          { name: "message", label: "留言", kind: "textarea" },
        ]}
        onSubmit={onSubmit}
        status="success"
        statusMessage="已收到"
        submitLabel="发送留言"
      />
      <CollapsibleSideMenu
        items={[
          { id: "general", label: "总览", href: "#general", current: true },
          { id: "teams", label: "团队", items: [{ id: "banned", label: "封禁用户", href: "#banned", badge: 3 }] },
        ]}
      />
      <Alert>说明文字</Alert>
      <Badge tone="error">错误</Badge>
      <Input label="邮箱" />
      <Select label="主唱" options={[{ value: "a", label: "林昭" }]} />
      <Textarea label="备注" />
      <Checkbox label="留下草稿" />
      <Progress value={25} />
      <Tabs tabs={[{ id: "one", label: "资料", content: "资料页" }, { id: "two", label: "账号", content: "账号页" }]} />
    </div>,
  )
  fireEvent.change(screen.getByLabelText("姓名"), { target: { value: "林昭" } })
  fireEvent.submit(screen.getByLabelText("姓名").closest("form")!)
  expect(onSubmit).toHaveBeenCalledWith({ name: "林昭", message: "" })
  expect(screen.getByRole("status")).toHaveTextContent("已收到")
  expect(screen.getByRole("link", { name: "总览" })).toHaveAttribute("aria-current", "page")
  fireEvent.click(screen.getByText("团队"))
  expect(screen.getByRole("link", { name: /封禁用户/ })).toHaveAttribute("href", "#banned")
  expect(screen.getByText("3")).toBeInTheDocument()
  expect(screen.getByRole("progressbar", { name: "进度" })).toHaveAttribute("aria-valuenow", "25")
  fireEvent.click(screen.getByRole("tab", { name: "账号" }))
  expect(screen.getByRole("tab", { name: "账号" })).toHaveAttribute("aria-selected", "true")
  expect(screen.getByText("账号页")).toBeInTheDocument()
})
