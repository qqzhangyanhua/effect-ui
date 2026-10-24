// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { AppleActivityCard } from "./apple-activity-card"
import { AppleCardsCarousel } from "./apple-cards-carousel"
import { AtroposCard } from "./atropos-card"
import { AvatarGroupTooltip } from "./avatar-group-tooltip"
import { BentoGrid } from "./bento-grid"
import { BookFlip } from "./book-flip"
import { BorderBeam } from "./border-beam"
import { BoxCarousel } from "./box-carousel"
import { CardSwap } from "./card-swap"
import { CircularGallery } from "./circular-gallery"
import { CoverflowCarousel } from "./coverflow-carousel"
import { EvervaultCard } from "./evervault-card"
import { ExpandableCard } from "./expandable-card"
import { FlipCard } from "./flip-card"
import { FolderReveal } from "./folder-reveal"
import { GlassCard } from "./glass-card"
import { GlowingEdge } from "./glowing-edge"
import { GradientCarousel3d } from "./gradient-carousel-3d"
import { HologramCard } from "./hologram-card"
import { HolographicFoil } from "./holographic-foil"
import { HoverLift } from "./hover-lift"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "./image-comparison"
import { KpiSparklineCard } from "./kpi-sparkline-card"
import { LinkPreview } from "./link-preview"
import { MorphingDialog, MorphingDialogTrigger } from "./morphing-dialog"
import { PerspectiveCard } from "./perspective-card"
import { PixelCanvasCard } from "./pixel-canvas-card"
import { ProjectUpdateCard } from "./project-update-card"
import { ShineBorder } from "./shine-border"
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
  const flip = render(<FlipCard front="正" back="背" />)
  const flipSame = render(<FlipCard front="正" back="背" duration={500} />)
  const flipFast = render(<FlipCard front="正" back="背" duration={200} />)
  const flipNode = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='flip-card'] > div")
  expect(mark(flipNode(flipSame))).toBe(mark(flipNode(flip)))
  expect(flipNode(flip)).toHaveClass("duration-500")
  expect(flipNode(flipFast)).not.toHaveClass("duration-500")
  expect(styleOf(flipNode(flipFast))).toContain("200ms")

  const glass = render(<GlassCard>玻璃</GlassCard>)
  const glassSame = render(<GlassCard intensity={1} size={24}>玻璃</GlassCard>)
  const glassThin = render(<GlassCard intensity={0.5} size={8}>玻璃</GlassCard>)
  const glassNode = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='glass-card']")
  expect(mark(glassNode(glassSame))).toBe(mark(glassNode(glass)))
  expect(glassNode(glass)).toHaveClass("backdrop-blur-xl", "bg-white/8")
  expect(styleOf(glassNode(glass))).toBe("")
  expect(glassNode(glassThin)).not.toHaveClass("backdrop-blur-xl")
  expect(styleOf(glassNode(glassThin))).toContain("blur(8px)")

  const shine = render(<ShineBorder>光</ShineBorder>)
  const shineSame = render(<ShineBorder duration={10} size={1} intensity={1}>光</ShineBorder>)
  const shineWide = render(<ShineBorder size={4} intensity={2}>光</ShineBorder>)
  const shineSpan = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='shine-border'] span")
  expect(mark(shineSpan(shineSame))).toBe(mark(shineSpan(shine)))
  expect(styleOf(shineSpan(shine))).toContain("12%")
  expect(styleOf(shineSpan(shineWide))).toContain("24%")
  expect(styleOf(shineSpan(shineWide))).toContain("padding: 4px")

  const lift = render(<HoverLift>抬</HoverLift>)
  const liftSame = render(<HoverLift duration={300} intensity={1}>抬</HoverLift>)
  const liftHigh = render(<HoverLift intensity={2}>抬</HoverLift>)
  const liftNode = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='hover-lift']")
  expect(mark(liftNode(liftSame))).toBe(mark(liftNode(lift)))
  expect(liftNode(lift)).toHaveClass("duration-300", "hover:-translate-y-1.5")
  expect(styleOf(liftNode(lift))).toBe("")
  expect(liftNode(liftHigh)).toHaveClass("hover:-translate-y-[var(--lift)]")
  expect(styleOf(liftNode(liftHigh))).toContain("12px")
})

test("光束、便当、透视、对比：起始值沿用原 class", () => {
  const beam = render(<BorderBeam>束</BorderBeam>)
  const beamSame = render(<BorderBeam duration={8} size={1} intensity={1}>束</BorderBeam>)
  const beamWide = render(<BorderBeam size={3} intensity={2}>束</BorderBeam>)
  const beamSpan = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='border-beam'] span")
  expect(mark(beamSpan(beamSame))).toBe(mark(beamSpan(beam)))
  expect(styleOf(beamSpan(beam))).toContain("30%")
  expect(styleOf(beamSpan(beam))).toContain("8s")
  expect(styleOf(beamSpan(beamWide))).toContain("padding: 3px")
  expect(styleOf(beamSpan(beamWide))).not.toContain("30%")

  const bento = render(<BentoGrid />)
  const bentoSame = render(<BentoGrid gap={12} count={3} size={160} />)
  const bentoLoose = render(<BentoGrid gap={20} count={2} size={200} />)
  const bentoNode = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='bento-grid']")
  expect(mark(bentoNode(bentoSame))).toBe(mark(bentoNode(bento)))
  expect(bentoNode(bento)).toHaveClass("gap-3", "grid-cols-3", "auto-rows-[10rem]")
  expect(styleOf(bentoNode(bento))).toBe("")
  expect(bentoNode(bentoLoose)).not.toHaveClass("gap-3")
  expect(styleOf(bentoNode(bentoLoose))).toContain("20px")
  expect(styleOf(bentoNode(bentoLoose))).toContain("200px")

  const tilt = render(<PerspectiveCard>层</PerspectiveCard>)
  const tiltSame = render(<PerspectiveCard angle={16} size={28}>层</PerspectiveCard>)
  const tiltFar = render(<PerspectiveCard size={40}>层</PerspectiveCard>)
  const tiltInner = (view: ReturnType<typeof render>) => view.container.querySelector("[data-slot='perspective-card'] > div")
  expect(mark(tiltInner(tiltSame))).toBe(mark(tiltInner(tilt)))
  expect(tiltInner(tilt)).toHaveClass("[transform:translateZ(28px)]")
  expect(styleOf(tiltInner(tiltFar))).toContain("translateZ(40px)")

  const before = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"
  const compare = (color?: string, size?: number, enableHover?: boolean) =>
    render(
      <ImageComparison enableHover={enableHover} color={color} size={size}>
        <ImageComparisonImage src={before} alt="前" position="left" />
        <ImageComparisonImage src={before} alt="后" position="right" />
        <ImageComparisonSlider />
      </ImageComparison>,
    )
  const plain = compare()
  const same = compare("#ffffff", 2, false)
  const thick = compare("#ff0000", 8, true)
  const slider = (view: ReturnType<typeof render>) => view.container.querySelector(".cursor-ew-resize.absolute, .absolute.cursor-ew-resize")
  expect(mark(slider(same))).toBe(mark(slider(plain)))
  expect(slider(plain)).toHaveClass("bg-white", "w-0.5")
  expect(slider(thick)).not.toHaveClass("w-0.5")
  expect(styleOf(slider(thick))).toContain("8px")
  expect(thick.container.firstElementChild).toHaveClass("cursor-ew-resize")
  expect(plain.container.firstElementChild).not.toHaveClass("cursor-ew-resize")
})

test("可展开卡片只暴露标题，项目更新没有新的效果旋钮", () => {
  render(
    <ExpandableCard title="可展开卡片" preview="预览">
      正文
    </ExpandableCard>,
  )
  expect(screen.getByRole("button", { name: /可展开卡片/ })).toBeInTheDocument()
  cleanup()
  render(<ProjectUpdateCard />)
  expect(screen.getByRole("heading", { name: "项目更新" })).toBeInTheDocument()
})

test("变形对话框关闭时，450 毫秒与回弹 0.15 不改变触发器", () => {
  const omitted = render(
    <MorphingDialog>
      <MorphingDialogTrigger>打开</MorphingDialogTrigger>
    </MorphingDialog>,
  )
  const omittedMark = mark(omitted.container.querySelector("button"))
  omitted.unmount()
  const same = render(
    <MorphingDialog duration={450} intensity={0.15}>
      <MorphingDialogTrigger>打开</MorphingDialogTrigger>
    </MorphingDialog>,
  )
  expect(mark(same.container.querySelector("button"))).toBe(omittedMark)
})

test("箔膜和发光边沿用原 class", () => {
  const foil = render(<HolographicFoil>箔</HolographicFoil>)
  const foilSame = render(
    <HolographicFoil angle={14} intensity={0.8} colors={["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#ff4d6d"]}>
      箔
    </HolographicFoil>,
  )
  const foilHot = render(<HolographicFoil intensity={0.4} colors={["#ff0000", "#00ff00"]}>箔</HolographicFoil>)
  const foilLayer = (view: ReturnType<typeof render>) => view.container.querySelector(".mix-blend-color-dodge")
  expect(mark(foilLayer(foilSame))).toBe(mark(foilLayer(foil)))
  expect(foilLayer(foil)).toHaveClass("opacity-80")
  expect(foilLayer(foilHot)).not.toHaveClass("opacity-80")
  expect(styleOf(foilLayer(foilHot))).toContain("#ff0000")

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
  const pixels = render(<PixelCanvasCard>像素</PixelCanvasCard>)
  const pixelsSame = render(
    <PixelCanvasCard colors={["#e0f2fe", "#7dd3fc", "#0ea5e9"]} gap={6} speed={35}>
      像素
    </PixelCanvasCard>,
  )
  expect(pixels.container.querySelector("canvas")).toBeTruthy()
  expect(pixelsSame.container.querySelector("canvas")).toBeTruthy()
  expect(q(pixels).getByText("像素")).toBeInTheDocument()

  const atropos = render(<AtroposCard />)
  const atroposSame = render(<AtroposCard intensity={1} />)
  const atroposFlat = render(<AtroposCard intensity={0.5} />)
  const offsets = (view: ReturnType<typeof render>) =>
    [...view.container.querySelectorAll("[data-atropos-offset]")].map((node) => node.getAttribute("data-atropos-offset")).join(",")
  expect(offsets(atroposSame)).toBe(offsets(atropos))
  expect(offsets(atropos)).toBe("-8,-2,6")
  expect(offsets(atroposFlat)).toBe("-4,-1,3")

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

test("封面流、书、文件夹、方盒和活动环", () => {
  const flow = render(<CoverflowCarousel />)
  const flowSame = render(<CoverflowCarousel angle={42} scale={1} speed={1} />)
  expect(q(flow).getAllByRole("button", { name: "Shaders" })).toHaveLength(1)
  expect(q(flowSame).getAllByRole("button", { name: "Shaders" })).toHaveLength(1)

  const book = render(<BookFlip />)
  const bookSame = render(<BookFlip angle={155} speed={1} colors={["#7c3aed", "#1e1b4b"]} />)
  const bookRed = render(<BookFlip colors={["#ff0000", "#0000ff"]} />)
  const cover = (view: ReturnType<typeof render>) => view.container.querySelector(".origin-left")
  expect(mark(cover(bookSame))).toBe(mark(cover(book)))
  expect(cover(book)).toHaveClass("bg-[linear-gradient(160deg,#7c3aed,#1e1b4b)]")
  expect(styleOf(cover(book))).toBe("")
  expect(cover(bookRed)).not.toHaveClass("bg-[linear-gradient(160deg,#7c3aed,#1e1b4b)]")
  expect(styleOf(cover(bookRed))).toContain("rgb(255, 0, 0)")

  const folder = render(<FolderReveal />)
  const folderSame = render(<FolderReveal duration={300} angle={14} intensity={1} />)
  const hero = (view: ReturnType<typeof render>) => q(view).getByText("Hero").parentElement
  expect(mark(hero(folderSame))).toBe(mark(hero(folder)))
  expect(hero(folder)).toHaveClass("duration-300")
  fireEvent.pointerEnter(folder.container.firstElementChild as Element)
  expect(styleOf(hero(folder))).toContain("rotate(-14deg)")
  expect(styleOf(hero(folder))).toContain("-6.65rem")
  const folderWide = render(<FolderReveal angle={20} intensity={2} duration={800} />)
  fireEvent.pointerEnter(folderWide.container.firstElementChild as Element)
  expect(hero(folderWide)).not.toHaveClass("duration-300")
  expect(styleOf(hero(folderWide))).toContain("rotate(-20deg)")
  expect(styleOf(hero(folderWide))).toContain("-13.15rem")
  expect(styleOf(hero(folderWide))).toContain("800ms")

  const box = render(<BoxCarousel />)
  const boxSame = render(<BoxCarousel speed={1} size={176} />)
  const boxSmall = render(<BoxCarousel size={100} />)
  const cube = (view: ReturnType<typeof render>) => view.container.querySelector(".preserve-3d, [class*='preserve-3d']")
  expect(cube(boxSame)).toHaveClass("size-44")
  expect(cube(box)).toHaveClass("size-44")
  expect(styleOf(cube(box))).toBe("")
  expect(cube(boxSmall)).not.toHaveClass("size-44")
  expect(styleOf(boxSmall.container.querySelector(".absolute"))).toContain("translateZ(50px)")

  const rings = render(<AppleActivityCard />)
  const ringsSame = render(<AppleActivityCard size={168} duration={800} />)
  const ringsSmall = render(<AppleActivityCard size={84} />)
  expect(rings.container.querySelector("svg")).toHaveAttribute("width", "168")
  expect(ringsSame.container.querySelector("svg")).toHaveAttribute("width", "168")
  expect(ringsSmall.container.querySelector("svg")).toHaveAttribute("width", "84")
})

test("文件夹在减弱动效时去掉 duration-300", () => {
  installMatchMedia(true)
  render(<FolderReveal />)
  expect(screen.getByText("Hero").parentElement).not.toHaveClass("duration-300")
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

test("渐变旋转木马首帧写出转角和缩放，减弱动效改成横滑", () => {
  const deck = render(<GradientCarousel3d />)
  const deckSame = render(<GradientCarousel3d speed={1} angle={42} scale={1} intensity={1} />)
  const transforms = (view: ReturnType<typeof render>) =>
    [...view.container.querySelectorAll("article")].map((node) => styleOf(node)).join("|")
  expect(transforms(deckSame)).toBe(transforms(deck))
  expect(transforms(deck)).toContain("scale(1.18)")
  expect(transforms(deck)).toContain("rotateY(-42deg)")
  const deckWide = render(<GradientCarousel3d angle={20} scale={2} />)
  expect(transforms(deckWide)).toContain("scale(2.36)")
  expect(transforms(deckWide)).toContain("rotateY(-20deg)")
  deck.unmount()
  installMatchMedia(true)
  const reduced = render(<GradientCarousel3d />)
  expect(reduced.container.querySelector("[data-slot='gradient-carousel-3d']")).toHaveClass("overflow-x-auto")
  expect(styleOf(reduced.container.querySelector("article"))).not.toContain("rotateY")
})
