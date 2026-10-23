"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/client-card.tsx

import { useId, useState } from "react"
import { ArrowLeft, MapPin } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

function face(label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" fill="hsl(${hue} 40% 48%)"/><circle cx="64" cy="50" r="22" fill="white" fill-opacity="0.9"/><text x="64" y="108" text-anchor="middle" fill="white" font-size="16" font-family="sans-serif">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const profiles = ["A", "B", "C", "D", "E", "F", "G", "H"].map((label, index) => face(label, 180 + index * 18))

export interface ClientCardProps {
  name?: string
  country?: string
  image?: string
  service?: string
  amountPaid?: number
  totalAmount?: number
  plan?: "Starter" | "Professional" | "Enterprise"
  deadline?: Date
  startDate?: Date
  className?: string
}

function Ring({ value, id, color }: { value: number; id: string; color: string }) {
  const size = 34
  const stroke = 3
  const radius = (size - stroke) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-[var(--muted-foreground)]" strokeWidth={stroke} />
      <circle
        id={id}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClientCard({
  name = "Sarah Jenkins",
  country = "United Kingdom",
  image = face("SJ", 330),
  service = "Social Media Management & Content Strategy",
  amountPaid = 4500,
  totalAmount = 6000,
  plan = "Professional",
  deadline = new Date("2024-06-01"),
  startDate = new Date("2024-01-01"),
  className,
}: ClientCardProps) {
  const reduced = usePrefersReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const paid = Math.min((amountPaid / Math.max(totalAmount, 1)) * 100, 100)
  const clock = Date.UTC(2026, 9, 22)
  const totalTime = deadline.getTime() - startDate.getTime()
  const elapsed = clock - startDate.getTime()
  const time = totalTime <= 0 ? 100 : Math.min(Math.max((elapsed / totalTime) * 100, 0), 100)
  const days = Math.ceil((deadline.getTime() - clock) / 86400000)
  const timeLeft = days < 0 ? "Overdue" : days === 0 ? "Today" : days < 30 ? `${days}d left` : days < 365 ? `${Math.floor(days / 30)}mo left` : `${(days / 365).toFixed(1)}y left`
  const prefix = useId().replace(/:/g, "")
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 350, damping: 35 }

  return (
    <div data-plan={plan} data-expanded={expanded ? "true" : "false"} className={cn("relative grid grid-cols-[4rem_20rem] items-stretch gap-2.5", className)}>
      <div className="relative w-16">
        {expanded ? (
          <div className="invisible flex flex-col gap-1.5 p-1" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-square w-14" />
            ))}
          </div>
        ) : (
          <motion.div layoutId="client-stack" transition={spring} className="flex flex-col gap-1.5 bg-[var(--card)] p-1 shadow-sm" style={{ borderRadius: 14 }}>
            {profiles.slice(0, 3).map((src, index) => (
              <motion.img key={src} layoutId={`client-${index}`} src={src} alt="" transition={spring} className="aspect-square w-14 rounded-xl object-cover" />
            ))}
            <button
              type="button"
              className="flex aspect-square w-full items-center justify-center rounded-xl bg-[var(--muted)] text-sm text-[var(--muted-foreground)]"
              onClick={() => setExpanded(true)}
            >
              +{profiles.length - 3}
            </button>
          </motion.div>
        )}
      </div>
      <AnimatePresence>
        {expanded ? (
          <motion.div
            key="expanded"
            layoutId="client-stack"
            transition={spring}
            className="absolute inset-0 z-30 flex flex-col gap-3 bg-[var(--card)] p-3"
            style={{ borderRadius: 14 }}
          >
            <button type="button" onClick={() => setExpanded(false)} className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
              <ArrowLeft className="size-3.5" />
              Go Back
            </button>
            <div className="flex flex-wrap gap-1.5">
              {profiles.map((src, index) => (
                <motion.img key={src} layoutId={`client-${index}`} src={src} alt="" transition={spring} className="size-[54px] rounded-xl object-cover" />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className={cn("flex h-full w-80 flex-col justify-between overflow-hidden rounded-2xl bg-[var(--card)] shadow-sm", expanded && "shadow-none")}>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-2.5">
            <img src={image} alt={name} className="size-10 rounded-full object-cover" />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{name}</h3>
              <p className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
                <MapPin className="size-3" />
                {country}
              </p>
            </div>
          </div>
          <p className="line-clamp-4 text-sm text-[var(--muted-foreground)]">{service}</p>
        </div>
        <div className="mt-2 flex items-center gap-4 bg-[var(--muted)]/50 p-4">
          <div className="flex flex-1 items-center gap-3">
            <Ring id={`paid-${prefix}`} value={paid} color="var(--primary)" />
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">Amount Paid</div>
              <div className="text-sm">{Math.round(paid)}%</div>
            </div>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="flex flex-1 items-center gap-3">
            <Ring id={`due-${prefix}`} value={time} color="var(--accent)" />
            <div>
              <div className="text-xs text-[var(--muted-foreground)]">Deadline</div>
              <div className="text-sm">{timeLeft}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientCard
