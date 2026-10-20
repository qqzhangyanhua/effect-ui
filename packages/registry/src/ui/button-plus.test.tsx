// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ButtonPlus } from "./button-plus"

afterEach(() => {
  cleanup()
})

test("loading 挡住点击并设置 aria-busy", async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(
    <ButtonPlus loading onClick={onClick}>
      保存
    </ButtonPlus>,
  )

  const button = screen.getByRole("button", { name: "保存" })
  expect(button).toHaveAttribute("aria-busy", "true")
  await user.click(button)
  expect(onClick).not.toHaveBeenCalled()
})

test("htmlType 默认不提交表单，submit 会提交", async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault())
  const { rerender } = render(
    <form
      onSubmit={(event) => {
        onSubmit(event.nativeEvent)
      }}
    >
      <ButtonPlus>保存</ButtonPlus>
    </form>,
  )

  await user.click(screen.getByRole("button", { name: "保存" }))
  expect(onSubmit).not.toHaveBeenCalled()

  rerender(
    <form
      onSubmit={(event) => {
        onSubmit(event.nativeEvent)
      }}
    >
      <ButtonPlus htmlType="submit">提交</ButtonPlus>
    </form>,
  )
  await user.click(screen.getByRole("button", { name: "提交" }))
  expect(onSubmit).toHaveBeenCalledTimes(1)
})

test("只有图标时，aria-label 就是按钮的名字", () => {
  render(<ButtonPlus icon={<span aria-hidden>★</span>} aria-label="编辑" />)
  expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument()
})

test("id 和 aria-describedby 落在按钮上", () => {
  render(
    <ButtonPlus id="save" aria-describedby="save-hint">
      保存
    </ButtonPlus>,
  )
  const button = screen.getByRole("button", { name: "保存" })
  expect(button).toHaveAttribute("id", "save")
  expect(button).toHaveAttribute("aria-describedby", "save-hint")
})
