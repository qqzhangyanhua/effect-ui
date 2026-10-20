export interface RegistrySourceFile {
  file: string
  type: string
  target: string
}

export interface RegistryCatalogEntry {
  name: string
  type: string
  title: string
  description: string
  dependencies: readonly string[]
  registryDependencies: readonly string[]
  file: string
  target: string
  files?: readonly RegistrySourceFile[]
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

export function registryFiles(entry: RegistryCatalogEntry): RegistrySourceFile[] {
  if (entry.files && entry.files.length > 0) return [...entry.files]
  return [{ file: entry.file, type: entry.type, target: entry.target }]
}

function fileContents(entry: RegistryCatalogEntry, content: string | Readonly<Record<string, string>>) {
  if (typeof content === "string") return { [entry.file]: content }
  return content
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
      files: registryFiles(entry).map((file) => ({
        path: `registry/${file.file}`,
        type: file.type,
        target: file.target,
      })),
    })),
  }
}

export function buildRegistryItem(
  entry: RegistryCatalogEntry,
  content: string | Readonly<Record<string, string>>,
): RegistryItemJson {
  const contents = fileContents(entry, content)
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.name,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    dependencies: [...entry.dependencies],
    registryDependencies: [...entry.registryDependencies],
    files: registryFiles(entry).map((file) => ({
      path: `registry/${file.file}`,
      type: file.type,
      target: file.target,
      content: contents[file.file] ?? "",
    })),
  }
}
