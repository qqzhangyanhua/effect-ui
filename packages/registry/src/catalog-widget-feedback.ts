import type { ComponentMeta, PropDoc } from "./catalog"

/** Widget，反馈。 */
const ui5: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui22: PropDoc[] = [
  { name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" },
]

export const widgetFeedbackComponents: ComponentMeta[] = [
  {
      name: "password-strength",
      batch: 5,
      title: "Password Strength",
      description: "密码强度条（长度、大小写、数字、符号）。",
      layer: "widget",
      purposeGroup: "feedback",
      source: "original",
      type: "registry:ui",
      file: "ui/password-strength.tsx",
      target: "components/ui/password-strength.tsx",
      props: [
        { name: "value", type: "string", description: "受控密码。" },
        { name: "onValueChange", type: "(value: string) => void", description: "变化回调。" },
        ...ui5,
      ],
    },
  {
      name: "cookie-consent",
      batch: 14,
      title: "Cookie Consent",
      description: "灵感来自 Stripe，原创实现。浮动卡片可展开类别开关，选择写入 localStorage。",
      layer: "widget",
      purposeGroup: "feedback",
      source: "original",
      type: "registry:ui",
      file: "effects/cookie-consent.tsx",
      target: "components/ui/cookie-consent.tsx",
      props: [
        { name: "storageKey", type: "string", defaultValue: '"effect-ui-cookie-consent"', description: "localStorage 键。" },
        { name: "onChange", type: "(value: CookieConsentValue) => void", description: "保存时回调。" },
        ...ui5,
      ],
    },
  {
      name: "reaction-bar",
      batch: 17,
      title: "Reaction Bar",
      description: "表情反应条。计数用数字滚动，选中时轻轻弹一下。",
      layer: "widget",
      purposeGroup: "feedback",
      source: "original",
      type: "registry:ui",
      file: "effects/reaction-bar.tsx",
      target: "components/ui/reaction-bar.tsx",
      props: [
        { name: "items", type: "ReactionItem[]", description: "表情、计数和是否已选。" },
        { name: "onToggle", type: "(emoji: string) => void", description: "切换某个表情。" },
        {
          name: "duration",
          type: "number",
          description: "选中弹动时长（毫秒）。280 与不传相同。",
          control: { kind: "range", value: 280, min: 120, max: 560, step: 10 },
        },
        {
          name: "scale",
          type: "number",
          description: "选中放大倍率。1 与不传相同。",
          control: { kind: "range", value: 1, min: 0.5, max: 2, step: 0.1 },
        },
        {
          name: "gap",
          type: "number",
          description: "按钮间距（像素）。8 与不传相同。",
          control: { kind: "range", value: 8, min: 0, max: 16, step: 1 },
        },
        { name: "color", type: "string", description: "选中颜色。不传则跟随主题。", control: { kind: "color" } },
        ...ui5,
      ],
      presets: [
        { name: "reaction-bar-fast", label: "快", values: { duration: 160, scale: 0.6, gap: 8 } },
        { name: "reaction-bar-default", label: "默认", values: { duration: 280, scale: 1, gap: 8 } },
        { name: "reaction-bar-large", label: "大", values: { duration: 420, scale: 1.6, gap: 12 } },
      ],
    },
  {
      name: "feedback-widget",
      batch: 22,
      title: "Feedback Widget",
      description: "右下角 Feedback 按钮打开面板。四个表情选中时弹一下，可填写文字并切换是否附上截图。提交后显示 Thanks ✓ 并自动关闭，调用 onSubmit({ rating, message })。点外面或按 Esc 关闭。灵感来自常见 SaaS 反馈组件，原创实现。减弱动效时不弹跳。",
      layer: "widget",
      purposeGroup: "feedback",
      source: "original",
      type: "registry:ui",
      file: "effects/feedback-widget.tsx",
      target: "components/ui/feedback-widget.tsx",
      props: [
        { name: "onSubmit", type: "(value: { rating: number; message: string }) => void", description: "提交评分和留言。" },
        { name: "placeholder", type: "string", defaultValue: "What should we change?", description: "留言框占位。" },
        ...ui22,
      ],
    }
]

