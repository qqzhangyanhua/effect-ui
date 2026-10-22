"use client"

import { useState } from "react"
import type { Value } from "react-phone-number-input"

import { Button } from "../ui/button"
import { ButtonGroup } from "../ui/button-group"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox"
import { CurrencyInput } from "../ui/currency-input"
import { DashboardBlocks } from "../ui/dashboard-blocks"
import { DatePicker } from "../ui/date-picker"
import { DirectionProvider } from "../ui/direction"
import { EcommerceBlocks } from "../ui/ecommerce-blocks"
import { EmojiPicker } from "../ui/emoji-picker"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "../ui/empty"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field"
import { FloatingLabelInput } from "../ui/floating-label-input"
import { InfiniteScroll } from "../ui/infinite-scroll"
import { Input } from "../ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "../ui/input-group"
import { Item, ItemContent, ItemDescription, ItemTitle } from "../ui/item"
import { Kbd, KbdGroup } from "../ui/kbd"
import { Lightbox } from "../ui/lightbox"
import { MasonryGallery } from "../ui/masonry-gallery"
import { NativeSelect, NativeSelectOption } from "../ui/native-select"
import { NotificationCenter } from "../ui/notification-center"
import { PasswordStrength } from "../ui/password-strength"
import { PhoneInput } from "../ui/phone-input"
import { QuantityStepper } from "../ui/quantity-stepper"
import { TypographyH2, TypographyLead, TypographyP } from "../ui/typography"
import { VideoPlayer } from "../ui/video-player"
import { VirtualList } from "../ui/virtual-list"

export function FieldDemo() {
  return (
    <FieldGroup className="w-72">
      <Field>
        <FieldLabel htmlFor="name">名称</FieldLabel>
        <Input id="name" placeholder="effect-ui" />
        <FieldDescription>会显示在文档标题里。</FieldDescription>
      </Field>
    </FieldGroup>
  )
}

export function InputGroupDemo() {
  return (
    <InputGroup className="w-72">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  )
}

export function ButtonGroupDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline">左</Button>
      <Button variant="outline">中</Button>
      <Button variant="outline">右</Button>
    </ButtonGroup>
  )
}

export function KbdDemo() {
  return (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </KbdGroup>
  )
}

export function EmptyDemo() {
  return (
    <Empty className="w-72 border">
      <EmptyHeader>
        <EmptyTitle>还没有组件</EmptyTitle>
        <EmptyDescription>从 registry 安装一个试试看。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">浏览目录</Button>
      </EmptyContent>
    </Empty>
  )
}

export function ItemDemo() {
  return (
    <Item className="w-72" variant="outline">
      <ItemContent>
        <ItemTitle>Virtual List</ItemTitle>
        <ItemDescription>十万行也能流畅滚动。</ItemDescription>
      </ItemContent>
    </Item>
  )
}

export function NativeSelectDemo() {
  return (
    <NativeSelect defaultValue="cn">
      <NativeSelectOption value="cn">中文</NativeSelectOption>
      <NativeSelectOption value="en">English</NativeSelectOption>
    </NativeSelect>
  )
}

const frameworks = ["React", "Vue", "Svelte", "Solid"]

export function ComboboxDemo() {
  return (
    <Combobox items={frameworks}>
      <ComboboxInput placeholder="选择框架" />
      <ComboboxContent>
        <ComboboxEmpty>没有匹配项</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function DatePickerDemo() {
  const [date, setDate] = useState<Date>()
  return <DatePicker value={date} onValueChange={setDate} />
}

export function TypographyDemo() {
  return (
    <div className="max-w-md text-left">
      <TypographyH2>字体排印</TypographyH2>
      <TypographyLead>标题、导语和正文。</TypographyLead>
      <TypographyP>Typography 按 shadcn 文档模式组合，没有独立官方 registry JSON。</TypographyP>
    </div>
  )
}

export function DirectionDemo() {
  return (
    <DirectionProvider dir="rtl">
      <p className="w-64 text-sm">这段文字从右到左排列，用来演示 DirectionProvider。</p>
    </DirectionProvider>
  )
}

export function VirtualListDemo() {
  const items = Array.from({ length: 200 }, (_, index) => `行 ${index + 1}`)
  return (
    <VirtualList
      className="w-72"
      items={items}
      height={220}
      renderItem={(item) => <div className="flex h-full items-center border-b px-3 text-sm">{item}</div>}
    />
  )
}

export function InfiniteScrollDemo() {
  const [count, setCount] = useState(8)
  return (
    <InfiniteScroll className="h-48 w-64 overflow-auto" hasMore={count < 24} onLoadMore={() => setCount((value) => value + 4)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-md border px-3 py-2 text-sm">
          条目 {index + 1}
        </div>
      ))}
    </InfiniteScroll>
  )
}

const photos = [
  { src: "https://picsum.photos/id/1015/400/260", width: 400, height: 260 },
  { src: "https://picsum.photos/id/1018/300/400", width: 300, height: 400 },
  { src: "https://picsum.photos/id/1025/360/280", width: 360, height: 280 },
  { src: "https://picsum.photos/id/1035/380/240", width: 380, height: 240 },
]

export function MasonryGalleryDemo() {
  return <MasonryGallery className="w-full max-w-lg" photos={photos} />
}

export function LightboxDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="space-y-2">
      <Button onClick={() => setOpen(true)}>打开灯箱</Button>
      <Lightbox open={open} slides={photos} onClose={() => setOpen(false)} />
    </div>
  )
}

export function PhoneInputDemo() {
  const [value, setValue] = useState<Value>()
  return <PhoneInput className="w-72" value={value} onValueChange={setValue} />
}

export function PasswordStrengthDemo() {
  return <PasswordStrength />
}

export function CurrencyInputDemo() {
  const [value, setValue] = useState(1280)
  return <CurrencyInput value={value} onValueChange={setValue} />
}

export function QuantityStepperDemo() {
  const [value, setValue] = useState(2)
  return <QuantityStepper value={value} onValueChange={setValue} />
}

export function FloatingLabelInputDemo() {
  return <FloatingLabelInput className="w-72" label="邮箱" />
}

export function EmojiPickerDemo() {
  const [emoji, setEmoji] = useState("✨")
  return (
    <div className="space-y-2">
      <p className="text-sm">已选 {emoji}</p>
      <EmojiPicker onEmojiSelect={setEmoji} />
    </div>
  )
}

export function VideoPlayerDemo() {
  return (
    <VideoPlayer
      className="w-full max-w-lg"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
    />
  )
}

export function NotificationCenterDemo() {
  return <NotificationCenter />
}

export function DashboardBlocksDemo({ variant }: { variant?: "analytics" | "sales" | "ops" } = {}) {
  return <DashboardBlocks className="w-full" variant={variant} />
}

export function EcommerceBlocksDemo({ view }: { view?: "store" | "gallery" | "checkout" } = {}) {
  return <EcommerceBlocks className="w-full" view={view} />
}
