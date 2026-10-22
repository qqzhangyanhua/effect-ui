// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { BatteryLoader } from "./battery-loader"
import { CornerIndicator } from "./corner-indicator"
import { FileInput } from "./file-input"
import { FilterChips } from "./filter-chips"
import { FormValidator } from "./form-validator"
import { GlassClockLoader } from "./glass-clock-loader"
import { HoverGallery } from "./hover-gallery"
import { IconSwap } from "./icon-swap"
import { PacmanLoader } from "./pacman-loader"
import { PhoneRingLoader } from "./phone-ring-loader"
import { PixelBirdLoader } from "./pixel-bird-loader"
import { RingedPlanetLoader } from "./ringed-planet-loader"
import { ShapeMask } from "./shape-mask"
import { SiteFooter } from "./site-footer"
import { TickRange } from "./tick-range"

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
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
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

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3C/svg%3E"

test("减弱动效时加载器保持可读姿态", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <PacmanLoader color="#EFF107" size={50} />
      <BatteryLoader color="#00F45B" value={40} />
      <RingedPlanetLoader colors={["#546c8c", "#bacbd9", "#7ea1bf", "#3c4359", "#bacbd9"]} label="正在装载" size={120} />
      <PixelBirdLoader size={120} speed={1} />
      <PhoneRingLoader color="#0d85aa" label="正在接通" size={160} />
      <GlassClockLoader size={120} tint="rgba(255,255,255,0.55)" />
    </div>,
  )
  expect(screen.getAllByRole("status", { name: "加载中" })[0]).toHaveAttribute("data-reduced", "true")
  expect(container.querySelector("[data-slot=battery-loader]")).toHaveAttribute("data-fill", "40")
  expect(container.querySelector("[data-slot=battery-loader]")).toHaveAttribute("data-motion", "off")
  const ring = container.querySelector("[data-part=ring]")
  expect(ring?.getAttribute("style") ?? "").toContain("rotateX(110deg)")
  expect(container.querySelector("[data-part=bird]")?.getAttribute("style") ?? "").toContain("rotate(-15deg)")
  expect(container.querySelector("[data-slot=phone-ring-loader] [data-part=ring]")?.getAttribute("style") ?? "").toContain("none")
  expect(container.querySelector("[data-part=minute]")?.getAttribute("style") ?? "").toContain("rotate(120deg)")
  expect(screen.getByText("正在装载")).toBeInTheDocument()
  expect(screen.getByText("正在接通")).toBeInTheDocument()
})

test("播放时电话虚线环旋转，电池在没有 value 时走格", () => {
  const { container } = render(
    <div>
      <PhoneRingLoader label="振铃" />
      <BatteryLoader />
    </div>,
  )
  expect(container.querySelector("[data-slot=phone-ring-loader] [data-part=ring]")?.getAttribute("style") ?? "").toContain("phone-ring-loader-spin")
  expect(container.querySelector("[data-slot=battery-loader]")).toHaveAttribute("data-fill", "animated")
})

test("画廊随指针切换，交换按钮和筛选芯片保持状态", () => {
  const { container } = render(
    <div>
      <HoverGallery images={[{ src: pixel, alt: "潮汐" }, { src: pixel, alt: "峡谷" }]} progress />
      <IconSwap aria-label="开关" indeterminate={<span>中</span>} off={<span>关</span>} on={<span>开</span>} pressed="mixed" />
      <FilterChips options={[{ value: "ui", label: "界面" }, { value: "motion", label: "动效" }]} />
      <ShapeMask as="figure" half="1" shape="star">星</ShapeMask>
      <CornerIndicator items={[{ label: "3", vertical: "bottom", horizontal: "start" }]}>
        <span>收件</span>
      </CornerIndicator>
    </div>,
  )
  const gallery = container.querySelector("[data-slot=hover-gallery]")
  expect(screen.getByRole("img", { name: "潮汐" })).toBeInTheDocument()
  if (gallery instanceof HTMLElement) {
    gallery.getBoundingClientRect = () => ({ x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 100, width: 200, height: 100, toJSON() {} })
    fireEvent.pointerMove(gallery, { clientX: 180, pointerType: "mouse" })
  }
  expect(screen.getByRole("img", { name: "峡谷" })).toBeInTheDocument()
  expect(container.querySelector("[data-part=progress]")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "开关" })).toHaveAttribute("aria-pressed", "mixed")
  fireEvent.click(screen.getByRole("radio", { name: "界面" }))
  expect(container.querySelector("[data-slot=filter-chips]")).toHaveAttribute("data-selected", "true")
  expect(screen.getByRole("button", { name: "×" })).toBeVisible()
  expect(container.querySelector("[data-shape=star]")).toHaveAttribute("data-half", "1")
  expect(container.querySelector("[data-vertical=bottom][data-horizontal=start]")).toHaveTextContent("3")
})

test("表单、文件和刻度滑块能交互，页脚三态都在", () => {
  const files = vi.fn()
  const subscribe = vi.fn()
  render(
    <div>
      <FormValidator required hint="请填写邮箱" label="工作邮箱" />
      <FileInput aria-label="选择文件" onFilesChange={files} />
      <TickRange aria-label="音量" defaultValue={20} ticks={4} />
      <SiteFooter
        brand="北窗"
        copyright="版权"
        ctaHref="#join"
        ctaLabel="现在加入"
        groups={[{ title: "入口", links: [{ label: "首页", href: "#home" }] }]}
        heading="订阅"
        social={[{ label: "代码", href: "#code" }]}
        variant="subscribe"
        onSubscribe={subscribe}
      />
      <SiteFooter ctaLabel="现在加入" heading="加入" variant="cta" />
      <SiteFooter brand="北窗" variant="simple" />
    </div>,
  )
  const email = screen.getByLabelText("工作邮箱")
  fireEvent.blur(email)
  expect(email).toHaveAttribute("aria-invalid", "true")
  expect(email).toHaveAttribute("aria-describedby")
  expect(screen.getByText("请填写邮箱")).toHaveAttribute("data-state", "invalid")
  const input = screen.getByLabelText("选择文件")
  const file = new File(["a"], "a.png", { type: "image/png" })
  Object.defineProperty(input, "files", { value: [file], configurable: true })
  fireEvent.change(input)
  expect(files).toHaveBeenCalled()
  fireEvent.change(screen.getByRole("slider", { name: "音量" }), { target: { value: "60" } })
  expect(screen.getByRole("slider", { name: "音量" })).toHaveValue("60")
  expect(document.querySelector("[data-part=ticks]")).toHaveAttribute("data-count", "4")
  const subscribeFooter = document.querySelector('[data-variant="subscribe"]')
  if (!(subscribeFooter instanceof HTMLElement)) throw new Error("缺少订阅页脚")
  const mail = subscribeFooter.querySelector("input")
  const form = subscribeFooter.querySelector("form")
  if (!(mail instanceof HTMLInputElement) || !(form instanceof HTMLFormElement)) throw new Error("缺少订阅表单")
  fireEvent.change(mail, { target: { value: "a@b.c" } })
  fireEvent.submit(form)
  expect(subscribe).toHaveBeenCalledWith("a@b.c")
  expect(screen.getAllByRole("link", { name: "现在加入" }).length).toBeGreaterThan(0)
  expect(screen.getAllByText("北窗").length).toBeGreaterThan(0)
})
