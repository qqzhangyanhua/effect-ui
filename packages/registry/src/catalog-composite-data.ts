import type { ComponentMeta, PropDoc } from "./catalog"

/** Composite component，数据展示。 */
const ui14: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const compositeDataComponents: ComponentMeta[] = [
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
    }
]

