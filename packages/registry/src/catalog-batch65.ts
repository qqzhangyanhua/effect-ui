import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 59 批调研，catalog batch 65。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch65MicroComponents: ComponentMeta[] = [
  {
    name: "color-step-rail",
    batch: 65,
    title: "Color Step Rail",
    description:
      "原创。横向色阶轨，拖动或点选步进，左右方向键也能移动。活动色块会弹起，并显示当前 hex 或 OKLCH。复制按钮把这一格写入剪贴板。这不是兴趣芯片。传入 colors 时用那一组颜色，否则按 hue 生成明度阶。减弱动效时没有弹起，复制仍然可用。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/color-step-rail.tsx",
    target: "components/ui/color-step-rail.tsx",
    presets: [
      { name: "soft", label: "柔和", values: { count: 6, pace: 0.6, format: "hex", hue: 200 } },
      { name: "default", label: "默认", values: { count: 8, pace: 1, format: "hex", hue: 262 } },
      { name: "vivid", label: "鲜艳", values: { count: 12, pace: 1.6, format: "oklch", hue: 330 } },
    ],
    props: [
      { name: "count", type: "number", defaultValue: "8", description: "自动色阶的步数。传入 colors 时改为那一组的长度。", control: { kind: "range", value: 8, min: 4, max: 14, step: 1 } },
      { name: "pace", type: "number", defaultValue: "1", description: "活动色块弹起的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "format", type: '"hex" | "oklch"', defaultValue: '"hex"', description: "读数用 hex 还是 OKLCH。", control: { kind: "select", value: "hex", options: ["hex", "oklch"], group: "外观" } },
      { name: "hue", type: "number", defaultValue: "262", description: "自动色阶的色相，单位度。", control: { kind: "range", value: 262, min: 0, max: 360, step: 1, group: "外观" } },
      { name: "colors", type: "string[]", description: "自定义颜色。传入后不再按 hue 生成。" },
      { name: "onCopy", type: "(value: string) => void", description: "写入剪贴板时调用，参数是当前读数。" },
      className,
    ],
  },
  {
    name: "scratch-line-field",
    batch: 65,
    title: "Scratch Line Field",
    description:
      "原创。上层是不透明箔，指针路径把它擦掉。刮开面积达到 threshold 后剩余箔收起，并调用 onReveal 一次。Enter 或空格可以直接揭开。这不是点击翻转，也不是清雾。减弱动效时不刮擦，用 Reveal 按钮一次揭开。离开视口后没有持续动画帧。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/scratch-line-field.tsx",
    target: "components/ui/scratch-line-field.tsx",
    presets: [
      { name: "light", label: "轻刮", values: { threshold: 0.3, brush: 48, pace: 0.7 } },
      { name: "default", label: "默认", values: { threshold: 0.45, brush: 28, pace: 1 } },
      { name: "heavy", label: "厚箔", values: { threshold: 0.7, brush: 16, pace: 1.5 } },
    ],
    props: [
      { name: "threshold", type: "number", defaultValue: "0.45", description: "揭开所需的刮开面积比例。", control: { kind: "range", value: 0.45, min: 0.2, max: 0.8, step: 0.05, group: "交互" } },
      { name: "brush", type: "number", defaultValue: "28", description: "笔刷半径，单位像素。", control: { kind: "range", value: 28, min: 12, max: 72, step: 2, group: "交互" } },
      { name: "pace", type: "number", defaultValue: "1", description: "揭开时箔层淡出的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "children", type: "ReactNode", description: "箔层下面的内容。省略时用一张占位纸条。" },
      { name: "onReveal", type: "() => void", description: "达到阈值或用键盘揭开时调用一次。" },
      className,
    ],
  },
  {
    name: "swipe-action-row",
    batch: 65,
    title: "Swipe Action Row",
    description:
      "原创。列表行可以横向拖。超过 threshold 就吸附打开左侧或右侧的动作，没超过则按 snap 回弹，snap 为 0 时停在松手的地方。Alt+左方向键打开左侧，Alt+右方向键打开右侧，Esc 收起。动作有稍后、归档和删除三种颜色。这不是整卡拖去评分，也不是只有一个动作。粗指针和减弱动效把按钮直接放在行内，不靠悬停。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/swipe-action-row.tsx",
    target: "components/ui/swipe-action-row.tsx",
    presets: [
      { name: "loose", label: "宽松", values: { threshold: 0.5, snap: 0.4, pace: 0.7 } },
      { name: "default", label: "默认", values: { threshold: 0.34, snap: 0.85, pace: 1 } },
      { name: "crisp", label: "干脆", values: { threshold: 0.22, snap: 1, pace: 1.6 } },
    ],
    props: [
      { name: "threshold", type: "number", defaultValue: "0.34", description: "吸附打开所需的拖动距离，占行宽的比例。", control: { kind: "range", value: 0.34, min: 0.18, max: 0.6, step: 0.02, group: "交互" } },
      { name: "snap", type: "number", defaultValue: "0.85", description: "没过阈值时回弹的力度。0 停在松手处。", control: { kind: "range", value: 0.85, min: 0, max: 1, step: 0.05, group: "交互" } },
      { name: "pace", type: "number", defaultValue: "1", description: "回弹和吸附的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "rows", type: "readonly SwipeActionEntry[]", description: "行。每项含 id、title、note、leading 和 trailing。省略时用三行内置条目。" },
      { name: "onAction", type: "(rowId: string, actionId: string) => void", description: "点到动作时调用，然后该行收起。" },
      className,
    ],
  },
  {
    name: "particle-dial-reveal",
    batch: 65,
    title: "Particle Dial Reveal",
    description:
      "原创。半圆拨盘拖动手柄或沿弧拖动，改变中间的数值。数字由粒子从散开再聚到字形上。方向键、Home 和 End 都能改值。这不是滚轮帧，也不是把弧涂满的仪表。减弱动效时只显示静止数字，不创建粒子画布。离开视口后粒子帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/particle-dial-reveal.tsx",
    target: "components/ui/particle-dial-reveal.tsx",
    presets: [
      { name: "sparse", label: "疏", values: { pace: 0.7, density: 32, intensity: 0.35 } },
      { name: "default", label: "默认", values: { pace: 1, density: 64, intensity: 0.7 } },
      { name: "dense", label: "密", values: { pace: 1.6, density: 112, intensity: 1 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "粒子聚拢的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "density", type: "number", defaultValue: "64", description: "粒子数量。", control: { kind: "range", value: 64, min: 24, max: 120, step: 4, group: "外观" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "散开的幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "min", type: "number", defaultValue: "18", description: "最小值。演示默认是年龄下限。" },
      { name: "max", type: "number", defaultValue: "80", description: "最大值。" },
      { name: "step", type: "number", defaultValue: "1", description: "每一步的间隔。" },
      { name: "defaultValue", type: "number", defaultValue: "32", description: "初始值。" },
      { name: "onValueChange", type: "(value: number) => void", description: "数值变化时调用。" },
      className,
    ],
  },
]

export const batch65PageComponents: ComponentMeta[] = [
  {
    name: "scrub-fog-clear",
    batch: 65,
    title: "Scrub Fog Clear",
    description:
      "原创。内容上面盖着一层模糊的雾。指针擦过的路径把雾清掉，清开比例达到 threshold 后整层淡出，并调用 onClear 一次。Enter 可以直接清除。这是清雾，不是刮开不透明箔，也不是聚光把一句话读清楚。减弱动效时没有模糊，用 Clear 按钮一次完成。触屏沿路径擦除。",
    layer: "effect",
    effectCategory: "page",
    source: "original",
    type: "registry:ui",
    file: "effects/scrub-fog-clear.tsx",
    target: "components/ui/scrub-fog-clear.tsx",
    presets: [
      { name: "mist", label: "薄雾", values: { blur: 6, threshold: 0.28, brush: 52 } },
      { name: "default", label: "默认", values: { blur: 12, threshold: 0.4, brush: 36 } },
      { name: "thick", label: "浓雾", values: { blur: 20, threshold: 0.7, brush: 20 } },
    ],
    props: [
      { name: "blur", type: "number", defaultValue: "12", description: "雾的模糊半径，单位像素。", control: { kind: "range", value: 12, min: 0, max: 24, step: 1, group: "外观" } },
      { name: "threshold", type: "number", defaultValue: "0.4", description: "整层揭开所需的清雾面积比例。", control: { kind: "range", value: 0.4, min: 0.2, max: 0.8, step: 0.05, group: "交互" } },
      { name: "brush", type: "number", defaultValue: "36", description: "清雾笔刷半径，单位像素。", control: { kind: "range", value: 36, min: 16, max: 80, step: 2, group: "交互" } },
      { name: "children", type: "ReactNode", description: "雾下面的内容。省略时用一句开场。" },
      { name: "onClear", type: "() => void", description: "达到阈值或用键盘清除时调用一次。" },
      className,
    ],
  },
]

export const batch65CardsComponents: ComponentMeta[] = [
  {
    name: "iridescent-edge-card",
    batch: 65,
    title: "Iridescent Edge Card",
    description:
      "原创。圆角卡片的描边用色相环跟着指针角度走，卡面内容保持不动。离开后停在最后的角度。键盘聚焦时描边缓慢自转，作为不依赖悬停的反馈。粗指针和减弱动效改成静止虹彩，不再跟随指针。这不是整卡全息，也不是一道单色光沿着边跑。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/iridescent-edge-card.tsx",
    target: "components/ui/iridescent-edge-card.tsx",
    presets: [
      { name: "quiet", label: "淡", values: { intensity: 0.25, pace: 0.6, thickness: 2 } },
      { name: "default", label: "默认", values: { intensity: 0.75, pace: 1, thickness: 3 } },
      { name: "vivid", label: "浓", values: { intensity: 1, pace: 1.6, thickness: 6 } },
    ],
    props: [
      { name: "intensity", type: "number", defaultValue: "0.75", description: "描边的彩度。", control: { kind: "range", value: 0.75, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "角度跟上指针的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "thickness", type: "number", defaultValue: "3", description: "描边厚度，单位像素。", control: { kind: "range", value: 3, min: 1, max: 8, step: 1, group: "外观" } },
      { name: "children", type: "ReactNode", description: "卡面内容。省略时用一句说明。" },
      className,
    ],
  },
]
