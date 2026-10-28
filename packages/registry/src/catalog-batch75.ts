import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 69 批调研，catalog batch 75。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch75ShowcaseComponents: ComponentMeta[] = [
  {
    name: "wind-streak-scrub",
    batch: 75,
    title: "Wind Streak Scrub",
    description:
      "原创。抽象网格上叠短纹风粒子，底部时刻轨和 Play 改 t，风向和密度跟着变。左右方向键微调，空格启停。这是矢量场短纹加时轴，不是 wave-background 的海浪，也不是 horizon-sun-scrub 的地平线太阳。减弱动效停掉流动，只留静态短纹，时刻瞬时跳。离开视口后粒子帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/wind-streak-scrub.tsx",
    target: "components/ui/wind-streak-scrub.tsx",
    presets: [
      { name: "calm", label: "静", values: { pace: 0.6, intensity: 0.3, span: 3, play: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, span: 5, play: false } },
      { name: "gust", label: "疾", values: { pace: 1.6, intensity: 1, span: 7, play: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "粒子和自动推进的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "粒子密度和辉光。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "span", type: "number", defaultValue: "5", description: "时刻标签数量，3 到 7。", control: { kind: "range", value: 5, min: 3, max: 7, step: 1 } },
      { name: "play", type: "boolean", defaultValue: "false", description: "进入时自动推进时刻。", control: { kind: "boolean", value: false, group: "动画" } },
      { name: "onValueChange", type: "(t: number) => void", description: "t 变化时调用，范围 0 到 1。" },
      className,
    ],
  },
  {
    name: "hex-trail-claim",
    batch: 75,
    title: "Hex Trail Claim",
    description:
      "原创。浅色底上一条弯曲的六边形探路，滑杆或方向键让格子依次点亮，底部显示 explored 百分比。Home 和 End 跳到两端。这是单列蜂窝认领，不是 hex-zone-hotspots 的热区，也不是 scan-rail-progress 的扫描条。减弱动效瞬时点亮，没有逐格弹簧。离开视口后自动认领停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/hex-trail-claim.tsx",
    target: "components/ui/hex-trail-claim.tsx",
    presets: [
      { name: "short", label: "短", values: { pace: 0.6, intensity: 0.3, count: 12, auto: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, count: 16, auto: false } },
      { name: "long", label: "长", values: { pace: 1.6, intensity: 1, count: 24, auto: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "认领过渡和自动演示的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "已认领格子的填充对比。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "16", description: "路径上的六边形数量，12 到 24。", control: { kind: "range", value: 16, min: 12, max: 24, step: 1 } },
      { name: "auto", type: "boolean", defaultValue: "false", description: "自动沿路径认领。", control: { kind: "boolean", value: false, group: "动画" } },
      { name: "onProgressChange", type: "(progress: number) => void", description: "进度变化时调用，范围 0 到 1。" },
      className,
    ],
  },
  {
    name: "ridge-profile-scrub",
    batch: 75,
    title: "Ridge Profile Scrub",
    description:
      "原创。合成海拔脊线，拖竖线或距离轨时读出米数，迷你路径上的点一起走。可以按斜率着色，也可以标出起终点。这是可拖的海拔剖面，不是 scroll-svg-graph 的滚动描边，也不是 kpi-sparkline-card 的火花线。减弱动效瞬时改竖线和读数。没有循环帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/ridge-profile-scrub.tsx",
    target: "components/ui/ridge-profile-scrub.tsx",
    presets: [
      { name: "plain", label: "素", values: { pace: 0.6, intensity: 0.3, marks: true, tint: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, marks: true, tint: true } },
      { name: "steep", label: "陡", values: { pace: 1.6, intensity: 1, marks: false, tint: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "竖线和读数跟随的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "填色对比和线粗。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "marks", type: "boolean", defaultValue: "true", description: "显示起终点海拔。", control: { kind: "boolean", value: true, group: "外观" } },
      { name: "tint", type: "boolean", defaultValue: "true", description: "按局部斜率给脊线着色。", control: { kind: "boolean", value: true, group: "外观" } },
      { name: "onValueChange", type: "(distance: number) => void", description: "距离比变化时调用，范围 0 到 1。" },
      className,
    ],
  },
  {
    name: "stress-band-meter",
    batch: 75,
    title: "Stress Band Meter",
    description:
      "原创。竖轴旁边三条有机色带，滑杆或点色带改应力值，大号数字和 LOW、MEDIUM、HIGH 一起变。当前色带更亮。这是应力色带读数，不是 breath-expand-ring 的呼吸环，也不是半圆情绪针。减弱动效瞬时切换，色带不再起伏。离开视口后微动停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/stress-band-meter.tsx",
    target: "components/ui/stress-band-meter.tsx",
    presets: [
      { name: "still", label: "静", values: { pace: 0.6, intensity: 0.3, scaleMax: "2", breathe: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, scaleMax: "3", breathe: true } },
      { name: "wide", label: "宽", values: { pace: 1.6, intensity: 1, scaleMax: "5", breathe: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "色带过渡和微动的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "色带最大透明度和起伏幅度。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      {
        name: "scaleMax",
        type: '"2" | "3" | "5"',
        defaultValue: '"3"',
        description: "满刻度。",
        control: { kind: "select", value: "3", options: ["2", "3", "5"], group: "外观" },
      },
      { name: "breathe", type: "boolean", defaultValue: "true", description: "色带轻微起伏。", control: { kind: "boolean", value: true, group: "动画" } },
      { name: "onValueChange", type: "(value: number) => void", description: "应力值变化时调用。" },
      className,
    ],
  },
]

export const batch75CardsComponents: ComponentMeta[] = [
  {
    name: "fan-deck-pick",
    batch: 75,
    title: "Fan Deck Pick",
    description:
      "原创。牌背沿底边排成扇形，左右滑动或方向键抬起焦点牌，点选或 Enter 翻面，露出几何图和中性标题。再点一次收回。这是扇形选牌翻面，不是 peek-fan-stack 的侧视窥视，也不是 flip-reveal-card 的单卡，更不是 arc-film-carousel 的胶片带。减弱动效瞬时切换正反面。没有空闲循环。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/fan-deck-pick.tsx",
    target: "components/ui/fan-deck-pick.tsx",
    presets: [
      { name: "tight", label: "拢", values: { pace: 0.6, intensity: 0.3, count: 8, spread: 40 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, count: 10, spread: 64 } },
      { name: "wide", label: "张", values: { pace: 1.6, intensity: 1, count: 12, spread: 96 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "扇转和翻面的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "焦点牌的抬升量。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "10", description: "牌数，8 到 12。", control: { kind: "range", value: 10, min: 8, max: 12, step: 1 } },
      { name: "spread", type: "number", defaultValue: "64", description: "扇形张开的角度。", control: { kind: "range", value: 64, min: 36, max: 96, step: 2 } },
      { name: "onReveal", type: "(index: number | null) => void", description: "翻开时带上从 0 开始的序号，收回时为 null。" },
      className,
    ],
  },
]

export const batch75MicroComponents: ComponentMeta[] = [
  {
    name: "gauge-sentiment-sweep",
    batch: 75,
    title: "Gauge Sentiment Sweep",
    description:
      "原创。半圆从低到高的色弧，拖指针或点区段，落到 Strong down、Down、Neutral、Up、Strong up。松手可以吸到区段中心。这是情绪色阶和标签，不是 oscillation-arc-dial 的弧角选值，也不是 particle-dial-reveal 的粒子环。减弱动效瞬时跳针。离开视口后吸附帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/gauge-sentiment-sweep.tsx",
    target: "components/ui/gauge-sentiment-sweep.tsx",
    presets: [
      { name: "thirds", label: "三区", values: { pace: 0.6, intensity: 0.3, zones: 3, snap: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, zones: 5, snap: true } },
      { name: "free", label: "不吸附", values: { pace: 1.6, intensity: 1, zones: 5, snap: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "松手吸附的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "弧的饱和度和针的粗细。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "zones", type: "number", defaultValue: "5", description: "区段数量，3 或 5。", control: { kind: "range", value: 5, min: 3, max: 5, step: 2, group: "交互" } },
      { name: "snap", type: "boolean", defaultValue: "true", description: "松手时吸到区段中心。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onValueChange", type: "(value: number) => void", description: "指针数值变化时调用，范围 0 到 1。" },
      className,
    ],
  },
]
