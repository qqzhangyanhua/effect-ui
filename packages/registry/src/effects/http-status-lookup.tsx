"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/statuscode/demostatus.tsx. Modified for effect-ui.

import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react"
import { useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface HttpStatusCode {
  statusCode: number
  category: "informational" | "success" | "redirection" | "clientError" | "serverError"
  description: string
}

export interface HttpStatusLookupProps {
  codes?: readonly HttpStatusCode[]
  defaultQuery?: string
  pageSize?: number
  className?: string
}

const DEFAULT_CODES: readonly HttpStatusCode[] = [
  { statusCode: 100, category: "informational", description: "Continue" },
  { statusCode: 101, category: "informational", description: "Switching Protocols" },
  { statusCode: 200, category: "success", description: "OK" },
  { statusCode: 201, category: "success", description: "Created" },
  { statusCode: 202, category: "success", description: "Accepted" },
  { statusCode: 204, category: "success", description: "No Content" },
  { statusCode: 300, category: "redirection", description: "Multiple Choices" },
  { statusCode: 301, category: "redirection", description: "Moved Permanently" },
  { statusCode: 302, category: "redirection", description: "Found" },
  { statusCode: 304, category: "redirection", description: "Not Modified" },
  { statusCode: 400, category: "clientError", description: "Bad Request" },
  { statusCode: 401, category: "clientError", description: "Unauthorized" },
  { statusCode: 403, category: "clientError", description: "Forbidden" },
  { statusCode: 404, category: "clientError", description: "Not Found" },
  { statusCode: 500, category: "serverError", description: "Internal Server Error" },
  { statusCode: 501, category: "serverError", description: "Not Implemented" },
  { statusCode: 502, category: "serverError", description: "Bad Gateway" },
  { statusCode: 503, category: "serverError", description: "Service Unavailable" },
]

const CATEGORY_CLASS = {
  informational: "border-primary/40 bg-primary/10 text-primary",
  success: "border-chart-2/40 bg-chart-2/10 text-chart-2",
  redirection: "border-chart-4/40 bg-chart-4/10 text-chart-4",
  clientError: "border-chart-5/40 bg-chart-5/10 text-chart-5",
  serverError: "border-destructive/40 bg-destructive/10 text-destructive",
} as const

const CATEGORY_ICON: Record<HttpStatusCode["category"], ReactNode> = {
  informational: <Info className="size-4" />,
  success: <CircleCheck className="size-4" />,
  redirection: <TriangleAlert className="size-4" />,
  clientError: <CircleX className="size-4" />,
  serverError: <CircleX className="size-4" />,
}

export function HttpStatusLookup({ codes = DEFAULT_CODES, defaultQuery = "", pageSize = 10, className }: HttpStatusLookupProps) {
  const [querySource, setQuerySource] = useState(defaultQuery)
  const [query, setQuery] = useState(defaultQuery)
  const [page, setPage] = useState(1)
  if (defaultQuery !== querySource) {
    setQuerySource(defaultQuery)
    setQuery(defaultQuery)
    setPage(1)
  }

  const filtered = codes.filter((code) => {
    const haystack = `${code.statusCode} ${code.category} ${code.description}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  return (
    <div className={cn("w-full rounded-xl border bg-card p-6 text-card-foreground", className)} data-slot="http-status-lookup">
      <input
        aria-label="搜索状态码"
        className="mb-4 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="搜索状态码"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setPage(1)
        }}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="font-semibold">状态码</div>
        <div className="font-semibold">类别</div>
        <div className="font-semibold">说明</div>
        {rows.map((item) => (
          <div key={item.statusCode} className="contents">
            <div className={cn("flex h-8 w-28 items-center justify-center rounded-full border", CATEGORY_CLASS[item.category])}>{item.statusCode}</div>
            <div className="flex items-center gap-2 capitalize">
              {CATEGORY_ICON[item.category]}
              <span>{item.category}</span>
            </div>
            <div>{item.description}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm disabled:opacity-50" disabled={current === 1} type="button" onClick={() => setPage((value) => Math.max(1, value - 1))}>
          <ArrowLeft className="size-4" />
          上一页
        </button>
        <span className="text-sm">
          {current} / {totalPages}
        </span>
        <button className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm disabled:opacity-50" disabled={current === totalPages} type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
          下一页
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
