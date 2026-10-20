import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps extends React.ComponentProps<"input"> {
  label: string
}

function FloatingLabelInput({ label, className, id, ...props }: FloatingLabelInputProps) {
  const generated = React.useId()
  const inputId = id ?? generated

  return (
    <div className={cn("relative", className)}>
      <Input
        id={inputId}
        placeholder=" "
        className="peer h-11 pt-3 pb-0 text-sm"
        {...props}
      />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute top-1/2 left-3 origin-left -translate-y-1/2 text-sm text-muted-foreground transition-all motion-reduce:transition-none peer-focus:top-2 peer-focus:text-[10px] peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]"
      >
        {label}
      </label>
    </div>
  )
}

export { FloatingLabelInput }
