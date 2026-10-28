// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { OrbitalActionRing } from "./orbital-action-ring"

function installMedia(options: { reduced?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: options.reduced === true && query.includes("prefers-reduced-motion"),
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
  const entry = getComponent("orbital-action-ring")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeEach(() => {
  installMedia()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("轨道环控件起始值等于默认", () => {
  expect(start("radius")).toBe(92)
  expect(start("pace")).toBe(1)
  expect(start("count")).toBe(3)
  const view = render(<OrbitalActionRing />)
  const root = view.container.querySelector("[data-slot='orbital-action-ring']")
  expect(root).toHaveAttribute("data-radius", "92")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-count", "3")
  expect(root).toHaveAttribute("data-layout", "ring")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(screen.queryByRole("button", { name: "确认" })).not.toBeInTheDocument()
})

test("方向键沿环移动，Enter 只确认一次，Esc 关闭", () => {
  const onAction = vi.fn()
  const view = render(<OrbitalActionRing onAction={onAction} />)
  const root = view.container.querySelector("[data-slot='orbital-action-ring']") as HTMLElement
  fireEvent.keyDown(root, { key: "Enter" })
  expect(onAction).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole("button", { name: "动作锚点" }))
  expect(root).toHaveAttribute("data-state", "open")
  expect(root.querySelector("[data-ring]")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "确认" })).toHaveAttribute("aria-label", "确认")
  expect(screen.getByRole("button", { name: "删除" })).toHaveAttribute("aria-label", "删除")
  expect(screen.getByRole("button", { name: "刷新" })).toHaveAttribute("aria-label", "刷新")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-index", "2")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "0")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-index", "1")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(onAction).toHaveBeenCalledTimes(1)
  expect(onAction).toHaveBeenCalledWith("delete")
  expect(root).toHaveAttribute("data-state", "actioned")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(onAction).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-state", "closed")
  expect(screen.queryByRole("button", { name: "确认" })).not.toBeInTheDocument()
})

test("触屏先点锚点再点动作", () => {
  const onAction = vi.fn()
  render(<OrbitalActionRing onAction={onAction} count={5} radius={120} />)
  const root = document.querySelector("[data-slot='orbital-action-ring']")
  expect(root).toHaveAttribute("data-count", "5")
  expect(root).toHaveAttribute("data-radius", "120")
  fireEvent.click(screen.getByRole("button", { name: "动作锚点" }))
  expect(screen.getByRole("button", { name: "替换" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "固定" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "刷新" }))
  expect(onAction).toHaveBeenCalledTimes(1)
  expect(onAction).toHaveBeenCalledWith("refresh")
  expect(screen.queryByRole("button", { name: "刷新" })).not.toBeInTheDocument()
})

test("减弱动效改成竖直列表，动作仍然可点", () => {
  installMedia({ reduced: true })
  const onAction = vi.fn()
  const view = render(<OrbitalActionRing onAction={onAction} />)
  const root = view.container.querySelector("[data-slot='orbital-action-ring']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-layout", "list")
  expect(root).toHaveAttribute("data-state", "open")
  expect(root?.querySelector("[data-ring]")).toBeNull()
  const confirm = screen.getByRole("button", { name: "确认" })
  expect(confirm.style.transition).toBe("none")
  fireEvent.click(confirm)
  expect(onAction).toHaveBeenCalledTimes(1)
  expect(onAction).toHaveBeenCalledWith("confirm")
  fireEvent.click(screen.getByRole("button", { name: "删除" }))
  expect(onAction).toHaveBeenCalledTimes(2)
})
