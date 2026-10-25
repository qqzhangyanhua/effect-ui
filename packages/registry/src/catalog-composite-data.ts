import type { ComponentMeta, PropDoc } from "./catalog"
import { cult, cultFile, kibo, kiboFile } from "./catalog-sources"

/** Composite component，数据展示。 */
const ui14: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui30: PropDoc[] = [
  { name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" },
]
const ui43: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const compositeDataComponents: ComponentMeta[] = [
  {
    name: "data-table",
    batch: 2,
    title: "Data Table",
    description: "可排序分页的数据表示例。",
    layer: "composite",
    purposeGroup: "data",
    source: "shadcn/ui",
    type: "registry:ui",
    file: "ui/data-table.tsx",
    target: "components/ui/data-table.tsx",
    props: [
      { name: "columns", type: "ColumnDef[]", description: "列定义。" },
      { name: "data", type: "TData[]", description: "行数据。" },
    ],
  },
  {
    name: "avatar-group-tooltip",
    batch: 14,
    title: "Avatar Group Tooltip",
    description: "灵感来自 Hover.dev，原创实现。重叠头像在悬停时抬起，名字提示跟随指针，超出数量显示 +N。",
    layer: "composite",
    purposeGroup: "data",
    source: "original",
    type: "registry:ui",
    file: "effects/avatar-group-tooltip.tsx",
    target: "components/ui/avatar-group-tooltip.tsx",
    props: [
      { name: "people", type: "AvatarPerson[]", description: "姓名和头像底色。" },
      {
        name: "max",
        type: "number",
        defaultValue: "4",
        description: "直接展示的人数，其余计入 +N。",
        control: { kind: "range", value: 4, min: 1, max: 8, step: 1 },
      },
      {
        name: "scale",
        type: "number",
        description: "悬停放大的倍率。1 与不传相同，悬停仍是 1.06。",
        control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
      },
      {
        name: "intensity",
        type: "number",
        description: "抬起距离的倍率。1 与不传相同，仍是 8px。",
        control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
      },
      {
        name: "size",
        type: "number",
        description: "头像边长（像素）。48 与不传相同。",
        control: { kind: "range", value: 48, min: 28, max: 80, step: 2 },
      },
      {
        name: "speed",
        type: "number",
        description: "弹簧倍率。1 与不传相同，刚度仍是 420。",
        control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
      },
      ...ui14,
    ],
    presets: [
      { name: "avatar-group-compact", label: "小", values: { max: 3, scale: 1, intensity: 0.4, size: 36, speed: 1 } },
      { name: "avatar-group-default", label: "默认", values: { max: 4, scale: 1, intensity: 1, size: 48, speed: 1 } },
      { name: "avatar-group-pop", label: "抬", values: { max: 5, scale: 1.3, intensity: 1, size: 48, speed: 1.6 } },
    ],
  },
  {
    name: "pill",
    batch: 30,
    title: "Pill",
    description: `${kibo} ${kiboFile("pill")} 状态胶囊，可以放头像、头像组、状态点、涨跌、按钮和图标。PillIndicator 的 variant 是 success、error、warning、info，pulse 控制闪烁。减弱动效时不闪。`,
    layer: "composite",
    purposeGroup: "data",
    source: "Kibo UI",
    type: "registry:ui",
    file: "effects/pill.tsx",
    target: "components/ui/pill.tsx",
    props: [
      { name: "themed", type: "boolean", defaultValue: "false", description: "是否加强主题边框。" },
      { name: "variant", type: '"default" | "secondary" | "destructive" | "outline"', defaultValue: "secondary", description: "Badge 变体。" },
      ...ui30,
    ],
  },
  {
    name: "collab-avatar",
    batch: 43,
    title: "Collab Avatar",
    description: `${cult} ${cultFile("collab-avatar.tsx")} 从名字取一到两个首字母。color 传十六进制时，底色用该色的 18 和 3a 透明度叠两层渐变。入场 0.22 秒从 0.92 放到 1，缓动 [0.2, 0, 0, 1]。size 单位是像素。减弱动效时直接显示最终大小。颜色不是十六进制时退回纯色底，字母仍可读。`,
    layer: "composite",
    purposeGroup: "data",
    source: "Cult UI",
    type: "registry:ui",
    file: "effects/collab-avatar.tsx",
    target: "components/ui/collab-avatar.tsx",
    props: [
      { name: "name", type: "string", description: "姓名，也是读屏标签。" },
      { name: "color", type: "string", description: "十六进制颜色，用于字母、描边和底色。" },
      { name: "size", type: "number", defaultValue: "24", description: "直径，单位像素。" },
      ...ui43,
    ],
  },
]

