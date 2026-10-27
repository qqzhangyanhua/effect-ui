// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { NeonButton } from "./neon-button"
import { PixelTransition } from "./pixel-transition"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))


test("减弱动效时霓虹按钮和公告不再过渡", () => {
  reduceMotion = true
  render(<NeonButton>霓虹</NeonButton>)
    expect(document.querySelector("[data-slot='neon-button']")).toHaveClass("motion-reduce:transition-none")
  })

test("减弱动效时像素过渡立刻换位", () => {
  reduceMotion = true
  const pixel = render(<PixelTransition from="/a.png" to="/b.png" />)
  expect(pixel.container.querySelector("button")).toHaveAttribute("data-reduced", "true")
  const cell = pixel.container.querySelector(".bg-zinc-950")
  expect(cell).toHaveClass("transition-none")
  expect(cell?.getAttribute("style") ?? "").toContain("0ms")
})


