"use client"

import * as React from "react"
import { ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react"

import { cn } from "@/lib/cn"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectOptionGroup {
  label: string
  options: SelectOption[]
}

type FilterOption = boolean | ((input: string, option: SelectOption) => boolean)

type SelectPlusShared = {
  options?: readonly (SelectOption | SelectOptionGroup)[]
  children?: React.ReactNode
  showSearch?: boolean
  filterOption?: FilterOption
  onSearch?: (input: string) => void
  allowClear?: boolean
  loading?: boolean
  disabled?: boolean
  status?: "error" | "warning"
  size?: "sm" | "default"
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  notFoundContent?: React.ReactNode
  renderOption?: (option: SelectOption) => React.ReactNode
  className?: string
  id?: string
  ref?: React.Ref<HTMLButtonElement | HTMLInputElement>
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}

export type SelectPlusProps = SelectPlusShared &
  (
    | {
        mode?: "single"
        value?: string
        defaultValue?: string
        onValueChange?: (value: string) => void
      }
    | {
        mode: "multiple" | "tags"
        value?: string[]
        defaultValue?: string[]
        onValueChange?: (value: string[]) => void
        maxTagCount?: number
      }
  )

type Section = { key: string; label?: string; items: SelectOption[] }

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") {
    ref(node)
    return
  }
  if (ref) ref.current = node
}
function isOptionGroup(entry: SelectOption | SelectOptionGroup): entry is SelectOptionGroup {
  return "options" in entry
}
function isMulti(props: SelectPlusProps): props is Extract<SelectPlusProps, { mode: "multiple" | "tags" }> {
  return props.mode === "multiple" || props.mode === "tags"
}

function flattenOptions(options: readonly (SelectOption | SelectOptionGroup)[] | undefined): SelectOption[] {
  if (!options) return []
  const flat: SelectOption[] = []
  for (const entry of options) {
    if (isOptionGroup(entry)) flat.push(...entry.options)
    else flat.push(entry)
  }
  return flat
}

function optionVisible(option: SelectOption, query: string, filterOption: FilterOption | undefined, search: boolean) {
  if (!search || filterOption === false) return true
  if (typeof filterOption === "function") return filterOption(query, option)
  return option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
}

function buildSections(
  options: readonly (SelectOption | SelectOptionGroup)[] | undefined,
  query: string,
  filterOption: FilterOption | undefined,
  search: boolean,
): Section[] {
  if (!options || options.length === 0) return []
  const sections: Section[] = []
  const loose: SelectOption[] = []
  let sawGroup = false
  options.forEach((entry, index) => {
    if (isOptionGroup(entry)) {
      sawGroup = true
      const items = entry.options.filter((option) => optionVisible(option, query, filterOption, search))
      if (items.length > 0) sections.push({ key: `group-${index}`, label: entry.label, items })
      return
    }
    if (optionVisible(entry, query, filterOption, search)) loose.push(entry)
  })
  if (!sawGroup) return loose.length > 0 ? [{ key: "options", items: loose }] : []
  if (loose.length > 0) sections.push({ key: "loose", items: loose })
  return sections
}

function SelectPlus(props: SelectPlusProps) {
  const {
    options,
    showSearch,
    filterOption,
    onSearch,
    allowClear = false,
    loading = false,
    disabled = false,
    status,
    size = "default",
    open: openProp,
    onOpenChange,
    placeholder = "请选择",
    notFoundContent = "没有匹配项",
    renderOption,
    className,
    id,
    ref,
    "aria-invalid": ariaInvalidProp,
    "aria-describedby": ariaDescribedBy,
  } = props
  const mode = props.mode ?? "single"
  const multiple = mode !== "single"
  const search = showSearch ?? multiple
  const useInput = multiple || search
  const maxTagCount = isMulti(props) ? props.maxTagCount : undefined
  const listId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const openControlled = openProp !== undefined
  const [openState, setOpenState] = React.useState(false)
  const isOpen = openControlled ? openProp : openState
  const openRef = React.useRef(isOpen)
  const [highlight, setHighlight] = React.useState(-1)
  const highlightRef = React.useRef(-1)
  const [query, setQuery] = React.useState("")
  const [uncontrolled, setUncontrolled] = React.useState<string | string[]>(() => {
    if (props.defaultValue !== undefined) return props.defaultValue
    return multiple ? [] : ""
  })
  const selected = props.value !== undefined ? props.value : uncontrolled
  const selectedList = Array.isArray(selected) ? selected : []
  const selectedSingle = typeof selected === "string" ? selected : ""
  const flat = React.useMemo(() => flattenOptions(options), [options])
  const labels = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const option of flat) map.set(option.value, option.label)
    return map
  }, [flat])
  const sections = buildSections(options, query, filterOption, search)
  const visible = sections.flatMap((section) => section.items)
  const activeIndex = highlight >= 0 && highlight < visible.length ? highlight : -1
  const singleLabel = selectedSingle ? (labels.get(selectedSingle) ?? selectedSingle) : ""
  const inputValue = multiple || isOpen || query !== "" ? query : singleLabel
  const hasValue = multiple ? selectedList.length > 0 : selectedSingle !== ""
  const showClear = allowClear && hasValue && !disabled
  const invalid = status === "error" ? true : ariaInvalidProp
  const busy = loading ? true : undefined
  const visibleTags = maxTagCount === undefined ? selectedList : selectedList.slice(0, maxTagCount)
  const overflow = selectedList.length - visibleTags.length
  const selectedSet = new Set(multiple ? selectedList : selectedSingle ? [selectedSingle] : [])

  function commitSingle(next: string) {
    if (props.value === undefined) setUncontrolled(next)
    if (isMulti(props)) return
    props.onValueChange?.(next)
  }

  function commitMultiple(next: string[]) {
    if (props.value === undefined) setUncontrolled(next)
    if (!isMulti(props)) return
    props.onValueChange?.(next)
  }

  function setOpen(next: boolean) {
    if (disabled) return
    const current = openRef.current
    if (!openControlled) {
      openRef.current = next
      setOpenState(next)
    }
    if (next !== current) onOpenChange?.(next)
  }

  function closeMenu() {
    highlightRef.current = -1
    setHighlight(-1)
    if (!multiple) setQuery("")
    setOpen(false)
  }
  function openMenu() {
    if (disabled || openRef.current) return
    highlightRef.current = -1
    setHighlight(-1)
    setOpen(true)
  }
  function moveHighlight(direction: 1 | -1) {
    const count = visible.length
    if (count === 0) {
      highlightRef.current = -1
      return
    }
    let index = highlightRef.current
    if (index >= count) index = -1
    for (let step = 0; step < count; step += 1) {
      index += direction
      if (index >= count) index = 0
      if (index < 0) index = count - 1
      const option = visible[index]
      if (option && !option.disabled) {
        highlightRef.current = index
        setHighlight(index)
        return
      }
    }
  }
  function choose(option: SelectOption) {
    if (disabled || option.disabled) return
    if (multiple) {
      const next = selectedList.includes(option.value)
        ? selectedList.filter((value) => value !== option.value)
        : [...selectedList, option.value]
      commitMultiple(next)
      setQuery("")
      highlightRef.current = -1
      setHighlight(-1)
      return
    }
    commitSingle(option.value)
    closeMenu()
  }
  function createTag(text: string) {
    const match = flat.find((option) => option.label === text || option.value === text)
    const nextValue = match?.value ?? text
    if (!selectedList.includes(nextValue)) commitMultiple([...selectedList, nextValue])
    setQuery("")
    highlightRef.current = -1
    setHighlight(-1)
  }
  function removeValue(value: string) {
    commitMultiple(selectedList.filter((item) => item !== value))
  }
  function onClear(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (disabled) return
    if (multiple) commitMultiple([])
    else commitSingle("")
    setQuery("")
    closeMenu()
  }
  function onInput(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value
    setQuery(next)
    highlightRef.current = -1
    setHighlight(-1)
    onSearch?.(next)
    if (!openRef.current) setOpen(true)
  }
  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>) {
    if (disabled) return
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!openRef.current) {
        openMenu()
        return
      }
      moveHighlight(event.key === "ArrowDown" ? 1 : -1)
      return
    }
    if (event.key === "Enter") {
      if (event.nativeEvent.isComposing) return
      const index = highlightRef.current
      const option = openRef.current && index >= 0 && index < visible.length ? visible[index] : undefined
      if (option && !option.disabled) {
        event.preventDefault()
        choose(option)
        return
      }
      if (!(event.currentTarget instanceof HTMLInputElement)) return
      event.preventDefault()
      if (mode !== "tags") return
      const text = event.currentTarget.value.trim()
      if (!text) return
      createTag(text)
      return
    }
    if (event.key === "Escape") {
      if (!openRef.current) return
      event.preventDefault()
      closeMenu()
      return
    }
    if (event.key !== "Backspace" || !multiple) return
    if (!(event.currentTarget instanceof HTMLInputElement) || event.currentTarget.value !== "") return
    if (selectedList.length === 0) return
    event.preventDefault()
    commitMultiple(selectedList.slice(0, -1))
  }

  const closeRef = React.useRef(closeMenu)
  React.useEffect(() => {
    openRef.current = isOpen
    closeRef.current = closeMenu
  })
  React.useEffect(() => {
    if (!isOpen) return
    function onMouseDown(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      closeRef.current()
    }
    document.addEventListener("mousedown", onMouseDown)
    return () => document.removeEventListener("mousedown", onMouseDown)
  }, [isOpen])

  const fieldProps = {
    id,
    ref: (node: HTMLButtonElement | HTMLInputElement | null) => assignRef(ref, node),
    role: "combobox" as const,
    disabled,
    "aria-invalid": invalid,
    "aria-describedby": ariaDescribedBy,
    "aria-busy": busy,
    "aria-expanded": isOpen,
    "aria-controls": isOpen ? listId : undefined,
    "aria-activedescendant": isOpen && activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined,
    "aria-haspopup": "listbox" as const,
    onKeyDown,
  }
  const controlClass = cn(
    "w-full rounded-md border border-input bg-transparent text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
    size === "sm" ? "h-8" : "h-9",
    status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20",
  )

  let start = 0
  const optionNodes = sections.map((section) => {
    const offset = start
    start += section.items.length
    const items = section.items.map((option, index) => {
      const itemIndex = offset + index
      return (
        <div
          key={option.value}
          id={`${listId}-opt-${itemIndex}`}
          role="option"
          aria-selected={selectedSet.has(option.value)}
          aria-disabled={option.disabled ? true : undefined}
          data-highlighted={itemIndex === activeIndex ? "" : undefined}
          className={cn("flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm", itemIndex === activeIndex && "bg-accent text-accent-foreground", option.disabled && "opacity-50")}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => choose(option)}
        >
          {renderOption ? renderOption(option) : option.label}
        </div>
      )
    })
    if (!section.label) return <div key={section.key}>{items}</div>
    return (
      <div key={section.key} role="group" aria-label={section.label}>
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{section.label}</div>
        {items}
      </div>
    )
  })

  const popup = !isOpen ? null : (
    <div
      id={listId}
      role="listbox"
      aria-multiselectable={multiple || undefined}
      className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      onMouseDown={(event) => event.preventDefault()}
    >
      {loading ? <div className="px-2 py-1.5 text-sm text-muted-foreground">加载中…</div> : null}
      {visible.length === 0 ? <div className="px-2 py-1.5 text-sm text-muted-foreground">{notFoundContent}</div> : optionNodes}
    </div>
  )

  const clearButton = showClear ? (
    <button
      type="button"
      aria-label="清除"
      className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground", multiple ? undefined : "absolute top-1/2 right-8 z-10 -translate-y-1/2")}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClear}
    >
      <XIcon className="size-4" aria-hidden />
    </button>
  ) : null

  const trigger = multiple ? (
    <div
      className={cn(
        "flex w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        size === "sm" ? "min-h-8" : "min-h-9",
        status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {visibleTags.map((value) => {
        const label = labels.get(value) ?? value
        return (
          <span key={value} className="inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs">
            {label}
            <button
              type="button"
              aria-label={`移除 ${label}`}
              className="inline-flex size-4 items-center justify-center text-muted-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation()
                removeValue(value)
              }}
            >
              <XIcon className="size-3" aria-hidden />
            </button>
          </span>
        )
      })}
      {overflow > 0 ? <span className="px-1 text-xs text-muted-foreground">+{overflow}</span> : null}
      <input
        {...fieldProps}
        type="text"
        className="min-w-12 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        value={inputValue}
        placeholder={selectedList.length === 0 ? placeholder : ""}
        autoComplete="off"
        aria-autocomplete="list"
        onChange={onInput}
        onClick={openMenu}
      />
      {clearButton}
      {loading ? <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
    </div>
  ) : useInput ? (
    <div className="relative">
      <input
        {...fieldProps}
        type="text"
        className={cn(controlClass, "px-3", showClear && "pr-8")}
        value={inputValue}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        onChange={onInput}
        onClick={openMenu}
      />
      {clearButton}
      {loading ? <Loader2Icon className="absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden /> : null}
    </div>
  ) : (
    <div className="relative">
      <button
        {...fieldProps}
        type="button"
        className={cn(controlClass, "flex items-center justify-between gap-2 px-3 text-left whitespace-nowrap")}
        onClick={() => {
          if (openRef.current) closeMenu()
          else openMenu()
        }}
      >
        <span className={cn("flex min-w-0 flex-1 items-center gap-2 truncate", !singleLabel && "text-muted-foreground")}>
          {loading ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          {singleLabel || placeholder}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" aria-hidden />
      </button>
      {clearButton}
    </div>
  )

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      {trigger}
      {popup}
    </div>
  )
}

export { SelectPlus }
