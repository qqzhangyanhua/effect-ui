"use client"

import * as React from "react"
import { motion } from "motion/react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

export interface InboxMessage {
  id: string
  from: string
  subject: string
  preview: string
  body: string
  unread?: boolean
  starred?: boolean
}

export interface InboxSplitViewProps {
  messages?: InboxMessage[]
  className?: string
}

const DEFAULTS: InboxMessage[] = [
  { id: "m1", from: "林夏", subject: "北窗的光", preview: "下午的光会停很久。", body: "下午的光会在地板上停很久。我想把周五留空。", unread: true, starred: true },
  { id: "m2", from: "周宁", subject: "样张", preview: "四张都留下来了。", body: "门口、楼梯、杯子，还有没写完的句子。", unread: true },
  { id: "m3", from: "赵衡", subject: "已解决", preview: "标题可以一起改。", body: "间距松开之后，把这条标成已解决就行。", unread: false },
]

function useNarrow() {
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)")
    const update = () => setNarrow(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return narrow
}

function InboxSplitView({ messages: messagesProp = DEFAULTS, className }: InboxSplitViewProps) {
  const narrow = useNarrow()
  const [messages, setMessages] = React.useState(messagesProp)
  const [selected, setSelected] = React.useState<string[]>([])
  const [active, setActive] = React.useState(messagesProp[0]?.id ?? "")
  const [showDetail, setShowDetail] = React.useState(false)
  const current = messages.find((message) => message.id === active) ?? messages[0]

  const open = React.useCallback(
    (id: string) => {
      setActive(id)
      setMessages((items) => items.map((item) => (item.id === id ? { ...item, unread: false } : item)))
      if (narrow) setShowDetail(true)
    },
    [narrow],
  )

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return
      if (event.key !== "j" && event.key !== "k") return
      const index = messages.findIndex((message) => message.id === active)
      const next = event.key === "j" ? Math.min(messages.length - 1, index + 1) : Math.max(0, index - 1)
      const id = messages[next]?.id
      if (id) open(id)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active, messages, open])

  const list = (
    <ul aria-label="收件箱" className="h-full overflow-auto">
      {messages.map((message) => (
        <li key={message.id} className={cn("border-b", message.id === active && "bg-muted")}>
          <div className="flex items-start gap-2 px-3 py-2">
            <input
              type="checkbox"
              aria-label={`选择 ${message.subject}`}
              checked={selected.includes(message.id)}
              onChange={(event) =>
                setSelected((currentIds) => (event.target.checked ? [...currentIds, message.id] : currentIds.filter((id) => id !== message.id)))
              }
            />
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(message.id)}>
              <span className={cn("block text-sm", message.unread && "font-semibold")}>
                {message.unread ? <span className="mr-1 inline-block size-1.5 rounded-full bg-primary" aria-label="未读" /> : null}
                {message.from}
              </span>
              <span className="block truncate text-sm">{message.subject}</span>
              <span className="block truncate text-xs text-muted-foreground">{message.preview}</span>
            </button>
            <button
              type="button"
              aria-pressed={Boolean(message.starred)}
              aria-label={message.starred ? `取消星标 ${message.subject}` : `星标 ${message.subject}`}
              className={cn("text-sm", message.starred ? "text-amber-500" : "text-muted-foreground")}
              onClick={() => setMessages((items) => items.map((item) => (item.id === message.id ? { ...item, starred: !item.starred } : item)))}
            >
              ★
            </button>
          </div>
        </li>
      ))}
    </ul>
  )

  const detail = current ? (
    <article className="h-full overflow-auto p-4">
      {narrow ? (
        <button type="button" className="mb-3 text-sm text-primary" onClick={() => setShowDetail(false)}>
          返回
        </button>
      ) : null}
      <p className="text-sm text-muted-foreground">{current.from}</p>
      <h2 className="mt-1 text-xl font-medium">{current.subject}</h2>
      <p className="mt-4 text-sm leading-6">{current.body}</p>
    </article>
  ) : null

  return (
    <div data-slot="inbox-split-view" className={cn("h-96 overflow-hidden rounded-xl border", className)}>
      <p className="border-b px-3 py-2 text-xs text-muted-foreground">已选 {selected.length} · j / k 移动</p>
      {narrow ? (
        <div className="relative h-[calc(100%-2rem)] overflow-hidden">
          <motion.div animate={{ x: showDetail ? "-100%" : "0%" }} transition={{ duration: 0.25 }} className="flex h-full w-[200%]">
            <div className="h-full w-1/2">{list}</div>
            <div className="h-full w-1/2">{detail}</div>
          </motion.div>
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-2rem)]">
          <ResizablePanel defaultSize={38} minSize={24}>
            {list}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={62} minSize={30}>
            {detail}
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  )
}

export { InboxSplitView }
