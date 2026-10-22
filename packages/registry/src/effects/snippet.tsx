"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/snippet/index.tsx

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState, type ComponentProps, type HTMLAttributes, type ReactNode } from "react"

export type SnippetProps = ComponentProps<typeof Tabs>

export function Snippet({ className, ...props }: SnippetProps) {
  return (
    <Tabs
      className={cn("group w-full gap-0 overflow-hidden rounded-md border", className)}
      data-slot="snippet"
      {...props}
    />
  )
}

export function SnippetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-muted flex items-center justify-between border-b p-1", className)} {...props} />
}

export interface SnippetCopyButtonProps {
  value: string
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
  className?: string
  children?: ReactNode
}

export function SnippetCopyButton({
  value,
  onCopy,
  onError,
  timeout = 2000,
  className,
  children,
}: SnippetCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const clipboard = navigator.clipboard
    if (!clipboard?.writeText || !value) {
      onError?.(new Error("无法写入剪贴板"))
      return
    }
    void clipboard.writeText(value).then(
      () => {
        setCopied(true)
        onCopy?.()
        window.setTimeout(() => setCopied(false), timeout)
      },
      (error: unknown) => {
        onError?.(error instanceof Error ? error : new Error("复制失败"))
      },
    )
  }

  return (
    <Button
      aria-label={copied ? "已复制" : "复制"}
      className={className}
      onClick={copy}
      size="icon"
      type="button"
      variant="ghost"
    >
      {children ?? (copied ? <CheckIcon /> : <CopyIcon />)}
    </Button>
  )
}

export function SnippetTabsList(props: ComponentProps<typeof TabsList>) {
  return <TabsList {...props} />
}

export function SnippetTabsTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={cn("gap-1.5", className)} {...props} />
}

export function SnippetTabsContent({ className, children, ...props }: ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent className={cn("bg-background mt-0 p-3 text-sm", className)} {...props}>
      <pre className="truncate">{children}</pre>
    </TabsContent>
  )
}
