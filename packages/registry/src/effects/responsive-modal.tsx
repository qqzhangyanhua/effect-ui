"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/responsive-modal.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { forwardRef } from "react"

const ResponsiveModal = DialogPrimitive.Root
const ResponsiveModalTrigger = DialogPrimitive.Trigger
const ResponsiveModalClose = DialogPrimitive.Close
const ResponsiveModalPortal = DialogPrimitive.Portal

const ResponsiveModalOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function ResponsiveModalOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})

const responsiveModalVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 fixed z-50 gap-4 overflow-y-auto p-6 shadow-lg transition ease-in-out lg:top-[50%] lg:left-[50%] lg:w-full lg:max-w-lg lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-xl lg:border lg:duration-200 lg:data-[state=open]:animate-in lg:data-[state=closed]:animate-out lg:data-[state=closed]:fade-out-0 lg:data-[state=open]:fade-in-0 lg:data-[state=closed]:zoom-out-95 lg:data-[state=open]:zoom-in-95 lg:data-[state=closed]:slide-out-to-left-1/2 lg:data-[state=closed]:slide-out-to-top-[48%] lg:data-[state=open]:slide-in-from-left-1/2 lg:data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 max-h-[80dvh] rounded-b-xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top lg:h-fit",
        bottom:
          "inset-x-0 bottom-0 max-h-[80dvh] rounded-t-xl border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom lg:h-fit",
        left: "inset-y-0 left-0 h-full w-3/4 rounded-r-xl border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm lg:h-fit",
        right:
          "inset-y-0 right-0 h-full w-3/4 rounded-l-xl border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm lg:h-fit",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  },
)

const fadeOnlyVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed z-50 gap-4 overflow-y-auto p-6 shadow-lg lg:top-[50%] lg:left-[50%] lg:w-full lg:max-w-lg lg:translate-x-[-50%] lg:translate-y-[-50%] lg:rounded-xl lg:border",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 max-h-[80dvh] rounded-b-xl border-b lg:h-fit",
        bottom: "inset-x-0 bottom-0 max-h-[80dvh] rounded-t-xl border-t lg:h-fit",
        left: "inset-y-0 left-0 h-full w-3/4 rounded-r-xl border-r sm:max-w-sm lg:h-fit",
        right: "inset-y-0 right-0 h-full w-3/4 rounded-l-xl border-l sm:max-w-sm lg:h-fit",
      },
    },
    defaultVariants: {
      side: "bottom",
    },
  },
)

export interface ResponsiveModalContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof responsiveModalVariants> {
  side?: "top" | "bottom" | "left" | "right"
}

const ResponsiveModalContent = forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, ResponsiveModalContentProps>(
  function ResponsiveModalContent({ side = "bottom", className, children, ...props }, ref) {
    const prefersReducedMotion = usePrefersReducedMotion()
    const classes = prefersReducedMotion ? fadeOnlyVariants({ side }) : responsiveModalVariants({ side })
    return (
      <ResponsiveModalPortal>
        <ResponsiveModalOverlay />
        <DialogPrimitive.Content
          className={cn(classes, className)}
          data-reduced={prefersReducedMotion ? "true" : "false"}
          data-slot="responsive-modal"
          ref={ref}
          {...props}
        >
          {children}
          <ResponsiveModalClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">关闭</span>
          </ResponsiveModalClose>
        </DialogPrimitive.Content>
      </ResponsiveModalPortal>
    )
  },
)

function ResponsiveModalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}

function ResponsiveModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

const ResponsiveModalTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function ResponsiveModalTitle({ className, ...props }, ref) {
  return <DialogPrimitive.Title className={cn("text-foreground text-lg font-semibold", className)} ref={ref} {...props} />
})

const ResponsiveModalDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function ResponsiveModalDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description className={cn("text-muted-foreground text-sm", className)} ref={ref} {...props} />
})

export {
  ResponsiveModal,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalOverlay,
  ResponsiveModalPortal,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
}
