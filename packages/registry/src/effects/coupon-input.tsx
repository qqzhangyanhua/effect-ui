"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type CouponResult = { ok: true; label: string } | { ok: false; message: string }

export interface CouponInputProps {
  validate: (code: string) => Promise<CouponResult>
  className?: string
}

function CouponInput({ validate, className }: CouponInputProps) {
  const reduced = usePrefersReducedMotion()
  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = React.useState("")
  const [label, setLabel] = React.useState("")
  const validateRef = React.useRef(validate)
  React.useEffect(() => {
    validateRef.current = validate
  }, [validate])

  const apply = async () => {
    const next = code.trim()
    if (!next || status === "loading") return
    setStatus("loading")
    setMessage("")
    try {
      const result = await validateRef.current(next)
      if (result.ok) {
        setStatus("success")
        setLabel(result.label)
        setMessage("")
      } else {
        setStatus("error")
        setMessage(result.message)
      }
    } catch {
      setStatus("error")
      setMessage("暂时无法核验这张券。")
    }
  }

  if (status === "success") {
    return (
      <div data-slot="coupon-input" className={cn("flex items-center gap-2", className)}>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-sm text-emerald-700">{label}</span>
        <button
          type="button"
          aria-label="移除优惠"
          className="text-sm text-muted-foreground"
          onClick={() => {
            setStatus("idle")
            setLabel("")
            setCode("")
          }}
        >
          移除
        </button>
      </div>
    )
  }

  return (
    <div data-slot="coupon-input" className={cn("grid gap-2", className)}>
      <motion.div animate={status === "error" && !reduced ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.35 }} className="flex gap-2">
        <input
          aria-label="优惠码"
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            if (status === "error") setStatus("idle")
          }}
          className="h-10 flex-1 rounded-md border px-3"
          placeholder="输入优惠码"
        />
        <button type="button" className="rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-60" disabled={status === "loading"} onClick={() => void apply()}>
          {status === "loading" ? "应用中" : "应用"}
        </button>
      </motion.div>
      {status === "error" ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
    </div>
  )
}

export { CouponInput }
