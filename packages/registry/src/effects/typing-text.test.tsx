// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { TypingText } from "./typing-text"

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
  vi.useRealTimers()
})

test("减弱动效时不传新 prop 也直接显示全文和光标", () => {
  installMatchMedia({ reduce: true })
  render(<TypingText text="Hello" />)
  expect(screen.getByText("Hello")).toBeInTheDocument()
  expect(screen.getByText("Hello")).not.toHaveAttribute("style")
})

test("减弱动效时 delay、loop、interactive 仍显示全文", () => {
  installMatchMedia({ reduce: true })
  render(<TypingText text="Hello" delay={800} loop interactive />)
  expect(screen.getByText("Hello")).toBeInTheDocument()
})

test("字号、字重、字距和对齐写到样式上", () => {
  installMatchMedia({ reduce: true })
  render(<TypingText text="Hello" fontSize={28} fontWeight={700} letterSpacing={0.04} align="center" />)
  const style = screen.getByText("Hello").getAttribute("style") ?? ""
  expect(style).toContain("font-size: 28px")
  expect(style).toContain("font-weight: 700")
  expect(style).toContain("letter-spacing: 0.04em")
  expect(style).toContain("text-align: center")
})

test("触屏上移入不会重头打", () => {
  installMatchMedia({ reduce: false, coarse: true })
  vi.useFakeTimers()
  render(<TypingText text="AB" duration={80} interactive />)
  vi.advanceTimersByTime(80)
  const shown = document.querySelector("[data-slot=typing-text]")?.textContent
  fireEvent.pointerEnter(document.querySelector("[data-slot=typing-text]") as Element)
  vi.advanceTimersByTime(0)
  expect(document.querySelector("[data-slot=typing-text]")?.textContent).toBe(shown)
})
