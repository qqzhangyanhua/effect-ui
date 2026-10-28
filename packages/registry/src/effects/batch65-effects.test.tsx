// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { getComponent } from "../catalog"
import { ColorStepRail } from "./color-step-rail"
import { IridescentEdgeCard } from "./iridescent-edge-card"
import { ParticleDialReveal } from "./particle-dial-reveal"
import { ScratchLineField } from "./scratch-line-field"
import { ScrubFogClear } from "./scrub-fog-clear"
import { SwipeActionRow } from "./swipe-action-row"

function installMedia(options: { reduced?: boolean; coarse?: boolean } = {}) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches:
      (options.reduced === true && query.includes("prefers-reduced-motion")) ||
      (options.coarse === true && query.includes("pointer: coarse")),
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

function start(name: string, prop: string) {
  const entry = getComponent(name)
  const found = entry?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(`${name}.${prop}`)
  return found.control.value
}

function box(width: number, height: number): DOMRect {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height,
    toJSON() {
      return {}
    },
  } as DOMRect
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  installMedia()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

test("六个控件的起始值等于组件默认", () => {
  expect(start("color-step-rail", "count")).toBe(8)
  expect(start("color-step-rail", "pace")).toBe(1)
  expect(start("color-step-rail", "format")).toBe("hex")
  expect(start("color-step-rail", "hue")).toBe(262)
  expect(start("scratch-line-field", "threshold")).toBe(0.45)
  expect(start("scratch-line-field", "brush")).toBe(28)
  expect(start("scratch-line-field", "pace")).toBe(1)
  expect(start("swipe-action-row", "threshold")).toBe(0.34)
  expect(start("swipe-action-row", "snap")).toBe(0.85)
  expect(start("swipe-action-row", "pace")).toBe(1)
  expect(start("particle-dial-reveal", "pace")).toBe(1)
  expect(start("particle-dial-reveal", "density")).toBe(64)
  expect(start("particle-dial-reveal", "intensity")).toBe(0.7)
  expect(start("scrub-fog-clear", "blur")).toBe(12)
  expect(start("scrub-fog-clear", "threshold")).toBe(0.4)
  expect(start("scrub-fog-clear", "brush")).toBe(36)
  expect(start("iridescent-edge-card", "intensity")).toBe(0.75)
  expect(start("iridescent-edge-card", "pace")).toBe(1)
  expect(start("iridescent-edge-card", "thickness")).toBe(3)
})

test("色阶可以用方向键步进，并复制当前读数", () => {
  installMedia()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } })
  const onCopy = vi.fn()
  render(<ColorStepRail onCopy={onCopy} />)
  const root = document.querySelector("[data-slot='color-step-rail']")
  expect(screen.getByRole("radiogroup", { name: "色阶" })).toBeInTheDocument()
  const position = screen.getByRole("slider", { name: "当前色阶" })
  expect(root).toHaveAttribute("data-count", "8")
  expect(root).toHaveAttribute("data-format", "hex")
  expect(root).toHaveAttribute("data-hue", "262")
  expect(root).toHaveAttribute("data-state", "idle")
  expect(position).toHaveAttribute("aria-valuenow", "0")
  const first = screen.getAllByRole("radio")[0]
  expect(first).toHaveAttribute("aria-checked", "true")
  fireEvent.keyDown(first as HTMLElement, { key: "ArrowRight" })
  expect(position).toHaveAttribute("aria-valuenow", "1")
  expect(screen.getAllByRole("radio")[1]).toHaveAttribute("aria-checked", "true")
  expect(root).toHaveAttribute("data-state", "active")
  fireEvent.keyDown(screen.getAllByRole("radio")[1] as HTMLElement, { key: "ArrowLeft" })
  expect(position).toHaveAttribute("aria-valuenow", "0")
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  const copied = document.querySelector("[data-value]")?.getAttribute("data-value") ?? ""
  expect(writeText).toHaveBeenCalledWith(copied)
  expect(copied.startsWith("#")).toBe(true)
  expect(onCopy).toHaveBeenCalledWith(copied)
  expect(root).toHaveAttribute("data-state", "copied")
  expect(screen.getByRole("status")).toHaveTextContent("Copied")
})

test("减弱动效时色阶不弹起，复制仍然可用", () => {
  installMedia({ reduced: true })
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } })
  render(<ColorStepRail format="oklch" hue={40} pace={1.4} count={6} />)
  const root = document.querySelector("[data-slot='color-step-rail']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-pop", "off")
  expect(root).toHaveAttribute("data-format", "oklch")
  expect(root).toHaveAttribute("data-count", "6")
  expect(root).toHaveAttribute("data-hue", "40")
  const chip = screen.getAllByRole("radio")[0] as HTMLElement
  expect(chip.style.transform).toBe("none")
  fireEvent.keyDown(chip, { key: "ArrowRight" })
  const next = screen.getAllByRole("radio")[1] as HTMLElement
  expect(next.style.transform).toBe("none")
  expect(document.querySelector("[data-value]")?.getAttribute("data-value")).toContain("oklch(")
  fireEvent.click(screen.getByRole("button", { name: "复制" }))
  expect(writeText).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "copied")
})

test("刮开超过阈值只揭开一次，没超过则保持覆盖", () => {
  installMedia()
  const onReveal = vi.fn()
  const view = render(<ScratchLineField threshold={0.2} brush={64} onReveal={onReveal} />)
  const root = view.container.querySelector("[data-slot='scratch-line-field']")
  expect(root).toHaveAttribute("data-layer", "foil")
  expect(root?.querySelector("[data-fog]")).toBeNull()
  expect(root).toHaveAttribute("data-state", "covered")
  fireEvent.pointerDown(root as Element, { button: 0, pointerId: 1, clientX: 160, clientY: 90 })
  fireEvent.pointerUp(root as Element, { pointerId: 1, clientX: 160, clientY: 90 })
  expect(onReveal).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "revealed")
  fireEvent.pointerDown(root as Element, { button: 0, pointerId: 2, clientX: 40, clientY: 40 })
  fireEvent.keyDown(root as Element, { key: "Enter" })
  expect(onReveal).toHaveBeenCalledTimes(1)
  cleanup()
  installMedia()
  const quiet = vi.fn()
  const held = render(<ScratchLineField threshold={0.9} brush={16} onReveal={quiet} />)
  const covered = held.container.querySelector("[data-slot='scratch-line-field']")
  fireEvent.pointerDown(covered as Element, { button: 0, pointerId: 3, clientX: 20, clientY: 20 })
  fireEvent.pointerUp(covered as Element, { pointerId: 3, clientX: 24, clientY: 20 })
  expect(quiet).not.toHaveBeenCalled()
  expect(covered).toHaveAttribute("data-state", "scratching")
  expect(Number(covered?.getAttribute("data-progress"))).toBeLessThan(0.9)
})

test("减弱动效时刮开改为 Reveal，且只触发一次", () => {
  installMedia({ reduced: true })
  const onReveal = vi.fn()
  render(<ScratchLineField onReveal={onReveal} pace={1.2} />)
  const root = document.querySelector("[data-slot='scratch-line-field']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-pace", "1.2")
  expect(root?.querySelector("[data-foil]")).toBeNull()
  const reveal = screen.getByRole("button", { name: "Reveal" })
  fireEvent.click(reveal)
  expect(onReveal).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "revealed")
  expect(screen.queryByRole("button", { name: "Reveal" })).not.toBeInTheDocument()
})

test("横滑过阈值吸附，没过则回弹，Alt 与 Esc 能开合", () => {
  installMedia()
  const onAction = vi.fn()
  render(<SwipeActionRow onAction={onAction} />)
  const root = document.querySelector("[data-slot='swipe-action-row']")
  const row = document.querySelector("[data-row='draft']") as HTMLElement
  const handle = row.querySelector("[role='group']") as HTMLElement
  expect(root).toHaveAttribute("data-threshold", "0.34")
  expect(root).toHaveAttribute("data-snap", "0.85")
  expect(root).toHaveAttribute("data-reveal", "overlay")
  expect(row).toHaveAttribute("data-state", "rest")
  fireEvent.pointerDown(handle, { button: 0, pointerId: 4, clientX: 40, clientY: 12 })
  fireEvent.pointerMove(handle, { pointerId: 4, clientX: 70, clientY: 12 })
  fireEvent.pointerUp(handle, { pointerId: 4, clientX: 70, clientY: 12 })
  expect(row).toHaveAttribute("data-state", "rest")
  expect(row).toHaveAttribute("data-offset", "0")
  fireEvent.pointerDown(handle, { button: 0, pointerId: 5, clientX: 20, clientY: 12 })
  fireEvent.pointerMove(handle, { pointerId: 5, clientX: 200, clientY: 12 })
  fireEvent.pointerUp(handle, { pointerId: 5, clientX: 200, clientY: 12 })
  expect(row).toHaveAttribute("data-state", "open")
  expect(row).toHaveAttribute("data-side", "left")
  expect(Number(row.getAttribute("data-offset"))).toBeGreaterThan(0)
  fireEvent.keyDown(handle, { key: "Escape" })
  expect(row).toHaveAttribute("data-state", "rest")
  expect(row).toHaveAttribute("data-offset", "0")
  fireEvent.keyDown(handle, { key: "ArrowRight", altKey: true })
  expect(row).toHaveAttribute("data-state", "open")
  expect(row).toHaveAttribute("data-side", "right")
  expect(Number(row.getAttribute("data-offset"))).toBeLessThan(0)
  fireEvent.click(row.querySelector("[data-action='delete']") as Element)
  expect(onAction).toHaveBeenCalledWith("draft", "delete")
  expect(row).toHaveAttribute("data-state", "actioned")
  expect(row.querySelector("[data-action='archive']")).toHaveAttribute("aria-label", "归档 晨间备忘")
})

test("没过阈值且 snap 为 0 时停在松手处", () => {
  installMedia()
  render(<SwipeActionRow snap={0} threshold={0.5} pace={1.4} />)
  const row = document.querySelector("[data-row='draft']") as HTMLElement
  const handle = row.querySelector("[role='group']") as HTMLElement
  fireEvent.pointerDown(handle, { button: 0, pointerId: 6, clientX: 10, clientY: 8 })
  fireEvent.pointerMove(handle, { pointerId: 6, clientX: 40, clientY: 8 })
  fireEvent.pointerUp(handle, { pointerId: 6, clientX: 40, clientY: 8 })
  expect(row).toHaveAttribute("data-state", "rest")
  expect(row).toHaveAttribute("data-offset", "30")
  expect(row).toHaveAttribute("data-side", "none")
})

test("减弱动效时动作按钮常驻，Alt 仍能打开", () => {
  installMedia({ reduced: true })
  render(<SwipeActionRow />)
  const root = document.querySelector("[data-slot='swipe-action-row']")
  const row = document.querySelector("[data-row='draft']") as HTMLElement
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-reveal", "inline")
  expect(screen.getByRole("button", { name: "删除 晨间备忘" })).toBeVisible()
  expect(screen.getByRole("button", { name: "归档 晨间备忘" })).toBeVisible()
  fireEvent.keyDown(row.querySelector("[role='group']") as Element, { key: "ArrowLeft", altKey: true })
  expect(row).toHaveAttribute("data-state", "open")
  expect(row).toHaveAttribute("data-side", "left")
  fireEvent.keyDown(row.querySelector("[role='group']") as Element, { key: "Escape" })
  expect(row).toHaveAttribute("data-state", "rest")
})

test("拨盘是滑块，方向键改值，离开视口不启动粒子帧", () => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1)
  const onValueChange = vi.fn()
  render(<ParticleDialReveal onValueChange={onValueChange} />)
  const root = document.querySelector("[data-slot='particle-dial-reveal']")
  const slider = screen.getByRole("slider", { name: "年龄" })
  expect(root).toHaveAttribute("data-pace", "1")
  expect(root).toHaveAttribute("data-density", "64")
  expect(root).toHaveAttribute("data-intensity", "0.7")
  expect(root).toHaveAttribute("data-particles", "on")
  expect(slider).toHaveAttribute("aria-valuenow", "32")
  expect(slider).toHaveAttribute("aria-valuemin", "18")
  expect(slider).toHaveAttribute("aria-valuemax", "80")
  fireEvent.keyDown(slider, { key: "ArrowRight" })
  expect(slider).toHaveAttribute("aria-valuenow", "33")
  expect(onValueChange).toHaveBeenCalledWith(33)
  fireEvent.keyDown(slider, { key: "Home" })
  expect(slider).toHaveAttribute("aria-valuenow", "18")
  fireEvent.keyDown(slider, { key: "End" })
  expect(slider).toHaveAttribute("aria-valuenow", "80")
  expect(raf).not.toHaveBeenCalled()
})

test("减弱动效时拨盘没有粒子画布", () => {
  installMedia({ reduced: true })
  render(<ParticleDialReveal pace={1.5} density={40} intensity={0.2} />)
  const root = document.querySelector("[data-slot='particle-dial-reveal']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-particles", "off")
  expect(root).toHaveAttribute("data-density", "40")
  expect(root?.querySelector("canvas")).toBeNull()
  expect(screen.getByText("32")).toBeVisible()
  fireEvent.keyDown(screen.getByRole("slider", { name: "年龄" }), { key: "ArrowLeft" })
  expect(screen.getByRole("slider", { name: "年龄" })).toHaveAttribute("aria-valuenow", "31")
  expect(screen.getByText("31")).toBeVisible()
})

test("清雾超过阈值只清除一次，并且不是刮开箔", () => {
  installMedia()
  const onClear = vi.fn()
  const view = render(<ScrubFogClear threshold={0.2} brush={64} blur={10} onClear={onClear} />)
  const root = view.container.querySelector("[data-slot='scrub-fog-clear']")
  expect(root).toHaveAttribute("data-layer", "fog")
  expect(root).toHaveAttribute("data-fog", "on")
  expect(root).toHaveAttribute("data-blur", "10")
  expect(root?.querySelector("[data-foil]")).toBeNull()
  expect(screen.getByText("Scrub to begin")).toBeInTheDocument()
  fireEvent.pointerDown(root as Element, { button: 0, pointerId: 7, clientX: 160, clientY: 90 })
  fireEvent.pointerUp(root as Element, { pointerId: 7, clientX: 160, clientY: 90 })
  expect(onClear).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "clear")
  expect(root).toHaveAttribute("data-fog", "off")
  fireEvent.keyDown(root as Element, { key: "Enter" })
  fireEvent.pointerDown(root as Element, { button: 0, pointerId: 8, clientX: 30, clientY: 30 })
  expect(onClear).toHaveBeenCalledTimes(1)
  cleanup()
  installMedia()
  const quiet = vi.fn()
  const held = render(<ScrubFogClear threshold={0.9} brush={16} onClear={quiet} />)
  const fogged = held.container.querySelector("[data-slot='scrub-fog-clear']")
  fireEvent.pointerDown(fogged as Element, { button: 0, pointerId: 9, clientX: 12, clientY: 12 })
  fireEvent.pointerUp(fogged as Element, { pointerId: 9, clientX: 16, clientY: 12 })
  expect(quiet).not.toHaveBeenCalled()
  expect(fogged).toHaveAttribute("data-state", "scrubbing")
  expect(fogged).toHaveAttribute("data-fog", "on")
})

test("减弱动效时没有雾，Clear 只触发一次", () => {
  installMedia({ reduced: true })
  const onClear = vi.fn()
  render(<ScrubFogClear onClear={onClear} blur={18} />)
  const root = document.querySelector("[data-slot='scrub-fog-clear']")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-fog", "off")
  expect(root).toHaveAttribute("data-blur", "18")
  expect(root?.querySelector("[data-fog]")).toBeNull()
  expect(screen.queryByText("Scrub to begin")).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "Clear" }))
  expect(onClear).toHaveBeenCalledTimes(1)
  expect(root).toHaveAttribute("data-state", "clear")
  expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument()
  fireEvent.keyDown(root as Element, { key: " " })
  expect(onClear).toHaveBeenCalledTimes(1)
})

test("虹彩边跟随指针，离开后停住且不抛错", () => {
  installMedia()
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(box(240, 160))
  render(<IridescentEdgeCard />)
  const card = screen.getByRole("group", { name: "虹彩边卡片" })
  expect(card).toHaveAttribute("data-intensity", "0.75")
  expect(card).toHaveAttribute("data-thickness", "3")
  expect(card).toHaveAttribute("data-edge", "live")
  expect(card).toHaveAttribute("data-content", "still")
  expect(card.querySelector("[data-edge-ring]")).toBeTruthy()
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 220, clientY: 30 })
  expect(card).toHaveAttribute("data-state", "tracking")
  const angle = card.getAttribute("data-angle")
  fireEvent.pointerLeave(card)
  expect(card).toHaveAttribute("data-state", "resting")
  expect(card).toHaveAttribute("data-angle", angle)
  fireEvent.pointerLeave(card)
  expect(card).toHaveAttribute("data-state", "resting")
})

test("减弱动效和粗指针下虹彩边不跟随，聚焦仍有反馈", () => {
  installMedia({ reduced: true })
  render(<IridescentEdgeCard intensity={0.4} thickness={5} pace={1.2} />)
  const card = screen.getByRole("group", { name: "虹彩边卡片" })
  expect(card).toHaveAttribute("data-motion", "off")
  expect(card).toHaveAttribute("data-edge", "static")
  expect(card).toHaveAttribute("data-thickness", "5")
  fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 10, clientY: 10 })
  fireEvent.pointerLeave(card)
  expect(card).toHaveAttribute("data-state", "idle")
  fireEvent.focus(card)
  expect(card).toHaveAttribute("data-state", "focus")
  expect(card.className).toContain("focus-visible:ring-2")
  expect(card.querySelector("[data-edge-ring]")?.className).not.toContain("animate-spin")
  cleanup()
  installMedia({ coarse: true })
  render(<IridescentEdgeCard />)
  const coarse = screen.getByRole("group", { name: "虹彩边卡片" })
  expect(coarse).toHaveAttribute("data-edge", "static")
  expect(() => {
    fireEvent.pointerMove(coarse, { pointerType: "touch", clientX: 4, clientY: 4 })
    fireEvent.pointerLeave(coarse)
    fireEvent.pointerCancel(coarse)
  }).not.toThrow()
  expect(coarse).toHaveAttribute("data-state", "idle")
})
