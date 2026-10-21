"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: "joined" | "pending"
}

export interface TeamMembersTableProps {
  members?: TeamMember[]
  roles?: string[]
  cooldown?: number
  onRoleChange?: (id: string, role: string) => void
  onRemove?: (ids: string[]) => void
  onResend?: (id: string) => void
  className?: string
}

const DEFAULTS: TeamMember[] = [
  { id: "lin", name: "林夏", email: "lin@north.example", role: "管理员", status: "joined" },
  { id: "zhou", name: "周宁", email: "zhou@north.example", role: "成员", status: "pending" },
  { id: "zhao", name: "赵衡", email: "zhao@north.example", role: "成员", status: "joined" },
]

function TeamMembersTable({ members: initial = DEFAULTS, roles = ["管理员", "成员", "只读"], cooldown = 20, onRoleChange, onRemove, onResend, className }: TeamMembersTableProps) {
  usePrefersReducedMotion()
  const [members, setMembers] = React.useState(initial)
  const [query, setQuery] = React.useState("")
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set())
  const [cooldowns, setCooldowns] = React.useState<Record<string, number>>({})
  const ticking = Object.keys(cooldowns).length > 0
  const visible = members.filter((member) => member.name.includes(query) || member.email.includes(query))

  React.useEffect(() => {
    if (!ticking) return
    const timer = window.setInterval(() => {
      setCooldowns((current) => {
        const next: Record<string, number> = {}
        for (const [id, seconds] of Object.entries(current)) {
          if (seconds > 1) next[id] = seconds - 1
        }
        return next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [ticking])

  const changeRole = (id: string, role: string) => {
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, role } : member)))
    onRoleChange?.(id, role)
  }

  return (
    <section data-slot="team-members-table" className={cn("mx-auto w-full max-w-4xl space-y-3", className)}>
      <input aria-label="搜索成员" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="姓名或邮箱" className="h-10 w-full max-w-xs rounded-md border px-3" />
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>已选 {selected.size}</span>
          <select aria-label="批量角色" defaultValue="" onChange={(event) => { const role = event.target.value; if (!role) return; selected.forEach((id) => changeRole(id, role)) }}>
            <option value="">修改角色</option>
            {roles.map((role) => <option key={role}>{role}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              const ids = [...selected]
              setMembers((current) => current.filter((member) => !selected.has(member.id)))
              setSelected(new Set())
              onRemove?.(ids)
            }}
          >
            移除所选
          </button>
        </div>
      ) : null}
      <table className="w-full text-left text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-2" />
            <th className="font-normal">成员</th>
            <th className="font-normal">角色</th>
            <th className="font-normal">状态</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {visible.map((member) => (
            <tr key={member.id} className="border-t">
              <td className="py-2">
                <input
                  type="checkbox"
                  aria-label={`选择 ${member.name}`}
                  checked={selected.has(member.id)}
                  onChange={() => {
                    setSelected((current) => {
                      const next = new Set(current)
                      if (next.has(member.id)) next.delete(member.id)
                      else next.add(member.id)
                      return next
                    })
                  }}
                />
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/15">{member.name.slice(0, 1)}</span>
                  <div>
                    <p>{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
              </td>
              <td>
                <select aria-label={`角色 ${member.name}`} value={member.role} onChange={(event) => changeRole(member.id, event.target.value)}>
                  {roles.map((role) => <option key={role}>{role}</option>)}
                </select>
              </td>
              <td>{member.status === "joined" ? "已加入" : "待接受邀请"}</td>
              <td>
                {member.status === "pending" ? (
                  <button
                    type="button"
                    disabled={Boolean(cooldowns[member.id])}
                    onClick={() => {
                      setCooldowns((current) => ({ ...current, [member.id]: cooldown }))
                      onResend?.(member.id)
                    }}
                  >
                    {cooldowns[member.id] ? `${cooldowns[member.id]}s` : "重发邀请"}
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export { TeamMembersTable }
