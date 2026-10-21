// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { GradientText } from "./gradient-text"

function installMatchMedia(reduce = false) {
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

test("不传新 prop 时仍用原来的 Tailwind 渐变类，且不写内联样式", () => {
  installMatchMedia(true)
  render(<GradientText>流动</GradientText>)
  const node = screen.getByText("流动")
  expect(node).not.toHaveAttribute("style")
  expect(node.className).toContain("from-violet-500")
  expect(node.className).toContain("via-fuchsia-500")
  expect(node.className).toContain("to-cyan-400")
  expect(node.className).toContain("motion-reduce:animate-none")
})

test("旧 colors 仍是类名，排版和只播一轮写到同一层，减弱动效类还在", () => {
  installMatchMedia(true)
  render(
    <GradientText colors="from-orange-400 via-rose-500 to-amber-300" fontSize={24} loop={false}>
      暖
    </GradientText>,
  )
  const node = screen.getByText("暖")
  expect(node.className).toContain("from-orange-400")
  expect(node.className).not.toContain("from-violet-500")
  const style = node.getAttribute("style") ?? ""
  expect(style).toContain("font-size: 24px")
  expect(style).toContain("animation-iteration-count: 1")
  expect(node.className).toContain("motion-reduce:animate-none")
})
