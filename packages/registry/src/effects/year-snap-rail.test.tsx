// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { YearSnapRail } from "./year-snap-rail"

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

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

function installMedia(options: { reduced?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: options.reduced === true && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

function start(prop: string) {
  const entry = getComponent("year-snap-rail")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("年份轨控件起始值等于默认，并报出当前年", async () => {
  expect(getComponent("year-snap-rail")?.batch).toBe(68)
  expect(getComponent("year-snap-rail")?.effectCategory).toBe("showcase")
  expect(start("pace")).toBe(1)
  expect(start("intensity")).toBe(0.7)
  expect(start("gap")).toBe(12)
  expect(start("count")).toBe(6)
  const view = render(<YearSnapRail />)
  const rail = view.getByRole("listbox", { name: "年份" })
  expect(view.container.querySelector("[data-slot='year-snap-rail']")).toHaveAttribute("data-ritual", "year-snap")
  expect(rail).toHaveAttribute("data-rail", "year")
  expect(rail).toHaveAttribute("data-pace", "1")
  expect(rail).toHaveAttribute("data-intensity", "0.7")
  expect(rail).toHaveAttribute("data-gap", "12")
  expect(rail).toHaveAttribute("data-count", "6")
  expect(rail).toHaveAttribute("data-index", "0")
  expect(rail).toHaveAttribute("data-year", "2014")
  expect(rail).toHaveAttribute("data-title", "起点")
  expect(rail).toHaveAttribute("data-state", "idle")
  expect(rail).toHaveAttribute("data-scale", "1.28")
  expect(rail.querySelector("[data-centerline]")).toBeTruthy()
  expect(view.getByRole("option", { selected: true })).toHaveTextContent("2014")
  expect(view.getByRole("status")).toHaveTextContent("2014 起点")
  expect(rail.className).toContain("motion-reduce:transition-none")
  await waitFor(() => expect(rail).toHaveAttribute("data-live", "on"))
})

test("拖动吸附到相邻年份，方向键和点击也能换年", () => {
  const onIndexChange = vi.fn()
  const view = render(<YearSnapRail onIndexChange={onIndexChange} />)
  const rail = view.getByRole("listbox", { name: "年份" })
  const row = Number(rail.getAttribute("data-row"))
  fireEvent.pointerDown(rail, { clientY: 200, pointerId: 1 })
  fireEvent.pointerMove(rail, { clientY: 200 - row, pointerId: 1 })
  expect(rail).toHaveAttribute("data-state", "scrolling")
  fireEvent.pointerUp(rail, { pointerId: 1 })
  expect(rail).toHaveAttribute("data-index", "1")
  expect(rail).toHaveAttribute("data-year", "2016")
  expect(rail).toHaveAttribute("data-title", "样机")
  expect(rail).toHaveAttribute("data-state", "snapped")
  expect(view.getByRole("status")).toHaveTextContent("2016 样机")
  expect(onIndexChange).toHaveBeenCalledWith(1)

  fireEvent.pointerDown(rail, { clientY: 200, pointerId: 2 })
  fireEvent.pointerMove(rail, { clientY: 196, pointerId: 2 })
  fireEvent.pointerUp(rail, { pointerId: 2 })
  expect(rail).toHaveAttribute("data-index", "1")

  fireEvent.keyDown(rail, { key: "ArrowDown" })
  expect(rail).toHaveAttribute("data-year", "2018")
  expect(rail.getAttribute("aria-activedescendant")).toContain("2018")
  fireEvent.keyDown(rail, { key: "ArrowUp" })
  expect(rail).toHaveAttribute("data-year", "2016")
  fireEvent.click(view.getByRole("option", { name: "2020" }))
  expect(rail).toHaveAttribute("data-index", "3")
  expect(rail).toHaveAttribute("data-title", "走廊")
  expect(view.getByRole("option", { selected: true })).toHaveTextContent("2020")
  expect(onIndexChange).toHaveBeenCalledWith(3)
})

test("滚轮换到下一年", () => {
  const view = render(<YearSnapRail />)
  const rail = view.getByRole("listbox", { name: "年份" })
  fireEvent.wheel(rail, { deltaY: 40 })
  expect(rail).toHaveAttribute("data-index", "1")
  expect(rail).toHaveAttribute("data-state", "snapped")
})

test("减弱动效立刻换年，不再放大", () => {
  installMedia({ reduced: true })
  const view = render(<YearSnapRail />)
  const rail = view.getByRole("listbox", { name: "年份" })
  expect(rail).toHaveAttribute("data-motion", "off")
  expect(rail).toHaveAttribute("data-ease", "off")
  expect(rail).toHaveAttribute("data-scale", "1.00")
  expect(rail.className).toContain("motion-reduce:transition-none")
  fireEvent.keyDown(rail, { key: "ArrowDown" })
  expect(rail).toHaveAttribute("data-year", "2016")
  expect(rail).toHaveAttribute("data-scale", "1.00")
  expect(rail).toHaveAttribute("data-state", "snapped")
  expect(view.getByRole("status")).toHaveTextContent("2016")
})

test("离开视口后没有循环帧", () => {
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const view = render(<YearSnapRail />)
  const rail = view.getByRole("listbox", { name: "年份" })
  expect(rail).toHaveAttribute("data-live", "off")
  fireEvent.keyDown(rail, { key: "ArrowDown" })
  expect(rail).toHaveAttribute("data-year", "2016")
})
