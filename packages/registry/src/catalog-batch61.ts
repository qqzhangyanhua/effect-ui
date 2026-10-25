import type { ComponentMeta, PropDoc } from "./catalog"

const ui: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]
const keyframery = "移植自 Keyframery，MIT，Copyright (c) 2026 Briyan Hingrajiya。"
const amicro = "移植自 Amicro，MIT，Copyright (c) 2026 SYED SUBHAN UDDIN。"
const kf = (file: string) => `https://github.com/keyframery/keyframery/blob/9ab2430/registry/components/keyframery/${file}`
const pause = "减弱动效停在终态。离开视口时连续动画暂停，回到视口再继续。"

export const batch61Components: ComponentMeta[] = [
  {
    name: "icon-moves",
    batch: 61,
    title: "Icon Moves",
    description: `${keyframery} ${kf("icon-moves.tsx")} 按下带 lucide 图标的按钮时，齿轮转动、铃铛摇、心形弹一下。监听只挂在组件自己的根上。hover 是额外选项，按下和 Enter、Space 始终能播放。图标动作表内联在组件里。${pause}`,
    layer: "effect",
    effectCategory: "micro",
    source: "Keyframery",
    type: "registry:ui",
    file: "effects/icon-moves.tsx",
    target: "components/ui/icon-moves.tsx",
    props: [
      { name: "on", type: '"press" | "hover"', defaultValue: '"press"', description: "press 在按下或键盘确认时播放。hover 额外在鼠标移入时播放。", control: { kind: "select", value: "press", options: ["press", "hover"] } },
      { name: "color", type: "string", defaultValue: '"var(--foreground)"', description: "图标颜色，传给 currentColor。", control: { kind: "color", value: "var(--foreground)" } },
      { name: "speed", type: "number", defaultValue: "1", description: "相对源时长的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1 } },
      { name: "size", type: "number", defaultValue: "24", description: "图标边长。", control: { kind: "range", value: 24, min: 12, max: 48, step: 2 } },
      { name: "duration", type: "number", defaultValue: "420", description: "基准时长，单位毫秒。源组件里各图标的时长按这个值缩放。", control: { kind: "range", value: 420, min: 200, max: 900, step: 20 } },
      ...ui,
    ],
  },
  {
    name: "wave-physics-loader",
    batch: 61,
    title: "Wave Physics Loader",
    description: `${amicro} https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/dc2a183/registry/ui/loading/wave-physics-loader.tsx 小球在一排柱子上弹跳，柱高跟着波形起伏。颜色用主题变量，不再分 light 和 dark。${pause}`,
    layer: "effect",
    effectCategory: "loaders",
    source: "Amicro",
    type: "registry:ui",
    file: "effects/wave-physics-loader.tsx",
    target: "components/ui/wave-physics-loader.tsx",
    props: [
      { name: "color", type: "string", defaultValue: '"var(--foreground)"', description: "柱子和小球的颜色。", control: { kind: "color", value: "var(--foreground)" } },
      { name: "count", type: "number", defaultValue: "15", description: "柱子数量。", control: { kind: "range", value: 15, min: 5, max: 24, step: 1 } },
      { name: "duration", type: "number", defaultValue: "4000", description: "来回一次的时间，单位毫秒。", control: { kind: "range", value: 4000, min: 1000, max: 8000, step: 100 } },
      { name: "speed", type: "number", defaultValue: "1", description: "速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1 } },
      { name: "intensity", type: "number", defaultValue: "48", description: "波形抬高的峰值。", control: { kind: "range", value: 48, min: 16, max: 80, step: 4 } },
      { name: "size", type: "number", defaultValue: "12", description: "柱子和小球的宽度。", control: { kind: "range", value: 12, min: 4, max: 24, step: 2 } },
      { name: "gap", type: "number", defaultValue: "8", description: "柱子间距。", control: { kind: "range", value: 8, min: 0, max: 24, step: 2 } },
      ...ui,
    ],
  },
]
