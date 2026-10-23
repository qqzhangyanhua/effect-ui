"use client"

import { BlindPullToggle } from "../effects/blind-pull-toggle"
import { DangerStripes } from "../effects/danger-stripes"
import { DiamondGrid } from "../effects/diamond-grid"
import { FlipCalendar } from "../effects/flip-calendar"
import { AiJobCards, defaultJobStacks } from "../effects/job-listing-cards"
import { LabelCards, defaultLabelCards } from "../effects/label-cards"
import { MoodTracker } from "../effects/mood-tracker"
import { GlassMusicPlayer } from "../effects/music-player-card"
import { NewProjectModal } from "../effects/new-project-modal"
import { SliceType } from "../effects/slice-type"
import { StackTower } from "../effects/stack-tower"
import { TagaToggle } from "../effects/taga-toggle"
import { VoiceChatPill } from "../effects/voice-chat-pill"
import { WildMorph } from "../effects/wild-morph"

function ClaudeLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#d97757"
        d="M 233.959793 800.214905 L 468.644287 668.536987 L 472.590637 657.100647 L 468.644287 650.738403 L 457.208069 650.738403 L 417.986633 648.322144 L 283.892639 644.69812 L 167.597321 639.865845 L 54.926208 633.825623 L 26.577238 627.785339 L 3.3e-05 592.751709 L 2.73832 575.27533 L 26.577238 559.248352 L 60.724873 562.228149 L 136.187973 567.382629 L 249.422867 575.194763 L 331.570496 580.026978 L 453.261841 592.671082 L 472.590637 592.671082 L 475.328857 584.859009 L 468.724915 580.026978 L 463.570557 575.194763 L 346.389313 495.785217 L 219.543671 411.865906 L 153.100723 363.543762 L 117.181267 339.060425 L 99.060455 316.107361 L 91.248367 266.01355 L 123.865784 230.093994 L 167.677887 233.073853 L 178.872513 236.053772 L 223.248367 270.201477 L 318.040283 343.570496 L 441.825592 434.738342 L 459.946411 449.798706 L 467.194672 444.64447 L 468.080597 441.020203 L 459.946411 427.409485 L 392.617493 305.718323 L 320.778564 181.932983 L 288.80542 130.630859 L 280.348999 99.865845 C 277.369171 87.221436 275.194641 76.590698 275.194641 63.624268 L 312.322174 13.20813 L 332.8591 6.604126 L 382.389313 13.20813 L 403.248352 31.328979 L 434.013519 101.71814 L 483.865753 212.537048 L 561.181274 363.221497 L 583.812134 407.919434 L 595.892639 449.315491 L 600.40271 461.959839 L 608.214783 461.959839 L 608.214783 454.711609 L 614.577271 369.825623 L 626.335632 265.61084 L 637.771851 131.516846 L 641.718201 93.745117 L 660.402832 48.483276 L 697.530334 24.000122 L 726.52356 37.852417 L 750.362549 72 L 747.060486 94.067139 L 732.886047 186.201416 L 705.100708 330.52356 L 686.979919 427.167847 L 697.530334 427.167847 L 709.61084 415.087341 L 758.496704 350.174561 L 840.644348 247.490051 L 876.885925 206.738342 L 919.167847 161.71814 L 946.308838 140.29541 L 997.61084 140.29541 L 1035.38269 196.429626 L 1018.469849 254.416199 L 965.637634 321.422852 L 921.825562 378.201538 L 859.006714 462.765259 L 819.785278 530.41626 L 823.409424 535.812073 L 832.75177 534.92627 L 974.657776 504.724915 L 1051.328979 490.872559 L 1142.818848 475.167786 L 1184.214844 494.496582 L 1188.724854 514.147644 L 1172.456421 554.335693 L 1074.604126 578.496765 L 959.838989 601.449829 L 788.939636 641.879272 L 786.845764 643.409485 L 789.261841 646.389343 L 866.255127 653.637634 L 899.194702 655.409424 L 979.812134 655.409424 L 1129.932861 666.604187 L 1169.154419 692.537109 L 1192.671265 724.268677 L 1188.724854 748.429688 L 1128.322144 779.194641 L 1046.818848 759.865845 L 856.590759 714.604126 L 791.355774 698.335754 L 782.335693 698.335754 L 782.335693 703.731567 L 836.69812 756.885986 L 936.322205 846.845581 L 1061.073975 962.81897 L 1067.436279 991.490112 L 1051.409424 1014.120911 L 1034.496704 1011.704712 L 924.885986 929.234924 L 882.604126 892.107544 L 786.845764 811.48999 L 780.483276 811.48999 L 780.483276 819.946289 L 802.550415 852.241699 L 919.087341 1027.409424 L 925.127625 1081.127686 L 916.671204 1098.604126 L 886.469849 1109.154419 L 853.288696 1103.114136 L 785.073914 1007.355835 L 714.684631 899.516785 L 657.906067 802.872498 L 650.979858 806.81897 L 617.476624 1167.704834 L 601.771851 1186.147705 L 565.530212 1200 L 535.328857 1177.046997 L 519.302124 1139.919556 L 535.328857 1066.550537 L 554.657776 970.792053 L 570.362488 894.68457 L 584.536926 800.134277 L 592.993347 768.724976 L 592.429626 766.630859 L 585.503479 767.516968 L 514.22821 865.369263 L 405.825531 1011.865906 L 320.053711 1103.677979 L 299.516815 1111.812256 L 263.919525 1093.369263 L 267.221497 1060.429688 L 287.114136 1031.114136 L 405.825531 880.107361 L 477.422913 786.52356 L 523.651062 732.483276 L 523.328918 724.671265 L 520.590698 724.671265 L 205.288605 929.395935 L 149.154434 936.644409 L 124.993355 914.01355 L 127.973183 876.885986 L 139.409409 864.80542 L 234.201385 799.570435 Z"
      />
    </svg>
  )
}

function GeminiLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gemini-grad" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4893FC" />
          <stop offset="0.27" stopColor="#4893FC" />
          <stop offset="0.777" stopColor="#969DFF" />
          <stop offset="1" stopColor="#BD99FE" />
        </linearGradient>
      </defs>
      <path
        d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z"
        fill="url(#gemini-grad)"
      />
    </svg>
  )
}

function PerplexityLogo({ isDark }: { isDark: boolean }) {
  const fill = isDark ? '#FFFFFF' : '#1C1C1C'
  return (
    <svg width="24" height="24" viewBox="0 0 16 16" fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 .188a.5.5 0 0 1 .503.5V4.03l3.022-2.92.059-.048a.51.51 0 0 1 .49-.054.5.5 0 0 1 .306.46v3.247h1.117l.1.01a.5.5 0 0 1 .403.49v5.558a.5.5 0 0 1-.503.5H12.38v3.258a.5.5 0 0 1-.312.462.51.51 0 0 1-.55-.11l-3.016-3.018v3.448c0 .275-.225.5-.503.5a.5.5 0 0 1-.503-.5v-3.448l-3.018 3.019a.51.51 0 0 1-.548.11.5.5 0 0 1-.312-.463v-3.258H2.503a.5.5 0 0 1-.503-.5V5.215l.01-.1c.047-.229.25-.4.493-.4H3.62V1.469l.006-.074a.5.5 0 0 1 .302-.387.51.51 0 0 1 .547.102l3.023 2.92V.687c0-.276.225-.5.503-.5M4.626 9.333v3.984l2.87-2.872v-4.01zm3.877 1.113 2.871 2.871V9.333l-2.87-2.897zm3.733-1.668a.5.5 0 0 1 .145.35v1.145h.612V5.715H9.201zm-9.23 1.495h.613V9.13c0-.131.052-.257.145-.35l3.033-3.064h-3.79zm1.62-5.558H6.76L4.626 2.652zm4.613 0h2.134V2.652z" />
    </svg>
  )
}

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

export function BlindPullToggleDemo({
  color = "var(--foreground)",
  duration = 700,
  size = 80,
}: {
  color?: string
  duration?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <BlindPullToggle color={color} duration={duration} size={size} />
    </div>
  )
}

export function DangerStripesDemo({
  color = "var(--primary)",
  intensity = 1,
  speed = 1,
  trigger = "hover",
}: {
  color?: string
  intensity?: number
  speed?: number
  trigger?: "mount" | "hover" | "inView"
} = {}) {
  return (
    <div className="min-h-80 w-full">
      <DangerStripes color={color} intensity={intensity} speed={speed} trigger={trigger} />
    </div>
  )
}

export function FlipCalendarDemo({
  duration = 220,
  color = "var(--primary-foreground)",
  size = 260,
}: {
  duration?: number
  color?: string
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <FlipCalendar duration={duration} color={color} size={size} />
    </div>
  )
}

export function SliceTypeDemo({
  fontSize = 96,
  duration = 900,
  color = "var(--foreground)",
}: {
  fontSize?: number
  duration?: number
  color?: string
} = {}) {
  return (
    <div className="min-h-64 w-full">
      <SliceType top="光亮" bottom="夜晚" fontSize={fontSize} duration={duration} color={color} />
    </div>
  )
}

export function StackTowerDemo({
  speed = 0.2,
  fontSize = 72,
  color = "var(--primary)",
}: {
  speed?: number
  fontSize?: number
  color?: string
} = {}) {
  return (
    <div className="min-h-80 w-full">
      <StackTower rows={["堆叠", "高塔"]} speed={speed} fontSize={fontSize} color={color} />
    </div>
  )
}

export function TagaToggleDemo({
  color = "var(--foreground)",
  size = 80,
  duration = 280,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <TagaToggle color={color} duration={duration} size={size} />
    </div>
  )
}

export function DiamondGridDemo({
  color = "var(--foreground)",
  speed = 1,
  count = 34,
  gap = 96,
}: {
  color?: string
  speed?: number
  count?: number
  gap?: number
} = {}) {
  return (
    <div className="min-h-80 w-full">
      <DiamondGrid color={color} speed={speed} count={count} gap={gap} />
    </div>
  )
}

export function WildMorphDemo({
  intensity = 1,
  fontSize = 96,
  color = "var(--foreground)",
}: {
  intensity?: number
  fontSize?: number
  color?: string
} = {}) {
  return (
    <div className="min-h-64 w-full">
      <WildMorph text="野性" intensity={intensity} fontSize={fontSize} color={color} />
    </div>
  )
}

export function MoodTrackerDemo() {
  return (
    <MoodTracker title="今天感觉怎么样？" subtitle="今天 · 连续 6 天" />
  )
}

export function VoiceChatPillDemo() {
  return <VoiceChatPill />
}

const jobTitles = [
  ["提示词工程师", "安全研究员", "可解释性负责人"],
  ["生成式 AI 负责人", "机器学习工程师", "搜索研究员"],
  ["大模型平台工程师", "研究科学家", "多模态负责人"],
] as const

export function JobListingCardsDemo() {
  const logos = [
    <ClaudeLogo key="claude" />,
    <PerplexityLogo key="perplexity" isDark={false} />,
    <GeminiLogo key="gemini" />,
  ]
  return (
    <AiJobCards
      stacks={defaultJobStacks.map((stack, index) => {
        const titles = jobTitles[index]
        const [first, second, third] = stack.cards
        if (!titles || !first || !second || !third) return stack
        const [one, two, three] = titles
        return {
          ...stack,
          logo: logos[index],
          cards: [
            { ...first, title: one },
            { ...second, title: two },
            { ...third, title: three },
          ],
        }
      })}
    />
  )
}

export function NewProjectModalDemo() {
  return <NewProjectModal triggerLabel="新建项目" heading="新建项目" />
}

export function MusicPlayerCardDemo() {
  return (
    <GlassMusicPlayer
      tracks={[
        { title: "午夜公路", artist: "霓虹乐团", color: "#FF6BF5", duration: 234 },
        { title: "玻璃地平线", artist: "极光合声", color: "#06D6A0", duration: 198 },
        { title: "暖信号", artist: "黄昏协议", color: "#FF7B54", duration: 267 },
      ]}
    />
  )
}

const labelCopy = [
  ["移动应用", "原生 iOS 与 Android", "交互设计"],
  ["网页设计", "React 与 Next.js", "前端系统"],
  ["品牌", "视觉识别", "品牌策略"],
  ["编辑设计", "杂志与印刷", "字体系统"],
  ["动效", "动画与微交互", "交互模式"],
] as const

export function LabelCardsDemo() {
  return (
    <LabelCards
      hint="点一张卡片看细节"
      cards={defaultLabelCards.map((card, index) => {
        const copy = labelCopy[index]
        if (!copy) return card
        const [title, sub1, sub2] = copy
        return { ...card, title, sub1, sub2 }
      })}
    />
  )
}
