// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { AgentIntroSequence } from "./agent-intro-sequence"
import { BlurVignette } from "./blur-vignette"
import { CharShimmerLoader } from "./char-shimmer-loader"
import { ChatMessageList } from "./chat-message-list"
import { ExpandableChat, ExpandableChatBody } from "./expandable-chat"
import { HatchDivider } from "./hatch-divider"
import { HoverImageReveal } from "./hover-image-reveal"
import { ImageTabs } from "./image-tabs"
import { LiquidGradientButton } from "./liquid-gradient-button"
import { MessageLoading } from "./message-loading"
import { ScrollBlurText } from "./scroll-blur-text"
import { SpotlightGroup } from "./spotlight-group"
import { TimelineReveal } from "./timeline-reveal"
import { useMediaQuery } from "../hooks/use-media-query"

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
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : query.includes("min-width"),
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

const pixel = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='black'/></svg>")}`

test("减弱动效时文字、扫光和输入点保持可读", async () => {
  reduceMotion = true
  const onComplete = vi.fn()
  render(
    <div>
      <BlurVignette>画面</BlurVignette>
      <LiquidGradientButton>液态</LiquidGradientButton>
      <CharShimmerLoader labels={["开始", "结束"]} onComplete={onComplete} />
      <ScrollBlurText text="词一 词二" />
      <TimelineReveal>时间线</TimelineReveal>
      <HatchDivider />
      <MessageLoading />
      <AgentIntroSequence onComplete={onComplete} sequence={[{ type: "message", text: "序列完成" }]} />
    </div>,
  )
  expect(screen.getByText("画面").closest("[data-slot='blur-vignette']")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("液态").closest("[data-slot='liquid-gradient-button']")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("status", { name: "结束" })).toBeInTheDocument()
  expect(screen.getByText("词一")).toBeInTheDocument()
  expect(screen.getByText("词二")).toBeInTheDocument()
  expect(screen.getByText("时间线")).toHaveAttribute("data-state", "visible")
  expect(document.querySelector("[data-slot='hatch-divider']")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("status", { name: "正在输入" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("序列完成")).toBeInTheDocument()
  await waitFor(() => expect(onComplete).toHaveBeenCalled())
})

test("图文标签、聚光和图片行可以切换", () => {
  const onValueChange = vi.fn()
  render(
    <div>
      <ImageTabs
        onValueChange={onValueChange}
        tabs={[
          { id: "a", title: "甲", description: "甲的说明", imageUrl: pixel, imageAlt: "甲的图" },
          { id: "b", title: "乙", description: "乙的说明", imageUrl: pixel, imageAlt: "乙的图" },
        ]}
        value="a"
      />
      <SpotlightGroup mode="cursor-flow">
        <span>卡片</span>
      </SpotlightGroup>
      <HoverImageReveal items={[{ label: "保持从容", img: pixel, alt: "从容的色块" }]} />
    </div>,
  )
  fireEvent.click(screen.getByRole("tab", { name: /乙/ }))
  expect(onValueChange).toHaveBeenCalledWith("b")
  expect(screen.getByRole("img", { name: "甲的图" })).toBeInTheDocument()
  expect(document.querySelector("[data-slot='spotlight-group']")).toHaveAttribute("data-mode", "cursor-flow")
  expect(screen.getByRole("button", { name: "保持从容" })).toBeInTheDocument()
})

test("对话壳和消息列表可以操作", () => {
  render(
    <div className="relative h-96">
      <ExpandableChat>
        <ExpandableChatBody>面板里的话</ExpandableChatBody>
      </ExpandableChat>
      <div className="h-40">
        <ChatMessageList>
          <p>一条消息</p>
        </ChatMessageList>
      </div>
    </div>,
  )
  expect(document.querySelector("[data-slot='expandable-chat']")).toHaveAttribute("data-state", "closed")
  fireEvent.click(screen.getByRole("button", { name: "打开对话" }))
  expect(document.querySelector("[data-slot='expandable-chat']")).toHaveAttribute("data-state", "open")
  expect(screen.getByText("面板里的话")).toBeInTheDocument()
  expect(screen.getByText("一条消息")).toBeInTheDocument()
})

test("useMediaQuery 是函数", () => {
  expect(typeof useMediaQuery).toBe("function")
})
