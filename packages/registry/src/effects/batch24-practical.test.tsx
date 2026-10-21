// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { expect, test, vi } from "vitest"
import { useState } from "react"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { ActivityTerrain } from "./activity-terrain"
import { AIToolApproval, type ToolCall } from "./ai-tool-approval"
import { CradleText } from "./cradle-text"
import { FocalPointPicker } from "./focal-point-picker"
import { MarkingMenu } from "./marking-menu"
import { PullCord } from "./pull-cord"
import { SwooshText } from "./swoosh-text"
import { SyncedTranscript } from "./synced-transcript"
import { UndoButton } from "./undo-button"
import { WheelPicker } from "./wheel-picker"

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
SVGElement.prototype.getTotalLength = () => 120
Element.prototype.scrollTo = () => {}

const photo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"

test("减弱动效时地形、摇篮字和挤出字停在标记上", () => {
  reduceMotion = true
  const terrain = render(<ActivityTerrain data={[1, 2, 3]} />)
  expect(terrain.container.querySelector("[data-slot=activity-terrain]")).toHaveAttribute("data-reduced", "true")
  expect(terrain.container.querySelector("canvas")).toBeTruthy()
  terrain.unmount()

  const cradle = render(<CradleText text="停" intro={false} />)
  expect(cradle.container.querySelector("[data-slot=cradle-text]")).toHaveAttribute("data-reduced", "true")
  expect(cradle.container).toHaveTextContent("停")
  cradle.unmount()

  const swoosh = render(<SwooshText text="静" />)
  expect(swoosh.container.querySelector("[data-slot=swoosh-text]")).toHaveAttribute("data-reduced", "true")
  expect(swoosh.container).toHaveTextContent("静")
  cleanup()
  reduceMotion = false
})

test("拉绳开关可以用键盘按钮切换", () => {
  render(<PullCord defaultChecked label="台灯" />)
  const lamp = screen.getByRole("switch", { name: "台灯" })
  expect(lamp).toHaveAttribute("aria-checked", "true")
  fireEvent.click(lamp)
  expect(lamp).toHaveAttribute("aria-checked", "false")
  cleanup()
})

test("撤销按钮进入倒计时", () => {
  render(<UndoButton duration={4000} label="归档" doneLabel="已归档" />)
  fireEvent.click(screen.getByRole("button", { name: "归档" }))
  expect(screen.getByRole("button", { name: /已归档/ })).toBeInTheDocument()
  cleanup()
})

test("焦点选择器用图片而不是 next/image", () => {
  render(<FocalPointPicker alt="山" src={photo} />)
  const image = screen.getByRole("img", { name: "山" })
  expect(image.tagName).toBe("IMG")
  expect(image).toHaveAttribute("src", photo)
  cleanup()
})

test("转录点击句子会把时间跳过去", () => {
  render(
    <SyncedTranscript
      segments={[
        { speaker: "林", start: 0.2, end: 1.2, text: "第一句" },
        { speaker: "周", start: 2, end: 3, text: "第二句" },
      ]}
    />,
  )
  fireEvent.click(screen.getByRole("button", { name: /第二句/ }))
  expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "2")
  cleanup()
})

test("滚轮和标记菜单都能用键盘打开", () => {
  render(<WheelPicker label="时间" />)
  expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0)
  cleanup()

  render(<MarkingMenu />)
  fireEvent.click(screen.getByRole("button", { name: "Menu" }))
  expect(screen.getByRole("menu", { name: "Go to" })).toBeInTheDocument()
  cleanup()
})

function ApprovalHarness() {
  const [calls, setCalls] = useState<ToolCall[]>([
    {
      id: "1",
      tool: "bash",
      title: "Run a command",
      input: { command: "ls" },
      state: "approval-requested",
    },
  ])
  return (
    <AIToolApproval
      calls={calls}
      onRespond={() => setCalls([{ ...calls[0]!, state: "output-denied" }])}
    />
  )
}

test("工具批准可以拒绝", () => {
  render(<ApprovalHarness />)
  fireEvent.click(screen.getByRole("button", { name: "Deny" }))
  expect(screen.getByRole("button", { name: /Denied/ })).toBeInTheDocument()
  cleanup()
})
