// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { PulseHeart } from "./pulse-heart"

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

test("受控时点击只回报，展示跟随 active", async () => {
  const user = userEvent.setup()
  const onActiveChange = vi.fn()
  const { rerender } = render(<PulseHeart active={false} onActiveChange={onActiveChange} />)

  const button = screen.getByRole("button", { name: "喜欢" })
  expect(button).toHaveAttribute("aria-pressed", "false")

  await user.click(button)
  expect(onActiveChange).toHaveBeenCalledWith(true)
  expect(button).toHaveAttribute("aria-pressed", "false")

  rerender(<PulseHeart active onActiveChange={onActiveChange} />)
  expect(screen.getByRole("button", { name: "喜欢" })).toHaveAttribute("aria-pressed", "true")
})

test("非受控点击后保持按下", async () => {
  const user = userEvent.setup()
  render(<PulseHeart />)
  const button = screen.getByRole("button", { name: "喜欢" })
  await user.click(button)
  expect(button).toHaveAttribute("aria-pressed", "true")
})

test("禁用时不切换", async () => {
  const user = userEvent.setup()
  const onActiveChange = vi.fn()
  render(<PulseHeart disabled onActiveChange={onActiveChange} />)
  await user.click(screen.getByRole("button", { name: "喜欢" }))
  expect(onActiveChange).not.toHaveBeenCalled()
})
