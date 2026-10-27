import { cn } from "@/lib/cn"

export interface SectionAnimatedBentoProps {
  className?: string
}

const words = ["Shaders", "Sections", "Cursors"]

function SectionAnimatedBento({ className }: SectionAnimatedBentoProps) {
  return (
    <section className={cn("space-y-6 rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Animated bento</p>
        <h2 className="font-display mt-2 text-3xl">每个格子自己动</h2>
      </div>
      <div className="grid auto-rows-[9rem] grid-cols-1 gap-3 md:auto-rows-[10rem] md:grid-cols-4">
        <div className="flex flex-col justify-between rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">安装次数</p>
          <p className="font-display text-4xl">
            <span>12840</span>
          </p>
        </div>
        <div className="grid place-items-center rounded-xl border p-4 md:col-span-2">
          <div className="flex size-40 items-center justify-center gap-3">
            <span className="text-xs">FX</span>
            <span className="text-xs">UI</span>
            <span className="text-xs">MIT</span>
          </div>
        </div>
        <div className="grid place-items-center rounded-xl border p-4">
          <span className="font-display text-xl">Launch</span>
        </div>
        <div className="rounded-xl border p-4">
          <div className="h-full min-h-0">
            <p className="text-xs text-muted-foreground">本周主题</p>
            <span className="mt-2 block text-lg font-medium">{words[0]}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">组成</p>
          <p className="mt-1 text-sm">bento-grid · count-up · orbiting-circles · sparkles · border-beam · word-rotate</p>
        </div>
      </div>
    </section>
  )
}

export { SectionAnimatedBento }
