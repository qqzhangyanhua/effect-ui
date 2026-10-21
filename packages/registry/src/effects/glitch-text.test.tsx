// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { GlitchText } from "./glitch-text"

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

test("不传新 prop 时保持三层文字和减弱动效类，且不写内联样式", () => {
  installMatchMedia(true)
  render(<GlitchText text="GLITCH" />)
  expect(screen.getAllByText("GLITCH")).toHaveLength(3)
  const root = document.querySelector("[data-slot=glitch-text]")
  expect(root).not.toHaveAttribute("style")
  const layers = root?.querySelectorAll("[aria-hidden]") ?? []
  expect(layers).toHaveLength(2)
  for (const layer of layers) {
    expect(layer.className).toContain("motion-reduce:hidden")
    expect(layer.className).toContain("motion-reduce:animate-none")
  }
})

test("排版写在外层，等待和只播一轮写在故障层上", () => {
  installMatchMedia(true)
  render(<GlitchText text="GLITCH" fontSize={40} loop={false} delay={100} align="center" interactive />)
  const root = document.querySelector("[data-slot=glitch-text]")
  const rootStyle = root?.getAttribute("style") ?? ""
  expect(rootStyle).toContain("font-size: 40px")
  expect(rootStyle).toContain("text-align: center")
  expect(rootStyle).not.toContain("animation-delay")
  const layers = root?.querySelectorAll("[aria-hidden]") ?? []
  expect(layers).toHaveLength(2)
  for (const layer of layers) {
    const style = layer.getAttribute("style") ?? ""
    expect(style).toContain("animation-delay: 100ms")
    expect(style).toContain("animation-iteration-count: 1")
    expect(layer.className).toContain("motion-reduce:hidden")
  }
})
