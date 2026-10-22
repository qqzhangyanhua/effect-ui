"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/predictive-text-base.tsx

import { useMemo, useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUp, ImageIcon, Mic } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const defaultWords = ["what", "whatever", "what's", "bright", "brighter", "brigade", "sunny", "sunset", "sun", "day", "dance", "data", "a", "an", "any"]

export interface PredictiveTextProps {
  dictionary?: string[]
  placeholder?: string
  onSend?: (text: string) => void
  className?: string
}

export function PredictiveText({ dictionary = defaultWords, placeholder = "Write a message", onSend, className }: PredictiveTextProps) {
  const reduced = usePrefersReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState("")
  const [active, setActive] = useState(-1)
  const [frequency, setFrequency] = useState<Record<string, number>>({})
  const lastWord = text.split(/\s+/).at(-1)?.toLowerCase() ?? ""
  const suggestions = useMemo(() => {
    if (!lastWord) return []
    const ranked = Object.keys(frequency).sort((a, b) => (frequency[b] ?? 0) - (frequency[a] ?? 0))
    const dict = Array.from(new Set([...ranked, ...dictionary]))
    return dict.filter((word) => word.toLowerCase().startsWith(lastWord) && word.toLowerCase() !== lastWord).slice(0, 3)
  }, [dictionary, frequency, lastWord])

  const apply = (suggestion: string) => {
    const words = text.split(/\s+/)
    words[words.length - 1] = suggestion
    setText(`${words.join(" ")} `)
    setActive(-1)
    inputRef.current?.focus()
  }

  const send = () => {
    if (!text.trim()) return
    setFrequency((prev) => {
      const updated = { ...prev }
      for (const word of text.trim().toLowerCase().split(/\s+/)) updated[word] = (updated[word] ?? 0) + 1
      return updated
    })
    onSend?.(text)
    setText("")
    setActive(-1)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      const chosen = suggestions[active]
      if (active >= 0 && chosen) apply(chosen)
      else send()
    } else if (event.key === "Tab" && suggestions.length > 0) {
      event.preventDefault()
      setActive((index) => (index + 1) % suggestions.length)
    } else if (event.key === "ArrowRight" && suggestions[0] && inputRef.current?.selectionStart === text.length) {
      event.preventDefault()
      apply(suggestions[0])
    } else if (event.key === "Escape" && text) {
      event.preventDefault()
      setText("")
      setActive(-1)
    }
  }

  return (
    <div data-slot="predictive-text" className={`flex w-full flex-col items-center motion-reduce:transition-none ${className ?? ""}`}>
      <div className="mb-3 flex h-10 w-full max-w-md items-center">
        <AnimatePresence>
          {suggestions.length > 0 ? (
            <motion.div initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center rounded-lg border border-border bg-card px-1 py-1 shadow-sm">
              {suggestions.map((word, index) => (
                <button key={word} type="button" onClick={() => apply(word)} className={`px-3 py-1 text-sm font-bold ${index === active ? "text-primary" : "text-muted-foreground"} ${index > 0 ? "border-l border-border" : ""}`}>
                  {word}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="relative w-full max-w-md">
        <input
          ref={inputRef}
          value={text}
          placeholder={placeholder}
          onChange={(event) => {
            setText(event.target.value)
            setActive(-1)
          }}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-border bg-card px-5 py-3.5 pr-24 text-sm font-bold text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
          {text.length > 0 ? (
            <button type="button" aria-label="Send" onClick={send} className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground active:scale-90">
              <ArrowUp size={18} aria-hidden="true" />
            </button>
          ) : (
            <>
              <button type="button" aria-label="Add image" className="text-muted-foreground active:text-foreground">
                <ImageIcon size={20} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Dictate" className="text-muted-foreground active:text-foreground">
                <Mic size={20} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
