"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CookieConsentValue {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface CookieConsentProps {
  className?: string
  storageKey?: string
  onChange?: (value: CookieConsentValue) => void
}

const STORAGE_EVENT = "effect-ui-consent"

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  window.addEventListener(STORAGE_EVENT, onStoreChange)
  return () => {
    window.removeEventListener("storage", onStoreChange)
    window.removeEventListener(STORAGE_EVENT, onStoreChange)
  }
}

function readRaw(storageKey: string) {
  try {
    return window.localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

function parseConsent(raw: string | null): CookieConsentValue | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<CookieConsentValue>
    if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") return null
    return { necessary: true, analytics: value.analytics, marketing: value.marketing }
  } catch {
    return null
  }
}

function writeConsent(storageKey: string, value: CookieConsentValue | null) {
  try {
    if (value) window.localStorage.setItem(storageKey, JSON.stringify(value))
    else window.localStorage.removeItem(storageKey)
  } catch {
    return
  }
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

function Switch({
  label,
  checked,
  disabled,
  onToggle,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 rounded-md px-1 py-1.5 text-left text-sm disabled:opacity-70"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white",
            checked ? "left-4" : "left-0.5",
          )}
        />
      </span>
    </button>
  )
}

function CookieConsent({
  className,
  storageKey = "effect-ui-cookie-consent",
  onChange,
}: CookieConsentProps) {
  const reduced = usePrefersReducedMotion()
  const raw = React.useSyncExternalStore(
    subscribe,
    () => readRaw(storageKey),
    () => null,
  )
  const saved = parseConsent(raw)
  const [expanded, setExpanded] = React.useState(false)
  const [draft, setDraft] = React.useState<CookieConsentValue>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  const save = (value: CookieConsentValue) => {
    writeConsent(storageKey, value)
    onChange?.(value)
    setDraft(value)
    setExpanded(false)
  }

  const shell = cn(
    "fixed right-4 bottom-4 z-40 w-[22rem] max-w-[calc(100%-2rem)] rounded-xl border bg-popover p-4 text-popover-foreground shadow-xl",
    className,
  )

  if (saved) {
    return (
      <div data-slot="cookie-consent" className={shell}>
        <p className="text-sm font-medium">偏好已保存</p>
        <p className="mt-1 text-xs text-muted-foreground">
          分析 {saved.analytics ? "开启" : "关闭"} · 营销 {saved.marketing ? "开启" : "关闭"}
        </p>
        <button
          type="button"
          className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
          onClick={() => writeConsent(storageKey, null)}
        >
          重新选择
        </button>
      </div>
    )
  }

  return (
    <div data-slot="cookie-consent" className={shell} role="dialog" aria-label="Cookie 偏好">
      <p className="text-sm font-medium">这个演示会记住你的选择</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        必要项始终开启。分析和营销可以单独开关，结果写在本机 localStorage。
      </p>
      <button
        type="button"
        className="mt-3 text-sm underline-offset-4 hover:underline"
        aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "收起类别" : "自定义类别"}
      </button>
      {expanded ? (
        <motion.div
          initial={reduced ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
          className="overflow-hidden"
        >
          <div className="mt-2 space-y-1 rounded-lg border p-2">
            <Switch label="必要" checked disabled />
            <Switch
              label="分析"
              checked={draft.analytics}
              onToggle={() => setDraft((current) => ({ ...current, analytics: !current.analytics }))}
            />
            <Switch
              label="营销"
              checked={draft.marketing}
              onToggle={() => setDraft((current) => ({ ...current, marketing: !current.marketing }))}
            />
          </div>
        </motion.div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          onClick={() => save({ necessary: true, analytics: true, marketing: true })}
        >
          全部接受
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => save({ necessary: true, analytics: false, marketing: false })}
        >
          全部拒绝
        </button>
        <button
          type="button"
          className="rounded-md border px-3 py-1.5 text-sm"
          onClick={() => save(draft)}
        >
          保存选择
        </button>
      </div>
    </div>
  )
}

export { CookieConsent }
