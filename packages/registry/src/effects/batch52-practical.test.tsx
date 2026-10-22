// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { BlindPullToggle } from "./blind-pull-toggle"
import { DangerStripes } from "./danger-stripes"
import { DiamondGrid } from "./diamond-grid"
import { FlipCalendar } from "./flip-calendar"
import { AiJobCards } from "./job-listing-cards"
import { LabelCards } from "./label-cards"
import { MoodTracker } from "./mood-tracker"
import { GlassMusicPlayer } from "./music-player-card"
import { NewProjectModal } from "./new-project-modal"
import { SliceType } from "./slice-type"
import { StackTower } from "./stack-tower"
import { TagaToggle } from "./taga-toggle"
import { VoiceChatPill } from "./voice-chat-pill"
import { WildMorph } from "./wild-morph"

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

const svgProto = SVGElement.prototype as SVGElement & { getBBox?: () => DOMRect }
svgProto.getBBox = () => ({ x: 0, y: -20, width: 120, height: 40, top: -20, right: 120, bottom: 20, left: 0, toJSON() { return {} } }) as DOMRect

test("百叶、日历、心情和对话框在减弱动效下仍可操作", async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 })
  const onValueChange = vi.fn()
  render(
    <div>
      <BlindPullToggle />
      <TagaToggle />
      <FlipCalendar value={12} onValueChange={onValueChange} />
      <SliceType />
      <StackTower />
      <DangerStripes trigger="mount" />
      <DiamondGrid />
      <WildMorph />
      <MoodTracker />
      <VoiceChatPill />
      <AiJobCards />
      <NewProjectModal />
      <GlassMusicPlayer />
      <LabelCards />
    </div>,
  )

  const blind = screen.getByRole("button", { name: "Dark" })
  expect(blind).toHaveAttribute("aria-pressed", "true")
  await user.click(blind)
  expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "false")

  const face = screen.getByRole("switch", { name: "Toggle" })
  expect(face).toHaveAttribute("aria-checked", "false")
  await user.click(face)
  expect(face).toHaveAttribute("aria-checked", "true")

  await user.click(screen.getByRole("button", { name: "Next day" }))
  expect(onValueChange).toHaveBeenCalledWith(13)
  expect(screen.getAllByText("13").length).toBeGreaterThan(0)

  expect(screen.getByLabelText("LIGHT / NIGHT")).toBeInTheDocument()
  expect(screen.getAllByText("STACK").length).toBeGreaterThan(0)
  expect(screen.getAllByText(/DANGER/).length).toBeGreaterThan(0)
  expect(document.querySelector("canvas")).toBeTruthy()
  expect(screen.getByText("wild")).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Save mood" }))
  expect(screen.getByText("Recorded")).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "Open live session" }))
  expect(screen.getByText("Live Session")).toBeInTheDocument()
  expect(screen.getByText("David")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Close live session" }))

  const nextCard = () => screen.getAllByRole("button", { name: "Next card" })[0]
  expect(nextCard()?.parentElement?.querySelector("h3")).toHaveTextContent("Prompt Engineer")
  await user.click(nextCard()!)
  await waitFor(() => {
    expect(nextCard()?.parentElement?.querySelector("h3")).toHaveTextContent("AI Safety Researcher")
  })

  await user.click(screen.getByRole("button", { name: /Mobile Apps/ }))
  expect(screen.getByRole("button", { name: /Mobile Apps/ })).toHaveAttribute("aria-pressed", "true")

  await user.click(screen.getByRole("button", { name: "Play" }))
  expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: "New Project" }))
  const title = await screen.findByPlaceholderText("Title")
  await waitFor(() => expect(title).toHaveFocus())
  await user.tab({ shift: true })
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus()
  await user.tab({ shift: true })
  expect(screen.getByRole("button", { name: "Create" })).toHaveFocus()
  await user.click(screen.getByRole("button", { name: "Create" }))
  expect(screen.getByText("Title is required")).toBeInTheDocument()
  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
})
