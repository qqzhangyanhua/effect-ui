// @vitest-environment jsdom

import { MotionGlobalConfig } from "motion"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

MotionGlobalConfig.skipAnimations = true

import { Ridgeline } from "./ridgeline"
import { SlopeChart } from "./slope-chart"
import { Streamgraph } from "./streamgraph"
import { Treemap } from "./treemap"
import { WaffleChart } from "./waffle-chart"

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

const days = [{ key: "d1", label: "第 1 天", values: { mail: 8, chat: 4 } }]
const layers = [
  { key: "mail", label: "邮件" },
  { key: "chat", label: "会话" },
]

test("河流图显示名称", () => {
  const view = render(
    <Streamgraph data={days} directLabels height={180} label="工单来源" legend offset="wiggle" series={layers} unit="件" />,
  )
  expect(screen.getByRole("figure", { name: "工单来源" })).toBeInTheDocument()
  expect(screen.getAllByText("邮件").length).toBeGreaterThan(0)
  expect(slot(view.container, "streamgraph")).toHaveAttribute("data-reduced", "false")
})

test("河流图在减弱动效下仍显示名称", () => {
  reduceMotion = true
  const view = render(
    <Streamgraph data={days} directLabels height={180} label="工单来源" legend offset="wiggle" series={layers} unit="件" />,
  )
  expect(screen.getByRole("figure", { name: "工单来源" })).toBeInTheDocument()
  expect(slot(view.container, "streamgraph")).toHaveAttribute("data-reduced", "true")
})

test("格子图显示分类", () => {
  const view = render(
    <WaffleChart
      columns={10}
      data={[{ key: "water", label: "水电", value: 42 }]}
      decimals={0}
      label="发电构成"
      legend
      rows={5}
      unit="太瓦时"
    />,
  )
  expect(screen.getAllByText("水电").length).toBeGreaterThan(0)
  expect(slot(view.container, "waffle-chart")).toHaveAttribute("data-reduced", "false")
})

test("格子图在减弱动效下仍显示分类", () => {
  reduceMotion = true
  const view = render(
    <WaffleChart
      columns={10}
      data={[{ key: "water", label: "水电", value: 42 }]}
      decimals={0}
      label="发电构成"
      legend
      rows={5}
      unit="太瓦时"
    />,
  )
  expect(screen.getAllByText("水电").length).toBeGreaterThan(0)
  expect(slot(view.container, "waffle-chart")).toHaveAttribute("data-reduced", "true")
})

test("矩形树图显示叶子", () => {
  const view = render(
    <Treemap
      data={{ id: "all", label: "全部", children: [{ id: "sh", label: "上海", value: 42 }] }}
      emptyLabel="No data yet"
      height={240}
      label="营收"
    />,
  )
  expect(screen.getAllByText("上海").length).toBeGreaterThan(0)
  expect(slot(view.container, "treemap")).toHaveAttribute("data-reduced", "false")
})

test("矩形树图在减弱动效下仍显示叶子", () => {
  reduceMotion = true
  const view = render(
    <Treemap
      data={{ id: "all", label: "全部", children: [{ id: "sh", label: "上海", value: 42 }] }}
      emptyLabel="No data yet"
      height={240}
      label="营收"
    />,
  )
  expect(screen.getAllByText("上海").length).toBeGreaterThan(0)
  expect(slot(view.container, "treemap")).toHaveAttribute("data-reduced", "true")
})

test("斜率图显示两个时点", () => {
  const view = render(
    <SlopeChart
      data={[{ key: "search", label: "搜索", start: 2.1, end: 3.4 }]}
      endLabel="二季度"
      height={200}
      label="转化率"
      ranks
      startLabel="一季度"
    />,
  )
  expect(screen.getAllByText("一季度").length).toBeGreaterThan(0)
  expect(screen.getAllByText("二季度").length).toBeGreaterThan(0)
  expect(slot(view.container, "slope-chart")).toHaveAttribute("data-reduced", "false")
})

test("斜率图在减弱动效下仍显示时点", () => {
  reduceMotion = true
  const view = render(
    <SlopeChart
      data={[{ key: "search", label: "搜索", start: 2.1, end: 3.4 }]}
      endLabel="二季度"
      height={200}
      label="转化率"
      ranks
      startLabel="一季度"
    />,
  )
  expect(screen.getAllByText("一季度").length).toBeGreaterThan(0)
  expect(slot(view.container, "slope-chart")).toHaveAttribute("data-reduced", "true")
})

test("山脊图显示序列名", () => {
  const view = render(
    <Ridgeline
      emptyLabel="No data yet"
      label="每日气温"
      overlap={2.4}
      series={[{ id: "jan", label: "一月", values: [2, 3, 1, 4] }]}
      tint
      unit="°C"
    />,
  )
  expect(screen.getAllByText("一月").length).toBeGreaterThan(0)
  expect(slot(view.container, "ridgeline")).toHaveAttribute("data-reduced", "false")
})

test("山脊图在减弱动效下仍显示序列名", () => {
  reduceMotion = true
  const view = render(
    <Ridgeline
      emptyLabel="No data yet"
      label="每日气温"
      overlap={2.4}
      series={[{ id: "jan", label: "一月", values: [2, 3, 1, 4] }]}
      tint
      unit="°C"
    />,
  )
  expect(screen.getAllByText("一月").length).toBeGreaterThan(0)
  expect(slot(view.container, "ridgeline")).toHaveAttribute("data-reduced", "true")
})
