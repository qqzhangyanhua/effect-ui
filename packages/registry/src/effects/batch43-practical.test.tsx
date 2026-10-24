// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"

import { CollabAvatar } from "./collab-avatar"
import { CosmicButton } from "./cosmic-button"
import { ElapsedTimer } from "./elapsed-timer"
import { FoldedCard } from "./folded-card"
import { GlowTrackButton } from "./glow-track-button"
import { HaloSwitch } from "./halo-switch"
import { LightBoard } from "./lightboard"
import { NeumorphButton } from "./neumorph-button"

import { ShiftCard } from "./shift-card"
import { SidePanel } from "./side-panel"
import { SpeechBubble } from "./speech-bubble"
import { SquiggleArrow } from "./squiggle-arrow"
import { TextureCard } from "./texture-card"

let reduceMotion = false

afterEach(() => {
  cleanup()
  reduceMotion = false
})

class IntersectingObserver {
  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element) {
    this.callback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
  }

  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion") ? reduceMotion : false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

test("减弱动效时灯板、光环和计时保持可读", () => {
  reduceMotion = true
  const { container } = render(
    <div>
      <LightBoard disableDrawing={false} text="HI" />
      <CosmicButton href="#local">星图</CosmicButton>
      <GlowTrackButton text="光" />
      <HaloSwitch aria-label="夜航" defaultChecked />
      <SquiggleArrow direction="up" variant="bouncy" />
      <ElapsedTimer loading />
      <NeumorphButton loading>提交中</NeumorphButton>
    </div>,
  )
  expect(container.querySelector("[data-slot=lightboard]")).toHaveAttribute("data-reduced", "true")
  expect(container.querySelector("[data-slot=lightboard] canvas")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "星图" })).toHaveAttribute("data-motion", "off")
  expect(screen.getByRole("button", { name: "光" })).toHaveAttribute("data-reduced", "true")
  expect(screen.getByRole("switch", { name: "夜航" })).toBeInTheDocument()
  expect(container.querySelector("[data-slot=squiggle-arrow]")).toHaveAttribute("data-direction", "up")
  expect(container.querySelector("[data-slot=squiggle-arrow]")).toHaveAttribute("data-variant", "bouncy")
  expect(screen.getByRole("timer")).toHaveAttribute("data-motion", "off")
  expect(screen.getByRole("button", { name: "提交中" })).toHaveAttribute("data-reduced", "true")
})

test("开关、侧栏和班次卡片能切换状态", () => {
  const { container } = render(
    <div>
      <HaloSwitch aria-label="夜航" />
      <SidePanel
        handlePanelOpen={() => {}}
        panelOpen
        renderButton={(toggle) => (
          <button type="button" onClick={toggle}>
            展开面板
          </button>
        )}
      >
        备注
      </SidePanel>
      <ShiftCard bottomContent="底部" middleContent="中部" topContent="顶部" />
      <SpeechBubble showCursor={false}>对齐</SpeechBubble>
      <FoldedCard badge="草稿" description="说明" title="现场笔记" />
      <CollabAvatar color="#7C3AED" name="林夏" size={44} />
      <TextureCard>纹理</TextureCard>
    </div>,
  )
  const toggle = screen.getByRole("switch", { name: "夜航" })
  expect(toggle).toHaveAttribute("aria-checked", "false")
  fireEvent.click(toggle)
  expect(toggle).toHaveAttribute("aria-checked", "true")
  expect(container.querySelector("[data-slot=side-panel]")).toHaveAttribute("data-state", "open")
  expect(screen.getByText("备注")).toBeInTheDocument()
  const card = container.querySelector("[data-slot=shift-card]")
  expect(card).toHaveAttribute("data-state", "closed")
  if (card) fireEvent.mouseEnter(card)
  expect(card).toHaveAttribute("data-state", "open")
  expect(screen.getByText("对齐")).toBeInTheDocument()
  expect(screen.getByText("现场笔记")).toBeInTheDocument()
  expect(screen.getByRole("img", { name: "林夏" })).toHaveTextContent("林夏")
  expect(container.querySelector("[data-slot=texture-card]")).toHaveTextContent("纹理")
})
