import * as React from "react"

import { cn } from "@/lib/utils"

export type DotsLoaderProps = React.HTMLAttributes<HTMLDivElement>

function DotsLoader({ className, ...props }: DotsLoaderProps) {
  return (
    <div
      role="status"
      data-slot="dots-loader"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-2 rounded-full bg-primary"
          style={{
            animation: "dot-bounce 0.9s ease-in-out infinite",
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
      <span className="sr-only">Loading</span>
    </div>
  )
}

export { DotsLoader }
