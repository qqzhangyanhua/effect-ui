import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

const root = path.dirname(fileURLToPath(import.meta.url))
const registrySrc = path.join(root, "packages/registry/src")

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: [
      { find: "@/lib/utils", replacement: path.join(registrySrc, "lib/utils.ts") },
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: `${path.join(registrySrc, "ui")}/$1`,
      },
      {
        find: /^@\/hooks\/(.*)$/,
        replacement: `${path.join(registrySrc, "hooks")}/$1`,
      },
    ],
  },
})
