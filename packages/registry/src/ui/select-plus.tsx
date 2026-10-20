"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"
import { Loader2Icon, XIcon } from "lucide-react"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

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

type ItemGroup = { label: string; items: SelectOption[] }

const searchReasons = new Set(["input-change", "input-paste", "input-clear"])

function SelectClear({ disabled, className }: { disabled?: boolean; className?: string }) {
  return (
    <ComboboxPrimitive.Clear
      aria-label="清除"
      disabled={disabled}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground",
        className,
      )}
    >
      <XIcon />
    </ComboboxPrimitive.Clear>
  )
}

function isOptionGroup(entry: SelectOption | SelectOptionGroup): entry is SelectOptionGroup {
  return "options" in entry
}

function isMultipleProps(
  props: SelectPlusProps,
): props is Extract<SelectPlusProps, { mode: "multiple" | "tags" }> {
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

function matchesOption(option: SelectOption, query: string, filterOption: FilterOption | undefined): boolean {
  if (filterOption === false) return true
  if (typeof filterOption === "function") return filterOption(query, option)
  return option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
}

function SelectPlus(props: SelectPlusProps) {
  const {
    mode = "single",
    options,
    children,
    showSearch,
    filterOption,
    onSearch,
    allowClear = false,
    loading = false,
    disabled = false,
    status,
    size = "default",
    open,
    onOpenChange,
    placeholder: placeholderProp,
    notFoundContent = "没有匹配项",
    renderOption,
    className,
    id,
    ref,
    "aria-invalid": ariaInvalidProp,
    "aria-describedby": ariaDescribedBy,
  } = props
  const maxTagCount = "maxTagCount" in props ? props.maxTagCount : undefined
  const multiple = mode !== "single"
  const search = showSearch ?? multiple
  const placeholder = placeholderProp ?? "请选择"
  const valueProp = props.value
  const [uncontrolled, setUncontrolled] = React.useState<string | string[]>(() => {
    if (props.defaultValue !== undefined) return props.defaultValue
    return multiple ? [] : ""
  })
  const selected = valueProp !== undefined ? valueProp : uncontrolled
  const selectedList = Array.isArray(selected) ? selected : []
  const selectedSingle = typeof selected === "string" ? selected : ""
  const flat = React.useMemo(() => flattenOptions(options), [options])
  const labels = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const option of flat) map.set(option.value, option.label)
    return map
  }, [flat])
  const grouped = Boolean(options && options.length > 0 && options[0] && isOptionGroup(options[0]))
  const items = React.useMemo(() => {
    if (!options || options.length === 0) return undefined
    const accessors = {
      getValue: (item: SelectOption) => item.value,
      getLabel: (item: SelectOption) => item.label,
    }
    if (grouped) {
      const groups: ItemGroup[] = []
      for (const entry of options) {
        if (isOptionGroup(entry)) groups.push({ label: entry.label, items: entry.options })
        else groups.push({ label: entry.label, items: [entry] })
      }
      return ComboboxPrimitive.createItems(groups, accessors)
    }
    return ComboboxPrimitive.createItems(
      options.filter((entry): entry is SelectOption => !isOptionGroup(entry)),
      accessors,
    )
  }, [grouped, options])
  const [searchText, setSearchText] = React.useState("")
  const highlighted = React.useRef<string | null>(null)
  const popupInputRef = React.useRef<HTMLInputElement>(null)
  const anchor = useComboboxAnchor()
  const ariaInvalid = status === "error" ? true : ariaInvalidProp
  const describedBy = ariaDescribedBy
  const busy = loading ? true : undefined

  function commitSingle(next: string) {
    if (valueProp === undefined) setUncontrolled(next)
    if (isMultipleProps(props)) return
    props.onValueChange?.(next)
  }

  function commitMultiple(next: string[]) {
    if (valueProp === undefined) setUncontrolled(next)
    if (!isMultipleProps(props)) return
    props.onValueChange?.(next)
  }

  function handleInput(next: string, details: { reason: string }) {
    if (multiple) setSearchText(next)
    if (searchReasons.has(details.reason)) onSearch?.(next)
  }

  function handleHighlight(value: string | undefined) {
    highlighted.current = value ?? null
  }

  function acceptItem(item: SelectOption, query: string) {
    if (!search) return true
    return matchesOption(item, query, filterOption)
  }

  function renderItem(option: SelectOption) {
    return (
      <ComboboxItem key={option.value} value={option.value} disabled={option.disabled}>
        {renderOption ? renderOption(option) : option.label}
      </ComboboxItem>
    )
  }

  function createTag(text: string) {
    const match = flat.find((option) => option.label === text || option.value === text)
    const nextValue = match?.value ?? text
    if (!selectedList.includes(nextValue)) commitMultiple([...selectedList, nextValue])
    setSearchText("")
  }

  const buttonClass = cn(
    "flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40",
    size === "sm" ? "h-8" : "h-9",
    status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20",
    className,
  )
  const inputClass = cn("w-full", size === "sm" && "h-8", status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20", className)
  const chipsClass = cn(
    "w-full",
    size === "sm" ? "min-h-8" : "min-h-9",
    status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20",
    className,
  )
  const visibleTags = maxTagCount === undefined ? selectedList : selectedList.slice(0, maxTagCount)
  const overflow = selectedList.length - visibleTags.length
  const fieldProps = {
    id,
    disabled,
    "aria-invalid": ariaInvalid,
    "aria-describedby": describedBy,
    "aria-busy": busy,
  }

  const popup = (
    <ComboboxContent anchor={multiple ? anchor : undefined}>
      {search ? null : (
        <ComboboxInput
          ref={popupInputRef}
          aria-hidden
          showTrigger={false}
          showClear={false}
          tabIndex={-1}
          className="sr-only"
        />
      )}
      {loading ? <div className="px-2 py-1.5 text-sm text-muted-foreground">加载中…</div> : null}
      <ComboboxEmpty>{notFoundContent}</ComboboxEmpty>
      <ComboboxList>
        {options
          ? grouped
            ? (group: ItemGroup) => (
                <ComboboxGroup key={group.label} items={group.items}>
                  <ComboboxLabel>{group.label}</ComboboxLabel>
                  <ComboboxCollection>{(option: SelectOption) => renderItem(option)}</ComboboxCollection>
                </ComboboxGroup>
              )
            : (option: SelectOption) => renderItem(option)
          : children}
      </ComboboxList>
    </ComboboxContent>
  )

  const buttonField = (
    <div className="relative w-full">
      <ComboboxTrigger
        ref={ref as React.Ref<HTMLButtonElement>}
        className={buttonClass}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
          queueMicrotask(() => popupInputRef.current?.focus())
        }}
        {...fieldProps}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {loading ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : null}
          <ComboboxValue placeholder={placeholder} />
        </span>
      </ComboboxTrigger>
      {allowClear ? (
        <SelectClear disabled={disabled} className="absolute top-1/2 right-8 -translate-y-1/2" />
      ) : null}
    </div>
  )

  const searchField = (
    <ComboboxInput
      ref={ref as React.Ref<HTMLInputElement>}
      className={inputClass}
      placeholder={placeholder}
      showClear={false}
      {...fieldProps}
    >
      {allowClear ? <SelectClear disabled={disabled} /> : null}
      {loading ? <Loader2Icon className="mr-2 size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
    </ComboboxInput>
  )

  const chipsField = (
    <ComboboxChips
      ref={anchor}
      className={chipsClass}
      onKeyDownCapture={(event) => {
        if (event.key !== "Backspace") return
        const target = event.target
        if (!(target instanceof HTMLInputElement) || target.value !== "") return
        if (selectedList.length === 0) return
        event.preventDefault()
        event.stopPropagation()
        commitMultiple(selectedList.slice(0, -1))
      }}
    >
      {visibleTags.map((item) => (
        <ComboboxChip key={item}>{labels.get(item) ?? item}</ComboboxChip>
      ))}
      {overflow > 0 ? <span className="px-1 text-xs text-muted-foreground">+{overflow}</span> : null}
      {search ? (
        <ComboboxChipsInput
          ref={ref as React.Ref<HTMLInputElement>}
          placeholder={selectedList.length === 0 ? placeholder : ""}
          onKeyDown={(event) => {
            if (mode !== "tags" || event.key !== "Enter" || event.nativeEvent.isComposing) return
            const text = event.currentTarget.value.trim()
            if (!text || highlighted.current) return
            event.preventDefault()
            event.stopPropagation()
            createTag(text)
          }}
          {...fieldProps}
        />
      ) : (
        <ComboboxTrigger ref={ref as React.Ref<HTMLButtonElement>} className="ml-auto" aria-label="打开选项" {...fieldProps} />
      )}
      {allowClear ? <SelectClear disabled={disabled} /> : null}
      {loading ? <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
    </ComboboxChips>
  )

  const field = multiple ? chipsField : search ? searchField : buttonField
  const shared = {
    items,
    disabled,
    open,
    onOpenChange: (next: boolean) => onOpenChange?.(next),
    onInputValueChange: handleInput,
    onItemHighlighted: handleHighlight,
    filter: options ? acceptItem : undefined,
  }

  if (multiple) {
    return (
      <Combobox<string, true, SelectOption>
        {...shared}
        multiple
        inputValue={search ? searchText : ""}
        value={selectedList}
        onValueChange={(next) => commitMultiple([...next])}
      >
        {field}
        {popup}
      </Combobox>
    )
  }

  return (
    <Combobox<string, false, SelectOption>
      {...shared}
      value={selectedSingle === "" ? null : selectedSingle}
      onValueChange={(next) => commitSingle(next ?? "")}
    >
      {field}
      {popup}
    </Combobox>
  )
}

export { SelectPlus }
