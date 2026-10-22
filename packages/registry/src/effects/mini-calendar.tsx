"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/mini-calendar/index.tsx

import { Button } from "@/components/ui/button"
import { useControllableState } from "@/hooks/use-controllable-state"
import { cn } from "@/lib/utils"

import { Slot } from "@radix-ui/react-slot"
import { addDays, format, isSameDay, isToday } from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from "react"

interface MiniCalendarContextValue {
  selectedDate: Date | undefined
  onDateSelect: (date: Date) => void
  startDate: Date
  onNavigate: (direction: "prev" | "next") => void
  days: number
}

const MiniCalendarContext = createContext<MiniCalendarContextValue | null>(null)

function useMiniCalendar() {
  const context = useContext(MiniCalendarContext)
  if (!context) throw new Error("MiniCalendar 组件必须放在 MiniCalendar 里面。")
  return context
}

export interface MiniCalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date) => void
  startDate?: Date
  defaultStartDate?: Date
  onStartDateChange?: (date: Date) => void
  days?: number
}

export function MiniCalendar({
  value,
  defaultValue,
  onValueChange,
  startDate,
  defaultStartDate,
  onStartDateChange,
  days = 5,
  className,
  children,
  ...props
}: MiniCalendarProps) {
  const fallback = defaultStartDate ?? defaultValue ?? new Date()
  const [selectedDate, setSelectedDate] = useControllableState<Date>({
    value,
    defaultValue: defaultValue ?? fallback,
    onChange: onValueChange,
  })
  const [currentStart, setCurrentStart] = useControllableState<Date>({
    value: startDate,
    defaultValue: defaultStartDate ?? fallback,
    onChange: onStartDateChange,
  })

  return (
    <MiniCalendarContext.Provider
      value={{
        selectedDate,
        onDateSelect: setSelectedDate,
        startDate: currentStart,
        onNavigate: (direction) => setCurrentStart(addDays(currentStart, direction === "next" ? days : -days)),
        days,
      }}
    >
      <div className={cn("bg-background flex items-center gap-2 rounded-lg border p-2", className)} data-slot="mini-calendar" {...props}>
        {children}
      </div>
    </MiniCalendarContext.Provider>
  )
}

export interface MiniCalendarNavigationProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "prev" | "next"
  asChild?: boolean
}

export function MiniCalendarNavigation({
  direction,
  asChild = false,
  children,
  onClick,
  ...props
}: MiniCalendarNavigationProps) {
  const { onNavigate } = useMiniCalendar()
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onNavigate(direction)
    onClick?.(event)
  }
  const label = direction === "prev" ? "上一页" : "下一页"

  if (asChild) {
    return (
      <Slot aria-label={label} onClick={handleClick} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <Button aria-label={label} onClick={handleClick} size="icon" type="button" variant="ghost" {...props}>
      {children ?? <Icon />}
    </Button>
  )
}

export interface MiniCalendarDaysProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: (date: Date) => ReactNode
}

export function MiniCalendarDays({ className, children, ...props }: MiniCalendarDaysProps) {
  const { startDate, days } = useMiniCalendar()
  const dates = Array.from({ length: days }, (_, index) => addDays(startDate, index))
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {dates.map((date) => (
        <div key={date.toISOString()}>{children(date)}</div>
      ))}
    </div>
  )
}

export interface MiniCalendarDayProps extends HTMLAttributes<HTMLButtonElement> {
  date: Date
}

export function MiniCalendarDay({ date, className, ...props }: MiniCalendarDayProps) {
  const { selectedDate, onDateSelect } = useMiniCalendar()
  const selected = selectedDate ? isSameDay(date, selectedDate) : false
  const today = isToday(date)
  return (
    <Button
      className={cn("h-auto min-w-12 flex-col gap-0 px-2 py-1.5 text-xs", today && !selected && "bg-accent", className)}
      onClick={() => onDateSelect(date)}
      type="button"
      variant={selected ? "default" : "ghost"}
      {...props}
    >
      <span className={cn("text-[10px]", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>
        {format(date, "MMM")}
      </span>
      <span className="text-sm font-semibold">{format(date, "d")}</span>
    </Button>
  )
}
