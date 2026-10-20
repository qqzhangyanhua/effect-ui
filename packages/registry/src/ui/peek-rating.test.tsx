// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { PeekRating } from "./peek-rating"

beforeAll(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
})

afterEach(() => {
  cleanup()
})

test("悬停预览分数，点击后写入", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<PeekRating aria-label="评分" onValueChange={onValueChange} />)

  const group = screen.getByRole("slider", { name: "评分" })
  expect(group).toHaveAttribute("aria-valuenow", "0")

  await user.hover(screen.getByRole("radio", { name: "4 星" }))
  expect(screen.getByText("4")).toBeInTheDocument()

  await user.click(screen.getByRole("radio", { name: "4 星" }))
  expect(onValueChange).toHaveBeenCalledWith(4)
  expect(group).toHaveAttribute("aria-valuenow", "4")
  expect(screen.getByRole("radio", { name: "4 星" })).toBeChecked()
})

test("半星可以选中", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<PeekRating aria-label="评分" allowHalf onValueChange={onValueChange} />)

  await user.click(screen.getByRole("radio", { name: "3.5 星" }))
  expect(onValueChange).toHaveBeenCalledWith(3.5)
  expect(screen.getByRole("slider", { name: "评分" })).toHaveAttribute("aria-valuenow", "3.5")
})

test("只读和禁用都不改值", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  const { rerender } = render(
    <PeekRating aria-label="评分" value={2} readOnly onValueChange={onValueChange} />,
  )

  await user.click(screen.getByRole("radio", { name: "5 星" }))
  expect(onValueChange).not.toHaveBeenCalled()
  expect(screen.getByRole("slider", { name: "评分" })).toHaveAttribute("aria-valuenow", "2")

  rerender(<PeekRating aria-label="评分" value={2} disabled onValueChange={onValueChange} />)
  await user.click(screen.getByRole("radio", { name: "5 星" }))
  expect(onValueChange).not.toHaveBeenCalled()
})
