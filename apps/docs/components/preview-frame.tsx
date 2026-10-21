"use client"

import { useState, type CSSProperties, type ReactNode } from "react"

import { Button } from "@effect-ui/registry/ui/button"
import { cn } from "@/lib/utils"

const previewBackground: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at top, color-mix(in oklab, var(--primary) 8%, transparent), transparent 46%)",
}

function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  const [replayKey, setReplayKey] = useState(0)

  return (
    <section
      aria-label="组件预览"
      className={cn("flex min-h-64 flex-col gap-4 rounded-xl border bg-background p-4 text-foreground", className)}
      style={previewBackground}
    >
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setReplayKey((key) => key + 1)}>
          重放
        </Button>
      </div>
      <div key={replayKey} className="flex flex-1 items-center justify-center">
        {children}
      </div>
    </section>
  )
}

export { PreviewFrame }
