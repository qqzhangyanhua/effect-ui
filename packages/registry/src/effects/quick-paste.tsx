"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/quick-paste-base.tsx

import { useId, useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "motion/react"
import { ArrowRight, X } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface PasteData {
  name: string
  image?: string
}

export interface QuickPasteProps {
  onPaste: (value: string) => PasteData | null
  onClear?: () => void
  onContinue?: (data: PasteData) => void
  placeholder?: string
  submitText?: string
  className?: string
}

export function QuickPaste({
  onPaste,
  onClear,
  onContinue,
  placeholder = "Email Address",
  submitText = "Paste",
  className,
}: QuickPasteProps) {
  const reduced = usePrefersReducedMotion()
  const group = useId()
  const [pasted, setPasted] = useState<PasteData | null>(null)
  const [inputValue, setInputValue] = useState("")
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, bounce: 0.1, duration: 0.4 }
  const localImage = pasted?.image && !/^https?:/i.test(pasted.image) ? pasted.image : ""

  const paste = () => {
    const data = onPaste(inputValue)
    if (data) setPasted(data)
  }

  const clear = () => {
    setPasted(null)
    setInputValue("")
    onClear?.()
  }

  return (
    <LayoutGroup id={group}>
      <div data-slot="quick-paste" className={`flex w-full justify-center motion-reduce:transition-none ${className ?? ""}`}>
        <motion.div layout transition={spring} className="flex min-h-16 w-full max-w-md items-center rounded-lg bg-muted p-1.5">
          <AnimatePresence mode="popLayout">
            {pasted ? (
              <motion.div key="pasted" className="flex w-full items-center justify-between pr-1" initial={reduced ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center rounded-lg border border-border bg-background py-1.5 pr-3 pl-1.5">
                  {localImage ? (
                    <img src={localImage} alt="" className="mr-3 size-9 rounded-lg border border-border object-cover" />
                  ) : (
                    <span className="mr-3 flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{pasted.name.slice(0, 1)}</span>
                  )}
                  <span className="mr-3 max-w-40 truncate text-base font-bold text-foreground">{pasted.name}</span>
                  <button type="button" aria-label="Remove" onClick={clear} className="flex size-5 items-center justify-center rounded-md bg-muted text-foreground active:bg-destructive active:text-primary-foreground">
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
                <motion.button type="button" aria-label="Continue" whileTap={{ scale: 0.94 }} onClick={() => onContinue?.(pasted)} className="flex size-11 items-center justify-center rounded-full bg-foreground text-background">
                  <ArrowRight size={22} aria-hidden="true" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="input" className="flex w-full items-center pr-1 pl-4" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
                <input
                  value={inputValue}
                  placeholder={placeholder}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      paste()
                    }
                  }}
                  className="mr-2 w-full border-none bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
                <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={paste} className="flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground">
                  {submitText}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  )
}
