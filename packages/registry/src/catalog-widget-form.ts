import type { ComponentMeta, PropDoc } from "./catalog"

/** Widget，表单。 */
const ui4: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const className: PropDoc = {
  name: "className",
  type: "string",
  description: "额外 Tailwind 类名，与主题变量兼容。",
}
const disabled: PropDoc = {
  name: "disabled",
  type: "boolean",
  description: "禁用交互。",
}
const ui36: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const widgetFormComponents: ComponentMeta[] = [
  {
      name: "peek-rating",
      batch: 12,
      title: "Peek Rating",
      description: "悬停时预览分数，可半星，也可只读。灵感来自 React Bits，原创实现，未打开源码。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "ui/peek-rating.tsx",
      target: "components/ui/peek-rating.tsx",
      props: [
        { name: "value", type: "number", description: "受控分数。" },
        { name: "defaultValue", type: "number", defaultValue: "0", description: "非受控初始分数。" },
        { name: "onValueChange", type: "(value: number) => void", description: "选中回调。" },
        {
          name: "max",
          type: "number",
          defaultValue: "5",
          description: "星星数量。",
          control: { kind: "range", value: 5, min: 3, max: 10, step: 1 },
        },
        {
          name: "allowHalf",
          type: "boolean",
          defaultValue: "false",
          description: "允许半星。",
          control: { kind: "boolean", value: false },
        },
        { name: "readOnly", type: "boolean", description: "只读展示，不写入新值。" },
        {
          name: "color",
          type: "string",
          description: "星星颜色。缺省用 currentColor。",
          control: { kind: "color", value: "#eab308" },
        },
        {
          name: "size",
          type: "number",
          description: "星星边长（像素）。28 与不传相同。",
          control: { kind: "range", value: 28, min: 16, max: 48, step: 2 },
        },
        {
          name: "intensity",
          type: "number",
          description: "空星透明度。0.25 与不传相同。",
          control: { kind: "range", value: 0.25, min: 0, max: 1, step: 0.05 },
        },
        disabled,
        className,
        { name: "ref", type: "React.Ref<HTMLDivElement>", description: "评分根节点的 ref。" },
      ],
      presets: [
        { name: "peek-rating-few", label: "少", values: { max: 3, size: 20, intensity: 0.15 } },
        { name: "peek-rating-default", label: "默认", values: { max: 5, size: 28, intensity: 0.25, allowHalf: false } },
        { name: "peek-rating-half", label: "半星", values: { max: 5, allowHalf: true, size: 36, intensity: 0.25 } },
      ],
    },
  {
      name: "signature-pad",
      batch: 17,
      title: "Signature Pad",
      description: "灵感来自 DocuSign，原创实现。指针速度决定线宽，二次曲线平滑，可撤销、清除、改颜色和粗细，导出 PNG 或 SVG，也可以输入姓名生成签名。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "effects/signature-pad.tsx",
      target: "components/ui/signature-pad.tsx",
      props: [...ui4],
    },
  {
      name: "credit-card-form",
      batch: 19,
      title: "Credit Card Form",
      description: "卡号、有效期和安全码自动分段，按 BIN 识别卡组织，并用 Luhn 校验。聚焦安全码时卡面翻到背面。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "effects/credit-card-form.tsx",
      target: "components/ui/credit-card-form.tsx",
      props: [{ name: "onChange", type: "(value: CreditCardValue) => void", description: "卡面数据变化。" }, ...ui4],
    },
  {
      name: "coupon-input",
      batch: 19,
      title: "Coupon Input",
      description: "应用优惠码。加载、成功芯片和失败抖动由外部 validate 决定。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "effects/coupon-input.tsx",
      target: "components/ui/coupon-input.tsx",
      props: [{ name: "validate", type: "(code: string) => Promise<CouponResult>", description: "核验优惠码。" }, ...ui4],
    },
  {
      name: "magnet-chips",
      batch: 49,
      title: "Magnet Chips",
      description:
        "原创实现。筛选芯片拖进对齐区后，沿动画帧吸到同一行。方向键或回车也能放进去。减弱动效时立刻对齐，不申请动画帧。只用组件自己的指针和动画帧，不使用 matter-js，没有新增依赖。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "effects/magnet-chips.tsx",
      target: "components/ui/magnet-chips.tsx",
      props: [
        { name: "chips", type: "{ id: string; label: string }[]", description: "初始芯片。省略时用内置三枚。" },
        { name: "onSnap", type: "(id: string) => void", description: "芯片对齐到位后调用。" },
        { name: "color", type: "string", defaultValue: "var(--primary)", description: "芯片描边。不传则跟随主题。", control: { kind: "color" } },
        {
          name: "size",
          type: "number",
          defaultValue: "36",
          description: "芯片高度，像素。",
          control: { kind: "range", value: 36, min: 28, max: 56, step: 2 },
        },
        {
          name: "duration",
          type: "number",
          defaultValue: "420",
          description: "吸附到位的毫秒数。",
          control: { kind: "range", value: 420, min: 168, max: 840, step: 10 },
        },
        ...ui36,
      ],
    },
  {
      name: "physics-dropzone",
      batch: 49,
      title: "Physics Dropzone",
      description:
        "原创实现。文件图标拖进落点后，由已安装的 matter-js 落到一堆，并显示进度。方向键或回车也能放进去。减弱动效时不创建物理引擎、不申请动画帧，文件直接出现在堆里并且进度已满。没有新增依赖。",
      layer: "widget",
      purposeGroup: "form",
      source: "original",
      type: "registry:ui",
      file: "effects/physics-dropzone.tsx",
      target: "components/ui/physics-dropzone.tsx",
      props: [
        { name: "files", type: "{ id: string; name: string }[]", description: "初始文件。省略时用内置三个。" },
        { name: "onDrop", type: "(id: string) => void", description: "文件落入并完成进度后调用。减弱动效时立刻调用。" },
        { name: "color", type: "string", defaultValue: "var(--primary)", description: "文件描边和进度。不传则跟随主题。", control: { kind: "color" } },
        {
          name: "size",
          type: "number",
          defaultValue: "280",
          description: "落点宽度，像素。",
          control: { kind: "range", value: 280, min: 200, max: 420, step: 4 },
        },
        {
          name: "duration",
          type: "number",
          defaultValue: "560",
          description: "进度走满的毫秒数。",
          control: { kind: "range", value: 560, min: 224, max: 1120, step: 20 },
        },
        ...ui36,
      ],
    }
]

