export type FamilyCluster = "button" | "input"

export function familyPath(cluster: FamilyCluster): string {
  return cluster === "button" ? "/docs/buttons" : "/docs/inputs"
}
