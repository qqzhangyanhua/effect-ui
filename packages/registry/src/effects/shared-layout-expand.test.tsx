// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { getComponent } from "../catalog"
import { SharedLayoutExpand } from "./shared-layout-expand"

function installMedia(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

function start(prop: string) {
  const entry = getComponent("shared-layout-expand")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function card(name: string) {
  return screen.getByRole("button", { name: new RegExp(name) })
}

afterEach(() => {
  cleanup()
  document.body.style.overflow = ""
})

test("控件起始值是 480 毫秒、0.55 遮罩和 28 圆角", () => {
  expect(start("duration")).toBe(480)
  expect(start("backdrop")).toBe(0.55)
  expect(start("radius")).toBe(28)
})

test("键盘打开对话框，Esc 关闭并交还焦点", async () => {
  installMedia(false)
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(<SharedLayoutExpand onOpenChange={onOpenChange} />)
  const dawn = card("晨雾")
  dawn.focus()
  await user.keyboard("{Enter}")
  const dialog = await waitFor(() => screen.getByRole("dialog"))
  expect(dialog).toHaveAttribute("aria-modal", "true")
  expect(dialog).toHaveAttribute("aria-labelledby")
  expect(screen.getByRole("heading", { name: "晨雾" })).toBeInTheDocument()
  expect(screen.getByText("点开之后，这句话让开位置，背后的说明才走出来。")).toBeVisible()
  expect(onOpenChange).toHaveBeenCalledWith("dawn")
  expect(screen.getByRole("button", { name: "关闭" })).toHaveFocus()
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  expect(onOpenChange).toHaveBeenCalledWith(null)
  expect(card("晨雾")).toHaveFocus()
})

test("Tab 在对话框里循环", async () => {
  installMedia(false)
  render(<SharedLayoutExpand />)
  fireEvent.click(card("航线"))
  const close = screen.getByRole("button", { name: "关闭" })
  const detail = screen.getByRole("button", { name: "了解细节" })
  await waitFor(() => expect(close).toHaveFocus())
  fireEvent.keyDown(document, { key: "Tab" })
  expect(detail).toHaveFocus()
  fireEvent.keyDown(document, { key: "Tab" })
  expect(close).toHaveFocus()
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true })
  expect(detail).toHaveFocus()
})

test("减弱动效瞬时打开，关闭按钮和遮罩都能收回", async () => {
  installMedia(true)
  render(<SharedLayoutExpand />)
  const root = document.querySelector("[data-slot='shared-layout-expand']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-duration", "480")
  expect(root).toHaveAttribute("data-backdrop", "0.55")
  expect(root).toHaveAttribute("data-radius", "28")
  fireEvent.click(card("回声"))
  const dialog = await waitFor(() => screen.getByRole("dialog"))
  expect(dialog).toHaveAttribute("data-motion", "off")
  expect(dialog).toHaveAttribute("aria-modal", "true")
  fireEvent.click(screen.getByRole("button", { name: "关闭预览" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  fireEvent.click(card("回声"))
  fireEvent.click(screen.getByRole("button", { name: "关闭" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
})
