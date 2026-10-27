import type { ComponentMeta, PropDoc } from "./catalog"

/** Widget，浮层。 */
const ui14: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]

export const widgetOverlayComponents: ComponentMeta[] = [
  {
      name: "link-preview",
      batch: 14,
      title: "Link Preview",
      description: "灵感来自 Hover.dev，原创实现。悬停或聚焦链接时，弹簧卡片展示标题和页面图。图片用 image 属性，不调用截图服务。",
      layer: "widget",
      purposeGroup: "overlay",
      source: "original",
      type: "registry:ui",
      file: "effects/link-preview.tsx",
      target: "components/ui/link-preview.tsx",
      props: [
        { name: "href", type: "string", description: "链接地址。" },
        { name: "title", type: "string", description: "卡片标题。" },
        { name: "description", type: "string", description: "卡片说明。" },
        { name: "image", type: "string", description: "页面图地址。缺省为内置色块。" },
        { name: "children", type: "ReactNode", description: "链接文字。" },
        {
          name: "intensity",
          type: "number",
          description: "弹出上移的倍率。1 与不传相同，起始仍是 10px。",
          control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
        },
        {
          name: "scale",
          type: "number",
          description: "弹出起始缩放的倍率。1 与不传相同，起始仍是 0.92。",
          control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
        },
        {
          name: "speed",
          type: "number",
          description: "弹簧倍率。1 与不传相同，刚度仍是 460。",
          control: { kind: "range", value: 1, min: 0.25, max: 2.5, step: 0.1 },
        },
        {
          name: "size",
          type: "number",
          description: "卡片宽度（像素）。256 与不传相同。",
          control: { kind: "range", value: 256, min: 160, max: 400, step: 4 },
        },
        ...ui14,
      ],
      presets: [
        { name: "link-preview-soft", label: "轻", values: { intensity: 0.4, scale: 1, speed: 0.7, size: 256 } },
        { name: "link-preview-default", label: "默认", values: { intensity: 1, scale: 1, speed: 1, size: 256 } },
        { name: "link-preview-wide", label: "宽", values: { intensity: 1, scale: 0.8, speed: 1.4, size: 320 } },
      ],
    },
  {
      name: "shortcuts-dialog",
      batch: 18,
      title: "Shortcuts Dialog",
      description: "按 ? 打开快捷键面板，可以搜索，按键用 Kbd 显示。附带 useHotkey，会区分 macOS 与 Windows 的修饰键。",
      layer: "widget",
      purposeGroup: "overlay",
      source: "original",
      type: "registry:ui",
      file: "effects/shortcuts-dialog.tsx",
      target: "components/ui/shortcuts-dialog.tsx",
      props: [{ name: "groups", type: "ShortcutGroup[]", description: "分组后的快捷键。" }, ...ui14],
    }
]

