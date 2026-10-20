"use client"

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { ComponentType } from "react"

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
import type { ControlDef } from "@effect-ui/registry/catalog"

import {
  definedProps,
  formatNumber,
  formatSnippet,
  groupedFields,
  hexColor,
  initialConcrete,
  snap,
  startValues,
  type ControlField,
  type ControlValue,
  type ControlValues,
} from "@/lib/preview-controls"
import { PreviewFrame } from "@/components/preview-frame"

const slowKinds = new Set<ControlDef["kind"]>(["range", "color", "colors"])

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
  const concreteRef = useRef(initialConcrete(controls))
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const publish = (next: ControlValues, immediate: boolean) => {
    draftRef.current = next
    setDraft(next)
    if (immediate) {
      window.clearTimeout(timer.current)
      setApplied(next)
      return
    }
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setApplied((current) => applySlow(current, controls, draftRef.current))
    }, 200)
  }

  const setValue = (field: ControlField, value: ControlValue) => {
    if (field.control.kind === "color" || field.control.kind === "colors") {
      concreteRef.current = { ...concreteRef.current, [field.name]: value }
    }
    publish({ ...draftRef.current, [field.name]: value }, !slowKinds.has(field.control.kind))
  }

  const toggleFollow = (field: ControlField, follow: boolean) => {
    const value = follow ? undefined : concreteRef.current[field.name]
    publish({ ...draftRef.current, [field.name]: value }, true)
  }

  const reset = () => {
    window.clearTimeout(timer.current)
    concreteRef.current = initialConcrete(controls)
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

  const snippet = formatSnippet(componentName, controls, draft)
  const grouped = controls.length > 6

  return (
    <div className="@container">
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-start">
        <PreviewFrame className="min-w-0 @3xl:flex-1">
          <DemoView Demo={Demo} values={applied} />
        </PreviewFrame>
        <div className="space-y-4 rounded-xl border bg-card p-4 @3xl:w-80 @3xl:shrink-0">
          {grouped ? (
            groupedFields(controls).map((group) => (
              <section key={group.group} aria-label={group.group} className="space-y-4">
                <h3 className="text-sm font-medium">{group.group}</h3>
                <ControlGrid fields={group.fields} values={draft} onChange={setValue} onFollow={toggleFollow} />
              </section>
            ))
          ) : (
            <ControlGrid fields={controls} values={draft} onChange={setValue} onFollow={toggleFollow} />
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              重置
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              {copied ? "已复制" : "复制当前配置"}
            </Button>
          </div>
          <pre aria-label="当前配置" className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
            {snippet}
          </pre>
        </div>
      </div>
    </div>
  )
}

function ControlGrid({
  fields,
  values,
  onChange,
  onFollow,
}: {
  fields: readonly ControlField[]
  values: ControlValues
  onChange: (field: ControlField, value: ControlValue) => void
  onFollow: (field: ControlField, follow: boolean) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 @3xl:grid-cols-1">
      {fields.map((field) => (
        <ControlWidget
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => onChange(field, value)}
          onFollow={(follow) => onFollow(field, follow)}
        />
      ))}
    </div>
  )
}

function DemoView({ Demo, values }: { Demo: ComponentType; values: ControlValues }) {
  const View = Demo as ComponentType<ReturnType<typeof definedProps>>
  return <View {...definedProps(values)} />
}

function ControlWidget({
  field,
  value,
  onChange,
  onFollow,
}: {
  field: ControlField
  value: ControlValue | undefined
  onChange: (value: ControlValue) => void
  onFollow: (follow: boolean) => void
}) {
  const id = useId()
  const control = field.control
  const colorKind = control.kind === "color" || control.kind === "colors"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={colorKind ? undefined : id}>{field.name}</Label>
        {control.kind === "range" && typeof value === "number" ? (
          <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(value, control.step)}</span>
        ) : null}
      </div>
      {control.kind === "range" && typeof value === "number" ? (
        <RangeControl id={id} name={field.name} control={control} value={value} onChange={onChange} />
      ) : null}
      {control.kind === "select" && typeof value === "string" ? (
        <SelectControl id={id} control={control} value={value} onChange={onChange} />
      ) : null}
      {colorKind ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">跟随主题</span>
          <Switch
            checked={value === undefined}
            onCheckedChange={onFollow}
            aria-label={`${field.name} 跟随主题`}
          />
        </div>
      ) : null}
      {control.kind === "color" && typeof value === "string" ? (
        <ColorControl id={id} name={field.name} value={value} onChange={onChange} />
      ) : null}
      {control.kind === "colors" && Array.isArray(value) ? (
        <div className="space-y-2">
          {value.map((color, index) => (
            <ColorControl
              key={index}
              id={`${id}-${index}`}
              name={`${field.name} 颜色 ${index + 1}`}
              value={color}
              onChange={(next) => onChange(value.map((item, itemIndex) => (itemIndex === index ? next : item)))}
            />
          ))}
        </div>
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
        onChange(snap(raw, control.min, control.max, control.step))
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
  const [edit, setEdit] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${name} 拾色器`}
        value={hexColor(value) ?? "#000000"}
        onChange={(event) => onChange(event.target.value)}
        className="size-9 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-1"
      />
      <Input
        id={id}
        aria-label={name}
        value={edit ?? value}
        spellCheck={false}
        onChange={(event) => {
          const next = event.target.value
          setEdit(next)
          const hex = hexColor(next)
          if (hex) onChange(hex)
        }}
        onBlur={() => setEdit(null)}
      />
    </div>
  )
}

function sameSlot(left: ControlValue | undefined, right: ControlValue | undefined) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => item === right[index])
  }
  return Object.is(left, right)
}

function applySlow(current: ControlValues, controls: readonly ControlField[], draft: ControlValues) {
  const next = { ...current }
  let changed = false
  for (const field of controls) {
    if (!slowKinds.has(field.control.kind) || !Object.hasOwn(draft, field.name)) continue
    const value = draft[field.name]
    if (sameSlot(next[field.name], value)) continue
    next[field.name] = value
    changed = true
  }
  return changed ? next : current
}

export type { ControlField }
export { ControlledPreview }
