// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { BeforeAfterWipe } from "./before-after-wipe"

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
  const entry = getComponent("before-after-wipe")
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

test("对照擦拭默认是竖向手柄，从中间开始", () => {
  expect(start("orientation")).toBe("vertical-handle")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.6)
  expect(start("initial")).toBe(0.5)
  const view = render(<BeforeAfterWipe />)
  const root = view.container.querySelector("[data-slot='before-after-wipe']")
  expect(root).toHaveAttribute("data-ritual", "before-after")
  expect(root).toHaveAttribute("data-orientation", "vertical-handle")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-intensity", "0.6")
  expect(root).toHaveAttribute("data-initial", "0.5")
  expect(root).toHaveAttribute("data-ratio", "0.500")
  expect(root).toHaveAttribute("data-state", "rest")
  expect(root).toHaveAttribute("data-clip", "inset(0 0 0 50%)")
  expect(view.getByText("Before")).toBeInTheDocument()
  expect(view.getByText("After")).toBeInTheDocument()
  expect(view.getByRole("slider", { name: "前后对照" })).toHaveAttribute("aria-valuenow", "50")
  expect(view.queryByRole("button", { name: "Show before" })).not.toBeInTheDocument()
})

test("拖动手柄和方向键都会改变比例", () => {
  const onChange = vi.fn()
  const view = render(<BeforeAfterWipe onChange={onChange} />)
  const root = view.container.querySelector("[data-slot='before-after-wipe']") as HTMLElement
  const slider = view.getByRole("slider", { name: "前后对照" })
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-ratio", "0.600")
  expect(root).toHaveAttribute("data-clip", "inset(0 0 0 60%)")
  expect(root).toHaveAttribute("data-state", "settled")
  expect(slider).toHaveAttribute("aria-valuenow", "60")
  expect(onChange).toHaveBeenLastCalledWith(0.6)
  fireEvent.keyDown(slider, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-ratio", "0.500")
  fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 0, clientY: 0 })
  expect(root).toHaveAttribute("data-state", "dragging")
  fireEvent.pointerMove(slider, { pointerId: 1, clientX: 40, clientY: 0 })
  expect(root).toHaveAttribute("data-ratio", "0.700")
  expect(root).toHaveAttribute("data-clip", "inset(0 0 0 70%)")
  fireEvent.pointerUp(slider, { pointerId: 1, clientX: 40, clientY: 0 })
  expect(root).toHaveAttribute("data-state", "settled")
  expect(root).toHaveAttribute("data-ratio", "0.700")
})

test("横向手柄用垂直方向擦拭", () => {
  const view = render(<BeforeAfterWipe orientation="horizontal-handle" />)
  const root = view.container.querySelector("[data-slot='before-after-wipe']") as HTMLElement
  const slider = view.getByRole("slider", { name: "前后对照" })
  expect(root).toHaveAttribute("data-orientation", "horizontal-handle")
  expect(root).toHaveAttribute("data-clip", "inset(50% 0 0 0)")
  expect(slider).toHaveAttribute("aria-orientation", "vertical")
  fireEvent.keyDown(slider, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-ratio", "0.600")
  expect(root).toHaveAttribute("data-clip", "inset(60% 0 0 0)")
  fireEvent.pointerDown(slider, { button: 0, pointerId: 1, clientX: 0, clientY: 10 })
  fireEvent.pointerMove(slider, { pointerId: 1, clientX: 0, clientY: 50 })
  expect(root).toHaveAttribute("data-ratio", "0.800")
})

test("减弱动效用两个按钮切换全部之前和全部之后", () => {
  installMedia({ reduced: true })
  const view = render(<BeforeAfterWipe />)
  const root = view.container.querySelector("[data-slot='before-after-wipe']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root?.className).toContain("motion-reduce:transition-none")
  expect(view.queryByRole("slider")).not.toBeInTheDocument()
  expect(view.getByText("Before")).toBeInTheDocument()
  expect(view.getByText("After")).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Show after" }))
  expect(root).toHaveAttribute("data-ratio", "0.000")
  expect(root).toHaveAttribute("data-clip", "inset(0 0 0 0%)")
  expect(root).toHaveAttribute("data-state", "settled")
  fireEvent.click(view.getByRole("button", { name: "Show before" }))
  expect(root).toHaveAttribute("data-ratio", "1.000")
  expect(root).toHaveAttribute("data-clip", "inset(0 0 0 100%)")
})
