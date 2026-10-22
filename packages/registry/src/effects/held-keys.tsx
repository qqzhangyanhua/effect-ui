"use client"

// Ported from HextaUI (MIT, (c) 2026 Preet Suthar) — https://github.com/preetsuthar17/HextaUI/blob/main/hooks/use-held-keys.ts

import { useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

export interface HeldKeysProps {
  label?: string
  emptyLabel?: string
  className?: string
}

const modifierNames: Record<string, string> = {
  Meta: "meta",
  OS: "meta",
  Control: "ctrl",
  Alt: "alt",
  AltGraph: "alt",
  Shift: "shift",
}

const emptyHeld: ReadonlySet<string> = new Set()
let held: ReadonlySet<string> = emptyHeld
const subscribers = new Set<() => void>()

function physicalKey(event: KeyboardEvent) {
  const modifier = modifierNames[event.key]
  if (modifier) return modifier
  const letter = /^Key([A-Z])$/.exec(event.code)
  if (letter?.[1]) return letter[1].toLowerCase()
  const digit = /^(?:Digit|Numpad)([0-9])$/.exec(event.code)
  if (digit?.[1]) return digit[1]
  if (event.key === " ") return "space"
  return event.key.toLowerCase()
}

function publish(next: ReadonlySet<string>) {
  held = next
  for (const notify of subscribers) notify()
}

function onKeyDown(event: KeyboardEvent) {
  if (event.repeat) return
  const key = physicalKey(event)
  if (!held.has(key)) publish(new Set([...held, key]))
}

function onKeyUp(event: KeyboardEvent) {
  const key = physicalKey(event)
  if (key === "meta") {
    const modifiers = new Set(Object.values(modifierNames))
    publish(new Set([...held].filter((name) => name !== "meta" && modifiers.has(name))))
    return
  }
  if (!held.has(key)) return
  const next = new Set(held)
  next.delete(key)
  publish(next)
}

function releaseAll() {
  if (held.size > 0) publish(emptyHeld)
}

function onVisibility() {
  if (document.visibilityState === "hidden") releaseAll()
}

function subscribe(notify: () => void) {
  subscribers.add(notify)
  if (subscribers.size === 1) {
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    window.addEventListener("blur", releaseAll)
    document.addEventListener("visibilitychange", onVisibility)
  }
  return () => {
    subscribers.delete(notify)
    if (subscribers.size > 0) return
    window.removeEventListener("keydown", onKeyDown)
    window.removeEventListener("keyup", onKeyUp)
    window.removeEventListener("blur", releaseAll)
    document.removeEventListener("visibilitychange", onVisibility)
    held = emptyHeld
  }
}

function getHeld() {
  return held
}

function getServerHeld() {
  return emptyHeld
}

export function HeldKeys({ label = "Hold any key", emptyLabel = "None", className }: HeldKeysProps) {
  const heldKeys = useSyncExternalStore(subscribe, getHeld, getServerHeld)
  const names = [...heldKeys]

  return (
    <div tabIndex={0} className={cn("flex min-w-64 flex-col gap-3 rounded-xl border border-border bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div aria-live="polite" className="flex min-h-10 flex-wrap gap-2">
        {names.length === 0 ? <span className="text-sm text-muted-foreground">{emptyLabel}</span> : null}
        {names.map((name) => (
          <kbd key={name} className="rounded-md border border-border bg-muted px-2 py-1 font-mono text-sm text-foreground">
            {name}
          </kbd>
        ))}
      </div>
    </div>
  )
}
