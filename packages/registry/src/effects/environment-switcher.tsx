"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/developer-tools/environment-switcher.tsx

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type EnvironmentType = "local" | "development" | "preview" | "staging" | "production" | (string & {})
export type EnvironmentStatus = "available" | "active" | "degraded" | "offline" | "deploying" | "locked" | (string & {})

export interface Environment {
  id: string
  name: string
  type: EnvironmentType
  status: EnvironmentStatus
  region?: string
  warning?: string
  disabled?: boolean
  disabledReason?: string
}

export interface EnvironmentSwitcherProps {
  environments: Environment[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string, environment: Environment) => void
  requireProductionConfirmation?: boolean
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

function blockedReason(env: Environment) {
  if (env.disabled) return env.disabledReason ?? "This environment is unavailable."
  if (env.status === "offline") return env.disabledReason ?? "This environment is offline."
  if (env.status === "locked") return env.disabledReason ?? "This environment is locked."
  return undefined
}

export function EnvironmentSwitcher({
  environments,
  value,
  defaultValue,
  onValueChange,
  requireProductionConfirmation = false,
  label = "Environment",
  placeholder = "Select environment",
  disabled = false,
  className,
}: EnvironmentSwitcherProps) {
  const reduced = usePrefersReducedMotion()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const selectedId = value ?? uncontrolled
  const selected = environments.find((env) => env.id === selectedId)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<Environment | null>(null)
  const [place, setPlace] = useState({ top: 0, left: 0, width: 280 })

  const commit = (env: Environment) => {
    if (value === undefined) setUncontrolled(env.id)
    onValueChange?.(env.id, env)
    setPending(null)
    setOpen(false)
  }

  const choose = (env: Environment) => {
    if (blockedReason(env)) return
    if (requireProductionConfirmation && env.type === "production" && env.id !== selectedId) {
      setPending(env)
      return
    }
    commit(env)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPending(null)
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-50" onMouseDown={() => { setPending(null); setOpen(false) }}>
            <div
              id={menuId}
              role="dialog"
              aria-label={label}
              data-motion={reduced ? "off" : "on"}
              className="absolute rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg motion-reduce:animate-none"
              style={{ top: place.top, left: place.left, width: place.width }}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {pending ? (
                <div className="space-y-3 p-2">
                  <p className="text-sm">Switch to {pending.name}? This environment serves live traffic.</p>
                  {pending.warning ? <p className="text-sm text-destructive">{pending.warning}</p> : null}
                  <div className="flex gap-2">
                    <button type="button" className="min-h-11 flex-1 rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={() => commit(pending)}>
                      Confirm {pending.name}
                    </button>
                    <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={() => setPending(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="m-0 max-h-80 list-none space-y-1 overflow-auto p-0">
                  {environments.map((env) => {
                    const reason = blockedReason(env)
                    return (
                      <li key={env.id}>
                        <button
                          type="button"
                          disabled={Boolean(reason)}
                          className="flex min-h-11 w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left text-sm disabled:opacity-50"
                          onClick={() => choose(env)}
                        >
                          <span>
                            <span className="block font-medium">{env.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {env.type} · {env.status}
                              {env.region ? ` · ${env.region}` : ""}
                            </span>
                            {reason ? <span className="block text-xs">{reason}</span> : null}
                          </span>
                          {env.id === selectedId ? <span aria-hidden>✓</span> : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div className={cn("inline-flex", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground"
        onClick={() => {
          const rect = buttonRef.current?.getBoundingClientRect()
          if (rect) {
            const margin = 8
            const maxWidth = Math.max(160, window.innerWidth - margin * 2)
            const width = Math.min(Math.max(rect.width, 280), maxWidth)
            const left = Math.min(Math.max(margin, rect.left), window.innerWidth - width - margin)
            setPlace({ top: rect.bottom + 8, left, width })
          }
          setOpen((valueOpen) => !valueOpen)
        }}
      >
        <span>{label}:</span>
        <span>{selected?.name ?? placeholder}</span>
      </button>
      {menu}
    </div>
  )
}
