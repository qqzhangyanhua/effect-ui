// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Letter3DSwap } from "./letter-3d-swap"
import { LetterSwapPingPong } from "./letter-swap-pingpong"
import { RandomLetterSwap } from "./random-letter-swap"
import { TextDrop } from "./text-drop"
import { TextHighlighter } from "./text-highlighter"
import { UnderlineHoverLink } from "./underline-hover-link"
import { UnderlineToBackground } from "./underline-to-background"
import { VerticalCutReveal } from "./vertical-cut-reveal"

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

test("翻面文字显示正面", () => {
  const view = render(
    <Letter3DSwap rotateDirection="top" staggerDuration={0.03} staggerFrom="first">
      翻面
    </Letter3DSwap>,
  )
  expect(slot(view.container, "letter-3d-swap").textContent).toContain("翻面")
  expect(slot(view.container, "letter-3d-swap")).toHaveAttribute("data-reduced", "false")
})

test("翻面文字在减弱动效下仍显示正面", () => {
  reduceMotion = true
  const view = render(
    <Letter3DSwap rotateDirection="top" staggerDuration={0.03} staggerFrom="first">
      翻面
    </Letter3DSwap>,
  )
  expect(slot(view.container, "letter-3d-swap").textContent).toContain("翻面")
  expect(slot(view.container, "letter-3d-swap")).toHaveAttribute("data-reduced", "true")
})

test("裁切揭示读出整句", () => {
  const view = render(
    <VerticalCutReveal reverse={false} splitBy="characters" staggerDuration={0.2}>
      雾散以后
    </VerticalCutReveal>,
  )
  expect(screen.getByText("雾散以后")).toBeInTheDocument()
  expect(slot(view.container, "vertical-cut-reveal")).toHaveAttribute("data-reduced", "false")
})

test("裁切揭示在减弱动效下仍读出整句", () => {
  reduceMotion = true
  const view = render(
    <VerticalCutReveal reverse={false} splitBy="characters" staggerDuration={0.2}>
      雾散以后
    </VerticalCutReveal>,
  )
  expect(screen.getByText("雾散以后")).toBeInTheDocument()
  expect(slot(view.container, "vertical-cut-reveal")).toHaveAttribute("data-reduced", "true")
})

test("荧光笔标出正文", () => {
  const view = render(
    <TextHighlighter direction="ltr" highlightColor="hsl(48, 96%, 76%)" triggerType="auto">
      这段话被荧光笔标出来
    </TextHighlighter>,
  )
  expect(slot(view.container, "text-highlighter").textContent).toContain("这段话被荧光笔标出来")
  expect(slot(view.container, "text-highlighter")).toHaveAttribute("data-reduced", "false")
})

test("荧光笔在减弱动效下仍标出正文", () => {
  reduceMotion = true
  const view = render(
    <TextHighlighter direction="ltr" highlightColor="hsl(48, 96%, 76%)" triggerType="auto">
      这段话被荧光笔标出来
    </TextHighlighter>,
  )
  expect(slot(view.container, "text-highlighter").textContent).toContain("这段话被荧光笔标出来")
  expect(slot(view.container, "text-highlighter")).toHaveAttribute("data-reduced", "true")
})

test("下划线铺成背景后仍是链接", () => {
  const view = render(
    <UnderlineToBackground as="a" href="#north" targetTextColor="#1e1b4b">
      北窗航线
    </UnderlineToBackground>,
  )
  expect(screen.getByRole("link", { name: "北窗航线" })).toHaveAttribute("href", "#north")
  expect(slot(view.container, "underline-to-background")).toHaveAttribute("data-reduced", "false")
})

test("下划线铺成背景在减弱动效下仍是链接", () => {
  reduceMotion = true
  const view = render(
    <UnderlineToBackground as="a" href="#north" targetTextColor="#1e1b4b">
      北窗航线
    </UnderlineToBackground>,
  )
  expect(screen.getByRole("link", { name: "北窗航线" })).toBeInTheDocument()
  expect(slot(view.container, "underline-to-background")).toHaveAttribute("data-reduced", "true")
})

test("落下文字显示整句", () => {
  const view = render(<TextDrop delay={0} stagger={0.035} text="夜航开始" />)
  expect(slot(view.container, "text-drop").textContent).toContain("夜航开始")
  expect(slot(view.container, "text-drop")).toHaveAttribute("data-reduced", "false")
})

test("落下文字在减弱动效下直接显示整句", () => {
  reduceMotion = true
  const view = render(<TextDrop delay={0} stagger={0.035} text="夜航开始" />)
  expect(screen.getByText("夜航开始")).toBeInTheDocument()
  expect(slot(view.container, "text-drop")).toHaveAttribute("data-reduced", "true")
})

test("往返换字显示标签", () => {
  const view = render(<LetterSwapPingPong label="往返" reverse staggerDuration={0.03} />)
  expect(slot(view.container, "letter-swap-pingpong").textContent).toContain("往返")
  expect(slot(view.container, "letter-swap-pingpong")).toHaveAttribute("data-reduced", "false")
})

test("往返换字在减弱动效下仍显示标签", () => {
  reduceMotion = true
  const view = render(<LetterSwapPingPong label="往返" reverse staggerDuration={0.03} />)
  expect(slot(view.container, "letter-swap-pingpong").textContent).toContain("往返")
  expect(slot(view.container, "letter-swap-pingpong")).toHaveAttribute("data-reduced", "true")
})

test("随机换字显示标签", () => {
  const view = render(<RandomLetterSwap label="随机" reverse staggerDuration={0.02} />)
  expect(slot(view.container, "random-letter-swap").textContent).toContain("随机")
  expect(slot(view.container, "random-letter-swap")).toHaveAttribute("data-reduced", "false")
})

test("随机换字在减弱动效下仍显示标签", () => {
  reduceMotion = true
  const view = render(<RandomLetterSwap label="随机" reverse staggerDuration={0.02} />)
  expect(slot(view.container, "random-letter-swap").textContent).toContain("随机")
  expect(slot(view.container, "random-letter-swap")).toHaveAttribute("data-reduced", "true")
})

test("悬停下划线第一条是中间长出的链接", () => {
  const view = render(
    <div>
      <UnderlineHoverLink direction="left" href="#center" variant="center">
        从中间
      </UnderlineHoverLink>
      <UnderlineHoverLink direction="right" href="#in-out" variant="in-out">
        从右侧
      </UnderlineHoverLink>
    </div>,
  )
  expect(screen.getByRole("link", { name: "从中间" })).toHaveAttribute("href", "#center")
  expect(screen.getByRole("link", { name: "从右侧" })).toHaveAttribute("href", "#in-out")
  expect(slot(view.container, "underline-hover-link")).toHaveAttribute("data-reduced", "false")
})

test("悬停下划线在减弱动效下仍是链接", () => {
  reduceMotion = true
  render(
    <UnderlineHoverLink direction="left" href="#center" variant="center">
      从中间
    </UnderlineHoverLink>,
  )
  const link = screen.getByRole("link", { name: "从中间" })
  expect(link).toHaveAttribute("data-reduced", "true")
})
