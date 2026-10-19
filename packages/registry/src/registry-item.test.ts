import { expect, test } from "vitest"

import { buildRegistry, buildRegistryItem } from "./registry-item"

const source = 'import { cn } from "@/lib/utils"\n\nexport function Button() {\n  return null\n}\n'

test("单个 registry item 包含 shadcn schema 字段，并把调用方传入的源码放进 files.content", () => {
  const entry = {
    name: "button",
    type: "registry:ui",
    title: "Button",
    description: "支持多种变体与尺寸的按钮。",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["utils"],
    file: "ui/button.tsx",
    target: "components/ui/button.tsx",
    category: "ui",
    props: [],
  }

  expect(buildRegistryItem(entry, source)).toEqual({
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
        content: source,
      },
    ],
  })
})

test("registry 总表包含 shadcn schema 字段，文件条目不含源码", () => {
  expect(
    buildRegistry([
      {
        name: "utils",
        type: "registry:lib",
        title: "Utils",
        description: "clsx + tailwind-merge 的 cn 辅助函数。",
        dependencies: ["clsx", "tailwind-merge"],
        registryDependencies: [],
        file: "lib/utils.ts",
        target: "lib/utils.ts",
      },
      {
        name: "button",
        type: "registry:ui",
        title: "Button",
        description: "支持多种变体与尺寸的按钮。",
        dependencies: [],
        registryDependencies: ["utils"],
        file: "ui/button.tsx",
        target: "components/ui/button.tsx",
      },
    ]),
  ).toEqual({
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
        dependencies: [],
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
