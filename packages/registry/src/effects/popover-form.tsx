"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/popover-form.tsx

import { Check } from "lucide-react"
import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PopoverFormProps {
  label?: string
  placeholder?: string
  submitLabel?: string
  className?: string
  onSubmit?: (value: string) => void
}

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'

function PopoverForm({ label = "留言", placeholder = "写一句", submitLabel = "发送", className, onSubmit }: PopoverFormProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [text, setText] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const openRef = useRef(open)
  const pendingFocus = useRef(false)
  const id = useId()
  const shellId = reduced ? undefined : `popover-form-${id}`

  useEffect(() => {
    openRef.current = open
  }, [open])

  useClickOutside(rootRef, () => {
    if (!openRef.current) return
    pendingFocus.current = true
    setOpen(false)
    setDone(false)
  })

  useEffect(() => {
    if (open && !done) inputRef.current?.focus()
  }, [done, open])

  useEffect(() => {
    if (open || !pendingFocus.current) return
    pendingFocus.current = false
    triggerRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        pendingFocus.current = true
        setOpen(false)
        setDone(false)
        return
      }
      if (event.key !== "Tab" || !formRef.current) return
      const items = [...formRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => !item.hasAttribute("disabled"))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit?.(text)
    setDone(true)
  }

  return (
    <div ref={rootRef} data-slot="popover-form" data-reduced={reduced ? "true" : undefined} className={cn("relative inline-flex", className)}>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.form
            key="form"
            ref={formRef}
            layoutId={shellId}
            onSubmit={submit}
            className="w-64 rounded-2xl border bg-popover p-3 text-popover-foreground shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            {done ? (
              <div className="flex h-24 flex-col items-center justify-center gap-2" role="status">
                <Check className="size-6" />
                <span>已发送</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor={`${id}-input`}>
                  {label}
                </label>
                <input
                  ref={inputRef}
                  autoFocus
                  id={`${id}-input`}
                  value={text}
                  placeholder={placeholder}
                  onChange={(event) => setText(event.target.value)}
                  className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button type="submit" className="h-9 rounded-md bg-primary text-sm text-primary-foreground">
                  {submitLabel}
                </button>
              </div>
            )}
          </motion.form>
        ) : (
          <motion.button
            key="trigger"
            ref={triggerRef}
            type="button"
            layoutId={shellId}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            aria-expanded={false}
            onClick={() => {
              setDone(false)
              setOpen(true)
            }}
          >
            {label}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export { PopoverForm }
