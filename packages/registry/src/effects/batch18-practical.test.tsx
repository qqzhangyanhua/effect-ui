// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { InvoicePreview } from "./invoice-preview"
import { MentionTextarea } from "./mention-textarea"
import { ShortcutsDialog, useHotkey } from "./shortcuts-dialog"
import { TimezoneClock } from "./timezone-clock"
import { PlanCompareTable } from "../sections/plan-compare-table"
import { PricingCalculator } from "../sections/pricing-calculator"
import { InboxSplitView } from "../templates/inbox-split-view"

vi.mock("@number-flow/react", () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}))

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

test("发票合计使用本地货币格式", () => {
  render(<InvoicePreview />)
  const total = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(3180)
  expect(screen.getByText(total)).toBeInTheDocument()
  expect(screen.getByText("INV-2026-014")).toBeInTheDocument()
})

test("问号打开快捷键面板", async () => {
  const user = userEvent.setup()
  render(<ShortcutsDialog />)
  await user.keyboard("?")
  expect(await screen.findByRole("dialog")).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: "快捷键" })).toBeInTheDocument()
})

function HotkeyProbe({ onFire }: { onFire: () => void }) {
  useHotkey("mod+k", onFire)
  return <div>probe</div>
}

test("useHotkey 在 mac 上听 meta", async () => {
  const user = userEvent.setup()
  const onFire = vi.fn()
  render(<HotkeyProbe onFire={onFire} />)
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgent)
  await user.keyboard(mac ? "{Meta>}k{/Meta}" : "{Control>}k{/Control}")
  expect(onFire).toHaveBeenCalled()
})

test("计价会跟着席位变化并提示推荐", async () => {
  const user = userEvent.setup()
  render(<PricingCalculator />)
  expect(screen.getByText(/推荐 团队/)).toBeInTheDocument()
  const seat = screen.getByRole("slider", { name: "席位" })
  seat.focus()
  await user.keyboard("{ArrowRight}")
  expect(screen.getByText(/推荐/)).toBeInTheDocument()
})

test("只看差异会藏起完全相同的行", async () => {
  const user = userEvent.setup()
  render(<PlanCompareTable />)
  expect(screen.getByRole("row", { name: /评论/ })).toBeInTheDocument()
  await user.click(screen.getByRole("checkbox", { name: "只看差异" }))
  expect(screen.queryByRole("row", { name: /评论/ })).not.toBeInTheDocument()
  expect(screen.getByRole("row", { name: /席位/ })).toBeInTheDocument()
})

test("输入 @ 可以插入提及", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<MentionTextarea onValueChange={onValueChange} />)
  await user.type(screen.getByRole("textbox", { name: "提到某人或话题" }), "@林")
  await user.click(await screen.findByRole("option", { name: "@林夏" }))
  expect(onValueChange).toHaveBeenCalled()
  const last = onValueChange.mock.calls.at(-1)?.[0] as { text: string; mentions: { label: string }[] }
  expect(last.text).toContain("@林夏")
  expect(last.mentions.some((item) => item.label === "林夏")).toBe(true)
})

test("j 和 k 在收件箱里移动", async () => {
  const user = userEvent.setup()
  render(<InboxSplitView />)
  expect(screen.getByRole("heading", { name: "北窗的光" })).toBeInTheDocument()
  await user.keyboard("j")
  expect(screen.getByRole("heading", { name: "样张" })).toBeInTheDocument()
  await user.keyboard("k")
  expect(screen.getByRole("heading", { name: "北窗的光" })).toBeInTheDocument()
})

test("时钟按传入时间显示上海", () => {
  render(<TimezoneClock now={Date.parse("2026-10-20T02:00:00Z")} />)
  expect(screen.getByRole("img", { name: /上海 10:00:00/ })).toBeInTheDocument()
  expect(screen.getAllByText("白天").length).toBeGreaterThan(0)
})
