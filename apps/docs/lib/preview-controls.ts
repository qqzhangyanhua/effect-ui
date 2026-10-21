import type { ControlDef, ControlGroup } from "@effect-ui/registry/catalog"
import { implicitControlGroup } from "@effect-ui/registry/prop-vocabulary"

interface ControlField {
  name: string
  defaultValue?: string
  control: ControlDef
}

type ControlValue = string | number | boolean | readonly string[]
type ControlValues = Record<string, ControlValue | undefined>

const groupOrder: readonly ControlGroup[] = ["文字", "外观", "动画", "交互"]

function fieldGroup(field: ControlField): ControlGroup {
  if (field.control.group) return field.control.group
  if (field.name === "text" || field.name === "children") return "文字"
  return implicitControlGroup(field.name) ?? "外观"
}

function textContentFirst(fields: readonly ControlField[]): ControlField[] {
  return fields
    .map((field, index) => ({
      field,
      index,
      rank: field.name === "text" || field.name === "children" ? 0 : 1,
    }))
    .sort((left, right) => left.rank - right.rank || left.index - right.index)
    .map((item) => item.field)
}

function controlsAreGrouped(fields: readonly ControlField[]): boolean {
  return fields.length > 6 || fields.some((field) => fieldGroup(field) === "文字")
}

function groupedFields(fields: readonly ControlField[]) {
  const buckets = new Map<ControlGroup, ControlField[]>()
  for (const field of fields) {
    const group = fieldGroup(field)
    const list = buckets.get(group)
    if (list) list.push(field)
    else buckets.set(group, [field])
  }
  return groupOrder.flatMap((group) => {
    const list = buckets.get(group)
    if (!list) return []
    return [{ group, fields: group === "文字" ? textContentFirst(list) : list }]
  })
}

function initialValue(field: ControlField): ControlValue | undefined {
  if (field.control.kind === "colors") {
    if (field.control.follow) return undefined
    return [...field.control.value]
  }
  return field.control.value
}

function startValues(controls: readonly ControlField[]): ControlValues {
  return Object.fromEntries(controls.map((field) => [field.name, initialValue(field)]))
}

function concreteValue(field: ControlField): ControlValue {
  if (field.control.kind === "colors") return [...field.control.value]
  if (field.control.kind === "color") return field.control.value ?? "#000000"
  return field.control.value
}

function initialConcrete(controls: readonly ControlField[]) {
  const values: Record<string, ControlValue> = {}
  for (const field of controls) {
    if (field.control.kind === "color" || field.control.kind === "colors") {
      values[field.name] = concreteValue(field)
    }
  }
  return values
}

function definedProps(values: ControlValues) {
  const props: Record<string, ControlValue> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) props[key] = value
  }
  return props
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
  return !sameValue(baseline, value)
}

function sameValue(left: ControlValue, right: ControlValue) {
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => item === right[index])
  }
  return Object.is(left, right)
}

function comparableDefault(field: ControlField): ControlValue | undefined {
  const raw = field.defaultValue?.trim()
  if (raw === undefined || raw.length === 0) return undefined
  if (field.control.kind === "colors") return parseColorList(raw)
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

function parseColorList(raw: string): string[] | undefined {
  if (!raw.startsWith("[")) return undefined
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) return parsed
  } catch {
    return undefined
  }
  return undefined
}

function formatAttr(field: ControlField, value: ControlValue) {
  if (Array.isArray(value)) {
    return `${field.name}={[${value.map((item) => JSON.stringify(item)).join(", ")}]}`
  }
  if (typeof value === "number") {
    const step = field.control.kind === "range" ? field.control.step : undefined
    return `${field.name}={${formatNumber(value, step)}}`
  }
  if (typeof value === "boolean") return `${field.name}={${value}}`
  if (typeof value === "string" && /^[^"\\\n]*$/.test(value)) return `${field.name}="${value}"`
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

function snap(value: number, min: number, max: number, step: number | undefined) {
  const size = step && step > 0 ? step : 1
  const steps = Math.round((value - min) / size)
  const next = Math.min(max, Math.max(min, min + steps * size))
  const places = decimalPlaces(size)
  return places === 0 ? Math.round(next) : Number(next.toFixed(places))
}

function hexColor(raw: string) {
  const text = raw.trim().replace(/^#/, "")
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(text)) return null
  const digits = text.length === 3 ? [...text].map((char) => `${char}${char}`).join("") : text
  return `#${digits.toLowerCase()}`
}

export type { ControlField, ControlValue, ControlValues }
export {
  controlsAreGrouped,
  definedProps,
  formatNumber,
  formatSnippet,
  groupedFields,
  hexColor,
  initialConcrete,
  snap,
  startValues,
}
