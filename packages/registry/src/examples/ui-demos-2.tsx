"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { type ColumnDef } from "@tanstack/react-table"
import { Bold, Italic, Terminal } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"
import { AspectRatio } from "../ui/aspect-ratio"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu"
import { DataTable } from "../ui/data-table"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { Input } from "../ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp"
import { Label } from "../ui/label"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../ui/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import { Progress } from "../ui/progress"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable"
import { ScrollArea } from "../ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../ui/sidebar"
import { Skeleton } from "../ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Toggle } from "../ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

export function AlertDemo() {
  return (
    <Alert className="max-w-md">
      <Terminal />
      <AlertTitle>组件已加入 registry</AlertTitle>
      <AlertDescription>可以用 shadcn CLI 复制进项目。</AlertDescription>
    </Alert>
  )
}

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">删除确认</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确定删除？</AlertDialogTitle>
          <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction>继续</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} className="w-72 overflow-hidden rounded-md bg-muted">
      <div className="grid h-full place-items-center text-sm">16:9</div>
    </AspectRatio>
  )
}

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-lg border"
    />
  )
}

export function CarouselDemo() {
  return (
    <Carousel className="w-64">
      <CarouselContent>
        {["一", "二", "三"].map((item) => (
          <CarouselItem key={item}>
            <div className="grid h-28 place-items-center rounded-lg border bg-card">
              卡片 {item}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}

export function ChartDemo() {
  const data = [
    { name: "A", value: 12 },
    { name: "B", value: 18 },
    { name: "C", value: 9 },
  ]
  return (
    <ChartContainer
      className="h-40 w-72"
      config={{ value: { label: "用量", color: "var(--primary)" } }}
    >
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function CollapsibleDemo() {
  return (
    <Collapsible className="w-64 rounded-lg border p-3">
      <CollapsibleTrigger className="text-sm font-medium">展开说明</CollapsibleTrigger>
      <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
        Collapsible 适合放次要内容。
      </CollapsibleContent>
    </Collapsible>
  )
}

export function CommandDemo() {
  return (
    <Command className="w-72 rounded-lg border">
      <CommandInput placeholder="搜索组件…" />
      <CommandList>
        <CommandEmpty>没有结果</CommandEmpty>
        <CommandGroup heading="特效">
          <CommandItem>Dock</CommandItem>
          <CommandItem>Marquee</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="grid h-24 w-64 place-items-center rounded-lg border border-dashed">
        右键这里
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>复制</ContextMenuItem>
        <ContextMenuItem>粘贴</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">打开抽屉</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer</DrawerTitle>
          <DrawerDescription>从底部滑出的面板。</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}

interface FormValues {
  name: string
}

export function FormDemo() {
  const form = useForm<FormValues>({ defaultValues: { name: "" } })
  return (
    <Form {...form}>
      <form className="w-64 space-y-3" onSubmit={form.handleSubmit(() => undefined)}>
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "必填" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder="effect-ui" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="sm">
          提交
        </Button>
      </form>
    </Form>
  )
}

export function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">悬停查看</Button>
      </HoverCardTrigger>
      <HoverCardContent>把更多上下文放在轻量卡片里。</HoverCardContent>
    </HoverCard>
  )
}

export function InputOtpDemo() {
  return (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>文件</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新建</MenubarItem>
          <MenubarItem>打开</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>产品</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink className="w-40">基础组件</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export function ProgressDemo() {
  return <Progress value={64} className="w-64" />
}

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="a" className="flex gap-4">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="a" />
        <Label htmlFor="a">A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="b" />
        <Label htmlFor="b">B</Label>
      </div>
    </RadioGroup>
  )
}

export function ResizableDemo() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-28 w-80 rounded-lg border">
      <ResizablePanel defaultSize={50}>左</ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>右</ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function ScrollAreaDemo() {
  return (
    <ScrollArea className="h-28 w-56 rounded-md border p-3 text-sm">
      {Array.from({ length: 12 }, (_, index) => (
        <p key={index} className="py-1">
          滚动条目 {index + 1}
        </p>
      ))}
    </ScrollArea>
  )
}

export function SidebarDemo() {
  return (
    <SidebarProvider className="min-h-64 rounded-xl border">
      <Sidebar collapsible="none" className="w-48 border-r">
        <SidebarHeader>effect-ui</SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>导航</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>概览</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>组件</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex flex-1 items-start p-3">
        <SidebarTrigger />
      </div>
    </SidebarProvider>
  )
}

export function SkeletonDemo() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>组件</TableHead>
          <TableHead>来源</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Button</TableCell>
          <TableCell>shadcn/ui</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Dock</TableCell>
          <TableCell>Magic UI</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export function ToggleDemo() {
  return (
    <Toggle aria-label="加粗">
      <Bold />
    </Toggle>
  )
}

export function ToggleGroupDemo() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <Bold />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <Italic />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

interface Payment {
  id: string
  name: string
  amount: number
}

const columns: ColumnDef<Payment, unknown>[] = [
  { accessorKey: "name", header: "名称" },
  { accessorKey: "amount", header: "数量" },
]

export function DataTableDemo() {
  return (
    <DataTable
      columns={columns}
      data={[
        { id: "1", name: "Dock", amount: 12 },
        { id: "2", name: "Marquee", amount: 8 },
        { id: "3", name: "Bento", amount: 5 },
      ]}
    />
  )
}
