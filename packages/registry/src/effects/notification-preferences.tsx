"use client"

import { AnimatePresence, motion } from "motion/react"
import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export const notificationChannels = [
  { id: "email", label: "邮件" },
  { id: "in-app", label: "应用内" },
  { id: "push", label: "推送" },
  { id: "slack", label: "Slack" },
] as const

export type NotificationChannel = (typeof notificationChannels)[number]["id"]
export type NotificationMatrix = Record<string, Record<NotificationChannel, boolean>>

export interface NotificationEvent {
  id: string
  label: string
}

export interface NotificationGroup {
  id: string
  label: string
  events: readonly NotificationEvent[]
}

export interface NotificationPreferencesProps {
  groups?: readonly NotificationGroup[]
  value: NotificationMatrix
  onChange: (value: NotificationMatrix) => void
  onSave?: (value: NotificationMatrix) => void
  className?: string
}

const DEFAULT_GROUPS: readonly NotificationGroup[] = [
  {
    id: "account",
    label: "账户",
    events: [
      { id: "sign-in", label: "新的登录" },
      { id: "billing", label: "账单与额度" },
    ],
  },
  {
    id: "work",
    label: "协作",
    events: [
      { id: "mention", label: "被提及" },
      { id: "assign", label: "任务分配" },
    ],
  },
]

function cell(value: NotificationMatrix, eventId: string, channel: NotificationChannel) {
  return value[eventId]?.[channel] ?? false
}

function rowOf(value: NotificationMatrix, eventId: string): Record<NotificationChannel, boolean> {
  return {
    email: value[eventId]?.email ?? false,
    "in-app": value[eventId]?.["in-app"] ?? false,
    push: value[eventId]?.push ?? false,
    slack: value[eventId]?.slack ?? false,
  }
}

function NotificationPreferences({
  groups = DEFAULT_GROUPS,
  value,
  onChange,
  onSave,
  className,
}: NotificationPreferencesProps) {
  const reduced = usePrefersReducedMotion()
  const events = groups.flatMap((group) => group.events)
  const [saved, setSaved] = React.useState(value)
  const dirty = JSON.stringify(value) !== JSON.stringify(saved)

  const setCell = (eventId: string, channel: NotificationChannel, checked: boolean) => {
    onChange({
      ...value,
      [eventId]: { ...rowOf(value, eventId), [channel]: checked },
    })
  }

  const setRow = (eventId: string, checked: boolean) => {
    const next = rowOf(value, eventId)
    for (const channel of notificationChannels) next[channel.id] = checked
    onChange({ ...value, [eventId]: next })
  }

  const setColumn = (channel: NotificationChannel, checked: boolean) => {
    const next: NotificationMatrix = { ...value }
    for (const event of events) next[event.id] = { ...rowOf(value, event.id), [channel]: checked }
    onChange(next)
  }

  return (
    <section data-slot="notification-preferences" className={cn("relative w-full overflow-hidden rounded-xl border", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-3 py-3 font-medium">事件</th>
            <th className="px-2 py-3 font-medium">整行</th>
            {notificationChannels.map((channel) => {
              const values = events.map((event) => cell(value, event.id, channel.id))
              const all = values.every(Boolean)
              const some = values.some(Boolean)
              return (
                <th key={channel.id} className="px-2 py-3 font-medium">
                  <span className="mb-1 block">{channel.label}</span>
                  <Checkbox
                    aria-label={`全选${channel.label}`}
                    checked={all ? true : some ? "indeterminate" : false}
                    onCheckedChange={(checked) => setColumn(channel.id, checked === true)}
                  />
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.id}>
              <tr>
                <th colSpan={6} className="bg-muted/40 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  {group.label}
                </th>
              </tr>
              {group.events.map((event) => {
                const rowValues = notificationChannels.map((channel) => cell(value, event.id, channel.id))
                const all = rowValues.every(Boolean)
                const some = rowValues.some(Boolean)
                return (
                  <tr key={event.id} className="border-t">
                    <th scope="row" className="px-3 py-3 text-left font-normal">
                      {event.label}
                    </th>
                    <td className="px-2">
                      <Checkbox
                        aria-label={`全选${event.label}`}
                        checked={all ? true : some ? "indeterminate" : false}
                        onCheckedChange={(checked) => setRow(event.id, checked === true)}
                      />
                    </td>
                    {notificationChannels.map((channel) => (
                      <td key={channel.id} className="px-2">
                        <Switch
                          aria-label={`${event.label} ${channel.label}`}
                          checked={cell(value, event.id, channel.id)}
                          onCheckedChange={(checked) => setCell(event.id, channel.id, checked)}
                        />
                      </td>
                    ))}
                  </tr>
                )
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <AnimatePresence>
        {dirty ? (
          <motion.div
            initial={reduced ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: 24, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-3 py-3"
          >
            <p className="text-sm">有未保存的更改</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-9 rounded-md border px-3 text-sm"
                onClick={() =>
                  onChange(
                    Object.fromEntries(
                      Object.entries(saved).map(([eventId, row]) => [eventId, { ...row }]),
                    ) as NotificationMatrix,
                  )
                }
              >
                撤销
              </button>
              <button
                type="button"
                className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground"
                onClick={() => {
                  setSaved(value)
                  onSave?.(value)
                }}
              >
                保存更改
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

export { NotificationPreferences }
