"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (next: T) => void
}): [T, (next: T | ((previous: T) => T)) => void] {
  const [internal, setInternal] = useState(defaultValue)
  const isControlled = value !== undefined
  const current = isControlled ? (value as T) : internal
  const currentRef = useRef(current)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    currentRef.current = current
    onChangeRef.current = onChange
  })

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (previous: T) => T)(currentRef.current) : next
      currentRef.current = resolved
      if (!isControlled) setInternal(resolved)
      onChangeRef.current?.(resolved)
    },
    [isControlled],
  )

  return [current, setValue]
}
