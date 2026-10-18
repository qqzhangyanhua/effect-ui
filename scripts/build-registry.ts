import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { components } from "../packages/registry/src/catalog.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const registrySrc = path.join(root, "packages/registry/src")
const publicDir = path.join(root, "apps/docs/public/r")

fs.mkdirSync(publicDir, { recursive: true })

const items = components.map((item) => {
  const sourcePath = path.join(registrySrc, item.file)
  const content = fs.readFileSync(sourcePath, "utf8")
  return {
    meta: item,
    content,
  }
})

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "effect-ui",
  homepage: "https://github.com/qqzhangyanhua/effect-ui",
  items: items.map(({ meta }) => ({
    name: meta.name,
    type: meta.type,
    title: meta.title,
    description: meta.description,
    dependencies: meta.dependencies,
    registryDependencies: meta.registryDependencies,
    files: [
      {
        path: `registry/${meta.file}`,
        type: meta.type,
        target: meta.target,
      },
    ],
  })),
}

fs.writeFileSync(
  path.join(root, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
)
fs.writeFileSync(
  path.join(publicDir, "registry.json"),
  `${JSON.stringify(registry, null, 2)}\n`,
)

for (const { meta, content } of items) {
  const payload = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: meta.name,
    type: meta.type,
    title: meta.title,
    description: meta.description,
    dependencies: meta.dependencies,
    registryDependencies: meta.registryDependencies,
    files: [
      {
        path: `registry/${meta.file}`,
        type: meta.type,
        target: meta.target,
        content,
      },
    ],
  }
  fs.writeFileSync(
    path.join(publicDir, `${meta.name}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
  )
}

console.log(`Wrote ${items.length} registry items`)
