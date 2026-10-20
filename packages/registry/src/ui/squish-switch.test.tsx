// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SquishSwitch } from "./squish-switch"

beforeAll(() => {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
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

test("点击和空格都会切换并回报", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  render(<SquishSwitch aria-label="通知" onCheckedChange={onCheckedChange} />)

  const sw = screen.getByRole("switch", { name: "通知" })
  expect(sw).not.toBeChecked()

  await user.click(sw)
  expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  expect(sw).toBeChecked()

  sw.focus()
  await user.keyboard(" ")
  expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  expect(sw).not.toBeChecked()
})

test("受控 checked 决定展示", () => {
  const { rerender } = render(<SquishSwitch aria-label="通知" checked={false} />)
  expect(screen.getByRole("switch", { name: "通知" })).not.toBeChecked()

  rerender(<SquishSwitch aria-label="通知" checked />)
  expect(screen.getByRole("switch", { name: "通知" })).toBeChecked()
})

test("禁用时不切换", async () => {
  const user = userEvent.setup()
  const onCheckedChange = vi.fn()
  render(<SquishSwitch aria-label="通知" disabled onCheckedChange={onCheckedChange} />)

  await user.click(screen.getByRole("switch", { name: "通知" }))
  expect(onCheckedChange).not.toHaveBeenCalled()
})

