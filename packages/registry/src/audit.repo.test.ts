import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { auditRegistry, type AuditInput, type AuditStaticJson } from "./audit"
import { auditExemptions } from "./audit-exemptions"
import { components } from "./catalog"
import { demoNames } from "./examples/index"
import { buildRegistryItem } from "./registry-item"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const registrySrc = path.join(repoRoot, "packages/registry/src")

function listFiles(dir: string, prefix = ""): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...listFiles(path.join(dir, entry.name), rel))
    else files.push(rel)
  }
  return files
}

function readJson(file: string): unknown {
  return JSON.parse(fs.readFileSync(file, "utf8"))
}

function staticJson(): AuditStaticJson {
  const publicDir = path.join(repoRoot, "apps/docs/public/r")
  const items: Record<string, unknown> = {}
  for (const file of fs.readdirSync(publicDir)) {
    if (!file.endsWith(".json") || file === "registry.json") continue
    items[file.slice(0, -".json".length)] = readJson(path.join(publicDir, file))
  }
  const index = (label: string) => {
    const abs = path.join(repoRoot, label)
    return {
      label,
      json: fs.existsSync(abs) ? readJson(abs) : undefined,
    }
  }
  return {
    indexes: [index("registry.json"), index("apps/docs/public/r/registry.json")],
    items,
  }
}

function repoInput(): AuditInput {
  const packageJson = readJson(path.join(repoRoot, "packages/registry/package.json")) as {
    dependencies?: Record<string, string>
  }
  return {
    catalog: components,
    readSource: (file) => {
      const abs = path.join(registrySrc, file)
      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : undefined
    },
    sourceFiles: listFiles(registrySrc),
    demoNames,
    readme: fs.readFileSync(path.join(repoRoot, "README.md"), "utf8"),
    staticJson: staticJson(),
    packageDependencies: Object.keys(packageJson.dependencies ?? {}),
    exemptions: auditExemptions,
  }
}

function component(name: string) {
  const item = components.find((entry) => entry.name === name)
  if (!item) throw new Error(`catalog 缺少 ${name}`)
  return item
}

function builtItem(name: string) {
  return buildRegistryItem(component(name), (file) => fs.readFileSync(path.join(registrySrc, file), "utf8"))
}

test("examples 导出 demo 映射的键名，审计可以直接导入", () => {
  expect(demoNames).toContain("aurora-background")
  expect(demoNames).not.toContain("utils")
  expect(demoNames).not.toContain("use-mobile")
})

test("仓库审计没有问题", () => {
  expect(auditRegistry(repoInput())).toEqual([])
})

test("缺减弱动效已经清零，静态组件不写这条豁免", () => {
  const held = auditExemptions.filter((entry) => entry.gaps.includes("缺减弱动效") || entry.reason === "无动画")
  expect(held).toEqual([])
  expect(auditRegistry(repoInput()).filter((issue) => issue.type === "missing-reduced-motion")).toEqual([])
})

test("control-not-in-demo 和 prop-not-in-catalog 可以按 catalog 条目查看", () => {
  const names = new Set(components.map((entry) => entry.name))
  for (const issue of auditRegistry(repoInput())) {
    if (issue.type !== "control-not-in-demo" && issue.type !== "prop-not-in-catalog") continue
    expect(names.has(issue.name)).toBe(true)
  }
})

test("真实 catalog 里的 Effect 用词汇表里的词时，类型、控件和分组一致", () => {
  expect(auditRegistry(repoInput()).filter((issue) => issue.type === "vocabulary-mismatch")).toEqual([])
})

