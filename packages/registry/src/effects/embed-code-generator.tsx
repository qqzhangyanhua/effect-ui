"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface EmbedCodeGeneratorProps {
  className?: string
}

function EmbedCodeGenerator({ className }: EmbedCodeGeneratorProps) {
  const [width, setWidth] = React.useState(480)
  const [height, setHeight] = React.useState(270)
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const [autoplay, setAutoplay] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const code = `<iframe src="https://embed.invalid/view" width="${width}" height="${height}" title="嵌入预览"${autoplay ? ' data-autoplay="true"' : ""} data-theme="${theme}"></iframe>`

  return (
    <section data-slot="embed-code-generator" className={cn("grid w-full gap-4 lg:grid-cols-[1fr_1fr]", className)}>
      <div className="space-y-3">
        <label className="flex items-center justify-between gap-3 text-sm">
          宽度
          <input
            aria-label="宽度"
            type="number"
            min={240}
            max={960}
            value={width}
            className="h-9 w-28 rounded-md border bg-background px-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onChange={(event) => setWidth(Number(event.target.value) || 240)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          高度
          <input
            aria-label="高度"
            type="number"
            min={135}
            max={540}
            value={height}
            className="h-9 w-28 rounded-md border bg-background px-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onChange={(event) => setHeight(Number(event.target.value) || 135)}
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          主题
          <select
            aria-label="主题"
            value={theme}
            className="h-9 rounded-md border bg-background px-2 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onChange={(event) => setTheme(event.target.value as "dark" | "light")}
          >
            <option value="dark">深色</option>
            <option value="light">浅色</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoplay} onChange={(event) => setAutoplay(event.target.checked)} />
          自动播放
        </label>
      </div>
      <div className="space-y-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border text-sm",
            theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900",
          )}
          style={{ aspectRatio: `${width} / ${height}` }}
        >
          {width} × {height}
          {autoplay ? " · 自动播放" : ""}
        </div>
        <label className="block text-xs text-muted-foreground">
          嵌入代码
          <textarea aria-label="嵌入代码" readOnly value={code} rows={4} className="mt-1 w-full rounded-md border bg-background p-2 font-mono text-xs" />
        </label>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => {
            void navigator.clipboard?.writeText(code).then(
              () => setCopied(true),
              () => setCopied(false),
            )
          }}
        >
          {copied ? "已复制" : "复制"}
        </button>
      </div>
    </section>
  )
}

export { EmbedCodeGenerator }
