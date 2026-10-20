"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type InputStatus = "error" | "warning"
type CountFormatter = (count: number, maxLength?: number) => React.ReactNode

export interface InputPlusProps extends Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "prefix"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  allowClear?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  showCount?: boolean
  status?: InputStatus
  countFormatter?: CountFormatter
}

export interface InputPlusPasswordProps extends Omit<InputPlusProps, "type"> {
  showPasswordLabel?: string
  hidePasswordLabel?: string
}

export interface InputPlusSearchProps extends InputPlusProps {
  onSearch?: (value: string) => void
  loading?: boolean
  searchLabel?: string
}

export interface InputPlusTextAreaProps
  extends Omit<React.ComponentProps<"textarea">, "value" | "defaultValue"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  allowClear?: boolean
  showCount?: boolean
  status?: InputStatus
  countFormatter?: CountFormatter
  autoSize?: boolean | { minRows?: number; maxRows?: number }
}

function withoutDataSlot<T extends object>(props: T) {
  return Object.fromEntries(Object.entries(props).filter(([key]) => key !== "data-slot")) as Omit<T, "data-slot">
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) ref.current = node
}

function clampText(value: string, maxLength?: number) {
  if (maxLength === undefined) return value
  return value.slice(0, maxLength)
}

function countText(count: number, maxLength?: number) {
  if (maxLength === undefined) return `${count}`
  return `剩余 ${Math.max(maxLength - count, 0)}`
}

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, next: string) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(element, next)
}

function useControllableText(value: string | undefined, defaultValue: string | undefined) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const current = value !== undefined ? value : uncontrolled
  function setCurrent(next: string) {
    if (value === undefined) setUncontrolled(next)
  }
  return [current, setCurrent] as const
}

function FieldFrame({
  className,
  status,
  disabled,
  prefix,
  suffix,
  showClear,
  onClear,
  showCount,
  count,
  maxLength,
  countFormatter,
  children,
}: {
  className?: string
  status?: InputStatus
  disabled?: boolean
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  showClear: boolean
  onClear: () => void
  showCount?: boolean
  count: number
  maxLength?: number
  countFormatter?: CountFormatter
  children: React.ReactNode
}) {
  return (
    <div className={cn("grid w-full gap-1", className)} data-status={status}>
      <InputGroup
        data-disabled={disabled ? "" : undefined}
        className={cn(status === "warning" && "border-amber-500 ring-[3px] ring-amber-500/20")}
      >
        {prefix ? <InputGroupAddon align="inline-start">{prefix}</InputGroupAddon> : null}
        {children}
        {showClear ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton aria-label="清除" onMouseDown={(event) => event.preventDefault()} onClick={onClear}>
              <XIcon aria-hidden />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
        {suffix ? <InputGroupAddon align="inline-end">{suffix}</InputGroupAddon> : null}
      </InputGroup>
      {showCount ? (
        <div className="text-right text-xs text-muted-foreground">
          {countFormatter ? countFormatter(count, maxLength) : countText(count, maxLength)}
        </div>
      ) : null}
    </div>
  )
}

function InputPlus({
  value,
  defaultValue,
  onValueChange,
  onChange,
  allowClear = false,
  prefix,
  suffix,
  showCount = false,
  status,
  countFormatter,
  maxLength,
  className,
  disabled,
  readOnly,
  id,
  ref,
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputPlusProps) {
  const innerRef = React.useRef<HTMLInputElement>(null)
  const [current, setCurrent] = useControllableText(value, defaultValue)
  const invalid = status === "error" ? true : ariaInvalidProp

  function emit(next: string, event: React.ChangeEvent<HTMLInputElement>) {
    const clipped = clampText(next, maxLength)
    setCurrent(clipped)
    onValueChange?.(clipped)
    if (clipped === next) onChange?.(event)
    else if (innerRef.current) {
      setNativeValue(innerRef.current, clipped)
      onChange?.({ target: innerRef.current, currentTarget: innerRef.current } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  function clear() {
    const element = innerRef.current
    if (!element) return
    setNativeValue(element, "")
    setCurrent("")
    onValueChange?.("")
    onChange?.({ target: element, currentTarget: element } as React.ChangeEvent<HTMLInputElement>)
    element.focus()
  }

  return (
    <FieldFrame
      className={className}
      status={status}
      disabled={disabled}
      prefix={prefix}
      suffix={suffix}
      showClear={allowClear && current.length > 0 && !disabled && !readOnly}
      onClear={clear}
      showCount={showCount}
      count={current.length}
      maxLength={maxLength}
      countFormatter={countFormatter}
    >
      <InputGroupInput
        {...withoutDataSlot(props)}
        ref={(node) => {
          innerRef.current = node
          assignRef(ref, node)
        }}
        id={id}
        value={current}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-invalid={invalid}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => emit(event.target.value, event)}
      />
    </FieldFrame>
  )
}

function InputPlusPassword({
  showPasswordLabel = "显示密码",
  hidePasswordLabel = "隐藏密码",
  suffix,
  ...props
}: InputPlusPasswordProps) {
  const [visible, setVisible] = React.useState(false)
  const label = visible ? hidePasswordLabel : showPasswordLabel
  return (
    <InputPlus
      {...props}
      type={visible ? "text" : "password"}
      suffix={
        <>
          {suffix}
          <InputGroupButton aria-label={label} onClick={() => setVisible((next) => !next)}>
            {visible ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
          </InputGroupButton>
        </>
      }
    />
  )
}

function InputPlusSearch({
  value,
  defaultValue,
  onValueChange,
  onSearch,
  loading = false,
  searchLabel = "搜索",
  suffix,
  onKeyDown,
  type = "search",
  ...props
}: InputPlusSearchProps) {
  const [current, setCurrent] = useControllableText(value, defaultValue)

  function search(next = current) {
    if (loading) return
    onSearch?.(next)
  }

  return (
    <InputPlus
      {...props}
      type={type}
      value={current}
      onValueChange={(next) => {
        setCurrent(next)
        onValueChange?.(next)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.key === "Enter" && !event.nativeEvent.isComposing && !event.defaultPrevented) {
          event.preventDefault()
          search(event.currentTarget.value)
        }
      }}
      suffix={
        <>
          {suffix}
          <InputGroupButton
            aria-label={searchLabel}
            aria-busy={loading || undefined}
            disabled={loading}
            onClick={() => search()}
          >
            {loading ? <Loader2Icon className="size-4 animate-spin" aria-hidden /> : <SearchIcon aria-hidden />}
            {searchLabel}
          </InputGroupButton>
        </>
      }
    />
  )
}

function textareaLimit(autoSize: InputPlusTextAreaProps["autoSize"]): React.CSSProperties | undefined {
  if (!autoSize || autoSize === true || autoSize.maxRows === undefined) return undefined
  return { maxHeight: `calc(${autoSize.maxRows}lh + 1rem)` }
}

function rowLimit(value: string, autoSize: InputPlusTextAreaProps["autoSize"], rows: number | undefined) {
  if (!autoSize) return rows
  const minRows = autoSize === true ? 1 : (autoSize.minRows ?? 1)
  const maxRows = autoSize === true ? undefined : autoSize.maxRows
  const lines = value === "" ? 1 : value.split("\n").length
  const atLeast = Math.max(lines, minRows)
  return maxRows === undefined ? atLeast : Math.min(atLeast, maxRows)
}

function InputPlusTextArea({
  value,
  defaultValue,
  onValueChange,
  onChange,
  allowClear = false,
  showCount = false,
  status,
  countFormatter,
  autoSize,
  maxLength,
  rows,
  className,
  disabled,
  readOnly,
  id,
  ref,
  "aria-invalid": ariaInvalidProp,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputPlusTextAreaProps) {
  const innerRef = React.useRef<HTMLTextAreaElement>(null)
  const [current, setCurrent] = useControllableText(value, defaultValue)
  const invalid = status === "error" ? true : ariaInvalidProp

  function emit(next: string, event: React.ChangeEvent<HTMLTextAreaElement>) {
    const clipped = clampText(next, maxLength)
    setCurrent(clipped)
    onValueChange?.(clipped)
    if (clipped === next) onChange?.(event)
    else if (innerRef.current) {
      setNativeValue(innerRef.current, clipped)
      onChange?.({
        target: innerRef.current,
        currentTarget: innerRef.current,
      } as React.ChangeEvent<HTMLTextAreaElement>)
    }
  }

  function clear() {
    const element = innerRef.current
    if (!element) return
    setNativeValue(element, "")
    setCurrent("")
    onValueChange?.("")
    onChange?.({ target: element, currentTarget: element } as React.ChangeEvent<HTMLTextAreaElement>)
    element.focus()
  }

  return (
    <FieldFrame
      className={className}
      status={status}
      disabled={disabled}
      showClear={allowClear && current.length > 0 && !disabled && !readOnly}
      onClear={clear}
      showCount={showCount}
      count={current.length}
      maxLength={maxLength}
      countFormatter={countFormatter}
    >
      <InputGroupTextarea
        {...withoutDataSlot(props)}
        ref={(node) => {
          innerRef.current = node
          assignRef(ref, node)
        }}
        id={id}
        value={current}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        rows={rowLimit(current, autoSize, rows)}
        className={autoSize ? "min-h-0 resize-none overflow-y-auto" : undefined}
        style={textareaLimit(autoSize)}
        aria-invalid={invalid}
        aria-describedby={ariaDescribedBy}
        onChange={(event) => emit(event.target.value, event)}
      />
    </FieldFrame>
  )
}

export { InputPlus, InputPlusPassword, InputPlusSearch, InputPlusTextArea }
