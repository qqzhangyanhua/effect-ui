export const layers = ["primitive", "composite", "widget", "effect", "section", "template", "hook", "lib"] as const

export type Layer = (typeof layers)[number]

export const effectCategoryNames = [
  "text",
  "backgrounds",
  "cursor",
  "decor",
  "cards",
  "buttons",
  "micro",
  "loaders",
  "scroll",
  "showcase",
  "page",
  "navigation",
] as const

export type EffectCategoryName = (typeof effectCategoryNames)[number]

export const purposeGroups = ["form", "overlay", "navigation", "data", "layout", "feedback"] as const

export type PurposeGroup = (typeof purposeGroups)[number]

const effectCategoryNameSet = new Set<string>(effectCategoryNames)
const purposeGroupSet = new Set<string>(purposeGroups)
const componentLayers = new Set<Layer>(["primitive", "composite", "widget"])
const bareLayers = new Set<Layer>(["section", "template", "hook", "lib"])

export interface LayerSource {
  type?: string
  layer?: string
  effectCategory?: string
  purposeGroup?: string
}

export type LayerFields =
  | { layer: "effect"; effectCategory: EffectCategoryName; purposeGroup?: never }
  | { layer: "primitive" | "composite" | "widget"; purposeGroup: PurposeGroup; effectCategory?: never }
  | { layer: "section" | "template" | "hook" | "lib"; effectCategory?: never; purposeGroup?: never }

export function declaredLayer(entry: LayerSource): Layer | undefined {
  if (typeof entry.layer !== "string") return undefined
  return layers.includes(entry.layer as Layer) ? (entry.layer as Layer) : undefined
}

export function resolveLayer(entry: LayerSource): Layer | undefined {
  return declaredLayer(entry)
}

export function owesEffectChecks(entry: LayerSource): boolean {
  return resolveLayer(entry) === "effect"
}

/** Effect、Primitive、Composite component、Widget、Section、Hook、Lib 要测试。Template 不要。 */
export function owesComponentTest(entry: LayerSource): boolean {
  const layer = declaredLayer(entry)
  if (!layer) return false
  return layer !== "template"
}

export function layerGroupError(entry: LayerSource): string | undefined {
  if (typeof entry.layer === "string" && !layers.includes(entry.layer as Layer)) {
    return `Layer “${entry.layer}” 不是 Primitive、Composite component、Widget、Effect、Section、Template、Hook、Lib 之一。`
  }
  const layer = declaredLayer(entry)
  if (!layer) {
    if (entry.effectCategory !== undefined || entry.purposeGroup !== undefined) {
      return "写了第二层分组，但没有声明 Layer。"
    }
    return undefined
  }
  const effectCategory = typeof entry.effectCategory === "string" ? entry.effectCategory : undefined
  const purposeGroup = typeof entry.purposeGroup === "string" ? entry.purposeGroup : undefined
  if (layer === "effect") {
    if (!effectCategory) return "Effect 必须带 Effect category。"
    if (!effectCategoryNameSet.has(effectCategory)) return `Effect category “${effectCategory}” 不在十二个效果分类里。`
    if (purposeGroup) return "Effect 不能带 Purpose group。"
    return undefined
  }
  if (componentLayers.has(layer)) {
    if (!purposeGroup) return "Primitive、Composite component、Widget 必须带 Purpose group。"
    if (!purposeGroupSet.has(purposeGroup)) return `Purpose group “${purposeGroup}” 不在 form、overlay、navigation、data、layout、feedback 里。`
    if (effectCategory) return "Primitive、Composite component、Widget 不能带 Effect category。"
    return undefined
  }
  if (bareLayers.has(layer) && (effectCategory || purposeGroup)) {
    return "Section、Template、Hook、Lib 不带第二层分组。"
  }
  return undefined
}
