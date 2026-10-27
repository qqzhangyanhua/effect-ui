// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"

vi.mock("@number-flow/react", () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>,
}))
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SignaturePad } from "./signature-pad"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }),
})

afterEach(() => {
  cleanup()
})

test("输入姓名可以生成签名再清除", async () => {
  const user = userEvent.setup()
  render(<SignaturePad />)
  expect(screen.getByText("未签名")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "姓名" }), "林夏")
  await user.click(screen.getByRole("button", { name: "生成签名" }))
  expect(screen.getByText("已签名")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "清除" }))
  expect(screen.getByText("未签名")).toBeInTheDocument()
})

