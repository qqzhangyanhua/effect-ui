"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PlaceholderVanishInputProps {
  placeholders?: readonly string[]
  onSubmit?: (value: string) => void
  className?: string
}

interface BurstChar {
  id: number
  ch: string
  dx: number
  dy: number
  rot: number
}

const DEFAULT_PLACEHOLDERS = ["搜索组件…", "试着输入 lens", "回车后文字散开"]

function PlaceholderVanishInput({
  placeholders = DEFAULT_PLACEHOLDERS,
  onSubmit,
  className,
}: PlaceholderVanishInputProps) {
  const reduced = usePrefersReducedMotion()
  const inputId = React.useId()
  const [value, setValue] = React.useState("")
  const [index, setIndex] = React.useState(0)
  const [chars, setChars] = React.useState<BurstChar[]>([])
  const [notice, setNotice] = React.useState("")
  const timer = React.useRef(0)

  React.useEffect(() => {
    if (reduced || placeholders.length < 2) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % placeholders.length)
    }, 2200)
    return () => window.clearInterval(id)
  }, [placeholders.length, reduced])

  React.useEffect(
    () => () => {
      window.clearTimeout(timer.current)
    },
    [],
  )

  const placeholder = placeholders[index] ?? placeholders[0] ?? ""

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const text = value.trim()
    if (!text) return
    onSubmit?.(text)
    setNotice(`已提交「${text}」`)
    if (reduced) {
      setValue("")
      return
    }
    setChars(
      [...text].map((ch, charIndex) => ({
        id: charIndex,
        ch,
        dx: (Math.random() - 0.5) * 140,
        dy: -24 - Math.random() * 72,
        rot: (Math.random() - 0.5) * 90,
      })),
    )
    setValue("")
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setChars([]), 680)
  }

  return (
    <form
      data-slot="placeholder-vanish-input"
      onSubmit={submit}
      className={cn("w-full space-y-2", className)}
    >
      <label htmlFor={inputId} className="text-sm font-medium">
        搜索
      </label>
      <div className="relative">
        <input
          id={inputId}
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-transparent focus-visible:ring-2 focus-visible:ring-primary"
        />
        {value.length === 0 ? (
          <motion.span
            key={placeholder}
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 text-sm text-muted-foreground"
            initial={reduced ? { opacity: 1, y: "-50%" } : { opacity: 0, y: "-30%" }}
            animate={{ opacity: 1, y: "-50%" }}
            transition={{ duration: reduced ? 0 : 0.28 }}
          >
            {placeholder}
          </motion.span>
        ) : null}
        {chars.length > 0 ? (
          <span className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm">
            {chars.map((char) => (
              <motion.span
                key={char.id}
                className="inline-block"
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: char.dx, y: char.dy, opacity: 0, rotate: char.rot }}
                transition={{ duration: 0.62, ease: "easeOut" }}
              >
                {char.ch === " " ? "\u00a0" : char.ch}
              </motion.span>
            ))}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {notice || "输入后回车，文字会散成粒子。"}
        </p>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          提交
        </button>
      </div>
    </form>
  )
}

export { PlaceholderVanishInput }
