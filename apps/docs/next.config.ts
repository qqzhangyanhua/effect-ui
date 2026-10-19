import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const appDir = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(appDir, "../.."),
  serverExternalPackages: ["shiki"],
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
  ],
}

export default nextConfig
