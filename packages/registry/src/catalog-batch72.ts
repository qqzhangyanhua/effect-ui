import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 66 批调研，catalog batch 72。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch72ShowcaseComponents: ComponentMeta[] = [
  {
    name: "title-year-list",
    batch: 72,
    title: "Title Year List",
    description:
      "原创。竖排大号片名，年份以小号上标贴在标题末字旁。滚轮、拖动、点选或上下方向键改焦点时，当前项提亮加粗，邻项按距离变淡。这是标题加年份上标的列表，不是 curve-focus-rail 的弧轨媒体，也不是 year-snap-rail 的横向年份轨，也不是编号条手风琴。减弱动效瞬时切换焦点和透明度。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/title-year-list.tsx",
    target: "components/ui/title-year-list.tsx",
    presets: [
      { name: "quiet", label: "疏", values: { pace: 0.6, intensity: 0.3, count: 6, leading: 0.8 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, count: 7, leading: 1 } },
      { name: "tight", label: "密", values: { pace: 1.6, intensity: 1, count: 8, leading: 1.4 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "焦点过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "邻项最低透明度和字重差。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "7", description: "可见条目数量，6 到 8。", control: { kind: "range", value: 7, min: 6, max: 8, step: 1 } },
      { name: "leading", type: "number", defaultValue: "1", description: "行距紧凑度。", control: { kind: "range", value: 1, min: 0.75, max: 1.5, step: 0.05 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "焦点变化时调用，参数从 0 开始。" },
      className,
    ],
  },
  {
    name: "logo-focus-dim",
    batch: 72,
    title: "Logo Focus Dim",
    description:
      "原创。静态几何字标。指针或键盘落到一枚时，该枚全不透明并略放大，其余一起降透明度。离开容器可以回到中间透明度，也可以保持最后一枚。这是离散焦点变暗，不是 proximity-scale-grid 的指针距离连续缩放，也不是 logo-marquee 的无限跑马灯。减弱动效瞬时切换透明度。没有循环帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/logo-focus-dim.tsx",
    target: "components/ui/logo-focus-dim.tsx",
    presets: [
      { name: "row", label: "一行", values: { pace: 0.6, intensity: 0.3, layout: "row", count: 6, hold: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.55, layout: "row", count: 8, hold: false } },
      { name: "grid", label: "网格", values: { pace: 1.6, intensity: 1, layout: "grid", count: 12, hold: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "透明度过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.55", description: "其余标志的变暗程度，以及焦点的轻微缩放。", control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 } },
      { name: "layout", type: '"row" | "grid"', defaultValue: '"row"', description: "一行或网格。", control: { kind: "select", value: "row", options: ["row", "grid"] } },
      { name: "count", type: "number", defaultValue: "8", description: "标志数量，6 到 12。", control: { kind: "range", value: 8, min: 6, max: 12, step: 1 } },
      { name: "hold", type: "boolean", defaultValue: "false", description: "离开容器后保持最后一枚焦点。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "onFocusChange", type: "(index: number) => void", description: "焦点变化时调用。没有焦点时为 -1。" },
      className,
    ],
  },
]

export const batch72CardsComponents: ComponentMeta[] = [
  {
    name: "paint-lift-rail",
    batch: 72,
    title: "Paint Lift Rail",
    description:
      "原创。竖向圆角轨上拖圆形手柄，卡片表面的彩绘自下而上用 clip 揭开，拖动时顶缘可以带一点笔触。松手可以停住，也可以吸到空、一半或满。上下方向键微调。这是竖向油漆填充，不是 slide-rail-confirm 的横向确认滑轨，也不是点色卡换图。减弱动效改为瞬时改填充，没有笔触抖动。离开视口后弹簧帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/paint-lift-rail.tsx",
    target: "components/ui/paint-lift-rail.tsx",
    presets: [
      { name: "soft", label: "淡", values: { pace: 0.6, intensity: 0.3, snap: false, hue: 28 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, snap: false, hue: 28 } },
      { name: "snap", label: "吸附", values: { pace: 1.6, intensity: 1, snap: true, hue: 200 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "松手弹簧的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "笔触抖动幅度和纹理对比。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "snap", type: "boolean", defaultValue: "false", description: "松手时吸到 0、0.5 或 1。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "hue", type: "number", defaultValue: "28", description: "油漆色相，和主题色混合。", control: { kind: "range", value: 28, min: 0, max: 360, step: 1 } },
      { name: "onValueChange", type: "(t: number) => void", description: "填充 t 变化时调用，t 在 0 到 1 之间。" },
      className,
    ],
  },
]

export const batch72MicroComponents: ComponentMeta[] = [
  {
    name: "drag-token-gate",
    batch: 72,
    title: "Drag Token Gate",
    description:
      "原创。把一枚几何令牌拖进虚线目标圈，松手命中就锁定并启用 Enter，没中则弹回起点。方向键移动，Enter 投放，Place token 可以直接放入。这是单令牌入闸，不是 seed-slot-drop 的多种子多槽，也不是 drag-lock-escape 的拖出逃脱。减弱动效改为 Place token 瞬时入槽。离开视口后回弹帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/drag-token-gate.tsx",
    target: "components/ui/drag-token-gate.tsx",
    presets: [
      { name: "loose", label: "松", values: { pace: 0.6, intensity: 0.3, hint: true, threshold: 0.7 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, hint: true, threshold: 0.45 } },
      { name: "tight", label: "紧", values: { pace: 1.6, intensity: 1, hint: false, threshold: 0.25 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "回弹和入槽的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "命中半径和成功时的放大。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "hint", type: "boolean", defaultValue: "true", description: "显示从起点到目标的虚线。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "threshold", type: "number", defaultValue: "0.45", description: "命中半径的松紧。", control: { kind: "range", value: 0.45, min: 0.2, max: 0.8, step: 0.05, group: "交互" } },
      { name: "onLockChange", type: "(locked: boolean) => void", description: "锁定状态变化时调用。" },
      className,
    ],
  },
]

export const batch72TextComponents: ComponentMeta[] = [
  {
    name: "frost-dot-reveal",
    batch: 72,
    title: "Frost Dot Reveal",
    description:
      "原创。大号 Value 由霜点点阵构成。拖滑条或方向键改数值时，点阵凝聚变清晰；松手可以保持，也可以淡回霜态。这是数字点阵凝聚，不是 scrub-fog-clear 的擦雾看图，也不是 particle-dial-reveal 的粒子环选盘。减弱动效改为实心数字，滑条瞬时改值。离开视口后点抖动停止。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/frost-dot-reveal.tsx",
    target: "components/ui/frost-dot-reveal.tsx",
    presets: [
      { name: "slow", label: "慢", values: { pace: 0.6, intensity: 0.3, span: 20, persist: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, span: 47, persist: false } },
      { name: "hold", label: "保持", values: { pace: 1.6, intensity: 1, span: 47, persist: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "点阵凝聚的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "最大点密度和抖动幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "span", type: "number", defaultValue: "47", description: "数值范围宽度，最小值固定为 18。", control: { kind: "range", value: 47, min: 12, max: 60, step: 1 } },
      { name: "persist", type: "boolean", defaultValue: "false", description: "松手后保持清晰。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "onValueChange", type: "(value: number) => void", description: "数值变化时调用。" },
      className,
    ],
  },
  {
    name: "blur-rep-count",
    batch: 72,
    title: "Blur Rep Count",
    description:
      "原创。大号计数每次加减时，旧数字纵向运动模糊甩出，新数字从反方向甩入后锐化。方向跟增减走。Replay 演示 0、1、2。这是整数字的模糊位移，不是 clay-digit-morph 的挤胀，也不是乱码、翻牌或滚筒。减弱动效瞬时换数字。离开视口后自动计数和模糊帧停止。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/blur-rep-count.tsx",
    target: "components/ui/blur-rep-count.tsx",
    presets: [
      { name: "soft", label: "轻", values: { pace: 0.6, intensity: 0.3, auto: false, digits: 1 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, auto: false, digits: 1 } },
      { name: "auto", label: "自动", values: { pace: 1.6, intensity: 1, auto: true, digits: 2 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "甩入时长的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "最大模糊和位移距离。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "auto", type: "boolean", defaultValue: "false", description: "在视口内自动加一。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "digits", type: "number", defaultValue: "1", description: "位数，1 或 2。", control: { kind: "range", value: 1, min: 1, max: 2, step: 1 } },
      { name: "onValueChange", type: "(value: number) => void", description: "数字变化时调用。" },
      className,
    ],
  },
]
