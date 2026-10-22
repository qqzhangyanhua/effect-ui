// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { FolderFloat } from "./folder-float"

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("点击触发展开，再点一次收起，并回调 onOpenChange", () => {
  const onOpenChange = vi.fn()
  render(<FolderFloat trigger="click" physics={false} items={["A", "B"]} onOpenChange={onOpenChange} />)
  const toggle = screen.getByRole("button", { name: "Design feedback, 2 notes" })
  expect(toggle).toHaveAttribute("aria-expanded", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-expanded", "true")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-expanded", "false")
  expect(onOpenChange.mock.calls).toEqual([[true], [false]])
})

test("展开后点击便签回调 value 与 index，并按 closeOnSelect 收起", () => {
  const onSelect = vi.fn()
  render(
    <FolderFloat
      trigger="click"
      physics={false}
      items={["A", { label: "Bee", value: "b" }]}
      onSelect={onSelect}
    />
  )
  const toggle = screen.getByRole("button", { name: /Design feedback/ })
  fireEvent.click(toggle)
  fireEvent.click(screen.getByText("Bee"))
  expect(onSelect).toHaveBeenCalledWith("b", 1)
  expect(toggle).toHaveAttribute("aria-expanded", "false")
})

test("closeOnSelect 为 false 时选中后保持展开", () => {
  render(<FolderFloat trigger="click" physics={false} closeOnSelect={false} items={["A"]} />)
  const toggle = screen.getByRole("button", { name: /Design feedback/ })
  fireEvent.click(toggle)
  fireEvent.click(screen.getByText("A"))
  expect(toggle).toHaveAttribute("aria-expanded", "true")
})

test("Esc 收起", () => {
  render(<FolderFloat trigger="click" physics={false} defaultOpen items={["A"]} />)
  const toggle = screen.getByRole("button", { name: /Design feedback/ })
  expect(toggle).toHaveAttribute("aria-expanded", "true")
  fireEvent.keyDown(toggle, { key: "Escape" })
  expect(toggle).toHaveAttribute("aria-expanded", "false")
})

test("hover 触发：指针进入展开，离开收起", () => {
  const { container } = render(<FolderFloat physics={false} items={["A"]} />)
  const root = container.firstElementChild as HTMLElement
  fireEvent.pointerEnter(root)
  expect(root).toHaveAttribute("data-open")
  fireEvent.pointerLeave(root)
  expect(root).not.toHaveAttribute("data-open")
})

test("收起时便签不可聚焦", () => {
  render(<FolderFloat trigger="click" physics={false} items={["A"]} />)
  expect(screen.getByText("A").closest("button")).toHaveAttribute("tabindex", "-1")
})
