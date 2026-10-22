"use client"

import { useState } from "react"

import { BookmarkBurstToggle } from "../effects/bookmark-burst-toggle"
import { CircularTextButton } from "../effects/circular-text-button"
import { EmailTemplate } from "../effects/email-template"
import { FileManagerTable } from "../effects/file-manager-table"
import { FlickerReflectButton } from "../effects/flicker-reflect-button"
import { FlowerBurstButton } from "../effects/flower-burst-button"
import { GlowSearchInput } from "../effects/glow-search-input"
import { LockToggle } from "../effects/lock-toggle"
import { MultiLevelDropdown } from "../effects/multi-level-dropdown"
import { NotFoundPage } from "../effects/not-found-page"
import { PortfolioFilterGrid } from "../effects/portfolio-filter-grid"
import { PropellerOrb } from "../effects/propeller-orb"
import { ScrollCueButton } from "../effects/scroll-cue-button"
import { SignupSplitPage } from "../effects/signup-split-page"
import { StepModal } from "../effects/step-modal"

function swatch(color: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='54%' fill='white' font-size='42' font-family='sans-serif' text-anchor='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const links = [
  { title: "文档", description: "查组件和主题变量。", href: "#docs" },
  { title: "博客", description: "看看最近的界面笔记。", href: "#blog" },
  { title: "联系", description: "把问题发给我们。", href: "#chat" },
]

const files = [
  { id: "req", name: "需求说明.pdf", size: "200 KB", status: "已核对", modified: "1月4日", uploadedAt: "1月4日", author: "林昭" },
  { id: "shot", name: "看板截图.jpg", size: "720 KB", status: "待审", modified: "1月6日", uploadedAt: "1月6日", author: "周宁" },
  { id: "clip", name: "原型走查.mp4", size: "16 MB", status: "已上传", modified: "1月8日", author: "周宁" },
]

export function BookmarkBurstToggleDemo() {
  const [checked, setChecked] = useState(false)
  return <BookmarkBurstToggle aria-label="收藏" checked={checked} color="gold" onCheckedChange={setChecked} />
}

export function LockToggleDemo() {
  const [locked, setLocked] = useState(false)
  return <LockToggle locked={locked} lockedColor="#20cca5" onLockedChange={setLocked} unlockedColor="#ff5b5b" />
}

export function CircularTextButtonDemo() {
  return <CircularTextButton color="#7808d0" href="#circle" text="AWESOME CSS BUTTON" />
}

export function FlowerBurstButtonDemo() {
  return <FlowerBurstButton label="Flowers " petalColors={["#07a6d7", "#93e0ee", "#0761d7", "#93bdee"]} />
}

export function ScrollCueButtonDemo() {
  return (
    <div className="flex flex-col items-center gap-16">
      <ScrollCueButton autoPlay label="Scroll" targetId="scroll-cue-end" />
      <p className="text-sm text-muted-foreground" id="scroll-cue-end">
        已到这里
      </p>
    </div>
  )
}

export function FlickerReflectButtonDemo() {
  return (
    <div className="pb-16">
      <FlickerReflectButton flicker glowColor="#1f4c65">
        Button
      </FlickerReflectButton>
    </div>
  )
}

export function GlowSearchInputDemo() {
  const [value, setValue] = useState("")
  return (
    <GlowSearchInput
      colors={["rgba(108, 110, 255, 0.8)", "rgba(255, 89, 233, 0.8)"]}
      onChange={(event) => setValue(event.target.value)}
      onFilterClick={() => setValue((current) => current)}
      placeholder="Search..."
      value={value}
    />
  )
}

export function PropellerOrbDemo() {
  return (
    <div className="flex min-h-72 items-center justify-center py-16">
      <PropellerOrb
        colors={["black", "rgb(69, 11, 11)", "red", "rgb(255, 179, 0)", "rgb(244, 205, 205)", "rgb(5, 56, 99)", "#eee", "#777"]}
        size={180}
        speed={1.5}
      />
    </div>
  )
}

export function NotFoundPageDemo() {
  return (
    <div className="grid gap-8">
      <NotFoundPage
        description="链接可能改过，或者这一页还没写。"
        eyebrow="404"
        homeHref="#home"
        links={links}
        onBack={() => undefined}
        title="这一页不在了"
        variant="centered"
      />
      <NotFoundPage
        description="可以从下面的入口继续。"
        eyebrow="404"
        homeHref="#home"
        imageAlt="色块"
        imageUrl={swatch("#1e3a5f", "404")}
        links={links}
        onBack={() => undefined}
        title="找不到页面"
        variant="image"
      />
    </div>
  )
}

export function MultiLevelDropdownDemo() {
  return (
    <MultiLevelDropdown
      items={[
        { id: "profile", label: "查看资料", href: "#profile" },
        {
          id: "settings",
          label: "设置",
          items: [
            { id: "shortcuts", label: "快捷键", href: "#keys" },
            { id: "team", label: "团队", href: "#team" },
          ],
        },
        { id: "help", label: "帮助", href: "#help" },
        { id: "out", label: "退出", href: "#out" },
      ]}
      label="账户"
    />
  )
}

export function FileManagerTableDemo() {
  const [selected, setSelected] = useState<string[]>([])
  return <FileManagerTable files={files} onRowAction={() => undefined} onSelectedChange={setSelected} selected={selected} />
}

export function EmailTemplateDemo() {
  return (
    <div className="grid gap-8">
      <EmailTemplate body="验证码五分钟内有效。" brand="北岛" code="6289" cta={{ label: "验证邮箱", href: "#verify" }} footer="这封信发给了你登记的地址。" title="你好" variant="verification" />
      <EmailTemplate
        body="账号已经准备好，可以从这三件事开始。"
        brand="北岛"
        cta={{ label: "开始使用", href: "#start" }}
        links={[
          { label: "更新记录", href: "#log", description: "每周的改动。" },
          { label: "为什么做这个", href: "#why", description: "把界面收成一套。" },
        ]}
        title="欢迎加入"
        variant="welcome"
      />
      <EmailTemplate body="有人邀请你加入这个团队。" brand="北岛" cta={{ label: "接受邀请", href: "#join" }} title="你好" variant="invite" />
    </div>
  )
}

export function SignupSplitPageDemo() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  return (
    <SignupSplitPage
      description="选好账号类型，填完就能开始。"
      imageAlt="门厅"
      imageUrl={swatch("#0f3d3e", "入口")}
      onSubmit={() => setStatus("success")}
      status={status}
      statusMessage={status === "success" ? "已收到，不会发出请求。" : undefined}
      title="创建免费账号"
    />
  )
}

export function StepModalDemo() {
  const [open, setOpen] = useState(true)
  return (
    <div className="min-h-80">
      <button className="rounded-lg border border-border px-4 py-2 text-sm" onClick={() => setOpen(true)} type="button">
        打开步骤
      </button>
      <StepModal
        onOpenChange={setOpen}
        open={open}
        steps={[
          { title: "欢迎来到工作台", body: "先看一眼今天要处理的事。", imageUrl: swatch("#312e81", "一步"), imageAlt: "色块" },
          { title: "邀请同事", body: "把链接发给需要一起看的人。" },
          { title: "完成设置", body: "之后可以随时回来改。" },
        ]}
      />
    </div>
  )
}

export function PortfolioFilterGridDemo() {
  return (
    <PortfolioFilterGrid
      categories={[
        { id: "motion", label: "动画" },
        { id: "web", label: "网页" },
        { id: "app", label: "应用" },
        { id: "brand", label: "品牌" },
      ]}
      items={[
        { id: "kit", category: "motion", eyebrow: "界面套件", title: "一组界面收藏", imageUrl: swatch("#155e75", "套件"), imageAlt: "套件色块" },
        { id: "wire", category: "web", eyebrow: "线框", title: "一份免费的页面骨架", imageUrl: swatch("#9a3412", "骨架"), imageAlt: "骨架色块" },
        { id: "mark", category: "brand", eyebrow: "标志", title: "两色标记", imageUrl: swatch("#3f6212", "标记"), imageAlt: "标记色块" },
      ]}
    />
  )
}
