// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { LogoFocusDim } from "./logo-focus-dim"

const queued = new Map<number, FrameRequestCallback>()

function installFrames() {
  queued.clear()
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = queued.size + 1
    queued.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    queued.delete(id)
  })
}

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
  const entry = getComponent("logo-focus-dim")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='logo-focus-dim']")
  if (!(node instanceof HTMLElement)) throw new Error("missing logo focus")
  return node
}

beforeEach(() => {
  installMedia()
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("标志焦点控件起始值等于默认", () => {
  expect(getComponent("logo-focus-dim")?.batch).toBe(72)
  expect(getComponent("logo-focus-dim")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.55)
  expect(start("layout")).toBe("row")
  expect(start("count")).toBe(8)
  expect(start("hold")).toBe(false)
  const view = render(<LogoFocusDim />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "logo-focus")
  expect(root).toHaveAttribute("data-marquee", "off")
  expect(root).toHaveAttribute("data-proximity", "off")
  expect(root).toHaveAttribute("data-layout", "row")
  expect(root).toHaveAttribute("data-focus", "-1")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("motion-reduce:transition-none")
  const mark = view.getByRole("option", { name: "标志 A" })
  expect(mark).toHaveAttribute("data-mark", "A")
  expect(mark).toHaveAttribute("data-opacity", "0.62")
  expect(mark.querySelector("path")).toBeNull()
  expect(mark.querySelector("rect")).not.toBeNull()
  expect(mark.querySelector("text")).toHaveTextContent("A")
  expect(queued.size).toBe(0)
})

test("焦点标志全亮，其余变暗，键盘可走", () => {
  const view = render(<LogoFocusDim />)
  const root = rootOf(view.container)
  const first = view.getByRole("option", { name: "标志 A" })
  const second = view.getByRole("option", { name: "标志 B" })
  expect(first.tabIndex).toBe(0)
  fireEvent.focus(first)
  expect(root).toHaveAttribute("data-focus", "0")
  expect(first).toHaveAttribute("data-opacity", "1.00")
  expect(Number(second.getAttribute("data-opacity"))).toBeLessThan(0.62)
  expect(Number(first.getAttribute("data-scale"))).toBeGreaterThan(1)
  fireEvent.keyDown(first, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-focus", "1")
  expect(second).toHaveAttribute("data-opacity", "1.00")
  expect(first).toHaveAttribute("data-active", "no")
  expect(queued.size).toBe(0)
})

test("指针进入后离开容器会恢复，hold 则保留", () => {
  const plain = render(<LogoFocusDim />)
  const plainRoot = rootOf(plain.container)
  fireEvent.pointerEnter(plain.getByRole("option", { name: "标志 C" }), { pointerType: "mouse" })
  expect(plainRoot).toHaveAttribute("data-focus", "2")
  fireEvent.pointerLeave(plainRoot, { pointerType: "mouse" })
  expect(plainRoot).toHaveAttribute("data-focus", "-1")
  plain.unmount()

  const held = render(<LogoFocusDim hold />)
  const heldRoot = rootOf(held.container)
  fireEvent.focus(held.getByRole("option", { name: "标志 A" }))
  fireEvent.pointerLeave(heldRoot, { pointerType: "mouse" })
  expect(heldRoot).toHaveAttribute("data-focus", "0")
})

test("触屏离开不靠悬停清掉点选", () => {
  const view = render(<LogoFocusDim />)
  const root = rootOf(view.container)
  fireEvent.click(view.getByRole("option", { name: "标志 D" }))
  expect(root).toHaveAttribute("data-focus", "3")
  fireEvent.pointerLeave(root, { pointerType: "touch" })
  expect(root).toHaveAttribute("data-focus", "3")
})

test("网格和数量，减弱时没有过渡", () => {
  installMedia({ reduced: true })
  const view = render(<LogoFocusDim layout="grid" count={6} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-layout", "grid")
  expect(root).toHaveAttribute("data-count", "6")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root.className).toContain("grid-cols-3")
  expect(view.queryByRole("option", { name: "标志 G" })).toBeNull()
  const mark = view.getByRole("option", { name: "标志 A" })
  mark.focus()
  expect(mark).toHaveStyle({ transitionDuration: "0ms" })
  expect(queued.size).toBe(0)
})
