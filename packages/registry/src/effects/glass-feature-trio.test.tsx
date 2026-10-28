// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { GlassFeatureTrio } from "./glass-feature-trio"

function installMedia(options: { reduced?: boolean; coarse?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (options.reduced === true && query.includes("prefers-reduced-motion")) ||
      (options.coarse === true && query.includes("pointer: coarse")),
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
  const entry = getComponent("glass-feature-trio")
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

test("玻璃三列的控件起始值等于默认", () => {
  expect(start("blur")).toBe(16)
  expect(start("intensity")).toBe(0.7)
  expect(start("pace")).toBe(1)
  const view = render(<GlassFeatureTrio />)
  const root = view.container.querySelector("[data-slot='glass-feature-trio']")
  expect(root).toHaveAttribute("data-blur", "16")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-columns", "3")
  expect(root).toHaveAttribute("data-count", "3")
  expect(view.container.querySelector("[data-slot='glass-card']")).toBeNull()
})

test("Tab 可以走到三张卡片", async () => {
  const user = userEvent.setup()
  render(<GlassFeatureTrio />)
  const buttons = [
    document.querySelector("[data-feature='mesh']"),
    document.querySelector("[data-feature='glass']"),
    document.querySelector("[data-feature='lift']"),
  ]
  expect(buttons).toHaveLength(3)
  await user.tab()
  expect(buttons[0]).toHaveFocus()
  await user.tab()
  expect(buttons[1]).toHaveFocus()
  await user.tab()
  expect(buttons[2]).toHaveFocus()
  expect(document.querySelector("[data-slot='glass-feature-trio']")).toHaveAttribute("data-state", "focus")
  expect(buttons[2]).toHaveAttribute("data-lift", "on")
})

test("细指针移动时抬起，离开后回落", () => {
  const view = render(<GlassFeatureTrio intensity={1} pace={1.5} />)
  const root = view.container.querySelector("[data-slot='glass-feature-trio']")
  const card = view.container.querySelector("[data-feature='glass']") as HTMLButtonElement
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 40, clientY: 24 })
  expect(root).toHaveAttribute("data-state", "hovering")
  expect(root).toHaveAttribute("data-index", "1")
  expect(root).toHaveAttribute("data-drift", "pointer")
  expect(card).toHaveAttribute("data-lift", "on")
  expect(card.style.transform).toContain("translateY")
  fireEvent.pointerLeave(card)
  expect(root).toHaveAttribute("data-state", "resting")
  expect(card.style.transform).toBe("none")
})

test("粗指针和触屏不靠悬停，聚焦仍有焦点态", () => {
  installMedia({ coarse: true })
  const view = render(<GlassFeatureTrio />)
  const root = view.container.querySelector("[data-slot='glass-feature-trio']")
  const card = view.container.querySelector("[data-feature='mesh']") as HTMLButtonElement
  expect(root).toHaveAttribute("data-pointer", "coarse")
  expect(root).toHaveAttribute("data-drift", "off")
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 30, clientY: 20 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(card.style.transform).toBe("none")
  fireEvent.focus(card)
  expect(root).toHaveAttribute("data-state", "focus")
  expect(card).toHaveAttribute("data-lift", "off")
  expect(card.className).toContain("focus-visible:ring-2")
})

test("触屏指针不抬起卡片", () => {
  const view = render(<GlassFeatureTrio />)
  const card = view.container.querySelector("[data-feature='lift']") as HTMLButtonElement
  fireEvent.pointerMove(card, { pointerType: "touch", clientX: 12, clientY: 12 })
  expect(card).toHaveAttribute("data-lift", "off")
  expect(card.style.transform).toBe("none")
  fireEvent.focus(card)
  expect(card).toHaveAttribute("data-lift", "on")
})

test("减弱动效时玻璃和色块保持静止", () => {
  installMedia({ reduced: true })
  const view = render(<GlassFeatureTrio blur={8} />)
  const root = view.container.querySelector("[data-slot='glass-feature-trio']")
  const card = view.container.querySelector("[data-feature='mesh']") as HTMLButtonElement
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-blur", "8")
  expect(root).toHaveAttribute("data-drift", "off")
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 20, clientY: 16 })
  expect(root).toHaveAttribute("data-state", "idle")
  expect(card.style.transform).toBe("none")
  const mesh = card.querySelector("[data-mesh]") as HTMLElement
  expect(mesh.style.transition).toBe("none")
})
