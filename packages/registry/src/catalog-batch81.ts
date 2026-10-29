import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 75 批调研，catalog batch 81。六个原创工作台微交互，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

export const batch81ShowcaseComponents: ComponentMeta[] = [
  {
    name: "rail-pin-annotate",
    batch: 81,
    title: "Rail Pin Annotate",
    description:
      "原创。水平工作台内容轨上可拖钉标注，点钉展开短 callout。方向键切钉，Enter 展开，方括号微调位置。这是轨上钉评，不是 scroll-timeline-reveal 的滚动揭示，也不是 wave-pin-anchor 的波形钉，更不是 chapter-dash-seek 的播放章节段。减弱动效瞬时切展开与位置。demo 用中性 Milestone 文案，不用社交或健康品牌商标。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/rail-pin-annotate.tsx",
    target: "components/ui/rail-pin-annotate.tsx",
    presets: [
      { name: "tight", label: "紧", values: { pace: 0.6, intensity: 0.35, snap: true, oneOpen: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, snap: false, oneOpen: true } },
      { name: "loose", label: "松", values: { pace: 1.3, intensity: 1, snap: false, oneOpen: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "展开与拖动吸附速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "钉与 callout 对比强度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "snap", type: "boolean", defaultValue: "false", description: "拖钉是否吸附刻度。", control: { kind: "boolean", value: false, group: "交互" } },
      { name: "oneOpen", type: "boolean", defaultValue: "true", description: "是否同时仅一个 callout。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onValueChange", type: "(state: { activePin: number | null; pins: { at: number }[] }) => void", description: "激活钉或位置变化时调用。" },
      className,
    ],
  },
  {
    name: "pane-blend-compare",
    batch: 81,
    title: "Pane Blend Compare",
    description:
      "原创。左右两块中性内容面板用中央竖滑杆做软混合 crossfade，不是硬裁切。方向键调混合比，Home End 跳端。这是双面板软混合，不是 before-after-wipe 的照片硬 wipe。减弱动效瞬时切混合比。demo 用抽象色块布局，不用真人照片与修图商标。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/pane-blend-compare.tsx",
    target: "components/ui/pane-blend-compare.tsx",
    presets: [
      { name: "soft", label: "柔", values: { pace: 0.6, intensity: 0.4, showLabels: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, showLabels: true } },
      { name: "sharp", label: "锐", values: { pace: 1.3, intensity: 1, showLabels: false } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "柄跟随速度倍数。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "混合羽化宽度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "showLabels", type: "boolean", defaultValue: "true", description: "是否显示 A B 标签。", control: { kind: "boolean", value: true, group: "外观" } },
      { name: "onValueChange", type: "(state: { t: number }) => void", description: "混合比变化时调用。" },
      className,
    ],
  },
  {
    name: "layer-peel-sheet",
    batch: 81,
    title: "Layer Peel Sheet",
    description:
      "原创。上层文档卡片右下角可拖撕开露出下层摘要，过阈值翻到下一页。方向键调 peel，Enter 确认翻页。这是多页文档角撕，不是 sticker-peel 单贴纸，也不是 flip-reveal-card 整卡翻转，更不是 peek-fan-stack 扇形 peek。减弱动效瞬时切页无卷曲。离开视口后翻页过渡停止。demo 用中性 Doc 文案，不用真实人脸照片。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/layer-peel-sheet.tsx",
    target: "components/ui/layer-peel-sheet.tsx",
    presets: [
      { name: "light", label: "轻", values: { pace: 0.6, intensity: 0.35, threshold: 0.55 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, threshold: 0.45 } },
      { name: "heavy", label: "重", values: { pace: 1.3, intensity: 1, threshold: 0.35 } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "撕揭与翻页过渡速度。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "卷曲阴影强度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "threshold", type: "number", defaultValue: "0.45", description: "触发翻页的 peel 阈值。", control: { kind: "range", value: 0.45, min: 0.25, max: 0.75, step: 0.05, group: "交互" } },
      { name: "onValueChange", type: "(state: { page: number; peel: number }) => void", description: "页码或 peel 变化时调用。" },
      className,
    ],
  },
  {
    name: "funnel-drop-stage",
    batch: 81,
    title: "Funnel Drop Stage",
    description:
      "原创。竖直漏斗宽条逐级收窄，点选某级高亮并显示掉量百分比。方向键切级，Enter 锁定。这是漏斗掉量图，不是 stage-lane-flow 多泳道，也不是 strip-step-expand 条带展开，更不是 color-step-rail 色阶轨。减弱动效瞬时切高亮无宽度 morph。demo 用中性 Visits 到 Buy 文案，不用建站商标。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/funnel-drop-stage.tsx",
    target: "components/ui/funnel-drop-stage.tsx",
    presets: [
      { name: "flat", label: "平", values: { pace: 0.6, intensity: 0.35, showDrop: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, showDrop: true } },
      { name: "steep", label: "陡", values: { pace: 1.3, intensity: 1, showDrop: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "高亮过渡速度。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "级差对比与强调强度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "showDrop", type: "boolean", defaultValue: "true", description: "是否显示掉量百分比。", control: { kind: "boolean", value: true, group: "外观" } },
      { name: "onValueChange", type: "(state: { activeIndex: number }) => void", description: "激活级变化时调用。" },
      className,
    ],
  },
  {
    name: "status-rail-hop",
    batch: 81,
    title: "Status Rail Hop",
    description:
      "原创。水平状态轨上胶囊跳到下一合法态，非法转移轻拒。方向键在邻态间跳，Enter 确认。这是带合法边的状态机跳跃，不是 spine-node-march 竖脊行进，也不是 live-stage-capsule 直播胶囊，更不是 swipe-style-cycle 样式循环。减弱动效瞬时切态无跳跃弧。离开视口后跳跃过渡停止。demo 用 Saved 到 Archived 中性态名，不照搬第三方品牌色。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/status-rail-hop.tsx",
    target: "components/ui/status-rail-hop.tsx",
    presets: [
      { name: "free", label: "自由", values: { pace: 0.6, intensity: 0.35, enforceEdges: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, enforceEdges: true } },
      { name: "strict", label: "严", values: { pace: 1.3, intensity: 1, enforceEdges: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "跳跃过渡速度。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "胶囊对比与跳弧幅度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "enforceEdges", type: "boolean", defaultValue: "true", description: "是否强制合法转移边。", control: { kind: "boolean", value: true, group: "交互" } },
      { name: "onValueChange", type: "(state: { active: string }) => void", description: "当前状态变化时调用。" },
      className,
    ],
  },
  {
    name: "node-link-pulse",
    batch: 81,
    title: "Node Link Pulse",
    description:
      "原创。小关系图点选节点后邻边路径脉冲高亮并旁侧列标签。方向键切节点，Enter 锁定。这是点选脉冲邻边，不是 scroll-svg-graph 滚动大图，也不是 spine-node-march 竖脊行进。减弱动效静态高亮边无脉冲。离开视口后脉冲停止。demo 用中性 Note Tag 节点，不用知识库商标。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/node-link-pulse.tsx",
    target: "components/ui/node-link-pulse.tsx",
    presets: [
      { name: "still", label: "静", values: { pace: 0.6, intensity: 0.35, pulse: false } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.7, pulse: true } },
      { name: "busy", label: "密", values: { pace: 1.3, intensity: 1, pulse: true } },
    ],
    props: [
      { name: "pace", type: "number", defaultValue: "1", description: "脉冲与切换速度。", control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" } },
      { name: "intensity", type: "number", defaultValue: "0.7", description: "边高亮与脉冲强度。", control: { kind: "range", value: 0.7, min: 0, max: 1, step: 0.05 } },
      { name: "pulse", type: "boolean", defaultValue: "true", description: "邻边是否脉冲。", control: { kind: "boolean", value: true, group: "动画" } },
      { name: "onValueChange", type: "(state: { activeId: string | null }) => void", description: "激活节点变化时调用。" },
      className,
    ],
  },
]
