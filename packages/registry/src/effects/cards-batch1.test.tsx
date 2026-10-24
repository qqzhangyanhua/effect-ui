// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ActivityTerrain } from "./activity-terrain"
import { AppleActivityCard } from "./apple-activity-card"
import { AtroposCard } from "./atropos-card"
import { BoxCarousel } from "./box-carousel"
import { CardBeamScanner } from "./card-beam-scanner"
import { CircularGallery } from "./circular-gallery"
import { ExpandableCard } from "./expandable-card"
import { LenticularCard } from "./lenticular-card"
import { MorphingDialog, MorphingDialogTrigger } from "./morphing-dialog"
import { NeonGradientCard } from "./neon-gradient-card"
import { PerspectiveCard } from "./perspective-card"
import { ProjectUpdateCard } from "./project-update-card"
import { ReceiptPrinter } from "./receipt-printer"

const shots = [
  { title: "A", src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
  { title: "B", src: "data:image/gif;base64,R0lGODlhAQABAAAAACw=" },
]

let reduceMotion = false

function media(query: string) {
  return {
    matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }
}

beforeEach(() => {
  reduceMotion = false
  vi.stubGlobal("matchMedia", media)
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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
    },
  )
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function slot(container: HTMLElement, name: string) {
  const node = container.querySelector(`[data-slot="${name}"]`)
  expect(node).not.toBeNull()
  return node as HTMLElement
}

test("透视卡片跟着指针倾斜，内容仍在", () => {
  render(
    <PerspectiveCard>
      <h3>Perspective</h3>
    </PerspectiveCard>,
  )
  const card = screen.getByText("Perspective").closest("[data-slot='perspective-card']")
  expect(card).not.toBeNull()
  fireEvent.mouseMove(card as HTMLElement, { clientX: 20, clientY: 10 })
  expect(screen.getByText("Perspective")).toBeInTheDocument()
})

test("透视卡片在减弱动效时不再跟随指针", () => {
  reduceMotion = true
  const { container } = render(
    <PerspectiveCard>
      <h3>Perspective</h3>
    </PerspectiveCard>,
  )
  const card = slot(container, "perspective-card")
  fireEvent.mouseMove(card, { clientX: 20, clientY: 10 })
  expect(screen.getByText("Perspective")).toBeInTheDocument()
})

test("展开卡片点击后显示正文", () => {
  render(
    <ExpandableCard title="可展开卡片" preview="点击查看更多细节">
      这里是展开后的说明
    </ExpandableCard>,
  )
  fireEvent.click(screen.getByRole("button", { name: /可展开卡片/ }))
  expect(screen.getByText("这里是展开后的说明")).toBeInTheDocument()
})

test("展开卡片在减弱动效时仍能展开", () => {
  reduceMotion = true
  render(
    <ExpandableCard title="可展开卡片" preview="点击查看更多细节">
      这里是展开后的说明
    </ExpandableCard>,
  )
  fireEvent.click(screen.getByRole("button", { name: /可展开卡片/ }))
  expect(screen.getByText("这里是展开后的说明")).toBeInTheDocument()
})

test("变形弹窗点击后标记为展开", () => {
  render(
    <MorphingDialog>
      <MorphingDialogTrigger>共享布局</MorphingDialogTrigger>
    </MorphingDialog>,
  )
  const trigger = screen.getByRole("button", { name: "共享布局" })
  fireEvent.click(trigger)
  expect(trigger).toHaveAttribute("aria-expanded", "true")
})

test("变形弹窗在减弱动效时仍能展开", () => {
  reduceMotion = true
  render(
    <MorphingDialog>
      <MorphingDialogTrigger>共享布局</MorphingDialogTrigger>
    </MorphingDialog>,
  )
  const trigger = screen.getByRole("button", { name: "共享布局" })
  fireEvent.click(trigger)
  expect(trigger).toHaveAttribute("aria-expanded", "true")
})





test("环形相册先挂上画布", () => {
  const { container } = render(<CircularGallery items={shots} />)
  expect(container.querySelector("canvas")).not.toBeNull()
})

test("环形相册在减弱动效时仍挂上画布", () => {
  reduceMotion = true
  const { container } = render(<CircularGallery items={shots} />)
  expect(container.querySelector("canvas")).not.toBeNull()
})

test("Atropos 卡片显示默认标题和副标题", () => {
  render(<AtroposCard />)
  expect(screen.getByRole("heading", { name: "Atropos" })).toBeInTheDocument()
  expect(screen.getByText("多层 3D 视差")).toBeInTheDocument()
})

test("Atropos 卡片在减弱动效时仍显示标题", () => {
  reduceMotion = true
  render(<AtroposCard />)
  expect(screen.getByRole("heading", { name: "Atropos" })).toBeInTheDocument()
})

test("立方体轮播可以点旋转", () => {
  render(<BoxCarousel />)
  fireEvent.click(screen.getByRole("button", { name: "旋转" }))
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(screen.getByText("东")).toBeInTheDocument()
})

test("立方体轮播在减弱动效时只留下正面", () => {
  reduceMotion = true
  render(<BoxCarousel />)
  expect(screen.getByText("北")).toBeInTheDocument()
  expect(screen.queryByText("东")).not.toBeInTheDocument()
})

test("活动圆环列出三项", () => {
  render(<AppleActivityCard />)
  expect(screen.getByRole("img", { name: "活动圆环" })).toBeInTheDocument()
  expect(screen.getByText("Move")).toBeInTheDocument()
})

test("活动圆环在减弱动效时仍列出三项", () => {
  reduceMotion = true
  render(<AppleActivityCard />)
  expect(screen.getByRole("img", { name: "活动圆环" })).toBeInTheDocument()
  expect(screen.getByText("Stand")).toBeInTheDocument()
})

test("项目更新可以只看未读", () => {
  render(<ProjectUpdateCard />)
  expect(screen.getByText("林夏")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("switch", { name: "全部更新" }))
  expect(screen.queryByText("林夏")).not.toBeInTheDocument()
  expect(screen.getByText("周宁")).toBeInTheDocument()
})

test("项目更新在减弱动效时仍能只看未读", () => {
  reduceMotion = true
  render(<ProjectUpdateCard />)
  fireEvent.click(screen.getByRole("switch", { name: "全部更新" }))
  expect(screen.getByRole("switch", { name: "只看未读" })).toHaveAttribute("aria-checked", "true")
})

test("光栅卡在角度居中时停在中间画面", () => {
  render(<LenticularCard />)
  expect(screen.getByRole("button", { name: /海湾/ })).toBeInTheDocument()
  expect(screen.getByText("倾斜或移动指针，光栅会换到另一张图。")).toBeInTheDocument()
})

test("光栅卡在减弱动效时从第一张点到下一张", () => {
  reduceMotion = true
  render(<LenticularCard />)
  expect(screen.getByText("点击切换画面。")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: /晨雾/ }))
  expect(screen.getByRole("button", { name: /海湾/ })).toBeInTheDocument()
})

test("光束扫卡在运动时画出光束", () => {
  const { container } = render(<CardBeamScanner />)
  expect(screen.getByRole("heading", { name: "北窗卡" })).toBeInTheDocument()
  expect(container.querySelector(".bg-amber-200")).not.toBeNull()
})

test("光束扫卡在减弱动效时收起光束", () => {
  reduceMotion = true
  const { container } = render(<CardBeamScanner />)
  expect(screen.getByRole("heading", { name: "北窗卡" })).toBeInTheDocument()
  expect(container.querySelector(".bg-amber-200")).toBeNull()
})

test("霓虹卡片在视口内播放渐变", () => {
  const { container } = render(
    <NeonGradientCard>
      <p>霓虹边框里的内容</p>
    </NeonGradientCard>,
  )
  expect(screen.getByText("霓虹边框里的内容")).toBeInTheDocument()
  expect(slot(container, "neon-gradient-card")).toHaveAttribute("data-animated", "true")
})

test("霓虹卡片在减弱动效时停住渐变", () => {
  reduceMotion = true
  const { container } = render(
    <NeonGradientCard>
      <p>霓虹边框里的内容</p>
    </NeonGradientCard>,
  )
  expect(slot(container, "neon-gradient-card")).toHaveAttribute("data-animated", "false")
})

test("活动地形可以切到平面", () => {
  const { container } = render(<ActivityTerrain title="活动" />)
  expect(slot(container, "activity-terrain")).toHaveAttribute("data-reduced", "false")
  fireEvent.click(screen.getByRole("button", { name: "Flat" }))
  expect(screen.getByRole("button", { name: "Flat" })).toHaveAttribute("aria-pressed", "true")
})

test("活动地形在减弱动效时仍能切到平面", () => {
  reduceMotion = true
  const { container } = render(<ActivityTerrain title="活动" />)
  expect(slot(container, "activity-terrain")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Flat" }))
  expect(screen.getByRole("button", { name: "Flat" })).toHaveAttribute("aria-pressed", "true")
})

test("收据打印机显示店名", () => {
  const { container } = render(<ReceiptPrinter merchant="街角咖啡" currency="¥" />)
  expect(screen.getAllByText("街角咖啡").length).toBeGreaterThan(0)
  expect(slot(container, "receipt-printer")).toHaveAttribute("data-reduced", "false")
})

test("收据打印机在减弱动效时仍显示店名", () => {
  reduceMotion = true
  const { container } = render(<ReceiptPrinter merchant="街角咖啡" currency="¥" />)
  expect(screen.getAllByText("街角咖啡").length).toBeGreaterThan(0)
  expect(slot(container, "receipt-printer")).toHaveAttribute("data-reduced", "true")
})
