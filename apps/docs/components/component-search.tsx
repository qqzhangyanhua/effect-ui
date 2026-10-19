"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { getComponentsByCategory } from "@effect-ui/registry/catalog"
import { Button } from "@effect-ui/registry/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@effect-ui/registry/ui/command"
import { Kbd } from "@effect-ui/registry/ui/kbd"

const componentGroups = getComponentsByCategory().filter(
  (group) => group.items.length > 0,
)

function ComponentSearch() {
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
    router.push(`/docs/${name}`)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 px-2 text-muted-foreground md:px-2.5"
        aria-label="搜索组件"
        aria-keyshortcuts="Meta+K Control+K"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
        <span className="hidden md:inline">搜索</span>
        <Kbd className="hidden md:inline">⌘K</Kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="搜索组件"
        description="按名称、标题或描述查找组件"
      >
        <CommandInput placeholder="搜索组件名称、标题或描述" className="pr-8" />
        <CommandList>
          <CommandEmpty>没有匹配的组件</CommandEmpty>
          {componentGroups.map((group) => (
            <CommandGroup key={group.category} heading={group.label}>
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
