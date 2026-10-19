import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { auditRegistry, type AuditInput, type AuditStaticJson } from "./audit"
import { auditExceptions } from "./audit-exceptions"
import { components } from "./catalog"
import { demoNames } from "./examples/index"

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

function repoInput(exceptions: AuditInput["exceptions"]): AuditInput {
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
    exceptions,
  }
}

test("examples 导出 demo 映射的键名，审计可以直接导入", () => {
  expect(demoNames).toContain("button")
  expect(demoNames).not.toContain("utils")
})

test("未套用例外时，当前仓库只报告 use-mobile 未登记", () => {
  expect(auditRegistry(repoInput([]))).toEqual([
    {
      name: "use-mobile",
      type: "unregistered-source",
      description: "源码文件 hooks/use-mobile.ts 未登记到 catalog。",
    },
  ])
})

test("use-mobile 临时例外写明原因，套用后仓库结构审计没有问题", () => {
  expect(auditExceptions).toEqual([
    {
      name: "use-mobile",
      type: "unregistered-source",
      reason:
        "hooks/use-mobile.ts 尚未登记。依赖检查会把它登记为 registry:hook，此前临时例外。",
    },
  ])
  expect(auditRegistry(repoInput(auditExceptions))).toEqual([])
})
