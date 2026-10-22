// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { AiLoader } from "./ai-loader"
import { BookPageLoader } from "./book-page-loader"
import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtStep, ChainOfThoughtTrigger } from "./chain-of-thought"
import { FeedbackBar } from "./feedback-bar"
import { GeneratedImage } from "./generated-image"
import { GlowCornerLoader } from "./glow-corner-loader"
import { MapPinLoader } from "./map-pin-loader"
import { PromptSuggestion } from "./prompt-suggestion"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "./reasoning"
import { ResponseStream, useTextStream } from "./response-stream"
import { RetroPressButton } from "./retro-press-button"
import { Source, SourceTrigger } from "./source"
import { SystemMessage } from "./system-message"
import { ThinkingBar } from "./thinking-bar"
import { Tool } from "./tool"

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

test("减弱动效时加载和文字保持可见", () => {
  reduceMotion = true
  render(
    <div>
      <AiLoader text="思考中" variant="text-shimmer" />
      <BookPageLoader />
      <MapPinLoader />
      <GlowCornerLoader />
      <ResponseStream textStream="全文立刻出现" />
    </div>,
  )
  expect(screen.getByText("思考中")).toBeInTheDocument()
  expect(screen.getAllByRole("status", { name: "加载中" }).length).toBeGreaterThan(0)
  expect(screen.getByText("全文立刻出现")).toBeInTheDocument()
  expect(screen.getByText("全文立刻出现").closest("[data-slot='response-stream']")).toHaveAttribute("data-reduced", "true")
})

test("思考条、复古按钮和反馈可以操作", () => {
  const onStop = vi.fn()
  const onHelpful = vi.fn()
  render(
    <div>
      <ThinkingBar stopLabel="立即回答" onStop={onStop} />
      <RetroPressButton>按下</RetroPressButton>
      <FeedbackBar title="有帮助吗？" onHelpful={onHelpful} />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "立即回答" }))
  fireEvent.click(screen.getByRole("button", { name: "有帮助" }))
  expect(onStop).toHaveBeenCalledOnce()
  expect(onHelpful).toHaveBeenCalledOnce()
  expect(screen.getByRole("button", { name: "按下" })).toHaveAttribute("data-slot", "retro-press-button")
})

test("推理在流式时展开，来源不请求外部图标", () => {
  render(
    <div>
      <Reasoning isStreaming>
        <ReasoningTrigger>推理</ReasoningTrigger>
        <ReasoningContent>比较两个方案</ReasoningContent>
      </Reasoning>
      <Source faviconSrc="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'/%3E" href="https://example.com/docs">
        <SourceTrigger showFavicon label="示例" />
      </Source>
    </div>,
  )
  expect(screen.getByText("比较两个方案").closest("[data-slot='reasoning-content']")).toHaveAttribute("data-state", "open")
  const icon = document.querySelector("[data-slot='source'] img")
  expect(icon).toHaveAttribute("src", expect.stringContaining("data:image/svg+xml"))
  expect(document.body.innerHTML).not.toContain("google.com")
  expect(document.body.innerHTML).not.toContain("s2/favicons")
})

test("提示词高亮、系统消息和工具卡", () => {
  render(
    <div>
      <PromptSuggestion highlight="邮件">把邮件写短</PromptSuggestion>
      <SystemMessage variant="error">请求失败</SystemMessage>
      <Tool defaultOpen toolPart={{ type: "weather", state: "output-available", output: { summary: "多云" } }} />
    </div>,
  )
  expect(screen.getByText("邮件")).toHaveClass("text-primary")
  expect(screen.getByText("请求失败").closest("[data-slot='system-message']")).toHaveAttribute("data-variant", "error")
  expect(screen.getByText(/多云/)).toBeInTheDocument()
})

test("生成图会撤销 object URL，并且导出 useTextStream", () => {
  expect(typeof useTextStream).toBe("function")
  const urls: string[] = []
  const create = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
    const url = `blob:batch37-${urls.length}`
    urls.push(url)
    return url
  })
  const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {})
  const bytes = Uint8Array.from([1, 2, 3, 4])
  const view = render(<GeneratedImage alt="示例图" mediaType="image/png" uint8Array={bytes} />)
  return waitFor(() => expect(screen.getByRole("img", { name: "示例图" })).toHaveAttribute("src", "blob:batch37-0")).then(() => {
    view.unmount()
    expect(revoke).toHaveBeenCalledWith("blob:batch37-0")
    create.mockRestore()
    revoke.mockRestore()
  })
})

test("思维链可以展开", () => {
  render(
    <ChainOfThought>
      <ChainOfThoughtStep>
        <ChainOfThoughtTrigger>第一步</ChainOfThoughtTrigger>
        <ChainOfThoughtContent>细节</ChainOfThoughtContent>
      </ChainOfThoughtStep>
    </ChainOfThought>,
  )
  fireEvent.click(screen.getByRole("button", { name: "第一步" }))
  expect(screen.getByText("细节")).toBeVisible()
})
