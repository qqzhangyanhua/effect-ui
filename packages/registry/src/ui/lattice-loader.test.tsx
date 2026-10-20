// @vitest-environment jsdom

import { afterEach, expect, test } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { LatticeLoader } from "./lattice-loader"

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

test("按行列渲染加载状态", () => {
  installMatchMedia(false)
  render(<LatticeLoader rows={2} cols={3} />)
  const status = screen.getByRole("status", { name: "加载中" })
  expect(status.querySelectorAll("span")).toHaveLength(6)
  expect(status).toHaveAttribute("data-reduced", "false")
})

test("减弱动效时静止", () => {
  installMatchMedia(true)
  render(<LatticeLoader />)
  expect(screen.getByRole("status", { name: "加载中" })).toHaveAttribute("data-reduced", "true")
})
