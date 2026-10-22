"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/accordion/MinimalAccordion.tsx
// framer-motion 已改为 motion/react。

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { ChevronDown } from "lucide-react"
import { motion } from "motion/react"
import { useId, type HTMLAttributes, type ReactNode } from "react"

export interface MinimalAccordionItem {
  value: string
  title: string
  content: ReactNode
}

export interface MinimalAccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly MinimalAccordionItem[]
  type?: "single" | "multiple"
  value?: string | readonly string[]
  defaultValue?: string | readonly string[]
  onValueChange?: (value: string | readonly string[]) => void
}

export function MinimalAccordion({
  items,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: MinimalAccordionProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const baseId = useId()
  const [current, setCurrent] = useControllableState<string | readonly string[]>({
    value,
    defaultValue: defaultValue ?? (type === "multiple" ? [] : ""),
    onChange: onValueChange,
  })

  function openIds() {
    if (Array.isArray(current)) return [...current]
    return current ? [current] : []
  }

  function isOpen(id: string) {
    if (type === "multiple") return openIds().includes(id)
    const selected = Array.isArray(current) ? (current[0] ?? "") : current
    return selected === id
  }

  function toggle(id: string) {
    if (type === "multiple") {
      const list = openIds()
      setCurrent(list.includes(id) ? list.filter((item) => item !== id) : [...list, id])
      return
    }
    const selected = Array.isArray(current) ? (current[0] ?? "") : current
    setCurrent(selected === id ? "" : id)
  }

  return (
    <div {...props} className={cn("grid gap-3", className)} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="minimal-accordion">
      {items.map((item) => {
        const open = isOpen(item.value)
        const buttonId = `${baseId}-trigger-${item.value}`
        const panelId = `${baseId}-panel-${item.value}`
        return (
          <div key={item.value} className="overflow-hidden rounded-lg border border-border bg-card">
            <button
              aria-controls={panelId}
              aria-expanded={open}
              className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-semibold text-primary"
              id={buttonId}
              type="button"
              onClick={() => toggle(item.value)}
            >
              {item.title}
              <ChevronDown
                aria-hidden
                className={cn("size-4 text-foreground", open && "rotate-180", prefersReducedMotion ? "transition-none" : "transition-transform")}
              />
            </button>
            {prefersReducedMotion ? (
              <div aria-labelledby={buttonId} className="px-4 pb-4 text-sm text-foreground" hidden={!open} id={panelId} role="region">
                {item.content}
              </div>
            ) : (
              <motion.div
                animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                aria-hidden={!open}
                aria-labelledby={buttonId}
                className="overflow-hidden"
                id={panelId}
                initial={false}
                role="region"
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="px-4 pb-4 text-sm text-foreground">{item.content}</div>
              </motion.div>
            )}
          </div>
        )
      })}
    </div>
  )
}
