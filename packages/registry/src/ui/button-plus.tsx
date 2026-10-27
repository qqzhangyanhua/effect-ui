import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/cn"

type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
type Size = "default" | "sm" | "lg" | "icon"

const variantClass: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  outline: "border bg-background hover:bg-accent",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent",
  link: "underline-offset-4 hover:underline",
}

const sizeClass: Record<Size, string> = {
  default: "h-9 px-4",
  sm: "h-8 px-3 text-sm",
  lg: "h-10 px-6",
  icon: "size-9",
}

export interface ButtonPlusProps extends Omit<React.ComponentProps<"button">, "type"> {
  variant?: Variant
  size?: Size
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  danger?: boolean
  block?: boolean
  htmlType?: "button" | "submit" | "reset"
}

function hasLabel(children: React.ReactNode): boolean {
  return React.Children.count(children) > 0
}

function ButtonPlus({
  loading = false,
  icon,
  danger = false,
  block = false,
  htmlType = "button",
  variant,
  size,
  asChild = false,
  disabled,
  className,
  children,
  onClick,
  ...props
}: ButtonPlusProps) {
  const iconOnly = !hasLabel(children)
  const solidDanger = danger && (variant === undefined || variant === "default" || variant === "secondary")
  const resolvedVariant = solidDanger ? "destructive" : variant
  const dangerClass =
    danger && variant === "outline"
      ? "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
      : danger && variant === "ghost"
        ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
        : danger && variant === "link"
          ? "text-destructive"
          : undefined
  const square = iconOnly && !asChild
  const buttonSize = square && (size === undefined || size === "default") ? "icon" : size

  const buttonClass = cn(
    "relative inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap",
    variantClass[resolvedVariant ?? "default"],
    sizeClass[buttonSize ?? "default"],
    dangerClass,
    block && "w-full",
    square && size === "sm" && "size-8",
    square && size === "lg" && "size-10",
    className,
  )

  return (
    <button
      {...props}
      type={htmlType}
      disabled={disabled || loading}
      aria-busy={loading ? true : props["aria-busy"]}
      data-danger={danger ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-block={block ? "true" : undefined}
      data-icon-only={square ? "true" : undefined}
      className={buttonClass}
      onClick={(event) => {
        if (loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
      }}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span
            aria-hidden={loading || undefined}
            className={cn("inline-flex items-center justify-center gap-2", loading && "invisible")}
          >
            {icon}
            {children}
          </span>
          {loading ? (
            <span className="absolute inset-0 inline-flex items-center justify-center gap-2">
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              {children}
            </span>
          ) : null}
        </>
      )}
    </button>
  )
}

export { ButtonPlus }
