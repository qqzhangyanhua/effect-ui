// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { TearStub } from "./banner-tear-stub"
import { ToppleRun } from "./checkbox-domino-run"
import { ContraStrike } from "./contra-strike"
import { DueSlip } from "./due-slip"
import { PlumbTrue } from "./success-plumb-bob"
import { SiphonLift } from "./transfer-list-siphon"
import { AfterImageList } from "./undo-ghost-row"
import { CrazeRule } from "./craze-rule"

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

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    const box = target.getBoundingClientRect()
    this.callback(
      [
        {
          target,
          contentRect: {
            x: box.x,
            y: box.y,
            width: box.width || 640,
            height: box.height || 320,
            top: box.top,
            left: box.left,
            bottom: box.bottom,
            right: box.right,
            toJSON() {
              return {}
            },
          },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
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

const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path")
const pathProto = Object.getPrototypeOf(pathEl) as SVGPathElement
pathProto.getTotalLength = () => 120
pathProto.getPointAtLength = () => ({ x: 12, y: 8 }) as DOMPoint

test("减弱动效时确认、多选和通知仍然可用", async () => {
  reduceMotion = true
  const user = userEvent.setup()
  render(
    <div>
      <PlumbTrue successMessage="付款已确认" pendingLabel="确认付款" />
      <ToppleRun label="全部标为已读" items={[{ id: "a", label: "路线评审" }, { id: "b", label: "发票" }]} />
      <TearStub title="计划维护" description="只读十分钟" dismissLabel="关闭" />
      <CrazeRule seed={3} />
    </div>,
  )

  expect(screen.getByRole("button", { name: "确认付款" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "确认付款" }))
  expect(screen.getAllByRole("status").some((node) => node.textContent?.includes("付款已确认"))).toBe(true)

  await user.click(screen.getByRole("checkbox", { name: "全部标为已读" }))
  expect(screen.getByText("Enabled all 2.")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "关闭" }))
  expect(await screen.findByRole("button", { name: "Reopen: 计划维护" })).toBeInTheDocument()

  const rule = document.querySelector("[data-slot=craze-rule]")
  expect(rule).toHaveAttribute("data-reduced", "true")
  expect(rule).toHaveAttribute("data-motion", "off")
})

test("搬运列表可以用键盘选中，也可以用按钮送出", async () => {
  const user = userEvent.setup()
  render(
    <SiphonLift
      sourceLabel="候补"
      destinationLabel="小队"
      items={[
        { id: "wren", label: "林夏" },
        { id: "ling", label: "陈可" },
      ]}
    />,
  )

  const list = screen.getByRole("listbox", { name: "候补" })
  expect(list).toBeInTheDocument()
  const option = screen.getByRole("option", { name: "林夏" })
  option.focus()
  await user.keyboard(" ")
  expect(option).toHaveAttribute("aria-selected", "true")
  await user.keyboard("{ArrowDown}")
  expect(screen.getByRole("option", { name: "陈可" })).toHaveFocus()

  await user.click(screen.getByRole("button", { name: "Move selected to 小队" }))
  expect(await screen.findByText("Moving 0 of 1 to 小队.")).toBeInTheDocument()
  expect(document.querySelector("[data-slot=transfer-list-siphon]")).toHaveAttribute("data-motion", "on")
})

test("退款滑块、已读回执和删除残影会宣布状态", async () => {
  reduceMotion = true
  const user = userEvent.setup()
  render(
    <div>
      <ContraStrike
        orderLabel="订单 4471"
        lines={[{ id: "mouse", description: "无线鼠标 ×6", qty: 6, unitPrice: 10 }]}
      />
      <DueSlip label="已读" readers={[{ id: "mara", name: "陈玛", readAt: new Date(2026, 7, 17, 8, 3) }]} />
      <AfterImageList items={[{ id: "note", title: "启动笔记" }]} />
    </div>,
  )

  const slider = screen.getByRole("slider", { name: "Refund 无线鼠标 ×6" })
  slider.focus()
  await user.keyboard("{ArrowRight}")
  expect(slider).toHaveAttribute("aria-valuenow")

  const expand = screen.getByRole("button", { name: "Expand 已读 to show full names" })
  await user.click(expand)
  expect(expand).toHaveAttribute("aria-expanded", "true")
  await user.keyboard("{Escape}")
  expect(expand).toHaveAttribute("aria-expanded", "false")

  await user.click(screen.getByRole("button", { name: "Delete 启动笔记" }))
  expect(screen.getByText(/Deleted 启动笔记/)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "Dismiss: finish deleting 启动笔记" })).toBeInTheDocument()
})
