import fs from "node:fs"
import path from "node:path"

export function readRegistrySource(file: string): string {
  const sourcePath = path.join(
    process.cwd(),
    "../../packages/registry/src",
    file,
  )
  return fs.readFileSync(sourcePath, "utf8")
}

const productionSiteUrl = "https://effect-ui.dev"

export function getRegistryBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_REGISTRY_URL?.trim().replace(/\/$/, "")
  return configured ? configured : productionSiteUrl
}
