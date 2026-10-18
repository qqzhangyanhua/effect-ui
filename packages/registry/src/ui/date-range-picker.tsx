"use client"

import * as React from "react"
import { format, startOfDay, subDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DateRangePreset {
  label: string
  range: DateRange
}

function defaultPresets(today = startOfDay(new Date())): DateRangePreset[] {
  return [
    { label: "今天", range: { from: today, to: today } },
    { label: "近 7 天", range: { from: subDays(today, 6), to: today } },
    { label: "近 30 天", range: { from: subDays(today, 29), to: today } },
    { label: "近 90 天", range: { from: subDays(today, 89), to: today } },
  ]
}

export interface DateRangePickerProps {
  value?: DateRange
  onValueChange?: (value: DateRange | undefined) => void
  presets?: DateRangePreset[]
  className?: string
}

function DateRangePicker({
  value,
  onValueChange,
  presets,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState<DateRange | undefined>()
  const selected = value ?? uncontrolled
  const options = presets ?? defaultPresets()

  const setSelected = (next: DateRange | undefined) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const label =
    selected?.from && selected.to
      ? `${format(selected.from, "yyyy-MM-dd")} – ${format(selected.to, "yyyy-MM-dd")}`
      : selected?.from
        ? format(selected.from, "yyyy-MM-dd")
        : "选择日期范围"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-start gap-2", className)}>
          <CalendarIcon className="size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col gap-2 p-2 sm:flex-row">
          <div className="flex flex-col gap-1 border-b pb-2 sm:border-r sm:border-b-0 sm:pr-2 sm:pb-0">
            {options.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => setSelected(preset.range)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={selected}
            onSelect={setSelected}
            numberOfMonths={1}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker, defaultPresets }
