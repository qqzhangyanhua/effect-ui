// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { driftOffset, driftTravel, FolioDriftPlane, folioFromPointer } from "./folio-drift-plane"
import { fadeFrames, LedgeChapterChip, ledgeIndex, ledgeProgress, stepFade } from "./ledge-chapter-chip"
import {
  MarginBookmarkNotch,
  nearestStop,
  notchFromPointer,
  notchSize,
  passageAt,
  stepStop,
} from "./margin-bookmark-notch"
import { chapterAt, chapterMark, inkThickness, MarginInkProgress, tickCountOf } from "./margin-ink-progress"
import { riseDistance, riseShift, StanzaRiseEnter, stanzaGate } from "./stanza-rise-enter"
import { hiddenOpacity, lineCountOf, VerseCascadeReveal, verseGate, verseOpacity } from "./verse-cascade-reveal"

const SLUGS = [
  "stanza-rise-enter",
  "folio-drift-plane",
  "margin-ink-progress",
  "verse-cascade-reveal",
  "ledge-chapter-chip",
  "margin-bookmark-notch",
] as const

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

let emitView: (on: boolean) => void = () => {}

class ToggleObserver {
  constructor(callback: IntersectionObserverCallback) {
    emitView = (on: boolean) => {
      callback(
        [{ isIntersecting: on, intersectionRatio: on ? 1 : 0, target: document.documentElement } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      )
    }
  }

  observe() {
    emitView(true)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

const queued = new Map<number, FrameRequestCallback>()
let nextFrame = 1

function installFrames() {
  queued.clear()
  nextFrame = 1
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrame
    nextFrame += 1
    queued.set(id, callback)
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    queued.delete(id)
  })
}

function drain(frames: number) {
  for (let index = 0; index < frames; index += 1) {
    const batch = [...queued.values()]
    queued.clear()
    if (batch.length === 0) return
    for (const callback of batch) callback(0)
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

function start(name: string, prop: string) {
  const found = getComponent(name)?.props.find((item) => item.name === prop)
  if (!found?.control || !("value" in found.control)) throw new Error(`${name}.${prop}`)
  return found.control.value
}

function rootOf(container: HTMLElement, slot: string) {
  const node = container.querySelector(`[data-slot='${slot}']`)
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${slot}`)
  return node
}

beforeEach(() => {
  installMedia()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  installFrames()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("六个 slug 都是 batch 84，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(84)
    expect(entry?.layer).toBe("effect")
    expect(entry?.effectCategory).toBe("showcase")
    expect(entry?.source).toBe("original")
    expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
    expect(auditExemptions.some((item) => item.name === name)).toBe(false)
    const preset = entry?.presets?.find((item) => item.name === "default")
    expect(preset?.values.pace).toBe(1)
    for (const prop of entry?.props ?? []) {
      if (!prop.control || !("value" in prop.control)) continue
      expect(preset?.values[prop.name]).toBe(prop.control.value)
    }
  }
  expect(start("stanza-rise-enter", "intensity")).toBe(0.32)
  expect(start("stanza-rise-enter", "stagger")).toBe(true)
  expect(start("stanza-rise-enter", "threshold")).toBe(0.4)
  expect(start("folio-drift-plane", "planeOpacity")).toBe(0.38)
  expect(start("folio-drift-plane", "axis")).toBe("y")
  expect(start("margin-ink-progress", "ticks")).toBe(4)
  expect(start("margin-ink-progress", "side")).toBe("start")
  expect(start("verse-cascade-reveal", "cascadeGap")).toBe(0.45)
  expect(start("verse-cascade-reveal", "lines")).toBe(5)
  expect(start("ledge-chapter-chip", "showToc")).toBe(true)
  expect(start("ledge-chapter-chip", "ledgeAlign")).toBe("start")
  expect(start("margin-bookmark-notch", "snapNotches")).toBe(4)
  expect(start("margin-bookmark-notch", "side")).toBe("end")
})

test("章节块越过阈值后升起并落稳，正文保持可读", () => {
  expect(stanzaGate(0, 0.4)).toBe(0)
  expect(stanzaGate(1, 0.4)).toBeCloseTo(0.34)
  expect(riseDistance(0.32)).toBeLessThan(14)
  expect(riseShift(1, 0.32)).toBe(0)
  const onValueChange = vi.fn()
  const view = render(<StanzaRiseEnter onValueChange={onValueChange} className="extra-stanza" />)
  const root = rootOf(view.container, "stanza-rise-enter")
  const column = view.getByRole("region", { name: "Reading column" })
  expect(root).toHaveAttribute("data-ritual", "stanza-rise")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-stagger", "on")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("extra-stanza")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(column.className).toContain("focus-visible:ring-2")
  const opening = view.getByLabelText("Opening")
  const middle = view.getByLabelText("Middle")
  expect(opening).toHaveAttribute("data-pose", "settled")
  expect(opening).toHaveAttribute("data-amount", "1.000")
  expect(middle).toHaveAttribute("data-pose", "waiting")
  expect(view.getByText("The next stanza waits below until the column advances a short step.")).toBeInTheDocument()
  fireEvent.keyDown(column, { key: "PageDown" })
  expect(root).toHaveAttribute("data-progress", "0.360")
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(30))
  expect(middle).toHaveAttribute("data-pose", "settled")
  expect(middle).toHaveAttribute("data-amount", "1.000")
  expect(middle).toHaveAttribute("data-shift", "0.0")
  expect(view.getByLabelText("Close")).toHaveAttribute("data-pose", "waiting")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(middle, { key: "Enter" })
  expect(middle).toHaveAttribute("data-pose", "rising")
  act(() => drain(30))
  expect(middle).toHaveAttribute("data-pose", "settled")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.container.textContent).not.toMatch(/slack|oryzo|glide|apple|amazon/i)
  expect(onValueChange).toHaveBeenCalled()
})

test("错峰会让后一节晚一点动，离开视口落到已入位，减弱动效没有升起帧", async () => {
  const staggered = render(<StanzaRiseEnter />)
  fireEvent.keyDown(staggered.getByRole("region", { name: "Reading column" }), { key: "End" })
  act(() => drain(5))
  expect(Number(staggered.getByLabelText("Middle").getAttribute("data-amount"))).toBeGreaterThan(0)
  expect(staggered.getByLabelText("Close")).toHaveAttribute("data-amount", "0.000")
  cleanup()

  const together = render(<StanzaRiseEnter stagger={false} />)
  fireEvent.keyDown(together.getByRole("region", { name: "Reading column" }), { key: "End" })
  act(() => drain(1))
  expect(Number(together.getByLabelText("Middle").getAttribute("data-amount"))).toBeGreaterThan(0)
  expect(Number(together.getByLabelText("Close").getAttribute("data-amount"))).toBeGreaterThan(0)
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<StanzaRiseEnter />)
  const root = rootOf(view.container, "stanza-rise-enter")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("region", { name: "Reading column" }), { key: "PageDown" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(view.getByLabelText("Middle")).toHaveAttribute("data-pose", "settled")
  expect(view.getByLabelText("Close")).toHaveAttribute("data-pose", "waiting")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<StanzaRiseEnter threshold={0.25} />)
  const quiet = rootOf(still.container, "stanza-rise-enter")
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.keyDown(still.getByRole("region", { name: "Reading column" }), { key: "PageDown" })
  expect(still.getByLabelText("Middle")).toHaveAttribute("data-pose", "settled")
  expect(still.getByLabelText("Middle")).toHaveAttribute("data-amount", "1.000")
  expect(queued.size).toBe(0)
})

test("正文层不位移，装饰面只做很小的漂移", () => {
  expect(driftTravel(0.22)).toBeLessThan(8)
  expect(Math.abs(driftOffset(0, 1))).toBeLessThanOrEqual(driftTravel(1))
  expect(folioFromPointer(56, 100, 0)).toBeCloseTo(0.2)
  const view = render(<FolioDriftPlane className="extra-folio" />)
  const root = rootOf(view.container, "folio-drift-plane")
  const folio = view.container.querySelector("[data-folio]")
  const plane = view.container.querySelector("[data-plane]")
  const region = view.getByRole("region", { name: "Reading folio" })
  expect(root).toHaveAttribute("data-ritual", "folio-drift")
  expect(root).toHaveAttribute("data-folio-shift", "0")
  expect(root).toHaveAttribute("data-plane-shift", "-5.2")
  expect(root).toHaveAttribute("data-axis", "y")
  expect(root.className).toContain("extra-folio")
  expect(region.className).toContain("focus-visible:ring-2")
  expect(folio).toHaveStyle({ transform: "none" })
  expect(folio).toHaveAttribute("data-shift", "0")
  expect(plane).toHaveAttribute("aria-hidden", "true")
  expect(plane?.contains(folio ?? null)).toBe(false)
  expect(view.getByText(/fixed passage stays readable/)).toBeInTheDocument()
  fireEvent.keyDown(region, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-progress", "0.080")
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-plane-shift", "-4.4")
  expect(root).toHaveAttribute("data-folio-shift", "0")
  expect(queued.size).toBe(0)
  fireEvent.pointerDown(region, { button: 0, pointerId: 4, clientY: 100 })
  fireEvent.pointerMove(region, { button: 0, pointerId: 4, clientY: 56 })
  expect(root).toHaveAttribute("data-progress", "0.280")
  expect(view.container.textContent).not.toMatch(/gitbook|dialpad|airtable/i)
})

test("装饰面离开视口留在最后一帧，减弱动效停在中位", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<FolioDriftPlane />)
  const root = rootOf(view.container, "folio-drift-plane")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("region", { name: "Reading folio" }), { key: "End" })
  act(() => drain(1))
  const frozen = root.getAttribute("data-plane-shift")
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-plane-shift", frozen)
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-folio-shift", "0")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<FolioDriftPlane axis="x" planeOpacity={0.5} />)
  const quiet = rootOf(still.container, "folio-drift-plane")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-axis", "x")
  expect(quiet).toHaveAttribute("data-plane-shift", "0.0")
  fireEvent.keyDown(still.getByRole("region", { name: "Reading folio" }), { key: "ArrowDown" })
  fireEvent.keyDown(still.getByRole("region", { name: "Reading folio" }), { key: "End" })
  expect(quiet).toHaveAttribute("data-progress", "1.000")
  expect(quiet).toHaveAttribute("data-plane-shift", "0.0")
  expect(queued.size).toBe(0)
})

test("墨迹轨跟随阅读进度，刻度可以跳节", () => {
  expect(tickCountOf(9)).toBe(6)
  expect(tickCountOf(1)).toBe(3)
  expect(chapterAt(0.5, 4)).toBe(2)
  expect(chapterMark(1, 4)).toBe(0.333)
  expect(inkThickness(0.35)).toBeLessThan(8)
  const view = render(<MarginInkProgress className="extra-ink" />)
  const root = rootOf(view.container, "margin-ink-progress")
  const passage = view.getByRole("region", { name: "Reading passage" })
  expect(root).toHaveAttribute("data-ritual", "margin-ink")
  expect(root).toHaveAttribute("data-ticks", "4")
  expect(root).toHaveAttribute("data-side", "start")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-ink", "0.000")
  expect(root.className).toContain("extra-ink")
  expect(passage.className).toContain("focus-visible:ring-2")
  expect(view.getByRole("progressbar", { name: "Reading progress" })).toBeInTheDocument()
  fireEvent.keyDown(passage, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-progress", "0.040")
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(16))
  expect(root).toHaveAttribute("data-ink", "0.040")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(passage, { key: "]" })
  expect(root).toHaveAttribute("data-progress", "0.333")
  expect(root).toHaveAttribute("data-chapter", "1")
  fireEvent.click(view.getByRole("button", { name: "Margin note" }))
  expect(root).toHaveAttribute("data-chapter", "2")
  expect(root).toHaveAttribute("data-progress", "0.667")
  fireEvent.keyDown(passage, { key: "1" })
  expect(root).toHaveAttribute("data-chapter", "0")
  fireEvent.keyDown(passage, { key: "Home" })
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(view.getByText("Tick marks sit on the rail so a chapter can be opened directly.")).toBeInTheDocument()
  expect(view.container.textContent).not.toMatch(/codecademy|amazon|turo/i)
})

test("墨迹离开视口落到当前进度，减弱动效没有插值", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MarginInkProgress />)
  const root = rootOf(view.container, "margin-ink-progress")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("region", { name: "Reading passage" }), { key: "ArrowDown" })
  act(() => drain(1))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root.getAttribute("data-ink")).toBe(root.getAttribute("data-progress"))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<MarginInkProgress side="end" ticks={3} />)
  const quiet = rootOf(still.container, "margin-ink-progress")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-side", "end")
  expect(quiet).toHaveAttribute("data-ticks", "3")
  fireEvent.keyDown(still.getByRole("region", { name: "Reading passage" }), { key: "]" })
  expect(quiet).toHaveAttribute("data-progress", "0.500")
  expect(quiet).toHaveAttribute("data-ink", "0.500")
  expect(quiet).toHaveAttribute("data-chapter", "1")
  expect(queued.size).toBe(0)
})

test("诗行越过阈值后逐段显现，Enter 瞬时全显，Reset 收回", () => {
  expect(lineCountOf(8)).toBe(6)
  expect(verseGate(0, 0.45)).toBe(0)
  expect(verseGate(1, 0.45)).toBeCloseTo(0.154)
  expect(hiddenOpacity(0.45)).toBeGreaterThan(0.4)
  expect(verseOpacity(0, 0.45)).toBeGreaterThan(0.4)
  expect(verseOpacity(1, 0.45)).toBe(1)
  const view = render(<VerseCascadeReveal className="extra-verse" />)
  const root = rootOf(view.container, "verse-cascade-reveal")
  const column = view.getByRole("region", { name: "Verse column" })
  const first = view.container.querySelector("[data-verse='v1']")
  const second = view.container.querySelector("[data-verse='v2']")
  expect(root).toHaveAttribute("data-ritual", "verse-cascade")
  expect(root).toHaveAttribute("data-lines", "5")
  expect(root).toHaveAttribute("data-revealed", "1")
  expect(root.className).toContain("extra-verse")
  expect(column.className).toContain("focus-visible:ring-2")
  expect(first).toHaveAttribute("data-amount", "1.000")
  expect(second).toHaveAttribute("data-amount", "0.000")
  fireEvent.keyDown(column, { key: "PageDown" })
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => drain(24))
  expect(second).toHaveAttribute("data-amount", "1.000")
  expect(Number(root.getAttribute("data-revealed"))).toBeGreaterThanOrEqual(2)
  expect(queued.size).toBe(0)
  fireEvent.keyDown(column, { key: "Enter" })
  expect(root).toHaveAttribute("data-progress", "1.000")
  expect(root).toHaveAttribute("data-revealed", "5")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(column, { key: "r" })
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root).toHaveAttribute("data-revealed", "1")
  expect(second).toHaveAttribute("data-amount", "0.000")
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-revealed", "1")
  expect(view.container.textContent).not.toMatch(/craft|chronicle|podia/i)
})

test("诗行离开视口保持已显现的静帧，减弱动效没有 cascade", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<VerseCascadeReveal />)
  const root = rootOf(view.container, "verse-cascade-reveal")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("region", { name: "Verse column" }), { key: "PageDown" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(view.container.querySelector("[data-verse='v2']")).toHaveAttribute("data-amount", "1.000")
  expect(view.container.querySelector("[data-verse='v6']")).toBeNull()
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<VerseCascadeReveal lines={3} />)
  const quiet = rootOf(still.container, "verse-cascade-reveal")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-lines", "3")
  fireEvent.keyDown(still.getByRole("region", { name: "Verse column" }), { key: "PageDown" })
  expect(still.container.querySelector("[data-verse='v2']")).toHaveAttribute("data-amount", "1.000")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(still.getByRole("region", { name: "Verse column" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-revealed", "3")
  expect(queued.size).toBe(0)
})

test("窄 ledge 上的章节 chip 随阅读切换，目录可键盘跳转", () => {
  expect(ledgeIndex(0.28)).toBe(1)
  expect(ledgeProgress(1)).toBe(0.375)
  expect(fadeFrames(1)).toBe(8)
  expect(stepFade(1, "out", 1).phase).toBe("out")
  const view = render(<LedgeChapterChip className="extra-ledge" />)
  const root = rootOf(view.container, "ledge-chapter-chip")
  const chip = view.getByRole("button", { name: "Chapter 1" })
  expect(root).toHaveAttribute("data-ritual", "ledge-chip")
  expect(root).toHaveAttribute("data-chapter", "0")
  expect(root).toHaveAttribute("data-label", "Chapter 1")
  expect(root).toHaveAttribute("data-toc", "closed")
  expect(root).toHaveAttribute("data-align", "start")
  expect(root.className).toContain("extra-ledge")
  expect(chip.className).toContain("focus-visible:ring-2")
  expect(view.getByText("Opening paragraphs sit under a narrow ledge that names the chapter.")).toBeInTheDocument()
  fireEvent.keyDown(chip, { key: "PageDown" })
  expect(root).toHaveAttribute("data-chapter", "1")
  expect(root).toHaveAttribute("data-playing", "on")
  expect(root).toHaveAttribute("data-label", "Chapter 1")
  act(() => drain(24))
  expect(root).toHaveAttribute("data-label", "Chapter 2")
  expect(root).toHaveAttribute("data-fade", "1.000")
  expect(root).toHaveAttribute("data-phase", "steady")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(view.getByRole("button", { name: "Chapter 2" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-toc", "open")
  const option = view.getByRole("option", { name: "Chapter 4" })
  fireEvent.keyDown(option, { key: "Enter" })
  expect(root).toHaveAttribute("data-chapter", "3")
  expect(root).toHaveAttribute("data-toc", "closed")
  act(() => drain(24))
  fireEvent.keyDown(view.getByRole("button", { name: "Chapter 4" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-toc", "open")
  fireEvent.keyDown(view.getByRole("option", { name: "Chapter 3" }), { key: "Escape" })
  expect(root).toHaveAttribute("data-toc", "closed")
  expect(view.container.textContent).not.toMatch(/blinkist|apple books|cvs/i)
})

test("章节 chip 离开视口保留标签，减弱动效瞬时切换，关闭目录时不打开", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<LedgeChapterChip />)
  const root = rootOf(view.container, "ledge-chapter-chip")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("button", { name: "Chapter 1" }), { key: "PageDown" })
  act(() => drain(2))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-label", "Chapter 2")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<LedgeChapterChip showToc={false} ledgeAlign="center" />)
  const quiet = rootOf(still.container, "ledge-chapter-chip")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-align", "center")
  fireEvent.keyDown(still.getByRole("button", { name: "Chapter 1" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-toc", "closed")
  expect(still.queryByRole("listbox")).toBeNull()
  fireEvent.keyDown(still.getByRole("button", { name: "Chapter 1" }), { key: "PageDown" })
  expect(quiet).toHaveAttribute("data-chapter", "1")
  expect(quiet).toHaveAttribute("data-label", "Chapter 2")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})

test("页边书签凹口可键盘跳转、拖动吸附，并聚焦对应段落", () => {
  expect(notchSize(0.32)).toBeLessThan(20)
  expect(stepStop(0, 4, 1)).toBe(0.333)
  expect(nearestStop(0.5, 4)).toBe(0.333)
  expect(passageAt(0.333)).toBe(1)
  expect(notchFromPointer(120, { top: 0, height: 0 })).toBe(0.5)
  const onValueChange = vi.fn()
  const view = render(<MarginBookmarkNotch onValueChange={onValueChange} className="extra-notch" />)
  const root = rootOf(view.container, "margin-bookmark-notch")
  const notch = view.getByRole("slider", { name: "Reading bookmark" })
  expect(root).toHaveAttribute("data-ritual", "bookmark-notch")
  expect(root).toHaveAttribute("data-snap", "4")
  expect(root).toHaveAttribute("data-side", "end")
  expect(root).toHaveAttribute("data-notch", "0")
  expect(root).toHaveAttribute("data-progress", "0.000")
  expect(root.className).toContain("extra-notch")
  expect(notch.className).toContain("focus-visible:ring-2")
  fireEvent.keyDown(notch, { key: "ArrowDown" })
  expect(root).toHaveAttribute("data-progress", "0.333")
  expect(root).toHaveAttribute("data-playing", "on")
  expect(root).toHaveAttribute("data-shown", "0.000")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-shown", "0.333")
  expect(root).toHaveAttribute("data-notch", "1")
  expect(root).toHaveAttribute("data-passage", "b2")
  expect(queued.size).toBe(0)
  fireEvent.keyDown(notch, { key: "Enter" })
  expect(view.getByText("The notch can rest beside this passage.").closest("article")).toHaveFocus()
  fireEvent.pointerDown(notch, { button: 0, pointerId: 7, clientY: 120 })
  expect(root).toHaveAttribute("data-dragging", "on")
  expect(root).toHaveAttribute("data-progress", "0.500")
  fireEvent.pointerUp(notch, { button: 0, pointerId: 7, clientY: 120 })
  expect(root).toHaveAttribute("data-dragging", "off")
  expect(root).toHaveAttribute("data-progress", "0.333")
  act(() => drain(20))
  expect(root).toHaveAttribute("data-shown", "0.333")
  expect(queued.size).toBe(0)
  expect(view.container.textContent).not.toMatch(/fable|skiff|whop/i)
  expect(onValueChange).toHaveBeenCalled()
})

test("书签离开视口停在凹口，减弱动效瞬时跳转，自由跟随不吸附", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MarginBookmarkNotch />)
  const root = rootOf(view.container, "margin-bookmark-notch")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  fireEvent.keyDown(view.getByRole("slider", { name: "Reading bookmark" }), { key: "ArrowDown" })
  act(() => drain(1))
  expect(root).toHaveAttribute("data-playing", "on")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-progress", "0.333")
  expect(root).toHaveAttribute("data-shown", "0.333")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-dragging", "off")
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<MarginBookmarkNotch snapNotches={0} side="start" />)
  const quiet = rootOf(still.container, "margin-bookmark-notch")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-side", "start")
  expect(quiet).toHaveAttribute("data-notch", "free")
  fireEvent.keyDown(still.getByRole("slider", { name: "Reading bookmark" }), { key: "ArrowDown" })
  expect(quiet).toHaveAttribute("data-progress", "0.060")
  expect(quiet).toHaveAttribute("data-shown", "0.060")
  fireEvent.keyDown(still.getByRole("slider", { name: "Reading bookmark" }), { key: "End" })
  expect(quiet).toHaveAttribute("data-progress", "1.000")
  expect(quiet).toHaveAttribute("data-shown", "1.000")
  expect(queued.size).toBe(0)
})
