"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/developer-tools/api-request-inspector.tsx

import { useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | (string & {})
export type InspectorState = "idle" | "loading" | "success" | "client_error" | "server_error" | "timeout" | "cancelled" | "retrying"

export interface ApiRequest {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  query?: Record<string, string | number | boolean | null>
  body?: unknown
}

export interface ApiResponse {
  status?: number
  statusText?: string
  durationMs?: number
  headers?: Record<string, string>
  body?: unknown
  error?: string
}

export interface ApiRequestInspectorProps {
  request: ApiRequest
  response?: ApiResponse
  state: InspectorState
  onRetry?: () => void
  onCancel?: () => void
  title?: string
  className?: string
}

const SENSITIVE = ["authorization", "cookie", "set-cookie", "x-api-key", "api-key", "token", "password", "secret"]

const STATE_LABEL: Record<InspectorState, string> = {
  idle: "Idle",
  loading: "Loading",
  retrying: "Retrying",
  success: "Success",
  client_error: "Client error",
  server_error: "Server error",
  timeout: "Timed out",
  cancelled: "Cancelled",
}

function hiddenKey(key: string) {
  const name = key.toLowerCase()
  return SENSITIVE.some((item) => name.includes(item))
}

function showValue(key: string, value: unknown) {
  if (hiddenKey(key)) return "••••••"
  if (value == null) return ""
  return String(value)
}

function bodyText(body: unknown) {
  if (body == null) return ""
  if (typeof body === "string") return redactString(body)
  return JSON.stringify(redactValue(body), null, 2)
}

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactValue)
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, hiddenKey(key) ? "••••••" : redactValue(item)]))
  }
  return value
}

function redactString(value: string) {
  return SENSITIVE.some((item) => value.toLowerCase().includes(item)) ? "••••••" : value
}

const SECTIONS = ["Request headers", "Query", "Request body", "Response headers", "Response body"] as const

export function ApiRequestInspector({ request, response, state, onRetry, onCancel, title = "API request", className }: ApiRequestInspectorProps) {
  const reduced = usePrefersReducedMotion()
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Response body")
  const inFlight = state === "loading" || state === "retrying"
  const rows = (record?: Record<string, string>) => Object.entries(record ?? {})

  let body = ""
  if (section === "Request headers") body = rows(request.headers).map(([key, value]) => `${key}: ${showValue(key, value)}`).join("\n")
  else if (section === "Query") body = Object.entries(request.query ?? {}).map(([key, value]) => `${key}=${showValue(key, value)}`).join("\n")
  else if (section === "Request body") body = bodyText(request.body)
  else if (section === "Response headers") body = rows(response?.headers).map(([key, value]) => `${key}: ${showValue(key, value)}`).join("\n")
  else body = bodyText(response?.body)

  return (
    <section className={cn("w-full rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)} data-motion={reduced ? "off" : "on"}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{request.method}</span>
        <span className={cn("text-xs", state === "server_error" || state === "timeout" ? "text-destructive" : "text-muted-foreground")}>{STATE_LABEL[state]}</span>
        {response?.status ? <span className="font-mono text-xs">{response.status}{response.statusText ? ` ${response.statusText}` : ""}</span> : null}
        {typeof response?.durationMs === "number" ? <span className="font-mono text-xs text-muted-foreground">{response.durationMs}ms</span> : null}
      </div>
      <p className="mt-2 break-all font-mono text-xs">{request.url}</p>
      {response?.error ? <p className="mt-2 text-sm text-destructive">{response.error}</p> : null}
      <div className="mt-3 flex flex-wrap gap-1">
        {SECTIONS.map((item) => (
          <button key={item} type="button" aria-pressed={section === item} className={cn("rounded-md border px-2 py-1 text-xs", section === item ? "border-primary" : "border-border text-muted-foreground")} onClick={() => setSection(item)}>
            {item}
          </button>
        ))}
        {inFlight && onCancel ? (
          <button type="button" className="ml-auto min-h-9 rounded-md border border-border px-2 text-xs" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {!inFlight && onRetry ? (
          <button type="button" className="ml-auto min-h-9 rounded-md bg-primary px-2 text-xs text-primary-foreground" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
      <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs">{body || "—"}</pre>
    </section>
  )
}
