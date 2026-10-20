// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SpringCheck } from "./spring-check"

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

test("点击选中，半选时为 mixed", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  const { rerender } = render(<SpringCheck aria-label="全选" onCheckedChange={onCheckedChange} />)

  const box = screen.getByRole("checkbox", { name: "全选" })
  expect(box).toHaveAttribute("aria-checked", "false")

  await user.click(box)
  expect(onCheckedChange).toHaveBeenCalledWith(true)
  expect(box).toHaveAttribute("aria-checked", "true")

  rerender(<SpringCheck aria-label="全选" checked="indeterminate" />)
  expect(screen.getByRole("checkbox", { name: "全选" })).toHaveAttribute("aria-checked", "mixed")

  rerender(<SpringCheck aria-label="全选" indeterminate checked={false} />)
  expect(screen.getByRole("checkbox", { name: "全选" })).toHaveAttribute("aria-checked", "mixed")
})

test("禁用时不切换", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  render(<SpringCheck aria-label="全选" disabled onCheckedChange={onCheckedChange} />)

  await user.click(screen.getByRole("checkbox", { name: "全选" }))
  expect(onCheckedChange).not.toHaveBeenCalled()
})
