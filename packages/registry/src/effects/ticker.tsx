"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/ticker/index.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

import { createContext, memo, useContext, useId, useMemo, type HTMLAttributes, type ReactNode } from "react"

const DEFAULT_CURRENCY = "USD"
const DEFAULT_LOCALE = "en-US"

const defaultFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: "currency",
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const TickerContext = createContext({ formatter: defaultFormatter })

export interface TickerProps {
  currency?: string
  locale?: string
  className?: string
  children?: ReactNode
}

export const Ticker = memo(function Ticker({
  children,
  className,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
}: TickerProps) {
  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency.toUpperCase(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    } catch {
      return defaultFormatter
    }
  }, [currency, locale])

  return (
    <TickerContext.Provider value={{ formatter }}>
      <button className={cn("inline-flex items-center gap-1.5 align-middle whitespace-nowrap", className)} data-slot="ticker" type="button">
        {children}
      </button>
    </TickerContext.Provider>
  )
})

export function TickerIcon({
  src,
  symbol,
  className,
  asChild,
  children,
}: HTMLAttributes<HTMLImageElement> & { src?: string; symbol?: string; asChild?: boolean }) {
  if (asChild) {
    return <div className={cn("bg-muted overflow-hidden rounded-full border", className)}>{children}</div>
  }
  return (
    <Avatar className={cn("bg-muted size-7 border", className)}>
      <AvatarImage alt={symbol} src={src} />
      <AvatarFallback className="text-muted-foreground text-sm font-semibold">{symbol?.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export interface TickerSymbolProps {
  symbol: string
  className?: string
}

export const TickerSymbol = memo(function TickerSymbol({ symbol, className }: TickerSymbolProps) {
  return <span className={cn("font-medium", className)}>{symbol.toUpperCase()}</span>
})

export interface TickerPriceProps {
  price: number
  className?: string
}

export const TickerPrice = memo(function TickerPrice({ price, className }: TickerPriceProps) {
  const context = useContext(TickerContext)
  const formattedPrice = useMemo(() => context.formatter.format(price), [context, price])
  return <span className={cn("text-muted-foreground", className)}>{formattedPrice}</span>
})

export interface TickerPriceChangeProps {
  change: number
  isPercent?: boolean
  className?: string
}

export const TickerPriceChange = memo(function TickerPriceChange({ change, isPercent, className }: TickerPriceChangeProps) {
  const titleId = useId()
  const isPositiveChange = change >= 0
  const context = useContext(TickerContext)
  const changeFormatted = useMemo(() => {
    if (isPercent) return `${change.toFixed(2)}%`
    return context.formatter.format(change)
  }, [change, context, isPercent])

  return (
    <span
      className={cn(
        "flex items-center gap-0.5",
        isPositiveChange ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500",
        className,
      )}
    >
      <svg
        aria-labelledby={titleId}
        className={isPositiveChange ? "" : "rotate-180"}
        fill="currentColor"
        height="12"
        role="img"
        viewBox="0 0 24 24"
        width="12"
      >
        <title id={titleId}>{isPositiveChange ? "Up icon" : "Down icon"}</title>
        <path d="M24 22h-24l12-20z" />
      </svg>
      {changeFormatted}
    </span>
  )
})
