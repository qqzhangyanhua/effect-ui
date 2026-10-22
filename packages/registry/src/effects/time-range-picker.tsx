"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/forms/timepicker.md. Modified for effect-ui.

import { useId, useRef, type HTMLAttributes } from "react"
import { Clock } from "lucide-react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TimeRangeValue {
  start: string
  end: string
  allDay: boolean
}

export interface TimeRangePickerProps extends HTMLAttributes<HTMLDivElement> {
  value: TimeRangeValue
  onValueChange?: (value: TimeRangeValue) => void
  step?: number
  min?: string
  max?: string
  presets?: readonly { label: string; start: string; end: string }[]
}

function toMinutes(value: string) {
  const [hour, minute] = value.split(":")
  const h = Number(hour)
  const m = Number(minute)
  if (!hour || minute === undefined || Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

export function TimeRangePicker({ value, onValueChange, step, min, max, presets, className, ...props }: TimeRangePickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const startId = useId()
  const endId = useId()
  const allDayId = useId()
  const hintId = useId()
  const startMinutes = toMinutes(value.start)
  const endMinutes = toMinutes(value.end)
  const invalid = !value.allDay && startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes

  function update(next: Partial<TimeRangeValue>) {
    onValueChange?.({ ...value, ...next })
  }

  const field = "block w-full rounded-md border border-border bg-muted p-2.5 pe-9 text-sm text-foreground"

  return (
    <div
      {...props}
      ref={ref}
      className={cn("w-full max-w-xs", reduced ? "transition-none" : "transition-colors", className)}
      data-invalid={invalid ? "true" : "false"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="time-range-picker"
    >
      <label className="mb-3 inline-flex items-center gap-2 text-sm font-medium" htmlFor={allDayId}>
        <input
          checked={value.allDay}
          id={allDayId}
          onChange={(event) => update({ allDay: event.target.checked })}
          type="checkbox"
        />
        全天
      </label>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor={startId}>
            开始时间
          </label>
          <div className="relative">
            <Clock aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className={field}
              disabled={value.allDay}
              id={startId}
              max={max}
              min={min}
              onChange={(event) => update({ start: event.target.value })}
              step={step}
              type="time"
              value={value.start}
            />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor={endId}>
            结束时间
          </label>
          <div className="relative">
            <Clock aria-hidden="true" className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-describedby={invalid ? hintId : undefined}
              aria-invalid={invalid}
              className={field}
              disabled={value.allDay}
              id={endId}
              max={max}
              min={min}
              onChange={(event) => update({ end: event.target.value })}
              step={step}
              type="time"
              value={value.end}
            />
          </div>
        </div>
      </div>
      {invalid ? (
        <p className="mt-2 text-sm text-destructive" id={hintId} role="alert">
          结束时间需要晚于开始时间
        </p>
      ) : null}
      {presets && presets.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm hover:bg-accent"
              onClick={() => update({ start: preset.start, end: preset.end, allDay: false })}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
