"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/tool.tsx. Modified for effect-ui.

import { ChevronDown, CircleCheck, CircleX, LoaderCircle, Settings } from "lucide-react"
import { useState, type ComponentProps } from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

function Collapsible({ ...props }: ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />
}

function CollapsibleContent({ ...props }: ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />
}

export type ToolPart = {
  type: string
  state: "input-streaming" | "input-available" | "output-available" | "output-error"
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  toolCallId?: string
  errorText?: string
}

export interface ToolProps {
  toolPart: ToolPart
  defaultOpen?: boolean
  className?: string
}

const STATE_LABEL = {
  "input-streaming": "处理中",
  "input-available": "就绪",
  "output-available": "完成",
  "output-error": "出错",
} as const

function formatValue(value: unknown) {
  if (value === null) return "null"
  if (value === undefined) return "undefined"
  if (typeof value === "string") return value
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}

export function Tool({ toolPart, defaultOpen = false, className }: ToolProps) {
  const reduced = usePrefersReducedMotion()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { state, input, output, toolCallId, errorText, type } = toolPart
  const icon =
    state === "input-streaming" ? (
      <LoaderCircle aria-hidden className={cn("size-4 text-primary", !reduced && "animate-spin")} />
    ) : state === "output-available" ? (
      <CircleCheck aria-hidden className="size-4 text-primary" />
    ) : state === "output-error" ? (
      <CircleX aria-hidden className="size-4 text-destructive" />
    ) : (
      <Settings aria-hidden className="size-4 text-muted-foreground" />
    )

  return (
    <div className={cn("mt-3 overflow-hidden rounded-lg border border-border", className)} data-reduced={reduced ? "true" : "false"} data-slot="tool" data-state={state}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button className="h-auto w-full justify-between rounded-b-none bg-background px-3 py-2 font-normal" variant="ghost">
            <span className="flex items-center gap-2">
              {icon}
              <span className="font-mono text-sm font-medium">{type}</span>
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{STATE_LABEL[state]}</span>
            </span>
            <ChevronDown aria-hidden className={cn("size-4", isOpen && "rotate-180", reduced && "transition-none")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className={cn("overflow-hidden border-t border-border", !reduced && "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down")}>
          <div className="space-y-3 bg-background p-3">
            {input && Object.keys(input).length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">输入</h4>
                <div className="rounded border p-2 font-mono text-sm">
                  {Object.entries(input).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="text-muted-foreground">{key}:</span> <span>{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {output ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">输出</h4>
                <pre className="max-h-60 overflow-auto rounded border p-2 font-mono text-sm whitespace-pre-wrap">{formatValue(output)}</pre>
              </div>
            ) : null}
            {state === "output-error" && errorText ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-destructive">错误</h4>
                <div className="rounded border border-destructive/40 bg-destructive/10 p-2 text-sm">{errorText}</div>
              </div>
            ) : null}
            {state === "input-streaming" ? <p className="text-sm text-muted-foreground">正在处理工具调用。</p> : null}
            {toolCallId ? <p className="border-t pt-2 font-mono text-xs text-muted-foreground">调用编号: {toolCallId}</p> : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
