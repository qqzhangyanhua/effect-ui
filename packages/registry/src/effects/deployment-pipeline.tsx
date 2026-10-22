"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/developer-tools/deployment-pipeline.tsx

import { useId, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type StageStatus = "queued" | "running" | "passed" | "failed" | "cancelled" | "skipped"

export interface Stage {
  id: string
  name: string
  status: StageStatus
  durationMs?: number
  logs?: string[]
}

export interface DeploymentPipelineProps {
  stages: Stage[]
  onRetry?: (stageId: string) => void
  defaultExpandedId?: string
  label?: string
  className?: string
}

const STATUS: Record<StageStatus, { label: string; retryable: boolean }> = {
  queued: { label: "Queued", retryable: false },
  running: { label: "Running", retryable: false },
  passed: { label: "Passed", retryable: false },
  failed: { label: "Failed", retryable: true },
  cancelled: { label: "Cancelled", retryable: true },
  skipped: { label: "Skipped", retryable: false },
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)}ms`
  const seconds = Math.round((ms / 1000) * 10) / 10
  if (seconds < 60) return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const rest = Math.round(seconds % 60)
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`
}

function tone(status: StageStatus) {
  if (status === "failed") return "var(--destructive)"
  if (status === "running" || status === "passed") return "var(--primary)"
  return "var(--muted-foreground)"
}

export function DeploymentPipeline({ stages, onRetry, defaultExpandedId, label = "Deployment pipeline", className }: DeploymentPipelineProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const pulse = `dp-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [expanded, setExpanded] = useState<string | undefined>(defaultExpandedId)
  const moving = live && !reduced

  return (
    <div ref={rootRef} role="group" aria-label={label} className={cn("w-full rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)}>
      <style>{`@keyframes ${pulse}{from{opacity:.55;transform:scale(1)}to{opacity:0;transform:scale(1.8)}}@media (prefers-reduced-motion:reduce){.${pulse}{animation:none!important}}`}</style>
      <ol className="m-0 list-none p-0">
        {stages.map((stage, index) => {
          const meta = STATUS[stage.status]
          const open = expanded === stage.id
          const color = tone(stage.status)
          const logsId = `dp-logs-${stage.id}`
          return (
            <li key={stage.id} className="flex gap-3">
              <div className="flex w-7 flex-col items-center">
                <span className="relative grid h-7 w-7 place-items-center rounded-full border text-xs" style={{ color, borderColor: color }}>
                  {stage.status === "running" && moving ? (
                    <span className={cn(pulse, "absolute inset-0 rounded-full border-2 motion-reduce:hidden")} style={{ borderColor: color, animation: `${pulse} 1.4s ease-out infinite`, animationPlayState: "running" }} />
                  ) : null}
                  {stage.status === "passed" ? "✓" : stage.status === "failed" ? "×" : stage.status === "running" ? "…" : index + 1}
                </span>
                {index < stages.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{stage.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs" style={{ color, borderColor: color }}>
                    {meta.label}
                  </span>
                  {typeof stage.durationMs === "number" ? <span className="font-mono text-xs text-muted-foreground">{formatDuration(stage.durationMs)}</span> : null}
                  {meta.retryable && onRetry ? (
                    <button type="button" className="ml-auto min-h-11 rounded-md border border-border px-2 text-sm" onClick={() => onRetry(stage.id)}>
                      Retry {stage.name}
                    </button>
                  ) : null}
                  {stage.logs && stage.logs.length > 0 ? (
                    <button type="button" className="min-h-11 rounded-md px-2 text-sm text-muted-foreground" aria-expanded={open} aria-controls={logsId} onClick={() => setExpanded(open ? undefined : stage.id)}>
                      {open ? "Hide logs" : "Logs"}
                    </button>
                  ) : null}
                </div>
                {open && stage.logs ? (
                  <pre id={logsId} className="mt-2 max-h-40 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">
                    {stage.logs.map((line, lineIndex) => (
                      <div key={line}>{`${String(lineIndex + 1).padStart(2, "0")}  ${line}`}</div>
                    ))}
                  </pre>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
