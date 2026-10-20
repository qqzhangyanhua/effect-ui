// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { InputPlus, InputPlusPassword, InputPlusSearch, InputPlusTextArea } from "./input-plus"

afterEach(() => {
  cleanup()
})

test("allowClear 清空输入，触发 onChange 和 onValueChange，并把焦点还回输入框", async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const onValueChange = vi.fn()
  render(<InputPlus defaultValue="你好" allowClear onChange={onChange} onValueChange={onValueChange} />)

  const input = screen.getByRole("textbox")
  await user.click(screen.getByRole("button", { name: "清除" }))

  expect(input).toHaveValue("")
  expect(onValueChange).toHaveBeenCalledWith("")
  expect(onChange).toHaveBeenCalled()
  expect(onChange.mock.calls[0]?.[0].target.value).toBe("")
  expect(input).toHaveFocus()
})

test("showCount 随输入更新，并停在 maxLength", async () => {
  const user = userEvent.setup()
  render(<InputPlus showCount maxLength={5} />)

  expect(screen.getByText("剩余 5")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox"), "abcdef")
  expect(screen.getByRole("textbox")).toHaveValue("abcde")
  expect(screen.getByText("剩余 0")).toBeInTheDocument()
})

test("status=error 设置 aria-invalid", () => {
  render(<InputPlus status="error" />)
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
})

test("密码按钮切换输入类型，并且有可访问的名字", async () => {
  const user = userEvent.setup()
  render(<InputPlusPassword defaultValue="secret" />)

  const input = screen.getByDisplayValue("secret")
  expect(input).toHaveAttribute("type", "password")
  await user.click(screen.getByRole("button", { name: "显示密码" }))
  expect(input).toHaveAttribute("type", "text")
  await user.click(screen.getByRole("button", { name: "隐藏密码" }))
  expect(input).toHaveAttribute("type", "password")
})

test("搜索在回车和按钮点击时触发 onSearch", async () => {
  const user = userEvent.setup()
  const onSearch = vi.fn()
  render(<InputPlusSearch onSearch={onSearch} />)

  const input = screen.getByRole("searchbox")
  await user.type(input, "城市{Enter}")
  expect(onSearch).toHaveBeenCalledWith("城市")
  await user.click(screen.getByRole("button", { name: "搜索" }))
  expect(onSearch).toHaveBeenLastCalledWith("城市")
})

test("textarea 的 autoSize 不超过 maxRows", () => {
  render(<InputPlusTextArea autoSize={{ minRows: 2, maxRows: 4 }} defaultValue={"一\n二\n三\n四\n五"} />)
  expect(screen.getByRole("textbox")).toHaveAttribute("rows", "4")
})

test("id 和 aria-describedby 落在输入框上", () => {
  const { rerender } = render(<InputPlus id="name" aria-describedby="name-hint" />)
  expect(screen.getByRole("textbox")).toHaveAttribute("id", "name")
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "name-hint")

  rerender(<InputPlusPassword id="secret" aria-describedby="secret-hint" />)
  const password = document.getElementById("secret")
  expect(password).toHaveAttribute("aria-describedby", "secret-hint")
  expect(password?.tagName).toBe("INPUT")

  rerender(<InputPlusSearch id="query" aria-describedby="query-hint" />)
  expect(screen.getByRole("searchbox")).toHaveAttribute("id", "query")
  expect(screen.getByRole("searchbox")).toHaveAttribute("aria-describedby", "query-hint")

  rerender(<InputPlusTextArea id="bio" aria-describedby="bio-hint" />)
  expect(screen.getByRole("textbox")).toHaveAttribute("id", "bio")
  expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "bio-hint")
})

test("FormControl 传入的 data-slot 不会盖掉输入组焦点槽", () => {
  const { rerender } = render(<InputPlus data-slot="form-control" />)
  expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input-group-control")

  rerender(<InputPlusTextArea data-slot="form-control" />)
  expect(screen.getByRole("textbox")).toHaveAttribute("data-slot", "input-group-control")
})
