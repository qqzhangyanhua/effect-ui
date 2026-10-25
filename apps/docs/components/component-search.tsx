"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { componentCluster, getCatalogGroups } from "@effect-ui/registry/catalog"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@effect-ui/registry/ui/command"
import { Kbd } from "@effect-ui/registry/ui/kbd"

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

function ComponentSearch({ className }: ComponentSearchProps = {}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || event.repeat) return
      if (!event.metaKey && !event.ctrlKey) return
      if (event.altKey || event.shiftKey) return
      event.preventDefault()
      event.stopPropagation()
      setOpen((current) => !current)
    }

    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [])

  function openComponent(name: string) {
    setOpen(false)
    const cluster = componentCluster(name)
    router.push(cluster ? `${familyPath(cluster)}#${name}` : `/docs/${name}`)
  }

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
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-1.5 truncate">
          <SearchIcon className="size-3.5 shrink-0 opacity-70" />
          <span className="truncate">搜索组件、文档...</span>
        </span>
        <Kbd className="hidden font-mono text-[10px] sm:inline-flex">⌘K</Kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="搜索组件"
        description="按名称、标题或描述查找组件"
      >
        <CommandInput placeholder="搜索组件名称、标题或描述" className="pr-8" />
        <CommandList>
          <CommandEmpty>没有匹配的组件</CommandEmpty>
          {searchSections.map((group) => (
            <CommandGroup key={group.key} heading={group.heading}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.name}
                  value={item.name}
                  keywords={[item.title, item.description]}
                  onSelect={() => openComponent(item.name)}
                >
                  <span className="truncate">{item.title}</span>
                  <span className="ml-auto truncate pl-3 text-xs text-muted-foreground">
                    {item.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}

export { ComponentSearch }
