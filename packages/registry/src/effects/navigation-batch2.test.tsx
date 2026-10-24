// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BottomNavigation } from "./bottom-navigation"
import { MultiLevelDropdown } from "./multi-level-dropdown"

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
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private readonly callback: IntersectionObserverCallback

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
      }

      observe(target: Element) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
      }

      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

const menuItems = [
  { id: "profile", label: "查看资料", href: "#profile" },
  {
    id: "settings",
    label: "设置",
    items: [
      { id: "shortcuts", label: "快捷键", href: "#keys" },
      { id: "team", label: "团队", href: "#team" },
    ],
  },
  { id: "help", label: "帮助", href: "#help" },
]

const bottomItems = [
  { label: "首页", current: true },
  { label: "钱包" },
  { label: "设置" },
  { label: "我的" },
]





test("multi-level dropdown opens its menu", () => {
  const { container } = render(<MultiLevelDropdown items={menuItems} label="账户" />)
  fireEvent.click(screen.getByRole("button", { name: "账户" }))
  expect(screen.getByRole("button", { name: "账户" })).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByRole("menuitem", { name: "查看资料" })).toBeInTheDocument()
  expect(slot(container, "multi-level-dropdown")).toHaveAttribute("data-reduced", "false")
})

test("multi-level dropdown keeps the trigger when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<MultiLevelDropdown items={menuItems} label="账户" />)
  expect(screen.getByRole("button", { name: "账户" })).toHaveAttribute("aria-expanded", "false")
  expect(slot(container, "multi-level-dropdown")).toHaveAttribute("data-reduced", "true")
})

test("bottom navigation marks the current item", () => {
  const { container } = render(<BottomNavigation items={bottomItems} />)
  expect(screen.getByRole("button", { name: "首页" })).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("button", { name: "我的" })).toBeInTheDocument()
  expect(slot(container, "bottom-navigation")).toHaveAttribute("data-reduced", "false")
})

test("bottom navigation marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<BottomNavigation items={bottomItems} />)
  expect(screen.getByRole("button", { name: "钱包" })).toBeInTheDocument()
  expect(slot(container, "bottom-navigation")).toHaveAttribute("data-reduced", "true")
})
