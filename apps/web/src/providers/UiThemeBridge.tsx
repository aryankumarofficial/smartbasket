"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"

import { useUiStore } from "@/src/stores/ui.store"

/**
 * Applies persisted UI theme from Zustand into next-themes after hydration.
 */
export function UiThemeBridge() {
  const theme = useUiStore((s) => s.theme)
  const { setTheme } = useTheme()

  useEffect(() => {
    return useUiStore.persist.onFinishHydration(() => {
      setTheme(useUiStore.getState().theme)
    })
  }, [setTheme])

  useEffect(() => {
    if (useUiStore.persist.hasHydrated()) {
      setTheme(theme)
    }
  }, [theme, setTheme])

  return null
}
