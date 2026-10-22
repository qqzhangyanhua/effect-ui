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
  vi.useRealTimers()
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

test("hover 模式下触屏指针进入不展开，点击可切换，鼠标进入仍展开", () => {
  const { container } = render(<FolderFloat physics={false} items={["A"]} />)
  const root = container.firstElementChild as HTMLElement
  const toggle = screen.getByRole("button", { name: /Design feedback/ })

  fireEvent.pointerEnter(root, { pointerType: "touch" })
  expect(root).not.toHaveAttribute("data-open")

  fireEvent.click(toggle)
  expect(root).toHaveAttribute("data-open")
  fireEvent.pointerLeave(root, { pointerType: "touch" })
  expect(root).toHaveAttribute("data-open")
  fireEvent.click(toggle)
  expect(root).not.toHaveAttribute("data-open")

  fireEvent.pointerEnter(root, { pointerType: "mouse" })
  expect(root).toHaveAttribute("data-open")
})

test("收起时便签不可聚焦", () => {
  render(<FolderFloat trigger="click" physics={false} items={["A"]} />)
  expect(screen.getByText("A").closest("button")).toHaveAttribute("tabindex", "-1")
})

test("减弱动效时展开后不进入物理运行，便签仍可展开", () => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
  vi.useFakeTimers()
  const opened = render(<FolderFloat defaultOpen items={["A"]} />)
  const root = opened.container.firstElementChild as HTMLElement
  expect(root).toHaveAttribute("data-open")
  expect(screen.getByText("A")).toBeInTheDocument()
  vi.advanceTimersByTime(2000)
  expect(root).not.toHaveAttribute("data-live")

  opened.unmount()
  const clicked = render(<FolderFloat items={["Bee"]} />)
  const next = clicked.container.firstElementChild as HTMLElement
  fireEvent.click(screen.getByRole("button", { name: /Design feedback/ }))
  expect(next).toHaveAttribute("data-open")
  expect(screen.getByText("Bee")).toBeInTheDocument()
  vi.advanceTimersByTime(2000)
  expect(next).not.toHaveAttribute("data-live")
})

test("省略颜色时内联变量跟随主题，传入 folderColor 则原样写入", () => {
  const { container, rerender } = render(<FolderFloat physics={false} items={["A"]} />)
  const root = container.firstElementChild as HTMLElement
  expect(root.style.getPropertyValue("--ff-back")).toBe("var(--primary)")
  expect(root.style.getPropertyValue("--ff-front")).toBe("var(--foreground)")
  expect(root.style.getPropertyValue("--ff-paper")).toBe("var(--card)")
  expect(root.style.getPropertyValue("--ff-item")).toBe("var(--muted)")
  expect(root.style.getPropertyValue("--ff-item-ink")).toBe("var(--card-foreground)")
  expect(root.style.getPropertyValue("--ff-label")).toBe("var(--card)")

  rerender(<FolderFloat physics={false} items={["A"]} folderColor="#ff00ff" />)
  const next = container.firstElementChild as HTMLElement
  expect(next.style.getPropertyValue("--ff-back")).toBe("#ff00ff")
  expect(next.style.getPropertyValue("--ff-front")).toBe("var(--foreground)")
})
