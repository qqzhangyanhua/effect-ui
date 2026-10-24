// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"
import { useRef, useState } from "react"

import { CinemaSeatPicker } from "../effects/cinema-seat-picker"
import { ShareInvitePanel } from "../effects/share-invite-panel"
import { PolaroidScrollStack } from "../sections/polaroid-scroll-stack"
import { DepthFogGallery } from "../sections/depth-fog-gallery"
import { TelescopeZoomScroll } from "../sections/telescope-zoom-scroll"
import { CurvedScrollbar } from "../effects/curved-scrollbar"
import { useClickOutside } from "../hooks/use-click-outside"
import { useMeasure } from "../hooks/use-measure"
import { useControllableState } from "../hooks/use-controllable-state"
import { useDimensions } from "../hooks/use-dimensions"
import { useMousePosition } from "../hooks/use-mouse-position"
import { useMousePositionRef } from "../hooks/use-mouse-position-ref"
import { useElasticLineEvents } from "../hooks/use-elastic-line-events"
import { useDebouncedDimensions } from "../hooks/use-debounced-dimensions"
import { CategoryBar } from "../effects/category-bar"

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
  }))
  document.elementFromPoint = () => null
  HTMLElement.prototype.hasPointerCapture = () => false
  HTMLElement.prototype.setPointerCapture = () => {}
  HTMLElement.prototype.releasePointerCapture = () => {}
  HTMLElement.prototype.scrollIntoView = () => {}
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
  Object.getPrototypeOf(path).getTotalLength = () => 120
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function ClickOutsideProbe() {
  const ref = useRef<HTMLDivElement>(null)
  const [note, setNote] = useState("还在里面")
  useClickOutside(ref, () => setNote("点到外面了"))
  return (
    <div>
      <div ref={ref}>盒子</div>
      <button type="button">外面</button>
      <p>{note}</p>
    </div>
  )
}

function MeasureProbe() {
  const [ref, size] = useMeasure<HTMLDivElement>()
  return (
    <div ref={ref}>
      {size.width} × {size.height}
    </div>
  )
}

function ControllableProbe() {
  const [value, setValue] = useControllableState({ defaultValue: 1 })
  return (
    <button type="button" onClick={() => setValue((current) => current + 1)}>
      {value}
    </button>
  )
}

function DimensionsProbe() {
  const ref = useRef<HTMLDivElement>(null)
  const size = useDimensions(ref)
  return (
    <div ref={ref}>
      {size.width} × {size.height}
    </div>
  )
}

function MouseProbe() {
  const position = useMousePosition()
  return (
    <p>
      {position.x},{position.y}
    </p>
  )
}

function MouseRefProbe() {
  const position = useMousePositionRef()
  const [label, setLabel] = useState("未读")
  return (
    <button type="button" onClick={() => setLabel(`${position.current.x},${position.current.y}`)}>
      {label}
    </button>
  )
}

function ElasticProbe() {
  const ref = useRef<SVGSVGElement>(null)
  const events = useElasticLineEvents(ref, false, 20, 40)
  return (
    <div>
      <svg ref={ref} />
      <p>{events.isGrabbed ? "抓住了" : "没抓住"}</p>
    </div>
  )
}

function DebouncedProbe() {
  const ref = useRef<HTMLDivElement>(null)
  const size = useDebouncedDimensions(ref)
  return (
    <div ref={ref}>
      {size.width} × {size.height}
    </div>
  )
}

function movePointer(x: number, y: number) {
  const event = new MouseEvent("mousemove", { bubbles: true })
  Object.defineProperty(event, "clientX", { value: x })
  Object.defineProperty(event, "clientY", { value: y })
  window.dispatchEvent(event)
}

function stubElementBox(width: number, height: number) {
  const previous = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      width,
      height,
      toJSON() {
        return {}
      },
    }) as DOMRect
  return () => {
    Element.prototype.getBoundingClientRect = previous
  }
}

test("cinema seat picker selects an open seat", async () => {
  const user = userEvent.setup()
  render(<CinemaSeatPicker />)
  expect(screen.getByText("银幕")).toBeInTheDocument()
  expect(screen.getByText("尚未选座")).toBeInTheDocument()
  await user.click(screen.getByRole("gridcell", { name: "A1 可选" }))
  expect(screen.getByText("1 座 · ¥48")).toBeInTheDocument()
  expect(screen.queryByText("尚未选座")).not.toBeInTheDocument()
})

test("share invite panel adds an email", async () => {
  const user = userEvent.setup()
  render(<ShareInvitePanel />)
  expect(screen.getByRole("heading", { name: "邀请协作者" })).toBeInTheDocument()
  expect(screen.getByText("lin@example.com")).toBeInTheDocument()
  await user.type(screen.getByRole("textbox", { name: "邮箱，用逗号分隔" }), "a@b.co")
  await user.click(screen.getByRole("button", { name: "邀请" }))
  expect(screen.getByText("a@b.co")).toBeInTheDocument()
})

test("polaroid stack shows the first caption", () => {
  render(<PolaroidScrollStack />)
  expect(screen.getByText("向下滚动。相片从画面外甩进来，再叠成一摞。")).toBeInTheDocument()
  expect(screen.getByText("晨雾还没散")).toBeInTheDocument()
})

test("depth fog gallery shows the near window", () => {
  render(<DepthFogGallery />)
  expect(screen.getByText("近处的窗")).toBeInTheDocument()
  expect(screen.getByText("几乎看不见")).toBeInTheDocument()
})

test("telescope zoom shows the revealed caption", () => {
  render(<TelescopeZoomScroll />)
  expect(screen.getByRole("heading", { name: "再把整片夜空揭开。" })).toBeInTheDocument()
})

test("curved scrollbar shows its content", () => {
  render(
    <CurvedScrollbar>
      <p>弯轨里的段落</p>
    </CurvedScrollbar>,
  )
  expect(screen.getByText("弯轨里的段落")).toBeInTheDocument()
})

test("click outside reports a pointer outside the box", async () => {
  const user = userEvent.setup()
  render(<ClickOutsideProbe />)
  expect(screen.getByText("还在里面")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "外面" }))
  expect(screen.getByText("点到外面了")).toBeInTheDocument()
})

test("measure reports the element box", () => {
  render(<MeasureProbe />)
  expect(screen.getByText("0 × 0")).toBeInTheDocument()
})

test("controllable state keeps the uncontrolled value", async () => {
  const user = userEvent.setup()
  render(<ControllableProbe />)
  expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "1" }))
  expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument()
})

test("dimensions start from an empty box", () => {
  render(<DimensionsProbe />)
  expect(screen.getByText("0 × 0")).toBeInTheDocument()
})

test("mouse position follows the pointer", () => {
  render(<MouseProbe />)
  expect(screen.getByText("0,0")).toBeInTheDocument()
  act(() => {
    movePointer(12, 8)
  })
  expect(screen.getByText("12,8")).toBeInTheDocument()
})

test("mouse position ref can be read on demand", () => {
  render(<MouseRefProbe />)
  expect(screen.getByRole("button", { name: "未读" })).toBeInTheDocument()
  act(() => {
    movePointer(12, 8)
  })
  fireEvent.click(screen.getByRole("button", { name: "未读" }))
  expect(screen.getByRole("button", { name: "12,8" })).toBeInTheDocument()
})

test("elastic line grabs a pointer on the line", async () => {
  const restore = stubElementBox(200, 100)
  try {
    render(<ElasticProbe />)
    expect(screen.getByText("没抓住")).toBeInTheDocument()
    movePointer(30, 50)
    expect(await screen.findByText("抓住了")).toBeInTheDocument()
  } finally {
    restore()
  }
})

test("debounced dimensions start from an empty box", () => {
  render(<DebouncedProbe />)
  expect(screen.getByText("0 × 0")).toBeInTheDocument()
})

test("category bar shows the total of its values", () => {
  render(<CategoryBar values={[40, 60]} />)
  expect(screen.getByLabelText("分段比例")).toBeInTheDocument()
  expect(screen.getByText("0")).toBeInTheDocument()
  expect(screen.getByText("100")).toBeInTheDocument()
})
