"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/letter-3d-swap.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useAnimate, type AnimationOptions, type ValueAnimationTransition } from "motion/react"
import { useCallback, useMemo, useState, type ElementType } from "react"

export interface Letter3DSwapProps {
  children: React.ReactNode
  as?: ElementType
  mainClassName?: string
  frontFaceClassName?: string
  secondFaceClassName?: string
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number | "random"
  transition?: ValueAnimationTransition | AnimationOptions
  rotateDirection?: "top" | "right" | "bottom" | "left"
}

interface WordObject {
  characters: string[]
  needsSpace: boolean
}

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (children == null) return ""
  if (typeof children === "string") return children
  if (typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("")
  if (typeof children === "object" && "props" in children) {
    const props = children.props
    if (props && typeof props === "object" && "children" in props) {
      return extractTextFromChildren(props.children as React.ReactNode)
    }
  }
  return ""
}

const spring = { type: "spring" as const, damping: 30, stiffness: 300 }

export function Letter3DSwap({
  children,
  as = "p",
  mainClassName,
  frontFaceClassName,
  secondFaceClassName,
  staggerDuration = 0.05,
  staggerFrom = "first",
  transition = spring,
  rotateDirection = "right",
}: Letter3DSwapProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [scope, animate] = useAnimate()
  const prefersReducedMotion = usePrefersReducedMotion()

  const rotationTransform = (() => {
    switch (rotateDirection) {
      case "top":
        return "rotateX(90deg)"
      case "right":
        return "rotateY(90deg)"
      case "bottom":
        return "rotateX(-90deg)"
      case "left":
        return "rotateY(90deg)"
      default:
        return "rotateY(-90deg)"
    }
  })()

  const text = useMemo(() => extractTextFromChildren(children), [children])
  const characters = useMemo<WordObject[]>(() => {
    const words = text.split(" ")
    return words.map((word, index) => ({
      characters: splitIntoCharacters(word),
      needsSpace: index !== words.length - 1,
    }))
  }, [text])

  const getStaggerDelay = useCallback(
    (index: number, totalChars: number) => {
      if (staggerFrom === "first") return index * staggerDuration
      if (staggerFrom === "last") return (totalChars - 1 - index) * staggerDuration
      if (staggerFrom === "center") {
        const center = Math.floor(totalChars / 2)
        return Math.abs(center - index) * staggerDuration
      }
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * totalChars)
        return Math.abs(randomIndex - index) * staggerDuration
      }
      return Math.abs(staggerFrom - index) * staggerDuration
    },
    [staggerFrom, staggerDuration],
  )

  const handleHoverStart = useCallback(async () => {
    if (prefersReducedMotion || isAnimating || isHovering) return
    setIsHovering(true)
    setIsAnimating(true)
    const totalChars = characters.reduce((sum, word) => sum + word.characters.length, 0)
    const delays = Array.from({ length: totalChars }, (_, index) => getStaggerDelay(index, totalChars))
    await animate(".letter-3d-swap-char-box-item", { transform: rotationTransform }, {
      ...transition,
      delay: (index: number) => delays[index] ?? 0,
    })
    await animate(".letter-3d-swap-char-box-item", { transform: "rotateX(0deg) rotateY(0deg)" }, { duration: 0 })
    setIsAnimating(false)
  }, [animate, characters, getStaggerDelay, isAnimating, isHovering, prefersReducedMotion, rotationTransform, transition])

  const handleHoverEnd = useCallback(() => {
    setIsHovering(false)
  }, [])

  const ElementTag = (as ?? "p") as "p"

  return (
    <ElementTag
      className={cn("relative flex flex-wrap", mainClassName)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="letter-3d-swap"
      onMouseEnter={() => {
        void handleHoverStart()
      }}
      onMouseLeave={handleHoverEnd}
      ref={scope as React.Ref<HTMLParagraphElement>}
    >
      <span className="sr-only">{text}</span>
      {characters.map((wordObj, wordIndex, array) => {
        const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0)
        return (
          <span className="inline-flex" key={wordIndex}>
            {wordObj.characters.map((char, charIndex) => (
              <CharBox
                char={char}
                frontFaceClassName={frontFaceClassName}
                key={previousCharsCount + charIndex}
                rotateDirection={rotateDirection}
                secondFaceClassName={secondFaceClassName}
              />
            ))}
            {wordObj.needsSpace ? <span className="whitespace-pre"> </span> : null}
          </span>
        )
      })}
    </ElementTag>
  )
}

interface CharBoxProps {
  char: string
  frontFaceClassName?: string
  secondFaceClassName?: string
  rotateDirection: "top" | "right" | "bottom" | "left"
}

function CharBox({ char, frontFaceClassName, secondFaceClassName, rotateDirection }: CharBoxProps) {
  const secondFaceTransform = (() => {
    switch (rotateDirection) {
      case "top":
        return "rotateX(-90deg) translateZ(0.5lh)"
      case "right":
        return "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(-50%) rotateY(-90deg) translateX(50%)"
      case "bottom":
        return "rotateX(90deg) translateZ(0.5lh)"
      case "left":
        return "rotateY(90deg) translateX(50%) rotateY(-90deg) translateX(50%) rotateY(-90deg) translateX(50%)"
      default:
        return "rotateY(90deg) translateZ(1ch)"
    }
  })()

  const shell =
    rotateDirection === "top" || rotateDirection === "bottom"
      ? "translateZ(-0.5lh)"
      : "rotateY(90deg) translateX(50%) rotateY(-90deg)"
  const front =
    rotateDirection === "top" || rotateDirection === "bottom"
      ? "translateZ(0.5lh)"
      : rotateDirection === "left"
        ? "rotateY(90deg) translateX(50%) rotateY(-90deg)"
        : "rotateY(-90deg) translateX(50%) rotateY(90deg)"

  return (
    <span className="letter-3d-swap-char-box-item inline-block [transform-style:preserve-3d]" style={{ transform: shell }}>
      <span className={cn("relative h-[1lh] [backface-visibility:hidden]", frontFaceClassName)} style={{ transform: front }}>
        {char}
      </span>
      <span
        className={cn("absolute top-0 left-0 h-[1lh] [backface-visibility:hidden]", secondFaceClassName)}
        style={{ transform: secondFaceTransform }}
      >
        {char}
      </span>
    </span>
  )
}
