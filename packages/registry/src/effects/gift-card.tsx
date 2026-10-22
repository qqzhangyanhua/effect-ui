"use client"

// Ported from Sera UI (MIT, (c) 2025 Sera UI) — https://github.com/seraui/seraui/blob/main/src/app/docs/amazongift/amazongift.tsx

import { useId, useState } from "react"

import { cn } from "@/lib/utils"

export interface GiftCardProps {
  title?: string
  amount?: string
  detail?: string
  note?: string
  placeholder?: string
  actionLabel?: string
  emptyLabel?: string
  claimedLabel?: string
  className?: string
  onClaim?: (code: string) => void
}

export function GiftCard({
  title = "Gift card",
  amount = "$100",
  detail = "Enter the code, then claim it.",
  note = "Use the code within 30 days.",
  placeholder = "GIFT-2048-ALPHA",
  actionLabel = "Claim",
  emptyLabel = "Enter a code first.",
  claimedLabel = "Code claimed.",
  className,
  onClaim,
}: GiftCardProps) {
  const patternId = `gift-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [code, setCode] = useState("")
  const [status, setStatus] = useState("")

  function claim() {
    const next = code.trim()
    if (!next) {
      setStatus(emptyLabel)
      return
    }
    setStatus(claimedLabel)
    onClaim?.(next)
  }

  return (
    <div className={cn("w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-lg", className)}>
      <div className="mx-auto mb-4 h-3 w-16 rounded-b-full bg-muted" />
      <h2 className="text-center text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">{detail}</p>
      <div className="mt-6 rounded-lg border border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-lg font-semibold">{amount}</span>
        </div>
        <div className="relative overflow-hidden rounded-md bg-muted/60">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={placeholder}
            aria-label={title}
            className="w-full bg-transparent px-3 py-3 font-mono text-lg tracking-widest text-foreground outline-none placeholder:text-muted-foreground"
          />
          <svg aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/5">
            <defs>
              <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="12" fill="var(--foreground)" fillOpacity="0.04" />
                <rect x="6" width="6" height="12" fill="var(--foreground)" fillOpacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </svg>
        </div>
      </div>
      <button
        type="button"
        onClick={claim}
        className="mt-6 h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
      >
        {actionLabel}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">{note}</p>
      <p role="status" className="mt-2 min-h-5 text-center text-sm">
        {status}
      </p>
    </div>
  )
}
