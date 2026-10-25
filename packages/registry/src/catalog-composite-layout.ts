import type { ComponentMeta, PropDoc } from "./catalog"
import { cult, cultFile, neo, syntax, syntaxFile } from "./catalog-sources"

/** Composite component，布局。 */
const ui11: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui34: PropDoc[] = [
  { name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" },
]
const ui43: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const compositeLayoutComponents: ComponentMeta[] = [
  {
    name: "css-accordion-auto",
    batch: 11,
    title: "CSS Accordion Auto",
    description: "原创。原生 details 用 interpolate-size 过渡到 height auto，不支持时测量高度。",
    layer: "composite",
    purposeGroup: "layout",
    source: "original",
    type: "registry:ui",
    file: "ui/css-accordion-auto.tsx",
    target: "components/ui/css-accordion-auto.tsx",
    props: [{ name: "items", type: "AccordionItem[]", description: "折叠项。" }, ...ui11],
  },
  {
    name: "minimal-accordion",
    batch: 34,
    title: "Minimal Accordion",
    description: `${syntax} ${syntaxFile("components/accordion/MinimalAccordion.tsx")} 极简手风琴。type 为 single 或 multiple，支持受控。按钮带 aria-expanded 与 aria-controls。framer-motion 已改为 motion/react。减弱动效时面板直接展开或收起。`,
    layer: "composite",
    purposeGroup: "layout",
    source: "SyntaxUI",
    type: "registry:ui",
    file: "effects/minimal-accordion.tsx",
    target: "components/ui/minimal-accordion.tsx",
    props: [
      { name: "items", type: "{ value: string; title: string; content: ReactNode }[]", description: "面板列表。" },
      { name: "type", type: '"single" | "multiple"', defaultValue: "single", description: "single 同时只展开一项，multiple 可展开多项。" },
      { name: "value", type: "string | readonly string[]", description: "受控展开值。single 为字符串，multiple 为字符串数组。" },
      { name: "defaultValue", type: "string | readonly string[]", description: "非受控时的初始展开值。" },
      { name: "onValueChange", type: "(value: string | readonly string[]) => void", description: "展开值变化时调用。" },
      ...ui34,
    ],
  },
  {
    name: "folded-card",
    batch: 43,
    title: "Folded Card",
    description: `${cult} ${cultFile("folded-card.tsx")} 右上角折页用 clip-path 切出，折角是 40px 的渐变三角。预览区可以铺虚线网格，gridRows 和 gridColumns 控制行列。href、title、badge、description 可配。这张卡没有循环动画。`,
    layer: "composite",
    purposeGroup: "layout",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/folded-card.tsx",
    target: "components/ui/folded-card.tsx",
    props: [
      {
        name: "href",
        type: "string",
        description: "有值时整张卡是链接。预览写成 #folded。",
        control: { kind: "text", value: "#folded" },
      },
      {
        name: "title",
        type: "string",
        description: "页脚标题。预览写成现场笔记。",
        control: { kind: "text", value: "现场笔记" },
      },
      { name: "badge", type: "ReactNode", description: "标题旁的小标签。" },
      { name: "description", type: "ReactNode", description: "页脚说明，最多三行。" },
      {
        name: "gridRows",
        type: "number",
        defaultValue: "4",
        description: "预览区虚线的行数。4 与不传相同。",
        control: { kind: "range", value: 4, min: 2, max: 8, step: 1 },
      },
      { name: "gridColumns", type: "number", defaultValue: "4", description: "预览区虚线的列数。" },
      { name: "children", type: "ReactNode", description: "叠在网格上的预览内容。" },
      ...ui43,
    ],
  },
  {
    name: "caption-image-card",
    batch: 44,
    title: "Caption Image Card",
    description: `${neo} https://github.com/ekmas/neobrutalism-components/blob/main/src/components/ui/image-card.tsx 250 像素宽的图文卡片，2 像素边框，4 像素无模糊偏移阴影，圆角 5 像素。figure 包住图片，figcaption 放 caption。alt 不传时用 caption。图片由调用方传入，示例使用内嵌矢量图。没有循环动画。`,
    layer: "composite",
    purposeGroup: "layout",
    source: "Neobrutalism",
    type: "registry:ui",
    file: "effects/caption-image-card.tsx",
    target: "components/ui/caption-image-card.tsx",
    props: [
      {
        name: "imageUrl",
        type: "string",
        description: "图片地址。预览用内嵌矢量图。",
        control: {
          kind: "text",
          value:
            "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%2305e17a%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22130%22%20r%3D%2254%22%20fill%3D%22%23111111%22%2F%3E%3Crect%20x%3D%2270%22%20y%3D%22210%22%20width%3D%22260%22%20height%3D%2218%22%20rx%3D%224%22%20fill%3D%22%23111111%22%2F%3E%3C%2Fsvg%3E",
        },
      },
      {
        name: "caption",
        type: "string",
        description: "图片下方的说明。预览写成现场记下的颜色。",
        control: { kind: "text", value: "现场记下的颜色" },
      },
      {
        name: "alt",
        type: "string",
        description: "图片替代文字。预览写成一块绿色底板和黑色圆点，不传时用 caption。",
        control: { kind: "text", value: "一块绿色底板和黑色圆点" },
      },
      ...ui43,
    ],
  },
]

