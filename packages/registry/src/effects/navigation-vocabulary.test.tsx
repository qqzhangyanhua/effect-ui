// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { AnimatedTabs } from "./animated-tabs"
import { AnimatedThemeToggler } from "./animated-theme-toggler"
import { Dock } from "./dock"
import { DynamicIsland } from "./dynamic-island"
import { FamilyDrawer } from "./family-drawer"
import { FloatingNavbar } from "./floating-navbar"
import { FlowingMenu } from "./flowing-menu"
import { LiquidGlassTabbar } from "../ui/liquid-glass-tabbar"

const TABS = [
  { value: "one", label: "预览", content: "甲" },
  { value: "two", label: "代码", content: "乙" },
]

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

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

function markup(node: Element) {
  return node.outerHTML
    .replace(/ id="[^"]*"/g, "")
    .replace(/ aria-controls="[^"]*"/g, "")
    .replace(/url\(#[^)]*\)/g, "url(#id)")
    .replace(/url\(&quot;#[^&]*&quot;\)/g, "url(#id)")
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test("起始值与不传的标记相同", () => {
  const dock = render(
    <Dock>
      <span>A</span>
    </Dock>,
  )
  const dockSame = render(
    <Dock magnification={52} size={40} gap={8}>
      <span>A</span>
    </Dock>,
  )
  expect(markup(dockSame.container)).toBe(markup(dock.container))
  expect(dock.container.innerHTML).toContain("gap-2")

  const tabs = render(<AnimatedTabs items={TABS} />)
  const tabsSame = render(<AnimatedTabs items={TABS} gap={4} />)
  expect(markup(tabsSame.container)).toBe(markup(tabs.container))
  expect(tabs.container.innerHTML).toContain("gap-1")

  const nav = render(
    <FloatingNavbar>
      <span>Home</span>
    </FloatingNavbar>,
  )
  const navSame = render(
    <FloatingNavbar duration={250} intensity={1}>
      <span>Home</span>
    </FloatingNavbar>,
  )
  expect(markup(navSame.container)).toBe(markup(nav.container))
  expect(nav.container.innerHTML).toContain("gap-3")

  const island = render(<DynamicIsland>9:41</DynamicIsland>)
  const islandSame = render(
    <DynamicIsland duration={180} intensity={1}>
      9:41
    </DynamicIsland>,
  )
  expect(markup(islandSame.container)).toBe(markup(island.container))

  const theme = render(<AnimatedThemeToggler />)
  const themeSame = render(<AnimatedThemeToggler duration={500} />)
  expect(markup(themeSame.container)).toBe(markup(theme.container))

  const family = render(<FamilyDrawer />)
  const familySame = render(<FamilyDrawer intensity={1} />)
  expect(markup(familySame.container)).toBe(markup(family.container))

  const glass = render(<LiquidGlassTabbar />)
  const glassSame = render(<LiquidGlassTabbar speed={1} intensity={1} scale={1} />)
  expect(markup(glassSame.container)).toBe(markup(glass.container))
  expect(glass.container.innerHTML).toContain('stdDeviation="8"')

  const menu = render(<FlowingMenu />)
  const menuSame = render(<FlowingMenu duration={380} speed={1} />)
  expect(markup(menuSame.container)).toBe(markup(menu.container))
})

test("改值会改变能看见的标记", () => {
  const dock = render(
    <Dock gap={20}>
      <span>A</span>
    </Dock>,
  )
  expect(dock.container.innerHTML).not.toContain("gap-2")
  expect(dock.container.innerHTML).toContain("20px")

  installMatchMedia(true)
  const rest = render(
    <Dock size={56}>
      <span>A</span>
    </Dock>,
  )
  expect(rest.container.innerHTML).toContain("56px")
  installMatchMedia(false)

  const tabs = render(<AnimatedTabs items={TABS} gap={12} />)
  expect(tabs.container.innerHTML).not.toContain("gap-1")
  expect(tabs.container.innerHTML).toContain("12px")

  const glass = render(<LiquidGlassTabbar scale={2} />)
  expect(glass.container.innerHTML).toContain('stdDeviation="16"')
  expect(glass.container.innerHTML).toContain("1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10")
})

test("减弱动效时渲染不抛错", () => {
  installMatchMedia(true)
  render(
    <Dock>
      <span>A</span>
    </Dock>,
  )
  render(<AnimatedTabs items={TABS} />)
  render(
    <FloatingNavbar>
      <span>Home</span>
    </FloatingNavbar>,
  )
  render(<DynamicIsland duration={180} intensity={1}>9:41</DynamicIsland>)
  render(<AnimatedThemeToggler />)
  render(<FamilyDrawer />)
  render(<LiquidGlassTabbar />)
  render(<FlowingMenu />)
})
