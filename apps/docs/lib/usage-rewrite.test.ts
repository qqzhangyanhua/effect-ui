import { expect, test } from "vitest"

import { rewriteControlledDemo } from "./usage-rewrite"

test("每个参数都有默认值时，改写成函数体内的常量", () => {
  const source = `export function TypingTextDemo({
  text = "把特效复制进你的项目",
  duration = 80,
}: {
  text?: string
  duration?: number
} = {}) {
  return <TypingText text={text} duration={duration} />
}
`
  const usage = rewriteControlledDemo(source)
  expect(usage).toContain('const text = "把特效复制进你的项目"')
  expect(usage).toContain("const duration = 80")
  expect(usage).toContain("export function TypingTextDemo()")
  expect(usage).toContain("text={text}")
})

test("没有默认值的参数不进入用法，对应的原样转发也删掉", () => {
  const source = `export function AuroraTextDemo({
  children = "极光标题",
  fontSize,
  speed,
}: {
  children?: string
  fontSize?: number
  speed?: number
} = {}) {
  return (
    <AuroraText className="text-4xl" fontSize={fontSize} speed={speed}>
      {children}
    </AuroraText>
  )
}
`
  const usage = rewriteControlledDemo(source)
  expect(usage).toContain('const children = "极光标题"')
  expect(usage).toContain("export function AuroraTextDemo()")
  expect(usage).not.toContain("fontSize")
  expect(usage).not.toContain("speed")
  expect(usage).toContain("{children}")
  expect(usage).toContain('className="text-4xl"')
})
