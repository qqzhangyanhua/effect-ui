// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { HexZoneHotspots } from "./hex-zone-hotspots"

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
  const entry = getComponent("hex-zone-hotspots")
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(prop)
  return found.control.value
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1))
  vi.stubGlobal("cancelAnimationFrame", vi.fn())
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("热区控件起始值等于默认", async () => {
  expect(start("intensity")).toBe(0.45)
  expect(start("pulse")).toBe(0.6)
  expect(start("pace")).toBe(1)
  const view = render(<HexZoneHotspots />)
  const root = view.container.querySelector("[data-slot='hex-zone-hotspots']")
  expect(root).toHaveAttribute("data-map", "abstract")
  expect(root).toHaveAttribute("data-intensity", "0.45")
  expect(root).toHaveAttribute("data-pulse", "0.6")
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-count", "4")
  expect(view.container.querySelector("iframe")).toBeNull()
  expect(view.container.textContent).not.toMatch(/mapbox|leaflet|google maps/i)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
})

test("点选热区后 Esc 收起，方向键和 Enter 也能选中", async () => {
  const onSelect = vi.fn()
  const view = render(<HexZoneHotspots onSelect={onSelect} />)
  const root = view.container.querySelector("[data-slot='hex-zone-hotspots']")
  const list = view.getByRole("listbox", { name: "地图热区" })
  fireEvent.click(view.getByRole("option", { name: "山脊" }))
  expect(root).toHaveAttribute("data-state", "selected")
  expect(root).toHaveAttribute("data-selected", "ridge")
  expect(view.getByRole("status")).toHaveTextContent("6.1 km")
  expect(view.getByRole("status")).toHaveTextContent("点比较疏，路线更长。")
  expect(onSelect).toHaveBeenCalledTimes(1)
  expect(onSelect).toHaveBeenCalledWith("ridge")
  fireEvent.click(view.getByRole("option", { name: "山脊" }))
  expect(onSelect).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(list, { key: "Escape" })
  expect(root).toHaveAttribute("data-state", "dismissed")
  expect(root).toHaveAttribute("data-selected", "")
  expect(view.queryByRole("status")).not.toBeInTheDocument()
  expect(onSelect).toHaveBeenLastCalledWith(null)
  fireEvent.keyDown(list, { key: "ArrowLeft" })
  fireEvent.keyDown(list, { key: "Enter" })
  expect(root).toHaveAttribute("data-selected", "harbor")
  expect(view.getByRole("status")).toHaveTextContent("港湾")
})

test("选中后才脉冲，离开视口就停", async () => {
  const frames = vi.fn(() => 1)
  vi.stubGlobal("requestAnimationFrame", frames)
  const view = render(<HexZoneHotspots />)
  const root = view.container.querySelector("[data-slot='hex-zone-hotspots']")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-pulsing", "off")
  expect(frames).not.toHaveBeenCalled()
  fireEvent.click(view.getByRole("option", { name: "北岸" }))
  await waitFor(() => expect(root).toHaveAttribute("data-pulsing", "on"))
  expect(frames).toHaveBeenCalled()
  view.unmount()

  frames.mockClear()
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const hidden = render(<HexZoneHotspots />)
  const quiet = hidden.container.querySelector("[data-slot='hex-zone-hotspots']")
  expect(quiet).toHaveAttribute("data-live", "off")
  fireEvent.click(hidden.getByRole("option", { name: "港湾" }))
  expect(quiet).toHaveAttribute("data-selected", "harbor")
  expect(quiet).toHaveAttribute("data-pulsing", "off")
  expect(frames).not.toHaveBeenCalled()
})

test("减弱动效没有脉冲，详情直接出现", () => {
  installMedia({ reduced: true })
  const frames = vi.fn(() => 1)
  vi.stubGlobal("requestAnimationFrame", frames)
  const view = render(<HexZoneHotspots pace={1.6} />)
  const root = view.container.querySelector("[data-slot='hex-zone-hotspots']")
  fireEvent.click(view.getByRole("option", { name: "田野" }))
  const detail = view.getByRole("status")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-pace", "1.6")
  expect(root).toHaveAttribute("data-pulsing", "off")
  expect(detail).toHaveTextContent("4.8 km")
  expect(detail.style.transition).toBe("none")
  expect(frames).not.toHaveBeenCalled()
})
