// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { RadioPlusGroup } from "./radio-plus"

afterEach(() => {
  cleanup()
})

async function moveWithArrows(optionType?: "default" | "button") {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<RadioPlusGroup optionType={optionType} options={["甲", "乙", "丙"]} onValueChange={onValueChange} />)

  const first = screen.getByRole("radio", { name: "甲" })
  await user.click(first)
  expect(onValueChange).toHaveBeenLastCalledWith("甲")
  first.focus()
  await user.keyboard("{ArrowRight>}")
  await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("乙"))
  await user.keyboard("{/ArrowRight}{ArrowRight>}")
  await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith("丙"))
}

test("单选组发出选中值，方向键移动选项", async () => {
  await moveWithArrows()
})

test("按钮样式的单选组仍用方向键移动选项", async () => {
  await moveWithArrows("button")
})

test("id 和 aria-describedby 落在第一个单选按钮上", () => {
  render(<RadioPlusGroup id="city" aria-describedby="city-hint" options={["杭州", "宁波"]} />)
  const first = screen.getByRole("radio", { name: "杭州" })
  expect(first).toHaveAttribute("id", "city")
  expect(first).toHaveAttribute("aria-describedby", "city-hint")
})
