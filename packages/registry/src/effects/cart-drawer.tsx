"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, Trash2 } from "lucide-react"

import { QuantityStepper } from "@/components/ui/quantity-stepper"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CartProduct {
  id: string
  name: string
  price: number
}

export interface CartLine extends CartProduct {
  quantity: number
}

export interface CartDrawerProps {
  catalog?: CartProduct[]
  freeShippingAt?: number
  currency?: string
  locale?: string
  className?: string
}

const DEFAULT_CATALOG: CartProduct[] = [
  { id: "lamp", name: "北窗灯", price: 80 },
  { id: "cup", name: "灰杯子", price: 36 },
  { id: "print", name: "样张", price: 24 },
]

function CartDrawer({ catalog = DEFAULT_CATALOG, freeShippingAt = 100, currency = "CNY", locale = "zh-CN", className }: CartDrawerProps) {
  const reduced = usePrefersReducedMotion()
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [open, setOpen] = React.useState(false)
  const money = new Intl.NumberFormat(locale, { style: "currency", currency })
  const count = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)
  const remaining = Math.max(0, freeShippingAt - subtotal)
  const progress = Math.min(1, subtotal / Math.max(freeShippingAt, 1))

  const add = (product: CartProduct) => {
    setLines((current) => {
      const existing = current.find((line) => line.id === product.id)
      if (!existing) return [...current, { ...product, quantity: 1 }]
      return current.map((line) => (line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line))
    })
  }

  return (
    <div data-slot="cart-drawer" className={cn("w-full space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <ul className="grid gap-2">
          {catalog.map((product) => (
            <li key={product.id} className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2">
              <span>{product.name}<span className="ml-2 text-sm text-muted-foreground">{money.format(product.price)}</span></span>
              <button type="button" className="rounded-md border px-2 py-1 text-sm" onClick={() => add(product)}>加入购物车</button>
            </li>
          ))}
        </ul>
        <motion.button
          type="button"
          aria-label={`购物车 ${count} 件`}
          className="relative rounded-full border p-3"
          onClick={() => setOpen(true)}
        >
          <motion.span key={reduced ? "still" : count} animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 0.35 }} className="block">
            <ShoppingBag className="size-5" />
          </motion.span>
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{count}</span>
        </motion.button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>购物车</SheetTitle>
            <SheetDescription>改数量或移除，小计会跟着变。</SheetDescription>
          </SheetHeader>
          <ul className="flex-1 space-y-3 overflow-auto px-4">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.li
                  key={line.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p>{line.name}</p>
                      <p className="text-sm text-muted-foreground">{money.format(line.price * line.quantity)}</p>
                    </div>
                    <QuantityStepper
                      value={line.quantity}
                      min={1}
                      onValueChange={(quantity) => setLines((current) => current.map((item) => (item.id === line.id ? { ...item, quantity } : item)))}
                    />
                    <button type="button" aria-label={`移除 ${line.name}`} className="rounded-md border p-2" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
            {lines.length === 0 ? <li className="text-sm text-muted-foreground">还没有商品。</li> : null}
          </ul>
          <div className="space-y-3 border-t p-4">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{remaining === 0 ? "已免运费" : `再买 ${money.format(remaining)} 免运费`}</span>
                <span>{money.format(subtotal)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <p className="text-sm">小计 {money.format(subtotal)}</p>
            <button type="button" className="h-10 w-full rounded-md bg-primary text-sm text-primary-foreground">去结算</button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export { CartDrawer }
