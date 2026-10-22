"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/relative-time/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useControllableState } from "@/hooks/use-controllable-state"
import { cn } from "@/lib/utils"

import { createContext, useContext, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react"

function formatDate(date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", options ?? { dateStyle: "long", timeZone }).format(date)
}

function formatTime(date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(
    "en-US",
    options ?? { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone },
  ).format(date)
}

interface RelativeTimeContextType {
  time: Date
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
}

const RelativeTimeContext = createContext<RelativeTimeContextType>({
  time: new Date(0),
})

export interface RelativeTimeProps {
  time?: Date
  defaultTime?: Date
  onTimeChange?: (time: Date) => void
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
  className?: string
  children?: ReactNode
}

export function RelativeTime({
  time: controlledTime,
  defaultTime,
  onTimeChange,
  dateFormatOptions,
  timeFormatOptions,
  className,
  children,
}: RelativeTimeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const motionOn = useAnimationActive(rootRef)
  const initialTime = defaultTime ?? controlledTime ?? new Date()
  const [time, setTime] = useControllableState<Date>({
    value: controlledTime,
    defaultValue: initialTime,
    onChange: onTimeChange,
  })

  useEffect(() => {
    if (controlledTime || !motionOn) return
    const interval = window.setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [controlledTime, motionOn, setTime])

  return (
    <RelativeTimeContext.Provider value={{ time, dateFormatOptions, timeFormatOptions }}>
      <div className={cn("grid gap-2", className)} data-slot="relative-time" ref={rootRef}>
        {children}
      </div>
    </RelativeTimeContext.Provider>
  )
}

interface RelativeTimeZoneContextType {
  zone: string
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
}

const RelativeTimeZoneContext = createContext<RelativeTimeZoneContextType>({ zone: "UTC" })

export interface RelativeTimeZoneProps {
  zone: string
  className?: string
  children?: ReactNode
  dateFormatOptions?: Intl.DateTimeFormatOptions
  timeFormatOptions?: Intl.DateTimeFormatOptions
}

export function RelativeTimeZone({ zone, className, children, dateFormatOptions, timeFormatOptions }: RelativeTimeZoneProps) {
  return (
    <RelativeTimeZoneContext.Provider value={{ zone, dateFormatOptions, timeFormatOptions }}>
      <div className={cn("flex items-center justify-between gap-1.5 text-xs", className)}>{children}</div>
    </RelativeTimeZoneContext.Provider>
  )
}

export function RelativeTimeZoneDisplay({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { time, timeFormatOptions } = useContext(RelativeTimeContext)
  const zoneContext = useContext(RelativeTimeZoneContext)
  return (
    <div className={cn("pl-8 text-muted-foreground tabular-nums", className)} suppressHydrationWarning {...props}>
      {formatTime(time, zoneContext.zone, zoneContext.timeFormatOptions ?? timeFormatOptions)}
    </div>
  )
}

export function RelativeTimeZoneDate({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { time, dateFormatOptions } = useContext(RelativeTimeContext)
  const zoneContext = useContext(RelativeTimeZoneContext)
  return (
    <div className={className} suppressHydrationWarning {...props}>
      {formatDate(time, zoneContext.zone, zoneContext.dateFormatOptions ?? dateFormatOptions)}
    </div>
  )
}

export function RelativeTimeZoneLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-secondary flex h-4 items-center justify-center rounded-xs px-1.5 font-mono", className)}
      {...props}
    />
  )
}
