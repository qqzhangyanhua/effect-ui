import { expect, test } from "vitest"

import { deriveDependencies } from "./dependencies"

function single(content: string, extra?: readonly string[]) {
  return deriveDependencies({ "ui/button.tsx": content }, extra)
}

test("npm 依赖取包名，子路径归到包，按字母排序", () => {
  expect(
    single(
      'import { motion } from "motion/react"\nimport { Slot } from "@radix-ui/react-slot"\nimport "zod"\n',
    ),
  ).toEqual({ dependencies: ["@radix-ui/react-slot", "motion", "zod"], registryDependencies: [] })
})

test("react 和 react-dom 不计入 npm 依赖", () => {
  expect(
    single('import * as React from "react"\nimport { createPortal } from "react-dom"\n').dependencies,
  ).toEqual([])
})

test("type-only import 计入 npm 依赖", () => {
  expect(single('import type { ZodType } from "zod"\n').dependencies).toEqual(["zod"])
})

test("动态 import() 计入 npm 依赖", () => {
  expect(single('export function load() {\n  return import("zod")\n}\n').dependencies).toEqual(["zod"])
})

test("export ... from 计入依赖", () => {
  expect(
    single('export { z } from "zod"\nexport * from "@/lib/utils"\nexport type { Foo } from "foo"\n'),
  ).toEqual({ dependencies: ["foo", "zod"], registryDependencies: ["utils"] })
})

test("registry 别名映射为同名 registry 依赖，按字母排序", () => {
  expect(
    single(
      'import { cn } from "@/lib/utils"\nimport { useIsMobile } from "@/hooks/use-mobile"\nimport { Button } from "@/components/ui/button-group"\n',
    ).registryDependencies,
  ).toEqual(["button-group", "use-mobile", "utils"])
})

test("单文件 item 的同目录相对引用映射为同名 registry 依赖", () => {
  expect(single('import { Input } from "./input"\n').registryDependencies).toEqual(["input"])
})

test("多文件 item 合并各文件的依赖，同 item 的文件不算 registry 依赖", () => {
  expect(
    deriveDependencies({
      "templates/saas/page.tsx":
        'import { content } from "./content"\nimport { theme } from "./theme"\nimport { Button } from "@/components/ui/button"\n',
      "templates/saas/content.ts": 'import type { LucideIcon } from "lucide-react"\n',
      "templates/saas/theme.ts": 'import { cn } from "@/lib/utils"\n',
    }),
  ).toEqual({ dependencies: ["lucide-react"], registryDependencies: ["button", "utils"] })
})

test("注释和字符串里的 import 不计入依赖", () => {
  expect(
    single('// import { a } from "zod"\n/* import "motion" */\nconst text = \'import x from "shiki"\'\n'),
  ).toEqual({ dependencies: [], registryDependencies: [] })
})

test("extraDependencies 与推导出的 npm 依赖合并、去重后排序", () => {
  expect(
    single('import { useEditor } from "@tiptap/react"\n', ["@tiptap/pm", "@tiptap/react"]).dependencies,
  ).toEqual(["@tiptap/pm", "@tiptap/react"])
})
