import type { ComponentMeta, PropDoc } from "./catalog"

/** 第 81 批调研，catalog batch 87。六个原创声敏微反馈，灵感来自 Mobbin，没有移植头。 */
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}

function toneFiles(slug: string): NonNullable<ComponentMeta["files"]> {
  return [
    { file: `effects/${slug}.tsx`, type: "registry:ui", target: `components/ui/${slug}.tsx` },
    {
      file: "effects/tone/feedback-tone.tsx",
      type: "registry:file",
      target: "components/ui/tone/feedback-tone.tsx",
    },
  ]
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

const muted: PropDoc = {
  name: "muted",
  type: "boolean",
  defaultValue: "true",
  description: "为真时不播放短音。演示起始为静音，需要用户打开声音。",
  control: { kind: "boolean", value: true, group: "交互" },
}

export const batch87ShowcaseComponents: ComponentMeta[] = [
  {
    name: "tick-pip-confirm",
    batch: 87,
    title: "Tick Pip Confirm",
    description:
      "原创。在按钮上按下或用键盘激活时，播放一声极短 tick，并在按压点闪一颗很小的 pip，确认已经按下。演示默认静音，需要打开声音才听得到短促界面音。Pip 不接收指针。这不是 press-snap-beacon 的径向信标，也不是 click-spark、press-squash-tile 或 gooey-button。没有循环蜂鸣，也没有粒子火花。减弱动效时 pip 停在静帧并立刻停音。离开视口时卸掉 pip 并停音。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/tick-pip-confirm.tsx",
    target: "components/ui/tick-pip-confirm.tsx",
    files: toneFiles("tick-pip-confirm"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, pitch: 640, style: "dot", muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.28, pitch: 880, style: "pip", muted: true } },
      { name: "high", label: "高", values: { pace: 1.4, intensity: 0.6, pitch: 1200, style: "dot", muted: true } },
    ],
    props: [
      pace("短音和 pip 收起的速度倍数。"),
      intensity(0.28, "音量上限和 pip 对比，默认偏低。"),
      {
        name: "pitch",
        type: "number",
        defaultValue: "880",
        description: "tick 音高，赫兹。",
        control: { kind: "range", value: 880, min: 320, max: 1600, step: 20, group: "交互" },
      },
      {
        name: "style",
        type: '"pip" | "dot"',
        defaultValue: '"pip"',
        description: "稍大一点的圆点，或更小的点。",
        control: { kind: "select", value: "pip", options: ["pip", "dot"], group: "外观" },
      },
      muted,
      { name: "onValueChange", type: "(state: { pressed: string; pip: boolean; muted: boolean }) => void", description: "按下项、pip 或静音变化时调用。" },
      className,
    ],
  },
  {
    name: "chime-check-bloom",
    batch: 87,
    title: "Chime Check Bloom",
    description:
      "原创。确认成功时播放一声短促上升 chime，勾选标记做一次软 bloom，然后落成静帧勾。演示默认静音，需要打开声音才听得到。Bloom 不接收指针，成功卡可以重置。这不是 feedback-widget，也不是 breath-expand-ring、charge-target-ring 或 quiet-nudge-pill。没有循环庆祝，也没有全屏粒子。减弱动效时直接显示静帧勾并停音。离开视口时停音并卸掉 bloom。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/chime-check-bloom.tsx",
    target: "components/ui/chime-check-bloom.tsx",
    files: toneFiles("chime-check-bloom"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, style: "check", chime: "soft", muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.3, style: "check", chime: "soft", muted: true } },
      { name: "ring", label: "环", values: { pace: 1.3, intensity: 0.55, style: "ring", chime: "bright", muted: true } },
    ],
    props: [
      pace("chime 和 bloom 收起的速度倍数。"),
      intensity(0.3, "bloom 对比和音量上限。"),
      {
        name: "style",
        type: '"check" | "ring"',
        defaultValue: '"check"',
        description: "勾旁的软色块，或一圈细环。",
        control: { kind: "select", value: "check", options: ["check", "ring"], group: "外观" },
      },
      {
        name: "chime",
        type: '"soft" | "bright"',
        defaultValue: '"soft"',
        description: "柔和双音，或更亮的双音。",
        control: { kind: "select", value: "soft", options: ["soft", "bright"], group: "交互" },
      },
      muted,
      { name: "onValueChange", type: "(state: { phase: \"idle\" | \"done\"; muted: boolean }) => void", description: "成功阶段或静音变化时调用。" },
      className,
    ],
  },
  {
    name: "buzz-rim-flash",
    batch: 87,
    title: "Buzz Rim Flash",
    description:
      "原创。校验失败时播放一声低频短 buzz，并在字段檐口做一次克制的红闪或最多 2 像素的轻移，不是整页摇晃。演示默认静音。檐口层不接收指针，字段仍可编辑。这不是 quiet-nudge-pill，也不是 feedback-widget 或 press-snap-beacon。没有持续蜂鸣，也没有声纹粒子。减弱动效时只留错误文案和静帧红边，并停音。离开视口时停音并卸掉闪层，错误文案保留。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/buzz-rim-flash.tsx",
    target: "components/ui/buzz-rim-flash.tsx",
    files: toneFiles("buzz-rim-flash"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.08, nudge: "none", tone: "low", muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.16, nudge: "rim", tone: "low", muted: true } },
      { name: "soft", label: "轻移", values: { pace: 1.2, intensity: 0.4, nudge: "soft", tone: "mid", muted: true } },
    ],
    props: [
      pace("buzz 和檐口闪动收起的速度倍数。"),
      intensity(0.16, "闪对比和音量上限，默认很低。"),
      {
        name: "nudge",
        type: '"none" | "rim" | "soft"',
        defaultValue: '"rim"',
        description: "只留文案、檐口红闪，或红闪加一次 2 像素轻移。",
        control: { kind: "select", value: "rim", options: ["none", "rim", "soft"], group: "外观" },
      },
      {
        name: "tone",
        type: '"low" | "mid"',
        defaultValue: '"low"',
        description: "更低或略高的短 buzz。",
        control: { kind: "select", value: "low", options: ["low", "mid"], group: "交互" },
      },
      muted,
      { name: "onValueChange", type: "(state: { error: boolean; muted: boolean }) => void", description: "错误态或静音变化时调用。" },
      className,
    ],
  },
  {
    name: "latch-gate-click",
    batch: 87,
    title: "Latch Gate Click",
    description:
      "原创。拨动开关时播放一声很短的 latch，拇指或闸门线性到位，并闪一下合闸标记。演示默认静音。合闸标记不接收指针。这不是 latch-thumb-spring 的弹簧拇指，也不是 year-snap-rail 或 gooey-button。悬停不发声。减弱动效时瞬时切态并停音。离开视口时停音，开关保持当前态。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/latch-gate-click.tsx",
    target: "components/ui/latch-gate-click.tsx",
    files: toneFiles("latch-gate-click"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, style: "thumb", onPitch: 480, offPitch: 300, muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.26, style: "thumb", onPitch: 520, offPitch: 340, muted: true } },
      { name: "gate", label: "闸", values: { pace: 1.3, intensity: 0.5, style: "gate", onPitch: 680, offPitch: 240, muted: true } },
    ],
    props: [
      pace("到位动画的速度倍数。"),
      intensity(0.26, "合闸标记对比和音量上限。"),
      {
        name: "style",
        type: '"thumb" | "gate"',
        defaultValue: '"thumb"',
        description: "横向拇指，或竖向闸门。",
        control: { kind: "select", value: "thumb", options: ["thumb", "gate"], group: "外观" },
      },
      {
        name: "onPitch",
        type: "number",
        defaultValue: "520",
        description: "打开时的 latch 音高，赫兹。",
        control: { kind: "range", value: 520, min: 200, max: 900, step: 10, group: "交互" },
      },
      {
        name: "offPitch",
        type: "number",
        defaultValue: "340",
        description: "关闭时的 latch 音高，赫兹。",
        control: { kind: "range", value: 340, min: 120, max: 700, step: 10, group: "交互" },
      },
      muted,
      { name: "onValueChange", type: "(state: { id: string; on: boolean; muted: boolean }) => void", description: "最近一次开关或静音变化时调用。" },
      className,
    ],
  },
  {
    name: "whoosh-dart-send",
    batch: 87,
    title: "Whoosh Dart Send",
    description:
      "原创。发送时播放一声短 whoosh，并沿发送方向射出至多两个很短的 dart，播完即卸。演示默认静音。Dart 不接收指针，下方 Probe 始终可点。这不是 nib-crumb-fade，也不是 brim-flick-ink、gravity-image-trail 或 cursor-trail。没有粒子雨，也没有常驻拖尾。减弱动效时跳过 dart 并停音。离开视口时打断 whoosh 并卸掉 dart。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/whoosh-dart-send.tsx",
    target: "components/ui/whoosh-dart-send.tsx",
    files: toneFiles("whoosh-dart-send"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, style: "fleck", direction: "end", muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.24, style: "dart", direction: "end", muted: true } },
      { name: "up", label: "上", values: { pace: 1.3, intensity: 0.5, style: "fleck", direction: "up", muted: true } },
    ],
    props: [
      pace("whoosh 和 dart 收起的速度倍数。"),
      intensity(0.24, "音量上限和 dart 对比。"),
      {
        name: "style",
        type: '"dart" | "fleck"',
        defaultValue: '"dart"',
        description: "一道短划，或至多两个小点。",
        control: { kind: "select", value: "dart", options: ["dart", "fleck"], group: "外观" },
      },
      {
        name: "direction",
        type: '"end" | "up"',
        defaultValue: '"end"',
        description: "沿行尾射出，或向上射出。",
        vocabularyExemption: "发送方向用行尾 end 或向上 up，不是词汇表里的 left、right、down。",
        control: { kind: "select", value: "end", options: ["end", "up"], group: "动画" },
      },
      muted,
      { name: "onValueChange", type: "(state: { sent: number; dart: boolean; muted: boolean }) => void", description: "发送次数、dart 或静音变化时调用。" },
      className,
    ],
  },
  {
    name: "mute-cone-morph",
    batch: 87,
    title: "Mute Cone Morph",
    description:
      "原创。扬声器锥体在静音和开音之间切换斜杠，旁边用固定档位的体积 pip 表示音量，不是实时频谱。演示默认静音。打开声音后，Test 才播放一声短音。Pip 不接收指针。这不是 audio-spectrum，也不是 glyph-block-swap 或 quiet-nudge-pill。不使用麦克风。减弱动效时锥体瞬时切态并停音。离开视口时停音，静音状态保持。",
    layer: "effect",
    effectCategory: "showcase",
    source: "original",
    type: "registry:ui",
    file: "effects/mute-cone-morph.tsx",
    target: "components/ui/mute-cone-morph.tsx",
    files: toneFiles("mute-cone-morph"),
    presets: [
      { name: "quiet", label: "静", values: { pace: 0.7, intensity: 0.12, volume: 0, style: "cone", muted: true } },
      { name: "default", label: "默认", values: { pace: 1, intensity: 0.3, volume: 0.45, style: "cone", muted: true } },
      { name: "bars", label: "档", values: { pace: 1.3, intensity: 0.55, volume: 0.8, style: "bars-pip", muted: true } },
    ],
    props: [
      pace("锥体斜杠切换的速度倍数。音长也跟着缩短。"),
      intensity(0.3, "体积 pip 对比和音量上限。"),
      {
        name: "volume",
        type: "number",
        defaultValue: "0.45",
        description: "输出音量。为 0 时即使取消静音也不发声。演示仍默认静音。",
        control: { kind: "range", value: 0.45, min: 0, max: 1, step: 0.05, group: "交互" },
      },
      {
        name: "style",
        type: '"cone" | "bars-pip"',
        defaultValue: '"cone"',
        description: "锥体为主，或更明显的固定音量档。",
        control: { kind: "select", value: "cone", options: ["cone", "bars-pip"], group: "外观" },
      },
      muted,
      { name: "onValueChange", type: "(state: { muted: boolean; volume: number; testing: boolean }) => void", description: "静音、音量或试音状态变化时调用。" },
      className,
    ],
  },
]
