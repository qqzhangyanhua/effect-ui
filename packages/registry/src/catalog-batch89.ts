import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 83 批调研，catalog batch 89。六个原创拖放与重排微反馈，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function pace(description: string): PropDoc {
  return {
    name: "pace",
    type: "number",
    defaultValue: "1",
    description,
    control: { kind: "range", value: 1, min: 0.4, max: 2, step: 0.1, group: "动画" },
  }
}

function intensity(value: number, description: string): PropDoc {
  return {
    name: "intensity",
    type: "number",
    defaultValue: String(value),
    description,
    control: { kind: "range", value, min: 0, max: 1, step: 0.01 },
  }
}

export const batch89ShowcaseComponents: ComponentMeta[] = [
  {
    name: "grip-lift-rise",
    batch: 89,
    title: "Grip Lift Rise",
    description:
      "原创。按住行首拖柄时，该行短促抬起：阴影托板或一次微缩放，确认已经抓起。抬起层不接收指针。键盘可 Tab 到拖柄，Space 或 Enter 抓起，方向键或 Move 调序，Release 落位，Esc 或 Cancel 回到抓起前的顺序。只有拖柄接管手势，页面仍可滚动。这不是 hover-lift-glow 的悬停抬起，也不是 paint-lift-rail、press-snap-beacon 或 sortable-list 的整表重排。没有声音。减弱动效时直接停在抬起静帧。离开视口时打断抬起动画，并停在当前静帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/grip-lift-rise.tsx",
    target: "components/ui/grip-lift-rise.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, style: "shadow", handle: "bars" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.28, style: "shadow", handle: "bars" } },
      { name: "scale", label: "缩放", values: { pace: 1.3, intensity: 0.62, style: "scale", handle: "dots" } },
    ],
    props: [
      pace("抬起时长的速度倍数。"),
      intensity(0.28, "阴影或抬升幅度，默认偏低。"),
      {
        name: "style",
        type: '"shadow" | "scale"',
        defaultValue: '"shadow"',
        description: "用阴影托板抬起，或做一次很小的缩放。",
        control: { kind: "select", value: "shadow", options: ["shadow", "scale"], group: "外观" },
      },
      {
        name: "handle",
        type: '"bars" | "dots"',
        defaultValue: '"bars"',
        description: "拖柄是横条，还是两列圆点。",
        control: { kind: "select", value: "bars", options: ["bars", "dots"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"rest\" | \"lifted\" | \"placed\"; lifted: boolean }) => void", description: "空列表、静止、抬起或落位变化时调用。" },
      className,
    ],
  },
  {
    name: "slot-gap-shim",
    batch: 89,
    title: "Slot Gap Shim",
    description:
      "原创。拖移预览时，目标行间张开一条占位 shim，原位可以留一层虚线幽灵。Shim 和幽灵都不接收指针，也不进 Tab。方向键或 Insert 移动插入位，Drop 落下，Esc 或 Cancel 关上缝并回到原顺序。这不是 seed-slot-drop 的投槽，也不是 digit-slot-gate、scrub-ghost-whisk、ghost-trail-text 或 sortable-list。没有声音。减弱动效时缝直接张开。离开视口时停在最后的插入静帧。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/slot-gap-shim.tsx",
    target: "components/ui/slot-gap-shim.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.2, style: "outline", ghost: "off" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.42, style: "outline", ghost: "on" } },
      { name: "fill", label: "填充", values: { pace: 1.3, intensity: 0.7, style: "fill", ghost: "on" } },
    ],
    props: [
      pace("占位缝张开的速度倍数。"),
      intensity(0.42, "缝的高度和对比。"),
      {
        name: "style",
        type: '"outline" | "fill"',
        defaultValue: '"outline"',
        description: "虚线空槽，或一块淡填充。",
        control: { kind: "select", value: "outline", options: ["outline", "fill"], group: "外观" },
      },
      {
        name: "ghost",
        type: '"on" | "off"',
        defaultValue: '"on"',
        description: "原位是否留下虚线幽灵。",
        control: { kind: "select", value: "on", options: ["on", "off"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"rest\" | \"dragging\" | \"placed\"; insertAt: number }) => void", description: "空列表、静止、拖移或落位变化时调用。" },
      className,
    ],
  },
  {
    name: "lane-insert-beam",
    batch: 89,
    title: "Lane Insert Beam",
    description:
      "原创。拖到列表缝或另一列时，出现一条插入 beam：横线标出缝，或列缘亮一条竖线，并可写出 Insert here。Beam 不接收指针。焦点卡片可用方向键瞄准，Move to Open、Move to Hold 或 Commit 落位，Esc 或 Cancel 卸掉 beam。空列也能亮起 beam。这不是 funnel-drop-stage，也不是 physics-dropzone、card-toss-stack 或 shuffle-grid-hero。没有整列闪红。减弱动效时 beam 直接出现，没有扫光。离开视口时卸掉 beam，列内容保持。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/lane-insert-beam.tsx",
    target: "components/ui/lane-insert-beam.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.2, style: "line", label: "off" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.4, style: "line", label: "on" } },
      { name: "column", label: "列缘", values: { pace: 1.3, intensity: 0.72, style: "column", label: "on" } },
    ],
    props: [
      pace("插入 beam 显现的速度倍数。"),
      intensity(0.4, "beam 的对比。"),
      {
        name: "style",
        type: '"line" | "column"',
        defaultValue: '"line"',
        description: "缝上的横线，或列缘的竖线。",
        control: { kind: "select", value: "line", options: ["line", "column"], group: "外观" },
      },
      {
        name: "label",
        type: '"on" | "off"',
        defaultValue: '"on"',
        description: "是否写出 Insert here。",
        control: { kind: "select", value: "on", options: ["on", "off"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"rest\" | \"aiming\" | \"moved\"; lane: \"open\" | \"hold\" | \"none\" }) => void", description: "静止、瞄准或落位变化时调用。" },
      className,
    ],
  },
  {
    name: "rim-reject-wobble",
    batch: 89,
    title: "Rim Reject Wobble",
    description:
      "原创。拖进 Locked 无效区，或按下 Attempt invalid move 时，容器做一次克制描边。soft 档的位移不超过 3 像素，并且只发生一次。同时有斜线和文字，不靠颜色单独表达，也不闪整页。描边不接收指针。Esc 或 Dismiss 退出，焦点回到按钮。没有声音。这不是 buzz-rim-flash，也不是 rubber-band-drag、drag-lock-escape 或 inline-alert-rail。减弱动效时只留静帧描边和文字，没有位移。离开视口时停掉插值，文字可以留下。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/rim-reject-wobble.tsx",
    target: "components/ui/rim-reject-wobble.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.08, nudge: "none", copy: "on" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.22, nudge: "rim", copy: "on" } },
      { name: "soft", label: "软", values: { pace: 1.2, intensity: 0.45, nudge: "soft", copy: "on" } },
    ],
    props: [
      pace("一次 reject 收束的速度倍数。"),
      intensity(0.22, "描边对比和 soft 位移，默认很低。"),
      {
        name: "nudge",
        type: '"rim" | "soft" | "none"',
        defaultValue: '"rim"',
        description: "只描边、描边加不超过 3 像素的一次位移，或只留图标和文字。",
        control: { kind: "select", value: "rim", options: ["rim", "soft", "none"], group: "外观" },
      },
      {
        name: "copy",
        type: '"on" | "off"',
        defaultValue: '"on"',
        description: "显示 Can't drop here，或改成短词 Blocked。图标始终在。",
        control: { kind: "select", value: "on", options: ["on", "off"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"rest\" | \"reject\" }) => void", description: "静止或拒绝变化时调用。" },
      className,
    ],
  },
  {
    name: "snap-home-cancel",
    batch: 89,
    title: "Snap Home Cancel",
    description:
      "原创。拖动开始后，Esc 或 Cancel 让幽灵沿短路径回到原位并卸掉，顺序与拖前一致。Drop 才会改顺序。回位层不接收指针，Cancel 在 Tab 序里，取消后焦点回到原行。这不是 press-snap-beacon，也不是 tether-yank-return、latch-thumb-spring 或 scrim-clean-dismiss。没有声音。减弱动效时瞬间回到原位。离开视口时打断回位并直接停在原位。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/snap-home-cancel.tsx",
    target: "components/ui/snap-home-cancel.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.16, style: "fade", origin: "slot" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.36, style: "snap", origin: "slot" } },
      { name: "lift", label: "抬起", values: { pace: 1.3, intensity: 0.6, style: "snap", origin: "lift" } },
    ],
    props: [
      pace("回原位的速度倍数。"),
      intensity(0.36, "回位路径的幅度。"),
      {
        name: "style",
        type: '"snap" | "fade"',
        defaultValue: '"snap"',
        description: "沿短路径回到原位，或在远处淡出。",
        control: { kind: "select", value: "snap", options: ["snap", "fade"], group: "外观" },
      },
      {
        name: "origin",
        type: '"slot" | "lift"',
        defaultValue: '"slot"',
        description: "原位用虚线槽标出，或用一条顶边标出。",
        control: { kind: "select", value: "slot", options: ["slot", "lift"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"rest\" | \"dragging\" | \"returning\" | \"placed\" }) => void", description: "空列表、静止、拖动、回位或落位变化时调用。" },
      className,
    ],
  },
  {
    name: "dock-settle-pop",
    batch: 89,
    title: "Dock Settle Pop",
    description:
      "原创。成功落位时，目标行或卡片做一次很短的 dock：微缩放，或落下一道阴影，然后停在新顺序。Preview 再 Cancel 或 Esc 不会触发 settle。Settle 装饰不接收指针。Commit move 或在焦点项上按 Enter 等价于成功落位，焦点留在该项。没有勾、没有粒子、没有声音。这不是 float-label-settle，也不是 chime-check-bloom、submit-check-flare 或 magnet-pocket-catch。减弱动效时直接切到新顺序。离开视口时卸掉 settle，新顺序保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/dock-settle-pop.tsx",
    target: "components/ui/dock-settle-pop.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, style: "shadow", anchor: "row" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.3, style: "pop", anchor: "row" } },
      { name: "card", label: "卡片", values: { pace: 1.3, intensity: 0.55, style: "pop", anchor: "card" } },
    ],
    props: [
      pace("落位 settle 的速度倍数。"),
      intensity(0.3, "settle 幅度，默认偏低。"),
      {
        name: "style",
        type: '"pop" | "shadow"',
        defaultValue: '"pop"',
        description: "一次微缩放，或一道落地阴影。",
        control: { kind: "select", value: "pop", options: ["pop", "shadow"], group: "外观" },
      },
      {
        name: "anchor",
        type: '"row" | "card"',
        defaultValue: '"row"',
        description: "落在横行上，或落在卡片上。",
        control: { kind: "select", value: "row", options: ["row", "card"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"rest\" | \"preview\" | \"docked\"; settled: boolean }) => void", description: "空列表、静止、预览或落位变化时调用。" },
      className,
    ],
  },
]
