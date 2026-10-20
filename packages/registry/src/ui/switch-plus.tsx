"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type SwitchProps = React.ComponentProps<typeof Switch>

export interface SwitchPlusProps extends Omit<SwitchProps, "checked" | "defaultChecked" | "onCheckedChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  loading?: boolean
  checkedChildren?: React.ReactNode
  unCheckedChildren?: React.ReactNode
  size?: "sm" | "default"
}

function SwitchPlus({
  loading = false,
  checkedChildren,
  unCheckedChildren,
  size = "default",
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  className,
  id,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SwitchPlusProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultChecked)
  const isChecked = checked ?? uncontrolled
  const label = isChecked ? checkedChildren : unCheckedChildren

  return (
    <span className="relative inline-flex">
      <Switch
        {...props}
        ref={ref}
        id={id}
        checked={isChecked}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-size={size}
        data-loading={loading ? "true" : undefined}
        className={cn(
          size === "sm" &&
            "h-4 w-7 [&_[data-slot=switch-thumb]]:size-3 data-[state=checked]:[&_[data-slot=switch-thumb]]:translate-x-3.5",
          className,
        )}
        onCheckedChange={(next) => {
          if (loading) return
          if (checked === undefined) setUncontrolled(next)
          onCheckedChange?.(next)
        }}
      />
      {loading ? (
        <Loader2Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 animate-spin",
            isChecked ? "right-0.5" : "left-0.5",
          )}
        />
      ) : null}
      {label != null ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] leading-none",
            isChecked ? "left-1 text-primary-foreground" : "right-1 text-muted-foreground",
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  )
}

export { SwitchPlus }
