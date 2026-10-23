import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  componentIsTested,
  exemptionClosedNames,
  insufficientControls,
  missingReducedMotion,
  requiresComponentTest,
  sourceFilesFor,
  testedSourceFiles,
  type AuditGap,
} from "../packages/registry/src/audit-coverage.ts"
import { components, type ComponentMeta } from "../packages/registry/src/catalog.ts"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const registrySrc = path.join(root, "packages/registry/src")
const outFile = path.join(registrySrc, "audit-exemptions.ts")

function listFiles(dir: string, prefix = ""): string[] {
  const files: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...listFiles(path.join(dir, entry.name), rel))
    else files.push(rel)
  }
  return files
}

function readEntrySource(entry: ComponentMeta): string | undefined {
  const parts: string[] = []
  for (const file of sourceFilesFor(entry)) {
    const full = path.join(registrySrc, file)
    if (!fs.existsSync(full)) continue
    parts.push(fs.readFileSync(full, "utf8"))
  }
  return parts.length === 0 ? undefined : parts.join("\n")
}

function gapsFor(entry: ComponentMeta, tested: ReadonlySet<string>): AuditGap[] {
  const gaps: AuditGap[] = []
  if (insufficientControls(entry.category, entry.props)) gaps.push("控件不足")
  const source = readEntrySource(entry)
  if (source !== undefined && missingReducedMotion(entry.category, source)) gaps.push("缺减弱动效")
  if (requiresComponentTest(entry.category) && !componentIsTested(entry, tested)) gaps.push("缺测试")
  return gaps
}

const tests = listFiles(registrySrc)
  .filter((file) => /\.test\.tsx?$/.test(file))
  .map((file) => ({ file, text: fs.readFileSync(path.join(registrySrc, file), "utf8") }))
const tested = testedSourceFiles(tests)
const closed = exemptionClosedNames()
const blocked = components.flatMap((entry) => {
  if (!closed.has(entry.name)) return []
  const gaps = gapsFor(entry, tested)
  return gaps.length > 0 ? [`${entry.name}：${gaps.join("、")}`] : []
})
if (blocked.length > 0) {
  console.error(["Batch 34 及以后不能进豁免名单，这些组件还没达标：", ...blocked].join("\n"))
  process.exit(1)
}

const rows = components
  .flatMap((entry) => {
    if (closed.has(entry.name)) return []
    const gaps = gapsFor(entry, tested)
    return gaps.length > 0 ? [{ name: entry.name, gaps }] : []
  })
  .sort((left, right) => left.name.localeCompare(right.name))

/** 控件不足但已发布 prop 不够 3 个。重新生成时保留这条说明。 */
const statedControlReasons: Readonly<Record<string, string>> = {
  singularity: "只有 className，没有已发布的可调 prop。",
  "rain-puddle": "只有 className，没有已发布的可调 prop。",
  "distorted-glass": "只有 children，没有已发布的数值或颜色 prop。",
  "merging-bubbles": "已发布的可调项只有数量和颜色两组，不够 3 个 Control。",
  "svg-bands": "已发布的可调项只有颜色一组，不够 3 个 Control。",
  "hover-blocks-grid": "已发布的可调项是两色和一组坐标，坐标不适合做成单个控件。",
  "rubber-band-drag": "只有 className，没有已发布的可调 prop。",
  "cool-mode": "已发布的可调项只有粒子字符，不够 3 个 Control。",
  "morphing-popover": "已发布的可调项只有打开和默认打开两个布尔值，不够 3 个 Control。",
  "transition-panel": "已发布的可调项只有当前下标和方向，不够 3 个 Control。",
  "animated-background": "value 一传入就变成受控，文档预览里的点击会失效，剩下的 defaultValue 和 enableHover 不够 3 个 Control。",
  disclosure: "已发布的可调项只有展开和默认展开两个布尔值，不够 3 个 Control。",
  "floating-panel": "已发布的可调项只有标题，按钮、正文和底部都是节点。",
  "feature-voting": "已发布的可调项是条目数组和票数记录，不适合做成单个控件。",
  "ai-tool-approval": "已发布的可调项只有工具调用列表，不适合做成单个控件。",
  "wheel-picker": "已发布的可调项只有无障碍名称，列和选中值是复合数据。",
  "synced-transcript": "已发布的可调项只有标题和时长，句子列表不适合做成单个控件。",
  "liquid-slider": "已发布的可调项只有单位，formatValue 是函数。",
  "avatar-picker": "已发布的可调项只有说明和提交文案，不够 3 个 Control。",
  "timezone-planner": "已发布的可调项只有开始分钟和时长，人物列表不适合做成单个控件。",
  "clip-trimmer": "已发布的可调项只有时长和最短选区，选区是对象。",
  "duration-picker": "已发布的可调项只有 scrub，单位是数组。",
  "exposure-slider": "已发布的可调项只有强调色和是否显示指示。",
  scrubber: "已发布的可调项只有小数位和刻度数量。",
  "social-selector": "已发布的可调项只有账号，平台列表不适合做成单个控件。",
  "progress-with-value": "已发布的可调项只有标签位置，自定义标签是函数。",
  announcement: "已发布的可调项只有主题色和 Badge 变体，不够 3 个 Control。",
  pill: "已发布的可调项只有主题边框和 Badge 变体，不够 3 个 Control。",
  "emoji-confetti": "已发布的可调项只有 emoji 列表，按钮文字是节点。",
  status: "已发布的可调项只有服务状态。",
  "plus-share-burst": "已发布的可调项只有无障碍名称，操作列表不适合做成单个控件。",
  "pin-toggle": "已发布的可调项只有初始按下和颜色，按下状态一传入就变成受控。",
  "star-favorite-toggle": "已发布的可调项只有初始收藏和颜色，收藏状态一传入就变成受控。",
  "bookmark-burst-toggle": "已发布的可调项只有颜色，勾选一传入就变成受控。",
  "icon-swap": "已发布的可调项只有旋转或翻转，开、关和中间态是节点，按下状态一传入就变成受控。",
  "theme-switch-transitions": "主题一传入就受控，预览同时展示四种变体，剩下的图标模式不够 3 个 Control。",
  "perspective-card": "已发布的可调项只有横向倾斜和浮起距离，内容是节点。",
  "expandable-card": "已发布的可调项只有标题，收起摘要是节点。",
  "morphing-dialog": "已发布的可调项只有弹簧时长和回弹。",
  "liquid-glass": "已发布的可调项只有叠色倍率和模糊，正文是节点。",
  "3d-carousel": "已发布的可调项只有切换时长和环半径，卡片列表是结构。",
  "circular-gallery": "已发布的可调项只有自转倍率，图片列表是结构。",
  "box-carousel": "已发布的可调项只有弹簧倍率和边长，四面内容是结构。",
  "apple-activity-card": "已发布的可调项只有边长和填充时长，圆环列表是结构。",
  "project-update-card": "已发布组件没有可调 prop。",
  "lenticular-card": "已发布的可调项只有画面列表。",
  "card-beam-scanner": "已发布的可调项只有标题。",
  "interactive-image-selector": "已发布的可调项只有一开始就多选，图片列表是结构，已选 id 一传入就受控。",
  "hover-spring-features": "已发布的可调项只有卡片列表。",
  "neon-hold-card": "已发布的可调项只有渐变三色，正文是节点。",
  "blur-unveil-card": "已发布的可调项只有数字和说明。色块预览写死成 #fca5a5，不传时仍跟主题，不能做成带色值的 Control。",
  "glow-wander-card": "已发布的可调项只有发光色和绕圈秒数。",
  "stat-trend-cards": "已发布的可调项只有指标列表。",
  "uno-card": "已发布的可调项只有四色和牌面宽度，中央内容是节点。",
  "transaction-card": "已发布的可调项只有说明和金额，点击回调不是控件。",
  "pendulum-social-card": "已发布的可调项是头像、标题和链接列表。",
  "word-wheel-card": "已发布的可调项是标题和两组词。",
  "shift-card": "已发布的四段内容都是节点。",
  "shimmer-button": "已发布的可调项只有光泽颜色和扫光时长。",
  "pulse-button": "已发布的可调项只有脉冲时长和光环不透明度。",
  "neon-button": "已发布的可调项只有霓虹颜色和辉光倍率。",
  "interactive-hover-button": "已发布的可调项只有滑出时长和距离倍率。",
  "gooey-button": "已发布的可调项只有模糊倍率和粘连强度。",
  "hold-button": "已发布的可调项只有按住毫秒，完成回调不是控件。",
  "tear-button": "已发布的可调项只有撕开时长和复位等待。",
  "animated-subscribe-button": "已发布的可调项只有订阅状态，一传入就受控。",
  "copy-button": "已发布的可调项只有要复制的文字。",
  "pull-cord": "已发布的可调项只有初始开关和无障碍名称，受控开关一传入就冻住。",
  "attract-button": "已发布的可调项只有铁屑密度和外扩距离。",
  "star-wars-button": "已发布的可调项只有星星数量和飞出倍率，按钮文字是节点。",
  "hover-attention-button": "已发布的可调项只有注意力动画，按钮文字是节点。",
  "stitches-button": "已发布组件没有可调 prop。",
  "heartbeat-button": "已发布的可调项只有颜色，按钮文字是节点。",
  "neubrutalism-button": "已发布的可调项只有上层色块，按钮文字是节点。",
  "3d-button": "已发布的可调项只有底色，按钮文字是节点。",
  "heart-like-button": "已发布的可调项只有计数。喜欢状态一传入就受控，预览里的计数还会跟着变。",
  "retro-press-button": "底色和阴影预览写死成色值，不传时仍跟主题，按钮文字是节点。",
  "liquid-gradient-button": "已发布的可调项只有旋转秒数和链接。色板预览写死，不传时仍跟主题，不能做成带色值的 Control。",
  "glitch-slice-button": "已发布的可调项只有切片文字。三色预览写死，不传时仍跟主题，可见文字是节点。",
  "send-arrow-button": "已发布的可调项只有渐变色。预览写死成色值，不传时仍跟主题，按钮文字是节点。",
  "trash-delete-button": "已发布的可调项只有提示。悬停色预览写死成 rgb(168, 7, 7)，不传时仍跟主题。",
  "flower-burst-button": "已发布的可调项只有按钮文字和花瓣色。",
  "scroll-cue-button": "已发布的可调项只有目标和文案。自动播放预览写死为 true，组件默认是 false。",
  "flicker-reflect-button": "已发布的可调项只有光晕和是否闪烁，按钮文字是节点。",
  "printer-icon-button": "已发布的可调项只有读屏名称。机身色预览写死成 #00104b，不传时仍跟主题。",
  "tilt-sweep-button": "已发布的可调项只有扫光底色和径向色，按钮文字是节点。",
  "fly-around-button": "已发布的可调项是图标、文字和点击回调。",
  "cosmic-button": "已发布的可调项只有渲染成链接还是按钮，以及地址，正文是节点。",
  "split-button": "已发布的可调项只有按钮文案和变体。动作列表是结构，点击回调会改预览里的说明。",
}

function exemptionReason(name: string, gaps: readonly string[]): string {
  if (gaps.length === 1 && gaps[0] === "控件不足") {
    const stated = statedControlReasons[name]
    if (stated) return stated
  }
  return "落地前已有缺口"
}

const body = rows
  .map((row) => `  { name: "${row.name}", gaps: ${JSON.stringify(row.gaps)}, reason: ${JSON.stringify(exemptionReason(row.name, row.gaps))} },`)
  .join("\n")

const source = `import type { AuditExemption } from "./audit-coverage"

/** 由 scripts/generate-audit-exemptions.ts 生成。手改后要重新跑脚本核对。 */
export const auditExemptions: readonly AuditExemption[] = [
${body}
]
`

fs.writeFileSync(outFile, source)
console.log(`Wrote ${rows.length} audit exemptions`)
