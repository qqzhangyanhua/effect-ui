"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/validator.css. Modified for effect-ui.

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FormValidatorProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode
  hint?: ReactNode
}

const rules = `
[data-slot="form-validator"]:has(:user-valid) input {
  border-color: var(--chart-2);
}
[data-slot="form-validator"]:has(:user-invalid) input,
[data-slot="form-validator"]:has([aria-invalid="true"]) input,
[data-slot="form-validator"][data-invalid="true"] input {
  border-color: var(--destructive);
}
[data-slot="form-validator"] [data-part="hint"] {
  visibility: hidden;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--muted-foreground);
}
[data-slot="form-validator"]:has(:user-invalid) [data-part="hint"],
[data-slot="form-validator"]:has([aria-invalid="true"]) [data-part="hint"],
[data-slot="form-validator"][data-invalid="true"] [data-part="hint"] {
  visibility: visible;
  color: var(--destructive);
}
`

export function FormValidator({ label, hint, className, id, ...props }: FormValidatorProps) {
  const reduced = usePrefersReducedMotion()
  const generated = useId()
  const inputId = id ?? generated
  const hintId = `${inputId}-hint`
  const [invalid, setInvalid] = useState(false)

  return (
    <div className={cn("grid gap-1", className)} data-invalid={invalid ? "true" : "false"} data-reduced={reduced ? "true" : "false"} data-slot="form-validator">
      <style>{rules}</style>
      {label != null ? (
        <label className="text-sm text-foreground" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        {...props}
        aria-describedby={hint != null ? hintId : props["aria-describedby"]}
        aria-invalid={invalid ? true : props["aria-invalid"]}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        id={inputId}
        onBlur={(event) => {
          props.onBlur?.(event)
          if (event.defaultPrevented) return
          setInvalid(!event.currentTarget.checkValidity())
        }}
      />
      {hint != null ? (
        <p data-part="hint" data-state={invalid ? "invalid" : "idle"} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
