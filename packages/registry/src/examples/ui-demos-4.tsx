"use client"

import { useState } from "react"

import { ChatMessage } from "../ui/chat-message"
import { IPhone, Macbook, Safari } from "../ui/device-mockups"
import { OnboardingTour } from "../ui/onboarding-tour"
import { PromptInput } from "../ui/prompt-input"
import { RichTextEditor } from "../ui/rich-text-editor"
import { TreeView } from "../ui/tree-view"

export function PromptInputDemo() {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  return (
    <PromptInput
      className="w-full max-w-lg"
      value={value}
      loading={loading}
      onValueChange={setValue}
      onSubmit={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 800)
      }}
      onStop={() => setLoading(false)}
    />
  )
}

export function ChatMessageDemo() {
  return (
    <div className="w-full max-w-lg space-y-3">
      <ChatMessage role="user" content="用一句话介绍 effect-ui。" />
      <ChatMessage
        role="assistant"
        streaming
        content={"effect-ui 是 **MIT** 的 React registry：\n\n```ts\nnpx shadcn add ./r/button.json\n```"}
      />
    </div>
  )
}

export function DeviceMockupsDemo() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-3">
      <Safari className="md:col-span-2">
        <div className="grid h-40 place-items-center text-sm text-muted-foreground">Safari 预览</div>
      </Safari>
      <IPhone>
        <div className="grid h-40 place-items-center text-xs text-muted-foreground">iPhone</div>
      </IPhone>
      <Macbook className="md:col-span-3">
        <div className="grid h-32 place-items-center text-sm text-muted-foreground">MacBook</div>
      </Macbook>
    </div>
  )
}

export function RichTextEditorDemo() {
  return <RichTextEditor className="w-full max-w-lg" content="<p>试试 <strong>加粗</strong> 和列表。</p>" />
}

export function TreeViewDemo() {
  return (
    <TreeView
      className="w-full max-w-sm rounded-xl border p-2"
      nodes={[
        {
          id: "app",
          name: "app",
          children: [
            { id: "page", name: "page.tsx" },
            { id: "layout", name: "layout.tsx" },
          ],
        },
        {
          id: "components",
          name: "components",
          children: [{ id: "button", name: "button.tsx" }],
        },
      ]}
    />
  )
}

export function OnboardingTourDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-3">
      <button
        type="button"
        data-tour="batch4-start"
        className="rounded-md border px-3 py-1.5 text-sm"
        onClick={() => setOpen(true)}
      >
        开始引导
      </button>
      <p data-tour="batch4-hint" className="text-sm text-muted-foreground">
        高亮遮罩会指向这两个节点。
      </p>
      <OnboardingTour
        open={open}
        onOpenChange={setOpen}
        steps={[
          { selector: "[data-tour='batch4-start']", title: "开始", description: "点击后进入下一步。" },
          { selector: "[data-tour='batch4-hint']", title: "提示", description: "任意选择器都可以作为锚点。" },
        ]}
      />
    </div>
  )
}
