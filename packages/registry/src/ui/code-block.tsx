"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import type { BundledLanguage } from "shiki"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CodeBlockFile {
  filename: string
  language: BundledLanguage
  code: string
}

export interface CodeBlockProps {
  files: CodeBlockFile[]
  className?: string
}

function CodeBlock({ files, className }: CodeBlockProps) {
  const [active, setActive] = React.useState(0)
  const [html, setHtml] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const current = files[active]

  React.useEffect(() => {
    if (!current) return
    let cancelled = false
    void import("shiki").then(({ codeToHtml }) =>
      codeToHtml(current.code, {
        lang: current.language,
        themes: { light: "github-light", dark: "github-dark" },
      }),
    ).then((result) => {
      if (!cancelled) setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [current])

  if (!current) return null

  const copy = async () => {
    await navigator.clipboard.writeText(current.code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  const lines = current.code.replace(/\n$/, "").split("\n")

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        {files.map((file, index) => (
          <button
            key={file.filename}
            type="button"
            className={cn(
              "rounded-md px-2 py-1 text-xs",
              index === active ? "bg-muted font-medium" : "text-muted-foreground",
            )}
            onClick={() => setActive(index)}
          >
            {file.filename}
          </button>
        ))}
        <Button type="button" size="icon" variant="ghost" className="ml-auto size-7" onClick={() => void copy()}>
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
      </div>
      <div className="relative overflow-auto">
        <div className="absolute top-3 left-0 w-10 select-none text-right font-mono text-[11px] leading-6 text-muted-foreground">
          {lines.map((_, index) => (
            <div key={index} className="pr-2">
              {index + 1}
            </div>
          ))}
        </div>
        <div
          className="[&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-3 [&_pre]:pl-12 [&_code]:font-mono [&_code]:text-[13px] [&_code]:leading-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  )
}

export { CodeBlock }
