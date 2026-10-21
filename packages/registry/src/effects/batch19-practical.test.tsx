// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { CartDrawer } from "./cart-drawer"
import { CouponInput } from "./coupon-input"
import { CreditCardForm } from "./credit-card-form"
import { RadialGauge } from "./radial-gauge"
import { GanttTimeline } from "../sections/gantt-timeline"
import { OrgChart } from "../sections/org-chart"

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

test("卡号按四位分段并通过 Luhn", async () => {
  const user = userEvent.setup()
  render(<CreditCardForm />)
  await user.type(screen.getByRole("textbox", { name: "卡号" }), "4111111111111111")
  expect(screen.getByRole("textbox", { name: "卡号" })).toHaveValue("4111 1111 1111 1111")
  expect(screen.getByText("卡号有效")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "有效期" }), "1228")
  expect(screen.getByRole("textbox", { name: "有效期" })).toHaveValue("12/28")
})

test("购物车加购后显示件数和免运费差额", async () => {
  const user = userEvent.setup()
  render(<CartDrawer />)
  await user.click(screen.getAllByRole("button", { name: "加入购物车" })[0]!)
  await user.click(screen.getByRole("button", { name: "购物车 1 件" }))
  const dialog = screen.getByRole("dialog")
  expect(within(dialog).getByText("北窗灯")).toBeInTheDocument()
  const remaining = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(20)
  expect(within(dialog).getByText(`再买 ${remaining} 免运费`)).toBeInTheDocument()
})

test("优惠码成功后可移除，失败时给出原因", async () => {
  const user = userEvent.setup()
  const validate = vi.fn(async (code: string) => (
    code === "NORTH" ? { ok: true as const, label: "北窗九折" } : { ok: false as const, message: "没有这张优惠券" }
  ))
  render(<CouponInput validate={validate} />)
  await user.type(screen.getByRole("textbox", { name: "优惠码" }), "NOPE")
  await user.click(screen.getByRole("button", { name: "应用" }))
  expect(await screen.findByRole("alert")).toHaveTextContent("没有这张优惠券")
  await user.clear(screen.getByRole("textbox", { name: "优惠码" }))
  await user.type(screen.getByRole("textbox", { name: "优惠码" }), "NORTH")
  await user.click(screen.getByRole("button", { name: "应用" }))
  expect(await screen.findByText("北窗九折")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "移除优惠" }))
  expect(screen.getByRole("textbox", { name: "优惠码" })).toBeInTheDocument()
})

test("仪表盘露出当前值", () => {
  render(<RadialGauge value={42} />)
  expect(screen.getByRole("meter", { name: "仪表" })).toHaveAttribute("aria-valuenow", "42")
  expect(screen.getByText("42")).toBeInTheDocument()
})

test("甘特图可以切换周视图", async () => {
  const user = userEvent.setup()
  render(<GanttTimeline />)
  expect(screen.getAllByText("北窗").length).toBeGreaterThan(0)
  await user.click(screen.getByRole("button", { name: "周" }))
  expect(screen.getByRole("button", { name: "周" })).toHaveAttribute("aria-pressed", "true")
})

test("组织图搜索后标出对应的人", async () => {
  const user = userEvent.setup()
  render(<OrgChart />)
  await user.type(screen.getByRole("searchbox", { name: "搜索成员" }), "周宁")
  expect(screen.getByRole("heading", { name: "周宁" }).closest("article")).toHaveAttribute("data-active", "true")
})
