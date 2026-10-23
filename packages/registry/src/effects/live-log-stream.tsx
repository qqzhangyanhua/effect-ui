"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/developer-tools/live-log-stream.tsx

import { useEffect, useMemo, useRef, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type LogLevel = "debug" | "info" | "success" | "warning" | "error"
export type LogStreamStatus = "streaming" | "idle" | "completed" | "error"

export interface LogEntry {
  id: string | number
  level: LogLevel
  message: string
  timestamp?: string
  source?: string
}

export interface LiveLogStreamProps {
  entries: LogEntry[]
  status?: LogStreamStatus
  title?: string
  label?: string
  className?: string
}

const LEVELS: LogLevel[] = ["debug", "info", "success", "warning", "error"]

const SHORT: Record<LogLevel, string> = {
  debug: "DBG",
  info: "INFO",
  success: "OK",
  warning: "WARN",
  error: "ERR",
}

export function LiveLogStream({
  entries,
  status = "streaming",
  title = "Live logs",
  label = "Log stream",
  className,
}: LiveLogStreamProps) {
  const reduced = usePrefersReducedMotion()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [paused, setPaused] = useState(false)
  const [follow, setFollow] = useState(true)
  const [levels, setLevels] = useState<LogLevel[]>(LEVELS)
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) => levels.includes(entry.level) && (needle.length === 0 || entry.message.toLowerCase().includes(needle)))
  }, [entries, levels, query])

  useEffect(() => {
    const node = scrollerRef.current
    if (!follow || paused || !node) return
    node.scrollTop = node.scrollHeight
  }, [follow, paused, visible])

  return (
    <div className={cn("flex h-80 w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground motion-reduce:animate-none", className)} data-motion={reduced ? "off" : "on"}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{status}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filter logs"
          placeholder="Filter"
          className="ml-auto h-9 rounded-md border border-border bg-background px-2 text-sm"
        />
        <button type="button" className="min-h-9 rounded-md border border-border px-2 text-sm" onClick={() => setPaused((value) => !value)}>
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
      <div className="flex gap-1 px-3 py-2">
        {LEVELS.map((level) => {
          const on = levels.includes(level)
          return (
            <button
              key={level}
              type="button"
              aria-pressed={on}
              className={cn("rounded-full border px-2 py-1 text-xs", on ? "border-primary text-foreground" : "border-border text-muted-foreground")}
              onClick={() => setLevels((current) => (current.includes(level) ? current.filter((item) => item !== level) : [...current, level]))}
            >
              {SHORT[level]}
            </button>
          )
        })}
      </div>
      <div
        ref={scrollerRef}
        role="log"
        aria-label={label}
        aria-live={paused ? "off" : "polite"}
        className="min-h-0 flex-1 overflow-auto px-3 pb-3 font-mono text-xs"
        onScroll={(event) => {
          const node = event.currentTarget
          const away = node.scrollHeight - node.scrollTop - node.clientHeight > 24
          if (away) setFollow(false)
        }}
      >
        {visible.map((entry) => (
          <div key={entry.id} className="flex gap-2 border-b border-border/60 py-1">
            <span className={entry.level === "error" ? "text-destructive" : "text-muted-foreground"}>{SHORT[entry.level]}</span>
            {entry.source ? <span className="text-muted-foreground">{entry.source}</span> : null}
            <span className="min-w-0 flex-1 whitespace-pre-wrap">{entry.message}</span>
          </div>
        ))}
      </div>
      {follow ? null : (
        <button type="button" className="m-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onClick={() => setFollow(true)}>
          Jump to latest
        </button>
      )}
    </div>
  )
}
