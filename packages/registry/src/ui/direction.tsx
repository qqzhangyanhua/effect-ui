"use client"

import * as React from "react"

type Dir = "ltr" | "rtl"

const DirectionContext = React.createContext<Dir>("ltr")

function DirectionProvider({
  dir = "ltr",
  direction,
  children,
}: {
  dir?: Dir
  direction?: Dir
  children: React.ReactNode
}) {
  const value = direction ?? dir
  return (
    <DirectionContext.Provider value={value}>
      <div dir={value} data-slot="direction">
        {children}
      </div>
    </DirectionContext.Provider>
  )
}

function useDirection() {
  return React.useContext(DirectionContext)
}

export { DirectionProvider, useDirection }
