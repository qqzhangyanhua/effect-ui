"use client"

import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type SessionDevice = "desktop" | "mobile" | "tablet"

export interface ActiveSession {
  id: string
  device: SessionDevice
  browser: string
  os: string
  city: string
  lastActive: string
  current?: boolean
}

export interface ActiveSessionsListProps {
  sessions: readonly ActiveSession[]
  onSignOut?: (id: string) => void
  onSignOutOthers?: () => void
  className?: string
}

function DeviceIcon({ device }: { device: SessionDevice }) {
  if (device === "mobile") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <rect x="7" y="2" width="10" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="18" r="0.8" fill="currentColor" />
      </svg>
    )
  }
  if (device === "tablet") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
        <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="17.5" r="0.8" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function relativeTime(iso: string) {
  const delta = new Date(iso).getTime() - Date.now()
  if (Number.isNaN(delta)) return iso
  const format = new Intl.RelativeTimeFormat("zh-Hans", { numeric: "auto" })
  const abs = Math.abs(delta)
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (abs < minute) return format.format(Math.round(delta / 1000), "second")
  if (abs < hour) return format.format(Math.round(delta / minute), "minute")
  if (abs < day) return format.format(Math.round(delta / hour), "hour")
  return format.format(Math.round(delta / day), "day")
}

function ActiveSessionsList({ sessions, onSignOut, onSignOutOthers, className }: ActiveSessionsListProps) {
  const reduced = usePrefersReducedMotion()
  const [items, setItems] = React.useState(sessions)
  const [previous, setPrevious] = React.useState(sessions)
  const [pending, setPending] = React.useState<string | "others" | null>(null)

  if (sessions !== previous) {
    setItems(sessions)
    setPrevious(sessions)
  }

  const confirm = () => {
    if (pending === "others") {
      setItems((current) => current.filter((session) => session.current))
      onSignOutOthers?.()
    } else if (pending) {
      const id = pending
      setItems((current) => current.filter((session) => session.id !== id))
      onSignOut?.(id)
    }
    setPending(null)
  }

  return (
    <section data-slot="active-sessions-list" className={cn("w-full rounded-xl border", className)}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="text-sm font-medium">已登录设备</h2>
        <button type="button" className="h-8 rounded-md border px-2 text-xs" onClick={() => setPending("others")}>
          登出其他设备
        </button>
      </div>
      <ul className="divide-y">
        <AnimatePresence initial={false}>
          {items.map((session) => (
            <motion.li
              key={session.id}
              layout
              exit={reduced ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <DeviceIcon device={session.device} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm">
                    <span>
                      {session.browser} · {session.os}
                    </span>
                    {session.current ? <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">当前设备</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.city} · {relativeTime(session.lastActive)}
                  </p>
                </div>
                {session.current ? null : (
                  <button type="button" className="h-8 rounded-md border px-2 text-xs" onClick={() => setPending(session.id)}>
                    登出
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Dialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending === "others" ? "登出其他设备？" : "登出这个设备？"}</DialogTitle>
            <DialogDescription>
              {pending === "others" ? "其他设备需要重新登录。当前设备会保留。" : "该设备需要重新登录。"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" className="h-9 rounded-md border px-3 text-sm" onClick={() => setPending(null)}>
              取消
            </button>
            <button type="button" className="h-9 rounded-md bg-destructive px-3 text-sm text-white" onClick={confirm}>
              确认登出
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { ActiveSessionsList }
