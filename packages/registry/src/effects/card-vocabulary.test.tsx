// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { AppleCardsCarousel } from "./apple-cards-carousel"
import { AvatarGroupTooltip } from "./avatar-group-tooltip"
import { CardSwap } from "./card-swap"
import { CircularGallery } from "./circular-gallery"
import { EvervaultCard } from "./evervault-card"
import { GlassCard } from "./glass-card"
import { GlowingEdge } from "./glowing-edge"
import { HologramCard } from "./hologram-card"
import { KpiSparklineCard } from "./kpi-sparkline-card"
import { LinkPreview } from "./link-preview"
import { PerspectiveCard } from "./perspective-card"
import { StickerPeel } from "./sticker-peel"
import { Keycap3D } from "../ui/keycap-3d"

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

function mark(node: Element | null) {
  return `${node?.className ?? ""} :: ${styleOf(node)}`
}

function q(view: ReturnType<typeof render>) {
  return within(view.container)
}

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
  vi.stubGlobal("ResizeObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("翻卡、玻璃、描边、抬起：起始值与不传相同，改值写进 class 或 style", () => {
                
  const glass = render(<GlassCard>玻璃</GlassCard>)
  const glassSame = render(<GlassCard intensity={1} size={24}>玻璃</GlassCard>)
  const glassThin = render(<GlassCard intensity={0.5} size={8}>玻璃</GlassCard>)
  const glassNode = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='glass-card']")
  expect(mark(glassNode(glassSame))).toBe(mark(glassNode(glass)))
  expect(glassNode(glass)).toHaveClass("backdrop-blur-xl", "bg-white/8")
  expect(styleOf(glassNode(glass))).toBe("")
  expect(glassNode(glassThin)).not.toHaveClass("backdrop-blur-xl")
  expect(styleOf(glassNode(glassThin))).toContain("blur(8px)")

                
                  })

test("光束、便当、透视、对比：起始值沿用原 class", () => {
                  
                    
  const tilt = render(<PerspectiveCard>层</PerspectiveCard>)
  const tiltSame = render(<PerspectiveCard angle={16} size={28}>层</PerspectiveCard>)
  const tiltFar = render(<PerspectiveCard size={40}>层</PerspectiveCard>)
  const tiltInner = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='perspective-card'] > div")
  expect(mark(tiltInner(tiltSame))).toBe(mark(tiltInner(tilt)))
  expect(tiltInner(tilt)).toHaveClass("[transform:translateZ(28px)]")
  expect(styleOf(tiltInner(tiltFar))).toContain("translateZ(40px)")
})

test("发光边沿用原 class", () => {
  const edge = render(<GlowingEdge>边</GlowingEdge>)
  const edgeSame = render(<GlowingEdge duration={6000} color="#7c3aed" intensity={1} size={1}>边</GlowingEdge>)
  const edgeSlow = render(<GlowingEdge duration={3000} color="#ff0000" intensity={2} size={4}>边</GlowingEdge>)
  const edgeGlow = (view: ReturnType<typeof render>) => view.container.querySelector("[aria-hidden='true']")
  expect(mark(edgeGlow(edgeSame))).toBe(mark(edgeGlow(edge)))
  expect(edgeGlow(edge)).toHaveClass("animate-[glow-orbit_6s_linear_infinite]")
  expect(styleOf(edgeGlow(edge))).toBe("")
  expect(edgeGlow(edgeSlow)).not.toHaveClass("animate-[glow-orbit_6s_linear_infinite]")
  expect(styleOf(edgeGlow(edgeSlow))).toContain("3000ms")
  expect(styleOf(edge.container.firstElementChild)).toBe("")
  expect(styleOf(edgeSlow.container.firstElementChild)).toContain("4px")
})

test("发光边在减弱动效且非默认参数时停掉动画", () => {
  installMatchMedia(true)
  const { container } = render(<GlowingEdge duration={3000}>边</GlowingEdge>)
  expect(styleOf(container.querySelector("[aria-hidden='true']"))).toContain("animation: none")
})

test("像素卡、Atropos、Evervault 接受词汇表起始值", () => {
          
        const offsets = (view: ReturnType<typeof render>) =>
    [...view.container.querySelectorAll("[data-atropos-offset]")].map((node) => node.getAttribute("data-atropos-offset")).join(",")
      
  const vault = render(<EvervaultCard text="SECURE" />)
  const vaultSame = render(<EvervaultCard text="SECURE" interval={90} color="#34d399" size={90} count={240} intensity={1} />)
  const vaultFew = render(<EvervaultCard text="SECURE" count={20} intensity={0.5} color="#ff0000" />)
  const glyphs = (view: ReturnType<typeof render>) => view.container.querySelectorAll("span")
  const label = (view: ReturnType<typeof render>) => q(view).getByText("SECURE")
  expect(glyphs(vaultSame).length).toBe(glyphs(vault).length)
  expect(glyphs(vault)).toHaveLength(240)
  expect(glyphs(vault)[0]?.parentElement).toHaveClass("text-emerald-400/70")
  expect(styleOf(label(vault))).toContain("opacity: 0.15")
  expect(glyphs(vaultFew)).toHaveLength(20)
  expect(styleOf(label(vaultFew))).toContain("opacity: 0.075")
  expect(styleOf(glyphs(vaultFew)[0]?.parentElement ?? null)).toContain("rgb(255, 0, 0)")
})

test("Evervault 减弱动效时文字不模糊，且不启动定时器", () => {
  installMatchMedia(true)
  vi.spyOn(window, "setInterval")
  const { getByText } = render(<EvervaultCard text="SECURE" />)
  expect(styleOf(getByText("SECURE"))).toContain("opacity: 1")
  expect(styleOf(getByText("SECURE"))).toContain("filter: none")
  expect(window.setInterval).not.toHaveBeenCalled()
})

test("圆形画廊在 jsdom 里先挂上画布", () => {
  const items = [{ title: "甲", src: "a" }, { title: "乙", src: "b" }]
  const omitted = render(<CircularGallery items={items} />)
  const paced = render(<CircularGallery items={items} speed={1} />)
  expect(omitted.container.querySelector("canvas")).toBeTruthy()
  expect(paced.container.querySelector("canvas")).toBeTruthy()
})


test("苹果卡片、键帽、贴纸和换位", () => {
  const cards = render(<AppleCardsCarousel />)
  const cardsSame = render(<AppleCardsCarousel gap={12} size={208} intensity={0.6} />)
  const silk = (view: ReturnType<typeof render>) => q(view).getByRole("button", { name: /Silk/ })
  expect(mark(silk(cardsSame))).toBe(mark(silk(cards)))
  expect(silk(cards)).toHaveClass("h-64", "w-52")
  expect(cards.container.querySelector(".flex")).toHaveClass("gap-3")
  const cardsWide = render(<AppleCardsCarousel gap={24} size={104} intensity={0.3} />)
  expect(cardsWide.container.querySelector(".flex")).not.toHaveClass("gap-3")
  expect(styleOf(cardsWide.container.querySelector(".flex"))).toContain("24px")
  expect(silk(cardsWide)).not.toHaveClass("w-52")
  expect(styleOf(silk(cardsWide))).toContain("104px")
  fireEvent.click(silk(cardsWide))
  const veil = cardsWide.container.querySelector(".fixed")
  expect(veil).not.toHaveClass("bg-black/60")
  expect(styleOf(veil)).toContain("0.3")
  fireEvent.click(silk(cards))
  expect(cards.container.querySelector(".fixed")).toHaveClass("bg-black/60")

  const keys = render(<Keycap3D keys={["Q"]} />)
  const keysSame = render(<Keycap3D keys={["Q"]} duration={80} angle={18} intensity={1} gap={12} />)
  const key = (view: ReturnType<typeof render>) => q(view).getByRole("button", { name: "Q" })
  expect(mark(key(keysSame))).toBe(mark(key(keys)))
  expect(styleOf(key(keys))).toContain("rotateX(18deg)")
  expect(key(keys).parentElement).toHaveClass("gap-3")
  expect(styleOf(key(keys))).toContain("80ms")
  const keysFlat = render(<Keycap3D keys={["Q"]} angle={9} intensity={2} gap={20} duration={160} />)
  expect(styleOf(key(keysFlat))).toContain("rotateX(9deg)")
  expect(styleOf(key(keysFlat))).toContain("160ms")
  expect(key(keysFlat).parentElement).not.toHaveClass("gap-3")
  expect(styleOf(key(keysFlat).parentElement)).toContain("20px")

  const sticker = render(<StickerPeel />)
  const stickerSame = render(<StickerPeel intensity={0.55} speed={1} size={224} />)
  const stickerLarge = render(<StickerPeel size={120} />)
  const peel = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='sticker-peel']")
  expect(mark(peel(stickerSame))).toBe(mark(peel(sticker)))
  expect(peel(sticker)).toHaveClass("h-56", "w-56")
  expect(peel(stickerLarge)).not.toHaveClass("h-56")
  expect(styleOf(peel(stickerLarge))).toContain("120px")

  const swap = render(<CardSwap />)
  const swapSame = render(<CardSwap interval={2400} duration={460} angle={16} scale={1} />)
  const stage = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='card-swap'] > div")
  expect(mark(stage(swapSame))).toBe(mark(stage(swap)))
  expect(styleOf(stage(swap))).toContain("rotateX(16deg)")
  const swapTilt = render(<CardSwap angle={8} />)
  expect(styleOf(stage(swapTilt))).toContain("rotateX(8deg)")
})

test("键帽在减弱动效时过渡为 none", () => {
  installMatchMedia(true)
  render(<Keycap3D keys={["Q"]} />)
  expect(styleOf(screen.getByRole("button", { name: "Q" }))).toContain("transition: none")
})

test("链接预览、头像和指标卡", () => {
  const link = render(<LinkPreview href="#a" title="预览">查看</LinkPreview>)
  fireEvent.mouseEnter(q(link).getByRole("link"))
  const pop = link.container.querySelector(".absolute")
  expect(pop).toHaveClass("w-64")
  link.unmount()
  const linkWide = render(
    <LinkPreview href="#a" title="预览" size={180} intensity={1} scale={1} speed={1}>
      查看
    </LinkPreview>,
  )
  fireEvent.mouseEnter(q(linkWide).getByRole("link"))
  const popWide = linkWide.container.querySelector(".absolute")
  expect(popWide).not.toHaveClass("w-64")
  expect(styleOf(popWide)).toContain("180px")

  const avatars = render(<AvatarGroupTooltip />)
  const avatarsSame = render(<AvatarGroupTooltip max={4} scale={1} intensity={1} size={48} speed={1} />)
  expect(q(avatars).getAllByRole("button")).toHaveLength(q(avatarsSame).getAllByRole("button").length)
  expect(q(avatars).getByRole("button", { name: "林夏" })).toHaveClass("size-12")
  const avatarsFew = render(<AvatarGroupTooltip max={2} size={32} />)
  expect(q(avatarsFew).getAllByRole("button")).toHaveLength(3)
  expect(q(avatarsFew).getByRole("button", { name: "林夏" })).not.toHaveClass("size-12")
  expect(styleOf(q(avatarsFew).getByRole("button", { name: "林夏" }))).toContain("32px")

  const kpi = render(<KpiSparklineCard />)
  const kpiSame = render(<KpiSparklineCard size={80} />)
  const kpiTall = render(<KpiSparklineCard size={40} color="#ff0000" />)
  const chart = (view: ReturnType<typeof render>) => view.container.querySelector("svg")
  expect(mark(chart(kpiSame))).toBe(mark(chart(kpi)))
  expect(chart(kpi)).toHaveClass("h-20")
  expect(chart(kpi)?.querySelector("path")).toHaveAttribute("stroke", "currentColor")
  expect(chart(kpiTall)).not.toHaveClass("h-20")
  expect(styleOf(chart(kpiTall))).toContain("40px")
  expect(chart(kpiTall)?.querySelector("path")).toHaveAttribute("stroke", "#ff0000")
})

test("全息卡起始值沿用原动画，换色和强度改写样式", () => {
  const card = render(<HologramCard />)
  const cardSame = render(<HologramCard duration={1100} intensity={1} color="#67e8f9" />)
  const scan = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='hologram-card'] [aria-hidden='true']")
  expect(card.container.querySelector("style")?.textContent).toBe(cardSame.container.querySelector("style")?.textContent)
  expect(mark(scan(cardSame))).toBe(mark(scan(card)))
  expect(card.container.querySelector("[data-slot='hologram-card']")).toHaveClass("text-cyan-50")
  expect(styleOf(scan(card))).toContain("effect-ui-holo-scan 1.1s linear infinite")
  const cardHot = render(<HologramCard duration={2200} intensity={0.5} color="#ff0000" />)
  expect(cardHot.container.querySelector("[data-slot='hologram-card']")).not.toHaveClass("text-cyan-50")
  expect(styleOf(scan(cardHot))).toContain("2200ms")
  expect(styleOf(cardHot.container.querySelector("[data-slot='hologram-card']"))).toContain("rgb(255, 0, 0)")
})

test("全息卡减弱动效时清掉扫描动画", () => {
  installMatchMedia(true)
  const { container } = render(<HologramCard />)
  expect(styleOf(container.querySelector("[data-slot='hologram-card'] [aria-hidden='true']"))).not.toContain("animation")
})

