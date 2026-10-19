export interface RegistryCatalogEntry {
  name: string
  type: string
  title: string
  description: string
  dependencies: readonly string[]
  registryDependencies: readonly string[]
  file: string
  target: string
}

export interface RegistryItemJson {
  $schema: "https://ui.shadcn.com/schema/registry-item.json"
  name: string
  type: string
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: Array<{
    path: string
    type: string
    target: string
    content: string
  }>
}

export interface RegistryJson {
  $schema: "https://ui.shadcn.com/schema/registry.json"
  name: "effect-ui"
  homepage: "https://github.com/qqzhangyanhua/effect-ui"
  items: Array<{
    name: string
    type: string
    title: string
    description: string
    dependencies: string[]
    registryDependencies: string[]
    files: Array<{
      path: string
      type: string
      target: string
    }>
  }>
}

export function buildRegistry(
  entries: readonly RegistryCatalogEntry[],
): RegistryJson {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "effect-ui",
    homepage: "https://github.com/qqzhangyanhua/effect-ui",
    items: entries.map((entry) => ({
      name: entry.name,
      type: entry.type,
      title: entry.title,
      description: entry.description,
      dependencies: [...entry.dependencies],
      registryDependencies: [...entry.registryDependencies],
      files: [
        {
          path: `registry/${entry.file}`,
          type: entry.type,
          target: entry.target,
        },
      ],
    })),
  }
}

export function buildRegistryItem(
  entry: RegistryCatalogEntry,
  content: string,
): RegistryItemJson {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.name,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    dependencies: [...entry.dependencies],
    registryDependencies: [...entry.registryDependencies],
    files: [
      {
        path: `registry/${entry.file}`,
        type: entry.type,
        target: entry.target,
        content,
      },
    ],
  }
}
