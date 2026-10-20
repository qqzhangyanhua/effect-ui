// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { JellyRadio } from "./jelly-radio"

const options = [
  { value: "s", label: "小" },
  { value: "m", label: "中" },
  { value: "l", label: "大" },
]

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

test("点击选项并回报", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<JellyRadio aria-label="尺寸" options={options} onValueChange={onValueChange} />)

  await user.click(screen.getByRole("radio", { name: "中" }))
  expect(onValueChange).toHaveBeenCalledWith("m")
  expect(screen.getByRole("radio", { name: "中" })).toBeChecked()
})

test("方向键移到下一项", async () => {
  const onValueChange = vi.fn()
  render(
    <JellyRadio aria-label="尺寸" options={options} defaultValue="s" onValueChange={onValueChange} />,
  )

  const current = screen.getByRole("radio", { name: "小" })
  current.focus()
  // Radix 在 keydown 里用 setTimeout 移动焦点，并在按键仍按住时才选中。
  fireEvent.keyDown(current, { key: "ArrowRight" })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  expect(onValueChange).toHaveBeenCalledWith("m")
  expect(screen.getByRole("radio", { name: "中" })).toBeChecked()
})

test("禁用时不能选择", async () => {
  const user = userEvent.setup()
  const onValueChange = vi.fn()
  render(<JellyRadio aria-label="尺寸" options={options} disabled onValueChange={onValueChange} />)

  await user.click(screen.getByRole("radio", { name: "大" }))
  expect(onValueChange).not.toHaveBeenCalled()
})
