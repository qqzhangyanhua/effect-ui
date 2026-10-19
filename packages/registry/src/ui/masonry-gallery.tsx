"use client"

import { MasonryPhotoAlbum, type Photo } from "react-photo-album"
import "react-photo-album/masonry.css"

import { cn } from "@/lib/utils"

export interface MasonryGalleryProps {
  photos: Photo[]
  onClick?: (index: number) => void
  className?: string
}

function MasonryGallery({ photos, onClick, className }: MasonryGalleryProps) {
  return (
    <div className={cn("w-full", className)}>
      <MasonryPhotoAlbum
        photos={photos}
        columns={(containerWidth) => (containerWidth < 500 ? 2 : 3)}
        onClick={({ index }) => onClick?.(index)}
      />
    </div>
  )
}

export { MasonryGallery }
export type { Photo as MasonryPhoto }
