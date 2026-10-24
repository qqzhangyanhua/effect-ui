// @vitest-environment jsdom

import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

import { ChartContainer } from "./chart"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./context-menu"
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from "./drawer"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./input-otp"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "./menubar"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./navigation-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "./pagination"
import { Progress } from "./progress"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable"
import { ScrollArea } from "./scroll-area"
import { Sidebar, SidebarContent, SidebarProvider } from "./sidebar"
import { Skeleton } from "./skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

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

test("chart writes the series color", () => {
  const { container } = render(
    <ChartContainer config={{ visitors: { label: "访客", color: "var(--chart-1)" } }}>
      <div>图表</div>
    </ChartContainer>,
  )
  const chart = container.querySelector("[data-slot='chart']")
  expect(chart).toBeInTheDocument()
  expect(chart?.querySelector("style")?.textContent).toContain("--color-visitors: var(--chart-1)")
})

test("command lists a matching item", () => {
  render(
    <Command>
      <CommandInput placeholder="搜索" />
      <CommandList>
        <CommandEmpty>没有结果</CommandEmpty>
        <CommandGroup>
          <CommandItem>灯塔</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>,
  )
  expect(screen.getByPlaceholderText("搜索")).toBeInTheDocument()
  expect(screen.getByText("灯塔")).toBeInTheDocument()
})

test("context menu opens on right click", async () => {
  render(
    <ContextMenu>
      <ContextMenuTrigger>海面</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>标记</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  )
  fireEvent.contextMenu(screen.getByText("海面"))
  expect(await screen.findByRole("menuitem", { name: "标记" })).toBeInTheDocument()
})

test("drawer opens from the trigger", async () => {
  const user = userEvent.setup()
  render(
    <Drawer>
      <DrawerTrigger>打开抽屉</DrawerTrigger>
      <DrawerContent>
        <DrawerTitle>底舱</DrawerTitle>
      </DrawerContent>
    </Drawer>,
  )
  await user.click(screen.getByRole("button", { name: "打开抽屉" }))
  expect(await screen.findByText("底舱")).toBeInTheDocument()
})

test("otp input shows the typed digit", async () => {
  const user = userEvent.setup()
  render(
    <InputOTP maxLength={4} aria-label="验证码">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
    </InputOTP>,
  )
  await user.type(screen.getByRole("textbox", { name: "验证码" }), "7")
  expect(screen.getByText("7")).toBeInTheDocument()
})

test("menubar shows the item after opening", async () => {
  const user = userEvent.setup()
  render(
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新建</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>,
  )
  await user.click(screen.getByRole("menuitem", { name: "文件" }))
  expect(await screen.findByRole("menuitem", { name: "新建" })).toBeInTheDocument()
})

test("navigation menu shows the link", () => {
  render(
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink href="#north">北窗</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>,
  )
  expect(screen.getByRole("link", { name: "北窗" })).toHaveAttribute("href", "#north")
})

test("pagination marks the current page", () => {
  render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>,
  )
  expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page")
})

test("progress fills to the given value", () => {
  const { container } = render(<Progress aria-label="装载" value={40} />)
  expect(screen.getByRole("progressbar", { name: "装载" })).toBeInTheDocument()
  expect(container.querySelector("[data-slot='progress-indicator']")).toHaveStyle({
    transform: "translateX(-60%)",
  })
})

test("radio group selects another option", async () => {
  const user = userEvent.setup()
  render(
    <RadioGroup defaultValue="a">
      <RadioGroupItem aria-label="甲" value="a" />
      <RadioGroupItem aria-label="乙" value="b" />
    </RadioGroup>,
  )
  expect(screen.getByRole("radio", { name: "甲" })).toBeChecked()
  await user.click(screen.getByRole("radio", { name: "乙" }))
  expect(screen.getByRole("radio", { name: "乙" })).toBeChecked()
})

test("resizable panels show both sides", () => {
  render(
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={50}>左舷</ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>右舷</ResizablePanel>
    </ResizablePanelGroup>,
  )
  expect(screen.getByText("左舷")).toBeInTheDocument()
  expect(screen.getByText("右舷")).toBeInTheDocument()
})

test("scroll area shows its content", () => {
  render(
    <ScrollArea>
      <p>长文</p>
    </ScrollArea>,
  )
  expect(screen.getByText("长文")).toBeInTheDocument()
})

test("sidebar shows the navigation copy", () => {
  render(
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <p>航线</p>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>,
  )
  expect(screen.getByText("航线")).toBeInTheDocument()
})

test("skeleton renders its placeholder", () => {
  const { container } = render(<Skeleton>占位</Skeleton>)
  expect(screen.getByText("占位")).toBeInTheDocument()
  expect(container.querySelector("[data-slot='skeleton']")).toBeInTheDocument()
})

test("table shows the cell", () => {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>港口</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>北窗</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  )
  expect(screen.getByRole("columnheader", { name: "港口" })).toBeInTheDocument()
  expect(screen.getByRole("cell", { name: "北窗" })).toBeInTheDocument()
})
