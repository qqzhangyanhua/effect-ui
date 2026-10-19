import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { components } from "../packages/registry/src/catalog.ts"
import {
  buildRegistry,
  buildRegistryItem,
} from "../packages/registry/src/registry-item.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const registrySrc = path.join(root, "packages/registry/src")
const publicDir = path.join(root, "apps/docs/public/r")

fs.mkdirSync(publicDir, { recursive: true })

const registryJson = `${JSON.stringify(buildRegistry(components), null, 2)}\n`
fs.writeFileSync(path.join(root, "registry.json"), registryJson)
fs.writeFileSync(path.join(publicDir, "registry.json"), registryJson)

for (const item of components) {
  const content = fs.readFileSync(path.join(registrySrc, item.file), "utf8")
  fs.writeFileSync(
    path.join(publicDir, `${item.name}.json`),
    `${JSON.stringify(buildRegistryItem(item, content), null, 2)}\n`,
  )
}

console.log(`Wrote ${components.length} registry items`)

