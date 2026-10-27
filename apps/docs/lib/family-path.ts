import type { ComponentCluster } from "@effect-ui/registry/catalog"

export type FamilyCluster = ComponentCluster

const familyPaths: Record<FamilyCluster, string> = {
  button: "/docs/buttons",
  input: "/docs/inputs",
  checkbox: "/docs/checkboxes",
  radio: "/docs/radios",
  select: "/docs/selects",
  textarea: "/docs/textareas",
}

export function familyPath(cluster: FamilyCluster): string {
  return familyPaths[cluster]
}

export function isFamilyCluster(key: string): key is FamilyCluster {
  return Object.prototype.hasOwnProperty.call(familyPaths, key)
}
