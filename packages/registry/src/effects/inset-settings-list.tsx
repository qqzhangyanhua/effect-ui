"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/inset-settings-list.tsx

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Bell, Check, ChevronLeft, ChevronRight, Globe, Moon, Shield, Smartphone, Wifi } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type SettingsRow =
  | { kind: "toggle"; id: string; label: string; icon?: ReactNode; tint?: string; defaultOn?: boolean; disabled?: boolean }
  | { kind: "choice"; id: string; label: string; icon?: ReactNode; tint?: string; options: string[]; defaultValue?: string }
  | { kind: "info"; id: string; label: string; icon?: ReactNode; tint?: string; value: string }

export interface SettingsSection {
  id: string
  header?: string
  footer?: string
  rows: SettingsRow[]
}

export interface InsetSettingsListProps {
  sections?: SettingsSection[]
  onChange?: (id: string, value: boolean | string) => void
  title?: string
  className?: string
}

export const DEFAULT_SETTINGS: SettingsSection[] = [
  {
    id: "net",
    rows: [
      { kind: "toggle", id: "wifi", label: "Wi-Fi sync", icon: <Wifi />, tint: "bg-chart-2", defaultOn: true },
      { kind: "choice", id: "appearance", label: "Appearance", icon: <Moon />, tint: "bg-primary", options: ["Automatic", "Light", "Dark"], defaultValue: "Automatic" },
      { kind: "choice", id: "region", label: "Region", icon: <Globe />, tint: "bg-chart-3", options: ["Europe (Frankfurt)", "US East (Virginia)", "Asia (Singapore)"], defaultValue: "Europe (Frankfurt)" },
    ],
  },
  {
    id: "notif",
    header: "Notifications",
    footer: "Quiet hours silence alerts from 22:00 to 07:00 on every device.",
    rows: [
      { kind: "toggle", id: "push", label: "Deploy alerts", icon: <Bell />, tint: "bg-destructive", defaultOn: true },
      { kind: "toggle", id: "quiet", label: "Quiet hours", icon: <Moon />, tint: "bg-chart-5" },
      { kind: "toggle", id: "sms", label: "SMS fallback", icon: <Smartphone />, tint: "bg-chart-4", disabled: true },
    ],
  },
  {
    id: "sec",
    header: "Security",
    rows: [{ kind: "info", id: "tfa", label: "Two-factor", icon: <Shield />, tint: "bg-muted-foreground", value: "On" }],
  },
]

function Switch({ on, onToggle, label, disabled, reduced }: { on: boolean; onToggle: () => void; label: string; disabled?: boolean; reduced: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onToggle} className={cn("relative h-[31px] w-[51px] shrink-0 rounded-full p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring", on ? "bg-primary" : "bg-muted", disabled && "cursor-not-allowed opacity-50")}>
      <motion.span className="block size-[27px] rounded-full bg-background shadow" initial={false} animate={{ x: on ? 20 : 0 }} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }} />
    </button>
  )
}

export function InsetSettingsList({ sections = DEFAULT_SETTINGS, onChange, title = "Settings", className }: InsetSettingsListProps) {
  const reduced = usePrefersReducedMotion()
  const uid = useId()
  const [values, setValues] = useState<Record<string, boolean | string>>(() => {
    const initial: Record<string, boolean | string> = {}
    sections.forEach((section) => section.rows.forEach((row) => {
      if (row.kind === "toggle") initial[row.id] = !!row.defaultOn
      if (row.kind === "choice") {
        const fallback = row.options[0]
        if (fallback !== undefined) initial[row.id] = row.defaultValue ?? fallback
      }
    }))
    return initial
  })
  const [page, setPage] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const backRef = useRef<HTMLButtonElement>(null)
  const lastRow = useRef<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const setValue = (id: string, value: boolean | string, label: string) => {
    setValues((current) => ({ ...current, [id]: value }))
    onChange?.(id, value)
    setMessage(typeof value === "boolean" ? `${label} ${value ? "on" : "off"}` : `${label}: ${value}`)
  }

  useEffect(() => {
    if (page) backRef.current?.focus()
    else if (lastRow.current) rowRefs.current[lastRow.current]?.focus()
  }, [page])

  const detail = sections.flatMap((section) => section.rows).find((row) => row.id === page && row.kind === "choice")
  const choice = detail && detail.kind === "choice" ? detail : undefined

  return (
    <div className={cn("relative w-full max-w-md overflow-hidden rounded-[28px] bg-muted text-foreground ring-1 ring-border motion-reduce:animate-none", className)} style={{ minHeight: 520 }} data-motion={reduced ? "off" : "on"}>
      <AnimatePresence initial={false} mode="popLayout">
        {!choice ? (
          <motion.div key="root" className="p-4 pb-6" initial={reduced ? { opacity: 0 } : { x: "-30%" }} animate={{ x: 0, opacity: 1 }} exit={reduced ? { opacity: 0 } : { x: "-30%" }} transition={{ duration: reduced ? 0.12 : 0.35 }}>
            <h3 className="px-2 pt-2 pb-3 text-[28px] font-bold">{title}</h3>
            {sections.map((section) => (
              <section key={section.id} aria-labelledby={section.header ? `${uid}-${section.id}` : undefined} className="mb-6">
                {section.header ? <h4 id={`${uid}-${section.id}`} className="px-4 pb-1.5 text-[13px] text-muted-foreground uppercase">{section.header}</h4> : null}
                <ul className="overflow-hidden rounded-[12px] bg-card">
                  {section.rows.map((row) => {
                    const inner = (
                      <>
                        {row.icon ? <span aria-hidden className={cn("grid size-[29px] shrink-0 place-items-center rounded-[7px] text-primary-foreground [&>svg]:size-[17px]", row.tint ?? "bg-muted-foreground")}>{row.icon}</span> : null}
                        <span className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 py-2 pr-4">
                          <span className="truncate">{row.label}</span>
                          {row.kind === "toggle" ? <Switch on={Boolean(values[row.id])} onToggle={() => setValue(row.id, !values[row.id], row.label)} label={row.label} disabled={row.disabled} reduced={reduced} /> : null}
                          {row.kind === "choice" ? <span className="flex items-center gap-1 text-muted-foreground"><span className="truncate">{values[row.id] as string}</span><ChevronRight aria-hidden className="size-4" /></span> : null}
                          {row.kind === "info" ? <span className="text-muted-foreground">{row.value}</span> : null}
                        </span>
                      </>
                    )
                    return (
                      <li key={row.id}>
                        {row.kind === "choice" ? (
                          <button ref={(node) => { rowRefs.current[row.id] = node }} type="button" onClick={() => { lastRow.current = row.id; setPage(row.id) }} className="flex w-full items-center gap-3 pl-4 text-left outline-none focus-visible:bg-accent">
                            {inner}
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 pl-4">{inner}</div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {section.footer ? <p className="px-4 pt-1.5 text-[13px] text-muted-foreground">{section.footer}</p> : null}
              </section>
            ))}
          </motion.div>
        ) : (
          <motion.div key="detail" className="p-4 pb-6" initial={reduced ? { opacity: 0 } : { x: "100%" }} animate={{ x: 0, opacity: 1 }} exit={reduced ? { opacity: 0 } : { x: "100%" }} transition={{ duration: reduced ? 0.12 : 0.35 }}>
            <button ref={backRef} type="button" onClick={() => setPage(null)} className="flex min-h-11 items-center text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <ChevronLeft aria-hidden className="size-6" /> {title}
            </button>
            <h3 className="px-2 pt-1 pb-4 text-[28px] font-bold">{choice.label}</h3>
            <div role="radiogroup" aria-label={choice.label} className="overflow-hidden rounded-[12px] bg-card">
              {choice.options.map((option) => {
                const selected = values[choice.id] === option
                return (
                  <button key={option} type="button" role="radio" aria-checked={selected} onClick={() => setValue(choice.id, option, choice.label)} className="flex w-full items-center pl-4 text-left outline-none focus-visible:bg-accent">
                    <span className="flex min-h-11 flex-1 items-center justify-between py-2 pr-4">
                      {option}
                      <AnimatePresence>{selected ? <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Check aria-hidden className="size-5 text-primary" /></motion.span> : null}</AnimatePresence>
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <span role="status" aria-live="polite" className="sr-only">{message}</span>
    </div>
  )
}
