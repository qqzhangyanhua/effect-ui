"use client"

import { useState } from "react"

import { CodeBlock } from "../ui/code-block"
import { ColorPicker } from "../ui/color-picker"
import { DateRangePicker } from "../ui/date-range-picker"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "../ui/dropzone"
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanColumn,
  type KanbanItem,
} from "../ui/kanban"
import { MultiSelect } from "../ui/multi-select"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "../ui/stepper"
import { TagInput } from "../ui/tag-input"
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../ui/timeline"

export function DropzoneDemo() {
  const [files, setFiles] = useState<File[]>()
  return (
    <Dropzone
      files={files}
      accept={{ "image/*": [] }}
      maxSize={1024 * 1024 * 4}
      onDrop={(accepted) => setFiles(accepted)}
      className="max-w-md"
    >
      <DropzoneEmptyState />
      <DropzoneContent />
    </Dropzone>
  )
}

export function MultiSelectDemo() {
  const [value, setValue] = useState<string[]>(["motion"])
  return (
    <MultiSelect
      className="max-w-md"
      value={value}
      onValueChange={setValue}
      options={[
        { value: "motion", label: "Motion" },
        { value: "tailwind", label: "Tailwind" },
        { value: "radix", label: "Radix" },
        { value: "shiki", label: "Shiki" },
      ]}
    />
  )
}

export function TagInputDemo() {
  const [value, setValue] = useState(["registry", "mit"])
  return <TagInput className="max-w-md" value={value} onValueChange={setValue} />
}

export function DateRangePickerDemo() {
  return <DateRangePicker />
}

export function TimelineDemo() {
  return (
    <Timeline value={2} className="max-w-md">
      {[
        { step: 1, date: "09:00", title: "调研许可", body: "只收录 MIT / 宽松协议。" },
        { step: 2, date: "11:00", title: "移植组件", body: "写入 registry 与文档预览。" },
        { step: 3, date: "14:00", title: "质量门禁", body: "lint / typecheck / build。" },
      ].map((item) => (
        <TimelineItem key={item.step} step={item.step}>
          <TimelineSeparator />
          <TimelineIndicator />
          <TimelineHeader>
            <TimelineDate>{item.date}</TimelineDate>
            <TimelineTitle>{item.title}</TimelineTitle>
          </TimelineHeader>
          <TimelineContent>{item.body}</TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export function StepperDemo() {
  const [step, setStep] = useState(2)
  return (
    <Stepper value={step} onValueChange={setStep} className="max-w-lg">
      {[1, 2, 3].map((item) => (
        <StepperItem key={item} step={item}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperTitle>步骤 {item}</StepperTitle>
          </StepperTrigger>
          {item < 3 ? <StepperSeparator /> : null}
        </StepperItem>
      ))}
    </Stepper>
  )
}

export function ColorPickerDemo() {
  const [color, setColor] = useState("#6366f1")
  return (
    <div className="flex flex-col items-center gap-3">
      <ColorPicker value={color} onValueChange={setColor} />
      <p className="font-mono text-xs text-muted-foreground">{color}</p>
    </div>
  )
}

export function CodeBlockDemo() {
  return (
    <CodeBlock
      className="w-full max-w-xl text-left"
      files={[
        {
          filename: "button.tsx",
          language: "tsx",
          code: `export function Button() {\n  return <button>Install</button>\n}\n`,
        },
        {
          filename: "utils.ts",
          language: "ts",
          code: `export function cn(...inputs: string[]) {\n  return inputs.filter(Boolean).join(" ")\n}\n`,
        },
      ]}
    />
  )
}

const columns: KanbanColumn[] = [
  { id: "todo", name: "待办" },
  { id: "doing", name: "进行中" },
  { id: "done", name: "完成" },
]

export function KanbanDemo() {
  const [data, setData] = useState<KanbanItem[]>([
    { id: "1", name: "补齐 dropzone", column: "todo" },
    { id: "2", name: "写 docs 预览", column: "doing" },
    { id: "3", name: "核验 MIT", column: "done" },
  ])
  return (
    <KanbanProvider columns={columns} data={data} onDataChange={setData} className="w-full">
      {(column) => (
        <KanbanBoard key={column.id} id={column.id}>
          <KanbanHeader>{column.name}</KanbanHeader>
          <KanbanCards id={column.id}>
            {(item) => <KanbanCard key={item.id} id={item.id} name={item.name} />}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  )
}
