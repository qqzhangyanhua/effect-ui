"use client"

// Ported from Kibo UI (MIT, (c) shadcnblocks) — https://github.com/shadcnblocks/kibo/blob/main/packages/choicebox/index.tsx

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react"

export interface ChoiceboxProps {
  className?: string
  children?: ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function Choicebox({ className, ...props }: ChoiceboxProps) {
  return <RadioGroup className={cn("grid w-full gap-3", className)} data-slot="choicebox" {...props} />
}

interface ChoiceboxItemContextValue {
  value: string
  id?: string
}

const ChoiceboxItemContext = createContext<ChoiceboxItemContextValue | null>(null)

function useChoiceboxItem() {
  const context = useContext(ChoiceboxItemContext)
  if (!context) throw new Error("Choicebox 的子项必须放在 ChoiceboxItem 里面。")
  return context
}

export interface ChoiceboxItemProps {
  className?: string
  children?: ReactNode
  value: string
  id?: string
}

export function ChoiceboxItem({ className, children, value, id }: ChoiceboxItemProps) {
  return (
    <ChoiceboxItemContext.Provider value={{ value, id }}>
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5",
          className,
        )}
        htmlFor={id}
      >
        {children}
      </label>
    </ChoiceboxItemContext.Provider>
  )
}

export function ChoiceboxItemHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-1 flex-col gap-1", className)} {...props} />
}

export function ChoiceboxItemTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm font-medium", className)} {...props} />
}

export function ChoiceboxItemSubtitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("text-muted-foreground text-xs font-normal", className)} {...props} />
}

export function ChoiceboxItemDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />
}

export function ChoiceboxIndicator(props: HTMLAttributes<HTMLButtonElement>) {
  const context = useChoiceboxItem()
  return <RadioGroupItem {...props} id={context.id} value={context.value} />
}
