import type { ComponentMeta, PropDoc } from "./catalog"
import { cult, cultFile } from "./catalog-sources"

/** Primitive，布局。 */
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

export const primitiveLayoutComponents: ComponentMeta[] = [
  {
    name: "card",
    batch: 1,
    title: "Card",
    description: "通用卡片容器。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/card.tsx",
    target: "components/ui/card.tsx",
    props: uiProps,
  },
  {
    name: "separator",
    batch: 1,
    title: "Separator",
    description: "水平或垂直分隔线。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/separator.tsx",
    target: "components/ui/separator.tsx",
    props: [
      { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "方向。" },
      { name: "decorative", type: "boolean", defaultValue: "true", description: "是否只做装饰。true 与不传相同。" },
    ],
  },
  {
    name: "accordion",
    batch: 1,
    title: "Accordion",
    description: "手风琴折叠面板。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/accordion.tsx",
    target: "components/ui/accordion.tsx",
    props: uiProps,
  },
  {
    name: "aspect-ratio",
    batch: 2,
    title: "Aspect Ratio",
    description: "固定宽高比容器。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/aspect-ratio.tsx",
    target: "components/ui/aspect-ratio.tsx",
    props: [{ name: "ratio", type: "number", defaultValue: "1", description: "宽高比。" }],
  },
  {
    name: "resizable",
    batch: 2,
    title: "Resizable",
    description: "可拖拽分割面板。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/resizable.tsx",
    target: "components/ui/resizable.tsx",
    props: [
      ...ui2,
      { name: "withHandle", type: "boolean", description: "分割线是否显示把手。不传时不显示。" },
    ],
  },
  {
    name: "scroll-area",
    batch: 2,
    title: "Scroll Area",
    description: "自定义滚动区域。",
    layer: "primitive",
    purposeGroup: "layout",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/scroll-area.tsx",
    target: "components/ui/scroll-area.tsx",
    props: [
      ...ui2,
      { name: "orientation", type: '"vertical" | "horizontal"', defaultValue: '"vertical"', description: "滚动条方向。vertical 与不传相同。" },
    ],
  },
  {
    name: "texture-card",
    batch: 43,
    title: "Texture Card",
    description: `${cult} ${cultFile("texture-card.tsx")} 五层嵌套描边。styled 为 false 时圆角跟着 --radius，底色从 card 过渡到 secondary。styled 为 true 时固定 24px 圆角和中性灰渐变。配合 TextureCardHeader、Title、Description、Content、Footer、TextureSeparator 使用。没有循环动画。`,
    layer: "primitive",
    purposeGroup: "layout",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/texture-card.tsx",
    target: "components/ui/texture-card.tsx",
    props: [
      { name: "styled", type: "boolean", defaultValue: "false", description: "true 用固定 24px 的中性灰卡片，false 跟随主题圆角。" },
      { name: "children", type: "ReactNode", description: "放在最内层的内容。" },
      ...ui43,
    ],
  },
]

