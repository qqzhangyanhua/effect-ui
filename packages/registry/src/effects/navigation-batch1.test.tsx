// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => undefined }),
}))

import { AnimatedTabs } from "./animated-tabs"
import { AnimatedThemeToggler } from "./animated-theme-toggler"
import { DynamicIsland } from "./dynamic-island"
import { ExpandableNavbar } from "./expandable-navbar"
import { FamilyDrawer } from "./family-drawer"
import { FloatingNavbar } from "./floating-navbar"
import { FlowerMenu } from "./flower-menu"
import { FlowingMenu } from "./flowing-menu"
import { MarkingMenu } from "./marking-menu"
import { SiblingFocusNav } from "./sibling-focus-nav"
import { ToolbarDynamic } from "./toolbar-dynamic"
import { ToolbarExpandable } from "./toolbar-expandable"

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
  Element.prototype.scrollTo = () => {}
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

const tabs = [
  { value: "one", label: "预览", content: "实时预览区域" },
  { value: "two", label: "代码", content: "npx shadcn add …" },
]

const dialActions = [
  { label: "编辑", icon: <span>编</span> },
  { label: "分享", icon: <span>享</span> },
]

const petals = [
  { href: "#north", label: "北" },
  { href: "#east", label: "东" },
  { href: "#south", label: "南" },
  { href: "#west", label: "西" },
  { href: "#up", label: "上" },
  { href: "#down", label: "下" },
]

const navItems = [
  { href: "#one", label: "概览" },
  { href: "#two", label: "组件" },
  { href: "#three", label: "动效" },
  { href: "#four", label: "文档" },
]

const toolbarItems = [
  { id: "user", label: "账户", icon: <span>人</span>, content: <p>北窗账户</p> },
  { id: "bell", label: "通知", icon: <span>铃</span>, content: <p>3 条新消息</p> },
]

const navbarItems = [
  { id: "work", label: "作品", panel: <p>夜航、港口、雾。</p> },
  { id: "notes", label: "笔记", panel: <p>把批注留在句子里面。</p> },
]

test("animated tabs keep both labels and switch the visible panel", () => {
  render(<AnimatedTabs items={tabs} />)
  expect(screen.getByRole("button", { name: "预览" })).toBeInTheDocument()
  expect(screen.getByText("实时预览区域")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "代码" }))
  expect(screen.getByText("npx shadcn add …")).toBeInTheDocument()
})

test("animated tabs still show the first panel when motion is reduced", () => {
  reduceMotion = true
  render(<AnimatedTabs items={tabs} />)
  expect(screen.getByText("实时预览区域")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "代码" })).toBeInTheDocument()
})

test("floating navbar shows its links", () => {
  render(
    <FloatingNavbar>
      <span>Home</span>
      <span>Docs</span>
    </FloatingNavbar>,
  )
  expect(screen.getByText("Home")).toBeInTheDocument()
  expect(screen.getByText("Docs")).toBeInTheDocument()
})

test("floating navbar keeps its links when motion is reduced", () => {
  reduceMotion = true
  render(
    <FloatingNavbar>
      <span>Home</span>
    </FloatingNavbar>,
  )
  expect(screen.getByText("Home")).toBeInTheDocument()
})



test("dynamic island shows the idle clock", () => {
  render(
    <DynamicIsland>
      <span>9:41</span>
    </DynamicIsland>,
  )
  expect(screen.getByText("9:41")).toBeInTheDocument()
})

test("dynamic island keeps the idle clock when motion is reduced", () => {
  reduceMotion = true
  render(
    <DynamicIsland>
      <span>9:41</span>
    </DynamicIsland>,
  )
  expect(screen.getByText("9:41")).toBeInTheDocument()
})

test("theme toggler exposes its button", () => {
  render(<AnimatedThemeToggler />)
  expect(screen.getByRole("button", { name: "切换主题" })).toBeInTheDocument()
})

test("theme toggler keeps its button when motion is reduced", () => {
  reduceMotion = true
  render(<AnimatedThemeToggler />)
  expect(screen.getByRole("button", { name: "切换主题" })).toBeInTheDocument()
})

test("family drawer starts with the open button", () => {
  render(<FamilyDrawer />)
  expect(screen.getByRole("button", { name: "打开 Family" })).toBeInTheDocument()
})

test("family drawer keeps the open button when motion is reduced", () => {
  reduceMotion = true
  render(<FamilyDrawer />)
  expect(screen.getByRole("button", { name: "打开 Family" })).toBeInTheDocument()
})

test("flowing menu lists its default rows", () => {
  render(<FlowingMenu />)
  expect(screen.getByText("Index")).toBeInTheDocument()
  expect(screen.getByText("Contact")).toBeInTheDocument()
})

test("flowing menu keeps its rows when motion is reduced", () => {
  reduceMotion = true
  render(<FlowingMenu />)
  expect(screen.getByText("Studio")).toBeInTheDocument()
  expect(screen.getByText("Archive")).toBeInTheDocument()
})



test("dynamic toolbar shows its icon buttons and the search trigger", () => {
  const { container } = render(<ToolbarDynamic items={toolbarItems} />)
  expect(screen.getByRole("button", { name: "账户" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "搜索" })).toBeInTheDocument()
  expect(slot(container, "toolbar-dynamic")).toHaveAttribute("data-reduced", "false")
})

test("dynamic toolbar marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<ToolbarDynamic items={toolbarItems} />)
  expect(screen.getByRole("button", { name: "通知" })).toBeInTheDocument()
  expect(slot(container, "toolbar-dynamic")).toHaveAttribute("data-reduced", "true")
})

test("expandable toolbar toggles the active icon", () => {
  const { container } = render(<ToolbarExpandable items={toolbarItems} />)
  fireEvent.click(screen.getByRole("button", { name: "账户" }))
  expect(screen.getByRole("button", { name: "账户" })).toHaveAttribute("aria-expanded", "true")
  expect(slot(container, "toolbar-expandable")).toHaveAttribute("data-reduced", "false")
})

test("expandable toolbar shows its panel when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<ToolbarExpandable items={toolbarItems} />)
  fireEvent.click(screen.getByRole("button", { name: "账户" }))
  expect(screen.getByText("北窗账户")).toBeInTheDocument()
  expect(slot(container, "toolbar-expandable")).toHaveAttribute("data-reduced", "true")
})



test("flower menu places six petals around the trigger", () => {
  const { container } = render(<FlowerMenu count={6} items={petals} />)
  expect(screen.getByRole("button", { name: "菜单" })).toHaveAttribute("aria-expanded", "false")
  expect(container.querySelectorAll("a")).toHaveLength(6)
  expect(slot(container, "flower-menu")).not.toHaveAttribute("data-reduced")
})

test("flower menu marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<FlowerMenu count={6} items={petals} />)
  expect(screen.getByRole("button", { name: "菜单" })).toBeInTheDocument()
  expect(container.querySelectorAll("a")).toHaveLength(6)
  expect(slot(container, "flower-menu")).toHaveAttribute("data-reduced", "true")
})

test("sibling focus nav lists its links", () => {
  const { container } = render(<SiblingFocusNav items={navItems} />)
  expect(screen.getByRole("link", { name: "概览" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "文档" })).toBeInTheDocument()
  expect(slot(container, "sibling-focus-nav")).not.toHaveAttribute("data-reduced")
})

test("sibling focus nav marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<SiblingFocusNav items={navItems} />)
  expect(screen.getByRole("link", { name: "组件" })).toBeInTheDocument()
  expect(slot(container, "sibling-focus-nav")).toHaveAttribute("data-reduced", "true")
})

test("marking menu exposes its menu button", () => {
  const { container } = render(<MarkingMenu />)
  expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false")
  expect(slot(container, "marking-menu")).toHaveAttribute("data-reduced", "false")
})

test("marking menu marks reduced motion", () => {
  reduceMotion = true
  const { container } = render(<MarkingMenu />)
  expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument()
  expect(slot(container, "marking-menu")).toHaveAttribute("data-reduced", "true")
})

test("expandable navbar lists its items and reveals the measured panel", () => {
  const { container } = render(<ExpandableNavbar items={navbarItems} />)
  expect(screen.getByRole("navigation", { name: "Expandable navigation" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "作品" }))
  expect(screen.getByRole("button", { name: "作品" })).toHaveAttribute("aria-expanded", "true")
  expect(screen.getByRole("region")).toHaveTextContent("夜航、港口、雾。")
  expect(slot(container, "expandable-navbar")).toHaveAttribute("data-reduced", "false")
})

test("expandable navbar keeps the item labels when motion is reduced", () => {
  reduceMotion = true
  const { container } = render(<ExpandableNavbar items={navbarItems} />)
  expect(screen.getByRole("button", { name: "笔记" })).toBeInTheDocument()
  expect(slot(container, "expandable-navbar")).toHaveAttribute("data-reduced", "true")
})
