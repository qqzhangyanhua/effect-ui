// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { AICitations } from "./ai-citations"
import { AITextLoading } from "./ai-text-loading"
import { AITokenAlternatives } from "./ai-token-alternatives"
import { AIVoice } from "./ai-voice"
import { AttractButton } from "./attract-button"
import { CurrencyTransfer } from "./currency-transfer"
import { DotField } from "./dot-field"
import { LiquidGauge } from "./liquid-gauge"
import { LiquidSlider } from "./liquid-slider"
import { ReceiptPrinter } from "./receipt-printer"

import { TimezonePlanner } from "./timezone-planner"

let reduceMotion = false

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
vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
  window.setTimeout(() => callback(performance.now()), 16),
)
vi.stubGlobal("cancelAnimationFrame", (id: number) => window.clearTimeout(id))

function slot(container: HTMLElement, name: string) {
  return container.querySelector(`[data-slot=${name}]`)
}

test("减弱动效时收据、液面和点阵停在标记上", () => {
  reduceMotion = true
  const receipt = render(<ReceiptPrinter autoPrint={false} merchant="街角咖啡" />)
  expect(slot(receipt.container, "receipt-printer")).toHaveAttribute("data-reduced", "true")
  expect(screen.getAllByText("街角咖啡").length).toBeGreaterThan(0)
  receipt.unmount()

  const gauge = render(<LiquidGauge label="存储" />)
  expect(slot(gauge.container, "liquid-gauge")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("slider", { name: "存储" })).toHaveAttribute("aria-valuenow", "72")
  gauge.unmount()

  const field = render(<DotField>点阵</DotField>)
  expect(slot(field.container, "dot-field")).toHaveAttribute("data-reduced", "true")
  expect(field.container.querySelector("canvas")).toBeTruthy()
  field.unmount()
  cleanup()
})

test("水位滑块和时区表盘能用方向键改变读数", () => {
  reduceMotion = true
  const slider = render(<LiquidSlider label="今日饮水" />)
  const water = screen.getByRole("slider", { name: "今日饮水" })
  expect(water).toHaveAttribute("aria-valuenow", "1250")
  fireEvent.keyDown(water, { key: "ArrowUp" })
  expect(water).toHaveAttribute("aria-valuenow", "1300")
  slider.unmount()

  const planner = render(<TimezonePlanner />)
  const meeting = screen.getByRole("slider", { name: "Meeting time" })
  expect(meeting).toHaveAttribute("aria-valuenow", "960")
  fireEvent.keyDown(meeting, { key: "ArrowRight" })
  expect(Number(meeting.getAttribute("aria-valuenow"))).toBeGreaterThan(960)
  planner.unmount()
  cleanup()
})

test("铁屑按钮、加载短句和录音能读出控件", () => {
  reduceMotion = true
  const button = render(<AttractButton>靠近</AttractButton>)
  expect(slot(button.container, "attract-button")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("button", { name: "靠近" })).toBeEnabled()
  button.unmount()

  const loading = render(<AITextLoading label="加载中" texts={["思考中"]} />)
  expect(slot(loading.container, "ai-text-loading")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("加载中")).toBeInTheDocument()
  expect(loading.container.textContent).toContain("思考中")
  loading.unmount()

  const voice = render(<AIVoice demo={false} />)
  expect(slot(voice.container, "ai-voice")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }))
  expect(screen.getByRole("button", { name: "Stop recording" })).toBeInTheDocument()
  voice.unmount()
  cleanup()
})

test("引用、替换词和汇款卡能打开各自的下一步", () => {
  reduceMotion = true
  const cites = render(<AICitations />)
  expect(slot(cites.container, "ai-citations")).toHaveAttribute("data-reduced", "true")
  const chip = screen.getAllByRole("button", { name: /Sources:/ })[0]
  expect(chip).toBeTruthy()
  fireEvent.click(chip!)
  expect(screen.getByRole("tooltip")).toBeInTheDocument()
  cites.unmount()

  const tokens = render(<AITokenAlternatives />)
  expect(slot(tokens.container, "ai-token-alternatives")).toHaveAttribute("data-reduced", "true")
  fireEvent.click(screen.getByRole("button", { name: /Sure, 58% likely/ }))
  expect(screen.getByRole("listbox")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("option", { name: /Yes/ }))
  expect(screen.getByRole("button", { name: /Yes, 23% likely/ })).toBeInTheDocument()
  tokens.unmount()

  const transfer = render(<CurrencyTransfer status="processing" />)
  expect(slot(transfer.container, "currency-transfer")).toHaveAttribute("data-reduced", "true")
  expect(screen.getByText("Payment received")).toBeInTheDocument()
  expect(screen.getByText("In progress")).toBeInTheDocument()
  transfer.unmount()
  cleanup()
})
