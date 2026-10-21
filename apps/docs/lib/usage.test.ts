import { expect, test } from "vitest"

import { readUsageExample } from "./usage"

const gradientTextUsage = `import { GradientText } from "@/components/ui/gradient-text"

export function GradientTextDemo() {
  const children = "流动渐变"
  const colors = "from-violet-500 via-fuchsia-500 to-cyan-400"
  const delay = 0
  const loop = true
  const interactive = false
  const fontSize = 48
  const fontWeight = 700
  const letterSpacing = 0
  const align = "center"

  return (
    <GradientText
      className="text-4xl font-semibold tracking-tight"
      colors={colors}
      delay={delay}
      loop={loop}
      interactive={interactive}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    >
      {children}
    </GradientText>
  )
}
`

test("无参 demo 的用法代码与改写前一致", () => {
  expect(readUsageExample("gradient-text")).toBe(gradientTextUsage)
})

test("单行带默认值的 demo 被改写成常量", () => {
  const usage = readUsageExample("shimmer-text")
  const childrenAt = usage.indexOf('const children = "扫光文字即将上线"')
  const fontSizeAt = usage.indexOf("const fontSize = 48")
  const fontWeightAt = usage.indexOf("const fontWeight = 600")
  const letterSpacingAt = usage.indexOf("const letterSpacing = 0")
  const alignAt = usage.indexOf('const align = "left"')
  expect(usage).toMatch(/export function ShimmerTextDemo\(\) \{/)
  expect(usage).toContain('const children = "扫光文字即将上线"')
  expect(childrenAt).toBeGreaterThan(-1)
  expect(fontSizeAt).toBeGreaterThan(childrenAt)
  expect(fontWeightAt).toBeGreaterThan(fontSizeAt)
  expect(letterSpacingAt).toBeGreaterThan(fontWeightAt)
  expect(alignAt).toBeGreaterThan(letterSpacingAt)
  expect(usage).toContain("fontSize={fontSize}")
  expect(usage).toContain("fontWeight={fontWeight}")
  expect(usage).toContain("letterSpacing={letterSpacing}")
  expect(usage).toContain("align={align}")
  expect(usage).toContain("{children}")
  expect(usage).not.toMatch(/ShimmerTextDemo\s*\(\s*\{/)
  expect(usage).not.toContain("values")
  expect(usage).not.toContain("= {}")
})

test("多行解构、类型标注和默认空对象被改写成常量", () => {
  const usage = readUsageExample("typing-text")
  const textAt = usage.indexOf('const text = "把特效复制进你的项目"')
  const durationAt = usage.indexOf("const duration = 80")
  const loopAt = usage.indexOf("const loop = true")
  const cursorAt = usage.indexOf("const cursor = true")
  const delayAt = usage.indexOf("const delay = 0")
  const interactiveAt = usage.indexOf("const interactive = false")
  const fontSizeAt = usage.indexOf("const fontSize = 32")
  const fontWeightAt = usage.indexOf("const fontWeight = 500")
  const letterSpacingAt = usage.indexOf("const letterSpacing = 0")
  const alignAt = usage.indexOf('const align = "left"')
  expect(textAt).toBeGreaterThan(-1)
  expect(durationAt).toBeGreaterThan(textAt)
  expect(loopAt).toBeGreaterThan(durationAt)
  expect(cursorAt).toBeGreaterThan(loopAt)
  expect(delayAt).toBeGreaterThan(cursorAt)
  expect(interactiveAt).toBeGreaterThan(delayAt)
  expect(fontSizeAt).toBeGreaterThan(interactiveAt)
  expect(fontWeightAt).toBeGreaterThan(fontSizeAt)
  expect(letterSpacingAt).toBeGreaterThan(fontWeightAt)
  expect(alignAt).toBeGreaterThan(letterSpacingAt)
  expect(usage).toContain("delay={delay}")
  expect(usage).toContain("interactive={interactive}")
  expect(usage).toContain("fontSize={fontSize}")
  expect(usage).toContain("align={align}")
  expect(usage).toMatch(/export function TypingTextDemo\(\) \{/)
  expect(usage).not.toMatch(/TypingTextDemo\s*\(\s*\{/)
  expect(usage).not.toContain("values")
  expect(usage).not.toContain("= {}")
  expect(usage).not.toContain("Partial<")
})
