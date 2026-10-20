import { expect, test } from "vitest"

import { buildRegistry, buildRegistryItem } from "./registry-item"

const buttonSource =
  'import { Slot } from "@radix-ui/react-slot"\nimport { cva } from "class-variance-authority"\nimport { cn } from "@/lib/utils"\n\nexport function Button() {\n  return null\n}\n'
const utilsSource =
  'import { clsx } from "clsx"\nimport { twMerge } from "tailwind-merge"\n\nexport function cn() {\n  return ""\n}\n'

const sources: Record<string, string> = {
  "ui/button.tsx": buttonSource,
  "lib/utils.ts": utilsSource,
}
const readSource = (file: string) => sources[file]

const button = {
  name: "button",
  type: "registry:ui",
  title: "Button",
  description: "支持多种变体与尺寸的按钮。",
  file: "ui/button.tsx",
  target: "components/ui/button.tsx",
}

const utils = {
  name: "utils",
  type: "registry:lib",
  title: "Utils",
  description: "clsx + tailwind-merge 的 cn 辅助函数。",
  file: "lib/utils.ts",
  target: "lib/utils.ts",
}

test("单个 registry item 包含 shadcn schema 字段，依赖从源码推导，源码放进 files.content", () => {
  expect(buildRegistryItem(button, readSource)).toEqual({
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "支持多种变体与尺寸的按钮。",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["utils"],
    files: [
      {
        path: "registry/ui/button.tsx",
        type: "registry:ui",
        target: "components/ui/button.tsx",
        content: buttonSource,
      },
    ],
  })
})

test("registry 总表包含 shadcn schema 字段和推导出的依赖，文件条目不含源码", () => {
  expect(buildRegistry([utils, button], readSource)).toEqual({
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "effect-ui",
    homepage: "https://github.com/qqzhangyanhua/effect-ui",
    items: [
      {
        name: "utils",
        type: "registry:lib",
        title: "Utils",
        description: "clsx + tailwind-merge 的 cn 辅助函数。",
        dependencies: ["clsx", "tailwind-merge"],
        registryDependencies: [],
        files: [
          {
            path: "registry/lib/utils.ts",
            type: "registry:lib",
            target: "lib/utils.ts",
          },
        ],
      },
      {
        name: "button",
        type: "registry:ui",
        title: "Button",
        description: "支持多种变体与尺寸的按钮。",
        dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
        registryDependencies: ["utils"],
        files: [
          {
            path: "registry/ui/button.tsx",
            type: "registry:ui",
            target: "components/ui/button.tsx",
          },
        ],
      },
    ],
  })
})

test("多文件 registry item 按 files 顺序输出源码，依赖合并且不含同 item 的文件", () => {
  const templateSources: Record<string, string> = {
    "templates/saas/page.tsx":
      'import { content } from "./content"\nimport { theme } from "./theme"\nimport { Button } from "@/components/ui/button"\n',
    "templates/saas/content.ts": 'import type { LucideIcon } from "lucide-react"\n',
    "templates/saas/theme.ts": "export const theme = {}\n",
  }
  const template = {
    name: "saas-template",
    type: "registry:block",
    title: "SaaS Template",
    description: "多文件模板。",
    file: "templates/saas/page.tsx",
    target: "app/saas/page.tsx",
    files: [
      { file: "templates/saas/page.tsx", type: "registry:page", target: "app/saas/page.tsx" },
      { file: "templates/saas/content.ts", type: "registry:file", target: "app/saas/content.ts" },
      { file: "templates/saas/theme.ts", type: "registry:file", target: "app/saas/theme.ts" },
    ],
  }

  const item = buildRegistryItem(template, (file) => templateSources[file])
  expect(item.dependencies).toEqual(["lucide-react"])
  expect(item.registryDependencies).toEqual(["button"])
  expect(item.files.map((file) => [file.path, file.content])).toEqual([
    ["registry/templates/saas/page.tsx", templateSources["templates/saas/page.tsx"]],
    ["registry/templates/saas/content.ts", templateSources["templates/saas/content.ts"]],
    ["registry/templates/saas/theme.ts", templateSources["templates/saas/theme.ts"]],
  ])
})

test("extraDependencies 并入 npm 依赖，总表与单个 item 一致", () => {
  const editor = { ...button, name: "rich-text-editor", extraDependencies: ["@tiptap/pm"] }
  const expected = ["@radix-ui/react-slot", "@tiptap/pm", "class-variance-authority"]
  expect(buildRegistryItem(editor, readSource).dependencies).toEqual(expected)
  expect(buildRegistry([editor], readSource).items[0]?.dependencies).toEqual(expected)
})

test("源码文件缺失时抛错，不输出空内容", () => {
  const missing = () => undefined
  expect(() => buildRegistryItem(button, missing)).toThrow("registry item “button” 的源码文件 ui/button.tsx 不存在。")
  expect(() => buildRegistry([button], missing)).toThrow("ui/button.tsx")
})
