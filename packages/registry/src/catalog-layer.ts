import { effectCategories } from "./prop-vocabulary"
import { unclassifiedCatalogNames } from "./unclassified-catalog"

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
  category?: string
  type?: string
  layer?: string
  effectCategory?: string
  purposeGroup?: string
}

export type LayerFields =
  | { layer?: undefined; effectCategory?: undefined; purposeGroup?: undefined }
  | { layer: "effect"; effectCategory: EffectCategoryName; purposeGroup?: undefined }
  | { layer: "primitive" | "composite" | "widget"; purposeGroup: PurposeGroup; effectCategory?: undefined }
  | { layer: "section" | "template" | "hook" | "lib"; effectCategory?: undefined; purposeGroup?: undefined }

export function declaredLayer(entry: LayerSource): Layer | undefined {
  if (typeof entry.layer !== "string") return undefined
  return layers.includes(entry.layer as Layer) ? (entry.layer as Layer) : undefined
}

/** 没写 Layer 时，按旧分类和 registry 类型推导。hook、lib 优先于 category。 */
export function derivedLayer(entry: LayerSource): Layer | undefined {
  if (entry.type === "registry:hook") return "hook"
  if (entry.type === "registry:lib") return "lib"
  const category = entry.category
  if (typeof category !== "string") return undefined
  if (effectCategories.has(category)) return "effect"
  if (category === "ui") return "primitive"
  if (category === "utility" || category === "ai") return "widget"
  if (category === "sections") return "section"
  if (category === "templates") return "template"
  return undefined
}

export function resolveLayer(entry: LayerSource): Layer | undefined {
  return declaredLayer(entry) ?? derivedLayer(entry)
}

export function owesEffectChecks(entry: LayerSource): boolean {
  return resolveLayer(entry) === "effect"
}

/**
 * 显式 Layer 按新规则。没写 Layer 的条目保持原来的检查义务：
 * Effect 分类、ui、utility、sections 要测试；ai 和 templates 不要。
 * hook、lib 目前挂在 ui 下，所以推导之后仍然要测试。
 */
export function owesComponentTest(entry: LayerSource): boolean {
  const declared = declaredLayer(entry)
  if (declared === "template" || declared === "hook" || declared === "lib") return false
  if (
    declared === "effect" ||
    declared === "primitive" ||
    declared === "composite" ||
    declared === "widget" ||
    declared === "section"
  ) {
    return true
  }
  if (entry.category === "ai") return false
  const layer = derivedLayer(entry)
  if (layer === "hook" || layer === "lib") return entry.category === "ui"
  return layer === "effect" || layer === "primitive" || layer === "widget" || layer === "section"
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

export function unclassifiedLayerIssue(entry: LayerSource & { name: string }): { type: "missing-layer" | "stale-unclassified"; description: string } | undefined {
  if (layerGroupError(entry)) return undefined
  if (declaredLayer(entry)) {
    if (!unclassifiedCatalogNames.has(entry.name)) return undefined
    return {
      type: "stale-unclassified",
      description: "已经声明 Layer，应从尚未分类名单里删掉。",
    }
  }
  if (unclassifiedCatalogNames.has(entry.name)) return undefined
  return {
    type: "missing-layer",
    description: "新组件必须显式声明 Layer。尚未分类名单里的旧条目仍按旧分类推导。",
  }
}
