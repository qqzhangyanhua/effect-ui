import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const root = path.dirname(fileURLToPath(import.meta.url))
const registrySrc = path.join(root, "packages/registry/src")
const uiDirs = ["ui", "effects", "sections"] as const

function resolveRegistryUi(id: string) {
  const name = id.replace(/^@\/components\/ui\//, "")
  for (const dir of uiDirs) {
    for (const file of [
      path.join(registrySrc, dir, `${name}.tsx`),
      path.join(registrySrc, dir, `${name}.ts`),
      path.join(registrySrc, dir, name),
    ]) {
      if (fs.existsSync(file) && fs.statSync(file).isFile()) return file
    }
  }
  return path.join(registrySrc, "ui", name)
}

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  plugins: [
    {
      name: "registry-ui-alias",
      enforce: "pre",
      resolveId(id) {
        if (!id.startsWith("@/components/ui/")) return null
        return resolveRegistryUi(id)
      },
    },
  ],
  resolve: {
    alias: [
      { find: "@/lib/utils", replacement: path.join(registrySrc, "lib/utils.ts") },
      { find: "@/lib/text-style", replacement: path.join(registrySrc, "lib/text-style.ts") },
      {
        find: /^@\/lib\/(.*)$/,
        replacement: `${path.join(root, "apps/docs/lib")}/$1`,
      },
      {
        find: /^@\/components\/(?!ui\/)(.*)$/,
        replacement: `${path.join(root, "apps/docs/components")}/$1`,
      },
      {
        find: /^@\/hooks\/(.*)$/,
        replacement: `${path.join(registrySrc, "hooks")}/$1`,
      },
    ],
  },
})
