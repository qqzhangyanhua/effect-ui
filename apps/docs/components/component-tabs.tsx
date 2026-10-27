"use client"

import { Maximize2 } from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

import { CodeBlock } from "@/components/code-block"

interface CodePane {
  code: string
  html: string
  filename?: string
}

interface SourcePane extends CodePane {
  id: string
  label: string
}

function TabList({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-1 ${className ?? ""}`}
    >
      {children}
    </div>
  )
}

function TabButton({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={
        selected
          ? "rounded-md bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-xs"
          : "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      }
    >
      {children}
    </button>
  )
}

function SourceFiles({ sources }: { sources: readonly SourcePane[] }) {
  const first = sources[0]?.id ?? ""
  const [current, setCurrent] = useState(first)
  const active = sources.some((file) => file.id === current) ? current : first
  const file = sources.find((item) => item.id === active)

  return (
    <div className="flex flex-col gap-4">
      <TabList label="源码文件" className="justify-start overflow-x-auto">
        {sources.map((item) => (
          <TabButton key={item.id} selected={item.id === active} onSelect={() => setCurrent(item.id)}>
            {item.label}
          </TabButton>
        ))}
      </TabList>
      {file ? <CodeBlock code={file.code} html={file.html} filename={file.filename} /> : null}
    </div>
  )
}

function CodeTabs({
  usage,
  install,
  sources,
}: {
  usage: CodePane
  install: CodePane
  sources: readonly SourcePane[]
}) {
  const [current, setCurrent] = useState("usage")
  const firstSource = sources[0]

  return (
    <div className="flex flex-col gap-4">
      <TabList label="代码" className="justify-start overflow-x-auto">
        <TabButton selected={current === "usage"} onSelect={() => setCurrent("usage")}>
          用法
        </TabButton>
        <TabButton selected={current === "install"} onSelect={() => setCurrent("install")}>
          安装
        </TabButton>
        <TabButton selected={current === "source"} onSelect={() => setCurrent("source")}>
          源码
        </TabButton>
      </TabList>
      {current === "usage" ? (
        <CodeBlock code={usage.code} html={usage.html} filename={usage.filename} />
      ) : null}
      {current === "install" ? (
        <CodeBlock code={install.code} html={install.html} filename={install.filename} />
      ) : null}
      {current === "source" ? (
        sources.length > 1 && firstSource ? (
          <SourceFiles sources={sources} />
        ) : firstSource ? (
          <CodeBlock code={firstSource.code} html={firstSource.html} filename={firstSource.filename} />
        ) : null
      ) : null}
    </div>
  )
}

function ComponentTabs({
  preview,
  fullScreenHref,
  usage,
  install,
  sources,
}: {
  preview: ReactNode
  fullScreenHref: string
  usage: CodePane
  install: CodePane
  sources: readonly SourcePane[]
}) {
  const [current, setCurrent] = useState("preview")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabList label="文档视图">
          <TabButton selected={current === "preview"} onSelect={() => setCurrent("preview")}>
            Preview
          </TabButton>
          <TabButton selected={current === "code"} onSelect={() => setCurrent("code")}>
            Code
          </TabButton>
        </TabList>
        <Link
          href={fullScreenHref}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap hover:bg-accent"
        >
          <Maximize2 className="size-3.5" />
          全屏预览
        </Link>
      </div>
      {current === "preview" ? preview : null}
      {current === "code" ? <CodeTabs usage={usage} install={install} sources={sources} /> : null}
    </div>
  )
}

export { ComponentTabs }
