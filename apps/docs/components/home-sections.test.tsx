// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"

import HomePage from "../app/page"

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: { children?: ReactNode; href: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}))

function installBrowser(reduced: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  })
}

beforeEach(() => {
  installBrowser(false)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("首页三段把标题和主按钮留在可点的前景里", () => {
  render(<HomePage />)

  const title = screen.getByRole("heading", { level: 1, name: /特效和基础组件/ })
  expect(title.closest("[aria-hidden='true']")).toBeNull()

  const start = screen.getByRole("link", { name: "开始使用" })
  expect(start.getAttribute("href")).toBe("/docs")

  const browse = screen.getByRole("link", { name: /浏览全部组件/ })
  expect(browse.getAttribute("href")).toBe("/docs")
  expect(browse.closest("[aria-hidden='true']")).toBeNull()

  const hero = document.querySelector("[data-home-zone='hero']")
  const cta = document.querySelector("[data-home-zone='cta']")
  expect(hero?.querySelector("[data-slot='aurora-background']")).not.toBeNull()
  expect(cta?.querySelector("[data-slot='aurora-background']")).not.toBeNull()
  expect(hero?.querySelector("[data-home-atmosphere]")?.getAttribute("data-motion")).toBe("paused")
  expect(document.querySelector("[data-home-zone='showcase']")?.getAttribute("data-motion")).toBe("paused")
  expect(screen.getByText("光标跟着句子往下写")).toBeTruthy()
  expect(screen.getByText("句子滑上来")).toBeTruthy()
})

test("展示区分类可切换，离开视口时不挂上循环文字", async () => {
  const user = userEvent.setup()
  render(<HomePage />)

  expect(document.querySelector("[data-slot='text-rotate']")).toBeNull()

  await user.click(screen.getByRole("tab", { name: "流光边框" }))
  expect(screen.getByText("电流只走边，不盖住字")).toBeTruthy()
  expect(document.querySelector("[data-slot='electric-border']")).not.toBeNull()
  expect(document.querySelector("[data-slot='glowing-edge']")).toBeNull()

  await user.click(screen.getByRole("tab", { name: "动态按钮" }))
  expect(screen.getByRole("button", { name: "探索全部组件" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "按一下回弹" })).toBeTruthy()
})

test("减弱动效时正文仍在，氛围停在静态", () => {
  cleanup()
  installBrowser(true)
  render(<HomePage />)

  expect(screen.getByRole("heading", { level: 1, name: /放进同一套工具箱/ })).toBeTruthy()
  expect(screen.getByText("已显示终稿")).toBeTruthy()
  expect(screen.getByText("句子滑上来")).toBeTruthy()
  expect(document.querySelector("[data-home-zone='hero'] [data-home-atmosphere]")?.getAttribute("data-motion")).toBe(
    "off",
  )
  expect(document.querySelector("[data-home-zone='cta'] [data-slot='aurora-background']")).not.toBeNull()
})
