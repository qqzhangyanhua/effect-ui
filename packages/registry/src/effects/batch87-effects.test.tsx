// @vitest-environment jsdom

import { act } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { auditExemptions } from "../audit-exemptions"
import { getComponent } from "../catalog"
import { rimShift, BuzzRimFlash } from "./buzz-rim-flash"
import { bloomSpan, ChimeCheckBloom } from "./chime-check-bloom"
import { latchSlide, LatchGateClick } from "./latch-gate-click"
import { MuteConeMorph, pipSteps } from "./mute-cone-morph"
import { pipOpacity, pipSize, TickPipConfirm } from "./tick-pip-confirm"
import { dartShift, WhooshDartSend } from "./whoosh-dart-send"
import { pulseMs, toneAllowed, toneGain } from "./tone/feedback-tone"

const SLUGS = [
  "tick-pip-confirm",
  "chime-check-bloom",
  "buzz-rim-flash",
  "latch-gate-click",
  "whoosh-dart-send",
  "mute-cone-morph",
] as const

const brands = /meetup|asana|substack|skiff|maze|stripe|pipedrive|tines|melio|classdojo|instacart|pinterest|beehiiv|quicken|telegram|dribbble|reddit|zoom|discord|slack|google meet|cal\.com|buffer|15five|cake equity/i

const audioStats = { contexts: 0, starts: 0, stops: 0, resumes: 0, closes: 0 }
const mediaSpy = vi.fn()

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

function installAudio() {
  audioStats.contexts = 0
  audioStats.starts = 0
  audioStats.stops = 0
  audioStats.resumes = 0
  audioStats.closes = 0
  class FakeParam {
    value = 0
    cancelScheduledValues() {}
    setValueAtTime(value: number) {
      this.value = value
    }
    exponentialRampToValueAtTime(value: number) {
      this.value = value
    }
    linearRampToValueAtTime(value: number) {
      this.value = value
    }
  }
  class FakeNode {
    onended: (() => void) | null = null
    frequency = new FakeParam()
    connect() {
      return this
    }
    disconnect() {}
    start() {
      audioStats.starts += 1
    }
    stop() {
      audioStats.stops += 1
    }
  }
  class FakeAudioContext {
    state: AudioContextState = "suspended"
    currentTime = 0
    sampleRate = 8000
    destination = {}
    constructor() {
      audioStats.contexts += 1
    }
    resume() {
      this.state = "running"
      audioStats.resumes += 1
      return Promise.resolve()
    }
    close() {
      this.state = "closed"
      audioStats.closes += 1
      return Promise.resolve()
    }
    createOscillator() {
      return new FakeNode()
    }
    createGain() {
      return { gain: new FakeParam(), connect() { return this }, disconnect() {} }
    }
    createBuffer(_channels: number, length: number, rate: number) {
      const data = new Float32Array(length)
      return {
        length,
        sampleRate: rate,
        duration: length / rate,
        numberOfChannels: 1,
        getChannelData: () => data,
      }
    }
    createBufferSource() {
      const node = new FakeNode()
      return Object.assign(node, { buffer: null as AudioBuffer | null })
    }
    createBiquadFilter() {
      return {
        type: "lowpass" as BiquadFilterType,
        frequency: new FakeParam(),
        Q: new FakeParam(),
        connect() { return this },
        disconnect() {},
      }
    }
  }
  vi.stubGlobal("AudioContext", FakeAudioContext)
  vi.stubGlobal("webkitAudioContext", FakeAudioContext)
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
  expect(mediaSpy).not.toHaveBeenCalled()
}

beforeEach(() => {
  installMedia()
  installAudio()
  installFrames()
  mediaSpy.mockReset()
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: mediaSpy },
  })
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("短音门禁和六个 slug 的默认静音", () => {
  expect(toneAllowed({ muted: true, volume: 0.4, reduced: false, live: true })).toBe(false)
  expect(toneAllowed({ muted: false, volume: 0, reduced: false, live: true })).toBe(false)
  expect(toneAllowed({ muted: false, volume: 0.2, reduced: true, live: true })).toBe(false)
  expect(toneAllowed({ muted: false, volume: 0.2, reduced: false, live: false })).toBe(false)
  expect(toneAllowed({ muted: false, volume: 0.2, reduced: false, live: true })).toBe(true)
  expect(pulseMs(90, 1, 50, 120)).toBeLessThanOrEqual(120)
  expect(pulseMs(280, 1, 120, 400)).toBeLessThanOrEqual(400)
  expect(toneGain(0)).toBe(0)
  expect(pipSize(1, "dot")).toBeLessThan(pipSize(1, "pip"))
  expect(pipSize(1, "pip")).toBeLessThan(12)
  expect(pipOpacity(1, 1)).toBe(0)
  expect(bloomSpan(1, 1)).toBeLessThan(80)
  expect(rimShift(0.1, "soft", false)).toBe(2)
  expect(rimShift(0.1, "soft", true)).toBe(0)
  expect(rimShift(0.1, "rim", false)).toBe(0)
  expect(latchSlide(0, 1, 1)).toBe(1)
  expect(latchSlide(0, 1, 2)).toBe(1)
  expect(dartShift(1, "end", 1).x).toBeLessThan(70)
  expect(dartShift(1, "up", 1).y).toBeGreaterThan(-70)
  expect(pipSteps(0)).toBe(0)
  expect(pipSteps(0.2)).toBe(1)
  expect(pipSteps(1)).toBe(3)

  for (const name of SLUGS) {
    const entry = getComponent(name)
    expect(entry?.batch).toBe(87)
    expect(entry?.layer).toBe("effect")
    expect(entry?.effectCategory).toBe("showcase")
    expect(entry?.source).toBe("original")
    expect(entry?.props.filter((prop) => prop.control).length).toBeGreaterThanOrEqual(3)
    expect(auditExemptions.some((item) => item.name === name)).toBe(false)
    const preset = entry?.presets?.find((item) => item.name === "default")
    expect(preset?.values.muted).toBe(true)
    expect(preset?.values.pace).toBe(1)
    for (const prop of entry?.props ?? []) {
      if (!prop.control || !("value" in prop.control)) continue
      expect(preset?.values[prop.name]).toBe(prop.control.value)
    }
  }
})

test("按下 tick 默认无声，打开声音后才响，键盘同样触发，离屏和减弱动效都停", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<TickPipConfirm className="extra-tick" />)
  const root = rootOf(view.container, "tick-pip-confirm")
  const note = view.getByRole("button", { name: "Note" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-ritual", "tick-pip")
  expect(root).toHaveAttribute("data-muted", "on")
  expect(root).toHaveAttribute("data-plays", "0")
  expect(root.className).toContain("extra-tick")
  expect(root.className).toContain("motion-reduce:transition-none")
  expect(note.className).toContain("focus-visible:ring-2")
  expect(view.container).toHaveTextContent("Demo starts muted — unmute to hear short UI tones.")
  expect(view.container.textContent).not.toMatch(brands)
  expectHandsOff(view.container)
  expect(view.container.querySelector("[data-pip-layer]")).toHaveClass("pointer-events-none")

  fireEvent.pointerDown(note, { button: 0, clientX: 20, clientY: 16 })
  expect(root).toHaveAttribute("data-pressed", "note")
  expect(root).toHaveAttribute("data-pip", "on")
  expect(root).toHaveAttribute("data-plays", "0")
  expect(audioStats.contexts).toBe(0)

  fireEvent.click(view.getByRole("button", { name: "Unmute" }))
  expect(root).toHaveAttribute("data-muted", "off")
  fireEvent.pointerDown(view.getByRole("button", { name: "Copy" }), { button: 0, clientX: 30, clientY: 20 })
  expect(root).toHaveAttribute("data-plays", "1")
  expect(audioStats.starts).toBeGreaterThan(0)
  expect(audioStats.resumes).toBeGreaterThan(0)
  const stops = audioStats.stops
  act(() => emitView(false))
  await waitFor(() => expect(root).toHaveAttribute("data-live", "off"))
  expect(root).toHaveAttribute("data-pip", "off")
  expect(root).toHaveAttribute("data-held", "on")
  await waitFor(() => expect(audioStats.stops).toBeGreaterThan(stops))
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<TickPipConfirm muted={false} />)
  const quiet = rootOf(still.container, "tick-pip-confirm")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  expect(quiet).toHaveAttribute("data-motion", "off")
  fireEvent.keyDown(still.getByRole("button", { name: "Share" }), { key: "Enter" })
  expect(quiet).toHaveAttribute("data-pressed", "share")
  expect(quiet).toHaveAttribute("data-pip", "still")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(audioStats.starts).toBe(0)
})

test("成功 chime 只响一次，重置后可再确认，减弱动效直接是静帧勾", async () => {
  const view = render(<ChimeCheckBloom muted={false} className="extra-chime" />)
  const root = rootOf(view.container, "chime-check-bloom")
  const confirm = view.getByRole("button", { name: "Confirm" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-muted", "off")
  expect(confirm.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  expect(view.container.querySelector("[data-bloom-layer]")).toHaveClass("pointer-events-none")

  fireEvent.pointerDown(confirm, { button: 0, clientX: 8, clientY: 8 })
  expect(root).toHaveAttribute("data-phase", "done")
  expect(root).toHaveAttribute("data-bloom", "on")
  expect(root).toHaveAttribute("data-plays", "1")
  expect(audioStats.starts).toBeGreaterThanOrEqual(2)
  fireEvent.pointerDown(confirm, { button: 0, clientX: 8, clientY: 8 })
  expect(root).toHaveAttribute("data-plays", "1")
  fireEvent.click(view.getByRole("button", { name: "Reset" }))
  expect(root).toHaveAttribute("data-phase", "idle")
  fireEvent.keyDown(view.getByRole("button", { name: "Confirm" }), { key: "Enter" })
  expect(root).toHaveAttribute("data-plays", "2")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-bloom", "off")
  expect(root).toHaveAttribute("data-phase", "done")

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  const still = render(<ChimeCheckBloom muted={false} />)
  const quiet = rootOf(still.container, "chime-check-bloom")
  fireEvent.click(still.getByRole("button", { name: "Confirm" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-phase", "done")
  expect(quiet).toHaveAttribute("data-bloom", "off")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(audioStats.starts).toBe(0)
})

test("错误 buzz 不挡输入，檐口不接收指针，静音和减弱动效都不响", async () => {
  const view = render(<BuzzRimFlash className="extra-buzz" />)
  const root = rootOf(view.container, "buzz-rim-flash")
  const field = view.getByRole("textbox", { name: "Code" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(field.className).toContain("focus-visible:ring-2")
  expect(view.container.querySelector("[data-rim-layer]")).toHaveClass("pointer-events-none")
  expectHandsOff(view.container)

  fireEvent.keyDown(field, { key: "Enter" })
  expect(root).toHaveAttribute("data-error", "on")
  expect(root).toHaveAttribute("data-plays", "0")
  expect(root).toHaveAttribute("data-rim", "on")
  expect(view.getByRole("alert")).toHaveTextContent("That code does not match.")
  expect(field).toBeEnabled()
  expect(field).toHaveFocus()
  expect(Number(root.getAttribute("data-shift"))).toBeLessThanOrEqual(2)
  expect(audioStats.contexts).toBe(0)

  fireEvent.change(field, { target: { value: "ready" } })
  fireEvent.click(view.getByRole("button", { name: "Check" }))
  expect(root).toHaveAttribute("data-error", "off")

  cleanup()
  installAudio()
  const loud = render(<BuzzRimFlash muted={false} nudge="soft" />)
  const soft = rootOf(loud.container, "buzz-rim-flash")
  await waitFor(() => expect(soft).toHaveAttribute("data-live", "on"))
  fireEvent.click(loud.getByRole("button", { name: "Check" }))
  expect(soft).toHaveAttribute("data-plays", "1")
  expect(soft).toHaveAttribute("data-shift", "2")
  expect(soft).toHaveAttribute("data-rim", "on")

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  const still = render(<BuzzRimFlash muted={false} nudge="soft" />)
  const quiet = rootOf(still.container, "buzz-rim-flash")
  fireEvent.click(still.getByRole("button", { name: "Check" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(quiet).toHaveAttribute("data-shift", "0")
  expect(quiet).toHaveAttribute("data-rim", "still")
  expect(audioStats.starts).toBe(0)
})

test("开关 latch 用空格切换，默认无声，线性到位不超过终点", async () => {
  const view = render(<LatchGateClick className="extra-latch" />)
  const root = rootOf(view.container, "latch-gate-click")
  const mail = view.getByRole("switch", { name: "Mail" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-mail", "off")
  expect(root).toHaveAttribute("data-mentions", "on")
  expect(mail.className).toContain("focus-visible:ring-2")
  expectHandsOff(view.container)
  fireEvent.pointerMove(mail)
  expect(root).toHaveAttribute("data-plays", "0")

  fireEvent.keyDown(mail, { key: " " })
  expect(root).toHaveAttribute("data-mail", "on")
  expect(root).toHaveAttribute("data-plays", "0")
  expect(audioStats.contexts).toBe(0)
  expect(view.container.querySelector("[data-latch-flash]")).toHaveClass("pointer-events-none")

  fireEvent.click(view.getByRole("button", { name: "Unmute" }))
  fireEvent.pointerDown(view.getByRole("switch", { name: "Digest" }), { button: 0 })
  expect(root).toHaveAttribute("data-digest", "on")
  expect(root).toHaveAttribute("data-plays", "1")
  act(() => drain(12))
  expect(root).toHaveAttribute("data-flash", "none")

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  const still = render(<LatchGateClick muted={false} style="gate" />)
  const quiet = rootOf(still.container, "latch-gate-click")
  fireEvent.click(still.getByRole("switch", { name: "Mail" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-mail", "on")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(quiet).toHaveAttribute("data-flash", "none")
  expect(audioStats.starts).toBe(0)
})

test("发送 whoosh 的 dart 不挡 Probe，默认无声，减弱动效跳过 dart", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<WhooshDartSend className="extra-dart" />)
  const root = rootOf(view.container, "whoosh-dart-send")
  const field = view.getByRole("textbox", { name: "Note" })
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(view.getByRole("button", { name: "Send" }).className).toContain("focus-visible:ring-2")
  expect(view.container.querySelector("[data-dart-layer]")).toHaveClass("pointer-events-none")
  expectHandsOff(view.container)

  fireEvent.keyDown(field, { key: "Enter" })
  expect(root).toHaveAttribute("data-sent", "1")
  expect(root).toHaveAttribute("data-dart", "on")
  expect(root).toHaveAttribute("data-marks", "1")
  expect(root).toHaveAttribute("data-plays", "0")
  expect(view.container.querySelectorAll("[data-dart-mark]").length).toBeLessThanOrEqual(2)
  fireEvent.click(view.getByRole("button", { name: "Probe" }))
  expect(root).toHaveAttribute("data-probes", "1")

  fireEvent.click(view.getByRole("button", { name: "Unmute" }))
  fireEvent.click(view.getByRole("button", { name: "Send" }))
  expect(root).toHaveAttribute("data-plays", "1")
  expect(root).toHaveAttribute("data-sent", "2")
  const stops = audioStats.stops
  act(() => emitView(false))
  await waitFor(() => expect(root).toHaveAttribute("data-live", "off"))
  expect(root).toHaveAttribute("data-dart", "off")
  await waitFor(() => expect(audioStats.stops).toBeGreaterThan(stops))
  expect(queued.size).toBe(0)

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<WhooshDartSend muted={false} style="fleck" direction="up" />)
  const quiet = rootOf(still.container, "whoosh-dart-send")
  await waitFor(() => expect(quiet).toHaveAttribute("data-live", "on"))
  fireEvent.click(still.getByRole("button", { name: "Send" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-dart", "off")
  expect(quiet).toHaveAttribute("data-sent", "1")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(audioStats.starts).toBe(0)
})

test("扬声器默认静音，打开后 Test 才响，音量为 0 仍安静，离开视口关闭上下文", async () => {
  vi.stubGlobal("IntersectionObserver", ToggleObserver)
  const view = render(<MuteConeMorph className="extra-cone" />)
  const root = rootOf(view.container, "mute-cone-morph")
  await waitFor(() => expect(root).toHaveAttribute("data-live", "on"))
  expect(root).toHaveAttribute("data-muted", "on")
  expect(root).toHaveAttribute("data-spectrum", "off")
  expect(root).toHaveAttribute("data-steps", "0")
  expect(view.getByRole("button", { name: "Unmute" }).className).toContain("focus-visible:ring-2")
  expect(view.getByRole("button", { name: "Test" }).className).toContain("focus-visible:ring-2")
  expect(view.container.querySelector("[data-pip-layer]")).toHaveClass("pointer-events-none")
  expect(view.container.querySelectorAll("[data-volume-pip]")).toHaveLength(3)
  expectHandsOff(view.container)
  expect(view.container).toHaveTextContent("Demo starts muted — unmute to hear short UI tones.")

  fireEvent.click(view.getByRole("button", { name: "Test" }))
  expect(root).toHaveAttribute("data-plays", "0")
  expect(root).toHaveAttribute("data-blocked", "on")
  expect(audioStats.contexts).toBe(0)

  fireEvent.click(view.getByRole("button", { name: "Unmute" }))
  expect(root).toHaveAttribute("data-muted", "off")
  expect(root).toHaveAttribute("data-plays", "1")
  expect(view.container.querySelector("[data-cone-slash]")).toBeNull()
  expect(view.container.querySelector("[data-cone-wave]")).not.toBeNull()
  fireEvent.click(view.getByRole("button", { name: "Test" }))
  expect(root).toHaveAttribute("data-plays", "2")
  expect(root).toHaveAttribute("data-testing", "on")
  const closes = audioStats.closes
  view.unmount()
  expect(audioStats.closes).toBeGreaterThan(closes)

  cleanup()
  installAudio()
  const silent = render(<MuteConeMorph muted={false} volume={0} />)
  const zero = rootOf(silent.container, "mute-cone-morph")
  await waitFor(() => expect(zero).toHaveAttribute("data-live", "on"))
  fireEvent.click(silent.getByRole("button", { name: "Test" }))
  expect(zero).toHaveAttribute("data-plays", "0")
  expect(zero).toHaveAttribute("data-steps", "0")

  cleanup()
  installMedia({ reduced: true })
  installAudio()
  vi.stubGlobal("IntersectionObserver", IntersectingObserver)
  const still = render(<MuteConeMorph muted={false} />)
  const quiet = rootOf(still.container, "mute-cone-morph")
  fireEvent.click(still.getByRole("button", { name: "Test" }))
  expect(quiet).toHaveAttribute("data-motion", "off")
  expect(quiet).toHaveAttribute("data-plays", "0")
  expect(audioStats.starts).toBe(0)
})
