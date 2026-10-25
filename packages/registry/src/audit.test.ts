import { expect, test } from "vitest"

import { auditRegistry, type AuditCatalogEntry } from "./audit"
import { buildRegistry, buildRegistryItem } from "./registry-item"
import { unclassifiedCatalogNames } from "./unclassified-catalog"

const listed = [...unclassifiedCatalogNames]
const fixture = listed[0]
const fixtureInput = listed[1]
const fixtureCard = listed[2]
const fixtureHook = listed[3]
const fixtureGrid = listed[4]
if (
  fixture === undefined ||
  fixtureInput === undefined ||
  fixtureCard === undefined ||
  fixtureHook === undefined ||
  fixtureGrid === undefined
) {
  throw new Error("尚未分类名单不够审计夹具使用。")
}

const source = `interface ButtonProps {
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
    name: fixture,
    type: "registry:ui",
    title: "Button",
    description: "按钮。",
    batch: 1,
    file: "ui/button.tsx",
    target: "components/ui/button.tsx",
    props: [{ name: "className" }],
    ...overrides,
  }
}

/** 源码里的 Demo 仍叫 ButtonDemo，所以这条夹具名字保持 button。template 只用来避开已声明的 Layer。 */
function buttonEntry(overrides: Partial<AuditCatalogEntry> = {}): AuditCatalogEntry {
  return entry({ name: "button", layer: "template", ...overrides })
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
    layer: "template",
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
  name: fixture,
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
      name: fixture,
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
      name: fixture,
      type: "duplicate-name",
      description: `catalog 中名称 “${fixture}” 出现了 2 次。`,
    },
  ])
})

test("catalog 名称唯一时不报告重名", () => {
  expect(auditRegistry(consistent([entry(), entry({ name: fixtureInput, file: "ui/input.tsx", title: "Input" })]))).toEqual([])
})

test("catalog 登记的源码文件不在文件清单中时报告缺失", () => {
  expect(auditRegistry(consistent([entry()], []))).toEqual([
    {
      name: fixture,
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
      name: fixture,
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
      name: fixtureHook,
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
  delete input.staticJson.items[fixture]
  expect(auditRegistry(input)).toEqual([
    {
      name: fixture,
      type: "missing-static-json",
      description: `静态 JSON ${fixture}.json 缺失。`,
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
  input.staticJson.items[fixture] = { ...buttonJson, title: "Wrong" }
  expect(auditRegistry(input)).toEqual([
    {
      name: fixture,
      type: "stale-static-json",
      description: `静态 JSON ${fixture}.json 与构建器输出不一致：title。`,
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
  input.staticJson.items[fixture] = buttonJson
  input.staticJson.indexes = [{ label: "registry.json", json: buttonIndexJson }]
  expect(auditRegistry(input)).toEqual([])
})

test("README 没有组件名时报告缺失", () => {
  const input = consistent([entry()])
  input.readme = "没有组件清单"
  expect(auditRegistry(input)).toEqual([
    {
      name: fixture,
      type: "missing-readme",
      description: `README 中未出现组件名 ${fixture}。`,
    },
  ])
})

test("组件名只出现在其他连字符名称中时仍报告 README 缺失", () => {
  const card = entry({ name: fixtureCard, title: "Card", file: "ui/card.tsx" })
  const input = consistent([card])
  input.readme = `spotlight-${fixtureCard}`
  expect(auditRegistry(input)).toEqual([
    {
      name: fixtureCard,
      type: "missing-readme",
      description: `README 中未出现组件名 ${fixtureCard}。`,
    },
  ])
})

test("README 以独立名称提到组件时不报告缺失", () => {
  const card = entry({ name: fixtureCard, title: "Card", file: "ui/card.tsx" })
  const input = consistent([card])
  input.readme = `button · ${fixtureCard} · spotlight-${fixtureCard}`
  expect(auditRegistry(input)).toEqual([])
})

test("文档组件 Props 为空时报告", () => {
  expect(auditRegistry(consistent([entry({ props: [] })]))).toEqual([
    {
      name: fixture,
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
      name: fixture,
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
      name: fixture,
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
      name: fixture,
      type: "unknown-registry-dependency",
      description: "源码引用了 registry 组件 “missing-widget”，但 catalog 中没有这个组件。",
    },
  ])
})

test("源码缺失时只报告缺失，不比较总表", () => {
  const input = consistent([entry(), entry({ name: fixtureInput, title: "Input", file: "ui/input.tsx" })], [
    "ui/button.tsx",
  ])
  expect(auditRegistry(input)).toEqual([
    {
      name: fixtureInput,
      type: "missing-source",
      description: "源码文件 ui/input.tsx 不存在。",
    },
  ])
})

test("使用 useId 但没有 use client 时不报告", () => {
  const input = withSource(
    [
      entry({
        name: fixtureGrid,
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
          name: fixtureInput,
          file: "ui/input.tsx",
          title: "Input",
          props: [{ name: "delay", control: { kind: "range", value: -1, min: 0, max: 2 } }],
        }),
      ]),
    ),
  ).toEqual([
    {
      name: fixture,
      type: "control-out-of-range",
      description: "控件 “speed” 的起始值 3 不在 0 到 2 之间。",
    },
    {
      name: fixtureInput,
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
          name: fixtureInput,
          file: "ui/input.tsx",
          title: "Input",
          props: [{ name: "variant", control: { kind: "select", value: "mesh", options: ["mesh", 1] } }],
        }),
      ]),
    ),
  ).toEqual([
    {
      name: fixture,
      type: "control-out-of-range",
      description: "控件 “speed” 的 range 起始值、最小值或最大值不是数字。",
    },
    {
      name: fixtureInput,
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
      name: fixture,
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

test("Effect 用了词汇表里的词且类型、控件、分组一致时不报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props: [
            { name: "speed", type: "number", control: { kind: "range", value: 1, min: 0, max: 2 } },
            {
              name: "direction",
              type: '"up" | "down"',
              control: { kind: "select", value: "up", options: ["up", "down"] },
            },
          ],
        }),
      ]),
    ).filter((issue) => issue.type === "vocabulary-mismatch"),
  ).toEqual([])
})

test("词汇表里的词类型、控件种类或分组不一致时报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props: [
            { name: "speed", type: "string", control: { kind: "boolean", value: true, group: "外观" } },
          ],
        }),
      ]),
    ).filter((issue) => issue.type === "vocabulary-mismatch"),
  ).toEqual([
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "Prop “speed” 的类型是 string，词汇表要求 number。",
    },
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "控件 “speed” 的种类是 boolean，词汇表要求 range。",
    },
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "控件 “speed” 的分组是 外观，词汇表要求 动画。",
    },
  ])
})

test("词汇表取值的可选项超出允许值时报告，子集不报告", () => {
  const issues = auditRegistry(
    consistent([
      entry({
        category: "scroll",
        props: [
          {
            name: "direction",
            type: '"left" | "top"',
            control: { kind: "select", value: "left", options: ["left", "top"] },
          },
        ],
      }),
    ]),
  ).filter((issue) => issue.type === "vocabulary-mismatch")
  expect(issues).toEqual([
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "Prop “direction” 的类型是 \"left\" | \"top\"，词汇表要求 \"left\" | \"right\" | \"up\" | \"down\" 的子集。",
    },
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "控件 “direction” 的可选项 top 不在词汇表取值内。",
    },
  ])
})

test("词汇表 prop 的起始值越界仍按控件范围报告", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props: [{ name: "speed", type: "number", control: { kind: "range", value: 3, min: 0, max: 2 } }],
        }),
      ]),
    )
      .filter((issue) => issue.type === "control-out-of-range")
      .map((issue) => issue.type),
  ).toEqual(["control-out-of-range"])
})

test("非空豁免跳过词汇表检查，空豁免仍报告", () => {
  const exempt = auditRegistry(
    consistent([
      entry({
        category: "text",
        props: [{ name: "colors", type: "string", vocabularyExemption: "历史 prop 是 Tailwind 类字符串。" }],
      }),
    ]),
  ).filter((issue) => issue.type === "vocabulary-mismatch")
  expect(exempt).toEqual([])

  const blank = auditRegistry(
    consistent([
      entry({
        category: "text",
        props: [{ name: "colors", type: "string", vocabularyExemption: "  " }],
      }),
    ]),
  ).filter((issue) => issue.type === "vocabulary-mismatch")
  expect(blank).toEqual([
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "Prop “colors” 的词汇表豁免说明为空。",
    },
  ])
})

test("文字排版词使用像素、字重、字距和对齐", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props: [
            { name: "fontSize", type: "number", control: { kind: "range", value: 48, min: 16, max: 96, step: 1 } },
            { name: "fontWeight", type: "number", control: { kind: "range", value: 600, min: 100, max: 900, step: 100 } },
            {
              name: "letterSpacing",
              type: "number",
              control: { kind: "range", value: 0, min: -0.1, max: 0.5, step: 0.01 },
            },
            {
              name: "align",
              type: '"left" | "center"',
              control: { kind: "select", value: "left", options: ["left", "center"] },
            },
          ],
        }),
      ]),
    ).filter((issue) => issue.type === "vocabulary-mismatch"),
  ).toEqual([])

  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props: [{ name: "fontSize", type: "string", control: { kind: "text", value: "大" } }],
        }),
      ]),
    ).filter((issue) => issue.type === "vocabulary-mismatch"),
  ).toEqual([
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "Prop “fontSize” 的类型是 string，词汇表要求 number。",
    },
    {
      name: fixture,
      type: "vocabulary-mismatch",
      description: "控件 “fontSize” 的种类是 text，词汇表要求 range。",
    },
  ])
})

test("预设的值必须落在控件范围内", () => {
  const props = [
    { name: "fontSize", type: "number", control: { kind: "range", value: 48, min: 16, max: 96, step: 1 } },
    { name: "align", type: '"left" | "center" | "right"', control: { kind: "select", value: "left", options: ["left", "center", "right"] } },
  ]
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props,
          presets: [{ name: "display", label: "大标题", values: { fontSize: 64, align: "center" } }],
        }),
      ]),
    ).filter((issue) => issue.type === "preset-invalid"),
  ).toEqual([])

  expect(
    auditRegistry(
      consistent([
        entry({
          category: "text",
          props,
          presets: [{ name: "broken", label: "坏的", values: { fontSize: 200, align: "justify", className: "x" } }],
        }),
      ]),
    ).filter((issue) => issue.type === "preset-invalid"),
  ).toEqual([
    {
      name: fixture,
      type: "preset-invalid",
      description: "预设 “坏的” 的 fontSize 值 200 不在控件允许的范围内。",
    },
    {
      name: fixture,
      type: "preset-invalid",
      description: "预设 “坏的” 的 align 值 “justify” 不在控件允许的范围内。",
    },
    {
      name: fixture,
      type: "preset-invalid",
      description: "预设 “坏的” 引用了没有控件的 prop “className”。",
    },
  ])
})

test("基础组件用了同名词也不做词汇表检查", () => {
  expect(
    auditRegistry(
      consistent([
        entry({
          category: "ui",
          props: [{ name: "size", type: '"sm" | "md"', control: { kind: "select", value: "sm", options: ["sm", "md"] } }],
        }),
      ]),
    ).filter((issue) => issue.type === "vocabulary-mismatch"),
  ).toEqual([])
})

const ranged = { kind: "range", value: 1, min: 0, max: 2 }

test("带 Control 的 prop 被 Demo 接住并传给组件时不报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }, { name: "text", control: { kind: "text", value: "标题" } }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n  text?: string\n}\nexport function ButtonDemo({ speed, text }: { speed?: number; text?: string } = {}) {\n  return <Button speed={speed}>{text}</Button>\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([])
})

test("Control 不在 Demo 参数里时报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport function ButtonDemo() {\n  return <Button />\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([
    {
      name: "button",
      type: "control-not-in-demo",
      description: "控件 “speed” 不在 Demo 的参数里。",
    },
  ])
})

test("Control 在 Demo 参数里但没有传给组件时报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport function ButtonDemo({ speed }: { speed?: number } = {}) {\n  return <Button />\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([
    {
      name: "button",
      type: "control-not-in-demo",
      description: "控件 “speed” 在 Demo 参数里，但没有传给组件。",
    },
  ])
})

test("没有 Control 的 prop 不报 control-not-in-demo", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed" }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport function ButtonDemo() {\n  return <Button />\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([])
})

test("导出 Props 的自有字段已经写进 catalog 时不报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed" }] })],
    {
      "ui/button.tsx":
        "interface SharedProps {\n  glow?: boolean\n}\nexport interface ButtonState {\n  extra?: boolean\n}\nexport interface ButtonProps {\n  speed?: number\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-catalog")).toEqual([])
})

test("导出 Props 的自有字段没有写进 catalog 时报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed" }] })],
    {
      "ui/button.tsx":
        "export type ButtonProps = React.HTMLAttributes<HTMLDivElement> & {\n  speed?: number\n  autoSize?: boolean | { minRows?: number; maxRows?: number }\n  glow?: boolean\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-catalog")).toEqual([
    {
      name: "button",
      type: "prop-not-in-catalog",
      description: "Prop “autoSize” 没有写进 catalog 的 props。",
    },
    {
      name: "button",
      type: "prop-not-in-catalog",
      description: "Prop “glow” 没有写进 catalog 的 props。",
    },
  ])
})

test("HTML 属性和事件回调没有写进 catalog 时不报告", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed" }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  className?: string\n  \"aria-label\"?: string\n  onValueChange?: (value: string) => void\n  once?: boolean\n  glow?: boolean\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-catalog")).toEqual([
    {
      name: "button",
      type: "prop-not-in-catalog",
      description: "Prop “once” 没有写进 catalog 的 props。",
    },
    {
      name: "button",
      type: "prop-not-in-catalog",
      description: "Prop “glow” 没有写进 catalog 的 props。",
    },
  ])
})

test("测试文件和字符串里的 Demo 不会盖过 examples 里的 Demo", () => {
  const passing = "export function ButtonDemo({ speed }: { speed?: number } = {}) {\n  return <Button speed={speed} />\n}\n"
  const real = "export function ButtonDemo() {\n  return <Button />\n}\n"
  const component = "export interface ButtonProps {\n  speed?: number\n}\n"
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }] })],
    {
      "audit.test.ts": passing,
      "ui/button.tsx": `${component}${passing}`,
      "examples/ui-demos.tsx": `const sample = ${JSON.stringify(passing)}\n${real}`,
    },
  )
  input.sourceFiles = ["audit.test.ts", "ui/button.tsx", "examples/ui-demos.tsx"]
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([
    {
      name: "button",
      type: "control-not-in-demo",
      description: "控件 “speed” 不在 Demo 的参数里。",
    },
  ])

  input.sourceFiles = ["examples/ui-demos.tsx", "ui/button.tsx", "audit.test.ts"]
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([
    {
      name: "button",
      type: "control-not-in-demo",
      description: "控件 “speed” 不在 Demo 的参数里。",
    },
  ])
})

test("同名 Demo 没有 examples 来源时不采用先扫到的那份", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }] })],
    {
      "ui/other.tsx": "export function ButtonDemo() {\n  return <Button />\n}\n",
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport function ButtonDemo({ speed }: { speed?: number } = {}) {\n  return <Button speed={speed} />\n}\n",
    },
  )
  input.sourceFiles = ["ui/other.tsx", "ui/button.tsx"]
  expect(auditRegistry(input).filter((issue) => issue.type === "control-not-in-demo")).toEqual([])
})

test("表达式里的 JSX 属性和布尔简写算传给组件，对象简写不算", () => {
  const passed = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }, { name: "reverse", control: { kind: "boolean", value: true } }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n  reverse?: boolean\n}\nexport function ButtonDemo({ speed, reverse }: { speed?: number; reverse?: boolean } = {}) {\n  return (\n    <div>\n      {condition ? <Button speed={speed} /> : null}\n      {items.map(() => <Button reverse />)}\n      <span>x</span>\n      {speed}\n    </div>\n  )\n}\n",
    },
  )
  expect(auditRegistry(passed).filter((issue) => issue.type === "control-not-in-demo")).toEqual([])

  const shorthand = withSource(
    [buttonEntry({ props: [{ name: "speed", control: ranged }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport function ButtonDemo({ speed }: { speed?: number } = {}) {\n  const props = { speed }\n  return <Button>{{ speed }}</Button>\n}\n",
    },
  )
  expect(auditRegistry(shorthand).filter((issue) => issue.type === "control-not-in-demo")).toEqual([
    {
      name: "button",
      type: "control-not-in-demo",
      description: "控件 “speed” 在 Demo 参数里，但没有传给组件。",
    },
  ])
})

test("同一 registry 项导出的子组件 Props 算在这条 catalog 上", () => {
  const input = withSource(
    [buttonEntry({ props: [{ name: "speed" }] })],
    {
      "ui/button.tsx":
        "export interface ButtonProps {\n  speed?: number\n}\nexport interface IconProps {\n  glyph?: string\n}\n",
    },
  )
  expect(auditRegistry(input).filter((issue) => issue.type === "prop-not-in-catalog")).toEqual([
    {
      name: "button",
      type: "prop-not-in-catalog",
      description: "Prop “glyph” 没有写进 catalog 的 props。",
    },
  ])
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
      name: fixture,
      type: "control-out-of-range",
      description: "控件 “variant” 的起始值 “nope” 不在可选项中。",
    },
  ])
})
