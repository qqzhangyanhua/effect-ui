"use client"

import * as React from "react"
import { useMotionValueEvent, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ClockCity {
  city: string
  timeZone: string
}

export interface TimezoneClockProps {
  cities?: ClockCity[]
  now?: number
  className?: string
}

const DEFAULTS: ClockCity[] = [
  { city: "上海", timeZone: "Asia/Shanghai" },
  { city: "东京", timeZone: "Asia/Tokyo" },
  { city: "伦敦", timeZone: "Europe/London" },
  { city: "纽约", timeZone: "America/New_York" },
]

const FROZEN = Date.parse("2026-10-20T02:00:00Z")

function zoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0")
  return { hour: read("hour"), minute: read("minute"), second: read("second") }
}

function offsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0")
  const asUtc = Date.UTC(read("year"), read("month") - 1, read("day"), read("hour"), read("minute"), read("second"))
  return Math.round((asUtc - date.getTime()) / 60000)
}

function SecondHand({ angle, reduced }: { angle: number; reduced: boolean }) {
  const spring = useSpring(angle, { stiffness: 180, damping: 18 })
  const [shown, setShown] = React.useState(angle)
  React.useEffect(() => {
    if (reduced) return
    if (Math.abs(angle - spring.get()) > 180) spring.jump(angle)
    else spring.set(angle)
  }, [angle, reduced, spring])
  useMotionValueEvent(spring, "change", setShown)
  const value = reduced ? angle : shown
  const radians = (value * Math.PI) / 180
  return <line x1="50" y1="50" x2={50 + Math.sin(radians) * 34} y2={50 - Math.cos(radians) * 34} stroke="#fb7185" strokeWidth="1" />
}

function TimezoneClock({ cities = DEFAULTS, now, className }: TimezoneClockProps) {
  const reduced = usePrefersReducedMotion()
  const [live, setLive] = React.useState<number | null>(null)
  const ticking = now ?? live ?? FROZEN
  const [mode, setMode] = React.useState<"dial" | "digital">("dial")

  React.useEffect(() => {
    if (now !== undefined) return
    const kick = window.setTimeout(() => setLive(Date.now()), 0)
    const timer = window.setInterval(() => setLive(Date.now()), 1000)
    return () => {
      window.clearTimeout(kick)
      window.clearInterval(timer)
    }
  }, [now])

  const date = new Date(ticking)
  const base = cities[0] ? offsetMinutes(date, cities[0].timeZone) : 0

  return (
    <section data-slot="timezone-clock" className={cn("w-full space-y-3", className)}>
      <div className="flex gap-2">
        <button type="button" aria-pressed={mode === "dial"} className={cn("rounded-md border px-2 py-1 text-xs", mode === "dial" && "bg-primary text-primary-foreground")} onClick={() => setMode("dial")}>
          表盘
        </button>
        <button type="button" aria-pressed={mode === "digital"} className={cn("rounded-md border px-2 py-1 text-xs", mode === "digital" && "bg-primary text-primary-foreground")} onClick={() => setMode("digital")}>
          数字
        </button>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {cities.map((city) => {
          const parts = zoneParts(date, city.timeZone)
          const day = parts.hour >= 6 && parts.hour < 18
          const diff = offsetMinutes(date, city.timeZone) - base
          const hours = Math.trunc(diff / 60)
          const minutes = Math.abs(diff % 60)
          const relative = diff === 0 ? "与第一座城市同一时刻" : `${hours >= 0 ? "+" : ""}${hours} 小时${minutes ? ` ${minutes} 分` : ""}`
          const digital = new Intl.DateTimeFormat("zh-CN", { timeZone: city.timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(date)
          const hourAngle = ((parts.hour % 12) + parts.minute / 60) * 30
          const minuteAngle = parts.minute * 6
          const secondAngle = parts.second * 6
          return (
            <li key={city.timeZone} className="rounded-xl border p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{city.city}</h3>
                <span className="text-xs text-muted-foreground">{day ? "白天" : "夜晚"}</span>
              </div>
              {mode === "digital" ? (
                <p className="mt-3 font-mono text-2xl">{digital}</p>
              ) : (
                <svg viewBox="0 0 100 100" className="mx-auto mt-2 size-28" role="img" aria-label={`${city.city} ${digital}`}>
                  <circle cx="50" cy="50" r="46" fill={day ? "#fef3c7" : "#0f172a"} stroke="currentColor" />
                  <line x1="50" y1="50" x2={50 + Math.sin((hourAngle * Math.PI) / 180) * 22} y2={50 - Math.cos((hourAngle * Math.PI) / 180) * 22} stroke={day ? "#0f172a" : "#f8fafc"} strokeWidth="3" />
                  <line x1="50" y1="50" x2={50 + Math.sin((minuteAngle * Math.PI) / 180) * 32} y2={50 - Math.cos((minuteAngle * Math.PI) / 180) * 32} stroke={day ? "#0f172a" : "#f8fafc"} strokeWidth="2" />
                  <SecondHand angle={secondAngle} reduced={reduced} />
                </svg>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{relative}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export { TimezoneClock }
