"use client"

import { Camera, Image as ImageIcon, Mic } from "lucide-react"
import { useState } from "react"

import { AccountAccessCard } from "../effects/account-access-card"
import { AIChatCard } from "../effects/ai-chat-card"
import { CheckCrossSwitch } from "../effects/check-cross-switch"
import { ElementAlongPathItem, ElementAlongSvgPath } from "../effects/element-along-svg-path"
import { GitHubProfileCard } from "../effects/github-profile-card"
import { HttpStatusLookup } from "../effects/http-status-lookup"
import { LetterSwapPingPong } from "../effects/letter-swap-pingpong"
import { LoginCard } from "../effects/login-card"
import { PlusShareBurst } from "../effects/plus-share-burst"
import { RandomLetterSwap } from "../effects/random-letter-swap"
import { StarRating } from "../effects/star-rating"
import { TransferFundsCard } from "../effects/transfer-funds-card"
import { UnderlineHoverLink } from "../effects/underline-hover-link"

const credentials = [
  { email: "ada@example.com", passwordLength: 12 },
  { email: "lin@example.com", passwordLength: 8 },
]

const prompts = ["帮我把这段说明写短一点", "给设置页加一个减弱动效开关"]

const summary = [
  { label: "预计到账", value: "今天" },
  { label: "手续费", value: "¥0.00" },
  { label: "合计", value: "¥1,200.00", emphasized: true },
]

export function LetterSwapPingPongDemo({
  label = "往返",
  reverse = true,
  staggerDuration = 0.03,
}: { label?: string; reverse?: boolean; staggerDuration?: number } = {}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10 text-4xl">
      <LetterSwapPingPong label={label} reverse={reverse} staggerDuration={staggerDuration} />
    </div>
  )
}

export function RandomLetterSwapDemo({
  label = "随机",
  reverse = true,
  staggerDuration = 0.02,
}: { label?: string; reverse?: boolean; staggerDuration?: number } = {}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10 text-4xl">
      <RandomLetterSwap label={label} reverse={reverse} staggerDuration={staggerDuration} />
    </div>
  )
}

export function UnderlineHoverLinkDemo({
  variant = "center",
  direction = "left",
  href = "#center",
}: { variant?: "center" | "in-out"; direction?: "left" | "right"; href?: string } = {}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-6 px-6 py-10 text-2xl">
      <UnderlineHoverLink direction={direction} href={href} variant={variant}>
        从中间
      </UnderlineHoverLink>
      <UnderlineHoverLink direction="right" href="#in-out" variant="in-out">
        从右侧
      </UnderlineHoverLink>
    </div>
  )
}

export function ElementAlongSvgPathDemo({
  animationType = "auto",
  duration = 4,
  direction = "normal",
}: {
  animationType?: "auto" | "scroll"
  duration?: number
  direction?: "normal" | "reverse"
} = {}) {
  return (
    <div className="px-6 py-10">
      <ElementAlongSvgPath
        animationType={animationType}
        className="h-48 text-primary"
        direction={direction}
        duration={duration}
        path="M10 80 C 30 10, 70 10, 90 80"
        showPath
      >
        <ElementAlongPathItem>
          <span className="size-3 rounded-full bg-primary" />
        </ElementAlongPathItem>
        <ElementAlongPathItem startOffset={30}>
          <span className="size-2 rounded-full bg-foreground" />
        </ElementAlongPathItem>
      </ElementAlongSvgPath>
    </div>
  )
}

export function CheckCrossSwitchDemo({
  defaultChecked = false,
  offColor,
  onColor,
}: {
  defaultChecked?: boolean
  offColor?: string
  onColor?: string
} = {}) {
  const [on, setOn] = useState(false)
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 px-6 py-10">
      <CheckCrossSwitch
        aria-label="示例开关"
        checked={on}
        defaultChecked={defaultChecked}
        offColor={offColor}
        onCheckedChange={setOn}
        onColor={onColor}
      />
      <span className="text-sm">{on ? "开" : "关"}</span>
    </div>
  )
}

export function PlusShareBurstDemo() {
  const [picked, setPicked] = useState("未选")
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-4 px-6 py-16">
      <PlusShareBurst
        items={[
          { label: "相机", icon: <Camera className="size-4" />, onSelect: () => setPicked("相机") },
          { label: "麦克风", icon: <Mic className="size-4" />, onSelect: () => setPicked("麦克风") },
          { label: "图片", icon: <ImageIcon className="size-4" />, onSelect: () => setPicked("图片") },
        ]}
      />
      <p className="text-sm text-muted-foreground">{picked}</p>
    </div>
  )
}

export function StarRatingDemo({
  label = "评分",
  max = 5,
  showValue = true,
}: {
  label?: string
  max?: number
  showValue?: boolean
} = {}) {
  const [value, setValue] = useState(3)
  return (
    <div className="flex min-h-40 items-center justify-center px-6 py-10">
      <StarRating label={label} max={max} showValue={showValue} value={value} onValueChange={setValue} />
    </div>
  )
}

export function AccountAccessCardDemo({
  title = "账号访问",
  emailLabel = "邮箱",
  buttonLabel = "更新安全设置",
}: { title?: string; emailLabel?: string; buttonLabel?: string } = {}) {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <AccountAccessCard buttonLabel={buttonLabel} credentials={credentials} emailLabel={emailLabel} title={title} />
    </div>
  )
}

export function AiChatCardDemo({
  title = "新对话",
  greeting = "你好",
  prompt = "下面的句子会自己打出来。",
}: { title?: string; greeting?: string; prompt?: string } = {}) {
  const [sent, setSent] = useState("")
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <AIChatCard greeting={greeting} prompt={prompt} prompts={prompts} title={title} onSend={setSent} />
      {sent ? <p className="mt-3 text-sm text-muted-foreground">已发送：{sent}</p> : null}
    </div>
  )
}

export function LoginCardDemo({
  title = "欢迎回来",
  submitLabel = "继续",
  dividerLabel = "或",
}: { title?: string; submitLabel?: string; dividerLabel?: string } = {}) {
  const [email, setEmail] = useState("")
  return (
    <div className="flex justify-center px-6 py-10">
      <LoginCard
        dividerLabel={dividerLabel}
        fields={[{ name: "email", label: "邮箱", type: "email", placeholder: "you@example.com" }]}
        submitLabel={submitLabel}
        title={title}
        footer={<span>示例页脚，不包含品牌标志。</span>}
        socialSlot={
          <button className="flex w-full items-center justify-between rounded-full border px-6 py-4 text-sm" type="button">
            使用示例社交账号
          </button>
        }
        onSubmit={(values) => setEmail(values.email ?? "")}
      />
      {email ? <span className="sr-only">已提交 {email}</span> : null}
    </div>
  )
}

export function TransferFundsCardDemo({
  amount = "1,200.00",
  fromAccount = "活期 ··8402",
  toAccount = "储蓄 ··1192",
}: { amount?: string; fromAccount?: string; toAccount?: string } = {}) {
  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <TransferFundsCard amount={amount} description="在已连接的账户之间移动资金。" fromAccount={fromAccount} summary={summary} toAccount={toAccount} />
    </div>
  )
}

export function HttpStatusLookupDemo() {
  return (
    <div className="px-6 py-10">
      <HttpStatusLookup defaultQuery="" />
    </div>
  )
}

export function GitHubProfileCardDemo({
  username = "",
  fetchProfile = false,
  emptyLabel = "输入 GitHub 用户名查看资料卡",
}: { username?: string; fetchProfile?: boolean; emptyLabel?: string } = {}) {
  return (
    <div className="flex justify-center px-6 py-10">
      <GitHubProfileCard
        emptyLabel={emptyLabel}
        fetchProfile={fetchProfile}
        username={username}
        contributions={[
          { date: "2026-10-01", level: 0, count: 0 },
          { date: "2026-10-02", level: 2, count: 4 },
          { date: "2026-10-03", level: 4, count: 9 },
        ]}
        user={{
          login: "octocat",
          name: "示例用户",
          bio: "资料由 demo 传入，打开页面时不会请求网络。",
          avatarUrl: "",
          followers: 1200,
          following: 18,
          publicRepos: 42,
          htmlUrl: "https://github.com/octocat",
        }}
      />
    </div>
  )
}
