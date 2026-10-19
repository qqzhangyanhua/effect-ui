import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const appDir = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(appDir, "../.."),
  transpilePackages: [
    "@effect-ui/registry",
    "@paper-design/shaders-react",
    "@paper-design/shaders",
    "liquid-glass-react",
  ],
}

export default nextConfig
