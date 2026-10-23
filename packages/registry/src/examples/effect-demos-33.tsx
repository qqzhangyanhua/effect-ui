"use client"

import { useState } from "react"

import { ConstellationLoader } from "../effects/constellation-loader"
import { Cursor, CursorBody, CursorMessage, CursorName, CursorPointer } from "../effects/cursor"
import { EmojiConfetti } from "../effects/emoji-confetti"
import { LabeledToggle } from "../effects/labeled-toggle"
import {
  MiniCalendar,
  MiniCalendarDay,
  MiniCalendarDays,
  MiniCalendarNavigation,
} from "../effects/mini-calendar"
import { ParticleSwarmLoader } from "../effects/particle-swarm-loader"
import {
  Reel,
  ReelContent,
  ReelControls,
  ReelImage,
  ReelItemView,
  ReelMuteButton,
  ReelNextButton,
  ReelPlayButton,
  ReelPreviousButton,
  ReelProgress,
  type ReelItem,
} from "../effects/reel"
import {
  Snippet,
  SnippetCopyButton,
  SnippetHeader,
  SnippetTabsContent,
  SnippetTabsList,
  SnippetTabsTrigger,
} from "../effects/snippet"
import { SpinningCubeLoader } from "../effects/spinning-cube-loader"
import { StarWarsButton } from "../effects/star-wars-button"
import { Status, StatusIndicator, StatusLabel } from "../effects/status"
import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
  StoryImage,
  StoryOverlay,
  StoryTitle,
} from "../effects/stories"
import { SkewedInfiniteScroll } from "../effects/skewed-infinite-scroll"
import { TextDrop } from "../effects/text-drop"
import { WhirlpoolLoader } from "../effects/whirlpool-loader"

const cards = [
  { id: "1", text: "夜航" },
  { id: "2", text: "北窗" },
  { id: "3", text: "灯塔" },
  { id: "4", text: "潮汐" },
  { id: "5", text: "甲板" },
  { id: "6", text: "航线" },
]

function swatch(color: string, label: string, width = 320, height = 560) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="white" font-size="42" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const reels: ReelItem[] = [
  { id: "night", type: "image", src: swatch("#312e81", "夜航"), duration: 4, title: "夜航", alt: "夜航" },
  { id: "light", type: "image", src: swatch("#b45309", "灯塔"), duration: 4, title: "灯塔", alt: "灯塔" },
]

export function SkewedInfiniteScrollDemo() {
  return <SkewedInfiniteScroll columns={2} items={cards} speed={18} />
}

export function ConstellationLoaderDemo() {
  return (
    <div className="grid place-items-center">
      <ConstellationLoader color="#c7d2fe" count={16} size={7} />
    </div>
  )
}

export function ParticleSwarmLoaderDemo() {
  return (
    <div className="grid place-items-center">
      <ParticleSwarmLoader color="#818cf8" count={36} size={2.4} />
    </div>
  )
}

export function SpinningCubeLoaderDemo() {
  return (
    <div className="grid h-40 place-items-center">
      <SpinningCubeLoader color="#6366f1" duration={2.4} size={72} />
    </div>
  )
}

export function WhirlpoolLoaderDemo() {
  return (
    <div className="grid place-items-center">
      <WhirlpoolLoader color="#a5b4fc" duration={16} rotations={5} segments={42} />
    </div>
  )
}

export function EmojiConfettiDemo() {
  return (
    <div className="grid h-32 place-items-center">
      <EmojiConfetti>放一串</EmojiConfetti>
    </div>
  )
}

export function StarWarsButtonDemo() {
  return (
    <div className="grid h-32 place-items-center">
      <StarWarsButton speed={1.2} starCount={24}>
        跃迁
      </StarWarsButton>
    </div>
  )
}

export function TextDropDemo() {
  return (
    <div className="grid h-24 place-items-center">
      <TextDrop text="夜航开始" />
    </div>
  )
}

const commands = {
  npm: "npm i effect-ui",
  pnpm: "pnpm add effect-ui",
  yarn: "yarn add effect-ui",
}

export function SnippetDemo() {
  const [tab, setTab] = useState("pnpm")
  const value = commands[tab as keyof typeof commands] ?? commands.pnpm
  return (
    <Snippet onValueChange={setTab} value={tab}>
      <SnippetHeader>
        <SnippetTabsList>
          <SnippetTabsTrigger value="npm">npm</SnippetTabsTrigger>
          <SnippetTabsTrigger value="pnpm">pnpm</SnippetTabsTrigger>
          <SnippetTabsTrigger value="yarn">yarn</SnippetTabsTrigger>
        </SnippetTabsList>
        <SnippetCopyButton value={value} />
      </SnippetHeader>
      <SnippetTabsContent value="npm">{commands.npm}</SnippetTabsContent>
      <SnippetTabsContent value="pnpm">{commands.pnpm}</SnippetTabsContent>
      <SnippetTabsContent value="yarn">{commands.yarn}</SnippetTabsContent>
    </Snippet>
  )
}

export function StatusDemo() {
  return (
    <Status status="online">
      <StatusIndicator />
      <StatusLabel />
    </Status>
  )
}

export function StoriesDemo() {
  const people = [
    { name: "北窗", color: "#312e81", title: "夜航" },
    { name: "灯塔", color: "#b45309", title: "靠港" },
    { name: "甲板", color: "#0f766e", title: "日出" },
  ]
  return (
    <Stories>
      <StoriesContent>
        {people.map((person) => (
          <Story key={person.name}>
            <StoryImage alt={person.title} src={swatch(person.color, "", 160, 240)} />
            <StoryOverlay />
            <StoryTitle>{person.title}</StoryTitle>
            <StoryAuthor>
              <StoryAuthorImage fallback={person.name.slice(0, 1)} name={person.name} />
              <StoryAuthorName>{person.name}</StoryAuthorName>
            </StoryAuthor>
          </Story>
        ))}
      </StoriesContent>
    </Stories>
  )
}

export function MiniCalendarDemo() {
  return (
    <MiniCalendar days={5} defaultStartDate={new Date(2026, 9, 22)} defaultValue={new Date(2026, 9, 22)}>
      <MiniCalendarNavigation direction="prev" />
      <MiniCalendarDays>{(date) => <MiniCalendarDay date={date} />}</MiniCalendarDays>
      <MiniCalendarNavigation direction="next" />
    </MiniCalendar>
  )
}

export function ReelDemo({
  defaultIndex = 0,
  defaultMuted = true,
  autoPlay = true,
}: { defaultIndex?: number; defaultMuted?: boolean; autoPlay?: boolean } = {}) {
  return (
    <div className="mx-auto h-[28rem] w-56">
      <Reel autoPlay={autoPlay} className="h-full" data={reels} defaultIndex={defaultIndex} defaultMuted={defaultMuted}>
        <ReelProgress />
        <ReelContent>
          {(item) => (
            <ReelItemView>
              <ReelImage alt={item.alt ?? item.title ?? ""} duration={item.duration} src={item.src} />
              <p className="absolute bottom-16 left-3 text-sm font-medium text-white">{item.title}</p>
            </ReelItemView>
          )}
        </ReelContent>
        <ReelControls>
          <ReelPreviousButton />
          <ReelPlayButton />
          <ReelMuteButton />
          <ReelNextButton />
        </ReelControls>
      </Reel>
    </div>
  )
}

export function CursorDemo() {
  return (
    <div className="relative h-40 w-full">
      <Cursor className="absolute top-6 left-8 text-indigo-300">
        <CursorPointer />
        <CursorBody>
          <CursorName>北窗</CursorName>
          <CursorMessage>看到灯塔了</CursorMessage>
        </CursorBody>
      </Cursor>
      <Cursor className="absolute top-16 left-40 text-amber-300">
        <CursorPointer />
        <CursorBody>
          <CursorName>甲板</CursorName>
        </CursorBody>
      </Cursor>
    </div>
  )
}

export function LabeledToggleDemo() {
  return (
    <div className="grid h-20 place-items-center">
      <LabeledToggle />
    </div>
  )
}
