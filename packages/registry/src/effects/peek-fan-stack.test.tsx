// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { PeekFanStack } from "./peek-fan-stack"

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

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
  const entry = getComponent("peek-fan-stack")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function stackOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='peek-fan-stack']")
  if (!(node instanceof HTMLElement)) throw new Error("missing fan")
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("扇叠控件起始值等于默认，卡内有三层", async () => {
  expect(getComponent("peek-fan-stack")?.batch).toBe(68)
  expect(getComponent("peek-fan-stack")?.effectCategory).toBe("cards")
  expect(start("intensity")).toBe(0.7)
  expect(start("pace")).toBe(1)
  expect(start("gap")).toBe(18)
  expect(start("radius")).toBe(18)
  const view = render(<PeekFanStack />)
  const root = stackOf(view.container)
  const card = view.getByRole("group", { name: "北墙" })
  expect(root).toHaveAttribute("data-ritual", "peek-fan")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-gap", "18")
  expect(root).toHaveAttribute("data-radius", "18")
  expect(card).toHaveAttribute("data-state", "idle")
  expect(card.tabIndex).toBe(0)
  expect(view.getByRole("group", { name: "东廊" }).tabIndex).toBe(0)
  expect(view.getByRole("group", { name: "西厅" }).tabIndex).toBe(0)
  expect(card.querySelector("[data-layer='front']")).toBeTruthy()
  expect(card.querySelector("[data-layer='back-left']")).toBeTruthy()
  expect(card.querySelector("[data-layer='back-right']")).toBeTruthy()
  expect(Number(card.getAttribute("data-fan"))).toBeGreaterThan(0)
  expect(root.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("聚焦和悬停会扇开，离开后回到较小的角度", () => {
  const onSelect = vi.fn()
  const view = render(<PeekFanStack onSelect={onSelect} />)
  const card = view.getByRole("group", { name: "北墙" })
  const resting = Number(card.getAttribute("data-fan"))
  fireEvent.focus(card)
  expect(card).toHaveAttribute("data-state", "fanned")
  expect(Number(card.getAttribute("data-fan"))).toBeGreaterThan(resting)
  fireEvent.blur(card)
  expect(card).toHaveAttribute("data-state", "resting")
  expect(Number(card.getAttribute("data-fan"))).toBeCloseTo(resting, 1)

  fireEvent.pointerEnter(card, { pointerType: "mouse" })
  expect(card).toHaveAttribute("data-state", "fanned")
  fireEvent.pointerLeave(card)
  expect(card).toHaveAttribute("data-state", "resting")
  fireEvent.keyDown(card, { key: "Enter" })
  expect(onSelect).toHaveBeenCalledWith("north")
})

test("粗指针悬停不扇开，点按才切换", () => {
  installMedia({ coarse: true })
  const onSelect = vi.fn()
  const view = render(<PeekFanStack onSelect={onSelect} />)
  const card = view.getByRole("group", { name: "北墙" })
  expect(stackOf(view.container)).toHaveAttribute("data-pointer", "coarse")
  fireEvent.pointerEnter(card, { pointerType: "mouse" })
  fireEvent.pointerEnter(card, { pointerType: "touch" })
  expect(card).toHaveAttribute("data-state", "idle")
  fireEvent.click(card)
  expect(card).toHaveAttribute("data-state", "fanned")
  expect(onSelect).toHaveBeenCalledWith("north")
  fireEvent.click(card)
  expect(card).toHaveAttribute("data-state", "resting")
})

test("减弱动效保持静止叠层，焦点不改变扇角", () => {
  installMedia({ reduced: true })
  const onSelect = vi.fn()
  const view = render(<PeekFanStack onSelect={onSelect} />)
  const root = stackOf(view.container)
  const card = view.getByRole("group", { name: "北墙" })
  expect(root).toHaveAttribute("data-motion", "off")
  expect(card).toHaveAttribute("data-fan", "0.0")
  expect(card).toHaveAttribute("data-state", "idle")
  expect(card.className).toContain("motion-reduce:transition-none")
  fireEvent.focus(card)
  fireEvent.pointerEnter(card, { pointerType: "mouse" })
  expect(card).toHaveAttribute("data-fan", "0.0")
  expect(card).toHaveAttribute("data-state", "idle")
  fireEvent.click(card)
  expect(onSelect).toHaveBeenCalledWith("north")
  expect(card).toHaveAttribute("data-fan", "0.0")
})

test("离开视口后扇角仍由焦点决定，没有循环帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<PeekFanStack />)
  const root = stackOf(view.container)
  const card = view.getByRole("group", { name: "东廊" })
  expect(root).toHaveAttribute("data-live", "off")
  fireEvent.focus(card)
  expect(card).toHaveAttribute("data-state", "fanned")
})
