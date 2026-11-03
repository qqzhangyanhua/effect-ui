import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 82 批调研，catalog batch 88。六个原创表单微反馈，灵感来自 Mobbin，没有移植头。 */
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

export const batch88ShowcaseComponents: ComponentMeta[] = [
  {
    name: "caret-welcome-ring",
    batch: 88,
    title: "Caret Welcome Ring",
    description:
      "原创。文本字段获得焦点时，插入符做一次短促欢迎，檐口同时亮起四角环或一条下划线，然后停住。字段始终可编辑，系统插入符不会被换掉。装饰层不接收指针。这不是 border-focus-strip 的边条扫过，也不是 echo-focus-twin、true-focus、spotlight-focus-blur 或 buzz-rim-flash。没有整页闪，也没有声音。减弱动效时环停在静帧，不再向外扩张。离开视口时卸掉环和欢迎插入符，已输入的文字保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/caret-welcome-ring.tsx",
    target: "components/ui/caret-welcome-ring.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.16, style: "underline", caret: "bar" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.34, style: "ring", caret: "bar" } },
      { name: "block", label: "块", values: { pace: 1.4, intensity: 0.7, style: "ring", caret: "block" } },
    ],
    props: [
      pace("欢迎环收起的速度倍数。"),
      intensity(0.34, "环的对比，默认偏低。"),
      {
        name: "style",
        type: '"ring" | "underline"',
        defaultValue: '"ring"',
        description: "四角欢迎环，或一条不移动的下划线。",
        control: { kind: "select", value: "ring", options: ["ring", "underline"], group: "外观" },
      },
      {
        name: "caret",
        type: '"bar" | "block"',
        defaultValue: '"bar"',
        description: "欢迎插入符是细条，还是短方块。播完即让出系统插入符。",
        control: { kind: "select", value: "bar", options: ["bar", "block"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"filled\"; focused: boolean }) => void", description: "空、已填或焦点变化时调用。" },
      className,
    ],
  },
  {
    name: "float-label-settle",
    batch: 88,
    title: "Float Label Settle",
    description:
      "原创。标签从字段内的占位位置上浮，或从左侧滑入，然后落在檐口上方或字段旁侧。有焦点或有文字时保持浮起，清空并失焦后回到占位。标签是真正的 label，不挡住输入。这不是 placeholder-vanish-input 的占位消失，也不是 scratch-line-field 或 border-focus-strip。标签不会飞出组件。减弱动效时瞬时切到浮起或回落。离开视口时停住当前落点。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/float-label-settle.tsx",
    target: "components/ui/float-label-settle.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.2, style: "float", rest: "above" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.45, style: "float", rest: "above" } },
      { name: "aside", label: "旁", values: { pace: 1.3, intensity: 0.7, style: "slide", rest: "aside" } },
    ],
    props: [
      pace("标签落位的速度倍数。"),
      intensity(0.45, "上浮距离，限制在字段檐口内。"),
      {
        name: "style",
        type: '"float" | "slide"',
        defaultValue: '"float"',
        description: "向上浮起，或从左侧滑到落点。",
        control: { kind: "select", value: "float", options: ["float", "slide"], group: "外观" },
      },
      {
        name: "rest",
        type: '"above" | "aside"',
        defaultValue: '"above"',
        description: "落在檐口上方，或落在字段左侧。",
        control: { kind: "select", value: "above", options: ["above", "aside"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"filled\"; raised: boolean }) => void", description: "空、已填或浮起状态变化时调用。" },
      className,
    ],
  },
  {
    name: "inline-alert-rail",
    batch: 88,
    title: "Inline Alert Rail",
    description:
      "原创。本地校验失败时，字段下方出现图标、文字和一条斜纹轨，檐口再做一次克制的描边。错误不靠颜色单独表达，也不铺满整页。没有声音。这不是 buzz-rim-flash，也不是 quiet-nudge-pill、feedback-widget 或 coupon-input。字段在报错后仍可编辑，焦点回到字段。减弱动效时描边直接停在静帧，没有摇晃。离开视口时卸掉闪层，图标和文字保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/inline-alert-rail.tsx",
    target: "components/ui/inline-alert-rail.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.08, nudge: "none", icon: "dot" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.18, nudge: "rim", icon: "alert" } },
      { name: "soft", label: "软", values: { pace: 1.2, intensity: 0.4, nudge: "soft", icon: "alert" } },
    ],
    props: [
      pace("檐口描边收起的速度倍数。"),
      intensity(0.18, "描边对比，默认很低。"),
      {
        name: "nudge",
        type: '"none" | "rim" | "soft"',
        defaultValue: '"rim"',
        description: "只留图标和文字、檐口描边，或描边加一层很淡的底。不会位移。",
        control: { kind: "select", value: "rim", options: ["none", "rim", "soft"], group: "外观" },
      },
      {
        name: "icon",
        type: '"alert" | "dot"',
        defaultValue: '"alert"',
        description: "感叹号，或带斜线的圆点。文字始终在。",
        control: { kind: "select", value: "alert", options: ["alert", "dot"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"empty\" | \"error\" | \"success\" }) => void", description: "空、错误或成功变化时调用。" },
      className,
    ],
  },
  {
    name: "otp-cell-cascade",
    batch: 88,
    title: "OTP Cell Cascade",
    description:
      "原创。验证码按格输入，当前格获得焦点，填入一位后有一颗短珠从这一格走到下一格。满格时亮一次完成框，并对照示例码给出匹配或不匹配。不提交到后端。格子上的装饰不接收指针。这不是 digit-slot-gate 的闸门，也不是 clay-digit-morph、coupon-input 或 credit-card-form。键盘、退格和粘贴都可以用。减弱动效时直接切到下一格，没有珠子插值。离开视口时停掉珠子，已填数字保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/otp-cell-cascade.tsx",
    target: "components/ui/otp-cell-cascade.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.2, cells: 6, style: "underline" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.4, cells: 6, style: "box" } },
      { name: "four", label: "四格", values: { pace: 1.4, intensity: 0.7, cells: 4, style: "box" } },
    ],
    props: [
      pace("格间珠子的速度倍数。"),
      intensity(0.4, "珠子的对比。"),
      {
        name: "cells",
        type: "number",
        defaultValue: "6",
        description: "格子数量，4 或 6。",
        control: { kind: "range", value: 6, min: 4, max: 6, step: 2, group: "交互" },
      },
      {
        name: "style",
        type: '"box" | "underline"',
        defaultValue: '"box"',
        description: "方格，或下划线格。",
        control: { kind: "select", value: "box", options: ["box", "underline"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { filled: number; verdict: \"pending\" | \"match\" | \"miss\" }) => void", description: "已填位数或校验结论变化时调用。" },
      className,
    ],
  },
  {
    name: "meter-rule-ticks",
    batch: 88,
    title: "Meter Rule Ticks",
    description:
      "原创。输入口令时，一条短计量更新，旁边的规则用勾或虚线空框标出是否满足，并写出 Empty、Weak、Fair 或 Strong。强度不靠颜色单独表达。可以显示或隐藏口令。这不是 strength-segment-fill 的分段条，也不是 stress-band-meter、gauge-sentiment-sweep 或 hold-fill-commit。规则是本地假检查，没有新的强度库。减弱动效时计量直接跳到当前档。离开视口时停住插值，当前档位和勾保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/meter-rule-ticks.tsx",
    target: "components/ui/meter-rule-ticks.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.2, style: "bar", rules: 4 } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.4, style: "bar", rules: 4 } },
      { name: "ticks", label: "刻度", values: { pace: 1.3, intensity: 0.7, style: "segments", rules: 3 } },
    ],
    props: [
      pace("短计量跟上规则的速度倍数。"),
      intensity(0.4, "计量的对比。"),
      {
        name: "style",
        type: '"bar" | "segments"',
        defaultValue: '"bar"',
        description: "一条连续短条，或和规则对齐的刻度。",
        control: { kind: "select", value: "bar", options: ["bar", "segments"], group: "外观" },
      },
      {
        name: "rules",
        type: "number",
        defaultValue: "4",
        description: "展示的规则条数，3 或 4。",
        control: { kind: "range", value: 4, min: 3, max: 4, step: 1, group: "交互" },
      },
      { name: "onValueChange", type: "(state: { band: \"empty\" | \"weak\" | \"fair\" | \"strong\"; met: number }) => void", description: "强度档或已满足条数变化时调用。" },
      className,
    ],
  },
  {
    name: "submit-check-flare",
    batch: 88,
    title: "Submit Check Flare",
    description:
      "原创。本地校验通过后，在按钮或字段上画一次勾，或擦亮一颗胶囊，然后落到静帧 Saved。没有声音，也没有循环庆祝。失败时只在字段旁给出图标和文字。装饰层不接收指针。这不是 chime-check-bloom，也不是 feedback-widget、slide-rail-confirm、breath-expand-ring 或 charge-target-ring。成功后 Reset 和字段都可以用键盘到达。减弱动效时直接显示勾和 Saved。离开视口时卸掉闪光，成功静帧保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/submit-check-flare.tsx",
    target: "components/ui/submit-check-flare.tsx",
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.14, style: "check", anchor: "button" } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.32, style: "check", anchor: "button" } },
      { name: "pill", label: "胶囊", values: { pace: 1.3, intensity: 0.55, style: "pill", anchor: "field" } },
    ],
    props: [
      pace("勾或胶囊收起的速度倍数。"),
      intensity(0.32, "闪光对比。"),
      {
        name: "style",
        type: '"check" | "pill"',
        defaultValue: '"check"',
        description: "描一次勾，或擦亮一颗胶囊。",
        control: { kind: "select", value: "check", options: ["check", "pill"], group: "外观" },
      },
      {
        name: "anchor",
        type: '"button" | "field"',
        defaultValue: '"button"',
        description: "闪光落在保存按钮上，或落在字段上。",
        control: { kind: "select", value: "button", options: ["button", "field"], group: "外观" },
      },
      { name: "onValueChange", type: "(state: { phase: \"idle\" | \"error\" | \"done\" }) => void", description: "待提交、错误或成功变化时调用。" },
      className,
    ],
  },
]
