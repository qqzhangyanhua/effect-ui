"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@effect-ui/registry/ui/button"

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div className="relative overflow-hidden rounded-xl border bg-zinc-950">
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 text-zinc-200 hover:bg-zinc-800 hover:text-white"
        onClick={() => {
          void onCopy()
        }}
        aria-label="复制代码"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export { CodeBlock }
