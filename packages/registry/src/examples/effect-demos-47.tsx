"use client"

import { useState } from "react"
import { Bold, Copy, Italic, Share } from "lucide-react"

import { BrushChart } from "../effects/brush-chart"
import { ExpandableText } from "../effects/expandable-text"
import { FloatingButtonGroup } from "../effects/floating-button-group"
import { InlineEdit } from "../effects/inline-edit"
import { MorphSelect } from "../effects/morph-select"
import { PasswordField } from "../effects/password-field"
import { Ridgeline } from "../effects/ridgeline"
import { ShortcutRecorder } from "../effects/shortcut-recorder"
import { SlopeChart } from "../effects/slope-chart"
import { SplitButton } from "../effects/split-button"
import { Streamgraph } from "../effects/streamgraph"
import { ThemeSwitch } from "../effects/theme-switch-transitions"
import { Treemap } from "../effects/treemap"
import { UserMenu } from "../effects/user-menu"
import { WaffleChart } from "../effects/waffle-chart"

const days = Array.from({ length: 8 }, (_, index) => {
  const key = `d${index + 1}`
  return {
    key,
    label: `第 ${index + 1} 天`,
    axisLabel: `${index + 1}`,
    values: { mail: 8 + index * 2, chat: 14 - index, phone: 4 + (index % 3) * 3 },
  }
})

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#5b4bff"/><circle cx="32" cy="26" r="10" fill="#fff"/><rect x="16" y="40" width="32" height="16" rx="8" fill="#fff"/></svg>',
)}`

export function ThemeSwitchTransitionsDemo() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["reveal", "eclipse", "split", "rise"] as const).map((variant) => (
        <ThemeSwitch
          key={variant}
          iconOnly
          label={`切换为${theme === "light" ? "暗色" : "亮色"}，${variant}`}
          theme={theme}
          variant={variant}
          onThemeChange={(next) => setTheme(next)}
        />
      ))}
    </div>
  )
}

export function FloatingButtonGroupDemo({
  label = "编辑",
  orientation = "horizontal",
  variant = "muted",
}: {
  label?: string
  orientation?: "horizontal" | "vertical"
  variant?: "muted" | "floating"
} = {}) {
  const [copied, setCopied] = useState(false)
  return (
    <FloatingButtonGroup
      label={label}
      orientation={orientation}
      variant={variant}
      items={[
        { id: "bold", label: "加粗", icon: <Bold aria-hidden /> },
        { id: "italic", label: "斜体", icon: <Italic aria-hidden /> },
        { type: "separator", id: "sep" },
        {
          id: "share",
          label: copied ? "已复制" : "分享",
          icon: copied ? <Copy aria-hidden /> : <Share aria-hidden />,
          reserveLabels: ["分享", "已复制"],
          shortcut: "⌘⇧S",
          onSelect: () => setCopied(true),
        },
      ]}
    />
  )
}

export function MorphSelectDemo({
  label = "城市",
  panelWidth = 272,
  placeholder = "Select",
}: {
  label?: string
  panelWidth?: number
  placeholder?: string
} = {}) {
  const [value, setValue] = useState<string | null>("song")
  return (
    <MorphSelect
      items={[
        { label: "华东", options: [{ value: "song", label: "上海", meta: "沪" }, { value: "hang", label: "杭州", meta: "杭" }] },
        { value: "guang", label: "广州", meta: "穗" },
      ]}
      label={label}
      panelWidth={panelWidth}
      placeholder={placeholder}
      value={value}
      onValueChange={(next) => setValue(next)}
    />
  )
}

export function StreamgraphDemo() {
  return (
    <Streamgraph
      className="w-full max-w-3xl"
      label="工单来源"
      unit="件"
      height={180}
      data={days}
      series={[
        { key: "mail", label: "邮件" },
        { key: "chat", label: "会话" },
        { key: "phone", label: "电话" },
      ]}
    />
  )
}

export function WaffleChartDemo() {
  return (
    <WaffleChart
      className="w-full max-w-3xl"
      label="发电构成"
      unit="太瓦时"
      rows={5}
      columns={10}
      data={[
        { key: "water", label: "水电", value: 42 },
        { key: "wind", label: "风电", value: 28 },
        { key: "sun", label: "光伏", value: 18 },
      ]}
    />
  )
}

export function TreemapDemo() {
  return (
    <Treemap
      className="w-full max-w-3xl"
      label="营收"
      height={240}
      data={{
        id: "all",
        label: "全部",
        children: [
          {
            id: "east",
            label: "华东",
            children: [
              { id: "sh", label: "上海", value: 42 },
              { id: "hz", label: "杭州", value: 26 },
            ],
          },
          { id: "south", label: "华南", value: 31 },
        ],
      }}
    />
  )
}

export function SlopeChartDemo() {
  return (
    <SlopeChart
      className="w-full max-w-3xl"
      label="转化率"
      startLabel="一季度"
      endLabel="二季度"
      height={200}
      data={[
        { key: "search", label: "搜索", start: 2.1, end: 3.4 },
        { key: "mail", label: "邮件", start: 4.2, end: 3.1 },
        { key: "ads", label: "广告", start: 1.4, end: 2.2 },
      ]}
    />
  )
}

export function RidgelineDemo() {
  return (
    <Ridgeline
      className="w-full max-w-3xl"
      label="每日气温"
      unit="°C"
      rowHeight={36}
      series={[
        { id: "jan", label: "一月", values: [2, 3, 1, 4, 6, 5, 3, 2] },
        { id: "apr", label: "四月", values: [12, 14, 13, 16, 15, 18, 17, 14] },
        { id: "jul", label: "七月", values: [26, 28, 27, 30, 29, 31, 28, 27] },
      ]}
    />
  )
}

export function SplitButtonDemo() {
  const [note, setNote] = useState("尚未发送")
  return (
    <div className="flex flex-col items-start gap-3">
      <SplitButton
        label="发送"
        onClick={() => setNote("已发送")}
        actions={[
          { label: "定时发送", onSelect: () => setNote("已排期") },
          { label: "丢弃草稿", destructive: true, onSelect: () => setNote("已丢弃") },
        ]}
      />
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

export function ShortcutRecorderDemo() {
  const [shortcut, setShortcut] = useState<string | null>("mod+k")
  return (
    <ShortcutRecorder
      label="打开命令"
      platform="other"
      value={shortcut}
      onValueChange={(next) => setShortcut(next)}
    />
  )
}

export function InlineEditDemo() {
  const [name, setName] = useState("北窗计划")
  return (
    <InlineEdit
      label="项目名称"
      value={name}
      variant="title"
      as="h2"
      onSave={async (next) => {
        await Promise.resolve()
        setName(next)
      }}
    />
  )
}

export function ExpandableTextDemo() {
  return (
    <div className="max-w-sm">
      <ExpandableText lines={2} moreLabel="展开" lessLabel="收起">
        河岸的灯一盏一盏亮起来。船过桥洞的时候，水面把灯拉成一条长线，又在下一阵风里散开。岸上的人还在说话，声音先到，人影后到。
      </ExpandableText>
    </div>
  )
}

export function BrushChartDemo() {
  const data = Array.from({ length: 21 }, (_, index) => ({
    date: Date.UTC(2024, 0, index + 1),
    value: 20 + Math.round(8 * Math.sin(index / 3) + index),
  }))
  return <BrushChart className="w-full max-w-3xl" label="日活" unit="人" height={160} overviewHeight={42} data={data} />
}

export function UserMenuDemo() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [status, setStatus] = useState<"available" | "busy" | "away">("available")
  return (
    <UserMenu
      showName
      portal={false}
      user={{ name: "林夏", email: "lin@example.com", plan: "工作室", avatarSrc: portrait }}
      status={status}
      theme={theme}
      items={[{ label: "账户设置", keys: ["⌘", ","] }]}
      onStatusChange={setStatus}
      onThemeChange={setTheme}
      onSignOut={() => undefined}
    />
  )
}

export function PasswordFieldDemo() {
  return <PasswordField label="密码" description="至少 8 位，含一个数字。" autoComplete="new-password" defaultValue="arc-library" />
}
