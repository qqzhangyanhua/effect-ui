"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { componentCluster, getCatalogGroups } from "@effect-ui/registry/catalog"

import { familyPath } from "@/lib/family-path"
import { cn } from "@/lib/utils"

const searchSections = getCatalogGroups().flatMap((group) => {
  if (group.key === "topics") return []
  if (group.sections.length === 0) {
    return [{ key: group.key, heading: group.label, items: group.items }]
  }
  return group.sections.map((section) => ({
    key: `${group.key}-${section.key}`,
    heading: `${group.label} / ${section.label}`,
    items: section.items,
  }))
})

interface ComponentSearchProps {
  className?: string
}

function matchesQuery(item: { name: string; title: string; description: string }, query: string) {
  return `${item.name}\n${item.title}\n${item.description}`.toLowerCase().includes(query)
}

function ComponentSearch({ className }: ComponentSearchProps = {}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || event.repeat) return
      if (!event.metaKey && !event.ctrlKey) return
      if (event.altKey || event.shiftKey) return
      event.preventDefault()
      event.stopPropagation()
      setQuery("")
      setOpen((current) => !current)
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  function openComponent(name: string) {
    setOpen(false)
    const cluster = componentCluster(name)
    router.push(cluster ? `${familyPath(cluster)}#${name}` : `/docs/${name}`)
  }

  const needle = query.trim().toLowerCase()
  const sections =
    needle.length === 0
      ? searchSections
      : searchSections.flatMap((group) => {
          const items = group.items.filter((item) => matchesQuery(item, needle))
          if (items.length === 0) return []
          return [{ ...group, items }]
        })

  return (
    <>
      <button
        type="button"
        className={cn(
          "relative flex h-8 w-32 sm:w-48 md:w-56 items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2.5 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
        aria-label="搜索组件、文档..."
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => {
          setQuery("")
          setOpen(true)
        }}
      >
        <span className="flex items-center gap-1.5 truncate">
          <SearchIcon className="size-3.5 shrink-0 opacity-70" />
          <span className="truncate">搜索组件、文档...</span>
        </span>
        <kbd className="hidden font-mono text-[10px] sm:inline-flex">⌘K</kbd>
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50">
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="关闭搜索"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="搜索组件"
                className="relative mx-auto mt-[12vh] flex max-h-[min(32rem,70vh)] w-[min(36rem,calc(100%-2rem))] flex-col overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-lg"
              >
                <input
                  autoFocus
                  value={query}
                  placeholder="搜索组件名称、标题或描述"
                  className="h-11 w-full border-b bg-transparent px-3 pr-8 text-sm outline-none placeholder:text-muted-foreground"
                  onChange={(event) => setQuery(event.target.value)}
                />
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {sections.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">没有匹配的组件</p>
                  ) : (
                    sections.map((group) => (
                      <section key={group.key} className="mb-2">
                        <h2 className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.heading}</h2>
                        <ul>
                          {group.items.map((item) => (
                            <li key={item.name}>
                              <button
                                type="button"
                                className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                                onClick={() => openComponent(item.name)}
                              >
                                <span className="truncate">{item.title}</span>
                                <span className="ml-auto truncate pl-3 text-xs text-muted-foreground">
                                  {item.name}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export { ComponentSearch }
