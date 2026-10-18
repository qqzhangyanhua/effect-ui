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

export function getRegistryBaseUrl(): string {
  return process.env.NEXT_PUBLIC_REGISTRY_URL ?? "https://github.com/qqzhangyanhua/effect-ui"
}
