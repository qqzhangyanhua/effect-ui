import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 64 批调研，catalog batch 70。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch70CardsComponents: ComponentMeta[] = [
  {
    name: "mosaic-tile-flip",
    batch: 70,
    title: "Mosaic Tile Flip",
    description:
      "原创。规则网格上的圆角色块按对角线错落翻入，字母只是占位，不是品牌标志。点一下或按 Enter 可以再翻一格，Replay 重播入场。这不是 bento-asymmetric-grid 的不等分放大格，也不是扇叠或抛卡。减弱动效瞬时显示全部格子，不再翻转。离开视口后入场帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/mosaic-tile-flip.tsx",
    target: "components/ui/mosaic-tile-flip.tsx",
    presets: [
      { name: "quiet", label: "疏", values: { pace: 0.6, intensity: 0.35, cols: 2, gap: 4 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, cols: 3, gap: 8 } },
      { name: "tight", label: "密", values: { pace: 1.6, intensity: 1, cols: 4, gap: 16 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "单格入场和错落间隔的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "翻转角度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "cols", type: "number", defaultValue: "3", description: "列数。行数与列数相同，2 到 4。", control: { kind: "range", value: 3, min: 2, max: 4, step: 1 } },
      { name: "gap", type: "number", defaultValue: "8", description: "格子间距，单位像素。", control: { kind: "range", value: 8, min: 0, max: 24, step: 1 } },
      { name: "onFlip", type: "(index: number) => void", description: "点按或按 Enter 翻开一格时调用，参数是格子序号，从 0 开始。" },
      className,
    ],
  },
]

export const batch70TextComponents: ComponentMeta[] = [
  {
    name: "pixel-stream-morph",
    batch: 70,
    title: "Pixel Stream Morph",
    description:
      "原创。短词被栅格成像素蒙版，色带在字面里沿对角流动。这是字里的持续色流，不是 pixel-transition 的整图像素溶解，也不是乱码落定或描边写出。Replay 把相位拨回起点。减弱动效停在一帧纯色像素字。离开视口后色流帧取消。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/pixel-stream-morph.tsx",
    target: "components/ui/pixel-stream-morph.tsx",
    presets: [
      { name: "slow", label: "慢", values: { pace: 0.6, intensity: 0.3, density: 20, text: "yes" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, density: 28, text: "flow" } },
      { name: "fast", label: "快", values: { pace: 1.6, intensity: 1, density: 40, text: "go" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "色流速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "像素对比。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "density", type: "number", defaultValue: "28", description: "栅格列数。越大，像素越细。", control: { kind: "range", value: 28, min: 16, max: 48, step: 2 } },
      { name: "text", type: '"yes" | "flow" | "go"', defaultValue: '"flow"', description: "短词。最长 12 个字母。", control: { kind: "select", value: "flow", options: ["yes", "flow", "go"], group: "文字" } },
      className,
    ],
  },
  {
    name: "amount-fit-type",
    batch: 70,
    title: "Amount Fit Type",
    description:
      "原创。货币金额用大号字排在固定宽度里，位数变长就缩小，清空回到 0.00 和字号上限。数字键、加减和键盘的 0–9、Backspace 都能改。这是排版自适应，不是 barrel-value-wheel 的滚筒，也没有乱码。减弱动效瞬时改字号。离开视口后没有循环帧。",
    layer: "effect",
    effectCategory: "text",
    source: "original",
    type: "registry:ui",
    file: "effects/amount-fit-type.tsx",
    target: "components/ui/amount-fit-type.tsx",
    presets: [
      { name: "quiet", label: "小", values: { pace: 0.6, intensity: 0.4, currency: "$", maxDigits: 6 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, currency: "$", maxDigits: 8 } },
      { name: "bold", label: "大", values: { pace: 1.6, intensity: 1, currency: "£", maxDigits: 12 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "字号过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "最大字号。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "currency", type: '"$" | "£" | "¥"', defaultValue: '"$"', description: "货币符号。", control: { kind: "select", value: "$", options: ["$", "£", "¥"] } },
      { name: "maxDigits", type: "number", defaultValue: "8", description: "最多位数，4 到 12。", control: { kind: "range", value: 8, min: 4, max: 12, step: 1 } },
      { name: "onValueChange", type: "(value: string) => void", description: "数字串变化时调用。清空时是空字符串。" },
      className,
    ],
  },
]

export const batch70ShowcaseComponents: ComponentMeta[] = [
  {
    name: "finish-swatch-morph",
    batch: 70,
    title: "Finish Swatch Morph",
    description:
      "原创。底部一排色卡切换同一块几何剪影的色泽，指示环滑到选中项，媒体区交叉淡入。左右方向键、Home 和 End 都能换。这是色卡驱动同一件东西的颜色，不是 tab-media-swap 的左表右媒，也不是前后擦除或轮播。减弱动效瞬时换色。没有循环帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/finish-swatch-morph.tsx",
    target: "components/ui/finish-swatch-morph.tsx",
    presets: [
      { name: "calm", label: "少", values: { pace: 0.6, intensity: 0.3, count: 4, gap: 8 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, count: 5, gap: 12 } },
      { name: "lush", label: "多", values: { pace: 1.6, intensity: 1, count: 6, gap: 20 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "切换速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "切换时的缩放幅度。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "5", description: "色卡数量，4 到 6。", control: { kind: "range", value: 5, min: 4, max: 6, step: 1 } },
      { name: "gap", type: "number", defaultValue: "12", description: "色卡间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 28, step: 1 } },
      { name: "onIndexChange", type: "(index: number) => void", description: "换色时调用，参数是新的序号，从 0 开始。" },
      className,
    ],
  },
]

export const batch70MicroComponents: ComponentMeta[] = [
  {
    name: "slide-rail-confirm",
    batch: 70,
    title: "Slide Rail Confirm",
    description:
      "原创。胶囊轨上的拇指要滑到阈值才确认，没到就弹簧弹回；成功后轨道填满并停在对勾，直到 Reset。方向键只改进度，Enter 到了阈值才提交。这不是 slide-to-confirm 松手归零的滑块，也不是 swipe-action-row 的列表侧滑，更不是 hold-fill-commit 的长按。减弱动效改成一键 Confirm。离开视口后回弹帧停止。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/slide-rail-confirm.tsx",
    target: "components/ui/slide-rail-confirm.tsx",
    presets: [
      { name: "soft", label: "松", values: { pace: 0.6, intensity: 0.3, threshold: 0.95 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, threshold: 0.9 } },
      { name: "firm", label: "紧", values: { pace: 1.6, intensity: 1, threshold: 0.75 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "回弹速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "轨高和拇指尺寸。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "threshold", type: "number", defaultValue: "0.9", description: "确认阈值，0.7 到 1。", control: { kind: "range", value: 0.9, min: 0.7, max: 1, step: 0.01 } },
      { name: "onConfirm", type: "() => void", description: "滑过阈值或按 Enter 确认时调用一次。" },
      className,
    ],
  },
  {
    name: "undo-countdown-ring",
    batch: 70,
    title: "Undo Countdown Ring",
    description:
      "原创。点 Commit 后出现撤销条，SVG 环按剩余时间走完。时限内点 Undo 回到空闲；归零后横幅消失并锁定。这是事后的撤销窗，不是 hold-fill-commit 的长按填充。减弱动效改成静态秒数，环不再走。离开视口时倒计时暂停，回到视口再继续。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/undo-countdown-ring.tsx",
    target: "components/ui/undo-countdown-ring.tsx",
    presets: [
      { name: "short", label: "短", values: { pace: 2, intensity: 0.3, autoCommit: false, label: "Commit" } },
      { name: "default", label: "默认", values: { pace: 4, intensity: 0.6, autoCommit: false, label: "Commit" } },
      { name: "long", label: "长", values: { pace: 8, intensity: 1, autoCommit: true, label: "Send" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "4", description: "倒计时总时长，单位秒。", control: { kind: "range", value: 4, min: 2, max: 8, step: 0.5, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "环的粗细和横幅强调。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "autoCommit", type: "boolean", defaultValue: "false", description: "进入视口后自动提交一次。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "label", type: "string", defaultValue: '"Commit"', description: "提交按钮的文字。", control: { kind: "text", value: "Commit", group: "文字" } },
      { name: "onCommit", type: "() => void", description: "进入倒计时时调用。" },
      { name: "onUndo", type: "() => void", description: "在归零前撤销时调用。" },
      { name: "onLock", type: "() => void", description: "倒计时归零并锁定时调用。" },
      className,
    ],
  },
]
