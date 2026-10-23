// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { BatteryLoader } from "./battery-loader"
import { CharShimmerLoader } from "./char-shimmer-loader"
import { GlassClockLoader } from "./glass-clock-loader"
import { MessageLoading } from "./message-loading"
import { MultiStepLoader } from "./multi-step-loader"
import { PacmanLoader } from "./pacman-loader"
import { PhoneRingLoader } from "./phone-ring-loader"
import { PixelBirdLoader } from "./pixel-bird-loader"
import { RingedPlanetLoader } from "./ringed-planet-loader"

const planetColors = ["#546c8c", "#bacbd9", "#7ea1bf", "#3c4359", "#bacbd9"]
const steps = [{ text: "核对清单" }, { text: "写入记录" }, { text: "通知相关的人" }]

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
  vi.stubGlobal("requestAnimationFrame", () => 1)
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.stubGlobal(
    "IntersectionObserver",
    class {
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

test("字符扫光读出第一条并显示字号", () => {
  const view = render(
    <CharShimmerLoader
      duration={2400}
      fontSize={14}
      icons={["✦", "◆", "✶"]}
      labels={["分析中", "还在分析", "分析完成"]}
      showPercent
      tokenTarget={0.16}
    />,
  )
  const root = slot(view.container, "char-shimmer-loader")
  expect(screen.getByRole("status", { name: "分析中" })).toHaveStyle({ fontSize: "14px" })
  expect(root).toHaveTextContent("0.0k")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("字符扫光在减弱动效下直接显示最后一条", () => {
  reduceMotion = true
  render(
    <CharShimmerLoader
      duration={2400}
      fontSize={14}
      icons={["✦", "◆", "✶"]}
      labels={["分析中", "还在分析", "分析完成"]}
      showPercent
      tokenTarget={0.16}
    />,
  )
  const status = screen.getByRole("status", { name: "分析完成" })
  expect(status).toHaveAttribute("data-reduced", "true")
  expect(status).toHaveTextContent("100%")
})

test("输入中读出三个点", () => {
  const view = render(<MessageLoading />)
  const root = slot(view.container, "message-loading")
  expect(screen.getByRole("status", { name: "正在输入" })).toBeInTheDocument()
  expect(root.querySelectorAll("span")).toHaveLength(3)
  expect(root.querySelector("span")?.getAttribute("style") ?? "").toContain("message-loading-bob")
})

test("输入中在减弱动效下停住", () => {
  reduceMotion = true
  const view = render(<MessageLoading />)
  const root = slot(view.container, "message-loading")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("span")?.getAttribute("style") ?? "").toContain("animation: none")
})

test("吃豆人挂上四颗豆子", () => {
  const view = render(<PacmanLoader color="#EFF107" size={50} />)
  const root = slot(view.container, "pacman-loader")
  expect(screen.getByRole("status", { name: "加载中" })).toHaveStyle({ width: "130px" })
  expect(root.querySelectorAll("span")).toHaveLength(6)
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("吃豆人在减弱动效下张着嘴", () => {
  reduceMotion = true
  const view = render(<PacmanLoader color="#EFF107" size={50} />)
  const root = slot(view.container, "pacman-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("span")?.getAttribute("style") ?? "").toContain("animation: none")
})

test("电池在没有电量时走格", () => {
  const view = render(<BatteryLoader color="#00F45B" duration={2} />)
  const root = slot(view.container, "battery-loader")
  expect(screen.getByRole("status", { name: "加载中" })).toBeInTheDocument()
  expect(root).toHaveAttribute("data-fill", "animated")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("电池在减弱动效下停在半格", () => {
  reduceMotion = true
  const view = render(<BatteryLoader color="#00F45B" duration={2} />)
  const root = slot(view.container, "battery-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root).toHaveAttribute("data-fill", "50")
})

test("带环星球读出装载文字", () => {
  const view = render(<RingedPlanetLoader colors={planetColors} label="正在装载" size={220} />)
  const root = slot(view.container, "ringed-planet-loader")
  expect(root).toHaveStyle({ width: "220px", height: "248px" })
  expect(screen.getByText("正在装载")).toBeInTheDocument()
  expect(root.querySelectorAll("[data-part=planet]")).toHaveLength(1)
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("带环星球在减弱动效下仍显示文字", () => {
  reduceMotion = true
  const view = render(<RingedPlanetLoader colors={planetColors} label="正在装载" size={220} />)
  const root = slot(view.container, "ringed-planet-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("正在装载")).toBeInTheDocument()
})

test("像素鸟占住圆形舞台", () => {
  const view = render(<PixelBirdLoader size={220} speed={1} />)
  const root = slot(view.container, "pixel-bird-loader")
  expect(screen.getByRole("status", { name: "加载中" })).toHaveStyle({ width: "220px", height: "220px" })
  expect(root.querySelector("[data-part=bird]")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("像素鸟在减弱动效下停在扇翅中段", () => {
  reduceMotion = true
  const view = render(<PixelBirdLoader size={220} speed={1} />)
  const root = slot(view.container, "pixel-bird-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("[data-part=bird]")?.getAttribute("style") ?? "").toContain("rotate(-15deg)")
})

test("来电读出接通文字", () => {
  const view = render(<PhoneRingLoader color="#0d85aa" label="正在接通" size={208} />)
  const root = slot(view.container, "phone-ring-loader")
  expect(root).toHaveStyle({ height: "208px" })
  expect(screen.getByText("正在接通")).toBeInTheDocument()
  expect(root.querySelector("[data-part=ring]")?.getAttribute("style") ?? "").toContain("phone-ring-loader-spin")
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("来电在减弱动效下不再旋转", () => {
  reduceMotion = true
  const view = render(<PhoneRingLoader color="#0d85aa" label="正在接通" size={208} />)
  const root = slot(view.container, "phone-ring-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("[data-part=ring]")?.getAttribute("style") ?? "").toContain("animation: none")
})

test("玻璃钟挂上表盘和指针", () => {
  const view = render(<GlassClockLoader size={180} tint="rgba(255,255,255,0.55)" />)
  const root = slot(view.container, "glass-clock-loader")
  expect(screen.getByRole("status", { name: "加载中" })).toHaveStyle({ width: "333px", height: "279px" })
  expect(root.querySelector("[data-part=minute]")).not.toBeNull()
  expect(root).toHaveAttribute("data-reduced", "false")
})

test("玻璃钟在减弱动效下指针停在可读角度", () => {
  reduceMotion = true
  const view = render(<GlassClockLoader size={180} tint="rgba(255,255,255,0.55)" />)
  const root = slot(view.container, "glass-clock-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(root.querySelector("[data-part=minute]")?.getAttribute("style") ?? "").toContain("rotate(120deg)")
})

test("分步进度打开标题和第一步", () => {
  const view = render(
    <MultiStepLoader
      duration={1800}
      loading
      loop={false}
      onClose={() => {}}
      steps={steps}
      title="正在整理"
    />,
  )
  expect(screen.getByRole("heading", { name: "正在整理" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "关闭" })).toBeInTheDocument()
  expect(screen.getByText("核对清单").closest("li")).toHaveAttribute("aria-current", "step")
  expect(slot(view.container, "multi-step-loader")).toHaveAttribute("data-reduced", "false")
})

test("分步进度在减弱动效下仍显示当前步", () => {
  reduceMotion = true
  const view = render(
    <MultiStepLoader
      duration={1800}
      loading
      loop={false}
      onClose={() => {}}
      steps={steps}
      title="正在整理"
    />,
  )
  const root = slot(view.container, "multi-step-loader")
  expect(root).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("核对清单").closest("li")).toHaveAttribute("aria-current", "step")
})
