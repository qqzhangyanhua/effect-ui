// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ApiKeyManager } from "./api-key-manager"
import { HyperspaceText } from "./hyperspace-text"
import { LenticularCard } from "./lenticular-card"
import { TeamMembersTable } from "./team-members-table"
import { UptimeBars } from "./uptime-bars"
import { UsageMeter } from "./usage-meter"
import { HelpCenterIndex } from "../sections/help-center-index"
import { IntegrationsDirectory } from "../sections/integrations-directory"
import { StatusPage } from "../templates/status-page"

vi.mock("@number-flow/react", () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}))

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

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }),
})

afterEach(() => {
  cleanup()
})

test("光栅卡按倾斜角显示当前画面", () => {
  render(<LenticularCard />)
  expect(screen.getByRole("button", { name: "光栅卡，当前 海湾" })).toBeInTheDocument()
})

test("超空间文字按钮切到下一段", async () => {
  const user = userEvent.setup()
  render(<HyperspaceText />)
  expect(screen.getByText("把句子拆成光")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "下一段" }))
  expect(screen.getByText("再把它拼回来")).toBeInTheDocument()
})

test("可用率条可折叠并显示百分比", async () => {
  const user = userEvent.setup()
  render(<UptimeBars />)
  const toggle = screen.getByRole("button", { name: "接口" })
  expect(toggle).toHaveAttribute("aria-expanded", "true")
  expect(screen.getAllByText(/\d+\.\d{2}%/).length).toBeGreaterThan(0)
  await user.click(toggle)
  expect(toggle).toHaveAttribute("aria-expanded", "false")
  expect(screen.queryByRole("button", { name: /接口 2026-/ })).not.toBeInTheDocument()
})

test("状态页汇总横幅、折线和公告", () => {
  render(<StatusPage />)
  expect(screen.getByText("所有系统运行正常")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "响应时间折线" })).toBeInTheDocument()
  expect(screen.getByText("接口响应变慢")).toBeInTheDocument()
  expect(screen.getByText("重大故障")).toBeInTheDocument()
})

test("集成目录按分类筛选并展开更多", async () => {
  const user = userEvent.setup()
  render(<IntegrationsDirectory />)
  expect(screen.queryByText("灰杯子")).not.toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "查看更多" }))
  expect(screen.getByText("灰杯子")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "沟通" }))
  expect(screen.getByText("夜航邮件")).toBeInTheDocument()
  expect(screen.queryByText("北窗表单")).not.toBeInTheDocument()
})

test("新密钥只显示一次，确认后才吊销", async () => {
  const user = userEvent.setup()
  const onCreate = vi.fn(async () => ({
    id: "fresh",
    name: "夜航",
    masked: "sk_live_••••91",
    secret: "sk_live_north_91",
    scopes: ["读取"],
    lastUsed: "从未",
    createdAt: "2026-10-21",
  }))
  const onRevoke = vi.fn()
  render(
    <ApiKeyManager
      keys={[{ id: "old", name: "旧钥匙", masked: "sk_test_••••02", scopes: ["读取"], lastUsed: "昨天", createdAt: "2026-01-01" }]}
      onCreate={onCreate}
      onRevoke={onRevoke}
    />,
  )
  await user.click(screen.getByRole("button", { name: "创建密钥" }))
  await user.type(screen.getByRole("textbox", { name: "密钥名称" }), "夜航")
  await user.click(screen.getByRole("button", { name: "生成" }))
  expect(await screen.findByText("sk_live_north_91")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Close" }))
  expect(screen.queryByText("sk_live_north_91")).not.toBeInTheDocument()
  expect(screen.getByText("sk_live_••••91")).toBeInTheDocument()
  await user.click(screen.getAllByRole("button", { name: "吊销" })[0]!)
  await user.click(screen.getByRole("button", { name: "确认吊销" }))
  expect(onRevoke).toHaveBeenCalledWith("old")
  expect(screen.queryByText("旧钥匙")).not.toBeInTheDocument()
})

test("用量超过八成变黄，超过额度变红", () => {
  render(<UsageMeter />)
  expect(screen.getByRole("meter", { name: "页面访问" })).toHaveAttribute("data-tone", "warn")
  expect(screen.getByRole("meter", { name: "席位" })).toHaveAttribute("data-tone", "over")
  expect(screen.getByText("8600")).toBeInTheDocument()
  expect(screen.getByText("重置于 2026-11-01")).toBeInTheDocument()
})

test("成员表可搜索，重发邀请进入倒计时", async () => {
  const user = userEvent.setup()
  render(<TeamMembersTable cooldown={12} />)
  await user.type(screen.getByRole("textbox", { name: "搜索成员" }), "周宁")
  expect(screen.queryByText("林夏")).not.toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "重发邀请" }))
  expect(screen.getByRole("button", { name: "12s" })).toBeDisabled()
})

test("帮助中心搜索高亮并提示剩余篇数", async () => {
  const user = userEvent.setup()
  render(<HelpCenterIndex />)
  expect(screen.getByText("还有 2 篇 →")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "搜索帮助" }), "快捷键")
  expect(screen.getByRole("mark")).toHaveTextContent("快捷键")
  expect(screen.queryByRole("heading", { name: "编辑与发布" })).not.toBeInTheDocument()
  expect(screen.getByRole("button", { name: "编辑与发布" })).toBeInTheDocument()
})
