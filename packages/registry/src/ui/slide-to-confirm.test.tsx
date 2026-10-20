// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { SlideToConfirm } from "./slide-to-confirm"

beforeAll(() => {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
})

afterEach(() => {
  cleanup()
})

function drag(slider: HTMLElement, clientX: number) {
  const track = slider.parentElement
  if (!track) throw new Error("缺少轨道")
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 200,
    bottom: 40,
    width: 200,
    height: 40,
    toJSON() {
      return {}
    },
  })
  fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0, button: 0 })
  fireEvent.pointerMove(slider, { pointerId: 1, clientX })
  fireEvent.pointerUp(slider, { pointerId: 1, clientX })
}

test("未过阈值不确认，拖过阈值确认一次并复位", () => {
  const onConfirm = vi.fn()
  render(<SlideToConfirm label="删除" threshold={0.8} onConfirm={onConfirm} />)
  const slider = screen.getByRole("slider", { name: "删除" })

  drag(slider, 100)
  expect(onConfirm).not.toHaveBeenCalled()
  expect(slider).toHaveAttribute("aria-valuenow", "0")

  drag(slider, 180)
  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(slider).toHaveAttribute("aria-valuenow", "0")
})

test("方向键逐步推进，Enter 直接确认", () => {
  const onConfirm = vi.fn()
  render(<SlideToConfirm label="删除" threshold={0.8} onConfirm={onConfirm} />)
  const slider = screen.getByRole("slider", { name: "删除" })
  slider.focus()

  for (let step = 0; step < 7; step += 1) fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(onConfirm).not.toHaveBeenCalled()
  expect(slider).toHaveAttribute("aria-valuenow", "70")

  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(slider).toHaveAttribute("aria-valuenow", "0")

  fireEvent.keyDown(slider, { key: "Enter" })
  expect(onConfirm).toHaveBeenCalledTimes(2)
})

test("禁用时拖动和键盘都不确认", () => {
  const onConfirm = vi.fn()
  render(<SlideToConfirm label="删除" disabled onConfirm={onConfirm} />)
  const slider = screen.getByRole("slider", { name: "删除" })

  drag(slider, 200)
  fireEvent.keyDown(slider, { key: "Enter" })
  expect(onConfirm).not.toHaveBeenCalled()
})
