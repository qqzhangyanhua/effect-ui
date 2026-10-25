// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"
import type { ColumnDef } from "@tanstack/react-table"

import { Toggle } from "./toggle"
import { ToggleGroup, ToggleGroupItem } from "./toggle-group"
import { DataTable } from "./data-table"
import { Dropzone, DropzoneEmptyState } from "./dropzone"
import { TagInput } from "./tag-input"
import { DateRangePicker } from "./date-range-picker"
import { Timeline, TimelineItem, TimelineTitle } from "./timeline"
import { Stepper, StepperItem, StepperTrigger } from "./stepper"
import { ColorPicker } from "./color-picker"
import { CodeBlock } from "./code-block"
import { KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from "./kanban"
import { ChatMessage } from "./chat-message"
import { PromptInput } from "./prompt-input"
import { RichTextEditor } from "./rich-text-editor"
import { TreeView } from "./tree-view"
import { Field, FieldError, FieldLegend } from "./field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "./input-group"

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
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

test("toggle turns on", async () => {
  const user = userEvent.setup()
  render(<Toggle aria-label="加粗">B</Toggle>)
  const button = screen.getByRole("button", { name: "加粗" })
  expect(button).toHaveAttribute("data-state", "off")
  await user.click(button)
  expect(button).toHaveAttribute("data-state", "on")
})

test("toggle group selects one item", async () => {
  const user = userEvent.setup()
  render(
    <ToggleGroup type="single" aria-label="对齐">
      <ToggleGroupItem value="left" aria-label="左对齐">左</ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="右对齐">右</ToggleGroupItem>
    </ToggleGroup>,
  )
  const right = screen.getByRole("radio", { name: "右对齐" })
  expect(right).toHaveAttribute("data-state", "off")
  await user.click(right)
  expect(right).toHaveAttribute("data-state", "on")
})

test("data table pages to the next row", async () => {
  const user = userEvent.setup()
  const columns: ColumnDef<{ port: string }>[] = [{ accessorKey: "port", header: "港口" }]
  const data = Array.from({ length: 11 }, (_, index) => ({ port: `港口-${index + 1}` }))
  render(<DataTable columns={columns} data={data} />)
  expect(screen.getByRole("cell", { name: "港口-1" })).toBeInTheDocument()
  expect(screen.queryByRole("cell", { name: "港口-11" })).not.toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "下一页" }))
  expect(screen.getByRole("cell", { name: "港口-11" })).toBeInTheDocument()
})

test("dropzone shows the empty hint", () => {
  render(
    <Dropzone>
      <DropzoneEmptyState />
    </Dropzone>,
  )
  expect(screen.getByText("拖拽或点击上传")).toBeInTheDocument()
  expect(screen.getByText(/最多 4 个文件/)).toBeInTheDocument()
  expect(screen.getByText(/任意类型/)).toBeInTheDocument()
})

test("tag input adds and removes a tag", async () => {
  const user = userEvent.setup()
  render(<TagInput />)
  await user.type(screen.getByPlaceholderText("输入后回车添加标签"), "雾{Enter}")
  expect(screen.getByText("雾")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "移除 雾" }))
  expect(screen.queryByText("雾")).not.toBeInTheDocument()
})

test("date range picker applies a preset", async () => {
  const user = userEvent.setup()
  render(<DateRangePicker />)
  await user.click(screen.getByRole("button", { name: /选择日期范围/ }))
  await user.click(await screen.findByRole("button", { name: "近 7 天" }))
  expect(screen.getByRole("button", { name: /\d{4}-\d{2}-\d{2}/ })).toBeInTheDocument()
})

test("timeline marks the current step complete", () => {
  render(
    <Timeline>
      <TimelineItem step={1}>
        <TimelineTitle>出发</TimelineTitle>
      </TimelineItem>
    </Timeline>,
  )
  const title = screen.getByRole("heading", { name: "出发" })
  expect(title.closest("[data-completed]")).toBeTruthy()
})

test("stepper moves to the clicked step", async () => {
  const user = userEvent.setup()
  render(
    <Stepper>
      <StepperItem step={1}>
        <StepperTrigger>装货</StepperTrigger>
      </StepperItem>
      <StepperItem step={2}>
        <StepperTrigger>出航</StepperTrigger>
      </StepperItem>
    </Stepper>,
  )
  expect(screen.getByRole("button", { name: "装货" }).parentElement).toHaveAttribute("data-state", "active")
  await user.click(screen.getByRole("button", { name: "出航" }))
  expect(screen.getByRole("button", { name: "出航" }).parentElement).toHaveAttribute("data-state", "active")
})

test("color picker accepts a hex value", () => {
  render(<ColorPicker />)
  const input = screen.getByRole("textbox")
  fireEvent.change(input, { target: { value: "#112233" } })
  expect(input).toHaveValue("#112233")
})

test("code block switches the active file", async () => {
  const user = userEvent.setup()
  render(
    <CodeBlock
      files={[
        { filename: "航线.ts", language: "ts", code: "const port = 1" },
        { filename: "潮汐.ts", language: "ts", code: "const tide = 2" },
      ]}
    />,
  )
  const next = screen.getByRole("button", { name: "潮汐.ts" })
  expect(next).not.toHaveClass("font-medium")
  await user.click(next)
  expect(next).toHaveClass("font-medium")
})

test("kanban shows a column and its card", () => {
  render(
    <KanbanProvider columns={[{ id: "todo", name: "待办" }]} data={[{ id: "lamp", name: "修灯", column: "todo" }]}>
      {(column) => (
        <KanbanBoard id={column.id}>
          <KanbanHeader>{column.name}</KanbanHeader>
          <KanbanCards id={column.id}>{(item) => <KanbanCard key={item.id} id={item.id} name={item.name} />}</KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>,
  )
  expect(screen.getByText("待办")).toBeInTheDocument()
  expect(screen.getByText("修灯")).toBeInTheDocument()
})

test("chat message shows the user text", () => {
  render(<ChatMessage role="user" content="你好" />)
  expect(screen.getByText("你好")).toBeInTheDocument()
})

test("prompt input submits the typed text", async () => {
  const user = userEvent.setup()
  const onSubmit = vi.fn()
  render(<PromptInput onSubmit={onSubmit} />)
  await user.type(screen.getByPlaceholderText("问点什么…"), "你好")
  await user.click(screen.getByRole("button", { name: "发送" }))
  expect(onSubmit).toHaveBeenCalledWith("你好")
})

test("rich text editor shows the initial paragraph", async () => {
  render(<RichTextEditor content="<p>夜航笔记</p>" />)
  expect(await screen.findByText("夜航笔记")).toBeInTheDocument()
})

test("tree view collapses a folder", async () => {
  const user = userEvent.setup()
  render(
    <TreeView
      nodes={[{ id: "docs", name: "文档", children: [{ id: "map", name: "海图" }] }]}
    />,
  )
  expect(screen.getByRole("button", { name: "海图" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "文档" }))
  expect(screen.queryByRole("button", { name: "海图" })).not.toBeInTheDocument()
})

test("field shows the legend and an error", () => {
  render(
    <>
      <Field>
        <FieldLegend>航线</FieldLegend>
      </Field>
      <FieldError errors={[{ message: "港口不能为空" }]} />
    </>,
  )
  expect(screen.getByRole("group")).toHaveAttribute("data-orientation", "vertical")
  expect(screen.getByText("航线")).toHaveAttribute("data-variant", "legend")
  expect(screen.getByRole("alert")).toHaveTextContent("港口不能为空")
})

test("input group keeps the button at the extra-small size", () => {
  render(
    <InputGroup>
      <InputGroupAddon>https://</InputGroupAddon>
      <InputGroupInput aria-label="地址" />
      <InputGroupButton>前往</InputGroupButton>
    </InputGroup>,
  )
  expect(screen.getByText("https://")).toBeInTheDocument()
  expect(screen.getByRole("textbox", { name: "地址" })).toBeInTheDocument()
  const button = screen.getByRole("button", { name: "前往" })
  expect(button).toHaveAttribute("type", "button")
  expect(button).toHaveAttribute("data-size", "xs")
})
