import { expect, test } from "vitest"

import { readUsageExample } from "./usage"

const gradientTextUsage = `import { GradientText } from "@/components/ui/gradient-text"

export function GradientTextDemo() {
  return (
    <GradientText className="text-4xl font-semibold tracking-tight">
      Effect UI
    </GradientText>
  )
}
`

test("无参 demo 的用法代码与改写前一致", () => {
  expect(readUsageExample("gradient-text")).toBe(gradientTextUsage)
})

test("单行带默认值的 demo 被改写成常量", () => {
  const usage = readUsageExample("shimmer-text")
  expect(usage).toMatch(/export function ShimmerTextDemo\(\) \{/)
  expect(usage).toContain('const children = "扫光文字即将上线"')
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
  expect(textAt).toBeGreaterThan(-1)
  expect(durationAt).toBeGreaterThan(textAt)
  expect(loopAt).toBeGreaterThan(durationAt)
  expect(cursorAt).toBeGreaterThan(loopAt)
  expect(usage).toMatch(/export function TypingTextDemo\(\) \{/)
  expect(usage).not.toMatch(/TypingTextDemo\s*\(\s*\{/)
  expect(usage).not.toContain("values")
  expect(usage).not.toContain("= {}")
  expect(usage).not.toContain("Partial<")
})
