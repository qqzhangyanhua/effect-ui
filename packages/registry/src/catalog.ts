import { batch2Components } from "./catalog-batch2"
import { batch3Components } from "./catalog-batch3"
import { batch4Components } from "./catalog-batch4"
import { batch5Components } from "./catalog-batch5"
import { batch6Components } from "./catalog-batch6"
import { batch7Components } from "./catalog-batch7"
import { batch8Components } from "./catalog-batch8"
import { batch9Components } from "./catalog-batch9"

export type ComponentCategory =
  | "ui"
  | "text"
  | "backgrounds"
  | "cursor"
  | "showcase"
  | "decor"
  | "cards"
  | "buttons"
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
  | "Kibo UI"
  | "Origin UI"
  | "Paper Shaders"
  | "Kokonut UI"
  | "Number Flow"
  | "liquid-glass-react"
  | "prompt-kit"
  | "Tailark"
  | "Eldora UI"
  | "Smooth UI"
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
  | "original"

export interface PropDoc {
  name: string
  type: string
  defaultValue?: string
  description: string
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
  "Kibo UI": "https://www.kibo-ui.com",
  "Origin UI": "https://coss.com/origin",
  "Paper Shaders": "https://shaders.paper.design",
  "Kokonut UI": "https://kokonutui.com",
  "Number Flow": "https://number-flow.barvian.me",
  "liquid-glass-react": "https://github.com/rdev/liquid-glass-react",
  "prompt-kit": "https://www.prompt-kit.com",
  Tailark: "https://tailark.com",
  "Eldora UI": "https://www.eldoraui.site",
  "Smooth UI": "https://smoothui.dev",
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
      { name: "text", type: "string", description: "要逐字显示的文本。" },
      { name: "duration", type: "number", defaultValue: "80", description: "每个字符的间隔（毫秒）。" },
      { name: "loop", type: "boolean", defaultValue: "false", description: "是否循环打字 / 删除。" },
      { name: "cursor", type: "boolean", defaultValue: "true", description: "是否显示光标。" },
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
    props: [{ name: "colors", type: "string", defaultValue: "from-violet-500 via-fuchsia-500 to-cyan-400", description: "Tailwind 渐变色类。" }],
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
    props: uiProps,
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
    props: uiProps,
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
      { name: "text", type: "string", description: "文本内容。" },
      { name: "by", type: '"char" | "word"', defaultValue: '"char"', description: "拆分粒度。" },
      { name: "delay", type: "number", defaultValue: "0", description: "入场延迟（秒）。" },
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
    props: [{ name: "color", type: "string", defaultValue: "var(--primary)", description: "高亮颜色。" }],
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
      { name: "value", type: "number", description: "目标数字。" },
      { name: "direction", type: '"up" | "down"', defaultValue: '"up"', description: "计数方向。" },
      { name: "delay", type: "number", defaultValue: "0", description: "延迟（秒）。" },
      { name: "decimalPlaces", type: "number", defaultValue: "0", description: "小数位。" },
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
      { name: "quantity", type: "number", defaultValue: "60", description: "粒子数量。" },
      { name: "staticity", type: "number", defaultValue: "50", description: "静止程度，越高越不跟随。" },
      { name: "ease", type: "number", defaultValue: "50", description: "缓动阻尼。" },
      { name: "color", type: "string", defaultValue: "currentColor", description: "粒子颜色。" },
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
      { name: "width", type: "number", defaultValue: "40", description: "单元格宽。" },
      { name: "height", type: "number", defaultValue: "40", description: "单元格高。" },
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
      { name: "width", type: "number", defaultValue: "16", description: "水平间距。" },
      { name: "height", type: "number", defaultValue: "16", description: "垂直间距。" },
      { name: "cr", type: "number", defaultValue: "1", description: "圆点半径。" },
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
    props: [{ name: "number", type: "number", defaultValue: "18", description: "流星数量。" }],
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
    props: uiProps,
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
    props: [{ name: "rings", type: "number", defaultValue: "4", description: "圆环数量。" }],
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
      { name: "squareSize", type: "number", defaultValue: "4", description: "方块尺寸。" },
      { name: "flickerChance", type: "number", defaultValue: "0.18", description: "每帧闪烁概率。" },
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
      { name: "spotlightColor", type: "string", description: "聚光颜色。" },
      { name: "radius", type: "number", defaultValue: "240", description: "聚光半径。" },
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
    props: [{ name: "strength", type: "number", defaultValue: "0.35", description: "吸附强度。" }],
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
    props: [{ name: "size", type: "number", defaultValue: "28", description: "光标尺寸。" }],
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
    props: [{ name: "maxTilt", type: "number", defaultValue: "12", description: "最大倾斜角度。" }],
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
    props: [{ name: "glowColor", type: "string", defaultValue: "var(--primary)", description: "发光颜色。" }],
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
    props: uiProps,
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
      { name: "shineColor", type: "string", defaultValue: "var(--primary)", description: "高光颜色。" },
      { name: "duration", type: "number", defaultValue: "10", description: "旋转周期（秒）。" },
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
    props: uiProps,
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
    props: [{ name: "rippleColor", type: "string", description: "波纹颜色。" }],
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
    props: [{ name: "shimmerColor", type: "string", description: "光泽颜色。" }],
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
    props: uiProps,
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
    props: [{ name: "glowColor", type: "string", defaultValue: "var(--primary)", description: "霓虹颜色。" }],
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
    props: [{ name: "size", type: "number", defaultValue: "28", description: "直径。" }],
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
      { name: "size", type: "number", defaultValue: "56", description: "容器尺寸。" },
      { name: "dots", type: "number", defaultValue: "6", description: "轨道点数。" },
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
    props: uiProps,
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
      { name: "value", type: "number", description: "0-100 进度。" },
      { name: "size", type: "number", defaultValue: "72", description: "直径。" },
      { name: "strokeWidth", type: "number", defaultValue: "6", description: "描边宽度。" },
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
      },
      {
        name: "from",
        type: '"left" | "right" | "top" | "bottom"',
        defaultValue: '"bottom"',
        description: "滑入方向，仅 slide。",
      },
      { name: "delay", type: "number", defaultValue: "0", description: "延迟（秒）。" },
      { name: "once", type: "boolean", defaultValue: "true", description: "是否只播放一次。" },
      { name: "blur", type: "number", defaultValue: "8", description: "初始模糊像素，仅 blur。" },
      { name: "as", type: '"div" | "section"', defaultValue: '"div"', description: "渲染元素。" },
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
      { name: "delay", type: "number", defaultValue: "0", description: "延迟（秒）。" },
      { name: "once", type: "boolean", defaultValue: "true", description: "是否只播放一次。" },
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
      { name: "from", type: '"left" | "right" | "top" | "bottom"', defaultValue: '"bottom"', description: "滑入方向。" },
      { name: "delay", type: "number", defaultValue: "0", description: "延迟（秒）。" },
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
    props: [{ name: "delay", type: "number", defaultValue: "0", description: "起始延迟（秒）。" }],
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
    props: [{ name: "offset", type: "number", defaultValue: "80", description: "视差位移像素。" }],
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
      { name: "delay", type: "number", defaultValue: "0", description: "延迟（秒）。" },
      { name: "blur", type: "number", defaultValue: "8", description: "初始模糊像素。" },
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
