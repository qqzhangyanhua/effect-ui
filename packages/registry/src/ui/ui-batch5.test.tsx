// @vitest-environment jsdom

import { useState } from "react"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ButtonGroup } from "./button-group"
import { Kbd } from "./kbd"
import { Item, ItemDescription, ItemTitle } from "./item"
import { NativeSelect, NativeSelectOption } from "./native-select"
import { DatePicker } from "./date-picker"
import { VirtualList } from "./virtual-list"
import { InfiniteScroll } from "./infinite-scroll"
import { MasonryGallery } from "./masonry-gallery"
import { Lightbox } from "./lightbox"
import { PhoneInput } from "./phone-input"
import { PasswordStrength } from "./password-strength"
import { CurrencyInput } from "./currency-input"
import { QuantityStepper } from "./quantity-stepper"
import { FloatingLabelInput } from "./floating-label-input"
import { EmojiPicker } from "./emoji-picker"

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

test("button group shows both actions", () => {
  render(
    <ButtonGroup>
      <button type="button">北窗</button>
      <button type="button">南港</button>
    </ButtonGroup>,
  )
  expect(screen.getByRole("group")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "北窗" })).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "南港" })).toBeInTheDocument()
})

test("kbd shows the key", () => {
  render(<Kbd>⌘K</Kbd>)
  expect(screen.getByText("⌘K")).toBeInTheDocument()
})

test("item shows the title and description", () => {
  render(
    <Item>
      <ItemTitle>灯塔</ItemTitle>
      <ItemDescription>夜里能看见。</ItemDescription>
    </Item>,
  )
  expect(screen.getByText("灯塔")).toHaveAttribute("data-slot", "item-title")
  expect(screen.getByText("夜里能看见。")).toBeInTheDocument()
})

test("native select changes the port", async () => {
  const user = userEvent.setup()
  render(
    <NativeSelect aria-label="港口" defaultValue="north">
      <NativeSelectOption value="north">北窗</NativeSelectOption>
      <NativeSelectOption value="south">南港</NativeSelectOption>
    </NativeSelect>,
  )
  const select = screen.getByRole("combobox", { name: "港口" })
  await user.selectOptions(select, "south")
  expect(select).toHaveValue("south")
  expect(screen.getByRole("option", { name: "南港" })).toBeInTheDocument()
})

test("date picker shows the placeholder", () => {
  render(<DatePicker />)
  expect(screen.getByRole("button", { name: "选择日期" })).toBeInTheDocument()
})

function stubClientBox(width: number, height: number) {
  const previous = {
    clientWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth"),
    clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight"),
  }
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => width })
  Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => height })
  return () => {
    if (previous.clientWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", previous.clientWidth)
    else Reflect.deleteProperty(HTMLElement.prototype, "clientWidth")
    if (previous.clientHeight) Object.defineProperty(HTMLElement.prototype, "clientHeight", previous.clientHeight)
    else Reflect.deleteProperty(HTMLElement.prototype, "clientHeight")
  }
}

test("virtual list renders the first port", () => {
  const restore = stubClientBox(300, 320)
  try {
    render(<VirtualList items={["北窗", "南港"]} renderItem={(item) => <span>{item}</span>} />)
    expect(screen.getByText("北窗")).toBeInTheDocument()
  } finally {
    restore()
  }
})

test("infinite scroll shows the loaded page", () => {
  render(<InfiniteScroll onLoadMore={() => undefined}>第一页</InfiniteScroll>)
  expect(screen.getByText("第一页")).toBeInTheDocument()
  expect(screen.getByText("继续滚动")).toBeInTheDocument()
})

test("masonry gallery shows the photo", () => {
  const restore = stubClientBox(800, 600)
  try {
    render(
      <MasonryGallery
        photos={[{ src: "https://example.com/lamp.jpg", width: 800, height: 600, alt: "灯塔" }]}
      />,
    )
    expect(screen.getByRole("img", { name: "灯塔" })).toBeInTheDocument()
  } finally {
    restore()
  }
})

test("lightbox shows the open slide", () => {
  render(
    <Lightbox
      open
      slides={[{ src: "https://example.com/lamp.jpg", alt: "灯塔" }]}
      onClose={() => undefined}
    />,
  )
  expect(screen.getByRole("dialog", { name: "Lightbox" })).toBeInTheDocument()
  expect(screen.getAllByRole("img", { name: "灯塔" }).length).toBeGreaterThan(0)
})

test("phone input shows the placeholder", () => {
  render(<PhoneInput />)
  expect(screen.getByPlaceholderText("手机号")).toBeInTheDocument()
})

test("password strength labels a short password", async () => {
  const user = userEvent.setup()
  render(<PasswordStrength />)
  expect(screen.getByText("至少 8 位，含大小写、数字和符号")).toBeInTheDocument()
  await user.type(screen.getByPlaceholderText("设置密码"), "a")
  expect(screen.getByText("很弱")).toBeInTheDocument()
})

test("currency input formats dollars", async () => {
  const user = userEvent.setup()
  render(<CurrencyInput />)
  expect(screen.getByText("$0.00")).toBeInTheDocument()
  const input = screen.getByRole("textbox")
  await user.clear(input)
  await user.type(input, "12")
  expect(screen.getByText("$12.00")).toBeInTheDocument()
})

function QuantityHarness() {
  const [value, setValue] = useState(1)
  return <QuantityStepper value={value} onValueChange={setValue} />
}

test("quantity stepper increments", async () => {
  const user = userEvent.setup()
  render(<QuantityHarness />)
  expect(screen.getByRole("textbox")).toHaveValue("1")
  await user.click(screen.getByRole("button", { name: "增加" }))
  expect(screen.getByRole("textbox")).toHaveValue("2")
})

test("floating label input accepts a port", async () => {
  const user = userEvent.setup()
  render(<FloatingLabelInput label="港口" />)
  await user.type(screen.getByLabelText("港口"), "北窗")
  expect(screen.getByLabelText("港口")).toHaveValue("北窗")
})

test("emoji picker shows the loading label", () => {
  render(<EmojiPicker />)
  expect(screen.getByText("加载表情…")).toBeInTheDocument()
})
