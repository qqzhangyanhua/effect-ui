"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

interface TimelineContextValue {
  activeStep: number
}

const TimelineContext = React.createContext<TimelineContextValue | null>(null)

function useTimeline() {
  const context = React.useContext(TimelineContext)
  if (!context) throw new Error("Timeline parts must be used within Timeline")
  return context
}

function Timeline({
  value = 1,
  orientation = "vertical",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <TimelineContext.Provider value={{ activeStep: value }}>
      <div
        data-orientation={orientation}
        className={cn(
          "group/timeline flex",
          orientation === "horizontal" ? "w-full flex-row" : "flex-col",
          className,
        )}
        {...props}
      />
    </TimelineContext.Provider>
  )
}

function TimelineItem({
  step,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { step: number }) {
  const { activeStep } = useTimeline()
  return (
    <div
      data-completed={step <= activeStep || undefined}
      className={cn(
        "group/timeline-item relative flex flex-1 flex-col gap-1 group-data-[orientation=vertical]/timeline:ms-8 group-data-[orientation=vertical]/timeline:not-last:pb-10",
        className,
      )}
      {...props}
    />
  )
}

function TimelineSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute bg-primary/15 group-last/timeline-item:hidden group-data-[orientation=vertical]/timeline:-left-8 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.25rem)] group-data-[orientation=vertical]/timeline:w-0.5 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-[orientation=vertical]/timeline:translate-y-5 group-data-completed/timeline-item:bg-primary",
        className,
      )}
      {...props}
    />
  )
}

function TimelineIndicator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute size-3 rounded-full border-2 border-primary/30 bg-background group-data-[orientation=vertical]/timeline:top-1 group-data-[orientation=vertical]/timeline:-left-8 group-data-[orientation=vertical]/timeline:-translate-x-1/2 group-data-completed/timeline-item:border-primary group-data-completed/timeline-item:bg-primary",
        className,
      )}
      {...props}
    />
  )
}

function TimelineHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col", className)} {...props} />
}

function TimelineDate({
  asChild = false,
  className,
  ...props
}: React.HTMLAttributes<HTMLTimeElement> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "time"
  return <Comp className={cn("text-xs text-muted-foreground", className)} {...props} />
}

function TimelineTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-medium", className)} {...props} />
}

function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineIndicator,
  TimelineHeader,
  TimelineDate,
  TimelineTitle,
  TimelineContent,
}
