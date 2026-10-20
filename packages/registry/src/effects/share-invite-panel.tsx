"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShareMember {
  id: string
  email: string
  permission: "view" | "edit"
}

export interface ShareInvitePanelProps {
  className?: string
}

const PERMISSION = { view: "可查看", edit: "可编辑" } as const

const INITIAL: readonly ShareMember[] = [
  { id: "lin", email: "lin@example.com", permission: "edit" },
  { id: "zhou", email: "zhou@example.com", permission: "view" },
]

function ShareInvitePanel({ className }: ShareInvitePanelProps) {
  const reduced = usePrefersReducedMotion()
  const nextId = React.useRef(1)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [draft, setDraft] = React.useState("")
  const [permission, setPermission] = React.useState<ShareMember["permission"]>("view")
  const [members, setMembers] = React.useState<ShareMember[]>([...INITIAL])
  const [guest, setGuest] = React.useState({ x: 72, y: 48 })
  const [self, setSelf] = React.useState({ x: 40, y: 36 })

  const addEmails = (raw: string) => {
    const emails = raw
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.includes("@"))
    if (emails.length === 0) return
    setMembers((current) => [
      ...current,
      ...emails.map((email) => {
        nextId.current += 1
        return { id: `m-${nextId.current}`, email, permission }
      }),
    ])
    setDraft("")
  }

  return (
    <section data-slot="share-invite-panel" className={cn("grid w-full gap-4 md:grid-cols-[1fr_16rem]", className)}>
      <div className="space-y-3">
        <h2 className="text-sm font-medium">邀请协作者</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={draft}
            aria-label="邮箱，用逗号分隔"
            placeholder="name@example.com"
            className="h-9 min-w-48 flex-1 rounded-md border bg-background px-3 text-sm"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== ",") return
              event.preventDefault()
              addEmails(draft)
            }}
          />
          <select
            aria-label="权限"
            className="rounded-md border bg-background px-2 text-sm"
            value={permission}
            onChange={(event) => setPermission(event.target.value as ShareMember["permission"])}
          >
            <option value="view">可查看</option>
            <option value="edit">可编辑</option>
          </select>
          <button type="button" className="rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={() => addEmails(draft)}>
            邀请
          </button>
        </div>
        <ul className="space-y-2">
          {members.map((member) => (
            <li key={member.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <span className="flex-1 truncate">{member.email}</span>
              <span className="text-xs text-muted-foreground">{PERMISSION[member.permission]}</span>
              <button
                type="button"
                aria-label={`移除 ${member.email}`}
                className="px-1"
                onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div
        ref={stageRef}
        className="relative h-48 overflow-hidden rounded-xl border bg-muted/40"
        aria-label="多人光标示意。你的指针旁边有一个滞后的访客光标。"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top
          setSelf({ x, y })
          if (reduced) {
            setGuest({ x: x + 28, y: y + 18 })
            return
          }
          setGuest((current) => ({ x: current.x + (x + 28 - current.x) * 0.35, y: current.y + (y + 18 - current.y) * 0.35 }))
        }}
      >
        <p className="p-3 text-xs text-muted-foreground">在这块区域里移动指针</p>
        <span className="absolute text-xs" style={{ left: self.x, top: self.y }}>
          你
        </span>
        <span className="absolute text-xs text-primary" style={{ left: guest.x, top: guest.y }}>
          访客
        </span>
      </div>
    </section>
  )
}

export { ShareInvitePanel }
