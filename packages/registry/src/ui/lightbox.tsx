"use client"

import LightboxPrimitive from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

export interface LightboxSlide {
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface LightboxProps {
  open: boolean
  index?: number
  slides: LightboxSlide[]
  onClose: () => void
  onIndexChange?: (index: number) => void
}

function Lightbox({ open, index = 0, slides, onClose, onIndexChange }: LightboxProps) {
  return (
    <LightboxPrimitive
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      on={{ view: ({ index: next }) => onIndexChange?.(next) }}
    />
  )
}

export { Lightbox }
