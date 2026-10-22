"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/stacked-list.tsx

import { useMemo, useState } from "react"
import { Briefcase, Database, Palette, PenLine, Plus, Search, User, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type Role = "pm" | "designer" | "data" | "creator"

interface Member {
  id: string
  name: string
  status: string
  online: boolean
  role: string
  roleType: Role
  avatar: string
}

function avatar(name: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="hsl(${hue} 42% 48%)"/><text x="48" y="58" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">${name.slice(0, 1)}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const members: Member[] = [
  { id: "01", name: "Oliver Smith", status: "Online", online: true, role: "Project Manager", roleType: "pm", avatar: avatar("Oliver", 200) },
  { id: "02", name: "Sophie Chen", status: "17m ago", online: false, role: "Designer", roleType: "designer", avatar: avatar("Sophie", 330) },
  { id: "03", name: "Noah Wilson", status: "29m ago", online: false, role: "Data Specialist", roleType: "data", avatar: avatar("Noah", 150) },
  { id: "04", name: "Emma Davis", status: "48m ago", online: false, role: "Creator", roleType: "creator", avatar: avatar("Emma", 280) },
  { id: "05", name: "Leo Garcia", status: "Online", online: true, role: "Designer", roleType: "designer", avatar: avatar("Leo", 20) },
  { id: "06", name: "Mia Thompson", status: "Online", online: true, role: "Project Manager", roleType: "pm", avatar: avatar("Mia", 250) },
  { id: "07", name: "Ethan Wright", status: "5h ago", online: false, role: "Data Specialist", roleType: "data", avatar: avatar("Ethan", 90) },
]

const roleIcon = { pm: Briefcase, designer: Palette, data: Database, creator: PenLine }

export interface StackedListProps {
  className?: string
}

export function StackedList({ className }: StackedListProps) {
  const reduced = usePrefersReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState("")
  const active = members.filter((member) => member.online)
  const filtered = useMemo(
    () => members.filter((member) => member.name.toLowerCase().includes(query.toLowerCase()) || member.role.toLowerCase().includes(query.toLowerCase())),
    [query],
  )
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 240, damping: 30 }

  const row = (member: Member) => {
    const Icon = roleIcon[member.roleType]
    return (
      <div key={member.id} className="flex items-center gap-3 border-b border-[var(--border)] py-3 last:border-0">
        <img src={member.avatar} alt="" className="size-12 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{member.name}</h3>
          <p className={cn("text-xs", member.online ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>{member.status}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1 text-[10px] uppercase">
          <Icon className="size-3" />
          {member.role}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("relative h-[460px] w-full max-w-[440px] overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--background)]", className)}>
      <div className="p-6 pb-3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            Active Members
            <span className="rounded-full bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)]">{active.length}</span>
          </h2>
          <Button type="button" variant="outline" size="icon" aria-label="Add member" className="size-9 rounded-full">
            <Plus className="size-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input aria-label="Search teammates" placeholder="Search teammates..." value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 rounded-2xl pl-10" />
        </div>
      </div>
      <div className="px-6">{active.map(row)}</div>
      <motion.div
        data-expanded={expanded ? "true" : "false"}
        className="absolute z-10 flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--card)]"
        initial={false}
        animate={{
          height: expanded ? "calc(100% - 20px)" : 68,
          width: expanded ? "calc(100% - 20px)" : "calc(100% - 40px)",
          bottom: expanded ? 10 : 20,
          left: expanded ? 10 : 20,
          borderRadius: expanded ? 32 : 24,
        }}
        transition={spring}
      >
        <div className="flex h-[68px] w-full items-center justify-between px-3 text-left">
          <button type="button" className="flex items-center gap-3" onClick={() => setExpanded(true)} disabled={expanded}>
            <span className="flex size-11 items-center justify-center rounded-xl border border-[var(--border)]">
              <User className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-medium">Member Directory</span>
              <span className="block text-xs text-[var(--muted-foreground)]">{members.length} Members Registered</span>
            </span>
          </button>
          {expanded ? (
            <button type="button" aria-label="Close directory" className="flex size-9 items-center justify-center rounded-xl bg-[var(--muted)]" onClick={() => setExpanded(false)}>
              <X className="size-4" />
            </button>
          ) : (
            <span className="flex -space-x-2">
              {members.slice(0, 3).map((member) => (
                <img key={member.id} src={member.avatar} alt="" className="size-8 rounded-full ring-2 ring-[var(--background)]" />
              ))}
            </span>
          )}
        </div>
        <AnimatePresence>
          {expanded ? (
            <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-0 flex-1 flex-col px-4 pb-3">
              <div className="relative mb-2">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <Input aria-label="Search members" placeholder="Search members..." value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 rounded-xl pl-10" />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">{filtered.map(row)}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default StackedList
