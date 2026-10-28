import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 68 批调研，catalog batch 74。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch74ShowcaseComponents: ComponentMeta[] = [
  {
    name: "horizon-sun-scrub",
    batch: 74,
    title: "Horizon Sun Scrub",
    description:
      "原创。地平线上方一条虚线弧，太阳沿弧跟着手走，天空在夜、黎明、日间和黄昏之间洗色，时刻 pill 从 05:00 走到 21:00。底部尺和太阳共用同一个 t。松手可以吸到 Rise、Noon、Set。左右方向键微调。这是天空渐变加地平线弧，不是 solar-orbit-scrub 的中央立方投影，也不是 oscillation-arc-dial 的弧角选值。减弱动效用滑块瞬时改时刻，不再播放吸附。离开视口后吸附帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/horizon-sun-scrub.tsx",
    target: "components/ui/horizon-sun-scrub.tsx",
    presets: [
      { name: "dawn", label: "黎明", values: { pace: 0.6, intensity: 0.3, span: 0.55, snap: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, span: 0.8, snap: true } },
      { name: "open", label: "不吸附", values: { pace: 1.6, intensity: 1, span: 1, snap: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "松手吸附的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "天空对比和太阳辉光。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "span", type: "number", defaultValue: "0.8", description: "日照弧占画面宽度的比例。", control: { kind: "range", value: 0.8, min: 0.45, max: 1, step: 0.05 } },
      { name: "snap", type: "boolean", defaultValue: "true", description: "松手时吸到 Rise、Noon 或 Set。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onValueChange", type: "(t: number) => void", description: "t 变化时调用，范围 0 到 1。" },
      className,
    ],
  },
  {
    name: "breath-expand-ring",
    batch: 74,
    title: "Breath Expand Ring",
    description:
      "原创。同心环按 Inhale、Hold、Exhale 扩缩，中央写当前相位，上方显示吸气和呼气秒数。Start 或空格开始，再按暂停。上下方向键改演示节奏。这是自动相位引导，不是 hold-fill-commit 的长按确认，也不是 undo-countdown-ring 的撤销倒计时。减弱动效保持静态环，只瞬时切换相位文案。离开视口后相位循环停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/breath-expand-ring.tsx",
    target: "components/ui/breath-expand-ring.tsx",
    presets: [
      { name: "slow", label: "慢", values: { pace: 0.6, intensity: 0.3, phases: "4-2-6-2", loops: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, phases: "4-2-6-2", loops: true } },
      { name: "box", label: "方波", values: { pace: 1.4, intensity: 1, phases: "4-4-4-4", loops: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "相位时长的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "吸气时的最大缩放。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      {
        name: "phases",
        type: '"4-2-6-2" | "4-4-4-4" | "5-2-5-2"',
        defaultValue: '"4-2-6-2"',
        description: "吸气、停、呼气、停的秒数。",
        control: { kind: "select", value: "4-2-6-2", options: ["4-2-6-2", "4-4-4-4", "5-2-5-2"], group: "交互" },
      },
      { name: "loops", type: "boolean", defaultValue: "true", description: "一轮结束后继续。", control: { kind: "boolean", value: true, group: "动画" } },
      { name: "onPhaseChange", type: "(phase: BreathPhase) => void", description: "相位切换时调用。" },
      className,
    ],
  },
  {
    name: "masonry-density-live",
    batch: 74,
    title: "Masonry Density Live",
    description:
      "原创。圆角色块排成瀑布列，Size、Gap、Padding 滑杆即时改密度，列数也可以调。这是全局密度控制，不是 proximity-scale-grid 的近距缩放，也不是 bento-asymmetric-grid 的固定拼贴。减弱动效瞬时改间距，不再过渡。离开视口后落定帧停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/masonry-density-live.tsx",
    target: "components/ui/masonry-density-live.tsx",
    presets: [
      { name: "dense", label: "密", values: { pace: 1.4, intensity: 0.4, size: 96, gap: 4, padding: 8, columns: 4 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, size: 128, gap: 12, padding: 16, columns: 3 } },
      { name: "airy", label: "疏", values: { pace: 0.6, intensity: 1, size: 180, gap: 28, padding: 32, columns: 2 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "重排过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "色块高度的倍率。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "size", type: "number", defaultValue: "128", description: "色块基准尺寸，单位像素。", control: { kind: "range", value: 128, min: 80, max: 200, step: 4 } },
      { name: "gap", type: "number", defaultValue: "12", description: "列间距和块间距，单位像素。", control: { kind: "range", value: 12, min: 0, max: 40, step: 2 } },
      { name: "padding", type: "number", defaultValue: "16", description: "砌体外边距，单位像素。", control: { kind: "range", value: 16, min: 0, max: 48, step: 2 } },
      { name: "columns", type: "number", defaultValue: "3", description: "列数，2 到 4。", control: { kind: "range", value: 3, min: 2, max: 4, step: 1 } },
      { name: "onLayoutChange", type: "(layout: MasonryLayout) => void", description: "密度变化时调用，带上 size、gap、padding 和 columns。" },
      className,
    ],
  },
]

export const batch74CursorComponents: ComponentMeta[] = [
  {
    name: "presence-name-cursors",
    batch: 74,
    title: "Presence Name Cursors",
    description:
      "原创。画布上多枚彩色箭头光标，各自带着 Ada、Kai 这类中性名牌，缓慢漂移。点选或方向键聚焦一枚，Enter 钉住。这是多用户具名光标场，不是 cursor-follow 的单指针跟随，也不是 cursor-trail 的拖尾。减弱动效光标停在布局位，只瞬时改焦点。离开视口后漂移停止。",
    layer: "effect",
    effectCategory: "cursor",
    source: "original",
    type: "registry:ui",
    file: "effects/presence-name-cursors.tsx",
    target: "components/ui/presence-name-cursors.tsx",
    presets: [
      { name: "few", label: "少", values: { pace: 0.6, intensity: 0.3, count: 3, trail: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, count: 4, trail: true } },
      { name: "many", label: "多", values: { pace: 1.6, intensity: 1, count: 6, trail: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "漂移速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "非焦点光标的最低透明度，以及焦点放大。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "count", type: "number", defaultValue: "4", description: "光标数量，3 到 6。", control: { kind: "range", value: 4, min: 3, max: 6, step: 1 } },
      { name: "trail", type: "boolean", defaultValue: "true", description: "焦点光标带短拖尾。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onFocusChange", type: "(index: number) => void", description: "焦点变化时调用，参数从 0 开始。" },
      className,
    ],
  },
]

export const batch74MicroComponents: ComponentMeta[] = [
  {
    name: "eyedrop-loupe-pick",
    batch: 74,
    title: "Eyedrop Loupe Pick",
    description:
      "原创。在几何色块上拖动圆形放大镜，外环涂上采样到的主题色，下方 chip 显示色名。Confirm 锁定。方向键微调位置。这是自由拖动取色，不是 color-step-rail 的色阶，也不是 blob-zoom-lens 的液态放大。减弱动效不放大，移动时瞬时改环色。没有循环帧。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/eyedrop-loupe-pick.tsx",
    target: "components/ui/eyedrop-loupe-pick.tsx",
    presets: [
      { name: "soft", label: "淡", values: { pace: 0.6, intensity: 0.3, grid: 2, snap: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.6, grid: 3, snap: true } },
      { name: "fine", label: "细", values: { pace: 1.6, intensity: 1, grid: 5, snap: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "环色和放大过渡的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.6", description: "放大倍率和外环厚度。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05 } },
      { name: "grid", type: "number", defaultValue: "3", description: "取样网格的边长，2 到 5。", control: { kind: "range", value: 3, min: 2, max: 5, step: 1 } },
      { name: "snap", type: "boolean", defaultValue: "true", description: "松手时吸到色块中心。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onColorChange", type: "(tone: string) => void", description: "采样色名变化时调用。" },
      className,
    ],
  },
]

export const batch74CardsComponents: ComponentMeta[] = [
  {
    name: "perforate-ticket-tear",
    batch: 74,
    title: "Perforate Ticket Tear",
    description:
      "原创。票面写着 Admit One，齿孔和侧凹槽分开票根 Stub A。把票根拖过阈值就撕离并盖上 Redeemed，没过阈值就弹回。方向键累积进度，Enter 确认。这是齿孔票根撕开，不是 sticker-peel 的揭贴纸，也不是 page-curl-turn 的卷页。减弱动效瞬时在完整和撕开之间切换。离开视口后回弹帧停止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/perforate-ticket-tear.tsx",
    target: "components/ui/perforate-ticket-tear.tsx",
    presets: [
      { name: "loose", label: "松", values: { pace: 0.6, intensity: 0.3, threshold: 0.7, axis: "vertical" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.65, threshold: 0.45, axis: "vertical" } },
      { name: "side", label: "横向", values: { pace: 1.6, intensity: 1, threshold: 0.3, axis: "horizontal" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "回弹和撕离的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.65", description: "齿孔半径和撕开后的旋转角。", control: { kind: "range", value: 0.65, min: 0, max: 1, step: 0.05 } },
      { name: "threshold", type: "number", defaultValue: "0.45", description: "触发撕开的位移比。", control: { kind: "range", value: 0.45, min: 0.2, max: 0.8, step: 0.05, group: "交互" } },
      {
        name: "axis",
        type: '"vertical" | "horizontal"',
        defaultValue: '"vertical"',
        description: "撕开方向。",
        control: { kind: "select", value: "vertical", options: ["vertical", "horizontal"], group: "交互" },
      },
      { name: "onTear", type: "() => void", description: "撕开完成时调用一次。" },
      className,
    ],
  },
]
