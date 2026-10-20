import { expect, test } from "vitest"

import { auditRegistry, type AuditCatalogEntry } from "./audit"
import { buildRegistry, buildRegistryItem } from "./registry-item"

const source = `export interface ButtonProps {
  className?: string
  speed?: number
  variant?: string
  delay?: number
  config?: unknown
}

export function Button() {
  return null
}
`

function entry(overrides: Partial<AuditCatalogEntry> = {}): AuditCatalogEntry {
  return {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "按钮。",
    file: "ui/button.tsx",
    target: "components/ui/button.tsx",
    props: [{ name: "className" }],
    ...overrides,
  }
}

interface FixtureInput {
  catalog: readonly AuditCatalogEntry[]
  readSource: (file: string) => string | undefined
  sourceFiles: readonly string[]
  demoNames: string[]
  readme: string
  staticJson: {
    indexes: { label: string; json: unknown }[]
    items: Record<string, unknown>
  }
  packageDependencies: string[]
}

const generatedFrom = () => source

function consistent(
  catalog: readonly AuditCatalogEntry[],
  sourceFiles: readonly string[] = catalog.map((item) => item.file),
): FixtureInput {
  return {
    catalog,
    readSource: (file: string) => (sourceFiles.includes(file) ? source : undefined),
    sourceFiles,
    demoNames: catalog
      .filter((item) => item.type === "registry:ui")
      .map((item) => item.name),
    readme: catalog.map((item) => item.name).join(" · "),
    staticJson: {
      indexes: [{ label: "registry.json", json: buildRegistry(catalog, generatedFrom) }],
      items: Object.fromEntries(
        catalog.map((item) => [item.name, buildRegistryItem(item, generatedFrom)]),
      ),
    },
    packageDependencies: [],
  }
}

function withSource(
  catalog: readonly AuditCatalogEntry[],
  sources: Readonly<Record<string, string>>,
  packageDependencies: string[] = [],
): FixtureInput {
  const input = consistent(catalog)
  input.readSource = (file) => sources[file]
  input.packageDependencies = packageDependencies
  input.staticJson = {
    indexes: [{ label: "registry.json", json: buildRegistry(catalog, (file) => sources[file]) }],
    items: Object.fromEntries(
      catalog.map((item) => [item.name, buildRegistryItem(item, (file) => sources[file])]),
    ),
  }
  return input
}

function utilsEntry(): AuditCatalogEntry {
  return entry({
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "cn 辅助函数。",
    file: "lib/utils.ts",
    target: "lib/utils.ts",
    props: [],
  })
}

const buttonJson = {
  $schema: "https://ui.shadcn.com/schema/registry-item.json",
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "按钮。",
  dependencies: [],
  registryDependencies: [],
  files: [
    {
      path: "registry/ui/button.tsx",
      type: "registry:ui",
      target: "components/ui/button.tsx",
      content: source,
    },
  ],
}

const buttonIndexJson = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "effect-ui",
  homepage: "https://github.com/qqzhangyanhua/effect-ui",
  items: [
    {
      name: "button",
      type: "registry:ui",
      title: "Button",
      description: "按钮。",
      dependencies: [],
      registryDependencies: [],
      files: [
        {
          path: "registry/ui/button.tsx",
          type: "registry:ui",
          target: "components/ui/button.tsx",
        },
      ],
    },
  ],
}

test("catalog 出现重名时报告该名称和次数", () => {
  const button = entry()
  expect(auditRegistry(consistent([button, button]))).toEqual([
    {
      name: "button",
      type: "duplicate-name",
      description: "catalog 中名称 “button” 出现了 2 次。",
    },
  ])
})

test("catalog 名称唯一时不报告重名", () => {
  expect(auditRegistry(consistent([entry(), entry({ name: "input", file: "ui/input.tsx", title: "Input" })]))).toEqual([])
})

test("catalog 登记的源码文件不在文件清单中时报告缺失", () => {
  expect(auditRegistry(consistent([entry()], []))).toEqual([
    {
      name: "button",
      type: "missing-source",
      description: "源码文件 ui/button.tsx 不存在。",
    },
  ])
})

test("catalog 登记的源码文件存在时不报告缺失", () => {
  expect(auditRegistry(consistent([entry()]))).toEqual([])
})

test("组件源码文件未登记到 catalog 时报告未登记", () => {
  expect(
    auditRegistry(consistent([entry()], ["ui/button.tsx", "hooks/use-mobile.ts"])),
  ).toEqual([
    {
      name: "use-mobile",
      type: "unregistered-source",
      description: "源码文件 hooks/use-mobile.ts 未登记到 catalog。",
    },
  ])
})

test("examples、catalog 和测试文件未登记时不报告未登记", () => {
  expect(
    auditRegistry(
      consistent(
        [entry()],
        [
          "ui/button.tsx",
          "examples/ui-demos.tsx",
          "catalog.ts",
          "registry-item.test.ts",
          "ui/button.test.tsx",
        ],
      ),
    ),
  ).toEqual([])
})

test("文档组件缺少 demo 时报告缺失", () => {
  const input = consistent([entry()])
  input.demoNames = []
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "missing-demo",
      description: "缺少 demo。",
    },
  ])
})

test("文档组件有 demo 时不报告缺失", () => {
  expect(auditRegistry(consistent([entry()])).filter((issue) => issue.type === "missing-demo")).toEqual([])
})

test("registry:lib 没有 demo、Props 为空时不报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          name: "utils",
          type: "registry:lib",
          title: "Utils",
          description: "cn 辅助函数。",
          file: "lib/utils.ts",
          target: "lib/utils.ts",
          props: [],
        }),
      ]),
    ),
  ).toEqual([])
})

test("registry:hook 没有 demo、Props 为空时不报告", () => {
  const input = consistent([
    entry({
      name: "use-mobile",
      type: "registry:hook",
      title: "Use Mobile",
      description: "视口宽度小于 768px 时返回 true。",
      file: "hooks/use-mobile.ts",
      target: "hooks/use-mobile.ts",
      props: [],
    }),
  ])
  input.demoNames = []
  expect(auditRegistry(input)).toEqual([])
})

test("组件静态 JSON 缺失时报告缺失", () => {
  const input = consistent([entry()])
  delete input.staticJson.items.button
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "missing-static-json",
      description: "静态 JSON button.json 缺失。",
    },
  ])
})

test("registry 总表缺失时报告缺失", () => {
  const input = consistent([entry()])
  input.staticJson.indexes = [{ label: "registry.json", json: undefined }]
  expect(auditRegistry(input)).toEqual([
    {
      name: "registry",
      type: "missing-static-json",
      description: "静态 JSON registry.json 缺失。",
    },
  ])
})

test("静态 JSON 与构建器输出不一致时指出差异字段", () => {
  const input = consistent([entry()])
  input.staticJson.items.button = { ...buttonJson, title: "Wrong" }
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "stale-static-json",
      description: "静态 JSON button.json 与构建器输出不一致：title。",
    },
  ])
})

test("registry 总表与构建器输出不一致时指出差异字段", () => {
  const input = consistent([entry()])
  input.staticJson.indexes = [
    { label: "registry.json", json: { ...buttonIndexJson, name: "wrong" } },
  ]
  expect(auditRegistry(input)).toEqual([
    {
      name: "registry",
      type: "stale-static-json",
      description: "静态 JSON registry.json 与构建器输出不一致：name。",
    },
  ])
})

test("手写的静态 JSON 与构建器字段一致时不报告缺失或过期", () => {
  const input = consistent([entry()])
  input.staticJson.items.button = buttonJson
  input.staticJson.indexes = [{ label: "registry.json", json: buttonIndexJson }]
  expect(auditRegistry(input)).toEqual([])
})

test("README 没有组件名时报告缺失", () => {
  const input = consistent([entry()])
  input.readme = "没有组件清单"
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "missing-readme",
      description: "README 中未出现组件名 button。",
    },
  ])
})

test("组件名只出现在其他连字符名称中时仍报告 README 缺失", () => {
  const card = entry({ name: "card", title: "Card", file: "ui/card.tsx" })
  const input = consistent([card])
  input.readme = "spotlight-card"
  expect(auditRegistry(input)).toEqual([
    {
      name: "card",
      type: "missing-readme",
      description: "README 中未出现组件名 card。",
    },
  ])
})

test("README 以独立名称提到组件时不报告缺失", () => {
  const card = entry({ name: "card", title: "Card", file: "ui/card.tsx" })
  const input = consistent([card])
  input.readme = "button · card · spotlight-card"
  expect(auditRegistry(input)).toEqual([])
})

test("文档组件 Props 为空时报告", () => {
  expect(auditRegistry(consistent([entry({ props: [] })]))).toEqual([
    {
      name: "button",
      type: "empty-props",
      description: "Props 文档为空。",
    },
  ])
})

test("源码引用的 npm 包不在 registry 包依赖清单中时报告", () => {
  const input = withSource(
    [entry()],
    {
      "ui/button.tsx":
        'import { z } from "zod"\nexport interface ButtonProps {\n  className?: string\n}\nexport function Button() {\n  return z\n}\n',
    },
    [],
  )
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "missing-package-dependency",
      description: "npm 包 “zod” 未出现在 registry 包的依赖清单中。",
    },
  ])
})

test("extraDependencies 不在 registry 包依赖清单中时报告", () => {
  const input = withSource(
    [entry({ extraDependencies: ["@tiptap/pm"] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  className?: string\n}\nexport function Button() {\n  return null\n}\n",
    },
    [],
  )
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "missing-package-dependency",
      description: "npm 包 “@tiptap/pm” 未出现在 registry 包的依赖清单中。",
    },
  ])
})

test("源码引用了 catalog 中不存在的 registry 组件时报告", () => {
  const input = withSource([entry()], {
    "ui/button.tsx":
      'import { Widget } from "@/components/ui/missing-widget"\nexport interface ButtonProps {\n  className?: string\n}\nexport function Button() {\n  return Widget\n}\n',
  })
  expect(auditRegistry(input)).toEqual([
    {
      name: "button",
      type: "unknown-registry-dependency",
      description: "源码引用了 registry 组件 “missing-widget”，但 catalog 中没有这个组件。",
    },
  ])
})

test("源码缺失时只报告缺失，不比较总表", () => {
  const input = consistent([entry(), entry({ name: "input", title: "Input", file: "ui/input.tsx" })], [
    "ui/button.tsx",
  ])
  expect(auditRegistry(input)).toEqual([
    {
      name: "input",
      type: "missing-source",
      description: "源码文件 ui/input.tsx 不存在。",
    },
  ])
})

test("使用 useId 但没有 use client 时不报告", () => {
  const input = withSource(
    [
      entry({
        name: "grid-pattern",
        title: "Grid Pattern",
        file: "effects/grid-pattern.tsx",
        target: "components/ui/grid-pattern.tsx",
      }),
      utilsEntry(),
    ],
    {
      "effects/grid-pattern.tsx":
        'import * as React from "react"\nimport { createPortal } from "react-dom"\nimport { cn } from "@/lib/utils"\nexport function GridPattern({ className }: { className?: string }) {\n  const id = React.useId()\n  return createPortal(id, document.body)\n}\n',
      "lib/utils.ts": "export function cn() {\n  return \"\"\n}\n",
    },
  )
  expect(auditRegistry(input)).toEqual([])
})

test("控件起始值在范围内且属于选项时不报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          props: [
            { name: "speed", control: { kind: "range", value: 2, min: 0, max: 2 } },
            { name: "variant", control: { kind: "select", value: "mesh", options: ["mesh", "warp"] } },
          ],
        }),
      ]),
    ),
  ).toEqual([])
})

test("range 控件起始值超出 min 或 max 时报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          props: [{ name: "speed", control: { kind: "range", value: 3, min: 0, max: 2 } }],
        }),
        entry({
          name: "input",
          file: "ui/input.tsx",
          title: "Input",
          props: [{ name: "delay", control: { kind: "range", value: -1, min: 0, max: 2 } }],
        }),
      ]),
    ),
  ).toEqual([
    {
      name: "button",
      type: "control-out-of-range",
      description: "控件 “speed” 的起始值 3 不在 0 到 2 之间。",
    },
    {
      name: "input",
      type: "control-out-of-range",
      description: "控件 “delay” 的起始值 -1 不在 0 到 2 之间。",
    },
  ])
})

test("range 或 select 控件字段类型不对时报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          props: [{ name: "speed", control: { kind: "range", value: "3", min: 0, max: 2 } }],
        }),
        entry({
          name: "input",
          file: "ui/input.tsx",
          title: "Input",
          props: [{ name: "variant", control: { kind: "select", value: "mesh", options: ["mesh", 1] } }],
        }),
      ]),
    ),
  ).toEqual([
    {
      name: "button",
      type: "control-out-of-range",
      description: "控件 “speed” 的 range 起始值、最小值或最大值不是数字。",
    },
    {
      name: "input",
      type: "control-out-of-range",
      description: "控件 “variant” 的 select 起始值或可选项不是字符串。",
    },
  ])
})

test("PropDoc 名字出现在导出的 Props 类型里时不报告", () => {
  const input = withSource(
    [entry({ props: [{ name: "speed" }] })],
    { "ui/button.tsx": "export interface ButtonProps {\n  speed?: number\n}\n" },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-type")).toEqual([])
})

test("PropDoc 名字不在导出的 Props 类型里时报告", () => {
  const input = withSource(
    [entry({ props: [{ name: "speed" }, { name: "glow" }] })],
    { "ui/button.tsx": "export interface ButtonProps {\n  speed?: number\n}\n" },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-type")).toEqual([
    {
      name: "button",
      type: "prop-not-in-type",
      description: "Prop “glow” 没有出现在导出的 Props 类型中。",
    },
  ])
})

test("继承 HTML 属性时，未写在类型正文里的 className 不报告", () => {
  const input = withSource(
    [entry({ props: [{ name: "className" }, { name: "intensity" }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {\n  intensity?: number\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-type")).toEqual([])
})

test("select 控件起始值不在选项中时报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          props: [
            { name: "variant", control: { kind: "select", value: "nope", options: ["mesh", "warp"] } },
          ],
        }),
      ]),
    ),
  ).toEqual([
    {
      name: "button",
      type: "control-out-of-range",
      description: "控件 “variant” 的起始值 “nope” 不在可选项中。",
    },
  ])
})
