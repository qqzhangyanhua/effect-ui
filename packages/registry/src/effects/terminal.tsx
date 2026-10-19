"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TerminalProps {
  lines: string[]
  className?: string
  interval?: number
}

function Terminal({ lines, className, interval = 700 }: TerminalProps) {
  const [count, setCount] = React.useState(1)

  React.useEffect(() => {
    if (count >= lines.length) return
    const id = window.setTimeout(() => setCount((value) => value + 1), interval)
    return () => window.clearTimeout(id)
  }, [count, interval, lines.length])

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-zinc-950 text-zinc-100", className)}>
      <div className="flex gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <pre className="min-h-40 p-4 font-mono text-xs leading-6">
        {lines.slice(0, count).map((line) => (
          <div key={line}>
            <span className="text-emerald-400">❯ </span>
            {line}
          </div>
        ))}
        {count < lines.length ? <span className="animate-pulse">▍</span> : null}
      </pre>
    </div>
  )
}

export { Terminal }
