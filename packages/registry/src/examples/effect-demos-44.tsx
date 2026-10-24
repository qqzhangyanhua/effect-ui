"use client"

import { useState } from "react"
import { CreditCard, Home, Settings, UserRound } from "lucide-react"

import { BottomNavigation } from "../effects/bottom-navigation"
import { CategorySearchInput } from "../effects/category-search-input"

import { FlyAroundButton } from "../effects/fly-around-button"
import { FocusLineInput } from "../effects/focus-line-input"
import { MeetingControlBar } from "../effects/meeting-control-bar"
import { PendulumSocialCard } from "../effects/pendulum-social-card"
import { PrinterIconButton } from "../effects/printer-icon-button"
import { TiltSweepButton } from "../effects/tilt-sweep-button"
import { TransactionCard } from "../effects/transaction-card"
import { UnoCard } from "../effects/uno-card"
import { WordWheelCard } from "../effects/word-wheel-card"

function swatch(color: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='54%' fill='white' font-size='42' font-family='sans-serif' text-anchor='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function SendIcon() {
  return (
    <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M14.22 21.63c-1.18 0-2.85-.83-4.17-4.8l-.72-2.16-2.16-.72c-3.96-1.32-4.79-2.99-4.79-4.17 0-1.17.83-2.85 4.79-4.18l8.49-2.83c2.12-.71 3.89-.5 4.98.58 1.09 1.08 1.3 2.86.59 4.98l-2.83 8.49c-1.33 3.98-3 4.81-4.18 4.81Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function UnoCardDemo() {
  return (
    <UnoCard colors={["#FF2400", "#1F51FF", "#FFEA00", "#50C878"]} size={176}>
      UNO
    </UnoCard>
  )
}

export function TransactionCardDemo() {
  return <TransactionCard amount="¥128" label="新的交易" onClick={() => undefined} />
}

export function PrinterIconButtonDemo() {
  return <PrinterIconButton color="#00104b" label="打印" onClick={() => undefined} />
}

export function PendulumSocialCardDemo() {
  return (
    <PendulumSocialCard
      heading="我们也在社交网络"
      image={{ src: swatch("#1e293b", "头像"), alt: "头像" }}
      links={[
        { label: "照片", href: "#photo" },
        { label: "动态", href: "#feed" },
        { label: "讨论", href: "#talk" },
      ]}
    />
  )
}

export function TiltSweepButtonDemo() {
  return (
    <TiltSweepButton from="#99fff8" to="hsla(13, 63%, 73%, 1)">
      点我
    </TiltSweepButton>
  )
}

export function FocusLineInputDemo() {
  return <FocusLineInput lineColor="#6c63ff" placeholder="输入文字" />
}

export function WordWheelCardDemo() {
  return <WordWheelCard title="欢迎" wordsA={["更省事", "更便宜", "全世界"]} wordsB={["秘密", "更贵", "全世界"]} />
}

export function FlyAroundButtonDemo() {
  return (
    <FlyAroundButton icon={<SendIcon />} onClick={() => undefined}>
      发送消息
    </FlyAroundButton>
  )
}

export function BottomNavigationDemo() {
  const [current, setCurrent] = useState("首页")
  const items = [
    { label: "首页", icon: <Home className="size-5" /> },
    { label: "钱包", icon: <CreditCard className="size-5" /> },
    { label: "设置", icon: <Settings className="size-5" /> },
    { label: "我的", icon: <UserRound className="size-5" /> },
  ]
  return (
    <div className="relative h-20 w-full max-w-lg">
      <BottomNavigation
        className="absolute inset-x-0 bottom-0"
        items={items.map((item) => ({ ...item, current: item.label === current, onSelect: () => setCurrent(item.label) }))}
        variant="default"
      />
    </div>
  )
}

export function MeetingControlBarDemo() {
  const [controls, setControls] = useState({ mic: false, cam: false, feedback: false, settings: false })
  const [ended, setEnded] = useState(false)
  return (
    <div className="relative h-20 w-full">
      <MeetingControlBar
        className="absolute inset-x-0 bottom-0"
        controls={controls}
        end={ended ? "已结束" : "结束"}
        onEnd={() => setEnded(true)}
        onToggle={(key, pressed) => setControls((prev) => ({ ...prev, [key]: pressed }))}
        time="12:43"
      />
    </div>
  )
}
export function CategorySearchInputDemo() {
  const [value, setValue] = useState({ category: "all", query: "" })
  const [sent, setSent] = useState("")
  return (
    <div className="w-full max-w-xl space-y-3">
      <CategorySearchInput
        categories={[
          { value: "all", label: "全部分类" },
          { value: "shop", label: "商品" },
          { value: "news", label: "新闻" },
        ]}
        onSearch={(next) => setSent(`${next.category}:${next.query}`)}
        onValueChange={setValue}
        value={value}
      />
      {sent ? <p className="text-sm text-muted-foreground">已提交 {sent}</p> : null}
    </div>
  )
}
