import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

export interface ButtonPlusProps extends Omit<ButtonProps, "type"> {
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

  return (
    <Button
      {...props}
      type={htmlType}
      variant={resolvedVariant}
      size={buttonSize}
      asChild={asChild}
      disabled={disabled || loading}
      aria-busy={loading ? true : props["aria-busy"]}
      data-danger={danger ? "true" : undefined}
      data-loading={loading ? "true" : undefined}
      data-block={block ? "true" : undefined}
      data-icon-only={square ? "true" : undefined}
      className={cn(
        "relative",
        dangerClass,
        block && "w-full",
        square && size === "sm" && "size-8",
        square && size === "lg" && "size-10",
        className,
      )}
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
    </Button>
  )
}

export { ButtonPlus }
