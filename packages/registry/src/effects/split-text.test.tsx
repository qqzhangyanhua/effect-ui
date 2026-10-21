// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { SplitText } from "./split-text"

function installMatchMedia(reduce: boolean) {
  window.matchMedia = (query: string) =>
    ({
      matches: reduce && query.includes("prefers-reduced-motion"),
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
})

test("不传新 prop 时文字按原样拆开，且不写排版样式", () => {
  installMatchMedia(true)
  const view = render(<SplitText text="Hi" delay={0.4} by="char" />)
  expect(view.container.textContent).toBe("Hi")
  expect(view.container.querySelector("[data-slot=split-text]")).not.toHaveAttribute("style")
})

test("减弱动效时仍显示全文，传入排版 prop 后写到样式上", () => {
  installMatchMedia(true)
  const view = render(
    <SplitText text="Hi" fontSize={22} fontWeight={600} letterSpacing={0.02} align="right" loop interactive />,
  )
  expect(view.container.textContent).toBe("Hi")
  const style = view.container.querySelector("[data-slot=split-text]")?.getAttribute("style") ?? ""
  expect(style).toContain("font-size: 22px")
  expect(style).toContain("font-weight: 600")
  expect(style).toContain("letter-spacing: 0.02em")
  expect(style).toContain("text-align: right")
  expect(style).not.toContain("width")
})
