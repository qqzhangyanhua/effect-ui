// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, render } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CountdownTimer } from "./countdown-timer"
import { DotsLoader } from "./dots-loader"
import { IntroPreloader } from "./intro-preloader"
import { OrbitLoader } from "./orbit-loader"
import { ParticleHourglass } from "./particle-hourglass"
import { ProgressRing } from "./progress-ring"
import { Spinner } from "./spinner"

function installMatchMedia(reduce = false) {
  window.matchMedia = (query: string) =>
    ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
    }) as unknown as MediaQueryList
}

class SilentObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

function styleOf(node: Element | null) {
  return node?.getAttribute("style") ?? ""
}

function markup(node: Element) {
  return node.outerHTML.replace(/ id="[^"]*"/g, "")
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
  window.sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

test("起始值与不传的标记相同", () => {
  const spinner = render(<Spinner />)
  const spinnerSame = render(<Spinner size={28} duration={1000} />)
  expect(markup(spinnerSame.container)).toBe(markup(spinner.container))

  const orbit = render(<OrbitLoader />)
  const orbitSame = render(<OrbitLoader size={56} dots={6} duration={1400} delay={80} />)
  expect(markup(orbitSame.container)).toBe(markup(orbit.container))

  const dots = render(<DotsLoader />)
  const dotsSame = render(<DotsLoader count={3} size={8} gap={6} duration={900} delay={120} />)
  expect(markup(dotsSame.container)).toBe(markup(dots.container))

  const ring = render(<ProgressRing value={72} />)
  const ringSame = render(<ProgressRing value={72} size={72} strokeWidth={6} duration={500} />)
  expect(markup(ringSame.container)).toBe(markup(ring.container))

  const intro = render(<IntroPreloader />)
  const introSame = render(<IntroPreloader interval={32} duration={700} delay={70} count={5} />)
  expect(markup(introSame.container)).toBe(markup(intro.container))

  const timer = render(<CountdownTimer />)
  const timerSame = render(<CountdownTimer gap={16} speed={1} duration={900} fontSize={36} />)
  expect(markup(timerSame.container)).toBe(markup(timer.container))

  const sand = render(<ParticleHourglass />)
  const sandSame = render(
    <ParticleHourglass count={80} colors={["#e7d7b1", "#f6d48a"]} speed={1} size={224} gap={8} />,
  )
  expect(markup(sandSame.container)).toBe(markup(sand.container))
})

test("新 prop 写进 class 或 style", () => {
  const spinner = render(<Spinner duration={400} color="#112233" size={40} />)
  const spinnerNode = spinner.container.querySelector("[data-slot='spinner']")
  expect(spinnerNode).not.toHaveClass("border-t-primary")
  expect(spinnerNode).toHaveClass("motion-reduce:animate-pulse")
  expect(styleOf(spinnerNode)).toContain("400ms")
  expect(styleOf(spinnerNode)).toContain("40px")
  expect(styleOf(spinnerNode)).toContain("rgb(17, 34, 51)")

  const orbit = render(<OrbitLoader dots={3} duration={800} delay={40} color="#112233" />)
  const dots = orbit.container.querySelectorAll(".rounded-full")
  expect(dots).toHaveLength(3)
  expect(dots[0]).not.toHaveClass("bg-primary")
  expect(dots[0]).toHaveClass("motion-reduce:animate-pulse")
  expect(styleOf(dots[1] ?? null)).toContain("40ms")
  expect(styleOf(dots[0] ?? null)).toContain("800ms")
  expect(styleOf(dots[0] ?? null)).toContain("rgb(17, 34, 51)")

  const bounce = render(<DotsLoader count={5} size={14} gap={12} duration={500} delay={0} color="#112233" />)
  const row = bounce.container.querySelector("[data-slot='dots-loader']")
  const points = bounce.container.querySelectorAll(".rounded-full")
  expect(points).toHaveLength(5)
  expect(row).not.toHaveClass("gap-1.5")
  expect(styleOf(row)).toContain("12px")
  expect(points[0]).not.toHaveClass("size-2")
  expect(points[0]).not.toHaveClass("bg-primary")
  expect(styleOf(points[0] ?? null)).toContain("14px")
  expect(styleOf(points[0] ?? null)).toContain("500ms")
  expect(styleOf(points[1] ?? null)).toContain("0ms")

  const ring = render(<ProgressRing value={72} size={100} strokeWidth={10} duration={200} color="#112233" />)
  const arc = ring.container.querySelectorAll("circle")[1]
  expect(arc).not.toHaveClass("duration-500")
  expect(arc).not.toHaveClass("text-primary")
  expect(arc).toHaveClass("motion-reduce:transition-none")
  expect(arc).toHaveAttribute("stroke", "#112233")
  expect(arc).toHaveAttribute("stroke-width", "10")
  expect(styleOf(arc ?? null)).toContain("200ms")
  expect(styleOf(ring.container.querySelector("[data-slot='progress-ring']"))).toContain("100px")

  const intro = render(<IntroPreloader duration={400} delay={20} count={3} color="#112233" />)
  const panels = intro.container.querySelectorAll(".h-full.flex-1")
  expect(panels).toHaveLength(3)
  expect(panels[0]).not.toHaveClass("bg-zinc-950")
  expect(styleOf(panels[0] ?? null)).toContain("transform 400ms 0ms ease")
  expect(styleOf(panels[1] ?? null)).toContain("transform 400ms 20ms ease")
  expect(styleOf(panels[0] ?? null)).toContain("rgb(17, 34, 51)")

  const timer = render(<CountdownTimer gap={24} fontSize={48} speed={1.6} />)
  const rowNode = timer.container.querySelector("[aria-hidden='true']")
  const digits = timer.container.querySelector(".font-display")
  expect(rowNode).not.toHaveClass("gap-4")
  expect(styleOf(rowNode)).toContain("24px")
  expect(digits).not.toHaveClass("text-4xl")
  expect(styleOf(digits)).toContain("48px")

  const finished = render(<CountdownTimer durationSeconds={0} confetti duration={1200} />)
  expect(finished.container.querySelectorAll(".rounded-sm")).toHaveLength(8)

  const sand = render(<ParticleHourglass size={180} count={24} speed={1.6} gap={4} colors={["#111111", "#222222"]} />)
  const frame = sand.container.querySelector("[data-slot='particle-hourglass']")
  expect(frame).not.toHaveClass("w-56")
  expect(styleOf(frame)).toContain("180px")
  expect(sand.container.querySelector("canvas")).toBeInTheDocument()
})

test("计数间隔会改变开场进度", () => {
  vi.useFakeTimers()
  const slow = render(<IntroPreloader interval={200} />)
  act(() => {
    vi.advanceTimersByTime(200)
  })
  expect(slow.container.textContent).toContain("004")
  cleanup()
  window.sessionStorage.clear()
  const step = render(<IntroPreloader interval={32} />)
  act(() => {
    vi.advanceTimersByTime(200)
  })
  expect(step.container.textContent).toContain("024")
})

test("减弱动效时停掉连续和入场动画", () => {
  installMatchMedia(true)

  const intro = render(<IntroPreloader duration={400} count={3} />)
  expect(intro.getByRole("button", { name: "再播一次" })).toBeInTheDocument()
  expect(intro.container.querySelectorAll(".h-full.flex-1")).toHaveLength(0)

  const timer = render(<CountdownTimer durationSeconds={0} confetti duration={1200} />)
  expect(timer.container.querySelectorAll(".rounded-sm")).toHaveLength(0)
  expect(timer.container.textContent).toContain("计时结束")

  const sand = render(<ParticleHourglass progress={0.5} size={180} />)
  const frame = sand.container.querySelector("[data-slot='particle-hourglass']")
  expect(sand.container.querySelector("canvas")).not.toBeInTheDocument()
  expect(frame).not.toHaveClass("w-56")
  expect(styleOf(frame)).toContain("180px")
  expect(sand.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50")
  expect(sand.container.textContent).toContain("进度 50%")
})
