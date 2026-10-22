"use client"

// Ported from Spectrum UI (Apache-2.0, (c) Spectrum UI / arihantcodes) — https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/login-card/logincard.tsx. Modified for effect-ui.

import { MoveRight } from "lucide-react"
import { motion } from "motion/react"
import { useState, type FormEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LoginCardField {
  name: string
  label?: string
  type?: string
  placeholder?: string
  autoComplete?: string
}

export interface LoginCardProps {
  onSubmit?: (values: Record<string, string>) => void
  fields?: readonly LoginCardField[]
  socialSlot?: ReactNode
  title?: string
  description?: string
  submitLabel?: string
  dividerLabel?: string
  footer?: ReactNode
  className?: string
}

const DEFAULT_FIELDS: readonly LoginCardField[] = [{ name: "email", label: "邮箱", type: "email", placeholder: "邮箱", autoComplete: "email" }]

export function LoginCard({
  onSubmit,
  fields = DEFAULT_FIELDS,
  socialSlot,
  title = "欢迎回来",
  description = "登录你的账号",
  submitLabel = "继续",
  dividerLabel = "或",
  footer,
  className,
}: LoginCardProps) {
  const reduced = usePrefersReducedMotion()
  const [values, setValues] = useState<Record<string, string>>({})

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    for (const field of fields) next[field.name] = values[field.name] ?? ""
    onSubmit?.(next)
  }

  return (
    <motion.form
      animate={{ opacity: 1, y: 0 }}
      className={cn("w-full max-w-md rounded-3xl border bg-card p-8 text-card-foreground shadow-sm", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="login-card"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      transition={{ duration: reduced ? 0 : 0.45 }}
      onSubmit={submit}
    >
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-light">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="relative block">
            <span className="sr-only">{field.label ?? field.name}</span>
            <input
              autoComplete={field.autoComplete}
              className="w-full rounded-full border bg-muted px-6 py-4 pr-16 text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
              name={field.name}
              placeholder={field.placeholder}
              type={field.type ?? "text"}
              value={values[field.name] ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
            />
            {fields.length === 1 ? (
              <button aria-label={submitLabel} className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-secondary p-3" type="submit">
                <MoveRight className="size-4" />
              </button>
            ) : null}
          </label>
        ))}
      </div>
      {fields.length > 1 ? (
        <button className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground" type="submit">
          {submitLabel}
        </button>
      ) : null}
      {socialSlot ? (
        <>
          <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {dividerLabel}
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-3">{socialSlot}</div>
        </>
      ) : null}
      {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </motion.form>
  )
}
