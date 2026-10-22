"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/tables/Files.html. Modified for effect-ui.

import { useEffect, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ManagedFile {
  id: string
  name: string
  size: string
  status: string
  modified: string
  uploadedAt?: string
  author?: string
}

export interface FileManagerTableProps {
  files: ManagedFile[]
  selected?: string[]
  onSelectedChange?: (selected: string[]) => void
  onRowAction?: (id: string) => void
  className?: string
}

function FileGlyph({ name }: { name: string }) {
  const video = /\.(mp4|mov|webm)$/i.test(name)
  const image = /\.(png|jpe?g|gif|webp)$/i.test(name)
  return (
    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        {video ? (
          <path d="M4 7h10v10H4zM14 10l6-3v10l-6-3" strokeLinejoin="round" />
        ) : image ? (
          <path d="M4 6h16v12H4zM8 14l2.5-2.5L14 15M15 9.5h.01" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M7 3.5h7l5 5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  )
}

export function FileManagerTable({ files, selected = [], onSelectedChange, onRowAction, className }: FileManagerTableProps) {
  const ref = useRef<HTMLDivElement>(null)
  const allRef = useRef<HTMLInputElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const ids = files.map((file) => file.id)
  const all = ids.length > 0 && ids.every((id) => selected.includes(id))
  const some = ids.some((id) => selected.includes(id))

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = some && !all
  }, [some, all])

  function toggleAll() {
    onSelectedChange?.(all ? [] : ids)
  }

  function toggleOne(id: string) {
    onSelectedChange?.(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
  }

  return (
    <div
      className={cn("overflow-x-auto rounded-xl border border-border bg-card", className)}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="file-manager-table"
      ref={ref}
    >
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-muted-foreground">
          <tr className="border-b border-border">
            <th className="px-4 py-3 font-medium">
              <span className="inline-flex items-center gap-3">
                <input aria-label="全选" checked={all} onChange={toggleAll} ref={allRef} type="checkbox" />
                名称
              </span>
            </th>
            <th className="px-4 py-3 font-medium">状态</th>
            <th className="px-4 py-3 font-medium">修改时间</th>
            <th className="px-4 py-3 font-medium">上传者</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const on = selected.includes(file.id)
            return (
              <tr className="border-b border-border last:border-0" data-selected={on ? "true" : "false"} key={file.id}>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-3">
                    <input aria-label={`选择 ${file.name}`} checked={on} onChange={() => toggleOne(file.id)} type="checkbox" />
                    <FileGlyph name={file.name} />
                    <span>
                      <span className="block text-foreground">{file.name}</span>
                      <span className="block text-xs text-muted-foreground">{file.size}</span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">{file.status}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="block">{file.modified}</span>
                  {file.uploadedAt ? <span className="block text-xs">{file.uploadedAt}</span> : null}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{file.author}</td>
                <td className="px-4 py-3">
                  <button
                    aria-label={`操作 ${file.name}`}
                    className={cn("rounded-lg px-2 py-1 text-muted-foreground", reduced ? "transition-none" : "transition-colors hover:bg-muted")}
                    onClick={() => onRowAction?.(file.id)}
                    type="button"
                  >
                    <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="6" cy="12" r="1.4" />
                      <circle cx="12" cy="12" r="1.4" />
                      <circle cx="18" cy="12" r="1.4" />
                    </svg>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
