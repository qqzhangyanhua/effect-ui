// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { HeroShader } from "../sections/hero-shader"
import { HeroProductMockup } from "../sections/hero-product-mockup"
import { HeroKineticText } from "../sections/hero-kinetic-text"
import { HeroAiPrompt } from "../sections/hero-ai-prompt"
import { HeroParallaxWall } from "../sections/hero-parallax-wall"
import { FooterGiantWordmark } from "../sections/footer-giant-wordmark"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
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
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})


test("hero shader shows the default title and actions", () => {
  render(<HeroShader />)
  expect(screen.getByRole("heading")).toHaveTextContent("Shaders, blocks, and a copy-paste registry")
  expect(screen.getByRole("button", { name: "开始使用" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "查看文档" })).toBeInTheDocument()
})


test("hero product mockup shows the default screen", () => {
  render(<HeroProductMockup />)
  expect(screen.getByRole("heading", { name: "产品在滚动里抬起，带着光晕入场" })).toBeInTheDocument()
  expect(screen.getByText("Product surface")).toBeInTheDocument()
})

test("hero kinetic text shows the lead and annotation", () => {
  render(<HeroKineticText />)
  expect(screen.getByRole("heading")).toHaveTextContent("Interfaces that")
  expect(screen.getByText("hand-drawn")).toBeInTheDocument()
})

test("hero ai prompt fills a suggestion", async () => {
  const user = userEvent.setup()
  const submitted: string[] = []
  render(<HeroAiPrompt onSubmit={(value) => submitted.push(value)} />)
  expect(screen.getByRole("heading", { name: "描述你想要的界面" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "生成定价页" }))
  expect(screen.getByPlaceholderText("做一个带着色器背景、地球仪和定价表的落地页…")).toHaveValue("生成定价页")
  await user.click(screen.getByRole("button", { name: "生成" }))
  expect(submitted).toEqual(["生成定价页"])
})

test("hero parallax wall shows the first card", () => {
  render(<HeroParallaxWall />)
  expect(screen.getByRole("heading", { name: "倾斜卡片墙，反向视差" })).toBeInTheDocument()
  expect(screen.getByText("Aurora")).toBeInTheDocument()
})


test("footer giant wordmark shows the outlined word", () => {
  render(<FooterGiantWordmark />)
  expect(screen.getByRole("img", { name: "effect-ui" })).toBeInTheDocument()
  expect(screen.getByText("灵感来自巨型字标光标描边，原创实现。指针靠近时点亮描边。")).toBeInTheDocument()
})


