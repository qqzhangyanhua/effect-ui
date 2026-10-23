// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BottomNavigation } from "./bottom-navigation"
import { CollapsibleSideMenu } from "./collapsible-side-menu"
import { ExpandingIconTabs } from "./expanding-icon-tabs"
import { MultiLevelDropdown } from "./multi-level-dropdown"
import { TabNavigation, TabNavigationLink } from "./tab-navigation"

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

const iconTabs = [
  { value: "general", label: "总览", icon: <span>✧</span> },
  { value: "about", label: "关于", icon: <span>i</span> },
  { value: "privacy", label: "隐私", icon: <span>◉</span> },
]

const sideItems = [
  { id: "general", label: "总览", href: "#general", current: true },
  {
    id: "teams",
    label: "团队",
    defaultOpen: true,
    items: [
      { id: "banned", label: "封禁用户", href: "#banned", badge: 3 },
      { id: "calendar", label: "日历", href: "#calendar" },
    ],
  },
]

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

function tabs() {
  return (
    <TabNavigation>
      <TabNavigationLink active href="#night">
        夜航
      </TabNavigationLink>
      <TabNavigationLink href="#light">灯塔</TabNavigationLink>
      <TabNavigationLink disabled href="#deck">
        甲板
      </TabNavigationLink>
    </TabNavigation>
  )
}

test("tab navigation marks the current page and disables the last link", () => {
  render(tabs())
  expect(screen.getByRole("link", { name: "夜航" })).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("link", { name: "灯塔" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "甲板" })).toHaveAttribute("aria-disabled", "true")
})

test("tab navigation marks reduced motion on each link", () => {
  reduceMotion = true
  const { container } = render(tabs())
  expect(screen.getByRole("link", { name: "夜航" })).toHaveAttribute("aria-current", "page")
  expect(container.querySelectorAll('[data-slot="tab-navigation-link"][data-reduced="true"]')).toHaveLength(3)
})

test("expanding icon tabs select another tab", () => {
  const { container } = render(<ExpandingIconTabs tabs={iconTabs} />)
  expect(screen.getByRole("tab", { name: "总览" })).toHaveAttribute("aria-selected", "true")
  fireEvent.click(screen.getByRole("tab", { name: "关于" }))
  expect(screen.getByRole("tab", { name: "关于" })).toHaveAttribute("aria-selected", "true")
  expect(slot(container, "expanding-icon-tabs")).toHaveAttribute("data-reduced", "false")
})

test("expanding icon tabs show the selected label when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<ExpandingIconTabs tabs={iconTabs} />)
  expect(screen.getByRole("tab", { name: "总览" })).toHaveTextContent("总览")
  expect(slot(container, "expanding-icon-tabs")).toHaveAttribute("data-reduced", "true")
})

test("collapsible side menu shows the current page and an open group", () => {
  const { container } = render(<CollapsibleSideMenu items={sideItems} />)
  expect(screen.getByRole("link", { name: "总览" })).toHaveAttribute("aria-current", "page")
  expect(screen.getByRole("link", { name: /封禁用户/ })).toBeInTheDocument()
  expect(slot(container, "collapsible-side-menu")).toHaveAttribute("data-reduced", "false")
})

test("collapsible side menu marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<CollapsibleSideMenu items={sideItems} />)
  expect(screen.getByText("团队")).toBeInTheDocument()
  expect(slot(container, "collapsible-side-menu")).toHaveAttribute("data-reduced", "true")
})

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
