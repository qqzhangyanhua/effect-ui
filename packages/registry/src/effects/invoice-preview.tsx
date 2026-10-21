"use client"

import { cn } from "@/lib/utils"

export interface InvoiceLine {
  description: string
  quantity: number
  price: number
}

export interface InvoicePreviewProps {
  title?: string
  number?: string
  from?: string
  to?: string
  lines?: InvoiceLine[]
  taxRate?: number
  currency?: string
  locale?: string
  className?: string
}

const DEFAULT_LINES: InvoiceLine[] = [
  { description: "界面组件授权", quantity: 1, price: 1280 },
  { description: "落地页搭建", quantity: 2, price: 860 },
]

function cellsFor(seed: string) {
  let hash = 2166136261
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return Array.from({ length: 21 * 21 }, (_, index) => {
    const row = Math.floor(index / 21)
    const column = index % 21
    const finder =
      (row < 7 && column < 7) || (row < 7 && column > 13) || (row > 13 && column < 7)
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177)
    return finder || (hash >>> 0) % 3 === 0
  })
}

function InvoicePreview({
  title = "发票",
  number = "INV-2026-014",
  from = "效果界面工作室",
  to = "北窗设计",
  lines = DEFAULT_LINES,
  taxRate = 0.06,
  currency = "CNY",
  locale = "zh-CN",
  className,
}: InvoicePreviewProps) {
  const money = new Intl.NumberFormat(locale, { style: "currency", currency })
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.price, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax
  const cells = cellsFor(number)

  return (
    <article data-slot="invoice-preview" className={cn("w-full max-w-xl rounded-xl border bg-white p-6 text-slate-900 print:border-0 print:shadow-none", className)}>
      <style>{`@media print { [data-slot="invoice-preview"] { width: 100%; max-width: none; } }`}</style>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{number}</p>
        </div>
        <div className="grid w-20 grid-cols-[repeat(21,minmax(0,1fr))] gap-px bg-slate-900 p-1" aria-hidden>
          {cells.map((on, index) => (
            <span key={index} className={cn("size-1", on ? "bg-slate-900" : "bg-white")} />
          ))}
        </div>
      </header>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <p>
          <span className="block text-slate-500">开具方</span>
          {from}
        </p>
        <p>
          <span className="block text-slate-500">接收方</span>
          {to}
        </p>
      </div>
      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b text-left text-slate-500">
            <th className="py-2 font-medium">项目</th>
            <th className="py-2 font-medium">数量</th>
            <th className="py-2 text-right font-medium">金额</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.description} className="border-b">
              <td className="py-2">{line.description}</td>
              <td className="py-2">{line.quantity}</td>
              <td className="py-2 text-right">{money.format(line.quantity * line.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>小计</dt>
          <dd>{money.format(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>税费 {Math.round(taxRate * 100)}%</dt>
          <dd>{money.format(tax)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>合计</dt>
          <dd>{money.format(total)}</dd>
        </div>
      </dl>
    </article>
  )
}

export { InvoicePreview }
