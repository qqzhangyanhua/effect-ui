// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { CiteHandleMark, inkAlpha, visibleHandleCount } from "./cite-handle-mark"
import { HunkDeltaBar, hunkSummary, hunkTone } from "./hunk-delta-bar"
import { MarginNotePop } from "./margin-note-pop"
import { nudgeCount, QuietNudgePill } from "./quiet-nudge-pill"
import { advanceStates, initialBeadStates, pathFill, SignoffBeadPath } from "./signoff-bead-path"
import { leanHold, VerdictLaneSlide, verdictFromHold, verdictThreshold } from "./verdict-lane-slide"

const SLUGS = [
  "margin-note-pop",
  "verdict-lane-slide",
  "cite-handle-mark",
  "hunk-delta-bar",
  "signoff-bead-path",
  "quiet-nudge-pill",
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

test("六个 slug 都是 batch 82，控件起始值等于默认，且不在豁免名单", () => {
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(82)
    expect(entry?.layer).toBe("effect")
    expect(entry?.source).toBe("original")
    expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
    expect(auditExemptions.some((item) => item.name === name)).toBe(false)
    const preset = entry?.presets?.find((item) => item.name === "default")
    expect(preset?.values.pace).toBe(1)
  }
  expect(start("margin-note-pop", "pace")).toBe(1)
  expect(start("margin-note-pop", "intensity")).toBe(0.7)
  expect(start("margin-note-pop", "oneOpen")).toBe(true)
  expect(start("margin-note-pop", "side")).toBe("end")
  expect(start("verdict-lane-slide", "intensity")).toBe(0.4)
  expect(start("verdict-lane-slide", "threshold")).toBe(0.65)
  expect(start("verdict-lane-slide", "showLabels")).toBe(true)
  expect(start("cite-handle-mark", "count")).toBe(4)
  expect(start("cite-handle-mark", "cycle")).toBe(false)
  expect(start("hunk-delta-bar", "showLabels")).toBe(true)
  expect(start("hunk-delta-bar", "compact")).toBe(false)
  expect(start("signoff-bead-path", "showChecks")).toBe(true)
  expect(start("signoff-bead-path", "count")).toBe(4)
  expect(start("signoff-bead-path", "advanceOnEnter")).toBe(false)
  expect(start("quiet-nudge-pill", "intensity")).toBe(0.3)
  expect(start("quiet-nudge-pill", "count")).toBe(1)
  expect(start("quiet-nudge-pill", "autoBreathe")).toBe(true)
})

test("边距锚点展开批注且不盖住正文", () => {
  const onValueChange = vi.fn()
  const view = render(<MarginNotePop onValueChange={onValueChange} className="extra-note" />)
  const root = rootOf(view.container, "margin-note-pop")
  expect(root).toHaveAttribute("data-ritual", "margin-note")
  expect(root).toHaveAttribute("data-side", "end")
  expect(root).toHaveAttribute("data-one", "on")
  expect(root).toHaveAttribute("data-open", "none")
  expect(root).toHaveAttribute("data-motion", "on")
  expect(root.className).toContain("bg-card")
  expect(root.className).toContain("extra-note")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(root).not.toHaveAttribute("tabindex")
  expect(view.getByRole("button", { name: "AL note" }).className).toContain("focus-visible:ring-2")
  const body = view.getByText(/scan the claim/)
  expect(body.className).toContain("text-foreground")
  fireEvent.click(view.getByRole("button", { name: "AL note" }))
  const note = view.getByText("Tighten the opening clause.")
  expect(note).toBeInTheDocument()
  expect(body).toBeInTheDocument()
  const noteCard = root.querySelector("[data-note='al']")
  expect(noteCard).toBeTruthy()
  expect(body.contains(noteCard)).toBe(false)
  expect(root.querySelector("[data-margin]")?.contains(noteCard ?? null)).toBe(true)
  expect(root).toHaveAttribute("data-open", "al")
  fireEvent.click(view.getByRole("button", { name: "MK note" }))
  expect(root).toHaveAttribute("data-open", "mk")
  expect(view.queryByText("Tighten the opening clause.")).toBeNull()
  expect(view.getByText("This sentence can stay.")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-active", "2")
  expect(view.getByText("Name the figure in the caption.")).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "Escape" })
  expect(root).toHaveAttribute("data-open", "none")
  expect(view.getByText(/scan the claim/)).toBeInTheDocument()
  expect(root.innerHTML).not.toMatch(/animate-bounce|animate-ping|neon/)
  expect(view.queryByText(/dovetail|fabric|sticky/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("可以同时展开两张边距批注，行首列也能放下锚点", () => {
  const view = render(<MarginNotePop oneOpen={false} side="start" />)
  const root = rootOf(view.container, "margin-note-pop")
  expect(root).toHaveAttribute("data-one", "off")
  expect(root).toHaveAttribute("data-side", "start")
  fireEvent.click(view.getByRole("button", { name: "AL note" }))
  fireEvent.click(view.getByRole("button", { name: "JR note" }))
  expect(root).toHaveAttribute("data-open", "al,jr")
  expect(root.querySelector("[data-note='al']")).toBeInTheDocument()
  expect(root.querySelector("[data-note='jr']")).toBeInTheDocument()
  const grid = root.querySelector(".grid")
  expect(grid?.firstElementChild).toHaveAttribute("data-margin")
})

test("边距锚点离开视口后停止呼吸，减弱动效瞬时展开", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MarginNotePop />)
  const root = rootOf(view.container, "margin-note-pop")
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-breath"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-breath"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-breath")
  act(() => drain(3))
  expect(root.getAttribute("data-breath")).toBe(frozen)

  cleanup()
  installMedia({ reduced: true })
  const still = render(<MarginNotePop />)
  const quiet = rootOf(still.container, "margin-note-pop")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.keyDown(quiet, { key: "Enter" })
  expect(quiet).toHaveAttribute("data-open", "al")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
})

test("裁决轨点选与拖柄吸附，键盘只确认倾向", () => {
  expect(verdictThreshold(0.2)).toBe(0.55)
  expect(verdictThreshold(0.9)).toBe(0.75)
  expect(verdictFromHold(-0.61, 0.65)).toBe("pending")
  expect(verdictFromHold(-0.7, 0.65)).toBe("approve")
  expect(verdictFromHold(0.8, 0.65)).toBe("reject")
  expect(leanHold(-1, 0.65)).toBe(-0.61)
  const onValueChange = vi.fn()
  const view = render(<VerdictLaneSlide onValueChange={onValueChange} className="extra-lane" />)
  const root = rootOf(view.container, "verdict-lane-slide")
  expect(root).toHaveAttribute("data-ritual", "verdict-lane")
  expect(root).toHaveAttribute("data-verdict", "pending")
  expect(root).toHaveAttribute("data-hold", "0.00")
  expect(root).toHaveAttribute("data-threshold", "0.65")
  expect(root.className).toContain("extra-lane")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(view.getByRole("slider", { name: "Verdict handle" }).className).toContain("focus-visible:ring-2")
  const track = root.querySelector("[data-track]")
  const aside = view.getByText(/Drag the handle/)
  expect(track?.contains(aside)).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Agree" }))
  expect(root).toHaveAttribute("data-verdict", "approve")
  expect(root).toHaveAttribute("data-hold", "-1.00")
  fireEvent.click(view.getByRole("button", { name: "Decline" }))
  expect(root).toHaveAttribute("data-verdict", "reject")
  fireEvent.click(view.getByRole("button", { name: "Hold" }))
  expect(root).toHaveAttribute("data-verdict", "pending")
  fireEvent.keyDown(root, { key: "ArrowLeft" })
  expect(root).toHaveAttribute("data-verdict", "pending")
  expect(root).toHaveAttribute("data-hold", "-0.61")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-verdict", "approve")
  expect(root).toHaveAttribute("data-hold", "-1.00")
  fireEvent.keyDown(root, { key: "ArrowRight" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-verdict", "reject")
  fireEvent.keyDown(root, { key: "Home" })
  expect(root).toHaveAttribute("data-verdict", "pending")
  fireEvent.keyDown(root, { key: "Backspace" })
  expect(root).toHaveAttribute("data-hold", "0.00")
  const handle = view.getByRole("slider", { name: "Verdict handle" })
  fireEvent.pointerDown(handle, { clientX: 20, button: 0, pointerId: 7 })
  fireEvent.pointerMove(handle, { clientX: 250, button: 0, pointerId: 7 })
  fireEvent.pointerUp(handle, { clientX: 250, button: 0, pointerId: 7 })
  expect(root).toHaveAttribute("data-verdict", "reject")
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon|firework/)
  expect(view.queryByText(/whop|juicebox|mercury/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("裁决轨减弱动效瞬时切换，标签可以隐藏", () => {
  installMedia({ reduced: true })
  const view = render(<VerdictLaneSlide showLabels={false} />)
  const root = rootOf(view.container, "verdict-lane-slide")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(root).toHaveAttribute("data-labels", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  fireEvent.click(view.getByRole("button", { name: "Agree" }))
  expect(root).toHaveAttribute("data-verdict", "approve")
  expect(queued.size).toBe(0)
})

test("句内提及可轮询并锁定，墨渍不盖住其余正文", () => {
  expect(visibleHandleCount(9)).toBe(5)
  expect(visibleHandleCount(1)).toBe(2)
  expect(inkAlpha(0, true)).toBe(16)
  expect(inkAlpha(1, false)).toBe(14)
  const view = render(<CiteHandleMark className="extra-cite" />)
  const root = rootOf(view.container, "cite-handle-mark")
  expect(root).toHaveAttribute("data-ritual", "cite-handle")
  expect(root).toHaveAttribute("data-count", "4")
  expect(root).toHaveAttribute("data-cycle", "off")
  expect(root).toHaveAttribute("data-active", "0")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root.className).toContain("extra-cite")
  expect(view.getByRole("button", { name: "Mention ada" }).className).toContain("text-foreground")
  expect(view.getByRole("button", { name: "Mention ada" }).className).toContain("focus-visible:ring-2")
  expect(view.queryByRole("button", { name: "Mention kai" })).toBeNull()
  expect(view.getByText(/review the paragraph/)).toBeInTheDocument()
  fireEvent.click(view.getByRole("button", { name: "Mention milo" }))
  expect(root).toHaveAttribute("data-active", "1")
  expect(root).toHaveAttribute("data-handle", "milo")
  expect(view.getByText(/milo · Reviewer/)).toBeInTheDocument()
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-handle", "june")
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "on")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon|rainbow/)
  expect(view.queryByText(/docusign|clickup|textarea/i)).toBeNull()
})

test("提及数可以收成两个，自动轮询离开视口后停止", async () => {
  const fewer = render(<CiteHandleMark count={2} />)
  expect(rootOf(fewer.container, "cite-handle-mark")).toHaveAttribute("data-count", "2")
  expect(fewer.queryByRole("button", { name: "Mention june" })).toBeNull()
  cleanup()

  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<CiteHandleMark cycle />)
  const root = rootOf(view.container, "cite-handle-mark")
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  act(() => drain(30))
  expect(root.getAttribute("data-active")).not.toBe("0")
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-active")
  act(() => drain(8))
  expect(root.getAttribute("data-active")).toBe(frozen)
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-locked", "on")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<CiteHandleMark cycle />)
  const quiet = rootOf(still.container, "cite-handle-mark")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-cycle", "off")
  expect(quiet).toHaveAttribute("data-playing", "off")
  fireEvent.click(still.getByRole("button", { name: "Mention ren" }))
  expect(quiet).toHaveAttribute("data-handle", "ren")
  expect(queued.size).toBe(0)
})

test("窄条切换 hunk 时上下文保持可读", () => {
  expect(hunkSummary({ id: "guard", kind: "add", weight: 2, label: "Guard the import", add: 4, del: 0 })).toBe(
    "+4 -0 Guard the import",
  )
  expect(hunkTone("add", 0.5, true)).toContain("color-mix")
  expect(hunkTone("mix", 0.5, false)).toContain("linear-gradient")
  const view = render(<HunkDeltaBar className="extra-hunk" />)
  const root = rootOf(view.container, "hunk-delta-bar")
  expect(root).toHaveAttribute("data-ritual", "hunk-delta")
  expect(root).toHaveAttribute("data-active", "0")
  expect(root).toHaveAttribute("data-labels", "on")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root.className).toContain("extra-hunk")
  const context = root.querySelector("[data-context]")
  expect(context?.textContent).toContain("const limit = 4")
  expect(context?.className).toContain("text-foreground")
  expect(view.getByText("+4 -0 Guard the import")).toBeInTheDocument()
  expect(context?.contains(view.getByText("+4 -0 Guard the import"))).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Drop the helper" }))
  expect(root).toHaveAttribute("data-active", "1")
  expect(view.getByText("+0 -3 Drop the helper")).toBeInTheDocument()
  expect(context?.textContent).toContain("return items.slice")
  fireEvent.keyDown(root, { key: "ArrowDown" })
  fireEvent.keyDown(root, { key: "Enter" })
  expect(root).toHaveAttribute("data-active", "2")
  expect(root).toHaveAttribute("data-locked", "on")
  expect(view.getByText("+2 -2 Rename the field")).toBeInTheDocument()
  expect(view.getByRole("button", { name: "Guard the import" }).className).toContain("focus-visible:ring-2")
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon/)
  expect(view.queryByText(/mintlify|grammarly|devin/i)).toBeNull()
})

test("hunk 可以隐藏数字并缩短，减弱动效瞬时切换", () => {
  installMedia({ reduced: true })
  const view = render(<HunkDeltaBar showLabels={false} compact />)
  const root = rootOf(view.container, "hunk-delta-bar")
  expect(root).toHaveAttribute("data-labels", "off")
  expect(root).toHaveAttribute("data-compact", "on")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-ease", "0")
  expect(view.queryByText("+4 -0")).toBeNull()
  fireEvent.keyDown(root, { key: "End" })
  expect(root).toHaveAttribute("data-active", "3")
  expect(view.getByText("const limit = 4")).toBeInTheDocument()
  expect(queued.size).toBe(0)
})

test("珠串可查看并推进，勾和连线保持克制", () => {
  expect(initialBeadStates(4)).toEqual(["signed", "active", "pending", "pending"])
  expect(advanceStates(["signed", "active", "pending", "pending"])).toEqual(["signed", "signed", "active", "pending"])
  expect(pathFill(["signed", "active", "pending", "pending"])).toBeCloseTo(1 / 3)
  const onValueChange = vi.fn()
  const view = render(<SignoffBeadPath onValueChange={onValueChange} className="extra-bead" />)
  const root = rootOf(view.container, "signoff-bead-path")
  expect(root).toHaveAttribute("data-ritual", "signoff-bead")
  expect(root).toHaveAttribute("data-count", "4")
  expect(root).toHaveAttribute("data-active", "mk")
  expect(root).toHaveAttribute("data-signed", "1")
  expect(root).toHaveAttribute("data-path", "0.33")
  expect(root).toHaveAttribute("data-checks", "on")
  expect(root.className).toContain("extra-bead")
  expect(view.getByText("Morgan · active")).toBeInTheDocument()
  expect(view.getByText("Reading the middle.")).toBeInTheDocument()
  expect(view.getByRole("button", { name: "Alex signed" }).className).toContain("focus-visible:ring-2")
  expect(root.querySelectorAll("[data-check]")).toHaveLength(1)
  fireEvent.click(view.getByRole("button", { name: "Alex signed" }))
  expect(view.getByText("Signed the opening.")).toBeInTheDocument()
  const status = view.getByText("Alex · signed")
  expect(root.querySelector("[data-fill]")?.contains(status)).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Advance" }))
  expect(root).toHaveAttribute("data-active", "jr")
  expect(root).toHaveAttribute("data-signed", "2")
  expect(root).toHaveAttribute("data-path", "0.67")
  expect(view.getByText("Waiting on the figure.")).toBeInTheDocument()
  expect(root.querySelectorAll("[data-check]")).toHaveLength(2)
  fireEvent.keyDown(root, { key: "ArrowRight" })
  expect(root).toHaveAttribute("data-selected", "3")
  expect(view.getByText("Not started.")).toBeInTheDocument()
  expect(root.innerHTML).not.toMatch(/animate-bounce|neon|confetti/)
  expect(view.queryByText(/contra|deel|spine/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("珠串脉冲离开视口后停止，Enter 可推进，减弱动效无脉冲", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<SignoffBeadPath />)
  const root = rootOf(view.container, "signoff-bead-path")
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-breath"))
  act(() => drain(4))
  expect(Number(root.getAttribute("data-breath"))).toBeGreaterThan(before)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-breath")
  act(() => drain(3))
  expect(root.getAttribute("data-breath")).toBe(frozen)

  cleanup()
  const keyed = render(<SignoffBeadPath advanceOnEnter showChecks={false} count={3} />)
  const lane = rootOf(keyed.container, "signoff-bead-path")
  expect(lane).toHaveAttribute("data-count", "3")
  expect(lane).toHaveAttribute("data-checks", "off")
  expect(lane).toHaveAttribute("data-enter", "on")
  expect(lane.querySelector("[data-check]")).toBeNull()
  fireEvent.keyDown(lane, { key: "Enter" })
  expect(lane).toHaveAttribute("data-signed", "2")
  expect(lane).toHaveAttribute("data-active", "jr")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<SignoffBeadPath />)
  const quiet = rootOf(still.container, "signoff-bead-path")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-playing", "off")
  expect(quiet).toHaveAttribute("data-ease", "0")
  fireEvent.click(still.getByRole("button", { name: "Advance" }))
  expect(quiet).toHaveAttribute("data-active", "jr")
  expect(queued.size).toBe(0)
})

test("未读 pill 呼吸一次后可标已读，主文不被挡住", async () => {
  expect(nudgeCount(0)).toBe(1)
  expect(nudgeCount(12)).toBe(9)
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const onValueChange = vi.fn()
  const view = render(<QuietNudgePill onValueChange={onValueChange} className="extra-pill" />)
  const root = rootOf(view.container, "quiet-nudge-pill")
  expect(root).toHaveAttribute("data-ritual", "quiet-nudge")
  expect(root).toHaveAttribute("data-count", "1")
  expect(root).toHaveAttribute("data-read", "off")
  expect(root).toHaveAttribute("data-auto", "on")
  expect(root.className).toContain("extra-pill")
  expect(root.className).toContain("motion-reduce:transition-none")
  const body = view.getByText(/ready for a reply/)
  expect(body.className).toContain("text-foreground")
  const pill = view.getByRole("button", { name: "1 waiting" })
  expect(pill.className).toContain("focus-visible:ring-2")
  expect(pill.contains(body)).toBe(false)
  expect(view.getByText("1 条待回")).toBeInTheDocument()
  await waitFor(() => expect(root).toHaveAttribute("data-playing", "on"))
  const before = Number(root.getAttribute("data-phase"))
  act(() => drain(3))
  expect(Number(root.getAttribute("data-phase"))).toBeGreaterThan(before)
  expect(Number(root.getAttribute("data-phase"))).toBeLessThan(1)
  act(() => emitView(false))
  expect(root).toHaveAttribute("data-playing", "off")
  expect(queued.size).toBe(0)
  const frozen = root.getAttribute("data-phase")
  act(() => drain(4))
  expect(root.getAttribute("data-phase")).toBe(frozen)
  fireEvent.click(pill)
  expect(root).toHaveAttribute("data-read", "on")
  expect(view.queryByText("1 条待回")).toBeNull()
  expect(root.querySelector("[data-dot]")).toBeInTheDocument()
  expect(view.getByText(/ready for a reply/)).toBeInTheDocument()
  fireEvent.keyDown(view.getByRole("button", { name: "Marked read" }), { key: " " })
  expect(root).toHaveAttribute("data-read", "off")
  expect(view.getByText("1 条待回")).toBeInTheDocument()
  expect(root.innerHTML).not.toMatch(/animate-bounce|animate-ping|neon/)
  expect(view.queryByText(/polywork|basecamp|meetup/i)).toBeNull()
  expect(onValueChange).toHaveBeenCalled()
})

test("静默提醒在减弱动效下不呼吸，角标数字可调", () => {
  const marked = render(<QuietNudgePill count={3} autoBreathe={false} />)
  const calm = rootOf(marked.container, "quiet-nudge-pill")
  expect(calm).toHaveAttribute("data-count", "3")
  expect(calm).toHaveAttribute("data-auto", "off")
  expect(calm).toHaveAttribute("data-playing", "off")
  expect(marked.getByText("3 条待回")).toBeInTheDocument()
  expect(queued.size).toBe(0)
  cleanup()

  installMedia({ reduced: true })
  const view = render(<QuietNudgePill />)
  const root = rootOf(view.container, "quiet-nudge-pill")
  expect(root).toHaveAttribute("data-motion", "off")
  expect(root).toHaveAttribute("data-playing", "off")
  expect(root).toHaveAttribute("data-phase", "0.00")
  expect(view.getByText("1 条待回")).toBeInTheDocument()
  fireEvent.keyDown(view.getByRole("button", { name: "1 waiting" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-read", "on")
  expect(queued.size).toBe(0)
})
