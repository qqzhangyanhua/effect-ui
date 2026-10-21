import type { ControlPreset, PropDoc } from "./catalog"

export type TextAlign = "left" | "center" | "right"

export function textControls(start: {
  fontSize: number
  fontWeight?: number
  letterSpacing?: number
  align?: TextAlign
  /** 这个组件自己占着字重时不要再暴露 fontWeight。 */
  skipWeight?: boolean
}): PropDoc[] {
  const align = start.align ?? "left"
  const props: PropDoc[] = [
    {
      name: "fontSize",
      type: "number",
      description: "字号（像素）。不传则继承。",
      control: { kind: "range", value: start.fontSize, min: 12, max: 96, step: 1 },
    },
  ]
  if (start.skipWeight !== true) {
    props.push({
      name: "fontWeight",
      type: "number",
      description: "字重。不传则继承。",
      control: { kind: "range", value: start.fontWeight ?? 600, min: 100, max: 900, step: 100 },
    })
  }
  props.push(
    {
      name: "letterSpacing",
      type: "number",
      description: "字距（em）。不传则继承。",
      control: { kind: "range", value: start.letterSpacing ?? 0, min: -0.1, max: 0.5, step: 0.01 },
    },
    {
      name: "align",
      type: '"left" | "center" | "right"',
      description: "对齐。不传则不设置。",
      control: { kind: "select", value: align, options: ["left", "center", "right"] },
    },
  )
  return props
}

export function textPresets(
  id: string,
  key: string,
  rows: readonly {
    label: string
    content: string
    fontSize: number
    fontWeight?: number
    align: TextAlign
    extra?: Record<string, string | number | boolean>
  }[],
): ControlPreset[] {
  return rows.map((row, index) => ({
    name: `${id}-${index + 1}`,
    label: row.label,
    values: {
      [key]: row.content,
      fontSize: row.fontSize,
      ...(row.fontWeight === undefined ? {} : { fontWeight: row.fontWeight }),
      align: row.align,
      ...row.extra,
    },
  }))
}
