"use client"

import { useRef, useCallback } from "react"

interface UseAutoResizeTextareaOptions {
  minHeight?: number
  maxHeight?: number
}

export function useAutoResizeTextarea(options: UseAutoResizeTextareaOptions = {}) {
  const { minHeight = 32, maxHeight = 400 } = options
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset = false) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
      }

      const scrollHeight = textarea.scrollHeight

      if (scrollHeight > minHeight) {
        const newHeight = Math.min(scrollHeight, maxHeight)
        textarea.style.height = `${newHeight}px`
      }
    },
    [minHeight, maxHeight],
  )

  return { textareaRef, adjustHeight }
}

