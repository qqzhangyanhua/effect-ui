import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { expect, test } from "vitest"

import { auditRegistry, type AuditInput, type AuditStaticJson } from "./audit"
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
  expect(demoNames).toContain("button")
  expect(demoNames).not.toContain("utils")
  expect(demoNames).not.toContain("use-mobile")
})

test("use-mobile 以 registry:hook 安装到 hooks 目录", () => {
  expect(component("use-mobile")).toMatchObject({
    type: "registry:hook",
    file: "hooks/use-mobile.ts",
    target: "hooks/use-mobile.ts",
  })
})

test("sidebar、input-group、toggle-group 的依赖从源码推导", () => {
  expect(builtItem("sidebar").registryDependencies).toEqual([
    "button",
    "separator",
    "sheet",
    "use-mobile",
    "utils",
  ])
  expect(builtItem("input-group").registryDependencies).toEqual([
    "button",
    "input",
    "textarea",
    "utils",
  ])
  expect(builtItem("toggle-group").dependencies).toEqual([
    "@radix-ui/react-toggle-group",
    "class-variance-authority",
  ])
})

test("rich-text-editor 保留源码未引用的 peer 依赖 @tiptap/pm", () => {
  expect(builtItem("rich-text-editor").dependencies).toContain("@tiptap/pm")
})

test("仓库审计没有问题", () => {
  expect(auditRegistry(repoInput())).toEqual([])
})
