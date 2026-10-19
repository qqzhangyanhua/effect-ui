"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TerminalProps {
  lines: string[]
  className?: string
  interval?: number
}

function Terminal({ lines, className, interval = 700 }: TerminalProps) {
  const [count, setCount] = React.useState(1)
  const reduce = usePrefersReducedMotion()
  const shown = reduce ? lines.length : count

  React.useEffect(() => {
    if (reduce || count >= lines.length) return
    const id = window.setTimeout(() => setCount((value) => value + 1), interval)
    return () => window.clearTimeout(id)
  }, [count, interval, lines.length, reduce])

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-zinc-950 text-zinc-100", className)}>
      <div className="flex gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
      </div>
      <pre className="min-h-40 p-4 font-mono text-xs leading-6">
        {lines.map((line, index) => (
          <div key={line} className={index < shown ? undefined : "hidden motion-reduce:block"}>
            <span className="text-emerald-400">❯ </span>
            {line}
          </div>
        ))}
        {shown < lines.length ? <span className="animate-pulse motion-reduce:hidden">▍</span> : null}
      </pre>
    </div>
  )
}

export { Terminal }
