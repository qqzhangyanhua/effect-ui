// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { InfiniteScroll } from "./infinite-scroll"
import { PasswordStrength } from "./password-strength"
import { CurrencyInput } from "./currency-input"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("infinite scroll shows the loaded page", () => {
  render(<InfiniteScroll onLoadMore={() => undefined}>第一页</InfiniteScroll>)
  expect(screen.getByText("第一页")).toBeInTheDocument()
  expect(screen.getByText("继续滚动")).toBeInTheDocument()
})


test("password strength labels a short password", async () => {
  const user = userEvent.setup()
  render(<PasswordStrength />)
  expect(screen.getByText("至少 8 位，含大小写、数字和符号")).toBeInTheDocument()
  await user.type(screen.getByPlaceholderText("设置密码"), "a")
  expect(screen.getByText("很弱")).toBeInTheDocument()
})

test("currency input formats dollars", async () => {
  const user = userEvent.setup()
  render(<CurrencyInput />)
  expect(screen.getByText("$0.00")).toBeInTheDocument()
  const input = screen.getByRole("textbox")
  await user.clear(input)
  await user.type(input, "12")
  expect(screen.getByText("$12.00")).toBeInTheDocument()
})


