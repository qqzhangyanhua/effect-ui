import {
  effectCategoryNames,
  purposeGroups,
  resolveLayer,
  type EffectCategoryName,
  type Layer,
  type LayerFields,
  type PurposeGroup,
} from "./catalog-layer"
import { componentOrder } from "./catalog-order"
import { primitiveFormComponents } from "./catalog-primitive-form"
import { primitiveOverlayComponents } from "./catalog-primitive-overlay"
import { primitiveNavigationComponents } from "./catalog-primitive-navigation"
import { primitiveDataComponents } from "./catalog-primitive-data"
import { primitiveLayoutComponents } from "./catalog-primitive-layout"
import { primitiveFeedbackComponents } from "./catalog-primitive-feedback"
import { compositeFormComponents } from "./catalog-composite-form"
import { compositeOverlayComponents } from "./catalog-composite-overlay"
import { compositeDataComponents } from "./catalog-composite-data"
import { compositeFeedbackComponents } from "./catalog-composite-feedback"
import { widgetFormComponents } from "./catalog-widget-form"
import { widgetOverlayComponents } from "./catalog-widget-overlay"
import { widgetNavigationComponents } from "./catalog-widget-navigation"
import { widgetDataComponents } from "./catalog-widget-data"
import { widgetLayoutComponents } from "./catalog-widget-layout"
import { widgetFeedbackComponents } from "./catalog-widget-feedback"
import { effectTextComponents } from "./catalog-effect-text"
import { effectBackgroundsComponents } from "./catalog-effect-backgrounds"
import { effectCursorComponents } from "./catalog-effect-cursor"
import { effectDecorComponents } from "./catalog-effect-decor"
import { effectCardsComponents } from "./catalog-effect-cards"
import { effectButtonsComponents } from "./catalog-effect-buttons"
import { effectMicroComponents } from "./catalog-effect-micro"
import { effectLoadersComponents } from "./catalog-effect-loaders"
import { effectScrollComponents } from "./catalog-effect-scroll"
import { effectShowcaseComponents } from "./catalog-effect-showcase"
import { effectPageComponents } from "./catalog-effect-page"
import { effectNavigationComponents } from "./catalog-effect-navigation"
import { sectionComponents } from "./catalog-section"
import { templateComponents } from "./catalog-template"
import { hookComponents } from "./catalog-hook"
import { libComponents } from "./catalog-lib"
import type { VocabularyGroup } from "./prop-vocabulary"

export { resolveLayer }

export type SourceLibrary =
  | "shadcn/ui"
  | "Magic UI"
  | "Animata"
  | "Motion Primitives"
  | "Cult UI"
  | "Fancy Components"
  | "shadcn-ui-expansions"
  | "Kibo UI"
  | "SyntaxUI"
  | "Origin UI"
  | "Paper Shaders"
  | "Number Flow"
  | "liquid-glass-react"
  | "prompt-kit"
  | "Tailark"
  | "Eldora UI"
  | "Smooth UI"
  | "UI Layouts"
  | "shadcn-chat"
  | "TanStack Virtual"
  | "frimousse"
  | "Base UI"
  | "react-photo-album"
  | "yet-another-react-lightbox"
  | "react-phone-number-input"
  | "Codrops"
  | "matter-js"
  | "WebGL Fluid Simulation"
  | "vfx-js"
  | "OGL"
  | "pixel-canvas"
  | "Atropos"
  | "rough-notation"
  | "mo.js"
  | "cobe"
  | "Lenis"
  | "three"
  | "Tremor Raw"
  | "daisyUI"
  | "Uiverse"
  | "HyperUI"
  | "Meraki UI"
  | "Flowbite"
  | "Velora UI"
  | "Neobrutalism"
  | "Arc Library"
  | "ns-ui"
  | "AI Canvas"
  | "interior"
  | "beUI"
  | "uselayouts"
  | "Spell UI"
  | "Sera UI"
  | "HextaUI"
  | "Framekit UI"
  | "GodUI"
  | "Watermelon UI"
  | "MosaicUI"
  | "MicroKit"
  | "Keyframery"
  | "Amicro"
  | "original"

export type ControlGroup = VocabularyGroup

export type ControlDef =
  | { kind: "range"; value: number; min: number; max: number; step?: number; group?: ControlGroup }
  | { kind: "select"; value: string; options: readonly string[]; group?: ControlGroup }
  | { kind: "color"; value?: string; group?: ControlGroup }
  | { kind: "colors"; value: readonly string[]; follow?: boolean; group?: ControlGroup }
  | { kind: "boolean"; value: boolean; group?: ControlGroup }
  | { kind: "text"; value: string; group?: ControlGroup }

export type PresetValue = string | number | boolean | readonly string[]

export interface ControlPreset {
  name: string
  label: string
  values: Readonly<Record<string, PresetValue>>
}

export interface PropDoc {
  name: string
  type: string
  defaultValue?: string
  description: string
  /** 文档预览里读者可改的控件。`value` 是 demo 起始值，不是组件默认值。 */
  control?: ControlDef
  /**
   * 名字在参数词汇表里，但已发布的类型或取值不能改。
   * 非空说明会让 audit 跳过这个 prop 的词汇表一致性检查。
   */
  vocabularyExemption?: string
}

interface ComponentMetaBase {
  name: string
  /** 条目所在批次。主 catalog 里的早期条目是 1。不进 registry JSON。 */
  batch: number
  title: string
  description: string
  source: SourceLibrary
  type: "registry:ui" | "registry:lib" | "registry:hook" | "registry:block"
  files?: readonly { file: string; type: string; target: string }[]
  /** 源码没有 import、但安装时必须一起装的 npm 包，例如另一个依赖的 peer。其余依赖从源码推导。 */
  extraDependencies?: string[]
  /** 文档页预设。不进组件 props，也不进 registry JSON。 */
  presets?: readonly ControlPreset[]
  file: string
  target: string
  props: PropDoc[]
}

export type ComponentMeta = ComponentMetaBase & LayerFields

export const effectCategoryLabels: Record<EffectCategoryName, string> = {
  text: "文字动画",
  backgrounds: "背景",
  cursor: "光标 / 悬停",
  showcase: "展示 / 列表",
  decor: "装饰 / 庆祝",
  cards: "卡片 / 3D",
  buttons: "按钮特效",
  micro: "微交互",
  loaders: "加载",
  scroll: "滚动显现",
  navigation: "导航",
  page: "页面 / 转场",
}

export const purposeGroupLabels: Record<PurposeGroup, string> = {
  form: "表单",
  overlay: "浮层",
  navigation: "导航",
  data: "数据展示",
  layout: "布局",
  feedback: "反馈",
}

const layerLabels: Record<Layer, string> = {
  primitive: "Primitive",
  composite: "Composite component",
  widget: "Widget",
  effect: "Effect",
  section: "Section",
  template: "Template",
  hook: "Hook",
  lib: "Lib",
}

function isNamed<T extends string>(value: string | undefined, names: readonly T[]): value is T {
  return typeof value === "string" && (names as readonly string[]).includes(value)
}

function effectCategoryOf(item: ComponentMeta): EffectCategoryName | undefined {
  return isNamed(item.effectCategory, effectCategoryNames) ? item.effectCategory : undefined
}

function purposeGroupOf(item: ComponentMeta): PurposeGroup | undefined {
  return isNamed(item.purposeGroup, purposeGroups) ? item.purposeGroup : undefined
}

/** 条目页和家族页的徽标。Effect 再带上 Effect category。 */
export function layerBadges(item: ComponentMeta): readonly string[] {
  const layer = resolveLayer(item)
  if (!layer) return []
  const badges = [layerLabels[layer]]
  if (layer !== "effect") return badges
  const category = effectCategoryOf(item)
  return category ? [...badges, effectCategoryLabels[category]] : badges
}

export const sourceLibraryUrls: Record<SourceLibrary, string | null> = {
  "shadcn/ui": "https://ui.shadcn.com",
  "Magic UI": "https://magicui.design",
  Animata: "https://animata.design",
  "Motion Primitives": "https://motion-primitives.com",
  "Cult UI": "https://www.cult-ui.com",
  "Fancy Components": "https://www.fancycomponents.dev",
  "shadcn-ui-expansions": "https://github.com/hsuanyi-chou/shadcn-ui-expansions",
  "Kibo UI": "https://www.kibo-ui.com",
  SyntaxUI: "https://syntaxui.com",
  "Tremor Raw": "https://raw.tremor.so",
  daisyUI: "https://github.com/saadeghi/daisyui",
  Uiverse: "https://uiverse.io",
  HyperUI: "https://github.com/markmead/hyperui",
  "Meraki UI": "https://github.com/merakiuilabs/merakiui",
  Flowbite: "https://github.com/themesberg/flowbite",
  "Velora UI": "https://github.com/ColorlibHQ/velora-ui",
  Neobrutalism: "https://github.com/ekmas/neobrutalism-components",
  "Arc Library": "https://github.com/kuratlielia/arc-library",
  "ns-ui": "https://github.com/nikolas-sapa/ns-ui",
  "AI Canvas": "https://github.com/uiNerd16/aicanvas",
  interior: "https://github.com/ddoemonn/interior",
  beUI: "https://github.com/starc007/ui-components",
  uselayouts: "https://github.com/iurvish/uselayouts",
  "Spell UI": "https://github.com/xxtomm/spell-ui",
  "Sera UI": "https://github.com/seraui/seraui",
  HextaUI: "https://github.com/preetsuthar17/HextaUI",
  "Framekit UI": "https://github.com/Sid9022/framekit-ui",
  GodUI: "https://github.com/LucasBassetti/godui",
  "Watermelon UI": "https://github.com/WatermelonCorp/watermellon-registry",
  MosaicUI: "https://github.com/darshan-rajadhyaksha/mosaicui",
  MicroKit: "https://github.com/henriquegpb/microkit",
  Keyframery: "https://github.com/keyframery/keyframery",
  Amicro: "https://github.com/Subhan-code/Amicro--Micro-transitions-",
  "Origin UI": "https://coss.com/origin",
  "Paper Shaders": "https://shaders.paper.design",
  "Number Flow": "https://number-flow.barvian.me",
  "liquid-glass-react": "https://github.com/rdev/liquid-glass-react",
  "prompt-kit": "https://www.prompt-kit.com",
  Tailark: "https://tailark.com",
  "Eldora UI": "https://www.eldoraui.site",
  "Smooth UI": "https://smoothui.dev",
  "UI Layouts": "https://ui-layouts.com",
  "shadcn-chat": "https://github.com/jakobhoeg/shadcn-chat",
  "TanStack Virtual": "https://tanstack.com/virtual",
  frimousse: "https://frimousse.liveblocks.io",
  "Base UI": "https://base-ui.com",
  "react-photo-album": "https://react-photo-album.com",
  "yet-another-react-lightbox": "https://yet-another-react-lightbox.com",
  "react-phone-number-input": "https://catamphetamine.gitlab.io/react-phone-number-input/",
  Codrops: "https://github.com/codrops/OnScrollTypographyAnimations",
  "matter-js": "https://github.com/liabru/matter-js",
  "WebGL Fluid Simulation": "https://github.com/PavelDoGreat/WebGL-Fluid-Simulation",
  "vfx-js": "https://amagi.dev/vfx-js",
  OGL: "https://github.com/oframe/ogl",
  "pixel-canvas": "https://github.com/hexagoncircle/pixel-canvas",
  Atropos: "https://atroposjs.com",
  "rough-notation": "https://roughnotation.com",
  "mo.js": "https://mojs.github.io",
  cobe: "https://cobe.vercel.app",
  Lenis: "https://github.com/darkroomengineering/lenis",
  three: "https://threejs.org",
  original: null,
}

const entriesByName = new Map<string, ComponentMeta>()
for (const entry of [
  ...primitiveFormComponents,
  ...primitiveOverlayComponents,
  ...primitiveNavigationComponents,
  ...primitiveDataComponents,
  ...primitiveLayoutComponents,
  ...primitiveFeedbackComponents,
  ...compositeFormComponents,
  ...compositeOverlayComponents,
  ...compositeDataComponents,
  ...compositeFeedbackComponents,
  ...widgetFormComponents,
  ...widgetOverlayComponents,
  ...widgetNavigationComponents,
  ...widgetDataComponents,
  ...widgetLayoutComponents,
  ...widgetFeedbackComponents,
  ...effectTextComponents,
  ...effectBackgroundsComponents,
  ...effectCursorComponents,
  ...effectDecorComponents,
  ...effectCardsComponents,
  ...effectButtonsComponents,
  ...effectMicroComponents,
  ...effectLoadersComponents,
  ...effectScrollComponents,
  ...effectShowcaseComponents,
  ...effectPageComponents,
  ...effectNavigationComponents,
  ...sectionComponents,
  ...templateComponents,
  ...hookComponents,
  ...libComponents,
]) {
  if (entriesByName.has(entry.name)) throw new Error(`catalog 条目重名：${entry.name}`)
  entriesByName.set(entry.name, entry)
}

export const components: ComponentMeta[] = componentOrder.map((name) => {
  const entry = entriesByName.get(name)
  if (!entry) throw new Error(`catalog 顺序表里的 ${name} 没有条目`)
  return entry
})

if (components.length !== entriesByName.size) {
  const ordered = new Set<string>(componentOrder)
  const extra = [...entriesByName.keys()].filter((name) => !ordered.has(name))
  throw new Error(`catalog 有条目不在顺序表里：${extra.join(", ")}`)
}

export function getComponent(name: string): ComponentMeta | undefined {
  return components.find((item) => item.name === name)
}

export const visibleComponents = components.filter(
  (item) => item.type === "registry:ui" || item.type === "registry:block",
)

export interface CatalogSection {
  key: string
  label: string
  items: readonly ComponentMeta[]
}

export interface CatalogGroup {
  key: string
  label: string
  items: readonly ComponentMeta[]
  sections: readonly CatalogSection[]
}

interface FamilySectionSpec {
  key: string
  label: string
  names: readonly string[]
}

const buttonFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: [
      "button-plus",
    ] },
  {
    key: "motion",
    label: "动效",
    names: [
      "fuse-button",
      "neon-button",
      "gooey-button",
      "jelly-button",
    ],
  },
]

const inputFamilySections: readonly FamilySectionSpec[] = [
  {
    key: "base",
    label: "基础",
    names: [
      "input-plus",
    ],
  },
  {
    key: "specialized",
    label: "专用",
    names: [
      "currency-input",
      "coupon-input",
    ],
  },
  { key: "motion", label: "动效", names: [
      "placeholder-vanish-input",
    ] },
]

const checkboxFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: [] },
  { key: "plus", label: "增强", names: [
      "checkbox-plus",
    ] },
  { key: "motion", label: "动效", names: [
      "spring-check",
    ] },
]

const radioFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: [] },
  { key: "plus", label: "增强", names: [
      "radio-plus",
    ] },
  { key: "motion", label: "动效", names: [
      "jelly-radio",
    ] },
]

const selectFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: [] },
  { key: "plus", label: "增强", names: [
      "select-plus",
    ] },
]

const textareaFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: [] },
  { key: "plus", label: "增强", names: [
      "mention-textarea",
    ] },
]

/** 专题只做索引，不加入 componentCluster，成员页不因此重定向。 */
const aiTopicNames = [] as const

export type ComponentCluster =
  | "button"
  | "input"
  | "checkbox"
  | "radio"
  | "select"
  | "textarea"

const controlFamilyGroups: readonly {
  key: ComponentCluster
  label: string
  sections: readonly FamilySectionSpec[]
}[] = [
  { key: "checkbox", label: "复选", sections: checkboxFamilySections },
  { key: "radio", label: "单选", sections: radioFamilySections },
  { key: "select", label: "选择", sections: selectFamilySections },
  { key: "textarea", label: "多行文本", sections: textareaFamilySections },
]

const controlClusterByName = new Map<string, ComponentCluster>(
  controlFamilyGroups.flatMap((group) =>
    group.sections.flatMap((section) => section.names.map((name) => [name, group.key] as const)),
  ),
)

/** 文档导航按名字归组，不改 Layer。 */
export function componentCluster(name: string): ComponentCluster | undefined {
  // 下压和换字的名字不带 button，文档导航仍归到按钮组。
  if (
    name === "button" ||
    name.startsWith("button-") ||
    name.endsWith("-button") ||
    name === "press-depth" ||
    name === "action-swap" ||
    name === "get-in-touch"
  )
    return "button"
  if (name === "input" || name.startsWith("input-") || name.endsWith("-input")) return "input"
  return controlClusterByName.get(name)
}

function buildFamilyGroup(
  key: ComponentCluster,
  label: string,
  specs: readonly FamilySectionSpec[],
): CatalogGroup {
  const listed = new Set(specs.flatMap((section) => section.names))
  const sections: CatalogSection[] = specs.flatMap((section) => {
    const items = section.names.flatMap((name) => {
      const item = getComponent(name)
      return item ? [item] : []
    })
    return items.length > 0 ? [{ key: section.key, label: section.label, items }] : []
  })
  const extras = visibleComponents.filter(
    (item) => componentCluster(item.name) === key && !listed.has(item.name),
  )
  if (extras.length > 0) {
    sections.push({ key: "other", label: "其他", items: extras })
  }
  return {
    key,
    label,
    sections,
    items: sections.flatMap((section) => [...section.items]),
  }
}

function itemsByNames(names: readonly string[]): ComponentMeta[] {
  return names.flatMap((name) => {
    const item = getComponent(name)
    return item ? [item] : []
  })
}

function bucketSections(
  items: readonly ComponentMeta[],
  order: readonly string[],
  keyOf: (item: ComponentMeta) => string | undefined,
  labelOf: (key: string) => string,
  ungrouped: boolean,
): CatalogSection[] {
  const buckets = new Map<string, ComponentMeta[]>(order.map((key) => [key, []]))
  const rest: ComponentMeta[] = []
  for (const item of items) {
    const key = keyOf(item)
    const bucket = key ? buckets.get(key) : undefined
    if (bucket) bucket.push(item)
    else rest.push(item)
  }
  const sections: CatalogSection[] = []
  for (const key of order) {
    const sectionItems = buckets.get(key) ?? []
    if (sectionItems.length > 0) sections.push({ key, label: labelOf(key), items: sectionItems })
  }
  if (ungrouped && rest.length > 0) sections.push({ key: "ungrouped", label: "未分组", items: rest })
  return sections
}

function grouped(key: string, label: string, sections: readonly CatalogSection[]): CatalogGroup | undefined {
  const items = sections.flatMap((section) => [...section.items])
  if (items.length === 0) return undefined
  return { key, label, sections, items }
}

function flatGroup(key: string, label: string, items: readonly ComponentMeta[]): CatalogGroup | undefined {
  if (items.length === 0) return undefined
  return { key, label, items, sections: [] }
}

/** 文档导航按 Layer 分组。家族仍单独成组，专题只做索引。 */
export function getCatalogGroups(): CatalogGroup[] {
  const familyNames = new Set(components.flatMap((item) => (componentCluster(item.name) ? [item.name] : [])))
  const componentItems = components.filter((item) => {
    const layer = resolveLayer(item)
    return (layer === "primitive" || layer === "composite" || layer === "widget") && !familyNames.has(item.name)
  })
  const effectItems = components.filter((item) => resolveLayer(item) === "effect" && !familyNames.has(item.name))
  const componentSections = bucketSections(
    componentItems,
    purposeGroups,
    (item) => purposeGroupOf(item),
    (key) => purposeGroupLabels[key as PurposeGroup],
    true,
  )
  const effectSections = bucketSections(
    effectItems,
    effectCategoryNames,
    (item) => effectCategoryOf(item),
    (key) => effectCategoryLabels[key as EffectCategoryName],
    true,
  )
  const topicSections: CatalogSection[] = [
    { key: "ai", label: "AI", items: itemsByNames(aiTopicNames) },
  ].filter((section) => section.items.length > 0)
  const hookSections: CatalogSection[] = [
    { key: "hook", label: "Hook", items: components.filter((item) => resolveLayer(item) === "hook") },
    { key: "lib", label: "Lib", items: components.filter((item) => resolveLayer(item) === "lib") },
  ].filter((section) => section.items.length > 0)

  const groups: CatalogGroup[] = []
  const componentsGroup = grouped("components", "组件", componentSections)
  if (componentsGroup) groups.push(componentsGroup)
  groups.push(
    buildFamilyGroup("button", "按钮", buttonFamilySections),
    buildFamilyGroup("input", "输入", inputFamilySections),
    ...controlFamilyGroups.map((group) => buildFamilyGroup(group.key, group.label, group.sections)),
  )
  const effectsGroup = grouped("effects", "特效", effectSections)
  if (effectsGroup) groups.push(effectsGroup)
  const sectionsGroup = flatGroup(
    "sections",
    "区块",
    components.filter((item) => resolveLayer(item) === "section"),
  )
  if (sectionsGroup) groups.push(sectionsGroup)
  const templatesGroup = flatGroup(
    "templates",
    "模板",
    components.filter((item) => resolveLayer(item) === "template"),
  )
  if (templatesGroup) groups.push(templatesGroup)
  const topicsGroup = grouped("topics", "专题", topicSections)
  if (topicsGroup) groups.push(topicsGroup)
  const hooksGroup = grouped("hooks-libs", "Hooks 和 Lib", hookSections)
  if (hooksGroup) groups.push(hooksGroup)
  return groups
}

export function relatedComponents(name: string): readonly ComponentMeta[] {
  const cluster = componentCluster(name)
  if (!cluster) return []
  const group = getCatalogGroups().find((entry) => entry.key === cluster)
  if (!group) return []
  return group.items.filter((item) => item.name !== name)
}
