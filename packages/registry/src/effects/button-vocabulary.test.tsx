// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { GooeyButton } from "./gooey-button"
import { HoldButton } from "./hold-button"
import { InteractiveHoverButton } from "./interactive-hover-button"
import { NeonButton } from "./neon-button"
import { ParticleButton } from "./particle-button"
import { PulseButton } from "./pulse-button"
import { RainbowButton } from "./rainbow-button"
import { RippleButton } from "./ripple-button"
import { ShimmerButton } from "./shimmer-button"
import { TearButton } from "./tear-button"

const rainbow = ["#f43f5e", "#f59e0b", "#22c55e", "#06b6d4", "#8b5cf6", "#f43f5e"]

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

function buttonOf(view: ReturnType<typeof render>) {
  return within(view.container).getByRole("button")
}

function htmlOf(view: ReturnType<typeof render>) {
  return buttonOf(view).outerHTML
}

function byClass(view: ReturnType<typeof render>, token: string) {
  return view.container.querySelector(`[class*='${token}']`)
}

beforeEach(() => {
  installMatchMedia(false)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test("canonical props match the previous render", () => {
  const pairs = [
    [render(<RippleButton>波纹</RippleButton>), render(<RippleButton duration={650} scale={1}>波纹</RippleButton>)],
    [render(<ShimmerButton>光</ShimmerButton>), render(<ShimmerButton duration={2200}>光</ShimmerButton>)],
    [render(<PulseButton>脉冲</PulseButton>), render(<PulseButton duration={2000} intensity={0.4}>脉冲</PulseButton>)],
    [render(<NeonButton>霓虹</NeonButton>), render(<NeonButton scale={1}>霓虹</NeonButton>)],
    [
      render(<RainbowButton>虹</RainbowButton>),
      render(<RainbowButton duration={3000} colors={[...rainbow]} scale={1}>虹</RainbowButton>),
    ],
    [
      render(<InteractiveHoverButton>滑</InteractiveHoverButton>),
      render(<InteractiveHoverButton duration={300} scale={1}>滑</InteractiveHoverButton>),
    ],
    [render(<HoldButton>按住</HoldButton>), render(<HoldButton duration={1000}>按住</HoldButton>)],
    [render(<ParticleButton>爆</ParticleButton>), render(<ParticleButton duration={700} count={10} scale={1}>爆</ParticleButton>)],
    [render(<TearButton>撕</TearButton>), render(<TearButton duration={700} delay={900}>撕</TearButton>)],
  ] as const
  for (const [omit, start] of pairs) {
    expect(htmlOf(start)).toBe(htmlOf(omit))
  }

  const plain = render(<GooeyButton>粘</GooeyButton>)
  const same = render(<GooeyButton scale={1} intensity={1}>粘</GooeyButton>)
  expect(plain.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("6")
  expect(same.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("6")
  expect(same.container.querySelector("feColorMatrix")?.getAttribute("values")).toBe(
    plain.container.querySelector("feColorMatrix")?.getAttribute("values"),
  )
  expect(plain.container.querySelector(".size-8")?.className).toBe(same.container.querySelector(".size-8")?.className)
  expect(plain.container.querySelector("filter")?.getAttribute("x")).toBe("-80%")
  expect(plain.container.querySelector(".size-8")?.className).toContain("translate-x-[70%]")
})

test("new props change the effect", () => {
  const ripple = render(<RippleButton duration={1300} scale={2}>波纹</RippleButton>)
  fireEvent.click(buttonOf(ripple), { clientX: 8, clientY: 6 })
  const wave = byClass(ripple, "ripple-expand")
  expect(wave?.className).not.toContain("size-4")
  expect(wave?.getAttribute("style")).toContain("width: 32px")
  expect(wave?.getAttribute("style")).toContain("animation-duration: 1300ms")

  const shimmer = render(<ShimmerButton duration={1200}>光</ShimmerButton>)
  expect(byClass(shimmer, "shimmer-sweep")?.getAttribute("style")).toContain("animation-duration: 1200ms")
  expect(byClass(shimmer, "shimmer-sweep")?.className).toContain("motion-reduce:animate-none")

  const pulse = render(<PulseButton duration={1200} intensity={0.8}>脉冲</PulseButton>)
  const ring = byClass(pulse, "pulse-ring")
  expect(buttonOf(pulse).className).toContain("isolate")
  expect(ring?.className).not.toContain("bg-primary/40")
  expect(ring?.className).toContain("motion-reduce:animate-none")
  expect(ring?.getAttribute("style")).toContain("80%")
  expect(ring?.getAttribute("style")).toContain("animation-duration: 1200ms")

  const neon = render(<NeonButton scale={2}>霓虹</NeonButton>)
  expect(buttonOf(neon).className).toContain("shadow-[var(--glow-rest)]")
  expect(buttonOf(neon).getAttribute("style")).toContain("36px")
  expect(buttonOf(neon).getAttribute("style")).toContain("56px")

  const rainbowView = render(
    <RainbowButton duration={1600} scale={2} colors={["#111111", "#222222", "#333333", "#444444", "#555555", "#111111"]}>
      虹
    </RainbowButton>,
  )
  const spin = byClass(rainbowView, "rainbow-spin")
  expect(spin?.className).toContain("motion-reduce:animate-none")
  expect(spin?.className).not.toContain("#f43f5e")
  expect(spin?.getAttribute("style")).toContain("#111111")
  expect(spin?.getAttribute("style")).toContain("animation-duration: 1600ms")
  expect(spin?.getAttribute("style")).toContain("inset: -4px")
  expect(byClass(rainbowView, "bg-zinc-950")?.getAttribute("style")).toContain("inset: 4px")

  const hover = render(<InteractiveHoverButton duration={480} scale={2}>滑</InteractiveHoverButton>)
  expect(byClass(hover, "--shift")?.getAttribute("style")).toContain("24px")
  expect(byClass(hover, "--travel")?.getAttribute("style")).toContain("48px")
  expect(byClass(hover, "--shift")?.getAttribute("style")).toContain("480ms")
  expect(byClass(hover, "motion-reduce:transition-none")).toBeTruthy()

  const gooey = render(<GooeyButton scale={2} intensity={0.5}>粘</GooeyButton>)
  expect(gooey.container.querySelector("feGaussianBlur")?.getAttribute("stdDeviation")).toBe("12")
  expect(gooey.container.querySelector("feColorMatrix")?.getAttribute("values")).toContain("9 -3.5")

  const particle = render(<ParticleButton duration={1100} count={4} scale={2}>爆</ParticleButton>)
  fireEvent.click(buttonOf(particle), { clientX: 8, clientY: 6 })
  const dots = particle.container.querySelectorAll("[class*='particle-burst']")
  expect(dots).toHaveLength(4)
  expect(dots[0]?.getAttribute("style")).toContain("56px")
  expect(dots[0]?.getAttribute("style")).toContain("animation-duration: 1100ms")
  expect(dots[0]?.className).toContain("size-1.5")

  const tear = render(<TearButton duration={1100} delay={450}>撕</TearButton>)
  fireEvent.click(buttonOf(tear))
  expect(byClass(tear, "tear-left")?.getAttribute("style")).toContain("animation-duration: 1100ms")
})

test("reduced motion skips click effects", () => {
  installMatchMedia(true)
  const ripple = render(<RippleButton>波纹</RippleButton>)
  fireEvent.click(buttonOf(ripple))
  expect(byClass(ripple, "ripple-expand")).toBeNull()

  const particle = render(<ParticleButton>爆</ParticleButton>)
  fireEvent.click(buttonOf(particle))
  expect(byClass(particle, "particle-burst")).toBeNull()

  const tear = render(<TearButton>撕</TearButton>)
  fireEvent.click(buttonOf(tear))
  expect(byClass(tear, "tear-left")).toBeNull()
  expect(buttonOf(tear).textContent).toContain("撕")

  expect(byClass(render(<HoldButton>按住</HoldButton>), "motion-reduce:w-full")).toBeTruthy()
})

test("hold duration stays in milliseconds", () => {
  vi.useFakeTimers()
  vi.spyOn(performance, "now").mockImplementation(() => Date.now())
  const confirm = vi.fn()
  const view = render(<HoldButton duration={500} onConfirm={confirm}>按住</HoldButton>)
  fireEvent.pointerDown(buttonOf(view))
  vi.advanceTimersByTime(496)
  expect(confirm).not.toHaveBeenCalled()
  vi.advanceTimersByTime(16)
  expect(confirm).toHaveBeenCalledTimes(1)

  const slow = vi.fn()
  const longer = render(<HoldButton onConfirm={slow}>按住</HoldButton>)
  fireEvent.pointerDown(buttonOf(longer))
  vi.advanceTimersByTime(512)
  expect(slow).not.toHaveBeenCalled()
})

test("tear delay waits before closing", () => {
  vi.useFakeTimers()
  const view = render(<TearButton delay={450}>撕</TearButton>)
  fireEvent.click(buttonOf(view))
  expect(byClass(view, "tear-left")).toBeTruthy()
  act(() => {
    vi.advanceTimersByTime(449)
  })
  expect(byClass(view, "tear-left")).toBeTruthy()
  act(() => {
    vi.advanceTimersByTime(1)
  })
  expect(byClass(view, "tear-left")).toBeNull()
})

test("render does not read window", () => {
  window.matchMedia = () => {
    throw new Error("window")
  }
  expect(() => render(<RippleButton>波纹</RippleButton>)).not.toThrow()
  expect(() => render(<ShimmerButton>光</ShimmerButton>)).not.toThrow()
  expect(() => render(<PulseButton>脉冲</PulseButton>)).not.toThrow()
  expect(() => render(<NeonButton>霓虹</NeonButton>)).not.toThrow()
  expect(() => render(<RainbowButton>虹</RainbowButton>)).not.toThrow()
  expect(() => render(<InteractiveHoverButton>滑</InteractiveHoverButton>)).not.toThrow()
  expect(() => render(<GooeyButton>粘</GooeyButton>)).not.toThrow()
  expect(() => render(<HoldButton>按住</HoldButton>)).not.toThrow()
  expect(() => render(<ParticleButton>爆</ParticleButton>)).not.toThrow()
  expect(() => render(<TearButton>撕</TearButton>)).not.toThrow()
})
