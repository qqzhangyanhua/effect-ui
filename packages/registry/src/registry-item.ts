import { deriveDependencies } from "./dependencies"

export interface RegistrySourceFile {
  file: string
  type: string
  target: string
}

/** 按 registry 源码路径读取文件内容；返回 undefined 表示文件不存在。 */
export type SourceReader = (file: string) => string | undefined

export interface RegistryCatalogEntry {
  name: string
  type: string
  title: string
  description: string
  extraDependencies?: readonly string[]
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

function readContents(entry: RegistryCatalogEntry, readSource: SourceReader): Record<string, string> {
  const contents: Record<string, string> = {}
  for (const file of registryFiles(entry)) {
    const content = readSource(file.file)
    if (content === undefined) {
      throw new Error(`registry item “${entry.name}” 的源码文件 ${file.file} 不存在。`)
    }
    contents[file.file] = content
  }
  return contents
}

export function buildRegistry(
  entries: readonly RegistryCatalogEntry[],
  readSource: SourceReader,
): RegistryJson {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "effect-ui",
    homepage: "https://github.com/qqzhangyanhua/effect-ui",
    items: entries.map((entry) => {
      const derived = deriveDependencies(readContents(entry, readSource), entry.extraDependencies)
      return {
        name: entry.name,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        dependencies: derived.dependencies,
        registryDependencies: derived.registryDependencies,
        files: registryFiles(entry).map((file) => ({
          path: `registry/${file.file}`,
          type: file.type,
          target: file.target,
        })),
      }
    }),
  }
}

export function buildRegistryItem(
  entry: RegistryCatalogEntry,
  readSource: SourceReader,
): RegistryItemJson {
  const contents = readContents(entry, readSource)
  const derived = deriveDependencies(contents, entry.extraDependencies)
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.name,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    dependencies: derived.dependencies,
    registryDependencies: derived.registryDependencies,
    files: registryFiles(entry).map((file) => ({
      path: `registry/${file.file}`,
      type: file.type,
      target: file.target,
      content: contents[file.file] ?? "",
    })),
  }
}
