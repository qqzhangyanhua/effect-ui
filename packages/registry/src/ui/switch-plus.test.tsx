// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SwitchPlus } from "./switch-plus"

afterEach(() => {
  cleanup()
})

test("loading 时忽略切换", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  render(<SwitchPlus loading onCheckedChange={onCheckedChange} />)

  await user.click(screen.getByRole("switch"))
  expect(onCheckedChange).not.toHaveBeenCalled()
})

test("非 loading 时 onCheckedChange 发出下一个布尔值", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  render(<SwitchPlus onCheckedChange={onCheckedChange} />)

  await user.click(screen.getByRole("switch"))
  expect(onCheckedChange).toHaveBeenCalledWith(true)
})

test("轨道文案不改变 switch 角色和选中状态", () => {
  render(
    <SwitchPlus checked checkedChildren="开" unCheckedChildren="关" />,
  )

  const control = screen.getByRole("switch")
  expect(control).toHaveAttribute("aria-checked", "true")
  expect(screen.getByText("开")).toBeInTheDocument()
  expect(screen.queryByText("关")).not.toBeInTheDocument()
})

test("id 和 aria-describedby 落在开关上", () => {
  render(<SwitchPlus id="notify" aria-describedby="notify-hint" />)
  const control = screen.getByRole("switch")
  expect(control).toHaveAttribute("id", "notify")
  expect(control).toHaveAttribute("aria-describedby", "notify-hint")
})
