"use client"

import { useState } from "react"

import { AiLoader } from "../effects/ai-loader"
import { BookPageLoader } from "../effects/book-page-loader"
import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtItem, ChainOfThoughtStep, ChainOfThoughtTrigger } from "../effects/chain-of-thought"
import { FeedbackBar } from "../effects/feedback-bar"
import { GeneratedImage } from "../effects/generated-image"
import { GlowCornerLoader } from "../effects/glow-corner-loader"
import { MapPinLoader } from "../effects/map-pin-loader"
import { PromptSuggestion } from "../effects/prompt-suggestion"
import { Reasoning, ReasoningContent, ReasoningTrigger } from "../effects/reasoning"
import { ResponseStream } from "../effects/response-stream"
import { RetroPressButton } from "../effects/retro-press-button"
import { Source, SourceContent, SourceTrigger } from "../effects/source"
import { SystemMessage } from "../effects/system-message"
import { ThinkingBar } from "../effects/thinking-bar"
import { Tool } from "../effects/tool"

const variants = ["circular", "classic", "pulse", "pulse-dot", "dots", "typing", "wave", "bars", "terminal", "text-blink", "text-shimmer", "loading-dots"] as const
const pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
const favicon = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='6' fill='currentColor'/></svg>")}`

export function AiLoaderDemo() {
  return (
    <div className="grid grid-cols-3 gap-4 px-6 py-10 sm:grid-cols-4">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <AiLoader text="思考中" variant={variant} />
          <span>{variant}</span>
        </div>
      ))}
    </div>
  )
}

export function ResponseStreamDemo() {
  return (
    <div className="space-y-4 px-6 py-10">
      <ResponseStream mode="typewriter" textStream="回答会逐字出现。" />
      <ResponseStream mode="fade" textStream="这一句按词淡入。" />
    </div>
  )
}

export function ThinkingBarDemo() {
  const [stopped, setStopped] = useState(false)
  return (
    <div className="px-6 py-10">
      <ThinkingBar stopLabel="立即回答" text={stopped ? "已停止" : "思考中"} onStop={() => setStopped(true)} />
    </div>
  )
}

export function BookPageLoaderDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <BookPageLoader coverColor="#506c86" pageColor="#f1775b" />
    </div>
  )
}

export function MapPinLoaderDemo() {
  return (
    <div className="flex justify-center bg-neutral-900 px-6 py-16">
      <MapPinLoader color="#ffffff" />
    </div>
  )
}

export function GlowCornerLoaderDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <GlowCornerLoader colors={["#9e88f6", "#61b7fd", "#5ff9af", "#f3ab59"]} />
    </div>
  )
}

export function RetroPressButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <RetroPressButton className="text-white" color="#f6781e" shadowColor="#2f2e41">
        按下
      </RetroPressButton>
    </div>
  )
}

export function ChainOfThoughtDemo() {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <ChainOfThought>
        <ChainOfThoughtStep defaultOpen>
          <ChainOfThoughtTrigger>查看来源</ChainOfThoughtTrigger>
          <ChainOfThoughtContent>
            <ChainOfThoughtItem>先读许可，再改组件。</ChainOfThoughtItem>
          </ChainOfThoughtContent>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep>
          <ChainOfThoughtTrigger>整理回答</ChainOfThoughtTrigger>
          <ChainOfThoughtContent>
            <ChainOfThoughtItem>把步骤收成一段话。</ChainOfThoughtItem>
          </ChainOfThoughtContent>
        </ChainOfThoughtStep>
      </ChainOfThought>
    </div>
  )
}

export function ReasoningDemo() {
  const [streaming, setStreaming] = useState(true)
  return (
    <div className="mx-auto max-w-md space-y-3 px-6 py-10">
      <Reasoning isStreaming={streaming}>
        <ReasoningTrigger>推理过程</ReasoningTrigger>
        <ReasoningContent>先比较两个方案，再选较短的那个。</ReasoningContent>
      </Reasoning>
      <button className="text-sm text-muted-foreground" type="button" onClick={() => setStreaming((value) => !value)}>
        {streaming ? "结束流式" : "重新流式"}
      </button>
    </div>
  )
}

export function SourceDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <Source faviconSrc={favicon} href="https://example.com/docs">
        <SourceTrigger showFavicon label="示例文档" />
        <SourceContent description="这是一段示例摘要，不请求外部图标。" title="示例文档" />
      </Source>
    </div>
  )
}

export function ToolDemo() {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <Tool
        defaultOpen
        toolPart={{
          type: "weather",
          state: "output-available",
          input: { city: "上海" },
          output: { summary: "多云" },
          toolCallId: "call-1",
        }}
      />
    </div>
  )
}

export function SystemMessageDemo() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-3 px-6 py-10">
      <SystemMessage cta={{ label: "查看", variant: "outline" }} variant="action">
        可以继续提问。
      </SystemMessage>
      <SystemMessage variant="warning">这次回答可能不完整。</SystemMessage>
      <SystemMessage fill variant="error">
        请求没有完成。
      </SystemMessage>
    </div>
  )
}

export function FeedbackBarDemo() {
  const [choice, setChoice] = useState("")
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10">
      <FeedbackBar title="这个回答有帮助吗？" onClose={() => setChoice("已关闭")} onHelpful={() => setChoice("有帮助")} onNotHelpful={() => setChoice("没帮助")} />
      {choice ? <p className="text-sm text-muted-foreground">{choice}</p> : null}
    </div>
  )
}

export function PromptSuggestionDemo() {
  const [picked, setPicked] = useState("")
  return (
    <div className="mx-auto flex max-w-md flex-col gap-2 px-6 py-10">
      <PromptSuggestion onClick={() => setPicked("写一封短邮件")}>写一封短邮件</PromptSuggestion>
      <PromptSuggestion highlight="邮件" onClick={() => setPicked("把邮件写得更短")}>
        把邮件写得更短
      </PromptSuggestion>
      {picked ? <p className="text-sm text-muted-foreground">已选择：{picked}</p> : null}
    </div>
  )
}

export function GeneratedImageDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <GeneratedImage alt="一像素示例" base64={pixel} className="size-16" mediaType="image/png" />
    </div>
  )
}
