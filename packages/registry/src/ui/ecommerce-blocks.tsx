"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export interface Product {
  id: string
  name: string
  price: string
  image: string
}

export interface ProductCardProps {
  product: Product
  onAdd?: (product: Product) => void
  className?: string
}

function ProductCard({ product, onAdd, className }: ProductCardProps) {
  return (
    <article className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="aspect-[4/5] bg-muted bg-cover" style={{ backgroundImage: `url(${product.image})` }} />
      <div className="space-y-2 p-3">
        <h3 className="text-sm font-medium">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.price}</p>
        <Button size="sm" className="w-full" onClick={() => onAdd?.(product)}>
          加入购物车
        </Button>
      </div>
    </article>
  )
}

export interface ProductGalleryProps {
  images: string[]
  className?: string
}

function ProductGallery({ images, className }: ProductGalleryProps) {
  const [active, setActive] = React.useState(0)
  return (
    <div className={cn("grid gap-3 md:grid-cols-[72px_1fr]", className)}>
      <div className="flex gap-2 md:flex-col">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            className={cn("size-16 overflow-hidden rounded-md border", active === index && "ring-2 ring-ring")}
          >
            <span className="block size-full bg-muted bg-cover" style={{ backgroundImage: `url(${src})` }} />
          </button>
        ))}
      </div>
      <div className="aspect-square overflow-hidden rounded-xl border bg-muted bg-cover" style={{ backgroundImage: `url(${images[active]})` }} />
    </div>
  )
}

export interface CartItem extends Product {
  qty: number
}

export interface CartDrawerProps {
  items?: CartItem[]
  className?: string
}

function CartDrawer({ items, className }: CartDrawerProps) {
  const [open, setOpen] = React.useState(false)
  const list = items ?? [
    { id: "1", name: "Holo Tee", price: "$48", image: "", qty: 1 },
    { id: "2", name: "Foil Cap", price: "$24", image: "", qty: 2 },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          购物车 ({list.reduce((sum, item) => sum + item.qty, 0)})
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>购物车</SheetTitle>
        </SheetHeader>
        <ul className="space-y-3 p-4">
          {list.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
              <span>
                {item.name} × {item.qty}
              </span>
              <span className="text-muted-foreground">{item.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto p-4">
          <Button className="w-full">去结账</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export interface CheckoutStepsProps {
  step?: number
  className?: string
}

const steps = ["地址", "配送", "支付", "完成"]

function CheckoutSteps({ step = 1, className }: CheckoutStepsProps) {
  return (
    <ol className={cn("grid gap-2 md:grid-cols-4", className)}>
      {steps.map((label, index) => {
        const current = index === step
        const done = index < step
        return (
          <li
            key={label}
            className={cn(
              "rounded-xl border px-3 py-3 text-sm",
              current && "border-primary bg-primary/5",
              done && "text-muted-foreground",
            )}
          >
            <p className="text-xs text-muted-foreground">步骤 {index + 1}</p>
            <p className="font-medium">{label}</p>
          </li>
        )
      })}
    </ol>
  )
}

export type EcommerceView = "store" | "gallery" | "checkout"

export interface EcommerceBlocksProps {
  view?: EcommerceView
  className?: string
}

const demoProducts: Product[] = [
  { id: "1", name: "Holo Tee", price: "$48", image: "https://picsum.photos/id/1011/400/500" },
  { id: "2", name: "Foil Cap", price: "$24", image: "https://picsum.photos/id/1015/400/500" },
  { id: "3", name: "Aura Bag", price: "$86", image: "https://picsum.photos/id/1025/400/500" },
]

function EcommerceBlocks({ view = "store", className }: EcommerceBlocksProps) {
  if (view === "gallery") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <ProductGallery images={demoProducts.map((item) => item.image)} />
        <CartDrawer />
      </div>
    )
  }
  if (view === "checkout") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <CheckoutSteps step={1} />
        <CartDrawer />
      </div>
    )
  }
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="grid grid-cols-3 gap-3">
        {demoProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <CartDrawer />
    </div>
  )
}

export { ProductCard, ProductGallery, CartDrawer, CheckoutSteps, EcommerceBlocks }
