// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { CopyField } from "./copy-field"
import { GlowLightSwitch } from "./glow-light-switch"
import { HamburgerMorph } from "./hamburger-morph"
import { HueWaveLoader } from "./hue-wave-loader"
import { LeverSwitch } from "./lever-switch"
import { LiftGradientBorderButton } from "./lift-gradient-border-button"
import { MicSearchInput } from "./mic-search-input"
import { MinimalAccordion } from "./minimal-accordion"
import { MoonSunSwitch } from "./moon-sun-switch"
import { Neon3dRadio } from "./neon-3d-radio"
import { NeubrutalismToggle } from "./neubrutalism-toggle"
import { NewsletterInput } from "./newsletter-input"
import { PinDisplayInput } from "./pin-display-input"
import { SocialFollowTooltip } from "./social-follow-tooltip"
import { StarRibbonNotification } from "./star-ribbon-notification"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

const accordionItems = [
  { value: "a", title: "第一项", content: "内容一" },
  { value: "b", title: "第二项", content: "内容二" },
]

test("减弱动效时波浪、绶带和上抬按钮停住", () => {
  reduceMotion = true
  render(
    <div>
      <HueWaveLoader />
      <StarRibbonNotification />
      <LiftGradientBorderButton />
      <SocialFollowTooltip />
    </div>,
  )
  const loader = screen.getByRole("status", { name: "加载中" })
  expect(loader).toHaveAttribute("data-reduced", "true")
  expect(loader.querySelector("span")).toHaveStyle({ animation: "none" })
  const ribbon = document.querySelector("[data-slot=star-ribbon-notification]")
  expect(ribbon).toHaveAttribute("data-reduced", "true")
  expect(ribbon?.querySelector("span")).toHaveStyle({ animation: "none" })
  const button = screen.getByRole("button", { name: "发送消息" })
  expect(button).toHaveAttribute("data-reduced", "true")
  expect(button.className).not.toContain("hover:-translate-y")
  expect(screen.getByText("关注").closest("[data-slot=social-follow-tooltip]")).toHaveAttribute("data-reduced", "true")
})

test("杠杆、日月、灯光和粗野开关可以受控切换", () => {
  const onLever = vi.fn()
  const onTheme = vi.fn()
  const onGlow = vi.fn()
  const onBrutal = vi.fn()
  render(
    <div>
      <LeverSwitch onCheckedChange={onLever} />
      <MoonSunSwitch checked onCheckedChange={onTheme} />
      <GlowLightSwitch onCheckedChange={onGlow} />
      <NeubrutalismToggle onCheckedChange={onBrutal} />
    </div>,
  )
  fireEvent.click(screen.getByRole("switch", { name: "杠杆开关" }))
  expect(onLever).toHaveBeenCalledWith(true)
  expect(screen.getByRole("switch", { name: "杠杆开关" })).toHaveAttribute("aria-checked", "true")
  fireEvent.click(screen.getByRole("switch", { name: "主题开关" }))
  expect(onTheme).toHaveBeenCalledWith(false)
  expect(screen.getByRole("switch", { name: "主题开关" })).toHaveAttribute("aria-checked", "true")
  fireEvent.click(screen.getByRole("switch", { name: "灯光开关" }))
  expect(onGlow).toHaveBeenCalledWith(true)
  fireEvent.click(screen.getByRole("switch", { name: "粗野开关" }))
  expect(onBrutal).toHaveBeenCalledWith(true)
  expect(screen.getByRole("switch", { name: "粗野开关" })).toHaveAttribute("role", "switch")
})

test("霓虹单选、汉堡和手风琴保持语义", () => {
  const onValueChange = vi.fn()
  const onOpenChange = vi.fn()
  render(
    <div>
      <Neon3dRadio
        options={[
          { value: "yes", label: "是" },
          { value: "no", label: "否" },
        ]}
        value="yes"
        onValueChange={onValueChange}
      />
      <HamburgerMorph onOpenChange={onOpenChange} />
      <MinimalAccordion items={accordionItems} type="single" />
      <MinimalAccordion items={accordionItems} type="multiple" />
    </div>,
  )
  fireEvent.click(screen.getByRole("radio", { name: "否" }))
  expect(onValueChange).toHaveBeenCalledWith("no")
  const menu = screen.getByRole("button", { name: "菜单" })
  expect(menu).toHaveAttribute("aria-expanded", "false")
  fireEvent.click(menu)
  expect(onOpenChange).toHaveBeenCalledWith(true)
  expect(menu).toHaveAttribute("aria-expanded", "true")

  const singles = screen.getAllByRole("button", { name: "第一项" })
  const firstSingle = singles[0]
  const secondSingle = screen.getAllByRole("button", { name: "第二项" })[0]
  if (!firstSingle || !secondSingle) throw new Error("缺少手风琴按钮")
  fireEvent.click(firstSingle)
  fireEvent.click(secondSingle)
  expect(firstSingle).toHaveAttribute("aria-expanded", "false")
  expect(secondSingle).toHaveAttribute("aria-expanded", "true")

  const multiples = screen.getAllByRole("button", { name: "第一项" })
  const firstMultiple = multiples[1]
  const secondMultiple = screen.getAllByRole("button", { name: "第二项" })[1]
  if (!firstMultiple || !secondMultiple) throw new Error("缺少多项手风琴按钮")
  fireEvent.click(firstMultiple)
  fireEvent.click(secondMultiple)
  expect(firstMultiple).toHaveAttribute("aria-expanded", "true")
  expect(secondMultiple).toHaveAttribute("aria-expanded", "true")
})

test("麦克风只发回调，复制和订阅走表单", () => {
  const onMicClick = vi.fn()
  const onCopy = vi.fn()
  const onSubmit = vi.fn()
  render(
    <div>
      <MicSearchInput onMicClick={onMicClick} />
      <CopyField value="token" onCopy={onCopy} />
      <NewsletterInput buttonLabel="订阅" placeholder="输入邮箱" status="success" onSubmit={onSubmit} />
    </div>,
  )
  fireEvent.click(screen.getByRole("button", { name: "语音输入" }))
  expect(onMicClick).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  expect(onCopy).toHaveBeenCalledWith("token")
  expect(screen.getByRole("button", { name: "已复制" })).toBeInTheDocument()
  expect(screen.getByRole("status")).toHaveTextContent("订阅成功")
  fireEvent.change(screen.getByRole("textbox", { name: "邮箱" }), { target: { value: "a@b.co" } })
  fireEvent.submit(screen.getByRole("form", { name: "订阅邮件" }))
  expect(onSubmit).toHaveBeenCalledWith("a@b.co")
})

test("验证码自动跳格、退格、粘贴并可以遮罩", () => {
  const onValueChange = vi.fn()
  render(<PinDisplayInput mask onValueChange={onValueChange} />)
  const fields = screen.getAllByRole("textbox")
  const first = fields[0]
  const second = fields[1]
  if (!first || !second) throw new Error("缺少验证码格子")
  const pin = document.querySelector("[data-slot=pin-display-input]")
  expect(pin).toHaveAttribute("data-mask", "true")
  expect(pin?.querySelector("style")?.textContent).toContain("-webkit-text-security: disc")
  fireEvent.change(first, { target: { value: "4" } })
  expect(onValueChange).toHaveBeenCalledWith("4")
  expect(second).toHaveFocus()
  fireEvent.keyDown(second, { key: "Backspace" })
  expect(onValueChange).toHaveBeenCalledWith("")
  fireEvent.paste(first, { clipboardData: { getData: () => "8391" } })
  expect(onValueChange).toHaveBeenLastCalledWith("8391")
})
