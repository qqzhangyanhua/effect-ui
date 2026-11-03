// @vitest-environment jsdom

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { caretOpacity, CaretWelcomeRing, ringSpread, welcomeStep } from "./caret-welcome-ring"
import { FloatLabelSettle, settleShift } from "./float-label-settle"
import { InlineAlertRail, referenceVerdict, rimShift } from "./inline-alert-rail"
import { bandOf, MeterRuleTicks, ruleWindow, sampleFor } from "./meter-rule-ticks"
import { cellCount, otpSample, otpVerdict, OtpCellCascade, writeDigits } from "./otp-cell-cascade"
import { flareOpacity, noteVerdict, SubmitCheckFlare } from "./submit-check-flare"

const SLUGS = [
  "caret-welcome-ring",
  "float-label-settle",
  "inline-alert-rail",
  "otp-cell-cascade",
  "meter-rule-ticks",
  "submit-check-flare",
] as const

const brands = /hubspot|calendly|bonsai|zillow|disney|paypal|intercom|substack|clerk|claude|tidal|coinbase|vercel|melio|uvodo|etsy|upwork|\bmaze\b|google|gsap|tldraw|webgl/i

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

function rootOf(container: HTMLElement, slot: string) {
  const node = container.querySelector(`[data-slot='${slot}']`)
  if (!(node instanceof HTMLElement)) throw new Error(`missing ${slot}`)
  return node
}

function expectHandsOff(container: HTMLElement) {
  expect(container.querySelector("[class*='cursor-none']")).toBeNull()
  expect(container.querySelector("[style*='cursor: none']")).toBeNull()
  expect(container.querySelector("canvas")).toBeNull()
  expect(container.querySelector(".fixed.inset-0")).toBeNull()
}

beforeEach(() => {
  installMedia()
  installFrames()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  vi.stubGlobal("AudioContext", class AudioContext {
    constructor() {
      throw new Error("no audio")
    }
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("六个表单微反馈的目录、静帧数学和源码约束", () => {
  expect(welcomeStep(1)).toBeGreaterThan(0)
  expect(welcomeStep(1)).toBeLessThan(0.12)
  expect(ringSpread(0.5, "ring", false)).toBeGreaterThan(0)
  expect(ringSpread(0.5, "ring", false)).toBeLessThanOrEqual(2)
  expect(ringSpread(0.5, "underline", false)).toBe(0)
  expect(ringSpread(1, "ring", true)).toBe(0)
  expect(caretOpacity(1, true)).toBe(0)
  const above = settleShift(true, "float", "above", 1)
  const inside = settleShift(false, "slide", "above", 0)
  expect(above.y).toBeGreaterThanOrEqual(4)
  expect(above.y).toBeLessThanOrEqual(30)
  expect(inside.x).toBe(0)
  expect(inside.y).toBeLessThanOrEqual(30)
  expect(referenceVerdict("")).toBe("empty")
  expect(referenceVerdict("12")).toBe("short")
  expect(referenceVerdict("lane")).toBe("ok")
  expect(rimShift(0.4, "soft", false)).toBe(0)
  expect(rimShift(0.4, "rim", false)).toBe(0)
  expect(cellCount(4)).toBe(4)
  expect(cellCount(6)).toBe(6)
  expect(otpSample(4)).toBe("2468")
  expect(otpVerdict("246810", otpSample(6))).toBe("match")
  expect(otpVerdict("000000", otpSample(6))).toBe("miss")
  expect(otpVerdict("24", otpSample(6))).toBe("pending")
  expect(writeDigits(["", "", "", "", "", ""], 0, "13", 6).slots.slice(0, 2)).toEqual(["1", "3"])
  expect(writeDigits(["", "", "", "", "", ""], 0, "1", 6).focus).toBe(1)
  expect(ruleWindow(3)).toBe(3)
  expect(bandOf(0, 4)).toBe("empty")
  expect(bandOf(1, 4)).toBe("weak")
  expect(bandOf(3, 4)).toBe("fair")
  expect(bandOf(4, 4)).toBe("strong")
  expect(bandOf(sampleFor("weak", 4).length >= 8 ? 1 : 0, 4)).toBe("weak")
  expect(noteVerdict("")).toBe("empty")
  expect(noteVerdict("A")).toBe("short")
  expect(noteVerdict("North note")).toBe("ok")
  expect(flareOpacity(0, 0.32, true)).toBe(0)
  expect(flareOpacity(0, 0.32, false)).toBeGreaterThan(0)

  const dir = path.dirname(fileURLToPath(import.meta.url))
  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(88)
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
    const source = fs.readFileSync(path.join(dir, `${name}.tsx`), "utf8")
    expect(source).toMatch(/usePrefersReducedMotion/)
    expect(source).toMatch(/useAnimationActive/)
    expect(source).toMatch(/motion-reduce:/)
    expect(source).toMatch(/original implementation/)
    expect(source).toMatch(/mobbin\.com\/screens\//)
    expect(source).toMatch(/pointer-events-none/)
    expect(source).not.toMatch(/AudioContext|getUserMedia|from ["']gsap|tldraw|webgl/i)
  }
})

test("焦点欢迎环可键盘进入，减弱动效不扩张，离屏卸掉装饰", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<CaretWelcomeRing className="extra-caret" />)
  const root = rootOf(view.container, "caret-welcome-ring")
  const field = view.getByRole("textbox", { name: "Display name" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "caret-welcome")
  expect(root).toHaveClass("extra-caret")
  expect(root).toHaveAttribute("data-phase", "empty")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.focus(field)
  expect(root).toHaveAttribute("data-ring", "run")
  expect(field.style.caretColor).not.toBe("transparent")
  const layer = root.querySelector("[data-ring-layer]")
  expect(layer).toHaveStyle({ pointerEvents: "none" })
  expect(layer).not.toHaveAttribute("tabindex")
  act(() => drain(1))
  expect(Number(root.getAttribute("data-spread"))).toBeGreaterThan(0)
  act(() => drain(40))
  expect(root).toHaveAttribute("data-ring", "still")
  expect(root.getAttribute("data-spread")).toBe("0")
  fireEvent.change(field, { target: { value: "Ada North" } })
  expect(root).toHaveAttribute("data-phase", "filled")
  emitView(false)
  await waitFor(() => expect(root).toHaveAttribute("data-live", "off"))
  expect(root).toHaveAttribute("data-ring", "off")
  expect(field).toHaveValue("Ada North")
  expect(root.querySelector("[data-ring-layer]")).toBeNull()

  cleanup()
  installMedia({ reduced: true })
  const still = render(<CaretWelcomeRing />)
  const quiet = rootOf(still.container, "caret-welcome-ring")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.focus(still.getByRole("textbox", { name: "Display name" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-ring", "still")
  expect(quiet.getAttribute("data-spread")).toBe("0")
  expect(quiet.querySelector("[data-caret-mark]")).toBeNull()
})

test("浮动标签跟随焦点和文字落位，清空失焦后回落", async () => {
  const view = render(<FloatLabelSettle />)
  const root = rootOf(view.container, "float-label-settle")
  const field = view.getByRole("textbox", { name: "Workspace" })
  const label = view.getByText("Workspace")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(label.tagName).toBe("LABEL")
  expect(label).toHaveAttribute("for", field.id)
  expect(root).toHaveAttribute("data-raised", "off")
  expect(root).toHaveAttribute("data-phase", "empty")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.focus(field)
  expect(root).toHaveAttribute("data-raised", "on")
  fireEvent.change(field, { target: { value: "North studio" } })
  fireEvent.blur(field)
  expect(root).toHaveAttribute("data-raised", "on")
  expect(root).toHaveAttribute("data-phase", "filled")
  fireEvent.click(view.getByRole("button", { name: "Clear" }))
  expect(field).toHaveValue("")
  expect(root).toHaveAttribute("data-raised", "off")
  fireEvent.click(view.getByRole("button", { name: "Sample" }))
  expect(field).toHaveValue("North studio")
  expect(root).toHaveAttribute("data-raised", "on")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<FloatLabelSettle style="slide" rest="aside" />)
  const quiet = rootOf(still.container, "float-label-settle")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-style", "slide")
  expect(quiet).toHaveAttribute("data-rest", "aside")
})

test("行内错误同时有图标、文字和斜纹，焦点回到字段", async () => {
  const view = render(<InlineAlertRail />)
  const root = rootOf(view.container, "inline-alert-rail")
  const field = view.getByRole("textbox", { name: "Reference" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-phase", "empty")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Submit" }))
  expect(root).toHaveAttribute("data-phase", "error")
  expect(root.getAttribute("data-shift")).toBe("0")
  expect(view.getByRole("alert")).toHaveTextContent("Add a reference.")
  expect(root.querySelector("[data-icon='alert']")).not.toBeNull()
  expect(root.querySelector("[data-pattern='hatch']")).toHaveStyle({ pointerEvents: "none" })
  const rim = root.querySelector("[data-rim-layer]")
  expect(rim).toHaveStyle({ pointerEvents: "none" })
  expect(rim).not.toHaveAttribute("tabindex")
  await waitFor(() => expect(field).toHaveFocus())
  fireEvent.change(field, { target: { value: "12" } })
  fireEvent.submit(field.closest("form")!)
  expect(view.getByRole("alert")).toHaveTextContent("Use at least 3 letters.")
  fireEvent.click(view.getByRole("button", { name: "Sample" }))
  fireEvent.click(view.getByRole("button", { name: "Submit" }))
  expect(root).toHaveAttribute("data-phase", "success")
  expect(view.getByRole("status")).toHaveTextContent("Reference accepted.")
  expect(root.querySelector("[data-icon='check']")).not.toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Clear" }))
  expect(root).toHaveAttribute("data-phase", "empty")
  expect(field).toHaveValue("")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<InlineAlertRail nudge="soft" icon="dot" />)
  const quiet = rootOf(still.container, "inline-alert-rail")
  fireEvent.click(still.getByRole("button", { name: "Submit" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-rim", "still")
  expect(quiet.getAttribute("data-shift")).toBe("0")
  expect(quiet.querySelector("[data-icon='dot']")).not.toBeNull()
})

test("验证码格接受键盘、粘贴和退格，不匹配时有图标和文字", async () => {
  const view = render(<OtpCellCascade />)
  const root = rootOf(view.container, "otp-cell-cascade")
  const first = view.getByRole("textbox", { name: "Digit 1 of 6" })
  const second = view.getByRole("textbox", { name: "Digit 2 of 6" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-cells", "6")
  expect(root).toHaveAttribute("data-verdict", "pending")
  expect(view.getByRole("group", { name: "Verification code" })).toBeInTheDocument()
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  first.focus()
  fireEvent.change(first, { target: { value: "1" } })
  expect(second).toHaveFocus()
  expect(root).toHaveAttribute("data-cascade", "on")
  const bead = root.querySelector("[data-bead]")
  expect(bead).toHaveStyle({ pointerEvents: "none" })
  expect(bead).not.toHaveAttribute("tabindex")
  act(() => drain(40))
  expect(root).toHaveAttribute("data-cascade", "off")
  fireEvent.keyDown(second, { key: "Backspace" })
  expect(first).toHaveFocus()
  expect(first).toHaveValue("")
  fireEvent.paste(first, { clipboardData: { getData: () => "135790" } })
  expect(view.getByRole("textbox", { name: "Digit 1 of 6" })).toHaveValue("1")
  expect(view.getByRole("textbox", { name: "Digit 6 of 6" })).toHaveValue("0")
  expect(root).toHaveAttribute("data-verdict", "miss")
  expect(view.getByRole("alert")).toHaveTextContent("That code does not match the sample.")
  expect(root.querySelector("[data-icon='alert']")).not.toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Fill sample" }))
  expect(root).toHaveAttribute("data-verdict", "match")
  expect(root).toHaveAttribute("data-complete", "on")
  expect(view.getByRole("status")).toHaveTextContent("Code matches.")
  const frame = root.querySelector("[data-complete-frame]")
  expect(frame).toHaveStyle({ pointerEvents: "none" })
  fireEvent.click(view.getByRole("button", { name: "Clear" }))
  expect(root).toHaveAttribute("data-verdict", "pending")
  expect(first).toHaveValue("")

  cleanup()
  const four = render(<OtpCellCascade cells={4} style="underline" />)
  expect(rootOf(four.container, "otp-cell-cascade")).toHaveAttribute("data-cells", "4")
  expect(four.getByRole("textbox", { name: "Digit 4 of 4" })).toBeInTheDocument()
  expect(four.queryByRole("textbox", { name: "Digit 5 of 4" })).toBeNull()

  cleanup()
  installMedia({ reduced: true })
  const still = render(<OtpCellCascade />)
  const quiet = rootOf(still.container, "otp-cell-cascade")
  const quietFirst = still.getByRole("textbox", { name: "Digit 1 of 6" })
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.change(quietFirst, { target: { value: "8" } })
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-cascade", "off")
  expect(still.getByRole("textbox", { name: "Digit 2 of 6" })).toHaveFocus()
})

test("口令计量用文字和勾同步规则，显示开关不丢焦点环", async () => {
  const view = render(<MeterRuleTicks />)
  const root = rootOf(view.container, "meter-rule-ticks")
  const field = view.getByLabelText("Passphrase")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-band", "empty")
  expect(root).toHaveAttribute("data-rules", "4")
  expect(view.getByText("Strength: Empty")).toBeInTheDocument()
  expect(view.getByText("One symbol")).toBeInTheDocument()
  expect(field).toHaveAttribute("type", "password")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  const meter = root.querySelector("[data-meter]")
  expect(meter).toHaveStyle({ pointerEvents: "none" })
  fireEvent.click(view.getByRole("button", { name: "Weak" }))
  expect(root).toHaveAttribute("data-band", "weak")
  expect(root.querySelector("[data-rule='length']")).toHaveAttribute("data-met", "on")
  expect(root.querySelector("[data-rule='digit']")).toHaveAttribute("data-met", "off")
  expect(root.querySelector("[data-icon='check']")).not.toBeNull()
  expect(root.querySelector("[data-icon='box']")).not.toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Fair" }))
  expect(root).toHaveAttribute("data-band", "fair")
  fireEvent.click(view.getByRole("button", { name: "Strong" }))
  expect(root).toHaveAttribute("data-band", "strong")
  expect(root).toHaveAttribute("data-met", "4")
  fireEvent.click(view.getByRole("button", { name: "Show passphrase" }))
  expect(field).toHaveAttribute("type", "text")
  expect(view.getByRole("button", { name: "Hide passphrase" })).toHaveAttribute("aria-pressed", "true")
  field.focus()
  expect(field.className).toContain("focus-visible:ring-2")
  fireEvent.click(view.getByRole("button", { name: "Empty" }))
  expect(root).toHaveAttribute("data-band", "empty")
  expect(field).toHaveValue("")

  cleanup()
  installMedia({ reduced: true })
  const still = render(<MeterRuleTicks style="segments" rules={3} />)
  const quiet = rootOf(still.container, "meter-rule-ticks")
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-rules", "3")
  expect(still.queryByText("One symbol")).toBeNull()
  fireEvent.click(still.getByRole("button", { name: "Strong" }))
  expect(quiet).toHaveAttribute("data-band", "strong")
  expect(quiet.querySelectorAll("[data-meter-tick='on']")).toHaveLength(3)
})

test("提交成功落到静帧勾，失败保留图标和文字，重置可再试", async () => {
  const view = render(<SubmitCheckFlare />)
  const root = rootOf(view.container, "submit-check-flare")
  const field = view.getByRole("textbox", { name: "Note title" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(root).toHaveAttribute("data-ritual", "check-flare")
  expectHandsOff(view.container)
  expect(brands.test(view.container.textContent ?? "")).toBe(false)
  fireEvent.click(view.getByRole("button", { name: "Save" }))
  expect(root).toHaveAttribute("data-phase", "error")
  expect(view.getByRole("alert")).toHaveTextContent("Add a name before saving.")
  expect(root.querySelector("[data-icon='alert']")).not.toBeNull()
  await waitFor(() => expect(field).toHaveFocus())
  fireEvent.change(field, { target: { value: "A" } })
  fireEvent.submit(field.closest("form")!)
  expect(view.getByRole("alert")).toHaveTextContent("Use at least 2 letters.")
  fireEvent.click(view.getByRole("button", { name: "Sample" }))
  fireEvent.click(view.getByRole("button", { name: "Save" }))
  expect(root).toHaveAttribute("data-phase", "done")
  expect(root).toHaveAttribute("data-check", "on")
  expect(root).toHaveAttribute("data-flare", "run")
  expect(view.getByRole("status")).toHaveTextContent("Saved")
  expect(root.querySelector("[data-icon='check']")).not.toBeNull()
  const flare = root.querySelector("[data-flare-layer]")
  expect(flare).toHaveStyle({ pointerEvents: "none" })
  expect(flare).not.toHaveAttribute("tabindex")
  const reset = view.getByRole("button", { name: "Reset" })
  await waitFor(() => expect(reset).toHaveFocus())
  act(() => drain(40))
  expect(root).toHaveAttribute("data-flare", "off")
  expect(root).toHaveAttribute("data-check", "on")
  fireEvent.click(reset)
  expect(root).toHaveAttribute("data-phase", "idle")
  expect(field).toHaveValue("")
  await waitFor(() => expect(field).toHaveFocus())

  cleanup()
  installMedia({ reduced: true })
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const still = render(<SubmitCheckFlare style="pill" anchor="field" />)
  const quiet = rootOf(still.container, "submit-check-flare")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Sample" }))
  fireEvent.click(still.getByRole("button", { name: "Save" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-flare", "off")
  expect(quiet).toHaveAttribute("data-check", "on")
  expect(quiet).toHaveAttribute("data-anchor", "field")
  expect(still.getByRole("status")).toHaveTextContent("Saved")
  emitView(false)
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "off"))
  expect(quiet).toHaveAttribute("data-check", "on")
  expect(quiet.querySelector("[data-flare-layer]")).toBeNull()
})
