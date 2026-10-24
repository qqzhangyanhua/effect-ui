// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BookmarkBurstToggle } from "./bookmark-burst-toggle"
import { CircularTextButton } from "./circular-text-button"
import { EmailTemplate } from "./email-template"
import { FlickerReflectButton } from "./flicker-reflect-button"
import { FlowerBurstButton } from "./flower-burst-button"
import { GlowSearchInput } from "./glow-search-input"
import { LockToggle } from "./lock-toggle"
import { MultiLevelDropdown } from "./multi-level-dropdown"
import { NotFoundPage } from "./not-found-page"

import { PropellerOrb } from "./propeller-orb"
import { ScrollCueButton } from "./scroll-cue-button"
import { SignupSplitPage } from "./signup-split-page"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

class IntersectingObserver {
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
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
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

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E"

test("减弱动效时书签、锁、按钮和圆球保持可读", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <BookmarkBurstToggle aria-label="收藏" defaultChecked />
      <LockToggle defaultLocked />
      <CircularTextButton text="环绕" />
      <FlowerBurstButton label="花" />
      <ScrollCueButton autoPlay label="向下" targetId="missing" />
      <FlickerReflectButton flicker={false}>闪</FlickerReflectButton>
      <GlowSearchInput placeholder="搜索" />
      <PropellerOrb size={80} speed={1} />
    </div>,
  )
  expect(screen.getByRole("checkbox", { name: "收藏" })).toBeChecked()
  expect(screen.getByRole("button", { name: "已锁定" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "环绕" })).toHaveAttribute("data-motion", "off")
  expect(screen.getByRole("link", { name: "向下" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "闪" })).toHaveAttribute("data-flicker", "false")
  expect(screen.getByPlaceholderText("搜索")).toBeInTheDocument()
  expect(container.querySelector("[data-slot='propeller-orb']")).toHaveAttribute("aria-hidden", "true")
  expect(container.querySelector("[data-slot='flower-burst-button']")).toHaveAttribute("data-reduced", "true")
})

test("书签、锁和搜索可以切换", () => {
  const onCheckedChange = vi.fn()
  const onLockedChange = vi.fn()
  const onFilterClick = vi.fn()
  render(
    <div>
      <BookmarkBurstToggle aria-label="收藏" onCheckedChange={onCheckedChange} />
      <LockToggle onLockedChange={onLockedChange} />
      <GlowSearchInput onFilterClick={onFilterClick} placeholder="Search..." />
    </div>,
  )
  fireEvent.click(screen.getByRole("checkbox", { name: "收藏" }))
  fireEvent.click(screen.getByRole("button", { name: "未锁定" }))
  fireEvent.click(screen.getByRole("button", { name: "筛选" }))
  expect(onCheckedChange).toHaveBeenCalledWith(true)
  expect(onLockedChange).toHaveBeenCalledWith(true)
  expect(onFilterClick).toHaveBeenCalledOnce()
})

test("环形文字在有链接时渲染锚点", () => {
  render(<CircularTextButton href="#next" text="GO" />)
  const link = screen.getByRole("link")
  expect(link).toHaveAttribute("href", "#next")
  expect(link.querySelectorAll(".circular-letter")).toHaveLength(2)
})

test("滚动提示按 targetId 调用滚动", () => {
  const scrollIntoView = vi.fn()
  render(
    <div>
      <ScrollCueButton label="Scroll" targetId="bottom" />
      <div id="bottom" />
    </div>,
  )
  const target = document.getElementById("bottom")
  if (target) target.scrollIntoView = scrollIntoView
  fireEvent.click(screen.getByRole("link", { name: "Scroll" }))
  expect(scrollIntoView).toHaveBeenCalled()
})

test("404、菜单、邮件和注册", () => {
  const onBack = vi.fn()
  const onSubmit = vi.fn()
  render(
    <div>
      <NotFoundPage imageAlt="配图" imageUrl={pixel} links={[{ title: "文档", description: "说明", href: "#docs" }]} onBack={onBack} title="找不到" variant="image" />
      <MultiLevelDropdown
        items={[
          { id: "profile", label: "资料" },
          { id: "settings", label: "设置", items: [{ id: "keys", label: "快捷键" }] },
        ]}
        label="打开菜单"
      />
      <EmailTemplate body="这是验证码" brand="北岛" code="6289" cta={{ label: "验证", href: "#v" }} title="你好" />
      <SignupSplitPage onSubmit={onSubmit} status="idle" />
    </div>,
  )

  expect(screen.getByRole("img", { name: "配图" })).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "返回" }))
  expect(onBack).toHaveBeenCalled()

  fireEvent.click(screen.getByRole("button", { name: "打开菜单" }))
  expect(screen.getByRole("menu")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("menuitem", { name: "设置" }))
  expect(screen.getByRole("menuitem", { name: "快捷键" })).toBeInTheDocument()
  const menu = screen.getAllByRole("menu")[0]
  if (!menu) throw new Error("menu missing")
  fireEvent.keyDown(menu, { key: "Escape" })

  expect(screen.getByText("6")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "验证" })).toHaveAttribute("href", "#v")

  expect(screen.getByRole("button", { name: "客户" })).toHaveAttribute("aria-pressed", "true")
  fireEvent.click(screen.getByRole("button", { name: "合作者" }))
  expect(screen.getByRole("button", { name: "合作者" })).toHaveAttribute("aria-pressed", "true")
})
