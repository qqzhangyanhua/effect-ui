"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type CardBrand = "visa" | "mastercard" | "amex" | "unionpay" | "unknown"

export interface CreditCardValue {
  number: string
  expiry: string
  cvc: string
  name: string
  brand: CardBrand
  valid: boolean
}

export interface CreditCardFormProps {
  className?: string
  onChange?: (value: CreditCardValue) => void
}

function digitsOf(value: string) {
  return value.replace(/\D/g, "")
}

function detectBrand(digits: string): CardBrand {
  if (/^3[47]/.test(digits)) return "amex"
  if (/^4/.test(digits)) return "visa"
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard"
  if (/^62/.test(digits)) return "unionpay"
  return "unknown"
}

function formatNumber(raw: string, brand: CardBrand) {
  const digits = digitsOf(raw).slice(0, brand === "amex" ? 15 : 16)
  if (brand === "amex") return [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10)].filter(Boolean).join(" ")
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
}

function formatExpiry(raw: string) {
  const digits = digitsOf(raw).slice(0, 4)
  if (digits.length < 3) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export function luhnValid(raw: string) {
  const digits = digitsOf(raw)
  if (digits.length < 13) return false
  let sum = 0
  let alternate = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index])
    if (alternate) {
      value *= 2
      if (value > 9) value -= 9
    }
    sum += value
    alternate = !alternate
  }
  return sum % 10 === 0
}

function BrandMark({ brand }: { brand: CardBrand }) {
  if (brand === "visa") {
    return (
      <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden>
        <rect width="36" height="24" rx="4" fill="#1d4ed8" />
        <text x="6" y="16" fill="white" fontSize="10">VISA</text>
      </svg>
    )
  }
  if (brand === "mastercard") {
    return (
      <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden>
        <rect width="36" height="24" rx="4" fill="#0f172a" />
        <circle cx="15" cy="12" r="6" fill="#f97316" />
        <circle cx="21" cy="12" r="6" fill="#facc15" fillOpacity="0.9" />
      </svg>
    )
  }
  if (brand === "amex") {
    return (
      <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden>
        <rect width="36" height="24" rx="4" fill="#0369a1" />
        <text x="5" y="16" fill="white" fontSize="9">AMEX</text>
      </svg>
    )
  }
  if (brand === "unionpay") {
    return (
      <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden>
        <rect width="36" height="24" rx="4" fill="#b91c1c" />
        <text x="8" y="16" fill="white" fontSize="10">银联</text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden>
      <rect width="36" height="24" rx="4" fill="#334155" />
    </svg>
  )
}

function CreditCardForm({ className, onChange }: CreditCardFormProps) {
  const reduced = usePrefersReducedMotion()
  const [number, setNumber] = React.useState("")
  const [expiry, setExpiry] = React.useState("")
  const [cvc, setCvc] = React.useState("")
  const [name, setName] = React.useState("")
  const [flipped, setFlipped] = React.useState(false)
  const brand = detectBrand(digitsOf(number))
  const completeLength = brand === "amex" ? 15 : 16
  const entered = digitsOf(number).length
  const valid = luhnValid(number) && entered === completeLength
  const showCheck = entered >= completeLength

  const publish = (next: { number?: string; expiry?: string; cvc?: string; name?: string }) => {
    const value = { number, expiry, cvc, name, ...next }
    const nextBrand = detectBrand(digitsOf(value.number))
    const nextLength = digitsOf(value.number).length
    onChange?.({
      ...value,
      brand: nextBrand,
      valid: luhnValid(value.number) && nextLength === (nextBrand === "amex" ? 15 : 16),
    })
  }

  return (
    <div data-slot="credit-card-form" className={cn("grid w-full max-w-md gap-4", className)}>
      <div className="[perspective:1000px]">
        <motion.div
          className="relative h-44"
          animate={{ rotateY: flipped && !reduced ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 22 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-linear-to-br from-slate-800 to-slate-950 p-4 text-white [backface-visibility:hidden]">
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wide text-white/70">效果界面</span>
              <BrandMark brand={brand} />
            </div>
            <p className="font-mono text-lg tracking-widest">{number || "•••• •••• •••• ••••"}</p>
            <div className="flex justify-between text-xs">
              <span>{name || "持卡人"}</span>
              <span>{expiry || "MM/YY"}</span>
            </div>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-slate-900 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="mt-6 h-9 bg-slate-700" />
            <div className="mx-4 mt-4 flex items-center justify-end rounded bg-white px-3 py-1 text-right font-mono text-sm text-slate-900">
              {cvc || "•••"}
            </div>
          </div>
        </motion.div>
      </div>
      <label className="grid gap-1 text-sm">
        卡号
        <input
          inputMode="numeric"
          autoComplete="cc-number"
          aria-label="卡号"
          value={number}
          onChange={(event) => {
            const next = formatNumber(event.target.value, detectBrand(digitsOf(event.target.value)))
            setNumber(next)
            publish({ number: next })
          }}
          onFocus={() => setFlipped(false)}
          className="h-10 rounded-md border px-3 font-mono"
          placeholder="1234 5678 9012 3456"
        />
      </label>
      {showCheck ? <p className={cn("text-xs", valid ? "text-emerald-600" : "text-destructive")}>{valid ? "卡号有效" : "卡号无效"}</p> : null}
      <label className="grid gap-1 text-sm">
        持卡人
        <input aria-label="持卡人" value={name} onChange={(event) => { setName(event.target.value); publish({ name: event.target.value }) }} onFocus={() => setFlipped(false)} className="h-10 rounded-md border px-3" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-sm">
          有效期
          <input inputMode="numeric" autoComplete="cc-exp" aria-label="有效期" value={expiry} onChange={(event) => { const next = formatExpiry(event.target.value); setExpiry(next); publish({ expiry: next }) }} onFocus={() => setFlipped(false)} className="h-10 rounded-md border px-3 font-mono" placeholder="MM/YY" />
        </label>
        <label className="grid gap-1 text-sm">
          CVC
          <input
            inputMode="numeric"
            autoComplete="cc-csc"
            aria-label="CVC"
            value={cvc}
            onChange={(event) => {
              const next = digitsOf(event.target.value).slice(0, brand === "amex" ? 4 : 3)
              setCvc(next)
              publish({ cvc: next })
            }}
            onFocus={() => setFlipped(true)}
            onBlur={() => setFlipped(false)}
            className="h-10 rounded-md border px-3 font-mono"
          />
        </label>
      </div>
      {reduced && flipped ? <p className="text-xs text-muted-foreground">减弱动效时卡面不翻转，安全码仍可在表单里填写。</p> : null}
    </div>
  )
}

export { CreditCardForm }
