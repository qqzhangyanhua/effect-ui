// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ChipFoldBadge, chipCap, chipOrder } from "./chip-fold-badge"

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
  const found = getComponent("chip-fold-badge")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='chip-fold-badge']")
  if (!(node instanceof HTMLElement)) throw new Error("missing chips")
  return node
}

beforeEach(() => {
  installMedia()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test("chip 云默认展开且未选，控件起始值等于默认", () => {
  expect(getComponent("chip-fold-badge")?.batch).toBe(79)
  expect(getComponent("chip-fold-badge")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("collapsed")).toBe(false)
  expect(start("maxVisible")).toBe(6)
  expect(chipCap(1)).toBe(2)
  expect(chipOrder(["harbor", "atlas"])).toEqual(["atlas", "harbor"])
  const view = render(<ChipFoldBadge />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "chip-fold")
  expect(root).toHaveAttribute("data-collapsed", "off")
  expect(root).toHaveAttribute("data-phase", "expanded")
  expect(root).toHaveAttribute("data-count", "0")
  expect(root).toHaveAttribute("data-selected", "")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("button", { name: "Cedar" })).toHaveAttribute("aria-pressed", "false")
  expect(view.queryByRole("button", { name: /selected/ })).toBeNull()
  expect(view.queryByText(/airbnb|meetup/i)).toBeNull()
})

test("多选后折叠成徽章，快捷键可以再展开", async () => {
  vi.useFakeTimers()
  const onValueChange = vi.fn()
  const view = render(<ChipFoldBadge onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Cedar" }))
  fireEvent.click(view.getByRole("button", { name: "Atlas" }))
  expect(root).toHaveAttribute("data-selected", "atlas,cedar")
  expect(root).toHaveAttribute("data-count", "2")
  expect(view.getByRole("button", { name: "Cedar" })).toHaveAttribute("aria-pressed", "true")
  expect(onValueChange).toHaveBeenLastCalledWith({ selected: ["atlas", "cedar"], collapsed: false })
  fireEvent.click(view.getByRole("button", { name: "Cedar" }))
  expect(root).toHaveAttribute("data-selected", "atlas")
  fireEvent.click(view.getByRole("button", { name: "Cedar" }))
  fireEvent.click(view.getByRole("button", { name: "Fold" }))
  expect(root).toHaveAttribute("data-collapsed", "on")
  expect(root).toHaveAttribute("data-phase", "folding")
  expect(view.getByRole("button", { name: "2 selected" })).toBeInTheDocument()
  await vi.advanceTimersByTimeAsync(300)
  expect(root).toHaveAttribute("data-phase", "collapsed")
  fireEvent.keyDown(root, { key: "f" })
  expect(root).toHaveAttribute("data-collapsed", "off")
  expect(root).toHaveAttribute("data-phase", "expanding")
  expect(onValueChange).toHaveBeenLastCalledWith({ selected: ["atlas", "cedar"], collapsed: false })
})

test("超过可见上限时提示，受控折叠直接显示徽章", () => {
  const view = render(<ChipFoldBadge maxVisible={2} />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Dune" }))
  fireEvent.click(view.getByRole("button", { name: "Ember" }))
  fireEvent.click(view.getByRole("button", { name: "Flint" }))
  expect(root).toHaveAttribute("data-hint", "on")
  expect(root).toHaveAttribute("data-max", "2")
  expect(view.getByText("2+ picked")).toBeInTheDocument()
  view.rerender(<ChipFoldBadge maxVisible={2} collapsed />)
  expect(rootOf(view.container)).toHaveAttribute("data-collapsed", "on")
  expect(view.getByRole("button", { name: "3 selected" })).toBeInTheDocument()
})

test("减弱动效瞬时折叠，没有过渡相位", () => {
  installMedia({ reduced: true })
  const view = render(<ChipFoldBadge />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("button", { name: "Grove" }))
  fireEvent.keyDown(root, { key: "F" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-collapsed", "on")
  expect(root).toHaveAttribute("data-phase", "collapsed")
  expect(root).toHaveAttribute("data-selected", "grove")
  fireEvent.click(view.getByRole("button", { name: "1 selected" }))
  expect(root).toHaveAttribute("data-phase", "expanded")
  expect(root).toHaveAttribute("data-collapsed", "off")
})
