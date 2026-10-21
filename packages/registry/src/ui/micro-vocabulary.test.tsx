// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test } from "vitest"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ElasticSlider } from "../effects/elastic-slider"
import { ReactionBar } from "../effects/reaction-bar"
import { FuseButton } from "./fuse-button"
import { JellyRadio } from "./jelly-radio"
import { LatticeLoader } from "./lattice-loader"
import { PeekRating } from "./peek-rating"
import { PulseHeart } from "./pulse-heart"
import { SlideToConfirm } from "./slide-to-confirm"
import { SpringCheck } from "./spring-check"
import { SquishSwitch } from "./squish-switch"
import { SwipeRow } from "./swipe-row"
import { WarmTooltip } from "./warm-tooltip"

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

function markup(node: Element) {
  return node.outerHTML
    .replace(/ id="[^"]*"/g, "")
    .replace(/ aria-controls="[^"]*"/g, "")
    .replace(/ for="[^"]*"/g, "")
    .replace(/ name="[^"]*"/g, "")
}

beforeAll(() => {
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
})

afterEach(() => {
  cleanup()
})

test("canonical props match the previous render", () => {
  installMatchMedia(false)
  const jelly = {
    options: [
      { value: "s", label: "小" },
      { value: "m", label: "中" },
    ],
    defaultValue: "s",
    "aria-label": "尺寸",
  }
  const reactions = [{ emoji: "ok", count: 1, active: true }]
  const pairs = [
    [render(<SquishSwitch aria-label="开关" />), render(<SquishSwitch aria-label="开关" speed={1} />)],
    [render(<JellyRadio {...jelly} />), render(<JellyRadio {...jelly} intensity={0.55} />)],
    [render(<SpringCheck aria-label="勾选" />), render(<SpringCheck aria-label="勾选" intensity={0.3} />)],
    [render(<PeekRating aria-label="评分" />), render(<PeekRating aria-label="评分" size={28} intensity={0.25} />)],
    [render(<SlideToConfirm />), render(<SlideToConfirm duration={150} />)],
    [render(<SwipeRow>行</SwipeRow>), render(<SwipeRow duration={150} intensity={0.4}>行</SwipeRow>)],
    [render(<FuseButton />), render(<FuseButton scale={1} />)],
    [render(<PulseHeart />), render(<PulseHeart duration={350} scale={1} />)],
    [render(<LatticeLoader />), render(<LatticeLoader size={6} gap={6} />)],
    [render(<ElasticSlider />), render(<ElasticSlider scale={1} speed={1} />)],
    [
      render(
        <WarmTooltip content="说明">
          <button type="button">悬停</button>
        </WarmTooltip>,
      ),
      render(
        <WarmTooltip content="说明" intensity={1}>
          <button type="button">悬停</button>
        </WarmTooltip>,
      ),
    ],
    [
      render(<ReactionBar items={reactions} onToggle={() => {}} />),
      render(<ReactionBar items={reactions} onToggle={() => {}} duration={280} scale={1} gap={8} />),
    ],
  ] as const
  for (const [omit, start] of pairs) {
    expect(markup(start.container)).toBe(markup(omit.container))
  }
})

test("new props change the painted result", () => {
  installMatchMedia(false)

  const slide = render(<SlideToConfirm duration={80} />)
  const thumb = within(slide.container).getByRole("slider")
  expect(thumb.className).not.toContain("duration-150")
  expect(thumb).toHaveStyle({ transitionDuration: "80ms" })

  const swipe = render(<SwipeRow duration={80}>行</SwipeRow>)
  const row = within(swipe.container).getByText("行")
  expect(row.className).not.toContain("duration-150")
  expect(row).toHaveStyle({ transitionDuration: "80ms" })

  const peek = render(<PeekRating aria-label="评分" size={40} intensity={0.5} />)
  const star = peek.container.querySelector("svg")
  expect(star).not.toHaveClass("size-7")
  expect(star).toHaveStyle({ width: "40px", height: "40px" })
  expect(peek.container.querySelector("path")).toHaveStyle({ opacity: "0.5" })

  const lattice = render(<LatticeLoader rows={1} cols={1} size={10} gap={12} />)
  const grid = within(lattice.container).getByRole("status")
  expect(grid.className).not.toContain("gap-1.5")
  expect(grid).toHaveStyle({ gap: "12px" })
  const dot = grid.querySelector("span")
  expect(dot).not.toHaveClass("size-1.5")
  expect(dot).toHaveStyle({ width: "10px", height: "10px" })

  const fuse = render(<FuseButton scale={2} />)
  const ring = fuse.container.querySelector("circle")
  const svg = fuse.container.querySelector("svg")
  expect(ring).toHaveAttribute("r", "46")
  expect(ring).toHaveAttribute("stroke-width", "4")
  expect(svg).toHaveStyle({ transform: "scale(2)" })

  const reaction = render(
    <ReactionBar items={[{ emoji: "ok", count: 2, active: true }]} onToggle={() => {}} gap={12} color="#112233" />,
  )
  const bar = within(reaction.container).getByRole("button")
  expect(reaction.container.querySelector("[data-slot='reaction-bar']")).toHaveStyle({ gap: "12px" })
  expect(bar.className).not.toContain("border-primary")
  expect(bar).toHaveStyle({ borderColor: "#112233" })

  const elastic = render(<ElasticSlider color="#112233" />)
  const fill = elastic.container.querySelector("[class*='rounded-full'][class*='h-2']:not([class*='bg-muted'])")
  expect(fill?.className).not.toContain("bg-primary")
  expect(fill).toHaveStyle({ backgroundColor: "#112233" })

  const small = render(<SquishSwitch aria-label="开关" size="sm" speed={1.4} />)
  expect(within(small.container).getByRole("switch").className).toContain("h-5")
  expect(within(small.container).getByRole("switch").className).toContain("w-9")

  render(
    <JellyRadio
      aria-label="尺寸"
      intensity={0.2}
      defaultValue="s"
      options={[
        { value: "s", label: "小" },
        { value: "m", label: "中" },
      ]}
    />,
  )
  render(<SpringCheck aria-label="勾选" intensity={0.8} defaultChecked />)
  render(<ElasticSlider scale={2} speed={1.6} />)
  const heart = render(<PulseHeart duration={200} scale={1.6} />)
  fireEvent.click(within(heart.container).getByRole("button"))
})

test("warm tooltip intensity replaces the glow shadow", async () => {
  installMatchMedia(false)
  const user = userEvent.setup()
  render(
    <WarmTooltip content="说明" glow intensity={0.45}>
      <button type="button">悬停</button>
    </WarmTooltip>,
  )
  await user.tab()
  const tip = await screen.findByRole("tooltip")
  expect(tip.className).not.toContain("shadow-[0_0_24px")
  expect(tip.style.boxShadow).toBe("0 0 10.8px color-mix(in oklab, var(--primary) 25%, transparent)")
  cleanup()

  const sameUser = userEvent.setup()
  render(
    <WarmTooltip content="说明" glow intensity={1}>
      <button type="button">原光</button>
    </WarmTooltip>,
  )
  await sameUser.tab()
  const kept = await screen.findByRole("tooltip")
  expect(kept.className).toContain("shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_55%,transparent)]")
  expect(kept.style.boxShadow).toBe("")
})

test("reduced motion turns warm tooltip glow off", async () => {
  installMatchMedia(true)
  const user = userEvent.setup()
  render(
    <WarmTooltip content="说明" glow intensity={0.45}>
      <button type="button">悬停</button>
    </WarmTooltip>,
  )
  await user.tab()
  const tip = await screen.findByRole("tooltip")
  expect(tip).toHaveAttribute("data-glow", "false")
  expect(tip.className).toContain("animate-none")
  expect(tip.style.boxShadow).toBe("")
})

test("swipe intensity changes when the row opens", () => {
  installMatchMedia(false)
  render(
    <SwipeRow intensity={0.9} actions={<button type="button">删除</button>}>
      邮件
    </SwipeRow>,
  )
  const row = within(document.body).getByText("邮件")
  fireEvent.pointerDown(row, { clientX: 200, pointerId: 1, button: 0 })
  fireEvent.pointerMove(row, { clientX: 150, pointerId: 1 })
  fireEvent.pointerUp(row, { clientX: 150, pointerId: 1 })
  expect(within(document.body).queryByRole("button", { name: "删除" })).toBeNull()

  fireEvent.pointerDown(row, { clientX: 200, pointerId: 1, button: 0 })
  fireEvent.pointerMove(row, { clientX: 100, pointerId: 1 })
  fireEvent.pointerUp(row, { clientX: 100, pointerId: 1 })
  expect(within(document.body).getByRole("button", { name: "删除" })).toBeTruthy()
})

test("reduced motion keeps the fallback", () => {
  installMatchMedia(true)
  const slide = render(<SlideToConfirm duration={80} />)
  const thumb = within(slide.container).getByRole("slider")
  expect(thumb.className).not.toContain("transition-[left]")
  expect(thumb.style.transitionDuration).toBe("")

  const lattice = render(<LatticeLoader size={10} />)
  const status = within(lattice.container).getByRole("status")
  expect(status).toHaveAttribute("data-reduced", "true")
  expect(status.querySelector("span")).not.toHaveClass("animate-pulse")
  expect(status.querySelector("span")?.getAttribute("style") ?? "").not.toContain("animation")

  const reaction = render(<ReactionBar items={[{ emoji: "ok", count: 1, active: true }]} onToggle={() => {}} />)
  expect(within(reaction.container).getByRole("button")).toBeTruthy()
})

