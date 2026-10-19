import * as React from "react"

import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps extends React.ComponentProps<"input"> {
  label: string
}

function FloatingLabelInput({ label, className, id, ...props }: FloatingLabelInputProps) {
  const generated = React.useId()
  const inputId = id ?? generated

  return (
    <div className={cn("relative", className)}>
      <input
        id={inputId}
        placeholder=" "
        className={cn(
          "peer h-11 w-full rounded-md border border-input bg-transparent px-3 pt-3 text-sm outline-none",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        )}
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
