"use client"

import { useEffect, useId, useRef, useState } from "react"
import type { ComponentProps, ComponentType } from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import type { ControlDef, ControlPreset } from "@effect-ui/registry/catalog"

import {
  controlsAreGrouped,
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
import { cn } from "@/lib/utils"
import { PreviewFrame } from "@/components/preview-frame"

const slowKinds = new Set<ControlDef["kind"]>(["range", "color", "colors"])
const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
const buttonClass =
  "inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent"
const buttonActiveClass =
  "inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium whitespace-nowrap text-primary-foreground"

function ControlledPreview({
  Demo,
  componentName,
  controls,
  presets,
}: {
  Demo: ComponentType
  componentName: string
  controls: readonly ControlField[]
  presets?: readonly ControlPreset[]
}) {
  const initial = startValues(controls)
  const [draft, setDraft] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [copied, setCopied] = useState(false)
  const [activePreset, setActivePreset] = useState<string | undefined>(undefined)
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
    setActivePreset(undefined)
    publish({ ...draftRef.current, [field.name]: value }, !slowKinds.has(field.control.kind))
  }

  const applyPreset = (preset: ControlPreset) => {
    const next = { ...draftRef.current }
    for (const [key, value] of Object.entries(preset.values)) {
      next[key] = Array.isArray(value) ? [...value] : value
    }
    setActivePreset(preset.name)
    publish(next, true)
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
    setActivePreset(undefined)
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
  const grouped = controlsAreGrouped(controls)

  return (
    <div className="@container">
      <div className="flex flex-col gap-4">
        <PreviewFrame className="min-w-0">
          <DemoView Demo={Demo} values={applied} />
        </PreviewFrame>
        <section aria-label="属性" className="space-y-5 rounded-xl border bg-card p-4 @3xl:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">属性</h2>
            <div className="flex flex-wrap gap-2">
              {presets && presets.length > 0 ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="预设">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      className={activePreset === preset.name ? buttonActiveClass : buttonClass}
                      aria-pressed={activePreset === preset.name}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <button type="button" className={buttonClass} onClick={reset}>
                重置
              </button>
              <button type="button" className={buttonClass} onClick={copy}>
                {copied ? "已复制" : "复制当前配置"}
              </button>
            </div>
          </div>
          {grouped ? (
            groupedFields(controls).map((group) => (
              <section key={group.group} aria-label={group.group} className="space-y-3">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground">{group.group}</h3>
                <ControlGrid fields={group.fields} values={draft} onChange={setValue} onFollow={toggleFollow} />
              </section>
            ))
          ) : (
            <ControlGrid fields={controls} values={draft} onChange={setValue} onFollow={toggleFollow} />
          )}
          <pre aria-label="当前配置" className="overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs">
            {snippet}
          </pre>
        </section>
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
    <div className="grid gap-x-6 gap-y-4 @xl:grid-cols-2 @4xl:grid-cols-3">
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
        <label htmlFor={colorKind ? undefined : id} className="text-sm font-medium leading-none">
          {field.name}
        </label>
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
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
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
  const step = control.step ?? 1

  return (
    <input
      id={id}
      type="range"
      aria-label={name}
      min={control.min}
      max={control.max}
      step={step}
      value={value}
      className="w-full accent-primary"
      onChange={(event) => {
        onChange(snap(Number(event.target.value), control.min, control.max, control.step))
      }}
      onKeyDown={(event) => {
        const direction =
          event.key === "ArrowRight" || event.key === "ArrowUp"
            ? 1
            : event.key === "ArrowLeft" || event.key === "ArrowDown"
              ? -1
              : 0
        if (direction === 0) return
        // jsdom 不实现 range 方向键。preventDefault 避免真实浏览器再跳一格。
        event.preventDefault()
        onChange(snap(value + direction * step, control.min, control.max, control.step))
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
    <select
      id={id}
      value={value}
      className={fieldClass}
      onChange={(event) => onChange(event.target.value)}
      onClick={(event) => {
        // jsdom 点击 option 不会改 select 的值。
        if (event.target instanceof HTMLOptionElement) onChange(event.target.value)
      }}
    >
      {control.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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
      <input
        id={id}
        aria-label={name}
        value={edit ?? value}
        spellCheck={false}
        className={fieldClass}
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

function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export type { ControlField }
export { ControlledPreview }
