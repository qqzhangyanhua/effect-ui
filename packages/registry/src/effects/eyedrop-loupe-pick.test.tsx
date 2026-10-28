// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { EyedropLoupePick } from "./eyedrop-loupe-pick"

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
  const entry = getComponent("eyedrop-loupe-pick")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='eyedrop-loupe-pick']")
  if (!(node instanceof HTMLElement)) throw new Error("missing loupe")
  return node
}

beforeEach(() => {
  installMedia()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("放大镜默认采到中心色，控件起始值等于默认", () => {
  expect(getComponent("eyedrop-loupe-pick")?.batch).toBe(74)
  expect(getComponent("eyedrop-loupe-pick")?.effectCategory).toBe("micro")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("grid")).toBe(3)
  expect(start("snap")).toBe(true)
  const view = render(<EyedropLoupePick />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "loupe-pick")
  expect(root).toHaveAttribute("data-tone", "ink")
  expect(root).toHaveAttribute("data-token", "chart-5")
  expect(root).toHaveAttribute("data-x", "0.50")
  expect(root).toHaveAttribute("data-y", "0.50")
  expect(root).toHaveAttribute("data-zoom", "2.01")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.querySelector("[data-chip]")).toHaveTextContent("ink")
  expect(root.querySelector("[data-chip]")).toHaveTextContent("var(--chart-5)")
  expect(root.querySelector("img")).toBeNull()
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
})

test("拖动取样，松手吸到色块中心，Confirm 锁定", () => {
  const onColorChange = vi.fn()
  const view = render(<EyedropLoupePick onColorChange={onColorChange} />)
  const root = rootOf(view.container)
  const field = view.getByRole("application", { name: "取色放大镜" })
  fireEvent.pointerDown(field, { clientX: 20, clientY: 20, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "sampling")
  expect(root).toHaveAttribute("data-tone", "clay")
  expect(root).toHaveAttribute("data-x", "0.06")
  expect(root).toHaveAttribute("data-y", "0.09")
  fireEvent.pointerUp(field, { clientX: 20, clientY: 20, pointerId: 1 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-x", "0.17")
  expect(root).toHaveAttribute("data-y", "0.17")
  expect(root).toHaveAttribute("data-tone", "clay")
  expect(onColorChange).toHaveBeenCalledWith("clay")
  fireEvent.click(view.getByRole("button", { name: "Confirm" }))
  expect(root).toHaveAttribute("data-state", "locked")
  expect(root).toHaveAttribute("data-locked", "clay")
})

test("方向键微调色块，关闭吸附时停在采样点", () => {
  const view = render(<EyedropLoupePick snap={false} grid={3} />)
  const root = rootOf(view.container)
  const field = view.getByRole("application", { name: "取色放大镜" })
  expect(root).toHaveAttribute("data-snap", "off")
  fireEvent.keyDown(field, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-x", "0.83")
  expect(root).toHaveAttribute("data-tone", "mist")
  expect(root).toHaveAttribute("data-state", "idle")
  fireEvent.pointerDown(field, { clientX: 20, clientY: 20, button: 0, pointerId: 1 })
  fireEvent.pointerUp(field, { clientX: 20, clientY: 20, pointerId: 1 })
  expect(root).toHaveAttribute("data-x", "0.06")
  expect(root).toHaveAttribute("data-y", "0.09")
  expect(root).toHaveAttribute("data-locked", "")
})

test("减弱动效不放大，移动瞬时改环色", () => {
  installMedia({ reduced: true })
  const view = render(<EyedropLoupePick />)
  const root = rootOf(view.container)
  const field = view.getByRole("application", { name: "取色放大镜" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-zoom", "1.00")
  expect(root).toHaveAttribute("data-ease", "0")
  fireEvent.pointerDown(field, { clientX: 20, clientY: 20, button: 0, pointerId: 1 })
  expect(root).toHaveAttribute("data-tone", "clay")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(root).toHaveAttribute("data-zoom", "1.00")
})
