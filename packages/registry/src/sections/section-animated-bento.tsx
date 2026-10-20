import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { BorderBeam } from "@/components/ui/border-beam"
import { CountUp } from "@/components/ui/count-up"
import { OrbitingCircles } from "@/components/ui/orbiting-circles"
import { Sparkles } from "@/components/ui/sparkles"
import { WordRotate } from "@/components/ui/word-rotate"
import { cn } from "@/lib/utils"

export interface SectionAnimatedBentoProps {
  className?: string
}

function SectionAnimatedBento({ className }: SectionAnimatedBentoProps) {
  return (
    <section className={cn("space-y-6 rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Animated bento</p>
        <h2 className="font-display mt-2 text-3xl">每个格子自己动</h2>
      </div>
      <BentoGrid className="auto-rows-[9rem] md:auto-rows-[10rem]">
        <BentoCard className="flex flex-col justify-between">
          <p className="text-xs text-muted-foreground">安装次数</p>
          <p className="font-display text-4xl">
            <CountUp value={12840} />
          </p>
        </BentoCard>
        <BentoCard colSpan={2} className="grid place-items-center">
          <OrbitingCircles radius={54} className="size-40">
            <span className="text-xs">FX</span>
            <span className="text-xs">UI</span>
            <span className="text-xs">MIT</span>
          </OrbitingCircles>
        </BentoCard>
        <BentoCard className="grid place-items-center">
          <Sparkles className="font-display text-xl">Launch</Sparkles>
        </BentoCard>
        <BentoCard>
          <BorderBeam className="h-full min-h-0 p-4">
            <p className="text-xs text-muted-foreground">本周主题</p>
            <WordRotate words={["Shaders", "Sections", "Cursors"]} className="mt-2 text-lg font-medium" />
          </BorderBeam>
        </BentoCard>
        <BentoCard className="flex flex-col justify-center">
          <p className="text-xs text-muted-foreground">组成</p>
          <p className="mt-1 text-sm">bento-grid · count-up · orbiting-circles · sparkles · border-beam · word-rotate</p>
        </BentoCard>
      </BentoGrid>
    </section>
  )
}

export { SectionAnimatedBento }
