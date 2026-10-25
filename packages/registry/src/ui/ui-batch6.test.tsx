// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { VideoPlayer } from "./video-player"
import { NotificationCenter } from "./notification-center"
import { Gravity } from "../effects/gravity"
import { AsciiRender } from "../effects/ascii-render"
import { SiriOrb } from "../effects/siri-orb"
import { HeroShader } from "../sections/hero-shader"
import { HeroGlobe } from "../sections/hero-globe"
import { HeroProductMockup } from "../sections/hero-product-mockup"
import { HeroKineticText } from "../sections/hero-kinetic-text"
import { HeroAiPrompt } from "../sections/hero-ai-prompt"
import { HeroParallaxWall } from "../sections/hero-parallax-wall"
import { FooterCurtainReveal } from "../sections/footer-curtain-reveal"
import { FooterGiantWordmark } from "../sections/footer-giant-wordmark"
import { FooterInteractiveWordmark } from "../sections/footer-interactive-wordmark"
import { FooterShaderWordmark } from "../sections/footer-shader-wordmark"
import { NavMorphing } from "../sections/nav-morphing"

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

test("video player mutes from the control bar", async () => {
  const user = userEvent.setup()
  render(<VideoPlayer src="https://example.com/night.mp4" />)
  expect(screen.getByText("0:00 / 0:00")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "静音" }))
  expect(screen.getByRole("button", { name: "取消静音" })).toBeInTheDocument()
})

test("notification center marks the sample as read", async () => {
  const user = userEvent.setup()
  render(<NotificationCenter />)
  await user.click(screen.getByRole("button", { name: "通知" }))
  expect(await screen.findByText("构建完成")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "全部已读" }))
  expect(screen.getByText("构建完成")).toBeInTheDocument()
  expect(screen.queryByText("2")).not.toBeInTheDocument()
})

test("gravity shows the resting labels", () => {
  render(<Gravity />)
  expect(screen.getByText("UI")).toBeInTheDocument()
  expect(screen.getByText("FX")).toBeInTheDocument()
  expect(screen.getByText("MIT")).toBeInTheDocument()
  expect(screen.getByText("React")).toBeInTheDocument()
})

test("siri orb renders at the given size", () => {
  const { container } = render(<SiriOrb size={120} />)
  expect(container.firstElementChild).toHaveStyle({ width: "120px", height: "120px" })
})

test("ascii render shows the loading line", () => {
  render(<AsciiRender src="https://example.com/lamp.jpg" />)
  expect(screen.getByText("加载 ASCII…")).toBeInTheDocument()
})

test("hero shader shows the default title and actions", () => {
  render(<HeroShader />)
  expect(screen.getByRole("heading")).toHaveTextContent("Shaders, blocks, and a copy-paste registry")
  expect(screen.getByRole("button", { name: "开始使用" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "查看文档" })).toBeInTheDocument()
})

test("hero globe shows the default title", () => {
  render(<HeroGlobe />)
  expect(screen.getByRole("heading", { name: "把全球节点画在一颗 5KB 的球上" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "查看覆盖" })).toBeInTheDocument()
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

test("footer curtain reveal shows the brand and a column", () => {
  render(<FooterCurtainReveal />)
  expect(screen.getByText("内容层盖住页脚，滚到底才掀开。")).toBeInTheDocument()
  expect(screen.getByText("effect-ui")).toBeInTheDocument()
  expect(screen.getByText("产品")).toBeInTheDocument()
  expect(screen.getByText("组件")).toBeInTheDocument()
})

test("footer giant wordmark shows the outlined word", () => {
  render(<FooterGiantWordmark />)
  expect(screen.getByRole("img", { name: "effect-ui" })).toBeInTheDocument()
  expect(screen.getByText("灵感来自巨型字标光标描边，原创实现。指针靠近时点亮描边。")).toBeInTheDocument()
})

test("footer interactive wordmark shows a letter control", () => {
  render(<FooterInteractiveWordmark />)
  expect(screen.getByLabelText("EFFECT")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "点击使 C 坠落" })).toBeInTheDocument()
  expect(screen.getByText("字重跟随光标（variable-font-proximity）。点击字母，经 matter-js 坠落。")).toBeInTheDocument()
})

test("footer shader wordmark shows the fallback word", () => {
  render(<FooterShaderWordmark />)
  expect(screen.getByText("effect-ui")).toBeInTheDocument()
  expect(screen.getByText("液态金属 / 抖动着色器填进字标。减弱动效时回退渐变字。")).toBeInTheDocument()
})

test("nav morphing opens and closes the menu", async () => {
  const user = userEvent.setup()
  render(<NavMorphing />)
  expect(screen.getByText("effect-ui")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "打开菜单" }))
  await user.click(screen.getByRole("button", { name: "文档" }))
  expect(screen.getByRole("button", { name: "打开菜单" })).toBeInTheDocument()
})
