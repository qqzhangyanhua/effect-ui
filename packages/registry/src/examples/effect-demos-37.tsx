"use client"

import { FolderFloat, type FolderFloatTrigger } from "../effects/folder-float"

export function FolderFloatDemo({
  trigger = "hover",
  closeOnSelect = true,
  physics = true,
  drift = 0.5,
  folderColor,
  spread = 180,
  lift = 26,
  tilt = 8,
  flapAngle = 34,
  openDuration = 520,
  stagger = 45,
  bounce = 0.3,
}: {
  trigger?: FolderFloatTrigger
  closeOnSelect?: boolean
  physics?: boolean
  drift?: number
  folderColor?: string
  spread?: number
  lift?: number
  tilt?: number
  flapAngle?: number
  openDuration?: number
  stagger?: number
  bounce?: number
} = {}) {
  return (
    <div className="flex min-h-80 w-full items-end justify-center pt-28 pb-6">
      <FolderFloat
        trigger={trigger}
        closeOnSelect={closeOnSelect}
        physics={physics}
        drift={drift}
        folderColor={folderColor}
        spread={spread}
        lift={lift}
        tilt={tilt}
        flapAngle={flapAngle}
        openDuration={openDuration}
        stagger={stagger}
        bounce={bounce}
      />
    </div>
  )
}
