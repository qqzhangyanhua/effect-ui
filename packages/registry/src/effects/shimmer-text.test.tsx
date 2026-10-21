// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { ShimmerText } from "./shimmer-text"

afterEach(() => {
  cleanup()
})

test("不传排版 prop 时不写内联样式，文字仍在", () => {
  render(<ShimmerText className="extra">扫光文字</ShimmerText>)
  const text = screen.getByText("扫光文字")
  expect(text).toHaveAttribute("data-slot", "shimmer-text")
  expect(text).not.toHaveAttribute("style")
  expect(text.className).toContain("extra")
  expect(text.className).toContain("animate-[shimmer-sweep_2.4s_linear_infinite]")
  expect(text.className).toContain("motion-reduce:animate-none")
})

test("传入字号、字重、字距和对齐后写到样式上", () => {
  render(
    <ShimmerText fontSize={32} fontWeight={700} letterSpacing={0.05} align="center">
      扫光文字
    </ShimmerText>,
  )
  const style = screen.getByText("扫光文字").getAttribute("style") ?? ""
  expect(style).toContain("font-size: 32px")
  expect(style).toContain("font-weight: 700")
  expect(style).toContain("letter-spacing: 0.05em")
  expect(style).toContain("text-align: center")
})
