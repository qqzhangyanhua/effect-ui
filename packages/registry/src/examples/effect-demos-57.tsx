"use client"

import { BandWaveText } from "../effects/band-wave-text"
import { BarsSpinner } from "../effects/bars-spinner"
import { ExplodingInput } from "../effects/exploding-input"
import { FallbackAvatar } from "../effects/fallback-avatar"
import { FlowButton } from "../effects/flow-button"
import { GlowDivider } from "../effects/glow-divider"
import { HeldKeys } from "../effects/held-keys"
import { InvalidShake } from "../effects/invalid-shake"
import { LogosCarousel } from "../effects/logos-carousel"
import { VerifyBadge } from "../effects/verify-badge"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const marks = ["北窗", "南桥", "东麓", "西市", "中庭", "月台"]

export function ExplodingInputDemo({
  color = "var(--primary)",
  duration = 1800,
  count = 3,
  direction = "up",
}: {
  color?: string
  duration?: number
  count?: number
  direction?: "left" | "right" | "up" | "down"
} = {}) {
  return (
    <div className={frame}>
      <ExplodingInput color={color} duration={duration} count={count} direction={direction} placeholder="输入就会炸开" label="爆炸输入" />
    </div>
  )
}

export function FlowButtonDemo({
  color = "var(--primary)",
  duration = 1200,
  size = 36,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <FlowButton color={color} duration={duration} size={size} intensity={intensity}>
        继续
      </FlowButton>
    </div>
  )
}

export function LogosCarouselDemo({
  color = "var(--foreground)",
  duration = 600,
  interval = 2500,
  count = 3,
}: {
  color?: string
  duration?: number
  interval?: number
  count?: number
} = {}) {
  return (
    <div className={frame}>
      <LogosCarousel color={color} duration={duration} interval={interval} count={count}>
        {marks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </LogosCarousel>
    </div>
  )
}

export function BarsSpinnerDemo({
  color = "var(--foreground)",
  size = 28,
  duration = 1200,
  count = 12,
}: {
  color?: string
  size?: number
  duration?: number
  count?: number
} = {}) {
  return (
    <div className={frame}>
      <BarsSpinner color={color} size={size} duration={duration} count={count} label="加载中" />
    </div>
  )
}

export function BandWaveTextDemo({
  color = "var(--foreground)",
  speed = 1,
  count = 6,
  fontSize = 56,
}: {
  color?: string
  speed?: number
  count?: number
  fontSize?: number
} = {}) {
  return (
    <div className={frame}>
      <BandWaveText color={color} speed={speed} count={count} fontSize={fontSize}>
        色带掠过
      </BandWaveText>
    </div>
  )
}

export function GlowDividerDemo({
  color = "var(--primary)",
  duration = 2400,
  intensity = 1,
  size = 2,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <div className="w-full max-w-md">
        <GlowDivider color={color} duration={duration} intensity={intensity} size={size} />
      </div>
    </div>
  )
}

export function InvalidShakeDemo({
  color = "var(--destructive)",
  duration = 420,
  intensity = 8,
}: {
  color?: string
  duration?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <InvalidShake
        color={color}
        duration={duration}
        intensity={intensity}
        label="邮箱"
        placeholder="输入邮箱"
        submitLabel="提交"
        errorLabel="请输入有效邮箱。"
        successLabel="地址已收下。"
      />
    </div>
  )
}

export function FallbackAvatarDemo() {
  return (
    <div className={frame}>
      <FallbackAvatar name="林夏" size={72} />
    </div>
  )
}

export function VerifyBadgeDemo() {
  return (
    <div className={`${frame} gap-3`}>
      <VerifyBadge type="basic" label="已验证" />
      <VerifyBadge type="gold" label="金色认证" />
      <VerifyBadge type="premium" label="高级认证" />
    </div>
  )
}

export function HeldKeysDemo() {
  return (
    <div className={frame}>
      <HeldKeys label="按住任意键" emptyLabel="未按键" />
    </div>
  )
}
