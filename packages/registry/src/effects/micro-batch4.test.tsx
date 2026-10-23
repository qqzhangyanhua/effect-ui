// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { useState } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { FloatingButtonGroup } from "./floating-button-group"
import { IconSwap } from "./icon-swap"
import { MorphSelect } from "./morph-select"
import { ThemeSwitch } from "./theme-switch-transitions"

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        this.callback(
          [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot=${name}]`)
  expect(node).toBeTruthy()
  return node as HTMLElement
}

function ThemeHarness() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  return <ThemeSwitch label="切换主题" theme={theme} onThemeChange={(next) => setTheme(next)} />
}

const cities = [
  { value: "song", label: "上海" },
  { value: "guang", label: "广州" },
]

test("图标交换能按下", () => {
  render(<IconSwap aria-label="开关" off={<span>关</span>} on={<span>开</span>} />)
  const swap = screen.getByRole("button", { name: "开关" })
  expect(swap).toHaveAttribute("aria-pressed", "false")
  fireEvent.click(swap)
  expect(swap).toHaveAttribute("aria-pressed", "true")
})

test("图标交换在减弱动效时仍能按下", () => {
  reduceMotion = true
  const view = render(<IconSwap aria-label="开关" off={<span>关</span>} on={<span>开</span>} />)
  expect(slot(view.container, "icon-swap")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "开关" }))
  expect(screen.getByRole("button", { name: "开关" })).toHaveAttribute("aria-pressed", "true")
})

test("主题开关能切到暗色", () => {
  render(<ThemeHarness />)
  const toggle = screen.getByRole("button", { name: "切换主题" })
  expect(toggle).toHaveAttribute("aria-pressed", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-pressed", "true")
})

test("主题开关在减弱动效时仍能切到暗色", () => {
  reduceMotion = true
  const view = render(<ThemeHarness />)
  expect(slot(view.container, "theme-switch-transitions")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "切换主题" }))
  expect(screen.getByRole("button", { name: "切换主题" })).toHaveAttribute("aria-pressed", "true")
})

test("浮动按钮组能点到加粗", () => {
  const onAction = vi.fn()
  render(<FloatingButtonGroup items={[{ id: "bold", label: "加粗" }]} label="编辑" onAction={onAction} />)
  fireEvent.click(screen.getByRole("button", { name: "加粗" }))
  expect(onAction).toHaveBeenCalledWith("bold")
})

test("浮动按钮组在减弱动效时仍能点到加粗", () => {
  reduceMotion = true
  const onAction = vi.fn()
  const view = render(<FloatingButtonGroup items={[{ id: "bold", label: "加粗" }]} label="编辑" onAction={onAction} />)
  expect(slot(view.container, "floating-button-group")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "加粗" }))
  expect(onAction).toHaveBeenCalledWith("bold")
})

test("变形选择能选中广州", () => {
  render(<MorphSelect items={cities} label="城市" onValueChange={() => undefined} />)
  fireEvent.click(screen.getByRole("combobox", { name: "城市" }))
  fireEvent.click(screen.getByRole("option", { name: "广州" }))
  expect(screen.getByRole("combobox", { name: "城市" })).toHaveTextContent("广州")
})

test("变形选择在减弱动效时仍能选中广州", () => {
  reduceMotion = true
  const view = render(<MorphSelect items={cities} label="城市" onValueChange={() => undefined} />)
  expect(slot(view.container, "morph-select")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("combobox", { name: "城市" }))
  fireEvent.click(screen.getByRole("option", { name: "广州" }))
  expect(screen.getByRole("combobox", { name: "城市" })).toHaveTextContent("广州")
})
