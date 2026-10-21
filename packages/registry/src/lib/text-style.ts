import type { CSSProperties } from "react"

export type TextAlign = "left" | "center" | "right"

/** 只在传入时写内联样式。都不传时返回 undefined，沿用组件原来的 class。 */
export function textStyle(
  style: CSSProperties | undefined,
  fontSize: number | undefined,
  fontWeight: number | undefined,
  letterSpacing: number | undefined,
  align: TextAlign | undefined,
): CSSProperties | undefined {
  const next: CSSProperties = style === undefined ? {} : { ...style }
  if (fontSize !== undefined) next.fontSize = fontSize
  if (fontWeight !== undefined) next.fontWeight = fontWeight
  if (letterSpacing !== undefined) next.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) {
    next.textAlign = align
    next.justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    next.justifyItems = align === "left" ? "start" : align === "right" ? "end" : "center"
  }
  return Object.keys(next).length > 0 ? next : undefined
}
