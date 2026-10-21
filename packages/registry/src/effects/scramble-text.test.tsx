// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import "@testing-library/jest-dom/vitest"

import { ScrambleText } from "./scramble-text"

function installMatchMedia(options: { reduce?: boolean; coarse?: boolean } = {}) {
  window.matchMedia = (query: string) =>
    ({
      matches:
        (options.reduce === true && query.includes("prefers-reduced-motion")) ||
        (options.coarse === true && query.includes("pointer: coarse")),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

test("不传新 prop 时仍立刻显示文字并使用原有样式", () => {
  installMatchMedia({ reduce: true })
  render(<ScrambleText text="DECRYPT" className="extra" />)
  const node = screen.getByText("DECRYPT")
  expect(node).toHaveAttribute("data-slot", "scramble-text")
  expect(node.className).toContain("font-mono")
  expect(node.className).toContain("extra")
})

test("减弱动效时即使循环或可交互也直接显示全文", () => {
  installMatchMedia({ reduce: true })
  render(<ScrambleText text="DECRYPT" delay={400} loop interactive />)
  expect(screen.getByText("DECRYPT")).toBeInTheDocument()
})

test("delay 在到点之前不开始动画", () => {
  installMatchMedia()
  vi.useFakeTimers()
  const frame = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1)
  render(<ScrambleText text="WAIT" delay={500} />)
  expect(screen.getByText("WAIT")).toBeInTheDocument()
  expect(frame).not.toHaveBeenCalled()
  vi.advanceTimersByTime(500)
  expect(frame).toHaveBeenCalledOnce()
})

test("触屏上移入不会重播，精细指针会重播", () => {
  installMatchMedia({ coarse: true })
  const frame = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1)
  const coarse = render(<ScrambleText text="TAP" interactive />)
  const afterMount = frame.mock.calls.length
  fireEvent.pointerEnter(screen.getByText("TAP"))
  expect(frame.mock.calls.length).toBe(afterMount)
  coarse.unmount()

  installMatchMedia({ coarse: false })
  render(<ScrambleText text="HOVER" interactive />)
  const beforeHover = frame.mock.calls.length
  fireEvent.pointerEnter(screen.getByText("HOVER"))
  expect(frame.mock.calls.length).toBeGreaterThan(beforeHover)
})

test("服务端渲染输出全文，不读取 window", () => {
  const html = renderToString(<ScrambleText text="SAFE" delay={20} loop interactive />)
  expect(html).toContain("SAFE")
  expect(html).toContain('data-slot="scramble-text"')
})
