// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import type { ReactElement, RefObject } from "react"

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof import("motion/react")>("motion/react")
  const scrollYProgress = actual.motionValue(0)
  return { ...actual, useScroll: () => ({ scrollYProgress }) }
})

import { AuroraText } from "./aurora-text"
import { CountUp } from "./count-up"
import { CurvedLoop } from "./curved-loop"
import { FuzzyText } from "./fuzzy-text"
import { GhostTrailText } from "./ghost-trail-text"
import { HighlightText } from "./highlight-text"
import { LampHeading } from "./lamp-heading"
import { MorphingText } from "./morphing-text"
import { NumberFlow } from "./number-flow"
import { PetalDissolveText } from "./petal-dissolve-text"
import { RollingNumber } from "./rolling-number"
import { RollingTextHover } from "./rolling-text-hover"
import { RoughAnnotation } from "./rough-annotation"
import { ScrollTypography } from "./scroll-typography"
import { SplitFlapText } from "./split-flap-text"
import { SpoilerText } from "./spoiler-text"
import { Text3dScroll } from "./text-3d-scroll"
import { TextAlongPath } from "./text-along-path"
import { TextGenerate } from "./text-generate"
import { TextMorph } from "./text-morph"
import { TextPressure } from "./text-pressure"
import { TextReveal } from "./text-reveal"
import { TextRotate } from "./text-rotate"
import { TextVariableScroll } from "./text-variable-scroll"
import { TrueFocus } from "./true-focus"
import { VariableFontProximity } from "./variable-font-proximity"
import { VfxElement } from "./vfx-element"
import { WordRotate } from "./word-rotate"

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

beforeEach(() => {
  installMatchMedia(false)
  vi.stubGlobal("IntersectionObserver", SilentObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const type = { fontSize: 32, fontWeight: 700, letterSpacing: 0.05, align: "center" as const }
const typeWithoutWeight = { fontSize: 32, letterSpacing: 0.05, align: "center" as const }

function expectTyped(html: string, weight = true, align = true) {
  expect(html).toContain("font-size: 32px")
  expect(html).toContain("letter-spacing: 0.05em")
  if (align) {
    expect(html).toContain("text-align: center")
    expect(html).toContain("justify-content: center")
  }
  if (weight) expect(html).toContain("font-weight: 700")
}

const fontBox = { current: document.createElement("div") } as RefObject<HTMLElement | null>

const pairs: { name: string; plain: ReactElement; typed: ReactElement; weight?: boolean; align?: boolean }[] = [
  { name: "aurora-text", plain: <AuroraText>极光</AuroraText>, typed: <AuroraText {...type}>极光</AuroraText> },
  { name: "highlight-text", plain: <HighlightText>关键</HighlightText>, typed: <HighlightText {...type}>关键</HighlightText> },
  { name: "count-up", plain: <CountUp value={12} />, typed: <CountUp value={12} {...type} /> },
  {
    name: "text-rotate",
    plain: <TextRotate texts={["甲", "乙"]} />,
    typed: <TextRotate texts={["甲", "乙"]} {...type} />,
  },
  {
    name: "word-rotate",
    plain: <WordRotate words={["甲", "乙"]} />,
    typed: <WordRotate words={["甲", "乙"]} {...type} />,
  },
  {
    name: "morphing-text",
    plain: <MorphingText texts={["甲", "乙"]} />,
    typed: <MorphingText texts={["甲", "乙"]} {...type} />,
  },
  {
    name: "text-morph",
    plain: <TextMorph texts={["甲", "乙"]} />,
    typed: <TextMorph texts={["甲", "乙"]} {...type} />,
  },
  { name: "rolling-number", plain: <RollingNumber value={8} />, typed: <RollingNumber value={8} {...type} /> },
  { name: "text-reveal", plain: <TextReveal text="显现" />, typed: <TextReveal text="显现" {...type} /> },
  {
    name: "variable-font-proximity",
    plain: (
      <VariableFontProximity
        label="靠近"
        fromFontVariationSettings="'wght' 400"
        toFontVariationSettings="'wght' 900"
        containerRef={fontBox}
      />
    ),
    typed: (
      <VariableFontProximity
        label="靠近"
        fromFontVariationSettings="'wght' 400"
        toFontVariationSettings="'wght' 900"
        containerRef={fontBox}
        {...typeWithoutWeight}
      />
    ),
    weight: false,
  },
  { name: "number-flow", plain: <NumberFlow value={8} />, typed: <NumberFlow value={8} {...type} /> },
  { name: "spoiler-text", plain: <SpoilerText text="剧透" />, typed: <SpoilerText text="剧透" {...type} /> },
  {
    name: "text-along-path",
    plain: <TextAlongPath text="沿路" />,
    typed: <TextAlongPath text="沿路" {...type} />,
    align: false,
  },
  {
    name: "scroll-typography",
    plain: <ScrollTypography text="滚动" />,
    typed: <ScrollTypography text="滚动" {...type} />,
  },
  { name: "lamp-heading", plain: <LampHeading text="灯" />, typed: <LampHeading text="灯" {...type} /> },
  {
    name: "rough-annotation",
    plain: <RoughAnnotation>注</RoughAnnotation>,
    typed: <RoughAnnotation {...type}>注</RoughAnnotation>,
  },
  { name: "vfx-element", plain: <VfxElement>VFX</VfxElement>, typed: <VfxElement {...type}>VFX</VfxElement> },
  {
    name: "true-focus",
    plain: <TrueFocus sentence="看这里" />,
    typed: <TrueFocus sentence="看这里" {...type} />,
  },
  {
    name: "text-pressure",
    plain: <TextPressure text="压" />,
    typed: <TextPressure text="压" {...typeWithoutWeight} />,
    weight: false,
  },
  {
    name: "split-flap-text",
    plain: <SplitFlapText target="AB" />,
    typed: <SplitFlapText target="AB" {...type} />,
  },
  { name: "curved-loop", plain: <CurvedLoop text="环" />, typed: <CurvedLoop text="环" {...type} /> },
  { name: "ghost-trail-text", plain: <GhostTrailText text="影" />, typed: <GhostTrailText text="影" {...type} /> },
  { name: "text-generate", plain: <TextGenerate text="生成" />, typed: <TextGenerate text="生成" {...type} /> },
  {
    name: "text-variable-scroll",
    plain: <TextVariableScroll text="波" />,
    typed: <TextVariableScroll text="波" {...typeWithoutWeight} />,
    weight: false,
  },
  { name: "text-3d-scroll", plain: <Text3dScroll text="翻" />, typed: <Text3dScroll text="翻" {...type} /> },
  {
    name: "rolling-text-hover",
    plain: <RollingTextHover label="滚" />,
    typed: <RollingTextHover label="滚" {...type} />,
  },
]

for (const item of pairs) {
  test(`${item.name} 不传新排版时不写字号`, () => {
    const { container } = render(item.plain)
    expect(container.innerHTML).not.toContain("font-size")
    expect(container.innerHTML).not.toContain("justify-content")
  })

  test(`${item.name} 传入排版后写到样式上`, () => {
    const { container } = render(item.typed)
    expectTyped(container.innerHTML, item.weight !== false, item.align !== false)
  })
}

test("极光不传速度时保留原来的 7 秒类名", () => {
  render(<AuroraText>极光</AuroraText>)
  const node = screen.getByText("极光")
  expect(node.className).toContain("animate-[aurora-flow_7s_ease-in-out_infinite]")
  expect(node.className).toContain("motion-reduce:animate-none")
  expect(node).not.toHaveAttribute("style")
})

test("极光速度 2 把一轮收成 3.5 秒", () => {
  render(<AuroraText speed={2}>极光</AuroraText>)
  expect(screen.getByText("极光").getAttribute("style") ?? "").toContain("animation-duration: 3.5s")
})

test("灯罩不传颜色时仍用原来的渐变类", () => {
  const { container } = render(<LampHeading text="灯" />)
  expect(container.innerHTML).toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})

test("灯罩传默认色时仍用原来的渐变类", () => {
  const { container } = render(<LampHeading text="灯" color="#c4b5fd" />)
  expect(container.innerHTML).toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})

test("灯罩传入颜色后改成内联渐变", () => {
  const { container } = render(<LampHeading text="灯" color="#123456" />)
  expect(container.innerHTML).toContain("rgb(18, 52, 86)")
  expect(container.innerHTML).not.toContain("bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]")
})

test("路径文字不传对齐时起点仍是 0%", () => {
  const { container } = render(<TextAlongPath text="沿路" />)
  expect(container.innerHTML).toContain('startOffset="0%"')
  expect(container.innerHTML).not.toContain("text-anchor")
})

test("路径文字居中时锚在中点", () => {
  const { container } = render(<TextAlongPath text="沿路" align="center" />)
  expect(container.innerHTML).toContain('startOffset="50%"')
  expect(container.innerHTML).toContain('text-anchor="middle"')
})

test("画布文字不传新 prop 时仍有可读名称", () => {
  render(<FuzzyText text="SIGNAL" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<PetalDissolveText text="花瓣" />)
  expect(screen.getByLabelText("花瓣")).toBeInTheDocument()
})

test("画布文字传入新 prop 后名称还在", () => {
  render(<FuzzyText text="SIGNAL" fontSize={40} intensity={0.5} color="#ffffff" align="left" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<PetalDissolveText text="花瓣" fontSize={40} fontWeight={500} align="center" />)
  expect(screen.getByLabelText("花瓣")).toBeInTheDocument()
})

test("减弱动效时文字仍在", () => {
  installMatchMedia(true)
  render(<CountUp value={1280} />)
  expect(screen.getByText("1,280")).toBeInTheDocument()
  render(<AuroraText>极光</AuroraText>)
  expect(screen.getByText("极光")).toBeInTheDocument()
  const scrolled = render(<ScrollTypography text="滚动" />)
  expect(scrolled.container.textContent).toContain("滚动")
  render(<Text3dScroll text="翻过来" />)
  expect(screen.getByRole("heading", { name: "翻过来" })).toBeInTheDocument()
  render(<GhostTrailText text="影" />)
  expect(screen.getByRole("heading", { name: "影" })).toBeInTheDocument()
  render(<FuzzyText text="SIGNAL" />)
  expect(screen.getByLabelText("SIGNAL")).toBeInTheDocument()
  render(<SplitFlapText target="AB" />)
  expect(screen.getByRole("img", { name: "AB" })).toBeInTheDocument()
})
