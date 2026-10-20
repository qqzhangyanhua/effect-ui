"use client"

import * as React from "react"
import { motion } from "motion/react"

import { Calendar } from "@/components/ui/calendar"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScheduleSlot {
  time: string
  available?: boolean
}

export interface ScheduleSlotPickerProps {
  className?: string
  getSlots?: (date: Date) => ScheduleSlot[]
  timeZone?: string
  onConfirm?: (value: { date: Date; time: string; timeZone: string }) => void
}

const ZONES = ["Asia/Shanghai", "Asia/Tokyo", "Europe/London", "America/New_York", "UTC"]
const ANCHOR = new Date(2026, 9, 20)

function defaultSlots(date: Date): ScheduleSlot[] {
  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  const closed = date.getDay() === 0 ? new Set(["09:00", "10:00"]) : new Set(["14:00"])
  return times.map((time) => ({ time, available: !closed.has(time) }))
}

function formatSlot(time: string, hour12: boolean, timeZone: string) {
  const [hour, minute] = time.split(":").map((part) => Number(part))
  const instant = new Date(Date.UTC(2026, 9, 20, hour ?? 0, minute ?? 0))
  const clock = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: hour12 ? "h12" : "h23",
    timeZone: "UTC",
  }).format(instant)
  const zoneName =
    new Intl.DateTimeFormat("zh-CN", { timeZone, hour: "2-digit", timeZoneName: "short" })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? timeZone
  return `${clock} ${zoneName}`
}

function ScheduleSlotPicker({
  className,
  getSlots = defaultSlots,
  timeZone: timeZoneProp = "Asia/Shanghai",
  onConfirm,
}: ScheduleSlotPickerProps) {
  const reduced = usePrefersReducedMotion()
  const [date, setDate] = React.useState<Date | undefined>(ANCHOR)
  const [zone, setZone] = React.useState(timeZoneProp)
  const [hour12, setHour12] = React.useState(false)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [confirmed, setConfirmed] = React.useState(false)
  const slots = date ? getSlots(date) : []

  return (
    <div data-slot="schedule-slot-picker" className={cn("w-full max-w-3xl rounded-xl border p-3 sm:p-4", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          时区
          <select aria-label="时区" className="h-9 rounded-md border bg-background px-2" value={zone} onChange={(event) => setZone(event.target.value)}>
            {ZONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="rounded-md border px-2 py-1 text-xs" aria-pressed={hour12} onClick={() => setHour12((current) => !current)}>
          {hour12 ? "12 小时" : "24 小时"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(next) => {
            setDate(next)
            setSelected(null)
            setConfirmed(false)
          }}
          defaultMonth={ANCHOR}
        />
        <div>
          {selected && date ? (
            <motion.div layout className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <p className="text-sm font-medium">
                {date.toLocaleDateString("zh-CN")} · {formatSlot(selected, hour12, zone)}
              </p>
              <button
                type="button"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
                onClick={() => {
                  setConfirmed(true)
                  onConfirm?.({ date, time: selected, timeZone: zone })
                }}
              >
                确认
              </button>
              {confirmed ? <span className="text-xs text-emerald-600">已确认</span> : null}
            </motion.div>
          ) : (
            <div role="radiogroup" aria-label="可预约时段" className="grid gap-2">
              {slots.map((slot, index) => (
                <motion.button
                  key={slot.time}
                  type="button"
                  role="radio"
                  aria-checked={selected === slot.time}
                  disabled={slot.available === false}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduced ? 0 : index * 0.04 }}
                  className="rounded-lg border px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
                  onClick={() => {
                    setSelected(slot.time)
                    setConfirmed(false)
                  }}
                >
                  {formatSlot(slot.time, hour12, zone)}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ScheduleSlotPicker }
