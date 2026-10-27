"use client"

import { useState } from "react"
import { PlusIcon, SearchIcon } from "lucide-react"

import { ButtonPlus } from "../ui/button-plus"
import { CheckboxPlus, CheckboxPlusGroup } from "../ui/checkbox-plus"
import { FuseButton } from "../ui/fuse-button"
import { InputPlus, InputPlusPassword, InputPlusSearch, InputPlusTextArea } from "../ui/input-plus"
import { JellyRadio } from "../ui/jelly-radio"
import { LatticeLoader } from "../ui/lattice-loader"
import { PeekRating } from "../ui/peek-rating"
import { PulseHeart } from "../ui/pulse-heart"
import { RadioPlusGroup } from "../ui/radio-plus"
import { SlideToConfirm } from "../ui/slide-to-confirm"
import { SpringCheck } from "../ui/spring-check"
import { SwipeRow } from "../ui/swipe-row"
import { WarmTooltip } from "../ui/warm-tooltip"

export function JellyRadioDemo({
  stiffness = 320,
  color = "#2563eb",
  intensity,
}: {
  stiffness?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <JellyRadio
        aria-label="尺寸"
        stiffness={stiffness}
        color={color}
        intensity={intensity}
        defaultValue="m"
        options={[
          { value: "s", label: "小" },
          { value: "m", label: "中" },
          { value: "l", label: "大" },
        ]}
      />
    </div>
  )
}

export function SpringCheckDemo({
  strokeWidth = 2,
  color = "#2563eb",
  duration = 0.45,
  intensity,
}: {
  strokeWidth?: number
  color?: string
  duration?: number
  intensity?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <SpringCheck aria-label="弹簧勾选" strokeWidth={strokeWidth} color={color} duration={duration} intensity={intensity} defaultChecked />
    </div>
  )
}

export function PeekRatingDemo({
  max = 5,
  allowHalf = false,
  color = "#eab308",
  size,
  intensity,
}: {
  max?: number
  allowHalf?: boolean
  color?: string
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <PeekRating aria-label="评分" max={max} allowHalf={allowHalf} color={color} size={size} intensity={intensity} defaultValue={3} />
    </div>
  )
}

export function SlideToConfirmDemo({
  label = "滑动确认",
  threshold = 0.85,
  color = "#2563eb",
  duration,
}: {
  label?: string
  threshold?: number
  color?: string
  duration?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <SlideToConfirm label={label} threshold={threshold} color={color} duration={duration} className="w-64" />
    </div>
  )
}

export function SwipeRowDemo({
  actionWidth = 88,
  direction = "left",
  duration,
  intensity,
}: {
  actionWidth?: number
  direction?: "left" | "right"
  duration?: number
  intensity?: number
} = {}) {
  return (
    <div className="mx-auto w-full max-w-sm p-6">
      <SwipeRow
        actionWidth={actionWidth}
        direction={direction}
        duration={duration}
        intensity={intensity}
        actions={<button type="button" className="bg-destructive px-3 text-sm text-white">删除</button>}
      >
        滑动这一行
      </SwipeRow>
    </div>
  )
}

export function FuseButtonDemo({
  holdMs = 800,
  color = "#2563eb",
  scale,
}: {
  holdMs?: number
  color?: string
  scale?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <FuseButton holdMs={holdMs} color={color} scale={scale}>
        按住确认
      </FuseButton>
    </div>
  )
}

export function PulseHeartDemo({
  size = 28,
  color = "#e11d48",
  burst = 8,
  duration,
  scale,
}: {
  size?: number
  color?: string
  burst?: number
  duration?: number
  scale?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <PulseHeart size={size} color={color} burst={burst} duration={duration} scale={scale} />
    </div>
  )
}

export function LatticeLoaderDemo({
  rows = 4,
  cols = 4,
  speed = 1,
  color = "#2563eb",
  size,
  gap,
}: {
  rows?: number
  cols?: number
  speed?: number
  color?: string
  size?: number
  gap?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <LatticeLoader rows={rows} cols={cols} speed={speed} color={color} size={size} gap={gap} />
    </div>
  )
}

export function WarmTooltipDemo({
  delay = 200,
  side = "top",
  glow = true,
  intensity,
}: {
  delay?: number
  side?: "top" | "right" | "bottom" | "left"
  glow?: boolean
  intensity?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-16">
      <WarmTooltip content="软光提示" delay={delay} side={side} glow={glow} intensity={intensity}>
        <button type="button" className="rounded-md border px-3 py-1.5 text-sm">
          悬停查看
        </button>
      </WarmTooltip>
    </div>
  )
}

export function ButtonPlusDemo() {
  const [loading, setLoading] = useState(false)
  return (
    <div className="grid max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ButtonPlus>默认</ButtonPlus>
        <ButtonPlus variant="outline">描边</ButtonPlus>
        <ButtonPlus variant="ghost">幽灵</ButtonPlus>
        <ButtonPlus variant="link">链接</ButtonPlus>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ButtonPlus
          icon={<PlusIcon />}
          loading={loading}
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => setLoading(false), 800)
          }}
        >
          保存
        </ButtonPlus>
        <ButtonPlus icon={<PlusIcon />} aria-label="添加" />
        <ButtonPlus danger>危险</ButtonPlus>
        <ButtonPlus danger variant="outline">
          危险描边
        </ButtonPlus>
        <ButtonPlus danger variant="ghost">
          危险幽灵
        </ButtonPlus>
      </div>
      <ButtonPlus block>整行按钮</ButtonPlus>
    </div>
  )
}

export function InputPlusDemo() {
  const [keyword, setKeyword] = useState("效果")
  return (
    <div className="grid max-w-md gap-3">
      <InputPlus allowClear prefix={<SearchIcon />} suffix="px" placeholder="带前后缀" />
      <InputPlus showCount maxLength={12} placeholder="最多 12 字" />
      <InputPlus status="error" placeholder="错误" defaultValue="无效" />
      <InputPlus status="warning" placeholder="警告" />
      <InputPlusPassword placeholder="密码" />
      <InputPlusSearch value={keyword} onValueChange={setKeyword} onSearch={setKeyword} />
      <InputPlusTextArea autoSize={{ minRows: 2, maxRows: 4 }} showCount maxLength={40} placeholder="自适应高度" />
    </div>
  )
}

export function CheckboxPlusDemo() {
  const [value, setValue] = useState<string[]>(["docs"])
  return (
    <div className="grid gap-4">
      <CheckboxPlus indeterminate>全选</CheckboxPlus>
      <CheckboxPlusGroup
        options={["docs", { label: "registry", value: "registry" }, { label: "禁用", value: "off", disabled: true }]}
        value={value}
        onValueChange={setValue}
      />
      <CheckboxPlusGroup orientation="vertical" options={["上", "下"]} defaultValue={["上"]} />
    </div>
  )
}

export function RadioPlusDemo() {
  const [city, setCity] = useState("hangzhou")
  return (
    <div className="grid gap-4">
      <RadioPlusGroup
        options={[
          { label: "杭州", value: "hangzhou" },
          { label: "宁波", value: "ningbo" },
          { label: "禁用", value: "off", disabled: true },
        ]}
        value={city}
        onValueChange={setCity}
      />
      <RadioPlusGroup optionType="button" options={["日", "周", "月"]} defaultValue="周" />
      <RadioPlusGroup orientation="vertical" options={["左", "右"]} defaultValue="左" />
    </div>
  )
}
