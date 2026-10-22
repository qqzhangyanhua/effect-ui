"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/commerce/cart-item-transition.tsx

import { useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CartLineItem {
  id: string
  productName: string
  variantSummary?: string
  unitPrice: number
  quantity: number
  total: number
  previousPrice?: number
  availability?: "available" | "limited" | "unavailable"
  inventoryMessage?: string
}

export interface CartItemTransitionProps {
  item: CartLineItem
  minQuantity?: number
  maxQuantity?: number
  confirmRemove?: boolean
  onQuantityChange?: (quantity: number, item: CartLineItem) => void
  onRemove?: (item: CartLineItem) => void
  onUndoRemove?: (item: CartLineItem) => void
  className?: string
}

function money(amount: number) {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  const whole = Math.trunc(abs)
  const cents = Math.round((abs - whole) * 100)
  return `${sign}$${whole}.${String(cents).padStart(2, "0")}`
}

export function CartItemTransition({
  item,
  minQuantity = 1,
  maxQuantity,
  confirmRemove = true,
  onQuantityChange,
  onRemove,
  onUndoRemove,
  className,
}: CartItemTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const [quantity, setQuantity] = useState(item.quantity)
  const [removed, setRemoved] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const unavailable = item.availability === "unavailable"
  const unit = item.unitPrice
  const lineTotal = unit * quantity

  const step = (next: number) => {
    const capped = maxQuantity === undefined ? next : Math.min(maxQuantity, next)
    const bounded = Math.max(minQuantity, capped)
    setQuantity(bounded)
    onQuantityChange?.(bounded, item)
  }

  if (removed) {
    return (
      <div className={cn("flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)} data-motion={reduced ? "off" : "on"}>
        <p className="text-sm">{item.productName} removed</p>
        <button
          type="button"
          className="min-h-11 rounded-md border border-border px-3 text-sm"
          onClick={() => {
            setRemoved(false)
            onUndoRemove?.(item)
          }}
        >
          Undo
        </button>
      </div>
    )
  }

  return (
    <article className={cn("rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)} data-motion={reduced ? "off" : "on"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{item.productName}</h2>
          {item.variantSummary ? <p className="text-xs text-muted-foreground">{item.variantSummary}</p> : null}
          {item.inventoryMessage ? <p className="text-xs text-muted-foreground">{item.inventoryMessage}</p> : null}
          {typeof item.previousPrice === "number" && item.previousPrice !== item.unitPrice ? (
            <p className="text-xs text-muted-foreground">
              Price changed from {money(item.previousPrice)} to {money(item.unitPrice)}
            </p>
          ) : null}
        </div>
        <p className="font-mono text-sm">{money(lineTotal)}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center rounded-md border border-border">
          <button type="button" className="min-h-11 min-w-11" aria-label={`Decrease ${item.productName}`} disabled={unavailable || quantity <= minQuantity} onClick={() => step(quantity - 1)}>
            −
          </button>
          <span className="min-w-8 text-center font-mono text-sm" aria-live="polite">
            {quantity}
          </span>
          <button type="button" className="min-h-11 min-w-11" aria-label={`Increase ${item.productName}`} disabled={unavailable || (maxQuantity !== undefined && quantity >= maxQuantity)} onClick={() => step(quantity + 1)}>
            +
          </button>
        </div>
        {confirming ? (
          <button
            type="button"
            className="min-h-11 rounded-md bg-destructive px-3 text-sm text-primary-foreground"
            onClick={() => {
              setConfirming(false)
              setRemoved(true)
              onRemove?.(item)
            }}
          >
            Confirm remove
          </button>
        ) : (
          <button
            type="button"
            className="min-h-11 rounded-md border border-border px-3 text-sm"
            onClick={() => {
              if (confirmRemove) {
                setConfirming(true)
                return
              }
              setRemoved(true)
              onRemove?.(item)
            }}
          >
            Remove
          </button>
        )}
      </div>
    </article>
  )
}
