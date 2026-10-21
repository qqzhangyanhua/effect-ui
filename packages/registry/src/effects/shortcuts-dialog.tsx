"use client"

import * as React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

export interface ShortcutItem {
  keys: string[]
  label: string
}

export interface ShortcutGroup {
  title: string
  items: ShortcutItem[]
}

export interface ShortcutsDialogProps {
  groups?: ShortcutGroup[]
  className?: string
}

const DEFAULT_GROUPS: ShortcutGroup[] = [
  {
    title: "通用",
    items: [
      { keys: ["?"], label: "打开这个面板" },
      { keys: ["mod", "K"], label: "搜索" },
      { keys: ["esc"], label: "关闭" },
    ],
  },
  {
    title: "编辑",
    items: [
      { keys: ["mod", "Enter"], label: "发送" },
      { keys: ["mod", "Z"], label: "撤销" },
    ],
  },
]

function isMac() {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
}

function useMac() {
  return React.useSyncExternalStore(
    () => () => {},
    () => isMac(),
    () => false,
  )
}

function labelFor(key: string, mac: boolean) {
  if (key === "mod") return mac ? "⌘" : "Ctrl"
  if (key === "esc") return "Esc"
  if (key === "enter") return "Enter"
  return key.length === 1 ? key.toUpperCase() : key
}

export function useHotkey(keys: string, callback: () => void) {
  const callbackRef = React.useRef(callback)
  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  React.useEffect(() => {
    const parts = keys.toLowerCase().split("+").map((part) => part.trim()).filter(Boolean)
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      const typing = target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"))
      const main = parts.find((part) => !["mod", "shift", "alt", "ctrl", "meta"].includes(part)) ?? ""
      if (typing && !parts.includes("mod")) return
      const mac = isMac()
      const modOk = parts.includes("mod") ? (mac ? event.metaKey : event.ctrlKey) : !event.metaKey && !event.ctrlKey
      const shiftOk = parts.includes("shift") ? event.shiftKey : main === "?" ? event.shiftKey || event.key === "?" : !event.shiftKey
      const altOk = parts.includes("alt") ? event.altKey : !event.altKey
      const keyOk = main === "?" ? event.key === "?" : event.key.toLowerCase() === main
      if (modOk && shiftOk && altOk && keyOk) {
        event.preventDefault()
        callbackRef.current()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [keys])
}

function ShortcutsDialog({ groups = DEFAULT_GROUPS, className }: ShortcutsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const mac = useMac()
  useHotkey("?", () => setOpen((current) => !current))
  const filtered = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.includes(query) || item.keys.join("").toLowerCase().includes(query.toLowerCase())),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <div data-slot="shortcuts-dialog" className={className}>
      <button type="button" className="rounded-md border px-2 py-1 text-xs" onClick={() => setOpen(true)}>
        快捷键 <Kbd>?</Kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn("max-w-md")}>
          <DialogHeader>
            <DialogTitle>快捷键</DialogTitle>
            <DialogDescription>按 ? 打开或关闭。修饰键会按系统显示。</DialogDescription>
          </DialogHeader>
          <input
            aria-label="搜索快捷键"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索"
            className="h-9 rounded-md border px-2 text-sm"
          />
          <div className="max-h-80 space-y-4 overflow-auto">
            {filtered.map((group) => (
              <section key={group.title}>
                <h3 className="text-xs text-muted-foreground">{group.title}</h3>
                <ul className="mt-2 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span>{item.label}</span>
                      <span className="flex gap-1">
                        {item.keys.map((key) => (
                          <Kbd key={key}>{labelFor(key, mac)}</Kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {filtered.length === 0 ? <p className="text-sm text-muted-foreground">没有匹配的快捷键。</p> : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { ShortcutsDialog }
