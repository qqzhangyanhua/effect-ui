"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

const collapseAfter = 64

function lineCountOf(code: string) {
  return code.replace(/\n$/, "").split("\n").length
}

function CopyButton({
  copied,
  onCopy,
  className,
}: {
  copied: boolean
  onCopy: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white",
        className,
      )}
      onClick={onCopy}
      aria-label="复制代码"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function CodeBlock({
  code,
  html,
  filename,
}: {
  code: string
  html?: string
  filename?: string
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const lineCount = lineCountOf(code)
  const collapsible = Boolean(filename) && lineCount > collapseAfter

  const onCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#24292e]">
      {filename ? (
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5">
          <span className="min-w-0 truncate font-mono text-xs text-zinc-400">{filename}</span>
          {collapsible && expanded ? (
            <button
              type="button"
              className="shrink-0 text-xs text-zinc-400 hover:text-zinc-100"
              onClick={() => setExpanded(false)}
            >
              收起
            </button>
          ) : null}
          <CopyButton copied={copied} onCopy={() => void onCopy()} className="ml-auto" />
        </div>
      ) : (
        <CopyButton
          copied={copied}
          onCopy={() => void onCopy()}
          className="absolute top-2 right-2 z-10"
        />
      )}
      <div
        className={cn(
          "docs-code overflow-auto",
          filename && "docs-code-numbered",
          collapsible && !expanded && "max-h-[32rem]",
        )}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="p-4 font-mono text-[13px] leading-6 text-zinc-100">
            <code>{code}</code>
          </pre>
        )}
      </div>
      {collapsible ? (
        <button
          type="button"
          className="w-full border-t border-white/10 py-1.5 text-xs text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "收起" : `展开全部 ${lineCount} 行`}
        </button>
      ) : null}
    </div>
  )
}

export { CodeBlock }
