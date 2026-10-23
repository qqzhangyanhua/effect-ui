"use client"

import { useState } from "react"

import { BlogCard } from "../effects/blog-card"
import { BlurUnveilCard } from "../effects/blur-unveil-card"
import { CollapsibleSideMenu } from "../effects/collapsible-side-menu"
import { ContactForm } from "../effects/contact-form"
import { DetailsList } from "../effects/details-list"
import { GlitchSliceButton } from "../effects/glitch-slice-button"
import { GlowWanderCard } from "../effects/glow-wander-card"
import { NeonHoldCard } from "../effects/neon-hold-card"
import { Alert, Badge, Checkbox, Input, NeoCard, Progress, Select, Tabs, Textarea } from "../effects/neo-brutal-kit"
import { PinToggle } from "../effects/pin-toggle"
import { SendArrowButton } from "../effects/send-arrow-button"
import { StarFavoriteToggle } from "../effects/star-favorite-toggle"
import { StatTrendCards } from "../effects/stat-trend-cards"
import { TeamSection } from "../effects/team-section"
import { TrashDeleteButton } from "../effects/trash-delete-button"

function swatch(color: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='54%' fill='white' font-size='42' font-family='sans-serif' text-anchor='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const rows = [
  { term: "称呼", detail: "先生" },
  { term: "姓名", detail: "林昭" },
  { term: "角色", detail: "吉他手" },
  { term: "简介", detail: "下午在排练室把和弦又改了一遍。" },
]

const fields = [
  { name: "name", label: "姓名", kind: "text" as const, placeholder: "怎么称呼", required: true },
  { name: "email", label: "邮箱", kind: "email" as const, placeholder: "name@example.com", required: true },
  { name: "message", label: "留言", kind: "textarea" as const, placeholder: "想说的话", required: true },
]

export function GlitchSliceButtonDemo() {
  return (
    <div className="flex w-full justify-center bg-neutral-950 px-6 py-16">
      <GlitchSliceButton colors={["#ff013c", "#00e6f6", "#f8f005"]} label="悬停看看">
        悬停看看
      </GlitchSliceButton>
    </div>
  )
}

export function SendArrowButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <SendArrowButton colors={["#3b82f6", "#2563eb", "#1d4ed8", "#44BCFF", "#FF44EC", "#FF675E"]}>发送</SendArrowButton>
    </div>
  )
}

export function TrashDeleteButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <TrashDeleteButton color="rgb(168, 7, 7)" tooltip="删除" />
    </div>
  )
}

export function NeonHoldCardDemo() {
  return (
    <div className="flex w-full justify-center overflow-hidden bg-neutral-950 px-6 py-24">
      <NeonHoldCard colors={["rgb(65, 88, 208)", "rgb(200, 80, 192)", "rgb(255, 204, 112)"]}>按住</NeonHoldCard>
    </div>
  )
}

export function PinToggleDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <PinToggle aria-label="置顶" color="rgb(179, 139, 255)" />
    </div>
  )
}

export function BlurUnveilCardDemo({
  value = "34+",
  caption = "进行中的项目",
  blobColor = "#fca5a5",
}: { value?: string; caption?: string; blobColor?: string } = {}) {
  return (
    <div className="flex justify-center px-6 py-10">
      <BlurUnveilCard blobColor={blobColor} caption={caption} value={value} />
    </div>
  )
}

export function GlowWanderCardDemo() {
  return (
    <div className="flex w-full justify-center bg-neutral-950 px-6 py-10">
      <GlowWanderCard colors={["#01e100", "#f50076", "#00e6fd"]} duration={1.5} />
    </div>
  )
}

export function StarFavoriteToggleDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <StarFavoriteToggle aria-label="收藏" color="#ffeb49" />
    </div>
  )
}

export function DetailsListDemo() {
  return (
    <div className="grid gap-8 px-6 py-8">
      <DetailsList items={rows} />
      <DetailsList items={rows} variant="striped" />
      <DetailsList items={rows} variant="bordered" />
      <DetailsList items={rows} variant="bordered-striped" />
    </div>
  )
}

export function BlogCardDemo({
  variant = "image-top",
  title = "把家具摆得亮一点",
  excerpt = "把沙发挪到窗边之后，下午的光会先落到靠垫上。",
}: {
  variant?: "image-top" | "overlay" | "horizontal"
  title?: string
  excerpt?: string
} = {}) {
  return (
    <div className="grid gap-8 px-6 py-8 lg:grid-cols-2">
      <BlogCard
        date="2022-10-10"
        dateTime="2022-10-10"
        excerpt={excerpt}
        href="#furniture"
        imageAlt="靛蓝色块，写着靠窗"
        imageUrl={swatch("#312e81", "靠窗")}
        title={title}
        variant={variant}
      />
      <BlogCard
        cta="继续读"
        date="2022-10-10"
        dateTime="2022-10-10"
        excerpt="灯放低一点，影子就不会切断桌面。"
        href="#lamp"
        imageAlt="青色色块，写着台灯"
        imageUrl={swatch("#0e7490", "台灯")}
        title="灯和影子的位置"
        variant="overlay"
      />
      <BlogCard
        className="lg:col-span-2"
        cta="看排版"
        date="2022年10月"
        dateTime="2022-10-10"
        excerpt="横向卡片把日期竖着放，封面留在一侧。"
        href="#layout"
        imageAlt="洋红色块，写着横排"
        imageUrl={swatch("#9d174d", "横排")}
        title="横过来的一篇"
        variant="horizontal"
      />
    </div>
  )
}

export function NeoBrutalKitDemo() {
  return (
    <div className="grid gap-6 px-6 py-8">
      <NeoCard date="2025年4月1日" dateTime="2025-04-01" heading="第一次把页面发出去" href="#note">
        边框很粗，影子不模糊。
      </NeoCard>
      <Alert>这条是说明，不是报错。</Alert>
      <Alert tone="success">已经保存。</Alert>
      <div className="flex flex-wrap gap-3">
        <Badge>信息</Badge>
        <Badge tone="success">成功</Badge>
        <Badge tone="error">错误</Badge>
      </div>
      <Input label="邮箱" placeholder="name@example.com" type="email" />
      <Select
        label="主唱"
        options={[
          { value: "", label: "请选择" },
          { value: "jm", label: "林昭" },
          { value: "ec", label: "周宁" },
        ]}
      />
      <Textarea label="备注" rows={3} />
      <Checkbox label="我同意把草稿留下" />
      <Progress label="进度" value={25} />
      <Tabs
        tabs={[
          { id: "profile", label: "资料", content: "这里是资料页。" },
          { id: "account", label: "账号", content: "这里是账号页。" },
          { id: "notes", label: "通知", content: "这里是通知页。" },
        ]}
      />
    </div>
  )
}

export function ContactFormDemo() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  return (
    <div className="px-6 py-8">
      <ContactForm
        fields={fields}
        onSubmit={() => {
          setStatus("success")
          setStatusMessage("已收到，我们会回信。")
        }}
        status={status}
        statusMessage={statusMessage}
        submitLabel="发送留言"
      />
    </div>
  )
}

export function TeamSectionDemo() {
  const portrait = swatch("#1e3a8a", "成员")
  return (
    <TeamSection
      className="px-6 py-8"
      members={[
        { name: "江衡", role: "产品设计", imageUrl: portrait, imageAlt: "深蓝色块，写着成员", href: "https://example.com/jiang", linkLabel: "江衡的主页" },
        { name: "苏晚", role: "前端", imageUrl: swatch("#3f6212", "苏晚"), imageAlt: "绿色色块，写着苏晚", href: "https://example.com/su", linkLabel: "苏晚的主页" },
        { name: "沈舟", role: "研究", imageUrl: swatch("#7c2d12", "沈舟"), imageAlt: "棕色色块，写着沈舟", href: "https://example.com/shen", linkLabel: "沈舟的主页" },
      ]}
    />
  )
}

export function StatTrendCardsDemo() {
  return (
    <div className="px-6 py-8">
      <StatTrendCards
        items={[
          { label: "利润", value: "¥404.32", from: "¥240.94", delta: "67.81%", direction: "up" },
          { label: "利润", value: "¥240.94", from: "¥404.32", delta: "67.81%", direction: "down" },
        ]}
      />
    </div>
  )
}

export function CollapsibleSideMenuDemo() {
  return (
    <div className="px-6 py-8">
      <CollapsibleSideMenu
        items={[
          { id: "general", label: "总览", href: "#general", current: true },
          {
            id: "teams",
            label: "团队",
            defaultOpen: true,
            items: [
              { id: "banned", label: "封禁用户", href: "#banned", badge: 3 },
              { id: "calendar", label: "日历", href: "#calendar" },
            ],
          },
          { id: "billing", label: "账单", href: "#billing" },
          { id: "invoices", label: "发票", href: "#invoices", badge: 12 },
          {
            id: "account",
            label: "账户",
            items: [
              { id: "details", label: "资料", href: "#details" },
              { id: "security", label: "安全", href: "#security" },
              { id: "logout", label: "退出", href: "#logout" },
            ],
          },
        ]}
      />
    </div>
  )
}
