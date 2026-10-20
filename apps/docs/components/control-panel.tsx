"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { ComponentType, ReactNode } from "react"

import type { ControlDef } from "@effect-ui/registry/catalog"
import { Button } from "@effect-ui/registry/ui/button"
import { Input } from "@effect-ui/registry/ui/input"
import { Label } from "@effect-ui/registry/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@effect-ui/registry/ui/select"
import { Slider } from "@effect-ui/registry/ui/slider"
import { Switch } from "@effect-ui/registry/ui/switch"

interface ControlField {
  name: string
  defaultValue?: string
  control: ControlDef
}

type ControlValue = string | number | boolean
type ControlValues = Record<string, ControlValue>

const slowKinds = new Set<ControlDef["kind"]>(["range", "color"])

function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-xl border bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_46%)] p-8">
      {children}
    </div>
  )
}

function ControlledPreview({
  Demo,
  componentName,
  controls,
}: {
  Demo: ComponentType
  componentName: string
  controls: readonly ControlField[]
}) {
  const initial = startValues(controls)
  const [draft, setDraft] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [copied, setCopied] = useState(false)
  const draftRef = useRef(draft)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setValue = (field: ControlField, value: ControlValue) => {
    const next = { ...draftRef.current, [field.name]: value }
    draftRef.current = next
    setDraft(next)
    if (!slowKinds.has(field.control.kind)) {
      setApplied((current) => ({ ...current, [field.name]: value }))
      return
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setApplied((current) => applySlow(current, controls, draftRef.current))
    }, 200)
  }

  const reset = () => {
    window.clearTimeout(timer.current)
    draftRef.current = initial
    setDraft(initial)
    setApplied(initial)
    setCopied(false)
  }

  const copy = () => {
    const snippet = formatSnippet(componentName, controls, draftRef.current)
    void navigator.clipboard.writeText(snippet).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      },
      () => setCopied(false),
    )
  }

  return (
    <div className="space-y-4">
      <PreviewShell>
        <DemoView Demo={Demo} values={applied} />
      </PreviewShell>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {controls.map((field) => (
            <ControlWidget
              key={field.name}
              field={field}
              value={draft[field.name] ?? field.control.value}
              onChange={(value) => setValue(field, value)}
            />
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={reset}>
            重置
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copy}>
            {copied ? "已复制" : "复制当前配置"}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DemoView({ Demo, values }: { Demo: ComponentType; values: ControlValues }) {
  const View = Demo as ComponentType<ControlValues>
  return <View {...values} />
}

function ControlWidget({
  field,
  value,
  onChange,
}: {
  field: ControlField
  value: ControlValue
  onChange: (value: ControlValue) => void
}) {
  const id = useId()
  const control = field.control

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{field.name}</Label>
        {control.kind === "range" && typeof value === "number" ? (
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatNumber(value, control.step)}
          </span>
        ) : null}
      </div>
      {control.kind === "range" && typeof value === "number" ? (
        <RangeControl id={id} name={field.name} control={control} value={value} onChange={onChange} />
      ) : null}
      {control.kind === "select" && typeof value === "string" ? (
        <SelectControl id={id} control={control} value={value} onChange={onChange} />
      ) : null}
      {control.kind === "color" && typeof value === "string" ? (
        <ColorControl id={id} name={field.name} value={value} onChange={onChange} />
      ) : null}
      {control.kind === "boolean" && typeof value === "boolean" ? (
        <Switch id={id} checked={value} onCheckedChange={onChange} aria-label={field.name} />
      ) : null}
      {control.kind === "text" && typeof value === "string" ? (
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : null}
    </div>
  )
}

function RangeControl({
  id,
  name,
  control,
  value,
  onChange,
}: {
  id: string
  name: string
  control: Extract<ControlDef, { kind: "range" }>
  value: number
  onChange: (value: number) => void
}) {
  const rootRef = useRef<HTMLSpanElement>(null)
  // Radix 把 role="slider" 放在拇指上，单拇指时不带 aria-label。
  // 不能改 registry 的 Slider，否则安装 JSON 会变。
  useLayoutEffect(() => {
    const thumb = rootRef.current?.querySelector<HTMLElement>("[role='slider']")
    if (!thumb) return
    thumb.id = id
    thumb.setAttribute("aria-label", name)
  })

  return (
    <Slider
      ref={rootRef}
      min={control.min}
      max={control.max}
      step={control.step ?? 1}
      value={[value]}
      onValueChange={(next) => {
        const raw = next[0]
        if (raw === undefined) return
        onChange(snap(raw, control))
      }}
    />
  )
}

function SelectControl({
  id,
  control,
  value,
  onChange,
}: {
  id: string
  control: Extract<ControlDef, { kind: "select" }>
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {control.options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ColorControl({
  id,
  name,
  value,
  onChange,
}: {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
}) {
  const [text, setText] = useState(value)
  const [synced, setSynced] = useState(value)
  if (value !== synced) {
    setSynced(value)
    setText(value)
  }

  const picker = hexColor(value) ?? "#000000"

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${name} 拾色器`}
        value={picker}
        onChange={(event) => onChange(event.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
      />
      <Input
        id={id}
        value={text}
        spellCheck={false}
        onChange={(event) => {
          const next = event.target.value
          setText(next)
          const hex = hexColor(next)
          if (hex) onChange(hex)
        }}
        onBlur={() => setText(value)}
      />
    </div>
  )
}

function hexColor(raw: string) {
  const text = raw.trim().replace(/^#/, "")
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(text)) return null
  const digits = text.length === 3 ? [...text].map((char) => `${char}${char}`).join("") : text
  return `#${digits.toLowerCase()}`
}

function startValues(controls: readonly ControlField[]): ControlValues {
  return Object.fromEntries(controls.map((field) => [field.name, field.control.value]))
}

function applySlow(current: ControlValues, controls: readonly ControlField[], draft: ControlValues) {
  const next = { ...current }
  let changed = false
  for (const field of controls) {
    if (!slowKinds.has(field.control.kind)) continue
    const value = draft[field.name]
    if (value === undefined || Object.is(next[field.name], value)) continue
    next[field.name] = value
    changed = true
  }
  return changed ? next : current
}

function formatSnippet(componentName: string, controls: readonly ControlField[], values: ControlValues) {
  const attrs = controls.flatMap((field) => {
    const value = values[field.name]
    if (value === undefined || !includeProp(field, value)) return []
    return [formatAttr(field, value)]
  })
  if (attrs.length === 0) return `<${componentName} />`
  return `<${componentName} ${attrs.join(" ")} />`
}

function includeProp(field: ControlField, value: ControlValue) {
  const baseline = comparableDefault(field)
  if (baseline === undefined) return true
  return !Object.is(baseline, value)
}

function comparableDefault(field: ControlField): ControlValue | undefined {
  const raw = field.defaultValue?.trim()
  if (raw === undefined || raw.length === 0) return undefined
  if (field.control.kind === "range") {
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(raw)) return undefined
    const value = Number(raw)
    return Number.isFinite(value) ? value : undefined
  }
  if (field.control.kind === "boolean") {
    if (raw === "true") return true
    if (raw === "false") return false
    return undefined
  }
  const quoted = raw.match(/^"([\s\S]*)"$/) ?? raw.match(/^'([\s\S]*)'$/)
  return quoted?.[1] ?? raw
}

function formatAttr(field: ControlField, value: ControlValue) {
  if (typeof value === "number") {
    const step = field.control.kind === "range" ? field.control.step : undefined
    return `${field.name}={${formatNumber(value, step)}}`
  }
  if (typeof value === "boolean") return `${field.name}={${value}}`
  if (/^[^"\\\n]*$/.test(value)) return `${field.name}="${value}"`
  return `${field.name}={${JSON.stringify(value)}}`
}

function formatNumber(value: number, step: number | undefined) {
  if (!Number.isFinite(value)) return "0"
  const places = step !== undefined && step > 0 ? decimalPlaces(step) : 0
  const text = places === 0 ? String(Math.round(value)) : value.toFixed(places)
  if (!text.includes(".")) return text
  return text.replace(/0+$/, "").replace(/\.$/, "")
}

function decimalPlaces(step: number) {
  const text = step.toString()
  const index = text.indexOf(".")
  if (index < 0) return 0
  return Math.min(8, text.length - index - 1)
}

function snap(value: number, control: Extract<ControlDef, { kind: "range" }>) {
  const step = control.step && control.step > 0 ? control.step : 1
  const steps = Math.round((value - control.min) / step)
  const next = Math.min(control.max, Math.max(control.min, control.min + steps * step))
  const places = decimalPlaces(step)
  return places === 0 ? Math.round(next) : Number(next.toFixed(places))
}

export type { ControlField }
export { ControlledPreview, PreviewShell }
