"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/neobrutalism/cards/1.html. Modified for effect-ui.
// 同一目录的 alerts、badges、inputs、selects、textareas、checkboxes、progress-bars、tabs 合并进这一条目。

import { useId, useState, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const frame = "border-2 border-foreground bg-background text-foreground shadow-[4px_4px_0_0] shadow-foreground"
const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 dark:focus-visible:ring-yellow-600"

export interface NeoCardProps extends HTMLAttributes<HTMLElement> {
  href?: string
  date?: string
  dateTime?: string
  heading?: string
}

export function NeoCard({ date, dateTime, heading, href, className, children, ...props }: NeoCardProps) {
  const reduced = usePrefersReducedMotion()
  const classes = cn(
    frame,
    "block p-4 sm:p-6",
    reduced ? "transition-none" : "transition hover:bg-yellow-200 dark:hover:bg-yellow-700",
    focusRing,
    className,
  )
  const body = (
    <>
      {date ? (
        <time className="text-xs font-semibold uppercase" dateTime={dateTime}>
          {date}
        </time>
      ) : null}
      {heading ? <h3 className="mt-1 text-xl font-semibold">{heading}</h3> : null}
      {children ? <div className="mt-2 line-clamp-3">{children}</div> : null}
    </>
  )
  if (href) {
    return (
      <a className={classes} data-part="card" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit" href={href}>
        {body}
      </a>
    )
  }
  return (
    <article {...props} className={classes} data-part="card" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit">
      {body}
    </article>
  )
}

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "info" | "success" | "error"
}

const toneClass = {
  info: "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-50",
  success: "bg-green-100 text-green-900 dark:bg-green-800 dark:text-green-50",
  error: "bg-red-100 text-red-900 dark:bg-red-800 dark:text-red-50",
} as const

const toneLabel = { info: "信息：", success: "成功：", error: "错误：" } as const

export function Alert({ tone = "info", className, children, ...props }: AlertProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      {...props}
      className={cn("border-2 border-foreground p-4 shadow-[4px_4px_0_0] shadow-foreground", toneClass[tone], className)}
      data-part="alert"
      data-reduced={reduced ? "true" : "false"}
      data-slot="neo-brutal-kit"
      role="alert"
    >
      <strong className="block font-semibold leading-tight">
        <span className="sr-only">{toneLabel[tone]}</span>
        {children}
      </strong>
    </div>
  )
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "info" | "success" | "error"
}

export function Badge({ tone = "info", className, children, ...props }: BadgeProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <span
      {...props}
      className={cn(
        "inline-flex border-2 border-foreground px-3 py-1.5 text-sm/none font-semibold text-foreground shadow-[2px_2px_0_0] shadow-foreground",
        tone === "info" && "bg-blue-100 dark:bg-blue-800 dark:text-white",
        tone === "success" && "bg-green-100 dark:bg-green-800 dark:text-white",
        tone === "error" && "bg-red-100 dark:bg-red-800 dark:text-white",
        className,
      )}
      data-part="badge"
      data-reduced={reduced ? "true" : "false"}
      data-slot="neo-brutal-kit"
    >
      {children}
    </span>
  )
}

const fieldClass = cn("mt-0.5 w-full px-3 py-2 sm:text-sm", frame, focusRing)

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string
}

export function Input({ label, id, className, ...props }: InputProps) {
  const reduced = usePrefersReducedMotion()
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <label className="block text-sm font-semibold text-foreground" data-part="input" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit" htmlFor={fieldId}>
      {label}
      <input {...props} className={cn(fieldClass, reduced && "transition-none", className)} id={fieldId} />
    </label>
  )
}

export interface NeoOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label: string
  options: NeoOption[]
}

export function Select({ label, options, id, className, ...props }: SelectProps) {
  const reduced = usePrefersReducedMotion()
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <label className="block text-sm font-semibold text-foreground" data-part="select" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit" htmlFor={fieldId}>
      {label}
      <select {...props} className={cn(fieldClass, reduced && "transition-none", className)} id={fieldId}>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function Textarea({ label, id, className, ...props }: TextareaProps) {
  const reduced = usePrefersReducedMotion()
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <label className="block text-sm font-semibold text-foreground" data-part="textarea" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit" htmlFor={fieldId}>
      {label}
      <textarea {...props} className={cn(fieldClass, "resize-none", reduced && "transition-none", className)} id={fieldId} />
    </label>
  )
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  label: string
}

export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const reduced = usePrefersReducedMotion()
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <label className="inline-flex items-center gap-3 text-sm font-semibold text-foreground" data-part="checkbox" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit" htmlFor={fieldId}>
      <input
        {...props}
        className={cn(
          "size-6 appearance-none border-2 border-foreground bg-background shadow-[2px_2px_0_0] shadow-foreground checked:bg-foreground",
          focusRing,
          reduced && "transition-none",
          className,
        )}
        id={fieldId}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  )
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number
  label?: string
}

export function Progress({ value = 0, label = "进度", className, ...props }: ProgressProps) {
  const reduced = usePrefersReducedMotion()
  const amount = Math.min(100, Math.max(0, value))
  return (
    <div
      {...props}
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={amount}
      className={className}
      data-part="progress"
      data-reduced={reduced ? "true" : "false"}
      data-slot="neo-brutal-kit"
      role="progressbar"
    >
      <div className="w-full border-2 border-foreground bg-background p-1 shadow-[2px_2px_0_0] shadow-foreground">
        <div className="h-3 bg-foreground" style={{ width: `${amount}%` }} />
      </div>
    </div>
  )
}

export interface NeoTab {
  id: string
  label: string
  content: ReactNode
}

export interface TabsProps {
  tabs: NeoTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, defaultValue, onValueChange, className }: TabsProps) {
  const reduced = usePrefersReducedMotion()
  const baseId = useId()
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? tabs[0]?.id ?? "")
  const selected = value ?? uncontrolled
  const current = tabs.find((tab) => tab.id === selected) ?? tabs[0]

  return (
    <div className={className} data-part="tabs" data-reduced={reduced ? "true" : "false"} data-slot="neo-brutal-kit">
      <div className="border-b-2 border-foreground px-2">
        <div className="-mb-0.5 flex" role="tablist">
          {tabs.map((tab) => {
            const on = tab.id === current?.id
            return (
              <button
                key={tab.id}
                aria-controls={`${baseId}-${tab.id}`}
                aria-selected={on}
                className={cn(
                  "border-2 px-6 py-2 font-semibold",
                  focusRing,
                  on ? "border-foreground bg-yellow-200 text-foreground dark:bg-yellow-700 dark:text-white" : "border-transparent text-foreground hover:bg-foreground hover:text-background",
                  reduced && "transition-none",
                )}
                id={`${baseId}-tab-${tab.id}`}
                onClick={() => {
                  if (value === undefined) setUncontrolled(tab.id)
                  onValueChange?.(tab.id)
                }}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
      {current ? (
        <div aria-labelledby={`${baseId}-tab-${current.id}`} className="mt-4 text-foreground" id={`${baseId}-${current.id}`} role="tabpanel">
          {current.content}
        </div>
      ) : null}
    </div>
  )
}
