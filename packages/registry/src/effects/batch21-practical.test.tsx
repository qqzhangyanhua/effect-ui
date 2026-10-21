// @vitest-environment jsdom

import { useState } from "react"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ActiveSessionsList } from "./active-sessions-list"
import { AnimatedSubscribeButton } from "./animated-subscribe-button"
import { AuditLogTable, type AuditEvent } from "./audit-log-table"
import { DataExportDialog } from "./data-export-dialog"
import { DiaTextReveal } from "./dia-text-reveal"
import { GlyphMatrix } from "./glyph-matrix"
import { NotificationPreferences, notificationChannels, type NotificationMatrix } from "./notification-preferences"
import { TwoFactorSetup } from "./two-factor-setup"

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

const events: AuditEvent[] = [
  {
    id: "a",
    time: "2026-10-02T08:00:00.000Z",
    actor: { name: "林夏" },
    action: "删除",
    target: "北窗",
    ip: "10.0.0.8",
    details: { note: "north-window" },
  },
  {
    id: "b",
    time: "2026-10-18T08:00:00.000Z",
    actor: { name: "周宁" },
    action: "登录",
    target: "南门",
    ip: "10.0.0.9",
    details: { note: "south" },
  },
]

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

test("审计日志可筛选并展开 JSON，新事件高亮", async () => {
  const user = userEvent.setup()
  const { rerender } = render(<AuditLogTable events={events} />)
  await user.selectOptions(screen.getByLabelText("按动作筛选"), "删除")
  expect(screen.queryByText("南门")).not.toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: /北窗/ }))
  expect(screen.getByText(/north-window/)).toBeInTheDocument()
  rerender(
    <AuditLogTable
      events={[
        {
          id: "c",
          time: "2026-10-21T08:00:00.000Z",
          actor: { name: "林夏" },
          action: "删除",
          target: "新事件",
          ip: "10.1.1.8",
          details: { fresh: true },
        },
        ...events,
      ]}
    />,
  )
  expect(screen.getByRole("button", { name: /新事件/ })).toHaveAttribute("data-fresh", "true")
})

test("通知偏好改动后出现保存条，撤销会还原", async () => {
  const user = userEvent.setup()
  const initial: NotificationMatrix = {
    "sign-in": { email: false, "in-app": false, push: false, slack: false },
  }
  function Harness() {
    const [value, setValue] = useState(initial)
    return (
      <NotificationPreferences
        groups={[{ id: "account", label: "账户", events: [{ id: "sign-in", label: "新的登录" }] }]}
        value={value}
        onChange={setValue}
      />
    )
  }
  render(<Harness />)
  expect(notificationChannels).toHaveLength(4)
  await user.click(screen.getByRole("switch", { name: "新的登录 邮件" }))
  expect(screen.getByRole("button", { name: "保存更改" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "撤销" }))
  await waitFor(() => {
    expect(screen.queryByRole("button", { name: "保存更改" })).not.toBeInTheDocument()
  })
})

test("导出对话框完成后给出下载", async () => {
  const user = userEvent.setup()
  render(
    <DataExportDialog
      onExport={async () => new Blob(["ok"], { type: "text/csv" })}
    />,
  )
  await user.click(screen.getByRole("button", { name: "导出数据" }))
  await user.click(screen.getByRole("button", { name: "开始导出" }))
  expect(await screen.findByRole("link", { name: "下载" })).toBeInTheDocument()
})

test("两步验证错误时提示，恢复码确认后才能完成", async () => {
  const user = userEvent.setup()
  const onVerify = vi.fn(async () => false)
  const onComplete = vi.fn()
  render(
    <TwoFactorSetup
      qrSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
      secret="NORTH-WINDOW-91"
      recoveryCodes={["4qog-gxfx", "yajc-2zkq"]}
      onVerify={onVerify}
      onComplete={onComplete}
    />,
  )
  expect(screen.getByText("NORTH-WINDOW-91")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "下一步" }))
  const input = screen.getByRole("textbox")
  await user.click(input)
  await user.type(input, "000000")
  expect(onVerify).toHaveBeenCalled()
  expect(screen.getByText("验证码不正确")).toBeInTheDocument()
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
