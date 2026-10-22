"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/marketing/contact-forms/1.html. Modified for effect-ui.

import { useId, type FormEvent, type HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ContactField {
  name: string
  label: string
  kind?: "text" | "email" | "textarea"
  placeholder?: string
  required?: boolean
}

export interface ContactFormProps extends Omit<HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  fields: ContactField[]
  status?: "idle" | "submitting" | "success" | "error"
  statusMessage?: string
  submitLabel?: string
  onSubmit?: (values: Record<string, string>) => void
}

export function ContactForm({
  fields,
  status = "idle",
  statusMessage,
  submitLabel = "提交",
  onSubmit,
  className,
  ...props
}: ContactFormProps) {
  const reduced = usePrefersReducedMotion()
  const baseId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values: Record<string, string> = {}
    for (const field of fields) values[field.name] = String(data.get(field.name) ?? "")
    onSubmit?.(values)
  }

  return (
    <form
      {...props}
      className={cn("mx-auto max-w-md space-y-4 rounded-lg border border-border bg-muted p-6", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="contact-form"
      data-status={status}
      onSubmit={handleSubmit}
    >
      {fields.map((field) => {
        const id = `${baseId}-${field.name}`
        const invalid = status === "error"
        const shared = cn(
          "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground",
          "focus:border-primary focus:outline-none",
          reduced && "transition-none",
        )
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-foreground" htmlFor={id}>
              {field.label}
            </label>
            {field.kind === "textarea" ? (
              <textarea
                aria-invalid={invalid || undefined}
                className={cn(shared, "resize-none")}
                id={id}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                rows={4}
              />
            ) : (
              <input
                aria-invalid={invalid || undefined}
                className={shared}
                id={id}
                name={field.name}
                placeholder={field.placeholder}
                required={field.required}
                type={field.kind ?? "text"}
              />
            )}
          </div>
        )
      })}
      <button
        className={cn(
          "block w-full rounded-lg bg-primary px-12 py-3 text-sm font-medium text-primary-foreground",
          reduced ? "transition-none" : "transition-colors hover:bg-primary/80",
        )}
        disabled={status === "submitting"}
        type="submit"
      >
        {status === "submitting" ? "发送中" : submitLabel}
      </button>
      <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground" role="status">
        {statusMessage}
      </p>
    </form>
  )
}
