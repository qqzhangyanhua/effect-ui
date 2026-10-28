// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { DigitSlotGate, digitSlotAccepted, digitSlotCode, digitSlotCount } from "./digit-slot-gate"

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
  const found = getComponent("digit-slot-gate")?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

function rootOf(container: HTMLElement) {
  const node = container.querySelector("[data-slot='digit-slot-gate']")
  if (!(node instanceof HTMLElement)) throw new Error("missing gate")
  return node
}

function typeCode(root: HTMLElement, code: string) {
  for (const digit of code) fireEvent.keyDown(root, { key: digit })
}

beforeEach(() => {
  installMedia()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test("位槽默认空着，控件起始值等于默认", () => {
  expect(getComponent("digit-slot-gate")?.batch).toBe(79)
  expect(getComponent("digit-slot-gate")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("slots")).toBe(6)
  expect(start("mask")).toBe(true)
  expect(digitSlotCount(5)).toBe(6)
  expect(digitSlotCount(4)).toBe(4)
  expect(digitSlotAccepted(digitSlotCode(6), 6)).toBe(true)
  expect(digitSlotAccepted("111111", 6)).toBe(false)
  const view = render(<DigitSlotGate />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-ritual", "digit-slot")
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-status", "idle")
  expect(root).toHaveAttribute("data-slots", "6")
  expect(root).toHaveAttribute("data-mask", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root).toHaveAttribute("data-shaking", "off")
  expect(root.querySelector("[data-part='rail']")).toBeNull()
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByText("Enter code")).toBeInTheDocument()
  expect(view.queryByText(/bank|wallet|revolut|starling/i)).toBeNull()
})

test("键盘数字、退格和清空，点按数字键也能填", () => {
  const onValueChange = vi.fn()
  const view = render(<DigitSlotGate onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  fireEvent.keyDown(root, { key: "2" })
  fireEvent.keyDown(root, { key: "4" })
  expect(root).toHaveAttribute("data-filled", "2")
  expect(root).toHaveAttribute("data-status", "filling")
  expect(onValueChange).toHaveBeenLastCalledWith({ filled: 2, status: "filling" })
  expect(root.querySelector("[data-part='slot']")).toHaveTextContent("•")
  fireEvent.keyDown(root, { key: "Backspace" })
  expect(root).toHaveAttribute("data-filled", "1")
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-status", "idle")
  fireEvent.click(view.getByRole("button", { name: "Digit 8" }))
  expect(root).toHaveAttribute("data-filled", "1")
  fireEvent.click(view.getByRole("button", { name: "Delete digit" }))
  expect(root).toHaveAttribute("data-filled", "0")
  fireEvent.click(view.getByRole("button", { name: "Digit 1" }))
  fireEvent.keyDown(root, { key: " " })
  expect(root).toHaveAttribute("data-filled", "0")
})

test("四槽可以露出数字", () => {
  const view = render(<DigitSlotGate slots={4} mask={false} />)
  const root = rootOf(view.container)
  expect(root).toHaveAttribute("data-slots", "4")
  expect(root).toHaveAttribute("data-mask", "off")
  fireEvent.click(view.getByRole("button", { name: "Digit 2" }))
  expect(root.querySelector("[data-part='slot']")).toHaveTextContent("2")
  expect(view.getByText(`Sample ${digitSlotCode(4)}`)).toBeInTheDocument()
})

test("错误码抖动后清空，正确码停在成功", async () => {
  vi.useFakeTimers()
  const onValueChange = vi.fn()
  const view = render(<DigitSlotGate onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  typeCode(root, "111111")
  expect(root).toHaveAttribute("data-status", "checking")
  expect(root).toHaveAttribute("data-filled", "6")
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300)
  })
  expect(root).toHaveAttribute("data-status", "fail")
  expect(root).toHaveAttribute("data-shaking", "on")
  expect(root).toHaveAttribute("data-verdict", "fail")
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500)
  })
  expect(root).toHaveAttribute("data-status", "idle")
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-shaking", "off")
  expect(onValueChange).toHaveBeenCalledWith({ filled: 0, status: "idle" })
  typeCode(root, digitSlotCode(6))
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300)
  })
  expect(root).toHaveAttribute("data-status", "success")
  expect(root).toHaveAttribute("data-filled", "6")
  expect(root).toHaveAttribute("data-verdict", "success")
  expect(root).toHaveAttribute("data-shaking", "off")
})

test("减弱动效时错误码瞬时清空，正确码瞬时成功", () => {
  installMedia({ reduced: true })
  const onValueChange = vi.fn()
  const view = render(<DigitSlotGate onValueChange={onValueChange} />)
  const root = rootOf(view.container)
  typeCode(root, "111111")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-status", "idle")
  expect(root).toHaveAttribute("data-filled", "0")
  expect(root).toHaveAttribute("data-shaking", "off")
  expect(root).toHaveAttribute("data-verdict", "fail")
  expect(onValueChange).toHaveBeenCalledWith({ filled: 0, status: "fail" })
  typeCode(root, digitSlotCode(6))
  expect(root).toHaveAttribute("data-status", "success")
  expect(root).toHaveAttribute("data-filled", "6")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-shaking", "off")
})
