"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/loading-button.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { Slot, Slottable } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground border",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(function LoadingButton(
  { className, loading = false, children, disabled, variant, size, asChild = false, ...props },
  ref,
) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      {...props}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="loading-button"
      disabled={loading || disabled}
      ref={ref}
    >
      {loading ? (
        <Loader2 className={cn("mr-2 h-5 w-5", !prefersReducedMotion && "animate-spin")} />
      ) : null}
      <Slottable>{children}</Slottable>
    </Comp>
  )
})

export { buttonVariants }
