// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { CheckboxPlus, CheckboxPlusGroup } from "./checkbox-plus"

afterEach(() => {
  cleanup()
})

test("组的 onValueChange 发出按选项顺序排列的 string[]", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <CheckboxPlusGroup
      options={["甲", { label: "乙", value: "b" }, "丙"]}
      onValueChange={onValueChange}
    />,
  )

  await user.click(screen.getByRole("checkbox", { name: "丙" }))
  expect(onValueChange).toHaveBeenLastCalledWith(["丙"])
  await user.click(screen.getByRole("checkbox", { name: "甲" }))
  expect(onValueChange).toHaveBeenLastCalledWith(["甲", "丙"])
})

test("禁用的选项不能切换", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(
    <CheckboxPlusGroup
      options={[
        { label: "甲", value: "a" },
        { label: "乙", value: "b", disabled: true },
      ]}
      onValueChange={onValueChange}
    />,
  )

  await user.click(screen.getByRole("checkbox", { name: "甲" }))
  expect(onValueChange).toHaveBeenCalledWith(["a"])
  await user.click(screen.getByRole("checkbox", { name: "乙" }))
  expect(onValueChange).toHaveBeenCalledTimes(1)
})

test("indeterminate 暴露 mixed 状态", () => {
  render(<CheckboxPlus indeterminate>全选</CheckboxPlus>)
  expect(screen.getByRole("checkbox", { name: "全选" })).toHaveAttribute("aria-checked", "mixed")
})

test("id 和 aria-describedby 落在复选框上", () => {
  const { rerender } = render(
    <CheckboxPlus id="agree" aria-describedby="agree-hint">
      同意
    </CheckboxPlus>,
  )
  const single = screen.getByRole("checkbox", { name: "同意" })
  expect(single).toHaveAttribute("id", "agree")
  expect(single).toHaveAttribute("aria-describedby", "agree-hint")

  rerender(<CheckboxPlusGroup id="colors" aria-describedby="colors-hint" options={["红", "蓝"]} />)
  const first = screen.getByRole("checkbox", { name: "红" })
  expect(first).toHaveAttribute("id", "colors")
  expect(first).toHaveAttribute("aria-describedby", "colors-hint")
})
