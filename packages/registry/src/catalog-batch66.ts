import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 60 批调研，catalog batch 66。六个原创交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch66ScrollComponents: ComponentMeta[] = [
  {
    name: "sticky-stack-cards",
    batch: 66,
    title: "Sticky Stack Cards",
    description:
      "原创。竖向滚动时当前卡片钉在顶部，并按进度缩小、微微旋转、往下沉，下一张从下方顶上来盖住它。方向键和 PageDown 可以步进到下一张。这不是 sticky-grid-scroll 的三列网格错位，也不是抛掷、文件夹或横向封面流。减弱动效改成静止的竖列，不再钉住。离开视口后不再监听滚动。",
    layer: "effect",
    effectCategory: "scroll",
    source: "original",
    type: "registry:ui",
    file: "effects/sticky-stack-cards.tsx",
    target: "components/ui/sticky-stack-cards.tsx",
    presets: [
      { name: "gentle", label: "轻", values: { pace: 0.6, tilt: 3, depth: 0.08 } },
      { name: "default", label: "默认", values: { pace: 1, tilt: 6, depth: 0.16 } },
      { name: "tight", label: "紧", values: { pace: 1.6, tilt: 12, depth: 0.28 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "叠压完成的速度倍数。越大，同样的滚动距离叠得越快。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "tilt", type: "number", defaultValue: "6", description: "沉降时的最大旋转角，单位度。", control: { kind: "range", value: 6, min: 0, max: 16, step: 1, group: "外观" } },
      { name: "depth", type: "number", defaultValue: "0.16", description: "沉降时的缩放落差。", control: { kind: "range", value: 0.16, min: 0, max: 0.4, step: 0.02, group: "外观" } },
      { name: "cards", type: "readonly StickyStackCard[]", description: "卡片。每项含 id、title、body。省略时用四张内置卡片。" },
      className,
    ],
  },
]

export const batch66CardsComponents: ComponentMeta[] = [
  {
    name: "glass-feature-trio",
    batch: 66,
    title: "Glass Feature Trio",
    description:
      "原创。固定三列磨砂玻璃卡，每张下面有自己的色块。细指针移动时色块中心跟着走，卡片轻轻抬起；键盘聚焦有同样的抬起。粗指针和触屏不靠悬停，只留可见焦点环和静止色块。这不是单张 glass-card，也不是整卡虹彩描边。减弱动效时色块和卡片都静止。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/glass-feature-trio.tsx",
    target: "components/ui/glass-feature-trio.tsx",
    presets: [
      { name: "soft", label: "柔", values: { blur: 8, intensity: 0.35, pace: 0.6 } },
      { name: "default", label: "默认", values: { blur: 16, intensity: 0.7, pace: 1 } },
      { name: "sharp", label: "利", values: { blur: 24, intensity: 1, pace: 1.6 } },
    ],
    props: [
      { name: "blur", type: "number", defaultValue: "16", description: "磨砂模糊半径，单位像素。", control: { kind: "range", value: 16, min: 0, max: 32, step: 1, group: "外观" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "抬起幅度和色块饱和度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "pace", type: "number", defaultValue: "1", description: "色块跟随和抬起的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "features", type: "readonly GlassFeature[]", description: "三张卡片。每项含 id、title、body。省略时用内置三张。多于三张时只取前三张。" },
      className,
    ],
  },
  {
    name: "page-curl-turn",
    batch: 66,
    title: "Page Curl Turn",
    description:
      "原创。卡片右下角可以拖出卷曲，超过 threshold 就翻到下一页。Turn page 按钮、Enter 和右方向键也会翻，左方向键翻回去。这不是撕开贴纸，也不是绕 Y 轴的三维翻转，更不是横缝裂开。减弱动效时没有卷曲，按钮会立刻换页。",
    layer: "effect",
    effectCategory: "cards",
    source: "original",
    type: "registry:ui",
    file: "effects/page-curl-turn.tsx",
    target: "components/ui/page-curl-turn.tsx",
    presets: [
      { name: "loose", label: "松", values: { threshold: 0.6, pace: 0.7, curl: 20 } },
      { name: "default", label: "默认", values: { threshold: 0.42, pace: 1, curl: 36 } },
      { name: "crisp", label: "干脆", values: { threshold: 0.28, pace: 1.6, curl: 60 } },
    ],
    props: [
      { name: "threshold", type: "number", defaultValue: "0.42", description: "松手后翻页所需的卷曲进度。", control: { kind: "range", value: 0.42, min: 0.2, max: 0.8, step: 0.02, group: "交互" } },
      { name: "pace", type: "number", defaultValue: "1", description: "卷曲回弹和翻页的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "curl", type: "number", defaultValue: "36", description: "卷角的半径，单位像素。", control: { kind: "range", value: 36, min: 8, max: 72, step: 2, group: "外观" } },
      { name: "pages", type: "readonly CurlPage[]", description: "页面。每项含 id、title、body。省略时用三页内置文案。" },
      { name: "onTurn", type: "(pageIndex: number) => void", description: "翻到另一页时调用，参数是新的页码，从 0 开始。" },
      className,
    ],
  },
]

export const batch66ShowcaseComponents: ComponentMeta[] = [
  {
    name: "hex-zone-hotspots",
    batch: 66,
    title: "Hex Zone Hotspots",
    description:
      "原创。抽象平面上画着半透明六边形热区和簇点。点选或按 Enter 后，旁边出现标题、距离和摘要，Esc 收起。方向键在热区之间移动。这不是从中心拉出的放射标签，也不是上传轨道。没有地图 SDK。减弱动效时没有脉冲，详情直接出现。离开视口后脉冲停止。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/hex-zone-hotspots.tsx",
    target: "components/ui/hex-zone-hotspots.tsx",
    presets: [
      { name: "calm", label: "静", values: { intensity: 0.25, pulse: 0.2, pace: 0.6 } },
      { name: "default", label: "默认", values: { intensity: 0.45, pulse: 0.6, pace: 1 } },
      { name: "hot", label: "热", values: { intensity: 0.85, pulse: 1, pace: 1.6 } },
    ],
    props: [
      { name: "intensity", type: "number", defaultValue: "0.45", description: "六边形热区的不透明度。", control: { kind: "range", value: 0.45, min: 0.1, max: 1, step: 0.05 } },
      { name: "pulse", type: "number", defaultValue: "0.6", description: "选中点的脉冲幅度。0 时不脉冲。", control: { kind: "range", value: 0.6, min: 0, max: 1, step: 0.05, group: "动画" } },
      { name: "pace", type: "number", defaultValue: "1", description: "详情弹出的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "zones", type: "readonly HexZone[]", description: "热区。每项含 id、title、distance、summary、cx、cy。省略时用四个内置区域。" },
      { name: "onSelect", type: "(id: string | null) => void", description: "选中时带上区域 id，Esc 收起时为 null。" },
      className,
    ],
  },
]

export const batch66MicroComponents: ComponentMeta[] = [
  {
    name: "orbital-action-ring",
    batch: 66,
    title: "Orbital Action Ring",
    description:
      "原创。点一下中心锚点，虚线圆轨道上弹出确认、删除、刷新等动作。左右方向键沿环移动，Enter 确认，Esc 关闭。触屏先点锚点再点动作。这不是底部表情条，也不是放射文案。减弱动效改成竖直的动作列表，不再弹簧展开。",
    layer: "effect",
    effectCategory: "micro",
    source: "original",
    type: "registry:ui",
    file: "effects/orbital-action-ring.tsx",
    target: "components/ui/orbital-action-ring.tsx",
    presets: [
      { name: "near", label: "近", values: { radius: 72, pace: 0.7, count: 3 } },
      { name: "default", label: "默认", values: { radius: 92, pace: 1, count: 3 } },
      { name: "wide", label: "宽", values: { radius: 128, pace: 1.5, count: 5 } },
    ],
    props: [
      { name: "radius", type: "number", defaultValue: "92", description: "轨道半径，单位像素。", control: { kind: "range", value: 92, min: 64, max: 140, step: 2, group: "外观" } },
      { name: "pace", type: "number", defaultValue: "1", description: "动作钮弹出的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "count", type: "number", defaultValue: "3", description: "轨道上的动作数，3 到 5。", control: { kind: "range", value: 3, min: 3, max: 5, step: 1 } },
      { name: "actions", type: "readonly OrbitalAction[]", description: "动作。每项含 id 和 label。省略时用确认、删除、刷新、替换和固定，再按 count 截取。" },
      { name: "onAction", type: "(id: string) => void", description: "确认一个动作时调用。同一次打开里只调用一次。" },
      className,
    ],
  },
]

export const batch66LoadersComponents: ComponentMeta[] = [
  {
    name: "scan-rail-progress",
    batch: 66,
    title: "Scan Rail Progress",
    description:
      "原创。圆角遮罩里有一条横轨上下来回扫。auto 按 pace 把进度走到 1，hold 要按住空格或按住画面才会涨，松手就停。到 1 时 onComplete 只调用一次，然后可以 Reset。这不是转圈，也不是开屏或聚光清字。减弱动效关掉扫描，用 Complete 一次完成。离开视口后动画帧暂停。",
    layer: "effect",
    effectCategory: "loaders",
    source: "original",
    type: "registry:ui",
    file: "effects/scan-rail-progress.tsx",
    target: "components/ui/scan-rail-progress.tsx",
    presets: [
      { name: "slow", label: "慢", values: { pace: 0.6, intensity: 0.4, mode: "auto" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, mode: "auto" } },
      { name: "hold", label: "按住", values: { pace: 1.4, intensity: 0.9, mode: "hold" } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "进度和扫描轨的速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "遮罩变暗和扫描轨的亮度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "mode", type: '"auto" | "hold"', defaultValue: '"auto"', description: "auto 自己走到完成，hold 要按住才涨。", control: { kind: "select", value: "auto", options: ["auto", "hold"], group: "交互" } },
      { name: "onComplete", type: "() => void", description: "进度到 1 时调用一次。Reset 之后可以再完成一次。" },
      className,
    ],
  },
]
