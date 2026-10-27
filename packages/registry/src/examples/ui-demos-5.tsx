"use client"

import { useState } from "react"
import { CurrencyInput } from "../ui/currency-input"
import { InfiniteScroll } from "../ui/infinite-scroll"
import { PasswordStrength } from "../ui/password-strength"

export function InfiniteScrollDemo() {
  const [count, setCount] = useState(8)
  return (
    <InfiniteScroll className="h-48 w-64 overflow-auto" hasMore={count < 24} onLoadMore={() => setCount((value) => value + 4)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-md border px-3 py-2 text-sm">
          条目 {index + 1}
        </div>
      ))}
    </InfiniteScroll>
  )
}

export function PasswordStrengthDemo() {
  return <PasswordStrength />
}

export function CurrencyInputDemo() {
  const [value, setValue] = useState(1280)
  return <CurrencyInput value={value} onValueChange={setValue} />
}
