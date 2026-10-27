"use client"

import * as React from "react"

import { cn } from "@/lib/cn"

export interface PasswordStrengthProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

function scorePassword(value: string) {
  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return score
}

const labels = ["很弱", "弱", "一般", "强", "很强"]

function PasswordStrength({ value: controlled, onValueChange, className }: PasswordStrengthProps) {
  const [uncontrolled, setUncontrolled] = React.useState("")
  const value = controlled ?? uncontrolled
  const score = scorePassword(value)

  return (
    <div className={cn("w-full max-w-sm space-y-2", className)}>
      <input
        className="h-9 w-full rounded-md border bg-transparent px-3"
        type="password"
        value={value}
        placeholder="设置密码"
        onChange={(event) => {
          if (controlled === undefined) setUncontrolled(event.target.value)
          onValueChange?.(event.target.value)
        }}
      />
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full bg-muted",
              score > index && (score >= 3 ? "bg-emerald-500" : score === 2 ? "bg-amber-400" : "bg-destructive"),
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{value ? labels[score] : "至少 8 位，含大小写、数字和符号"}</p>
    </div>
  )
}

export { PasswordStrength, scorePassword }
