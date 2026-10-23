"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/commerce/product-variant-selector.tsx

import { useMemo, useState } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type InventoryState = "in_stock" | "low_stock" | "backordered" | "preorder" | "out_of_stock" | "discontinued"

export interface VariantValue {
  value: string
  label: string
  swatch?: string
  priceAdjustment?: number
  inventoryState?: InventoryState
  disabledReason?: string
}

export interface OptionGroup {
  id: string
  label: string
  values: VariantValue[]
}

export type VariantSelection = Record<string, string>

export interface ProductVariantSelectorProps {
  groups: OptionGroup[]
  basePrice: number
  productName?: string
  value?: VariantSelection
  defaultValue?: VariantSelection
  onValueChange?: (selection: VariantSelection) => void
  className?: string
}

const STOCK: Record<InventoryState, { label: string; selectable: boolean }> = {
  in_stock: { label: "In stock", selectable: true },
  low_stock: { label: "Low stock", selectable: true },
  backordered: { label: "Backordered", selectable: true },
  preorder: { label: "Pre-order", selectable: true },
  out_of_stock: { label: "Out of stock", selectable: false },
  discontinued: { label: "Discontinued", selectable: false },
}

function money(amount: number) {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  const whole = Math.trunc(abs)
  const cents = Math.round((abs - whole) * 100)
  return `${sign}$${whole}.${String(cents).padStart(2, "0")}`
}

function initialSelection(groups: OptionGroup[], seed?: VariantSelection) {
  const next: VariantSelection = { ...seed }
  for (const group of groups) {
    if (next[group.id]) continue
    const first = group.values.find((value) => value.inventoryState === undefined || STOCK[value.inventoryState].selectable)
    if (first) next[group.id] = first.value
  }
  return next
}

export function ProductVariantSelector({
  groups,
  basePrice,
  productName = "Product",
  value,
  defaultValue,
  onValueChange,
  className,
}: ProductVariantSelectorProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = useState(() => initialSelection(groups, defaultValue))
  const selection = value ?? uncontrolled
  const total = useMemo(() => {
    return groups.reduce((sum, group) => {
      const chosen = group.values.find((item) => item.value === selection[group.id])
      return sum + (chosen?.priceAdjustment ?? 0)
    }, basePrice)
  }, [basePrice, groups, selection])

  const choose = (groupId: string, option: VariantValue) => {
    const stock = option.inventoryState ? STOCK[option.inventoryState] : undefined
    if (stock && !stock.selectable) return
    const next = { ...selection, [groupId]: option.value }
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <form className={cn("w-full space-y-4 rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)} data-motion={reduced ? "off" : "on"} aria-label={productName}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">{productName}</h2>
        <p className="font-mono text-lg">{money(total)}</p>
      </div>
      {groups.map((group) => (
        <fieldset key={group.id} className="space-y-2">
          <legend className="text-sm">{group.label}</legend>
          <div className="flex flex-wrap gap-2">
            {group.values.map((option) => {
              const stock = option.inventoryState ? STOCK[option.inventoryState] : undefined
              const disabled = Boolean(stock && !stock.selectable)
              const checked = selection[group.id] === option.value
              return (
                <label key={option.value} className={cn("inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm", checked ? "border-primary" : "border-border", disabled && "opacity-50")}>
                  <input type="radio" name={group.id} value={option.value} checked={checked} disabled={disabled} onChange={() => choose(group.id, option)} />
                  {option.swatch ? <span aria-hidden className="h-4 w-4 rounded-full border border-border" style={{ background: option.swatch }} /> : null}
                  <span>{option.label}</span>
                  {stock ? <span className="text-xs text-muted-foreground">{stock.label}</span> : null}
                  {option.disabledReason && disabled ? <span className="sr-only">{option.disabledReason}</span> : null}
                </label>
              )
            })}
          </div>
        </fieldset>
      ))}
    </form>
  )
}
