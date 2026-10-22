"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/presence-facepile/presence-facepile.tsx

import { AnimatePresence, motion } from "motion/react"
import { useId, useRef, useState, type HTMLAttributes } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const presenceColors = ["var(--destructive)", "var(--chart-4)", "var(--chart-2)", "var(--chart-3)", "var(--chart-1)", "var(--chart-5)", "var(--primary)", "var(--accent)"] as const

function presenceColor(key: string) {
  let hash = 0
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index)
    hash |= 0
  }
  return presenceColors[Math.abs(hash) % presenceColors.length] ?? "var(--primary)"
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  if (!first) return "?"
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const last = parts[parts.length - 1]
  return `${first[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export type PresenceUser = {
  id: string
  name: string
  avatar?: string
  status?: "active" | "idle" | "typing" | "offline"
  color?: string
}

export type PresenceFacepileProps = HTMLAttributes<HTMLDivElement> & {
  users: PresenceUser[]
  max?: number
  size?: "sm" | "md" | "lg"
  showStatus?: boolean
}

const sizes = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-10 text-sm",
}

const statusColor = {
  active: "var(--chart-2)",
  idle: "var(--chart-4)",
  typing: "var(--primary)",
  offline: "var(--muted-foreground)",
}

function Avatar({ user, sizeClass, showStatus, bounce }: { user: PresenceUser; sizeClass: string; showStatus: boolean; bounce: string }) {
  const status = user.status ?? "active"
  return (
    <span className="relative inline-block">
      <span className={`flex items-center justify-center overflow-hidden rounded-full font-semibold text-primary-foreground ring-2 ring-background ${sizeClass}`} style={{ backgroundColor: user.color ?? presenceColor(user.id) }}>
        {user.avatar ? <img src={user.avatar} alt={user.name} className="size-full object-cover" /> : initials(user.name)}
      </span>
      {showStatus ? (
        status === "typing" ? (
          <span className="absolute -right-0.5 -bottom-0.5 flex items-center gap-px rounded-full bg-background px-0.5 py-1 shadow-sm">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="size-1 rounded-full bg-primary motion-reduce:animate-none"
                style={{
                  animationName: bounce,
                  animationDuration: "1s",
                  animationTimingFunction: "ease-in-out",
                  animationDelay: `${index * 120}ms`,
                  animationIterationCount: "infinite",
                  animationPlayState: "var(--presence-play, paused)",
                }}
              />
            ))}
          </span>
        ) : (
          <span className="absolute right-0 bottom-0 size-2.5 rounded-full ring-2 ring-background" style={{ backgroundColor: statusColor[status] }} />
        )
      ) : null}
    </span>
  )
}

export function PresenceFacepile({ users, max = 5, size = "md", showStatus = true, className, ...props }: PresenceFacepileProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const bounce = `presence-bounce-${useId().replace(/:/g, "")}`
  const [open, setOpen] = useState(false)
  const visible = users.slice(0, max)
  const overflow = users.slice(max)
  const sizeClass = sizes[size]
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 32 }
  return (
    <div ref={ref} data-slot="presence-facepile" data-motion={live && !reduced ? "on" : "off"} className={`relative flex items-center motion-reduce:transition-none ${className ?? ""}`} style={{ ["--presence-play" as string]: live && !reduced ? "running" : "paused" }} {...props}>
      <style>{`@keyframes ${bounce}{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}`}</style>
      <div className="flex items-center -space-x-2">
        <AnimatePresence initial={false}>
          {visible.map((user) => (
            <motion.div key={user.id} layout={!reduced && live} initial={reduced ? false : { opacity: 0, scale: 0.5, x: -8 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.5 }} transition={spring} title={`${user.name}${user.status ? ` · ${user.status}` : ""}`} className="active:-translate-y-0.5">
              <Avatar user={user} sizeClass={sizeClass} showStatus={showStatus} bounce={bounce} />
            </motion.div>
          ))}
        </AnimatePresence>
        {overflow.length > 0 ? (
          <button type="button" onClick={() => setOpen((value) => !value)} aria-label={`${overflow.length} more`} aria-expanded={open} className={`relative z-10 flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ring-2 ring-background active:bg-accent ${sizeClass}`}>
            +{overflow.length}
          </button>
        ) : null}
      </div>
      <AnimatePresence>
        {open && overflow.length > 0 ? (
          <motion.div initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32, mass: 0.9 }} className="absolute top-full left-0 z-30 mt-2 max-h-64 w-56 origin-top-left overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-xl">
            {overflow.map((user) => (
              <div key={user.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
                <Avatar user={user} sizeClass={sizes.sm} showStatus={showStatus} bounce={bounce} />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.status ?? "active"}</span>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
