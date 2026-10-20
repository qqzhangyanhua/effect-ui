import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const appDir = path.dirname(fileURLToPath(import.meta.url))
const registrySrc = path.join(appDir, "../../packages/registry/src")

function registryUiAliases() {
  const aliases: Record<string, string> = {}
  for (const dir of ["ui", "effects", "sections"]) {
    const abs = path.join(registrySrc, dir)
    if (!fs.existsSync(abs)) continue
    for (const file of fs.readdirSync(abs)) {
      if (!/\.(tsx|ts)$/.test(file) || file.includes(".test.")) continue
      const name = file.replace(/\.(tsx|ts)$/, "")
      const key = `@/components/ui/${name}`
      if (!aliases[key]) aliases[key] = path.relative(appDir, path.join(abs, file))
    }
  }
  return aliases
}

const uiAliases = registryUiAliases()

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(appDir, "../.."),
  serverExternalPackages: ["shiki"],
  turbopack: {
    resolveAlias: uiAliases,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...uiAliases,
    }
    return config
  },
  transpilePackages: [
    "@effect-ui/registry",
    "@paper-design/shaders-react",
    "@paper-design/shaders",
    "liquid-glass-react",
    "@base-ui/react",
    "@tanstack/react-virtual",
    "react-photo-album",
    "yet-another-react-lightbox",
    "react-phone-number-input",
    "frimousse",
    "wavesurfer.js",
    "matter-js",
    "ogl",
    "@vfx-js/core",
    "atropos",
    "rough-notation",
    "cobe",
  ],
}

export default nextConfig
