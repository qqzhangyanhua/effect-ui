"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/transfer-funds-card/transfer-funds-card.tsx. Modified for effect-ui.

import { ChevronsUpDown, X } from "lucide-react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TransferSummaryRow {
  label: string
  value: string
  emphasized?: boolean
}

export interface TransferFundsCardProps {
  title?: string
  description?: string
  amountLabel?: string
  currencySymbol?: string
  amount?: string
  fromLabel?: string
  fromAccount?: string
  toLabel?: string
  toAccount?: string
  summary?: readonly TransferSummaryRow[]
  buttonLabel?: string
  onConfirm?: () => void
  onClose?: () => void
  className?: string
}

function SelectField({ value, reduced }: { value: string; reduced: boolean }) {
  return (
    <div className="mt-3 flex h-9 items-center justify-between rounded-full bg-muted px-3">
      <span className="truncate text-sm">{value}</span>
      <motion.span className="flex shrink-0 text-muted-foreground" whileHover={reduced ? undefined : { y: [0, -2, 2, 0] }}>
        <ChevronsUpDown className="size-4" />
      </motion.span>
    </div>
  )
}

export function TransferFundsCard({
  title = "转账",
  description = "",
  amountLabel = "金额",
  currencySymbol = "¥",
  amount = "",
  fromLabel = "转出",
  fromAccount = "",
  toLabel = "转入",
  toAccount = "",
  summary = [],
  buttonLabel = "确认转账",
  onConfirm,
  onClose,
  className,
}: TransferFundsCardProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div className={cn("relative w-full rounded-3xl border bg-card p-6 text-card-foreground shadow-sm", className)} data-reduced={reduced ? "true" : "false"} data-slot="transfer-funds-card">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-medium">{title}</h3>
        <button aria-label="关闭" className="flex size-[30px] items-center justify-center rounded-full bg-muted" type="button" onClick={onClose}>
          <motion.span className="flex" transition={{ duration: reduced ? 0 : 0.4 }} whileHover={reduced ? undefined : { rotate: 90 }}>
            <X className="size-4" />
          </motion.span>
        </button>
      </div>
      {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6">
        <label className="text-sm font-medium">{amountLabel}</label>
        <div className="mt-3 flex h-9 items-center gap-1.5 rounded-full bg-muted px-3">
          <span className="text-sm text-muted-foreground">{currencySymbol}</span>
          <span className="text-sm">{amount}</span>
        </div>
      </div>
      <div className="mt-7">
        <label className="text-sm font-medium">{fromLabel}</label>
        <SelectField reduced={reduced} value={fromAccount} />
      </div>
      <div className="mt-7">
        <label className="text-sm font-medium">{toLabel}</label>
        <SelectField reduced={reduced} value={toAccount} />
      </div>
      {summary.length > 0 ? (
        <div className="mt-7 rounded-2xl bg-muted/60 px-4">
          {summary.map((row, index) => (
            <div key={row.label} className={cn("flex h-[46px] items-center justify-between", index > 0 && "border-t")}>
              <span className={cn("text-sm", row.emphasized ? "font-medium" : "text-muted-foreground")}>{row.label}</span>
              <span className={cn("text-sm", row.emphasized ? "font-semibold" : "font-medium")}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      <motion.button
        className="mt-6 flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        transition={{ duration: reduced ? 0 : 0.35 }}
        type="button"
        whileHover={reduced ? undefined : { scale: 1.015 }}
        whileTap={reduced ? undefined : { scale: 0.97 }}
        onClick={onConfirm}
      >
        {buttonLabel}
      </motion.button>
    </div>
  )
}
