"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ScheduleSlotPickerProps {
  className?: string
}

const DAYS = ["周一", "周二", "周三"] as const
const SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
const TAKEN = new Set(["周一 10:00", "周二 14:00", "周三 09:00"])

function ScheduleSlotPicker({ className }: ScheduleSlotPickerProps) {
  const [day, setDay] = React.useState<(typeof DAYS)[number]>("周一")
  const [slot, setSlot] = React.useState<string | null>(null)

  return (
    <section data-slot="schedule-slot-picker" className={cn("w-full space-y-3", className)}>
      <div role="tablist" aria-label="日期" className="flex gap-2">
        {DAYS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={day === item}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
              day === item && "bg-primary text-primary-foreground",
            )}
            onClick={() => setDay(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={`${day}的时段`} className="grid grid-cols-3 gap-2">
        {SLOTS.map((time) => {
          const id = `${day} ${time}`
          const taken = TAKEN.has(id)
          const selected = slot === id
          return (
            <button
              key={time}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={taken}
              className={cn(
                "rounded-lg border px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                selected && "border-primary bg-primary/15",
              )}
              onClick={() => setSlot(id)}
            >
              {time}
              {taken ? " 已占" : ""}
            </button>
          )
        })}
      </div>
      <p className="text-sm">{slot ? `已选 ${slot}` : "还没有选择时段。"}</p>
    </section>
  )
}

export { ScheduleSlotPicker }
