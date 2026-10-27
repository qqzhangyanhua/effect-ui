import type { ComponentMeta, PropDoc } from "./catalog"
const ui2: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui37: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const effectButtonsComponents: ComponentMeta[] = [
  {
      name: "neon-button",
      batch: 1,
      title: "Neon Button",
      description: "霓虹描边发光按钮。",
      layer: "effect",
      effectCategory: "buttons",
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
      name: "gooey-button",
      batch: 2,
      title: "Gooey Button",
      description: "液态粘连按钮。",
      layer: "effect",
      effectCategory: "buttons",
      source: "original",
      type: "registry:ui",
      file: "effects/gooey-button.tsx",
      target: "components/ui/gooey-button.tsx",
      props: [
        {
          name: "scale",
          type: "number",
          description: "模糊倍率。1 与不传相同，仍是 stdDeviation 6。",
          control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
        },
        {
          name: "intensity",
          type: "number",
          description: "粘连强度倍率。1 与不传相同，仍是矩阵 18 与 -7。",
          control: { kind: "range", value: 1, min: 0, max: 1, step: 0.05 },
        },
        ...ui2,
      ],
      presets: [
        { name: "gooey-button-soft", label: "淡", values: { scale: 0.5, intensity: 0.5 } },
        { name: "gooey-button-default", label: "默认", values: { scale: 1, intensity: 1 } },
        { name: "gooey-button-thick", label: "浓", values: { scale: 1.5, intensity: 1 } },
      ],
    },
  {
      name: "jelly-button",
      batch: 48,
      title: "Jelly Button",
      description:
        "原创实现。按下时按钮被弹簧压扁，松手后弹回，点击仍然触发。回车和空格同样会按下。减弱动效时不压扁。没有新增依赖，也不使用 matter-js。",
      layer: "effect",
      effectCategory: "buttons",
      source: "original",
      type: "registry:ui",
      file: "effects/jelly-button.tsx",
      target: "components/ui/jelly-button.tsx",
      props: [
        { name: "label", type: "string", defaultValue: "按一下", description: "按钮文字。" },
        { name: "onClick", type: "() => void", description: "点击、触屏松开或键盘激活时调用。" },
        { name: "color", type: "string", defaultValue: "var(--primary)", description: "按钮底色。不传则跟随主题。", control: { kind: "color" } },
        {
          name: "size",
          type: "number",
          defaultValue: "48",
          description: "按钮高度，像素。",
          control: { kind: "range", value: 48, min: 36, max: 80, step: 2 },
        },
        {
          name: "duration",
          type: "number",
          defaultValue: "420",
          description: "松手后弹回的毫秒数。",
          control: { kind: "range", value: 420, min: 168, max: 840, step: 12 },
        },
        ...ui37,
      ],
    }
]

