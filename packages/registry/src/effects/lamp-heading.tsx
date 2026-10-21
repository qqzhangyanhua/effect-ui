import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface LampHeadingProps {
  text: string
  className?: string
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function LampHeading({ text, className, color, fontSize, fontWeight, letterSpacing, align }: LampHeadingProps) {
  const painted = color !== undefined && color !== "#c4b5fd"
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-zinc-950 px-8 py-16 text-center", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div
          className={cn(
            "h-24 w-40 rounded-b-full blur-2xl",
            !painted && "bg-[radial-gradient(ellipse_at_top,#c4b5fd,transparent_70%)]",
          )}
          style={painted ? { background: `radial-gradient(ellipse at top, ${color}, transparent 70%)` } : undefined}
        />
      </div>
      <div className="pointer-events-none absolute top-6 left-1/2 h-20 w-px -translate-x-1/2 bg-linear-to-b from-violet-200 to-transparent" />
      <div className="pointer-events-none absolute top-6 left-1/2 h-2 w-16 -translate-x-1/2 rounded-full bg-violet-100/80 blur-[1px]" />
      <p
        className="relative font-display text-4xl tracking-tight text-white"
        style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
      >
        {text}
      </p>
      <p className="relative mt-2 text-sm text-white/45">灵感来自 lamp heading，原创实现</p>
    </div>
  )
}

export { LampHeading }
