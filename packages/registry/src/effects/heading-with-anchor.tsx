"use client"

// Ported from shadcn-ui-expansions (MIT, (c) 2024 shadcnui-expansions) — https://github.com/hsuanyi-chou/shadcn-ui-expansions/blob/main/components/ui/heading-with-anchor.tsx

import { cn } from "@/lib/utils"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { LinkIcon } from "lucide-react"

const headingVariants = cva("text-primary font-bold", {
  variants: {
    variant: {
      h1: "text-4xl leading-14 lg:text-5xl",
      h2: "text-3xl leading-14 lg:text-4xl",
      h3: "text-2xl leading-10 lg:text-3xl",
      h4: "text-xl leading-8 lg:text-2xl",
      h5: "text-lg leading-8 lg:text-xl",
      h6: "text-sm leading-7 lg:text-base",
      p: "text-lg leading-5 font-normal lg:text-xl",
    },
  },
  defaultVariants: {
    variant: "h6",
  },
})

type HeadingVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"

export interface HeadingWithAnchorProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  variant?: HeadingVariant
  asChild?: boolean
  anchor?: string
  anchorAlignment?: "close" | "spaced"
  anchorVisibility?: "hover" | "always" | "never"
  disableCopyToClipboard?: boolean
}

function Anchor({
  anchor,
  disableCopyToClipboard = false,
  anchorVisibility = "always",
}: {
  anchor?: string
  disableCopyToClipboard?: boolean
  anchorVisibility?: "hover" | "always" | "never"
}) {
  function copyToClipboard() {
    if (disableCopyToClipboard || !anchor) return
    const currentUrl = window.location.href.replace(/#.*$/, "")
    const urlWithId = `${currentUrl}#${anchor}`
    if (navigator.clipboard) void navigator.clipboard.writeText(urlWithId)
  }

  return (
    <span
      className={cn(
        "ms-2 pt-1",
        anchorVisibility === "always" && "visible",
        anchorVisibility === "never" && "hidden",
        anchorVisibility === "hover" && "invisible group-hover:visible",
      )}
    >
      <a href={`#${anchor ?? ""}`} onClick={copyToClipboard}>
        <LinkIcon className="text-muted-foreground hover:text-foreground h-4 w-4" />
      </a>
    </span>
  )
}

export function HeadingWithAnchor({
  children,
  className,
  variant = "h6",
  asChild = false,
  anchor,
  anchorAlignment = "spaced",
  anchorVisibility = "always",
  disableCopyToClipboard = false,
  ...props
}: HeadingWithAnchorProps) {
  const Comp = (asChild ? Slot : variant) as React.ElementType
  return (
    <Comp
      {...props}
      className={cn(
        anchor && "flex scroll-m-20 items-center gap-1",
        anchorAlignment === "spaced" && "justify-between",
        anchorVisibility === "hover" && "group",
        headingVariants({ variant, className }),
      )}
      data-slot="heading-with-anchor"
      id={anchor}
    >
      {children}
      {anchor ? (
        <Anchor anchor={anchor} anchorVisibility={anchorVisibility} disableCopyToClipboard={disableCopyToClipboard} />
      ) : null}
    </Comp>
  )
}

type TypographyProps = Omit<HeadingWithAnchorProps, "variant" | "asChild">

export function H1(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h1" />
}

export function H2(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h2" />
}

export function H3(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h3" />
}

export function H4(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h4" />
}

export function H5(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h5" />
}

export function H6(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="h6" />
}

export function P(props: TypographyProps) {
  return <HeadingWithAnchor {...props} variant="p" />
}
