import type { ComponentMeta, PropDoc } from "./catalog"
import { cult, cultFile } from "./catalog-sources"

/** Primitive，反馈。 */
const uiProps: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui2: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui43: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const primitiveFeedbackComponents: ComponentMeta[] = [
  {
    name: "sonner",
    batch: 1,
    title: "Toast",
    description: "基于 Sonner 的轻提示。",
    layer: "primitive",
    purposeGroup: "feedback",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/sonner.tsx",
    target: "components/ui/sonner.tsx",
    props: uiProps,
  },
  {
    name: "alert",
    batch: 2,
    title: "Alert",
    description: "内联提示条。",
    layer: "primitive",
    purposeGroup: "feedback",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/alert.tsx",
    target: "components/ui/alert.tsx",
    props: [{ name: "variant", type: '"default" | "destructive"', defaultValue: '"default"', description: "视觉变体。" }],
  },
  {
    name: "progress",
    batch: 2,
    title: "Progress",
    description: "线性进度条。",
    layer: "primitive",
    purposeGroup: "feedback",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/progress.tsx",
    target: "components/ui/progress.tsx",
    props: [{ name: "value", type: "number", description: "0-100 进度。" }],
  },
  {
    name: "skeleton",
    batch: 2,
    title: "Skeleton",
    description: "加载占位骨架。",
    layer: "primitive",
    purposeGroup: "feedback",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/skeleton.tsx",
    target: "components/ui/skeleton.tsx",
    props: ui2,
  },
  {
    name: "speech-bubble",
    batch: 43,
    title: "Speech Bubble",
    description: `${cult} ${cultFile("speech-bubble.tsx")} 圆角气泡配右侧尾巴。showCursor 为 true 时在 md 以上显示一枚会呼吸的光标，周期 1.4 秒。减弱动效或离开视口时光标停住，文字仍在。`,
    layer: "primitive",
    purposeGroup: "feedback",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/speech-bubble.tsx",
    target: "components/ui/speech-bubble.tsx",
    props: [
      { name: "showCursor", type: "boolean", defaultValue: "true", description: "是否显示尾部光标。" },
      { name: "children", type: "ReactNode", description: "气泡里的话。" },
      ...ui43,
    ],
  },
]

