"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectProps {
  options: MultiSelectOption[]
  value?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  className?: string
}

function MultiSelect({
  options,
  value: controlled,
  onValueChange,
  placeholder = "选择多项…",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolled, setUncontrolled] = React.useState<string[]>([])
  const selected = controlled ?? uncontrolled

  const setSelected = (next: string[]) => {
    if (controlled === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const toggle = (item: string) => {
    setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-auto min-h-9 w-full justify-between px-2 py-1", className)}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="px-1 text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((item) => {
                const option = options.find((entry) => entry.value === item)
                return (
                  <Badge key={item} variant="secondary" className="gap-1">
                    {option?.label ?? item}
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded-full hover:bg-muted"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        toggle(item)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") toggle(item)
                      }}
                    >
                      <XIcon className="size-3" />
                    </span>
                  </Badge>
                )
              })
            )}
          </div>
          <ChevronsUpDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="搜索…" />
          <CommandList>
            <CommandEmpty>没有匹配项</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                  <CheckIcon className={cn("size-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
