import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const batch48Components: ComponentMeta[] = [
  {
    name: "lanyard-badge",
    batch: 48,
    title: "Lanyard Badge",
    description:
      "原创实现。工牌挂在 Verlet 绳上，拖动后会摆动并弹回竖直。方向键也能拨一下。减弱动效时保持竖直，不再积分。没有新增依赖，也不使用 matter-js。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/lanyard-badge.tsx",
    target: "components/ui/lanyard-badge.tsx",
    props: [
      { name: "label", type: "string", defaultValue: "访客证", description: "工牌上的字。" },
      { name: "onSettle", type: "() => void", description: "摆动停住或在减弱动效下立刻回到竖直后调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "挂绳和工牌描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "120",
        description: "工牌宽度，像素。",
        control: { kind: "range", value: 120, min: 80, max: 200, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "640",
        description: "摆回竖直的最长毫秒数。越长，衰减越慢。",
        control: { kind: "range", value: 640, min: 256, max: 1280, step: 16 },
      },
      ...ui,
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
      ...ui,
    ],
  },
  {
    name: "spring-drawer",
    batch: 48,
    title: "Spring Drawer",
    description:
      "原创实现。拉手拖动抽屉，松手后按出手速度惯性滑开或关上。甩得够快会直接弹到另一侧。方向键和回车也能开关。减弱动效时直接开合。没有新增依赖，也不使用 matter-js。",
    layer: "effect",
    effectCategory: "navigation",
    source: "original",
    type: "registry:ui",
    file: "effects/spring-drawer.tsx",
    target: "components/ui/spring-drawer.tsx",
    props: [
      { name: "title", type: "string", defaultValue: "快捷抽屉", description: "抽屉标题。" },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "开合状态变化后调用。" },
      { name: "color", type: "string", defaultValue: "var(--primary)", description: "拉手和描边。不传则跟随主题。", control: { kind: "color" } },
      {
        name: "size",
        type: "number",
        defaultValue: "280",
        description: "抽屉宽度，像素。",
        control: { kind: "range", value: 280, min: 200, max: 420, step: 4 },
      },
      {
        name: "duration",
        type: "number",
        defaultValue: "560",
        description: "松手后滑到开或关的毫秒数。越长，惯性越久。",
        control: { kind: "range", value: 560, min: 224, max: 1120, step: 16 },
      },
      ...ui,
    ],
  },
]
