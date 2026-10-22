import { batch2Components } from "./catalog-batch2"
import { batch3Components } from "./catalog-batch3"
import { batch4Components } from "./catalog-batch4"
import { batch5Components } from "./catalog-batch5"
import { batch6Components } from "./catalog-batch6"
import { batch7Components } from "./catalog-batch7"
import { batch8Components } from "./catalog-batch8"
import { batch9Components } from "./catalog-batch9"
import { batch10Components } from "./catalog-batch10"
import { batch11Components } from "./catalog-batch11"
import { batch12Components } from "./catalog-batch12"
import { batch13Components } from "./catalog-batch13"
import { batch14Components } from "./catalog-batch14"
import { batch15Components } from "./catalog-batch15"
import { batch16Components } from "./catalog-batch16"
import { batch17Components } from "./catalog-batch17"
import { batch18Components } from "./catalog-batch18"
import { batch19Components } from "./catalog-batch19"
import { batch20Components } from "./catalog-batch20"
import { batch21Components } from "./catalog-batch21"
import { batch22Components } from "./catalog-batch22"
import { batch23Components } from "./catalog-batch23"
import { batch24Components } from "./catalog-batch24"
import { batch25Components } from "./catalog-batch25"
import { batch26Components } from "./catalog-batch26"
import { batch27Components } from "./catalog-batch27"
import { batch28Components } from "./catalog-batch28"
import { batch29Components } from "./catalog-batch29"
import { batch30Components } from "./catalog-batch30"
import { batch31Components } from "./catalog-batch31"
import { batch32Components } from "./catalog-batch32"
import { batch33Components } from "./catalog-batch33"
import { batch34Components } from "./catalog-batch34"
import { batch35Components } from "./catalog-batch35"
import { batch36Components } from "./catalog-batch36"
import { batch40Components } from "./catalog-batch40"
import type { VocabularyGroup } from "./prop-vocabulary"
import { textControls, textPresets } from "./text-controls"

export type ComponentCategory =
  | "ui"
  | "text"
  | "backgrounds"
  | "cursor"
  | "showcase"
  | "decor"
  | "cards"
  | "buttons"
  | "micro"
  | "loaders"
  | "scroll"
  | "navigation"
  | "page"
  | "sections"
  | "templates"
  | "ai"
  | "utility"

export type UiSubgroup =
  | "form"
  | "overlay"
  | "navigation"
  | "data"
  | "layout"
  | "feedback"

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
  | "Kokonut UI"
  | "Number Flow"
  | "liquid-glass-react"
  | "prompt-kit"
  | "Tailark"
  | "Eldora UI"
  | "Smooth UI"
  | "UI Layouts"
  | "TanStack Virtual"
  | "frimousse"
  | "wavesurfer.js"
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
  | "ReUI"
  | "Tremor Raw"
  | "Uiverse"
  | "Spectrum UI"
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

export interface ComponentMeta {
  name: string
  title: string
  description: string
  category: ComponentCategory
  subgroup?: UiSubgroup
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

export const categoryLabels: Record<ComponentCategory, string> = {
  ui: "基础组件",
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
  sections: "落地页区块",
  templates: "整页模板",
  ai: "AI 对话",
  utility: "实用组件",
}

export const categoryOrder: ComponentCategory[] = [
  "ui",
  "text",
  "backgrounds",
  "cursor",
  "showcase",
  "decor",
  "cards",
  "buttons",
  "micro",
  "loaders",
  "scroll",
  "navigation",
  "page",
  "sections",
  "templates",
  "ai",
  "utility",
]

export const subgroupLabels: Record<UiSubgroup, string> = {
  form: "表单",
  overlay: "浮层",
  navigation: "导航",
  data: "数据展示",
  layout: "布局",
  feedback: "反馈",
}

export const subgroupOrder: UiSubgroup[] = [
  "form",
  "overlay",
  "navigation",
  "data",
  "layout",
  "feedback",
]

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
  ReUI: "https://reui.io",
  "Tremor Raw": "https://raw.tremor.so",
  Uiverse: "https://uiverse.io",
  "Spectrum UI": "https://github.com/arihantcodes/spectrum-ui",
  "Origin UI": "https://coss.com/origin",
  "Paper Shaders": "https://shaders.paper.design",
  "Kokonut UI": "https://kokonutui.com",
  "Number Flow": "https://number-flow.barvian.me",
  "liquid-glass-react": "https://github.com/rdev/liquid-glass-react",
  "prompt-kit": "https://www.prompt-kit.com",
  Tailark: "https://tailark.com",
  "Eldora UI": "https://www.eldoraui.site",
  "Smooth UI": "https://smoothui.dev",
  "UI Layouts": "https://ui-layouts.com",
  "TanStack Virtual": "https://tanstack.com/virtual",
  frimousse: "https://frimousse.liveblocks.io",
  "wavesurfer.js": "https://wavesurfer.xyz",
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

const uiProps: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const components: ComponentMeta[] = [
  {
    name: "utils",
    title: "Utils",
    description: "clsx + tailwind-merge 的 cn 辅助函数。",
    category: "ui",
    source: "shadcn/ui",
    type: "registry:lib",
    file: "lib/utils.ts",
    target: "lib/utils.ts",
    props: [],
  },
  {
    name: "text-style",
    title: "Text Style",
    description: "把字号、字重、字距和对齐写成内联样式。不传则不写样式。",
    category: "ui",
    source: "original",
    type: "registry:lib",
    file: "lib/text-style.ts",
    target: "lib/text-style.ts",
    props: [],
  },
  {
    name: "use-mobile",
    title: "Use Mobile",
    description: "视口宽度小于 768px 时返回 true。",
    category: "ui",
    source: "shadcn/ui",
    type: "registry:hook",
    file: "hooks/use-mobile.ts",
    target: "hooks/use-mobile.ts",
    props: [],
  },
  {
    name: "use-prefers-reduced-motion",
    title: "Use Prefers Reduced Motion",
    description: "系统开启减弱动态效果时返回 true，并在偏好变化时更新。",
    category: "ui",
    source: "original",
    type: "registry:hook",
    file: "hooks/use-prefers-reduced-motion.ts",
    target: "hooks/use-prefers-reduced-motion.ts",
    props: [],
  },
  {
    name: "use-animation-active",
    title: "Use Animation Active",
    description: "目标处于视口内，并且标签页可见时返回 true。",
    category: "ui",
    source: "original",
    type: "registry:hook",
    file: "hooks/use-animation-active.ts",
    target: "hooks/use-animation-active.ts",
    props: [],
  },
  {
    name: "button",
    title: "Button",
    description: "支持多种变体与尺寸的按钮。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/button.tsx",
    target: "components/ui/button.tsx",
    props: [
      { name: "variant", type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"', defaultValue: '"default"', description: "视觉变体。" },
      { name: "size", type: '"default" | "sm" | "lg" | "icon"', defaultValue: '"default"', description: "尺寸。" },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "使用 Slot 把样式合并到子元素。" },
    ],
  },
  {
    name: "input",
    title: "Input",
    description: "文本输入框。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/input.tsx",
    target: "components/ui/input.tsx",
    props: uiProps,
  },
  {
    name: "textarea",
    title: "Textarea",
    description: "多行文本输入。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/textarea.tsx",
    target: "components/ui/textarea.tsx",
    props: uiProps,
  },
  {
    name: "label",
    title: "Label",
    description: "表单标签。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/label.tsx",
    target: "components/ui/label.tsx",
    props: uiProps,
  },
  {
    name: "card",
    title: "Card",
    description: "通用卡片容器。",
    category: "ui",
    subgroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/card.tsx",
    target: "components/ui/card.tsx",
    props: uiProps,
  },
  {
    name: "badge",
    title: "Badge",
    description: "状态与分类徽标。",
    category: "ui",
    subgroup: "data",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/badge.tsx",
    target: "components/ui/badge.tsx",
    props: [{ name: "variant", type: '"default" | "secondary" | "destructive" | "outline"', defaultValue: '"default"', description: "视觉变体。" }],
  },
  {
    name: "separator",
    title: "Separator",
    description: "水平或垂直分隔线。",
    category: "ui",
    subgroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/separator.tsx",
    target: "components/ui/separator.tsx",
    props: [{ name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "方向。" }],
  },
  {
    name: "dialog",
    title: "Dialog",
    description: "模态对话框。",
    category: "ui",
    subgroup: "overlay",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/dialog.tsx",
    target: "components/ui/dialog.tsx",
    props: uiProps,
  },
  {
    name: "sheet",
    title: "Sheet",
    description: "从边缘滑出的面板。",
    category: "ui",
    subgroup: "overlay",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/sheet.tsx",
    target: "components/ui/sheet.tsx",
    props: [{ name: "side", type: '"top" | "right" | "bottom" | "left"', defaultValue: '"right"', description: "滑出方向。" }],
  },
  {
    name: "dropdown-menu",
    title: "Dropdown Menu",
    description: "下拉菜单。",
    category: "ui",
    subgroup: "overlay",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/dropdown-menu.tsx",
    target: "components/ui/dropdown-menu.tsx",
    props: uiProps,
  },
  {
    name: "tabs",
    title: "Tabs",
    description: "选项卡切换。",
    category: "ui",
    subgroup: "navigation",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/tabs.tsx",
    target: "components/ui/tabs.tsx",
    props: uiProps,
  },
  {
    name: "tooltip",
    title: "Tooltip",
    description: "悬停提示。",
    category: "ui",
    subgroup: "overlay",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/tooltip.tsx",
    target: "components/ui/tooltip.tsx",
    props: uiProps,
  },
  {
    name: "sonner",
    title: "Toast",
    description: "基于 Sonner 的轻提示。",
    category: "ui",
    subgroup: "feedback",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/sonner.tsx",
    target: "components/ui/sonner.tsx",
    props: uiProps,
  },
  {
    name: "switch",
    title: "Switch",
    description: "开关控件。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/switch.tsx",
    target: "components/ui/switch.tsx",
    props: uiProps,
  },
  {
    name: "checkbox",
    title: "Checkbox",
    description: "复选框。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/checkbox.tsx",
    target: "components/ui/checkbox.tsx",
    props: uiProps,
  },
  {
    name: "select",
    title: "Select",
    description: "选择器。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/select.tsx",
    target: "components/ui/select.tsx",
    props: uiProps,
  },
  {
    name: "accordion",
    title: "Accordion",
    description: "手风琴折叠面板。",
    category: "ui",
    subgroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/accordion.tsx",
    target: "components/ui/accordion.tsx",
    props: uiProps,
  },
  {
    name: "popover",
    title: "Popover",
    description: "弹出层。",
    category: "ui",
    subgroup: "overlay",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/popover.tsx",
    target: "components/ui/popover.tsx",
    props: uiProps,
  },
  {
    name: "avatar",
    title: "Avatar",
    description: "头像。",
    category: "ui",
    subgroup: "data",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/avatar.tsx",
    target: "components/ui/avatar.tsx",
    props: uiProps,
  },
  {
    name: "slider",
    title: "Slider",
    description: "滑块。",
    category: "ui",
    subgroup: "form",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/slider.tsx",
    target: "components/ui/slider.tsx",
    props: uiProps,
  },
  {
    name: "typing-text",
    title: "Typing Text",
    description: "打字机文字动画。",
    category: "text",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/typing-text.tsx",
    target: "components/ui/typing-text.tsx",
    props: [
      {
        name: "text",
        type: "string",
        description: "要逐字显示的文本。",
        control: { kind: "text", value: "把特效复制进你的项目" },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "80",
        description: "每个字符的间隔（毫秒）。",
        control: { kind: "range", value: 80, min: 20, max: 400, step: 10 },
      },
      {
        name: "loop",
        type: "boolean",
        defaultValue: "false",
        description: "是否循环打字 / 删除。",
        control: { kind: "boolean", value: true },
      },
      {
        name: "cursor",
        type: "boolean",
        defaultValue: "true",
        description: "是否显示光标。",
        control: { kind: "boolean", value: true },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "第一字出现前的等待（毫秒）。",
        control: { kind: "range", value: 0, min: 0, max: 2000, step: 50 },
      },
      {
        name: "interactive",
        type: "boolean",
        defaultValue: "false",
        description: "精细指针移入时从头打。触屏上忽略移入。",
        control: { kind: "boolean", value: false },
      },
      {
        name: "fontSize",
        type: "number",
        description: "字号（像素）。不传则继承。",
        control: { kind: "range", value: 32, min: 12, max: 96, step: 1 },
      },
      {
        name: "fontWeight",
        type: "number",
        description: "字重。不传则继承。",
        control: { kind: "range", value: 500, min: 100, max: 900, step: 100 },
      },
      {
        name: "letterSpacing",
        type: "number",
        description: "字距（em）。不传则继承。",
        control: { kind: "range", value: 0, min: -0.1, max: 0.5, step: 0.01 },
      },
      {
        name: "align",
        type: '"left" | "center" | "right"',
        description: "对齐。不传则不设置。",
        control: { kind: "select", value: "left", options: ["left", "center", "right"] },
      },
    ],
    presets: [
      {
        name: "typing-headline",
        label: "标题",
        values: { text: "把特效复制进你的项目", fontSize: 56, fontWeight: 700, align: "center", duration: 40 },
      },
      {
        name: "typing-slow",
        label: "慢打",
        values: { text: "一行慢慢出现", fontSize: 20, fontWeight: 400, duration: 180, loop: true },
      },
      {
        name: "typing-plain",
        label: "正文",
        values: { text: "适合说明的句子", fontSize: 16, fontWeight: 400, letterSpacing: 0, align: "left", loop: false },
      },
    ],
  },
  {
    name: "gradient-text",
    title: "Gradient Text",
    description: "流动渐变文字。",
    category: "text",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/gradient-text.tsx",
    target: "components/ui/gradient-text.tsx",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "文字内容。",
        control: { kind: "text", value: "流动渐变" },
      },
      {
        name: "colors",
        type: "string",
        defaultValue: "from-violet-500 via-fuchsia-500 to-cyan-400",
        description: "Tailwind 渐变色类。",
        vocabularyExemption: "历史 prop 是 Tailwind 渐变类字符串，不是 CSS 颜色数组。不改名、不改类型。",
        control: { kind: "text", value: "from-violet-500 via-fuchsia-500 to-cyan-400" },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "流动开始前的等待（毫秒）。",
        control: { kind: "range", value: 0, min: 0, max: 2000, step: 50 },
      },
      {
        name: "loop",
        type: "boolean",
        defaultValue: "true",
        description: "为假时只走一轮。不传则一直循环。",
        control: { kind: "boolean", value: true },
      },
      {
        name: "interactive",
        type: "boolean",
        defaultValue: "false",
        description: "精细指针移入时重播。触屏上忽略移入。",
        control: { kind: "boolean", value: false },
      },
      {
        name: "fontSize",
        type: "number",
        description: "字号（像素）。不传则继承。",
        control: { kind: "range", value: 48, min: 12, max: 96, step: 1 },
      },
      {
        name: "fontWeight",
        type: "number",
        description: "字重。不传则继承。",
        control: { kind: "range", value: 700, min: 100, max: 900, step: 100 },
      },
      {
        name: "letterSpacing",
        type: "number",
        description: "字距（em）。不传则继承。",
        control: { kind: "range", value: 0, min: -0.1, max: 0.5, step: 0.01 },
      },
      {
        name: "align",
        type: '"left" | "center" | "right"',
        description: "对齐。不传则不设置。",
        control: { kind: "select", value: "center", options: ["left", "center", "right"] },
      },
    ],
    presets: [
      {
        name: "gradient-hero",
        label: "主标题",
        values: {
          children: "流动渐变",
          colors: "from-violet-500 via-fuchsia-500 to-cyan-400",
          fontSize: 64,
          fontWeight: 700,
          align: "center",
        },
      },
      {
        name: "gradient-warm",
        label: "暖色",
        values: {
          children: "暖调标题",
          colors: "from-orange-400 via-rose-500 to-amber-300",
          fontSize: 40,
          fontWeight: 600,
          align: "left",
        },
      },
      {
        name: "gradient-quiet",
        label: "弱对比",
        values: {
          children: "一句说明",
          colors: "from-zinc-500 via-zinc-300 to-zinc-500",
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: 0.02,
          loop: true,
        },
      },
    ],
  },
  {
    name: "shimmer-text",
    title: "Shimmer Text",
    description: "金属光泽扫过文字。",
    category: "text",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/shimmer-text.tsx",
    target: "components/ui/shimmer-text.tsx",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "文字内容。",
        control: { kind: "text", value: "扫光文字即将上线" },
      },
      {
        name: "fontSize",
        type: "number",
        description: "字号（像素）。不传则继承。",
        control: { kind: "range", value: 48, min: 12, max: 96, step: 1 },
      },
      {
        name: "fontWeight",
        type: "number",
        description: "字重。不传则继承。",
        control: { kind: "range", value: 600, min: 100, max: 900, step: 100 },
      },
      {
        name: "letterSpacing",
        type: "number",
        description: "字距（em）。不传则继承。",
        control: { kind: "range", value: 0, min: -0.1, max: 0.5, step: 0.01 },
      },
      {
        name: "align",
        type: '"left" | "center" | "right"',
        description: "对齐。不传则不设置。",
        control: { kind: "select", value: "left", options: ["left", "center", "right"] },
      },
      ...uiProps,
    ],
    presets: [
      {
        name: "shimmer-display",
        label: "大标题",
        values: { children: "扫光标题", fontSize: 72, fontWeight: 700, letterSpacing: -0.04, align: "center" },
      },
      {
        name: "shimmer-reading",
        label: "正文",
        values: { children: "一段可以阅读的文字", fontSize: 18, fontWeight: 400, letterSpacing: 0, align: "left" },
      },
      {
        name: "shimmer-kicker",
        label: "小标签",
        values: { children: "NEW", fontSize: 14, fontWeight: 600, letterSpacing: 0.18, align: "left" },
      },
    ],
  },
  {
    name: "aurora-text",
    title: "Aurora Text",
    description: "极光色流动文字。",
    category: "text",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/aurora-text.tsx",
    target: "components/ui/aurora-text.tsx",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "文字内容。",
        control: { kind: "text", value: "极光标题" },
      },
      ...textControls({ fontSize: 36, fontWeight: 600, align: "center" }),
      {
        name: "speed",
        type: "number",
        description: "流动速度倍率。不传则保持原来的 7 秒一轮。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      ...uiProps,
    ],
    presets: textPresets("aurora", "children", [
      { label: "大标题", content: "极光标题", fontSize: 72, fontWeight: 700, align: "center", extra: { speed: 1 } },
      { label: "正文", content: "流动的一句", fontSize: 18, fontWeight: 400, align: "left", extra: { speed: 0.6 } },
      { label: "快闪", content: "AURORA", fontSize: 48, fontWeight: 600, align: "center", extra: { speed: 2 } },
    ]),
  },
  {
    name: "split-text",
    title: "Split Text",
    description: "按字符或单词错落入场。",
    category: "text",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/split-text.tsx",
    target: "components/ui/split-text.tsx",
    props: [
      {
        name: "text",
        type: "string",
        description: "文本内容。",
        control: { kind: "text", value: "逐字显现的标题" },
      },
      {
        name: "by",
        type: '"char" | "word"',
        defaultValue: '"char"',
        description: "拆分粒度。",
        control: { kind: "select", value: "char", options: ["char", "word"] },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "入场延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "loop",
        type: "boolean",
        defaultValue: "false",
        description: "入场结束后再播一次。",
        control: { kind: "boolean", value: false },
      },
      {
        name: "interactive",
        type: "boolean",
        defaultValue: "false",
        description: "精细指针移入时重播。触屏上忽略移入。",
        control: { kind: "boolean", value: false },
      },
      {
        name: "fontSize",
        type: "number",
        description: "字号（像素）。不传则继承。",
        control: { kind: "range", value: 40, min: 12, max: 96, step: 1 },
      },
      {
        name: "fontWeight",
        type: "number",
        description: "字重。不传则继承。",
        control: { kind: "range", value: 600, min: 100, max: 900, step: 100 },
      },
      {
        name: "letterSpacing",
        type: "number",
        description: "字距（em）。不传则继承。",
        control: { kind: "range", value: 0, min: -0.1, max: 0.5, step: 0.01 },
      },
      {
        name: "align",
        type: '"left" | "center" | "right"',
        description: "对齐。不传则不设置。",
        control: { kind: "select", value: "left", options: ["left", "center", "right"] },
      },
    ],
    presets: [
      {
        name: "split-headline",
        label: "标题",
        values: { text: "逐字显现的标题", fontSize: 64, fontWeight: 700, align: "center", by: "char", delay: 0 },
      },
      {
        name: "split-words",
        label: "按词",
        values: { text: "按词错落出现", fontSize: 28, fontWeight: 500, by: "word", delay: 0.2 },
      },
      {
        name: "split-quiet",
        label: "正文",
        values: { text: "轻轻进入的一句", fontSize: 18, fontWeight: 400, letterSpacing: 0.01, align: "left", delay: 0 },
      },
    ],
  },
  {
    name: "highlight-text",
    title: "Highlight Text",
    description: "进入视口时绘制高亮底纹。",
    category: "text",
    source: "Animata",
    type: "registry:ui",
    file: "effects/highlight-text.tsx",
    target: "components/ui/highlight-text.tsx",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "被强调的文字。",
        control: { kind: "text", value: "关键句" },
      },
      {
        name: "color",
        type: "string",
        defaultValue: "var(--primary)",
        description: "高亮颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      {
        name: "duration",
        type: "number",
        description: "底纹展开时长，毫秒。不传则 550。",
        control: { kind: "range", value: 550, min: 220, max: 1100, step: 10 },
      },
      ...textControls({ fontSize: 20, fontWeight: 400, align: "left" }),
    ],
    presets: textPresets("highlight", "children", [
      { label: "正文", content: "关键句", fontSize: 20, fontWeight: 500, align: "left", extra: { duration: 550 } },
      { label: "标题", content: "划重点", fontSize: 36, fontWeight: 700, align: "center", extra: { duration: 800 } },
      { label: "快划", content: "注意", fontSize: 16, fontWeight: 600, align: "left", extra: { duration: 280 } },
    ]),
  },
  {
    name: "count-up",
    title: "Count Up",
    description: "数字滚动计数。",
    category: "text",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/count-up.tsx",
    target: "components/ui/count-up.tsx",
    props: [
      {
        name: "value",
        type: "number",
        description: "目标数字。",
        control: { kind: "range", value: 1280, min: 0, max: 5000, step: 10 },
      },
      {
        name: "direction",
        type: '"up" | "down"',
        defaultValue: '"up"',
        description: "计数方向。",
        control: { kind: "select", value: "up", options: ["up", "down"] },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "延迟（秒）。已有单位，不改成毫秒。",
        control: { kind: "range", value: 0, min: 0, max: 2, step: 0.1 },
      },
      {
        name: "decimalPlaces",
        type: "number",
        defaultValue: "0",
        description: "小数位。",
        control: { kind: "range", value: 0, min: 0, max: 4, step: 1 },
      },
      ...textControls({ fontSize: 48, fontWeight: 600, align: "left" }),
    ],
    presets: [
      {
        name: "count-up-1",
        label: "大数字",
        values: { value: 1280, direction: "up", delay: 0, decimalPlaces: 0, fontSize: 64, fontWeight: 700, align: "center" },
      },
      {
        name: "count-up-2",
        label: "小数",
        values: { value: 99.5, direction: "up", delay: 0.2, decimalPlaces: 1, fontSize: 36, fontWeight: 500, align: "left" },
      },
      {
        name: "count-up-3",
        label: "倒数",
        values: { value: 80, direction: "down", delay: 0, decimalPlaces: 0, fontSize: 28, fontWeight: 600, align: "right" },
      },
    ],
  },
  {
    name: "particles",
    title: "Particles",
    description: "跟随指针的粒子背景。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/particles.tsx",
    target: "components/ui/particles.tsx",
    props: [
      {
        name: "quantity",
        type: "number",
        defaultValue: "60",
        description: "粒子数量。",
        control: { kind: "range", value: 80, min: 10, max: 200, step: 1 },
      },
      {
        name: "staticity",
        type: "number",
        defaultValue: "50",
        description: "静止程度，越高越不跟随。",
        control: { kind: "range", value: 50, min: 0, max: 100, step: 1 },
      },
      {
        name: "ease",
        type: "number",
        defaultValue: "50",
        description: "缓动阻尼。",
        control: { kind: "range", value: 50, min: 1, max: 100, step: 1 },
      },
      {
        name: "color",
        type: "string",
        defaultValue: "currentColor",
        description: "粒子颜色。",
        control: { kind: "color", value: "#7c3aed" },
      },
    ],
  },
  {
    name: "grid-pattern",
    title: "Grid Pattern",
    description: "网格背景图案。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/grid-pattern.tsx",
    target: "components/ui/grid-pattern.tsx",
    props: [
      {
        name: "width",
        type: "number",
        defaultValue: "40",
        description: "单元格宽。",
        control: { kind: "range", value: 40, min: 8, max: 80, step: 4 },
      },
      {
        name: "height",
        type: "number",
        defaultValue: "40",
        description: "单元格高。",
        control: { kind: "range", value: 40, min: 8, max: 80, step: 4 },
      },
      {
        name: "x",
        type: "number",
        defaultValue: "-1",
        description: "水平偏移。",
        control: { kind: "range", value: -1, min: -20, max: 20, step: 1 },
      },
      {
        name: "y",
        type: "number",
        defaultValue: "-1",
        description: "垂直偏移。",
        control: { kind: "range", value: -1, min: -20, max: 20, step: 1 },
      },
      {
        name: "strokeDasharray",
        type: "string",
        defaultValue: "0",
        description: "描边虚线。",
        control: { kind: "text", value: "0" },
      },
    ],
  },
  {
    name: "dot-pattern",
    title: "Dot Pattern",
    description: "圆点背景图案。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/dot-pattern.tsx",
    target: "components/ui/dot-pattern.tsx",
    props: [
      {
        name: "width",
        type: "number",
        defaultValue: "16",
        description: "水平间距。",
        control: { kind: "range", value: 16, min: 4, max: 40, step: 1 },
      },
      {
        name: "height",
        type: "number",
        defaultValue: "16",
        description: "垂直间距。",
        control: { kind: "range", value: 16, min: 4, max: 40, step: 1 },
      },
      {
        name: "cx",
        type: "number",
        defaultValue: "1",
        description: "圆心横坐标。",
        control: { kind: "range", value: 1, min: 0, max: 8, step: 1 },
      },
      {
        name: "cy",
        type: "number",
        defaultValue: "1",
        description: "圆心纵坐标。",
        control: { kind: "range", value: 1, min: 0, max: 8, step: 1 },
      },
      {
        name: "cr",
        type: "number",
        defaultValue: "1",
        description: "圆点半径。",
        control: { kind: "range", value: 1, min: 0.5, max: 4, step: 0.5 },
      },
    ],
  },
  {
    name: "meteors",
    title: "Meteors",
    description: "流星雨背景。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/meteors.tsx",
    target: "components/ui/meteors.tsx",
    props: [
      {
        name: "number",
        type: "number",
        defaultValue: "18",
        description: "流星数量。",
        control: { kind: "range", value: 18, min: 4, max: 36, step: 1 },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "下落速度倍率。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "color",
        type: "string",
        description: "流星颜色。",
        control: { kind: "color" },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "2",
        description: "头部直径（像素）。",
        control: { kind: "range", value: 2, min: 1, max: 6, step: 1 },
      },
    ],
  },
  {
    name: "aurora-background",
    title: "Aurora Background",
    description: "极光模糊渐变背景。",
    category: "backgrounds",
    source: "original",
    type: "registry:ui",
    file: "effects/aurora-background.tsx",
    target: "components/ui/aurora-background.tsx",
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "前景内容。",
        control: { kind: "text", value: "极光铺在内容后面" },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "流动速度倍率。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.7",
        description: "光晕不透明度。",
        control: { kind: "range", value: 0.7, min: 0.2, max: 1, step: 0.05 },
      },
      {
        name: "colors",
        type: "string[]",
        description: "三处光斑颜色。",
        control: { kind: "colors", value: ["#7c3aed", "#22d3ee", "#f59e0b"], follow: true },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "64",
        description: "模糊半径（像素）。",
        control: { kind: "range", value: 64, min: 16, max: 96, step: 4 },
      },
      ...uiProps,
    ],
  },
  {
    name: "ripples",
    title: "Ripples",
    description: "同心圆扩散背景。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/ripples.tsx",
    target: "components/ui/ripples.tsx",
    props: [
      {
        name: "rings",
        type: "number",
        defaultValue: "4",
        description: "圆环数量。",
        control: { kind: "range", value: 4, min: 2, max: 8, step: 1 },
      },
      {
        name: "speed",
        type: "number",
        defaultValue: "1",
        description: "扩散速度倍率。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "color",
        type: "string",
        description: "圆环颜色。",
        control: { kind: "color" },
      },
      {
        name: "intensity",
        type: "number",
        defaultValue: "0.2",
        description: "圆环透明度。",
        control: { kind: "range", value: 0.2, min: 0.05, max: 0.6, step: 0.05 },
      },
    ],
  },
  {
    name: "flickering-grid",
    title: "Flickering Grid",
    description: "随机闪烁的像素网格。",
    category: "backgrounds",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/flickering-grid.tsx",
    target: "components/ui/flickering-grid.tsx",
    props: [
      {
        name: "squareSize",
        type: "number",
        defaultValue: "4",
        description: "方块尺寸。",
        control: { kind: "range", value: 4, min: 2, max: 16, step: 1 },
      },
      {
        name: "gridGap",
        type: "number",
        defaultValue: "6",
        description: "方块间距。",
        control: { kind: "range", value: 6, min: 0, max: 20, step: 1 },
      },
      {
        name: "flickerChance",
        type: "number",
        defaultValue: "0.18",
        description: "每帧闪烁概率。",
        control: { kind: "range", value: 0.18, min: 0.02, max: 0.6, step: 0.01 },
      },
      {
        name: "color",
        type: "string",
        defaultValue: "var(--foreground)",
        description: "方块颜色。",
        control: { kind: "color" },
      },
      {
        name: "maxOpacity",
        type: "number",
        defaultValue: "0.28",
        description: "最大不透明度。",
        control: { kind: "range", value: 0.28, min: 0.05, max: 0.8, step: 0.01 },
      },
    ],
  },
  {
    name: "spotlight-card",
    title: "Spotlight Card",
    description: "跟随指针的聚光卡片。",
    category: "cursor",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/spotlight-card.tsx",
    target: "components/ui/spotlight-card.tsx",
    props: [
      { name: "spotlightColor", type: "string", description: "聚光颜色。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "radius",
        type: "number",
        defaultValue: "240",
        description: "聚光半径。",
        control: { kind: "range", value: 240, min: 80, max: 480, step: 10 },
      },
      {
        name: "speed",
        type: "number",
        description: "光斑显现速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "光斑边缘衰减。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "spotlight-soft", label: "柔和", values: { radius: 180, speed: 0.6, intensity: 0.55 } },
      { name: "spotlight-default", label: "默认", values: { radius: 240, speed: 1, intensity: 1 } },
      { name: "spotlight-tight", label: "收紧", values: { radius: 120, speed: 1.6, intensity: 1 } },
    ],
  },
  {
    name: "magnetic",
    title: "Magnetic",
    description: "磁性吸附跟随指针。",
    category: "cursor",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/magnetic.tsx",
    target: "components/ui/magnetic.tsx",
    props: [
      {
        name: "strength",
        type: "number",
        defaultValue: "0.35",
        description: "吸附强度。",
        control: { kind: "range", value: 0.35, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "speed",
        type: "number",
        description: "回弹速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "位移幅度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "scale",
        type: "number",
        description: "整体缩放。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
    ],
    presets: [
      { name: "magnetic-light", label: "轻吸", values: { strength: 0.15, speed: 0.8, intensity: 0.6, scale: 1 } },
      { name: "magnetic-default", label: "默认", values: { strength: 0.35, speed: 1, intensity: 1, scale: 1 } },
      { name: "magnetic-strong", label: "强吸", values: { strength: 0.7, speed: 1.4, intensity: 1, scale: 1.1 } },
    ],
  },
  {
    name: "cursor-follow",
    title: "Cursor Follow",
    description: "区域内的柔光指针跟随。",
    category: "cursor",
    source: "original",
    type: "registry:ui",
    file: "effects/cursor-follow.tsx",
    target: "components/ui/cursor-follow.tsx",
    props: [
      {
        name: "size",
        type: "number",
        defaultValue: "28",
        description: "光标尺寸（像素）。",
        control: { kind: "range", value: 28, min: 8, max: 80, step: 2 },
      },
      { name: "color", type: "string", description: "光标颜色。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "speed",
        type: "number",
        description: "跟随速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "不透明度。0.35 与不传相同。",
        control: { kind: "range", value: 0.35, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "cursor-follow-soft", label: "淡", values: { size: 36, speed: 0.7, intensity: 0.2 } },
      { name: "cursor-follow-default", label: "默认", values: { size: 28, speed: 1, intensity: 0.35 } },
      { name: "cursor-follow-bold", label: "醒目", values: { size: 16, speed: 1.8, intensity: 0.7 } },
    ],
  },
  {
    name: "tilt",
    title: "Tilt",
    description: "指针驱动的 3D 倾斜。",
    category: "cursor",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/tilt.tsx",
    target: "components/ui/tilt.tsx",
    props: [
      {
        name: "maxTilt",
        type: "number",
        defaultValue: "12",
        description: "最大倾斜角度。",
        control: { kind: "range", value: 12, min: 0, max: 40, step: 1 },
      },
      {
        name: "speed",
        type: "number",
        description: "回正速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "倾斜幅度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "scale",
        type: "number",
        description: "整体缩放。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
    ],
    presets: [
      { name: "tilt-flat", label: "平", values: { maxTilt: 4, speed: 0.8, intensity: 0.5, scale: 1 } },
      { name: "tilt-default", label: "默认", values: { maxTilt: 12, speed: 1, intensity: 1, scale: 1 } },
      { name: "tilt-steep", label: "陡", values: { maxTilt: 28, speed: 1.5, intensity: 1, scale: 1.05 } },
    ],
  },
  {
    name: "glow-hover",
    title: "Glow Hover",
    description: "悬停时外发光上浮。",
    category: "cursor",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/glow-hover.tsx",
    target: "components/ui/glow-hover.tsx",
    props: [
      { name: "glowColor", type: "string", defaultValue: "var(--primary)", description: "发光颜色。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "speed",
        type: "number",
        description: "过渡速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "发光浓度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "size",
        type: "number",
        description: "发光模糊半径（像素）。40 与不传相同。",
        control: { kind: "range", value: 40, min: 8, max: 96, step: 2 },
      },
    ],
    presets: [
      { name: "glow-soft", label: "柔光", values: { speed: 0.7, intensity: 0.45, size: 24 } },
      { name: "glow-default", label: "默认", values: { speed: 1, intensity: 1, size: 40 } },
      { name: "glow-wide", label: "散开", values: { speed: 1.4, intensity: 1, size: 72 } },
    ],
  },
  {
    name: "flip-card",
    title: "Flip Card",
    description: "悬停翻转卡片。",
    category: "cards",
    source: "Animata",
    type: "registry:ui",
    file: "effects/flip-card.tsx",
    target: "components/ui/flip-card.tsx",
    props: [
      { name: "front", type: "ReactNode", description: "正面内容。" },
      { name: "back", type: "ReactNode", description: "背面内容。" },
      {
        name: "duration",
        type: "number",
        description: "翻转动画时长（毫秒）。500 与不传相同。",
        control: { kind: "range", value: 500, min: 200, max: 1000, step: 50 },
      },
    ],
    presets: [
      { name: "flip-card-fast", label: "快", values: { duration: 250 } },
      { name: "flip-card-default", label: "默认", values: { duration: 500 } },
      { name: "flip-card-slow", label: "慢", values: { duration: 900 } },
    ],
  },
  {
    name: "glass-card",
    title: "Glass Card",
    description: "毛玻璃卡片。",
    category: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/glass-card.tsx",
    target: "components/ui/glass-card.tsx",
    props: [
      {
        name: "intensity",
        type: "number",
        description: "玻璃叠色的倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "size",
        type: "number",
        description: "背景模糊（像素）。24 与不传相同。",
        control: { kind: "range", value: 24, min: 1, max: 48, step: 1 },
      },
      ...uiProps,
    ],
    presets: [
      { name: "glass-card-clear", label: "清", values: { intensity: 0.4, size: 8 } },
      { name: "glass-card-default", label: "默认", values: { intensity: 1, size: 24 } },
      { name: "glass-card-frost", label: "雾", values: { intensity: 1, size: 40 } },
    ],
  },
  {
    name: "shine-border",
    title: "Shine Border",
    description: "旋转高光描边卡片。",
    category: "cards",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/shine-border.tsx",
    target: "components/ui/shine-border.tsx",
    props: [
      {
        name: "shineColor",
        type: "string",
        defaultValue: "var(--primary)",
        description: "高光颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "10",
        description: "旋转周期（秒）。",
        control: { kind: "range", value: 10, min: 4, max: 20, step: 0.5 },
      },
      {
        name: "size",
        type: "number",
        description: "描边厚度（像素）。1 与不传相同。",
        control: { kind: "range", value: 1, min: 1, max: 6, step: 1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "高光弧宽度的倍率。1 与不传相同，仍是 12% 到 28%。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "shine-border-thin", label: "细", values: { duration: 14, size: 1, intensity: 0.45 } },
      { name: "shine-border-default", label: "默认", values: { duration: 10, size: 1, intensity: 1 } },
      { name: "shine-border-wide", label: "宽", values: { duration: 6, size: 3, intensity: 1 } },
    ],
  },
  {
    name: "hover-lift",
    title: "Hover Lift",
    description: "悬停上浮阴影卡片。",
    category: "cards",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/hover-lift.tsx",
    target: "components/ui/hover-lift.tsx",
    props: [
      {
        name: "duration",
        type: "number",
        description: "过渡时长（毫秒）。300 与不传相同。",
        control: { kind: "range", value: 300, min: 120, max: 600, step: 20 },
      },
      {
        name: "intensity",
        type: "number",
        description: "上浮距离的倍率。1 与不传相同，仍是 6px。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      ...uiProps,
    ],
    presets: [
      { name: "hover-lift-soft", label: "轻", values: { duration: 400, intensity: 0.4 } },
      { name: "hover-lift-default", label: "默认", values: { duration: 300, intensity: 1 } },
      { name: "hover-lift-slow", label: "慢", values: { duration: 560, intensity: 1 } },
    ],
  },
  {
    name: "ripple-button",
    title: "Ripple Button",
    description: "点击波纹按钮。",
    category: "buttons",
    source: "Animata",
    type: "registry:ui",
    file: "effects/ripple-button.tsx",
    target: "components/ui/ripple-button.tsx",
    props: [
      {
        name: "rippleColor",
        type: "string",
        description: "波纹颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      {
        name: "duration",
        type: "number",
        description: "波纹时长（毫秒）。650 与不传相同。",
        control: { kind: "range", value: 650, min: 260, max: 1300, step: 10 },
      },
      {
        name: "scale",
        type: "number",
        description: "波纹点倍率。1 与不传相同，仍是 size-4。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
    ],
    presets: [
      { name: "ripple-button-small", label: "小", values: { duration: 400, scale: 0.5 } },
      { name: "ripple-button-default", label: "默认", values: { duration: 650, scale: 1 } },
      { name: "ripple-button-large", label: "大", values: { duration: 1100, scale: 1.5 } },
    ],
  },
  {
    name: "shimmer-button",
    title: "Shimmer Button",
    description: "斜向光泽扫过按钮。",
    category: "buttons",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/shimmer-button.tsx",
    target: "components/ui/shimmer-button.tsx",
    props: [
      {
        name: "shimmerColor",
        type: "string",
        description: "光泽颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      {
        name: "duration",
        type: "number",
        description: "扫光时长（毫秒）。2200 与不传相同。",
        control: { kind: "range", value: 2200, min: 880, max: 4400, step: 40 },
      },
    ],
    presets: [
      { name: "shimmer-button-fast", label: "快", values: { duration: 1200 } },
      { name: "shimmer-button-default", label: "默认", values: { duration: 2200 } },
      { name: "shimmer-button-slow", label: "慢", values: { duration: 3600 } },
    ],
  },
  {
    name: "pulse-button",
    title: "Pulse Button",
    description: "向外脉冲的按钮。",
    category: "buttons",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/pulse-button.tsx",
    target: "components/ui/pulse-button.tsx",
    props: [
      {
        name: "duration",
        type: "number",
        description: "脉冲时长（毫秒）。2000 与不传相同。",
        control: { kind: "range", value: 2000, min: 800, max: 4000, step: 100 },
      },
      {
        name: "intensity",
        type: "number",
        description: "光环不透明度。0.4 与不传相同，仍是 bg-primary/40。",
        control: { kind: "range", value: 0.4, min: 0, max: 1, step: 0.05 },
      },
      ...uiProps,
    ],
    presets: [
      { name: "pulse-button-soft", label: "柔", values: { duration: 2800, intensity: 0.2 } },
      { name: "pulse-button-default", label: "默认", values: { duration: 2000, intensity: 0.4 } },
      { name: "pulse-button-strong", label: "强", values: { duration: 1200, intensity: 0.8 } },
    ],
  },
  {
    name: "neon-button",
    title: "Neon Button",
    description: "霓虹描边发光按钮。",
    category: "buttons",
    source: "original",
    type: "registry:ui",
    file: "effects/neon-button.tsx",
    target: "components/ui/neon-button.tsx",
    props: [
      {
        name: "glowColor",
        type: "string",
        defaultValue: "var(--primary)",
        description: "霓虹颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      {
        name: "scale",
        type: "number",
        description: "辉光倍率。1 与不传相同，仍是 18px 与 28px。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
    ],
    presets: [
      { name: "neon-button-dim", label: "暗", values: { scale: 0.5 } },
      { name: "neon-button-default", label: "默认", values: { scale: 1 } },
      { name: "neon-button-bright", label: "亮", values: { scale: 2 } },
    ],
  },
  {
    name: "spinner",
    title: "Spinner",
    description: "旋转加载指示。",
    category: "loaders",
    source: "original",
    type: "registry:ui",
    file: "effects/spinner.tsx",
    target: "components/ui/spinner.tsx",
    props: [
      {
        name: "size",
        type: "number",
        defaultValue: "28",
        description: "直径（像素）。",
        control: { kind: "range", value: 28, min: 12, max: 64, step: 2 },
      },
      {
        name: "duration",
        type: "number",
        description: "转一圈的毫秒数。1000 与不传相同，仍是 animate-spin。",
        control: { kind: "range", value: 1000, min: 400, max: 2000, step: 50 },
      },
      {
        name: "color",
        type: "string",
        description: "顶部描边颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
    ],
    presets: [
      { name: "spinner-small", label: "小", values: { size: 16, duration: 1600 } },
      { name: "spinner-default", label: "默认", values: { size: 28, duration: 1000 } },
      { name: "spinner-large", label: "大", values: { size: 48, duration: 600 } },
    ],
  },
  {
    name: "orbit-loader",
    title: "Orbit Loader",
    description: "轨道旋转加载。",
    category: "loaders",
    source: "Animata",
    type: "registry:ui",
    file: "effects/orbit-loader.tsx",
    target: "components/ui/orbit-loader.tsx",
    props: [
      {
        name: "size",
        type: "number",
        defaultValue: "56",
        description: "容器边长（像素）。",
        control: { kind: "range", value: 56, min: 32, max: 120, step: 4 },
      },
      {
        name: "dots",
        type: "number",
        defaultValue: "6",
        description: "轨道点数。",
        control: { kind: "range", value: 6, min: 3, max: 12, step: 1 },
      },
      {
        name: "duration",
        type: "number",
        description: "转一圈的毫秒数。1400 与不传相同。",
        control: { kind: "range", value: 1400, min: 560, max: 2800, step: 20 },
      },
      {
        name: "delay",
        type: "number",
        description: "相邻点的错开毫秒。80 与不传相同。",
        control: { kind: "range", value: 80, min: 0, max: 200, step: 10 },
      },
      {
        name: "color",
        type: "string",
        description: "点的颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
    ],
    presets: [
      { name: "orbit-loader-sparse", label: "疏", values: { dots: 4, size: 48, duration: 2200, delay: 120 } },
      { name: "orbit-loader-default", label: "默认", values: { dots: 6, size: 56, duration: 1400, delay: 80 } },
      { name: "orbit-loader-dense", label: "密", values: { dots: 10, size: 80, duration: 800, delay: 40 } },
    ],
  },
  {
    name: "dots-loader",
    title: "Dots Loader",
    description: "三点弹跳加载。",
    category: "loaders",
    source: "Animata",
    type: "registry:ui",
    file: "effects/dots-loader.tsx",
    target: "components/ui/dots-loader.tsx",
    props: [
      {
        name: "count",
        type: "number",
        description: "点数。3 与不传相同。",
        control: { kind: "range", value: 3, min: 1, max: 8, step: 1 },
      },
      {
        name: "size",
        type: "number",
        description: "点的直径（像素）。8 与不传相同，仍是 size-2。",
        control: { kind: "range", value: 8, min: 4, max: 20, step: 1 },
      },
      {
        name: "gap",
        type: "number",
        description: "点间距（像素）。6 与不传相同，仍是 gap-1.5。",
        control: { kind: "range", value: 6, min: 0, max: 16, step: 1 },
      },
      {
        name: "duration",
        type: "number",
        description: "弹跳周期（毫秒）。900 与不传相同。",
        control: { kind: "range", value: 900, min: 360, max: 1800, step: 10 },
      },
      {
        name: "delay",
        type: "number",
        description: "相邻点的错开毫秒。120 与不传相同。",
        control: { kind: "range", value: 120, min: 0, max: 300, step: 10 },
      },
      {
        name: "color",
        type: "string",
        description: "点的颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
      ...uiProps,
    ],
    presets: [
      { name: "dots-loader-sparse", label: "疏", values: { count: 2, gap: 12, duration: 1400, delay: 160 } },
      { name: "dots-loader-default", label: "默认", values: { count: 3, size: 8, gap: 6, duration: 900, delay: 120 } },
      { name: "dots-loader-dense", label: "密", values: { count: 5, size: 6, gap: 4, duration: 500, delay: 60 } },
    ],
  },
  {
    name: "progress-ring",
    title: "Progress Ring",
    description: "环形进度。",
    category: "loaders",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/progress-ring.tsx",
    target: "components/ui/progress-ring.tsx",
    props: [
      {
        name: "value",
        type: "number",
        description: "0-100 进度。",
        control: { kind: "range", value: 72, min: 0, max: 100, step: 1 },
      },
      {
        name: "size",
        type: "number",
        defaultValue: "72",
        description: "直径（像素）。",
        control: { kind: "range", value: 72, min: 40, max: 160, step: 2 },
      },
      {
        name: "strokeWidth",
        type: "number",
        defaultValue: "6",
        description: "描边宽度。",
        control: { kind: "range", value: 6, min: 2, max: 16, step: 1 },
      },
      {
        name: "duration",
        type: "number",
        description: "进度过渡毫秒。500 与不传相同。",
        control: { kind: "range", value: 500, min: 200, max: 1000, step: 10 },
      },
      {
        name: "color",
        type: "string",
        description: "进度弧颜色。不传则跟随主题。",
        control: { kind: "color" },
      },
    ],
    presets: [
      { name: "progress-ring-thin", label: "细", values: { size: 56, strokeWidth: 3, duration: 800 } },
      { name: "progress-ring-default", label: "默认", values: { size: 72, strokeWidth: 6, duration: 500 } },
      { name: "progress-ring-thick", label: "粗", values: { size: 96, strokeWidth: 10, duration: 280 } },
    ],
  },
  {
    name: "reveal",
    title: "Reveal",
    description: "滚动进入视口时按变体显现。",
    category: "scroll",
    source: "original",
    type: "registry:ui",
    file: "effects/reveal.tsx",
    target: "components/ui/reveal.tsx",
    props: [
      {
        name: "variant",
        type: '"fade" | "blur" | "slide" | "clip"',
        defaultValue: '"fade"',
        description: "显现方式。",
        control: { kind: "select", value: "fade", options: ["fade", "blur", "slide", "clip"] },
      },
      {
        name: "from",
        type: '"left" | "right" | "top" | "bottom"',
        defaultValue: '"bottom"',
        description: "滑入方向，仅 slide。",
        control: { kind: "select", value: "bottom", options: ["left", "right", "top", "bottom"] },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "入场延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "once",
        type: "boolean",
        defaultValue: "true",
        description: "是否只播放一次。",
        control: { kind: "boolean", value: true },
      },
      {
        name: "blur",
        type: "number",
        defaultValue: "8",
        description: "初始模糊像素，仅 blur。",
        control: { kind: "range", value: 8, min: 0, max: 24, step: 1 },
      },
      {
        name: "as",
        type: '"div" | "section"',
        defaultValue: '"div"',
        description: "渲染元素。",
        control: { kind: "select", value: "div", options: ["div", "section"] },
      },
      {
        name: "speed",
        type: "number",
        description: "入场速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "位移和模糊的强度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "reveal-fade", label: "淡入", values: { variant: "fade", from: "bottom", delay: 0, once: true, blur: 8, as: "div", speed: 1, intensity: 1 } },
      { name: "reveal-slide", label: "滑入", values: { variant: "slide", from: "left", delay: 0.1, once: true, blur: 8, as: "div", speed: 1, intensity: 1 } },
      { name: "reveal-blur", label: "模糊", values: { variant: "blur", from: "bottom", delay: 0, once: true, blur: 16, as: "div", speed: 1.4, intensity: 1 } },
    ],
  },
  {
    name: "fade-in",
    title: "Fade In",
    description: "进入视口时淡入上移。",
    category: "scroll",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/fade-in.tsx",
    target: "components/ui/fade-in.tsx",
    props: [
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "入场延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "once",
        type: "boolean",
        defaultValue: "true",
        description: "是否只播放一次。",
        control: { kind: "boolean", value: true },
      },
      {
        name: "speed",
        type: "number",
        description: "入场速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "上移距离的强度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "fade-in-soft", label: "轻", values: { delay: 0, once: true, speed: 1, intensity: 0.5 } },
      { name: "fade-in-default", label: "默认", values: { delay: 0, once: true, speed: 1, intensity: 1 } },
      { name: "fade-in-late", label: "延迟", values: { delay: 0.3, once: true, speed: 0.7, intensity: 1 } },
    ],
  },
  {
    name: "slide-in",
    title: "Slide In",
    description: "从指定方向滑入。",
    category: "scroll",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/slide-in.tsx",
    target: "components/ui/slide-in.tsx",
    props: [
      {
        name: "from",
        type: '"left" | "right" | "top" | "bottom"',
        defaultValue: '"bottom"',
        description: "滑入方向。",
        control: { kind: "select", value: "bottom", options: ["left", "right", "top", "bottom"] },
      },
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "入场延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "speed",
        type: "number",
        description: "入场速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "滑入距离的强度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "slide-in-bottom", label: "从下", values: { from: "bottom", delay: 0, speed: 1, intensity: 1 } },
      { name: "slide-in-left", label: "从左", values: { from: "left", delay: 0.1, speed: 1, intensity: 1 } },
      { name: "slide-in-short", label: "短距", values: { from: "right", delay: 0, speed: 1.4, intensity: 0.4 } },
    ],
  },
  {
    name: "stagger-list",
    title: "Stagger List",
    description: "列表子项错落入场。",
    category: "scroll",
    source: "Motion Primitives",
    type: "registry:ui",
    file: "effects/stagger-list.tsx",
    target: "components/ui/stagger-list.tsx",
    props: [
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "起始延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "speed",
        type: "number",
        description: "错落速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "子项上移距离的强度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "gap",
        type: "number",
        description: "列表间距（像素）。8 与不传相同，沿用 gap-2。",
        control: { kind: "range", value: 8, min: 0, max: 32, step: 1 },
      },
    ],
    presets: [
      { name: "stagger-default", label: "默认", values: { delay: 0, speed: 1, intensity: 1, gap: 8 } },
      { name: "stagger-tight", label: "紧凑", values: { delay: 0, speed: 1.4, intensity: 0.6, gap: 4 } },
      { name: "stagger-loose", label: "疏松", values: { delay: 0.15, speed: 0.7, intensity: 1, gap: 16 } },
    ],
  },
  {
    name: "parallax",
    title: "Parallax",
    description: "滚动视差位移。",
    category: "scroll",
    source: "original",
    type: "registry:ui",
    file: "effects/parallax.tsx",
    target: "components/ui/parallax.tsx",
    props: [
      {
        name: "offset",
        type: "number",
        defaultValue: "80",
        description: "视差位移像素。组件默认 80，文档预览从 40 起步。",
        control: { kind: "range", value: 40, min: 0, max: 240, step: 1 },
      },
      {
        name: "speed",
        type: "number",
        description: "滚动曲线倍率。1 与不传相同，位移仍随进度线性变化。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "位移幅度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "scale",
        type: "number",
        description: "内容缩放。1 与不传相同，不额外缩放。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
    ],
    presets: [
      { name: "parallax-preview", label: "预览", values: { offset: 40, speed: 1, intensity: 1, scale: 1 } },
      { name: "parallax-deep", label: "更深", values: { offset: 120, speed: 1, intensity: 1, scale: 1 } },
      { name: "parallax-soft", label: "轻", values: { offset: 40, speed: 1, intensity: 0.4, scale: 1.1 } },
    ],
  },
  {
    name: "blur-fade",
    title: "Blur Fade",
    description: "模糊消散后显现。",
    category: "scroll",
    source: "Magic UI",
    type: "registry:ui",
    file: "effects/blur-fade.tsx",
    target: "components/ui/blur-fade.tsx",
    props: [
      {
        name: "delay",
        type: "number",
        defaultValue: "0",
        description: "入场延迟（秒）。",
        control: { kind: "range", value: 0, min: 0, max: 1.5, step: 0.05 },
      },
      {
        name: "blur",
        type: "number",
        defaultValue: "8",
        description: "初始模糊像素。",
        control: { kind: "range", value: 8, min: 0, max: 24, step: 1 },
      },
      {
        name: "speed",
        type: "number",
        description: "入场速度倍率。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "模糊和位移的强度。1 与不传相同。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
    ],
    presets: [
      { name: "blur-fade-default", label: "默认", values: { delay: 0, blur: 8, speed: 1, intensity: 1 } },
      { name: "blur-fade-soft", label: "轻", values: { delay: 0, blur: 4, speed: 1, intensity: 0.5 } },
      { name: "blur-fade-heavy", label: "重", values: { delay: 0.1, blur: 16, speed: 0.7, intensity: 1 } },
    ],
  },
  ...batch2Components,
  ...batch3Components,
  ...batch4Components,
  ...batch5Components,
  ...batch6Components,
  ...batch7Components,
  ...batch8Components,
  ...batch9Components,
  ...batch10Components,
  ...batch11Components,
  ...batch12Components,
  ...batch13Components,
  ...batch14Components,
  ...batch15Components,
  ...batch16Components,
  ...batch17Components,
  ...batch18Components,
  ...batch19Components,
  ...batch20Components,
  ...batch21Components,
  ...batch22Components,
  ...batch23Components,
  ...batch24Components,
  ...batch25Components,
  ...batch26Components,
  ...batch27Components,
  ...batch28Components,
  ...batch29Components,
  ...batch30Components,
  ...batch31Components,
  ...batch32Components,
  ...batch33Components,
  ...batch34Components,
  ...batch35Components,
  ...batch36Components,
  ...batch40Components,
]

export function getComponent(name: string): ComponentMeta | undefined {
  return components.find((item) => item.name === name)
}

export function uiSubgroupsOf(items: readonly ComponentMeta[]) {
  return subgroupOrder
    .map((subgroup) => ({
      subgroup,
      label: subgroupLabels[subgroup],
      items: items.filter((item) => item.subgroup === subgroup),
    }))
    .filter((section) => section.items.length > 0)
}

function uiItemsInSubgroupOrder(items: readonly ComponentMeta[]) {
  return [...items].sort((a, b) => {
    const aRank = a.subgroup ? subgroupOrder.indexOf(a.subgroup) : subgroupOrder.length
    const bRank = b.subgroup ? subgroupOrder.indexOf(b.subgroup) : subgroupOrder.length
    return aRank - bRank
  })
}

export function getComponentsByCategory() {
  return categoryOrder.map((category) => {
    const items = components.filter(
      (item) =>
        item.category === category && (item.type === "registry:ui" || item.type === "registry:block"),
    )
    return {
      category,
      label: categoryLabels[category],
      items: category === "ui" ? uiItemsInSubgroupOrder(items) : items,
    }
  })
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
  { key: "base", label: "基础", names: ["button", "button-group", "button-plus"] },
  {
    key: "motion",
    label: "动效",
    names: [
      "fuse-button",
      "hold-button",
      "ripple-button",
      "shimmer-button",
      "pulse-button",
      "neon-button",
      "rainbow-button",
      "interactive-hover-button",
      "gooey-button",
      "particle-button",
      "tear-button",
      "animated-subscribe-button",
      "copy-button",
      "pull-cord",
      "undo-button",
      "attract-button",
      "loading-button",
      "star-wars-button",
      "hover-attention-button",
      "eco-mode-button",
      "rotating-complete-button",
      "stitches-button",
      "heartbeat-button",
      "neubrutalism-button",
      "3d-button",
      "heart-like-button",
      "download-size-button",
      "lift-gradient-border-button",
      "async-morph-button",
      "follow-button",
      "share-button",
    ],
  },
]

const inputFamilySections: readonly FamilySectionSpec[] = [
  {
    key: "base",
    label: "基础",
    names: ["input", "input-group", "input-otp", "input-plus", "floating-label-input"],
  },
  {
    key: "specialized",
    label: "专用",
    names: [
      "tag-input",
      "phone-input",
      "currency-input",
      "coupon-input",
      "prompt-input",
      "mic-search-input",
      "newsletter-input",
      "pin-display-input",
    ],
  },
  { key: "motion", label: "动效", names: ["placeholder-vanish-input"] },
]

const checkboxFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["checkbox"] },
  { key: "plus", label: "增强", names: ["checkbox-plus"] },
  { key: "motion", label: "动效", names: ["spring-check"] },
]

const switchFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["switch"] },
  { key: "plus", label: "增强", names: ["switch-plus"] },
  { key: "motion", label: "动效", names: ["squish-switch", "labeled-toggle"] },
]

const radioFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["radio-group"] },
  { key: "plus", label: "增强", names: ["radio-plus", "choicebox"] },
  { key: "motion", label: "动效", names: ["jelly-radio"] },
]

const selectFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["select", "native-select", "combobox"] },
  { key: "plus", label: "增强", names: ["select-plus", "multi-select"] },
]

const textareaFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["textarea"] },
  { key: "plus", label: "增强", names: ["autosize-textarea", "mention-textarea"] },
]

const sliderFamilySections: readonly FamilySectionSpec[] = [
  { key: "base", label: "基础", names: ["slider"] },
  { key: "plus", label: "增强", names: ["dual-range-slider"] },
]

export type ComponentCluster =
  | "button"
  | "input"
  | "checkbox"
  | "switch"
  | "radio"
  | "select"
  | "textarea"
  | "slider"

const controlFamilyGroups: readonly {
  key: ComponentCluster
  label: string
  sections: readonly FamilySectionSpec[]
}[] = [
  { key: "checkbox", label: "复选", sections: checkboxFamilySections },
  { key: "switch", label: "开关", sections: switchFamilySections },
  { key: "radio", label: "单选", sections: radioFamilySections },
  { key: "select", label: "选择", sections: selectFamilySections },
  { key: "textarea", label: "多行文本", sections: textareaFamilySections },
  { key: "slider", label: "滑块", sections: sliderFamilySections },
]

const controlClusterByName = new Map<string, ComponentCluster>(
  controlFamilyGroups.flatMap((group) =>
    group.sections.flatMap((section) => section.names.map((name) => [name, group.key] as const)),
  ),
)

/** 文档导航按这个归组，不改 category。 */
export function componentCluster(name: string): ComponentCluster | undefined {
  // 拉绳开关名字不带 button，文档导航仍归到按钮组。
  if (name === "button" || name.startsWith("button-") || name.endsWith("-button") || name === "pull-cord") return "button"
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

export function getCatalogGroups(): CatalogGroup[] {
  const clustered = new Set(
    visibleComponents.flatMap((item) => (componentCluster(item.name) ? [item.name] : [])),
  )
  const groups: CatalogGroup[] = []
  for (const category of categoryOrder) {
    const items = components.filter(
      (item) =>
        item.category === category &&
        (item.type === "registry:ui" || item.type === "registry:block") &&
        !clustered.has(item.name),
    )
    if (items.length === 0) continue
    if (category !== "ui") {
      groups.push({ key: category, label: categoryLabels[category], items, sections: [] })
      continue
    }
    const sections = uiSubgroupsOf(items).map((section) => ({
      key: section.subgroup,
      label: section.label,
      items: section.items,
    }))
    groups.push({
      key: category,
      label: categoryLabels[category],
      items: sections.flatMap((section) => [...section.items]),
      sections,
    })
  }
  const uiIndex = groups.findIndex((group) => group.key === "ui")
  groups.splice(
    uiIndex === -1 ? 0 : uiIndex + 1,
    0,
    buildFamilyGroup("button", "按钮", buttonFamilySections),
    buildFamilyGroup("input", "输入", inputFamilySections),
    ...controlFamilyGroups.map((group) => buildFamilyGroup(group.key, group.label, group.sections)),
  )
  return groups
}

export function relatedComponents(name: string): readonly ComponentMeta[] {
  const cluster = componentCluster(name)
  if (!cluster) return []
  const group = getCatalogGroups().find((entry) => entry.key === cluster)
  if (!group) return []
  return group.items.filter((item) => item.name !== name)
}
