import fs from "node:fs"

import { expect, test } from "vitest"

import { auditRegistry, type AuditCatalogEntry, type AuditInput } from "./audit"
import { buildRegistry, buildRegistryItem } from "./registry-item"

const source = "export function Widget() { return null }\n"

function widget(overrides: Partial<AuditCatalogEntry> = {}): AuditCatalogEntry {
  return {
    name: "widget",
    type: "registry:ui",
    title: "Widget",
    description: "示例。",
    category: "text",
    file: "effects/widget.tsx",
    target: "components/ui/widget.tsx",
    props: [{ name: "className" }],
    ...overrides,
  }
}

function input(
  catalog: readonly AuditCatalogEntry[],
  extras: { tests?: Record<string, string>; exemptions?: AuditInput["exemptions"] } = {},
): AuditInput {
  const sources: Record<string, string> = {}
  for (const entry of catalog) sources[entry.file] = source
  return {
    catalog,
    readSource: (file) => sources[file] ?? extras.tests?.[file],
    sourceFiles: [...Object.keys(sources), ...Object.keys(extras.tests ?? {})],
    demoNames: catalog.map((entry) => entry.name),
    readme: catalog.map((entry) => entry.name).join(" "),
    staticJson: {
      indexes: [{ label: "registry.json", json: buildRegistry(catalog, () => source) }],
      items: Object.fromEntries(catalog.map((entry) => [entry.name, buildRegistryItem(entry, () => source)])),
    },
    packageDependencies: [],
    exemptions: extras.exemptions ?? [],
  }
}

function ofType(catalog: readonly AuditCatalogEntry[], extras: Parameters<typeof input>[1], type: string) {
  return auditRegistry(input(catalog, extras))
    .filter((issue) => issue.type === type)
    .map((issue) => issue.name)
}

test("Effect 没有测试导入时报缺测试，导入之后不报", () => {
  expect(ofType([widget()], {}, "missing-test")).toEqual(["widget"])
  expect(
    ofType([widget()], { tests: { "effects/widget.test.tsx": 'import { Widget } from "./widget"\n' } }, "missing-test"),
  ).toEqual([])
})

test("别的目录里的测试导入也算数", () => {
  expect(
    ofType(
      [widget({ category: "ui", file: "ui/widget.tsx" })],
      { tests: { "effects/batch.test.tsx": 'import { Widget } from "../ui/widget"\n' } },
      "missing-test",
    ),
  ).toEqual([])
})

test("模板不要求测试", () => {
  expect(ofType([widget({ category: "templates" })], {}, "missing-test")).toEqual([])
})

test("豁免名单里的缺测试不报，别的缺失项压不住这条规则", () => {
  const listed = [{ name: "widget", gaps: ["缺测试"], reason: "落地前已有缺口" }]
  expect(ofType([widget()], { exemptions: listed }, "missing-test")).toEqual([])
  expect(
    ofType([widget()], { exemptions: [{ name: "widget", gaps: ["控件不足"], reason: "还没做控件" }] }, "missing-test"),
  ).toEqual(["widget"])
})

test("已经有测试仍写着缺测试时报告过期豁免", () => {
  expect(
    ofType(
      [widget()],
      {
        tests: { "effects/widget.test.tsx": 'import { Widget } from "./widget"\n' },
        exemptions: [{ name: "widget", gaps: ["缺测试"], reason: "落地前已有缺口" }],
      },
      "stale-exemption",
    ),
  ).toEqual(["widget"])
})

test("未知名字、Batch 34 以后的组件、不合法条目分别报错，并且不能压掉缺测试", () => {
  const closed = widget({ name: "hue-wave-loader", file: "effects/hue-wave-loader.tsx" })
  const exemptions = [
    { name: "missing-widget", gaps: ["缺测试"], reason: "不存在" },
    { name: "hue-wave-loader", gaps: ["缺测试"], reason: "新组件" },
    { name: "widget", gaps: [], reason: "没有缺失项" },
    { name: "widget", gaps: ["缺测试"], reason: "   " },
    { name: "", gaps: ["随便"], reason: "坏的" },
  ]
  const issues = auditRegistry(input([widget(), closed], { exemptions }))
  expect(issues.filter((issue) => issue.type === "unknown-exemption").map((issue) => issue.name)).toEqual([
    "missing-widget",
  ])
  expect(issues.filter((issue) => issue.type === "closed-batch-exemption").map((issue) => issue.name)).toEqual([
    "hue-wave-loader",
  ])
  expect(issues.filter((issue) => issue.type === "invalid-exemption")).toHaveLength(3)
  expect(issues.filter((issue) => issue.type === "missing-test").map((issue) => issue.name).sort()).toEqual([
    "hue-wave-loader",
    "widget",
  ])
})

test("Batch 34 及以后的 catalog 批次都算进豁免分界", () => {
  const catalog = fs.readFileSync(new URL("./catalog.ts", import.meta.url), "utf8")
  const boundary = fs.readFileSync(new URL("./audit-coverage.ts", import.meta.url), "utf8")
  const closed = [...catalog.matchAll(/import \{ (batch(\d+)Components) \}/g)]
    .filter((match) => Number(match[2]) >= 34)
    .map((match) => match[1])
  expect(closed.length).toBeGreaterThan(0)
  for (const name of closed) {
    expect(name).toBeTruthy()
    expect(boundary).toContain(name ?? "")
  }
})
