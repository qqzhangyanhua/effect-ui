import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 65 批调研，catalog batch 71。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch71MicroComponents: ComponentMeta[] = [
  {
    name: "solar-orbit-scrub",
    batch: 71,
    title: "Solar Orbit Scrub",
    description:
      "原创。椭圆轨道上拖太阳手柄，中央圆角立方的投影长度和角度跟着方位变，旁边的胶囊显示从 06:00 到 20:00 的时刻。松手可以停在原地，也可以吸到日出或日落。左右方向键微调。这是阴影可视化，不是 oscillation-arc-dial 的数值刻度拨杆，也不是年份轨或粒子环盘。减弱动效用更早、更晚瞬时改位置，不再弹簧。离开视口后弹簧帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/solar-orbit-scrub.tsx",
    target: "components/ui/solar-orbit-scrub.tsx",
    presets: [
      { name: "dawn", label: "日出", values: { pace: 0.6, intensity: 0.35, span: 0.5, snap: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, span: 0.75, snap: false } },
      { name: "noon", label: "正午", values: { pace: 1.6, intensity: 1, span: 1, snap: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "松手弹簧的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "投影长度和模糊。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "span", type: "number", defaultValue: "0.75", description: "轨道弧长占半圆的比例。", control: { kind: "range", value: 0.75, min: 0.45, max: 1, step: 0.05 } },
      { name: "snap", type: "boolean", defaultValue: "false", description: "松手时吸到日出或日落。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "onValueChange", type: "(t: number) => void", description: "方位 t 变化时调用，t 在 0 到 1 之间。" },
      className,
    ],
  },
  {
    name: "live-stage-capsule",
    batch: 71,
    title: "Live Stage Capsule",
    description:
      "原创。深色胶囊里放状态文案和离散阶段节点，可以收成窄条再展开。Next stage、节点和方向键都会推进，到最后一阶段停住。这是胶囊里的阶段，不是 scan-rail-progress 的框边扫描，也不是撤销倒计时或长按填环。减弱动效瞬时切换和展开。离开视口后自动推进停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/live-stage-capsule.tsx",
    target: "components/ui/live-stage-capsule.tsx",
    presets: [
      { name: "quiet", label: "少", values: { pace: 0.6, intensity: 0.35, stages: 3, autoAdvance: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, stages: 4, autoAdvance: false } },
      { name: "auto", label: "自动", values: { pace: 1.6, intensity: 1, stages: 5, autoAdvance: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "阶段过渡和自动推进的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "节点尺寸。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "stages", type: "number", defaultValue: "4", description: "阶段数量，3 到 5。", control: { kind: "range", value: 4, min: 3, max: 5, step: 1 } },
      { name: "autoAdvance", type: "boolean", defaultValue: "false", description: "在视口内自动进入下一阶段。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "onIndexChange", type: "(index: number) => void", description: "阶段变化时调用，参数从 0 开始。" },
      className,
    ],
  },
  {
    name: "strength-segment-fill",
    batch: 71,
    title: "Strength Segment Fill",
    description:
      "原创。Passphrase 样本文字变长或变复杂时，分段条按分数填色，下面的清单从图叉变成对勾。Weak、Medium、Strong 是预设，也可以直接打字。这是派生出来的强度反馈，不是 color-step-rail 的色阶选择，也不是金额字号。减弱动效瞬时填段和打勾。没有循环帧。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/strength-segment-fill.tsx",
    target: "components/ui/strength-segment-fill.tsx",
    presets: [
      { name: "short", label: "短", values: { pace: 0.6, intensity: 0.3, segments: 3, rules: 2 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, segments: 4, rules: 4 } },
      { name: "strict", label: "严", values: { pace: 1.6, intensity: 1, segments: 4, rules: 4 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "填段和打勾的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "分段条高度。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "segments", type: "number", defaultValue: "4", description: "分段数量，3 或 4。", control: { kind: "range", value: 4, min: 3, max: 4, step: 1 } },
      { name: "rules", type: "number", defaultValue: "4", description: "清单条目数量，2 到 4。", control: { kind: "range", value: 4, min: 2, max: 4, step: 1 } },
      { name: "onScoreChange", type: "(score: number) => void", description: "命中的规则数变化时调用。" },
      className,
    ],
  },
]

export const batch71CardsComponents: ComponentMeta[] = [
  {
    name: "swipe-style-cycle",
    batch: 71,
    title: "Swipe Style Cycle",
    description:
      "原创。同一张卡的标题和正文不动，横滑或 Next style 在几套皮肤之间循环：默认、强调、深底，多一套时还有软底。没过阈值就弹回。这只换这张卡的皮肤，不是 swipe-action-row 的底层动作钮，也不是翻页或左表右媒。减弱动效用按钮瞬时切换，不再跟手。离开视口后回弹帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/swipe-style-cycle.tsx",
    target: "components/ui/swipe-style-cycle.tsx",
    presets: [
      { name: "soft", label: "松", values: { pace: 0.6, intensity: 0.3, count: 3, threshold: 0.5 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, count: 3, threshold: 0.28 } },
      { name: "sharp", label: "紧", values: { pace: 1.6, intensity: 1, count: 4, threshold: 0.2 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "回弹速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "跟手阻尼。越大越跟手。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "3", description: "皮肤数量，3 或 4。", control: { kind: "range", value: 3, min: 3, max: 4, step: 1 } },
      { name: "threshold", type: "number", defaultValue: "0.28", description: "切换所需的横向比例。", control: { kind: "range", value: 0.28, min: 0.2, max: 0.6, step: 0.01, group: "交互" } },
      { name: "onThemeChange", type: "(index: number) => void", description: "皮肤序号变化时调用，从 0 开始。" },
      className,
    ],
  },
]

export const batch71TextComponents: ComponentMeta[] = [
  {
    name: "clay-digit-morph",
    batch: 71,
    title: "Clay Digit Morph",
    description:
      "原创。大号数字带软浮雕，换值时纵向挤一下再胀开，而不是淡入或翻牌。数字键、加减和 Replay 都能改，Replay 走 0、7、3。这是固定字号的字形过渡，不是 amount-fit-type 的宽度自适应，也不是滚筒或乱码。减弱动效瞬时换数字。离开视口后过渡帧停止。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/clay-digit-morph.tsx",
    target: "components/ui/clay-digit-morph.tsx",
    presets: [
      { name: "soft", label: "软", values: { pace: 0.6, intensity: 0.3, digits: 1, softness: 0.2 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, digits: 1, softness: 0.55 } },
      { name: "pair", label: "两位", values: { pace: 1.6, intensity: 1, digits: 2, softness: 1 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "挤胀过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "纵向挤压幅度和浮雕深度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "digits", type: "number", defaultValue: "1", description: "位数，1 或 2。", control: { kind: "range", value: 1, min: 1, max: 2, step: 1 } },
      { name: "softness", type: "number", defaultValue: "0.55", description: "浮雕的柔和程度。", control: { kind: "range", value: 0.55, min: 0, max: 1, step: 0.05 } },
      { name: "onValueChange", type: "(value: number) => void", description: "数字变化时调用。" },
      className,
    ],
  },
]

export const batch71ShowcaseComponents: ComponentMeta[] = [
  {
    name: "curve-focus-rail",
    batch: 71,
    title: "Curve Focus Rail",
    description:
      "原创。左侧标签沿圆弧排开，滚轮、拖动或点选让一项进入焦点，右侧色块和标题一起换。上下方向键也能走。这是标签加媒体的弧轨，不是 barrel-value-wheel 的数字滚筒，也不是单拇指弧拨或水平编号条。减弱动效改成平铺列表并瞬时换媒体。离开视口后惯性帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/curve-focus-rail.tsx",
    target: "components/ui/curve-focus-rail.tsx",
    presets: [
      { name: "gentle", label: "收", values: { pace: 0.6, intensity: 0.3, count: 4, spread: 1 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, count: 5, spread: 2 } },
      { name: "wide", label: "开", values: { pace: 1.6, intensity: 1, count: 7, spread: 3 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "惯性收束的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "弧度和焦点放大。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "5", description: "条目数量，4 到 7。", control: { kind: "range", value: 5, min: 4, max: 7, step: 1 } },
      { name: "spread", type: "number", defaultValue: "2", description: "焦点两侧仍可见的步数。", control: { kind: "range", value: 2, min: 1, max: 3, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "焦点变化时调用，参数从 0 开始。" },
      className,
    ],
  },
]
