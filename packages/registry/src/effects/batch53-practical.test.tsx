// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ActionSwap } from "./action-swap"
import { ArcPicker } from "./arc-picker"
import { BlurUpImage } from "./blur-up-image"
import { ChromaticTextReveal } from "./chromatic-text-reveal"
import { KnockoutBracket, type Match, type Round } from "./knockout-bracket"
import { NewItemsPill } from "./new-items-pill"
import { OverflowActions } from "./overflow-actions"
import { PressDepth } from "./press-depth"
import { PreviewRail } from "./preview-rail"
import { PullToRefresh } from "./pull-to-refresh"
import { RulerSlider } from "./ruler-slider"
import { TypingIndicator } from "./typing-indicator"
import { ValueFlash } from "./value-flash"
import { WalletCard } from "./wallet-card"

afterEach(() => {
  cleanup()
})

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

class SizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: {
            x: 0,
            y: 0,
            width: 640,
            height: 480,
            top: 0,
            left: 0,
            bottom: 480,
            right: 640,
            toJSON() {
              return {}
            },
          },
        } as ResizeObserverEntry,
      ],
      this as unknown as ResizeObserver,
    )
  }

  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("IntersectionObserver", IntersectingObserver)
vi.stubGlobal("ResizeObserver", SizeObserver)
Object.defineProperty(document, "fonts", {
  configurable: true,
  value: { ready: Promise.resolve() },
})
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: query.includes("prefers-reduced-motion"),
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return false
  },
}))

function match(id: string, home: string, away: string): Match {
  return {
    id,
    home: { team: { name: home }, score: 1 },
    away: { team: { name: away }, score: 0 },
    winner: "home",
    status: "finished",
  }
}

const rounds: Round[] = [
  { name: "四分之一决赛", matches: [match("q1", "青队", "赤队")] },
  { name: "半决赛", matches: [match("s1", "青队", "白队")] },
  { name: "决赛", matches: [match("f1", "青队", "黑队")] },
]

test("下压、弧选、对阵和钱包在减弱动效下仍可操作", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const onPress = vi.fn()
  const onRefresh = vi.fn()
  const onJump = vi.fn()
  const onArc = vi.fn()
  const { rerender } = render(
    <div>
      <PressDepth onClick={onPress}>按下</PressDepth>
      <ValueFlash value={12} label="读数" />
      <BlurUpImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="山坡" width={64} height={40} />
      <BlurUpImage src="https://invalid.example/missing.png" alt="缺图" width={64} height={40} />
      <ChromaticTextReveal prefix="Motion that feels" />
      <ActionSwap />
      <PullToRefresh onRefresh={onRefresh}>
        <p>列表</p>
      </PullToRefresh>
      <ArcPicker
        options={[
          { value: "zi", label: "子" },
          { value: "chou", label: "丑" },
        ]}
        defaultValue="zi"
        onValueChange={onArc}
        aria-label="时辰"
      />
      <NewItemsPill count={2} onJump={onJump} />
      <TypingIndicator typists={["林"]} />
      <KnockoutBracket rounds={rounds} initialRound={0} />
      <RulerSlider min={40} max={120} step={0.5} defaultValue={72.5} aria-label="体重" />
      <OverflowActions
        primaryActions={[{ id: "preview", label: "预览" }]}
        overflowActions={[{ id: "branch", label: "分支" }]}
      />
      <PreviewRail items={[{ id: "intro", label: "序言", description: "从这里开始。" }]} />
      <WalletCard accounts={[{ id: "daily", name: "日常", address: "0x12ab34cd90ef" }]} balance={20} />
    </div>,
  )

  await user.click(screen.getByRole("button", { name: "按下" }))
  expect(onPress).toHaveBeenCalled()

  rerender(
    <div>
      <PressDepth onClick={onPress}>按下</PressDepth>
      <ValueFlash value={18} label="读数" />
      <BlurUpImage src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" alt="山坡" width={64} height={40} />
      <BlurUpImage src="https://invalid.example/missing.png" alt="缺图" width={64} height={40} />
      <ChromaticTextReveal prefix="Motion that feels" />
      <ActionSwap />
      <PullToRefresh onRefresh={onRefresh}>
        <p>列表</p>
      </PullToRefresh>
      <ArcPicker
        options={[
          { value: "zi", label: "子" },
          { value: "chou", label: "丑" },
        ]}
        defaultValue="zi"
        onValueChange={onArc}
        aria-label="时辰"
      />
      <NewItemsPill count={2} onJump={onJump} />
      <TypingIndicator typists={["林"]} />
      <KnockoutBracket rounds={rounds} initialRound={0} />
      <RulerSlider min={40} max={120} step={0.5} defaultValue={72.5} aria-label="体重" />
      <OverflowActions
        primaryActions={[{ id: "preview", label: "预览" }]}
        overflowActions={[{ id: "branch", label: "分支" }]}
      />
      <PreviewRail items={[{ id: "intro", label: "序言", description: "从这里开始。" }]} />
      <WalletCard accounts={[{ id: "daily", name: "日常", address: "0x12ab34cd90ef" }]} balance={20} />
    </div>,
  )
  expect(screen.getByText("18")).toBeInTheDocument()

  expect(screen.getByRole("img", { name: "山坡" })).toBeInTheDocument()
  fireEvent.error(screen.getByRole("img", { name: "缺图" }))
  expect(screen.getByRole("img", { name: "缺图 failed to load" })).toBeInTheDocument()

  expect(screen.getByText(/Motion that feels/)).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Copy link" }))
  expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Refresh" }))
  await waitFor(() => expect(onRefresh).toHaveBeenCalled())

  await user.click(screen.getByRole("radio", { name: "丑" }))
  expect(onArc).toHaveBeenCalledWith("chou")

  await user.click(screen.getByRole("button", { name: "2 new items" }))
  expect(onJump).toHaveBeenCalled()

  expect(screen.getAllByText("林 is typing").length).toBeGreaterThan(0)

  expect(screen.getAllByText("青队").length).toBeGreaterThan(0)
  const before = screen.getByText(/Showing/).textContent
  await user.click(screen.getByRole("button", { name: "Next round" }))
  expect(screen.getByText(/Showing/).textContent).not.toBe(before)

  const slider = screen.getByRole("slider", { name: "体重" })
  slider.focus()
  await user.keyboard("{ArrowRight}")
  expect(slider).toHaveAttribute("aria-valuenow", "73")

  await user.click(screen.getByRole("button", { name: "Show extra actions" }))
  expect(screen.getByRole("button", { name: "分支" })).toBeInTheDocument()

  await user.hover(screen.getByRole("button", { name: "序言" }))
  expect(screen.getByText("从这里开始。")).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Hide balance" }))
  expect(screen.getByRole("button", { name: "Show balance" })).toBeInTheDocument()
})
