// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { SwipeRow } from "./swipe-row"

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

function swipe(text: string, from: number, to: number) {
  const row = screen.getByText(text)
  fireEvent.pointerDown(row, { clientX: from, pointerId: 1, button: 0 })
  fireEvent.pointerMove(row, { clientX: to, pointerId: 1 })
  fireEvent.pointerUp(row, { clientX: to, pointerId: 1 })
}

test("滑开后露出操作，点击操作后关闭", async () => {
  const user = userEvent.setup()
  const onDelete = vi.fn()
  render(
    <SwipeRow actions={<button type="button" onClick={onDelete}>删除</button>}>
      邮件
    </SwipeRow>,
  )

  expect(screen.queryByRole("button", { name: "删除" })).not.toBeInTheDocument()
  swipe("邮件", 200, 100)
  await user.click(screen.getByRole("button", { name: "删除" }))
  expect(onDelete).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole("button", { name: "删除" })).not.toBeInTheDocument()
})

test("向右滑才露出另一侧操作", () => {
  render(
    <SwipeRow direction="right" actions={<button type="button">归档</button>}>
      邮件
    </SwipeRow>,
  )

  swipe("邮件", 40, 120)
  expect(screen.getByRole("button", { name: "归档" })).toBeInTheDocument()
})
