// @vitest-environment jsdom

import { afterEach, beforeAll, expect, test, vi } from "vitest"
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useForm } from "react-hook-form"
import "@testing-library/jest-dom/vitest"

import { ComboboxItem } from "./combobox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "./form"
import { MultiSelect } from "./multi-select"
import { SelectPlus, type SelectOption } from "./select-plus"

const options: SelectOption[] = [
  { value: "motion", label: "Motion" },
  { value: "tailwind", label: "Tailwind" },
  { value: "radix", label: "Radix" },
]

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
  Element.prototype.scrollIntoView = () => {}
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
  if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {}
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {}
})

function setup() {
  return userEvent.setup()
}

afterEach(() => {
  cleanup()
})

test("非搜索单选是按钮触发器，点开弹层后能选中", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(<SelectPlus options={options} onValueChange={onValueChange} />)

  const field = screen.getByRole("combobox")
  expect(field.tagName).toBe("BUTTON")
  expect(field).toHaveTextContent("请选择")

  await user.click(field)
  expect(await screen.findByRole("option", { name: "Motion" })).toBeInTheDocument()
  await user.click(screen.getByRole("option", { name: "Tailwind" }))

  expect(onValueChange).toHaveBeenCalledWith("tailwind")
  expect(screen.getByRole("combobox")).toHaveTextContent("Tailwind")
})

test("搜索单选用输入框，默认按标签子串过滤，不区分大小写", async () => {
  const user = setup()
  render(<SelectPlus showSearch options={options} />)

  const field = screen.getByRole("combobox")
  expect(field.tagName).toBe("INPUT")
  await user.click(field)
  await user.type(field, "TAI")

  expect(screen.getByRole("option", { name: "Tailwind" })).toBeInTheDocument()
  expect(screen.queryByRole("option", { name: "Motion" })).not.toBeInTheDocument()
})

test("filterOption 自定义匹配，false 时不过滤但仍回调 onSearch", async () => {
  const user = setup()
  const onSearch = vi.fn()
  const { rerender } = render(
    <SelectPlus
      showSearch
      options={options}
      filterOption={(input, option) => option.value.startsWith(input)}
    />,
  )

  const field = screen.getByRole("combobox")
  await user.click(field)
  await user.type(field, "mo")
  expect(screen.getByRole("option", { name: "Motion" })).toBeInTheDocument()
  expect(screen.queryByRole("option", { name: "Tailwind" })).not.toBeInTheDocument()

  rerender(<SelectPlus showSearch options={options} filterOption={false} onSearch={onSearch} />)
  const remote = screen.getByRole("combobox")
  await user.clear(remote)
  await user.type(remote, "zzz")
  expect(screen.getByRole("option", { name: "Motion" })).toBeInTheDocument()
  expect(screen.getByRole("option", { name: "Tailwind" })).toBeInTheDocument()
  expect(onSearch).toHaveBeenCalledWith("zzz")
})

test("单选受控与非受控都会更新展示值", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  const { rerender, unmount } = render(<SelectPlus options={options} value="" onValueChange={onValueChange} />)
  expect(screen.getByRole("combobox")).toHaveTextContent("请选择")

  rerender(<SelectPlus options={options} value="motion" onValueChange={onValueChange} />)
  expect(screen.getByRole("combobox")).toHaveTextContent("Motion")
  unmount()

  render(<SelectPlus options={options} defaultValue="radix" />)
  expect(screen.getByRole("combobox")).toHaveTextContent("Radix")
  await user.click(screen.getByRole("combobox"))
  await user.click(await screen.findByRole("option", { name: "Motion" }))
  expect(screen.getByRole("combobox")).toHaveTextContent("Motion")
})

test("allowClear 清空时回调空字符串", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(<SelectPlus options={options} defaultValue="motion" allowClear onValueChange={onValueChange} />)

  await user.click(screen.getByRole("button", { name: "清除" }))
  expect(onValueChange).toHaveBeenCalledWith("")
})

test("多选可以切换选项，退格和标签上的移除按钮会删掉值", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(<SelectPlus mode="multiple" options={options} onValueChange={onValueChange} />)

  await user.click(screen.getByRole("combobox"))
  await user.click(await screen.findByRole("option", { name: "Motion" }))
  expect(onValueChange).toHaveBeenLastCalledWith(["motion"])
  await user.click(screen.getByRole("option", { name: "Tailwind" }))
  expect(onValueChange).toHaveBeenLastCalledWith(["motion", "tailwind"])
  await user.click(screen.getByRole("option", { name: "Motion" }))
  expect(onValueChange).toHaveBeenLastCalledWith(["tailwind"])

  const field = screen.getByRole("combobox").parentElement
  expect(field).not.toBeNull()
  const chip = within(field as HTMLElement).getByText("Tailwind")
  await user.click(within(chip).getByRole("button"))
  expect(onValueChange).toHaveBeenLastCalledWith([])
})

test("多选退格删除最后一个标签", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(
    <SelectPlus
      mode="multiple"
      options={options}
      defaultValue={["motion", "tailwind"]}
      onValueChange={onValueChange}
    />,
  )

  await user.click(screen.getByRole("combobox"))
  await user.keyboard("{Backspace}")
  expect(onValueChange).toHaveBeenCalledWith(["motion"])
})

test("maxTagCount 把多余标签收成 +N", () => {
  render(
    <SelectPlus
      mode="multiple"
      options={options}
      defaultValue={["motion", "tailwind", "radix"]}
      maxTagCount={1}
    />,
  )

  const field = screen.getByRole("combobox").parentElement
  expect(field).not.toBeNull()
  expect(within(field as HTMLElement).getByText("Motion")).toBeInTheDocument()
  expect(within(field as HTMLElement).queryByText("Tailwind")).not.toBeInTheDocument()
  expect(within(field as HTMLElement).getByText("+2")).toBeInTheDocument()
})

test("tags 模式按 Enter 创建新值", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(<SelectPlus mode="tags" options={options} onValueChange={onValueChange} />)

  await user.type(screen.getByRole("combobox"), "自定义{Enter}")
  expect(onValueChange).toHaveBeenCalledWith(["自定义"])
  expect(screen.getByText("自定义")).toBeInTheDocument()
})

test("禁用字段不能打开，禁用选项不能选中", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  const onOpenChange = vi.fn()
  const { rerender } = render(
    <SelectPlus options={options} disabled onOpenChange={onOpenChange} onValueChange={onValueChange} />,
  )

  await user.click(screen.getByRole("combobox"))
  expect(onOpenChange).not.toHaveBeenCalled()
  expect(screen.queryByRole("option")).not.toBeInTheDocument()

  rerender(
    <SelectPlus
      options={[...options, { value: "vue", label: "Vue", disabled: true }]}
      onValueChange={onValueChange}
    />,
  )
  await user.click(screen.getByRole("combobox"))
  await user.click(await screen.findByRole("option", { name: "Vue" }))
  expect(onValueChange).not.toHaveBeenCalled()
})

test("status=error 设置 aria-invalid，warning 不设置", () => {
  const { rerender } = render(<SelectPlus status="error" options={options} />)
  expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")

  rerender(<SelectPlus status="warning" options={options} />)
  expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid")
})

test("id、aria-describedby 和 ref 落在获得焦点的元素上", () => {
  const ref = { current: null as HTMLButtonElement | HTMLInputElement | null }
  render(<SelectPlus id="city" aria-describedby="city-hint" options={options} ref={ref} />)

  const field = screen.getByRole("combobox")
  expect(field).toHaveAttribute("id", "city")
  expect(field).toHaveAttribute("aria-describedby", "city-hint")
  expect(ref.current).toBe(field)
})

test("loading 标记忙碌，分组、自定义渲染、空状态和 children 可用", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  const { rerender } = render(<SelectPlus loading options={options} />)
  expect(screen.getByRole("combobox")).toHaveAttribute("aria-busy", "true")

  rerender(
    <SelectPlus
      options={[
        { label: "前端", options: [{ value: "react", label: "React" }] },
        { label: "工具", options: [{ value: "git", label: "Git" }] },
      ]}
      renderOption={(option) => `项:${option.label}`}
    />,
  )
  await user.click(screen.getByRole("combobox"))
  expect(await screen.findByText("前端")).toBeInTheDocument()
  expect(screen.getByRole("option", { name: "项:Git" })).toBeInTheDocument()

  rerender(<SelectPlus showSearch options={options} notFoundContent="没有这个" />)
  const field = screen.getByRole("combobox")
  await user.click(field)
  await user.type(field, "zzz")
  expect(screen.getByText("没有这个")).toBeInTheDocument()
  expect(screen.queryByRole("option")).not.toBeInTheDocument()

  rerender(
    <SelectPlus onValueChange={onValueChange}>
      <ComboboxItem value="custom">自定义项</ComboboxItem>
    </SelectPlus>,
  )
  await user.click(screen.getByRole("combobox"))
  await user.click(await screen.findByRole("option", { name: "自定义项" }))
  expect(onValueChange).toHaveBeenCalledWith("custom")
})

test("open 受控时回调打开状态", async () => {
  const user = setup()
  const onOpenChange = vi.fn()
  render(<SelectPlus options={options} onOpenChange={onOpenChange} />)

  await user.click(screen.getByRole("combobox"))
  expect(await screen.findByRole("option", { name: "Motion" })).toBeInTheDocument()
  expect(onOpenChange).toHaveBeenCalledWith(true)
})

test("方向键和 Enter 能选择，Escape 能关闭", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(<SelectPlus options={options} onValueChange={onValueChange} />)

  const field = screen.getByRole("combobox")
  field.focus()
  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
  expect(onValueChange).toHaveBeenCalledWith("motion")

  await user.keyboard("{Escape}")
  expect(screen.queryByRole("option")).not.toBeInTheDocument()
})

test("FormControl 把 id 和校验状态写到焦点元素上", async () => {
  const user = setup()
  function CityForm() {
    const form = useForm<{ city: string }>({ defaultValues: { city: "" } })
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => undefined)}>
          <FormField
            control={form.control}
            name="city"
            rules={{ required: "请选择城市" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>城市</FormLabel>
                <FormControl>
                  <SelectPlus options={options} value={field.value} onValueChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <button type="submit">提交</button>
        </form>
      </Form>
    )
  }

  render(<CityForm />)
  const field = screen.getByRole("combobox")
  expect(field).toHaveAttribute("id", screen.getByText("城市").closest("label")?.getAttribute("for") ?? "")

  await user.click(screen.getByRole("button", { name: "提交" }))
  expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true")
  expect(screen.getByRole("combobox").getAttribute("aria-describedby")).toBeTruthy()
})

test("multi-select 保持原有 props，并回调 string[]", async () => {
  const user = setup()
  const onValueChange = vi.fn()
  render(
    <MultiSelect
      className="max-w-md"
      options={[
        { value: "motion", label: "Motion" },
        { value: "tailwind", label: "Tailwind" },
      ]}
      placeholder="选择多项…"
      onValueChange={onValueChange}
    />,
  )

  expect(screen.getByPlaceholderText("选择多项…")).toBeInTheDocument()
  await user.click(screen.getByRole("combobox"))
  await user.click(await screen.findByRole("option", { name: "Motion" }))
  expect(onValueChange).toHaveBeenCalledWith(["motion"])
})
