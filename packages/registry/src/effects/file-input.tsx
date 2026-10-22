"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/fileinput.css. Modified for effect-ui.

import type { InputHTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  fieldSize?: "xs" | "sm" | "md" | "lg" | "xl"
  ghost?: boolean
  color?: string
  onFilesChange?: (files: File[]) => void
}

const heights = { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem", xl: "3.5rem" }
const typeSizes = { xs: "0.6875rem", sm: "0.75rem", md: "0.875rem", lg: "1.125rem", xl: "1.125rem" }

const rules = `
[data-slot="file-input"]::file-selector-button {
  height: 100%;
  margin-right: 1rem;
  margin-left: -1px;
  border: 0;
  padding: 0 1rem;
  font-weight: 600;
  cursor: pointer;
  background: var(--file-accent, var(--primary));
  color: var(--file-fg, var(--primary-foreground));
}
[data-slot="file-input"][data-ghost="true"] {
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}
[data-slot="file-input"]:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
`

export function FileInput({ fieldSize = "md", ghost = false, color, onFilesChange, className, ...props }: FileInputProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <>
      <style>{rules}</style>
      <input
        {...props}
        className={cn(
          "inline-flex w-full max-w-xs cursor-pointer items-center rounded-md border border-border bg-background pe-3 align-middle text-foreground select-none",
          className,
        )}
        data-field-size={fieldSize}
        data-ghost={ghost ? "true" : "false"}
        data-reduced={reduced ? "true" : "false"}
        data-slot="file-input"
        style={{
          height: heights[fieldSize],
          fontSize: typeSizes[fieldSize],
          ["--file-accent" as string]: color ?? "var(--primary)",
          ["--file-fg" as string]: "var(--primary-foreground)",
          transition: reduced ? "none" : "background-color 0.2s",
        }}
        type="file"
        onChange={(event) => {
          props.onChange?.(event)
          const list = event.target.files
          onFilesChange?.(list ? Array.from(list) : [])
        }}
      />
    </>
  )
}
