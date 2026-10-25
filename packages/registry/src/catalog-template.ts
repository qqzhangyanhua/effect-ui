import type { ComponentMeta, PropDoc } from "./catalog"
import { meraki, merakiFile } from "./catalog-sources"

/** Template。 */
function templateFiles(dir: string, route: string) {
  return [
    { file: `templates/${dir}/page.tsx`, type: "registry:page", target: `app/${route}/page.tsx` },
    { file: `templates/${dir}/content.ts`, type: "registry:file", target: `app/${route}/content.ts` },
    { file: `templates/${dir}/theme.ts`, type: "registry:file", target: `app/${route}/theme.ts` },
  ] as const
}
const ui9: PropDoc[] = [
  {
    name: "className",
    type: "string",
    description: "额外 Tailwind 类名，与主题变量兼容。",
  },
]
const ui40: PropDoc[] = [{ name: "className", type: "string", description: "额外 Tailwind 类名，与主题变量兼容。" }]

export const templateComponents: ComponentMeta[] = [
  {
    name: "agency-template",
    batch: 9,
    title: "Agency Template",
    description: "灵感来自 Awwwards，原创组合。视差墙、滚动字、圆形画廊、图片轨迹和可点击字标。重 WebGL 懒加载。",
    layer: "template",
    source: "original",
    type: "registry:block",
    file: "templates/agency/page.tsx",
    target: "app/agency/page.tsx",
    files: [...templateFiles("agency", "agency")],
    props: ui9,
  },
  {
    name: "status-page",
    batch: 20,
    title: "Status Page",
    description: "灵感来自 Eventbrite 与 Linear 状态页，原创实现。总体横幅、可用率条、响应时间折线和事件时间线。",
    layer: "template",
    source: "original",
    type: "registry:ui",
    file: "templates/status-page.tsx",
    target: "components/ui/status-page.tsx",
    props: [
      { name: "services", type: "UptimeService[]", description: "各服务的 90 天记录。" },
      { name: "samples", type: "number[]", description: "响应时间采样，会归一化后交给 graphLinePath。" },
      { name: "incidents", type: "StatusIncident[]", description: "近期公告和事件。" },
      ...ui9,
    ],
  },
  {
    name: "signup-split-page",
    batch: 40,
    title: "Signup Split Page",
    description: `${meraki} ${merakiFile("sign-in-and-registration/SignUpPageWithSideImage.html")} 侧图加表单，客户和合作者切换，原生校验。image、onSubmit、status 可配。示例文案和图片放在 demo。减弱动效时按钮不再做颜色过渡。`,
    layer: "template",
    source: "Meraki UI",
    type: "registry:ui",
    file: "effects/signup-split-page.tsx",
    target: "components/ui/signup-split-page.tsx",
    props: [
      { name: "imageUrl", type: "string", description: "左侧配图。" },
      { name: "imageAlt", type: "string", description: "配图替代文字。" },
      { name: "title", type: "string", defaultValue: '"创建账号"', description: "标题。" },
      { name: "description", type: "string", description: "说明。" },
      { name: "onSubmit", type: "(values: SignupValues) => void", description: "校验通过后提交，不发请求。" },
      { name: "status", type: '"idle" | "submitting" | "success" | "error"', defaultValue: '"idle"', description: "提交状态。" },
      { name: "statusMessage", type: "string", description: "状态说明，aria-live。" },
      ...ui40,
    ],
  },
]

