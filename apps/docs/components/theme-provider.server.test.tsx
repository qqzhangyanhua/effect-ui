// @vitest-environment node

import { renderToString } from "react-dom/server"
import { expect, test } from "vitest"

import { ThemeProvider } from "./theme-provider"

const javascriptTypes = new Set(["text/javascript", "application/javascript", "module"])

test("服务端渲染 ThemeProvider 时防闪烁脚本仍可执行", () => {
  expect("window" in globalThis).toBe(false)

  const html = renderToString(
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      内容
    </ThemeProvider>,
  )

  const script = executableThemeScript(html)
  expect(script.attrs).not.toContain("application/json")
  const type = scriptType(script.attrs)
  expect(type === undefined || javascriptTypes.has(type)).toBe(true)
  expect(script.body.trim().startsWith("(")).toBe(true)
  expect(script.body).toContain("localStorage")
})

function executableThemeScript(html: string) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
  const found = scripts.find((match) => (match[2] ?? "").includes("localStorage"))
  if (!found) {
    throw new Error(`服务端 HTML 里没有可执行的防闪烁脚本：${html}`)
  }
  return { attrs: found[1] ?? "", body: found[2] ?? "" }
}

function scriptType(attrs: string) {
  const match = /(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(attrs)
  return match?.[1] ?? match?.[2]
}
