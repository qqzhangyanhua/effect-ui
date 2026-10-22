// @vitest-environment jsdom

import { createRoot } from "react-dom/client"
import { act } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { afterEach, expect, test, vi } from "vitest"

import { ThemeProvider } from "./theme-provider"

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ""
})

function mount(node: React.ReactNode) {
  const host = document.createElement("div")
  document.body.appendChild(host)
  const root = createRoot(host)
  act(() => root.render(node))
  return () => act(() => root.unmount())
}

function stubMatchMedia() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  )
}

test("客户端渲染 ThemeProvider 不触发 script 标签警告", () => {
  stubMatchMedia()
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  const unmount = mount(<ThemeProvider attribute="class">内容</ThemeProvider>)
  expect(error.mock.calls.map((call) => String(call[0])).filter((m) => m.includes("script tag"))).toEqual([])
  expect(document.querySelector("script")?.getAttribute("type")).toBe("application/json")
  unmount()
})

test("原始 next-themes 在客户端会触发该警告（确认测试有效）", () => {
  stubMatchMedia()
  const error = vi.spyOn(console, "error").mockImplementation(() => {})
  const unmount = mount(<NextThemesProvider attribute="class">内容</NextThemesProvider>)
  expect(error.mock.calls.some((call) => String(call[0]).includes("script tag"))).toBe(true)
  unmount()
})
