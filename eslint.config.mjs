import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const config = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/node_modules/**",
    "apps/docs/public/r/**",
  ]),
  {
    settings: {
      next: {
        rootDir: "apps/docs",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
])

export default config
